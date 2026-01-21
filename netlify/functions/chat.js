// Netlify Function for DeepSeek API
// 支持中英文双语问答

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
    const systemPrompt = `你是一位专业的英语AI教师助手。你的任务是帮助用户学习英语。

重要规则：
1. 用户可以用中文或英文向你提问
2. 如果用户用中文提问，你需要用中文回答，并提供英文翻译
3. 如果用户用英文提问，你需要用英文回答，并提供中文翻译
4. 提供详细、有帮助的英语学习内容（词汇、语法、写作、发音等）
5. 给出具体例句和使用场景
6. 保持鼓励和教育性的语气

回复格式：
- 首先用用户使用的语言（中文或英文）详细回答问题
- 然后提供另一种语言的翻译
- 可以包含例句、语法说明、使用场景等

例如：
如果用户问："apple是什么意思？"
你应该回答："apple的意思是苹果，是一种常见的水果。例句：I eat an apple every day.（我每天吃一个苹果。）"

如果用户问："What does 'hello' mean?"
你应该回答："'Hello' is a common greeting used when meeting someone. Example: Hello, how are you? 
中文翻译：'Hello'是见面时常用的问候语。例句：你好，你好吗？"`;

    // 使用Node.js内置的https模块
    const https = require('https');
    
    const postData = JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 1500,
      temperature: 0.7,
      stream: false
    });

    // 创建Promise来处理https请求
    const apiResponse = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.deepseek.com',
        port: 443,
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`API Error ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(postData);
      req.end();
    });

    // 检查响应格式
    if (!apiResponse.choices || !apiResponse.choices[0] || !apiResponse.choices[0].message) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'DeepSeek API返回格式异常',
          data: apiResponse
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
    console.error('Function Error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: '服务器内部错误',
        message: error.message
      })
    };
  }
};
