// Netlify Function for DeepSeek API
// 支持中英文双语问答
// 优化版本：添加超时控制和更好的错误处理

const https = require('https');

exports.handler = async (event, context) => {
  // 仅允许POST请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  // CORS设置
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // 处理OPTIONS预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // 解析请求体
    const { message } = JSON.parse(event.body);

    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '消息内容不能为空' })
      };
    }

    // 从环境变量获取DeepSeek API密钥
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    
    if (!DEEPSEEK_API_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'DeepSeek API密钥未配置',
          message: '请在Netlify环境变量中设置DEEPSEEK_API_KEY'
        })
      };
    }

    // 构建系统提示词 - 支持中英双语提问
    const systemPrompt = `你是一位专业的英语AI教师助手。

规则：
1. 用户可以用中文或英文提问
2. 如果用户用中文提问，用中文回答并提供英文翻译
3. 如果用户用英文提问，用英文回答并提供中文翻译
4. 回答要简洁但有帮助（不超过200字）

格式示例：
中文问题 → 中文回答 + 英文翻译
英文问题 → 英文回答 + 中文翻译`;

    const postData = JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 800,  // 减少token数以加快响应
      temperature: 0.7,
      stream: false
    });

    console.log('Calling DeepSeek API...');

    // 使用Promise + 超时控制
    const apiResponse = await Promise.race([
      makeAPIRequest(postData, DEEPSEEK_API_KEY),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 25000) // 25秒超时
      )
    ]);

    console.log('DeepSeek API response received');

    // 检查响应格式
    if (!apiResponse.choices || !apiResponse.choices[0] || !apiResponse.choices[0].message) {
      console.error('Invalid API response:', apiResponse);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'DeepSeek API返回格式异常',
          details: 'Response structure is invalid'
        })
      };
    }

    const aiResponse = apiResponse.choices[0].message.content;

    // 返回成功响应
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: aiResponse,
        usage: apiResponse.usage || {}
      })
    };

  } catch (error) {
    console.error('Function Error:', error.message);
    
    // 根据错误类型返回不同的响应
    let errorMessage = '服务器内部错误';
    let statusCode = 500;
    
    if (error.message.includes('timeout')) {
      errorMessage = 'API调用超时，请稍后重试';
      statusCode = 504;
    } else if (error.message.includes('401')) {
      errorMessage = 'API密钥无效';
      statusCode = 401;
    } else if (error.message.includes('429')) {
      errorMessage = 'API调用频率超限，请稍后重试';
      statusCode = 429;
    }
    
    return {
      statusCode: statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: errorMessage,
        details: error.message
      })
    };
  }
};

// 辅助函数：发送API请求
function makeAPIRequest(postData, apiKey) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.deepseek.com',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 25000 // 25秒超时
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Failed to parse API response'));
          }
        } else {
          reject(new Error(`API Error ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Network error: ${error.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(postData);
    req.end();
  });
}
