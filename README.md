# 英语学习乐园 - DeepSeek AI版本

一个集成DeepSeek AI的互动英语学习应用，支持中英文双语问答。

## 功能特点

- 📚 26个字母互动学习（大小写、语音朗读）
- 🎯 巩固练习模式（选择题匹配）
- 🤖 DeepSeek AI智能英语助教
- 🌐 支持中英文双语提问
- 🔒 安全的API密钥管理（服务器端存储）

## 部署到Netlify

### 步骤1：准备文件

确保您有以下文件：
```
├── index.html              # 主HTML文件
├── netlify.toml           # Netlify配置文件
├── package.json           # Node.js依赖配置
└── netlify/
    └── functions/
        └── chat.js        # DeepSeek API后端函数
```

### 步骤2：获取DeepSeek API密钥

1. 访问 [DeepSeek平台](https://platform.deepseek.com/)
2. 注册/登录账号
3. 进入API Keys页面
4. 创建新的API密钥并复制保存

### 步骤3：部署到Netlify

#### 方法A：通过Netlify CLI（推荐）

1. 安装Netlify CLI：
```bash
npm install -g netlify-cli
```

2. 登录Netlify：
```bash
netlify login
```

3. 初始化项目：
```bash
netlify init
```

4. 设置环境变量：
```bash
netlify env:set DEEPSEEK_API_KEY "your-api-key-here"
```

5. 部署：
```bash
netlify deploy --prod
```

#### 方法B：通过Netlify网页界面

1. 将代码推送到GitHub仓库
2. 登录 [Netlify](https://app.netlify.com/)
3. 点击 "Add new site" > "Import an existing project"
4. 选择您的GitHub仓库
5. 构建设置保持默认即可
6. 点击 "Deploy site"
7. 部署后，进入 Site settings > Environment variables
8. 添加环境变量：
   - Key: `DEEPSEEK_API_KEY`
   - Value: 您的DeepSeek API密钥
9. 触发重新部署

#### 方法C：手动上传

1. 将所有文件打包成ZIP
2. 登录Netlify网页
3. 拖放ZIP文件到Netlify的部署区域
4. 设置环境变量（同方法B步骤7-8）

### 步骤4：测试

1. 打开您的Netlify网站URL
2. 点击右上角的"🤖 AI英语助教"按钮
3. 尝试用中文或英文提问：
   - 中文: "apple是什么意思？"
   - 英文: "What does 'hello' mean?"
4. AI应该能正确回复并提供双语翻译

## 使用说明

### 主页功能

- **字母学习**: 点击任意字母卡片听发音
- **全部朗读**: 点击按钮按顺序朗读所有字母
- **巩固练习**: 测试字母识别能力

### AI助教功能

- **支持双语提问**: 可以用中文或英文提问
- **智能回复**: AI会用您使用的语言回复，并提供另一种语言的翻译
- **学习内容**: 词汇、语法、写作、发音等全方位英语学习支持

### 提问示例

中文提问：
- "apple是什么意思？"
- "如何使用现在完成时？"
- "怎么写一封正式的邮件？"

英文提问：
- "What does 'beautiful' mean?"
- "How to use present perfect tense?"
- "How to write a formal email?"

## 故障排除

### 问题1：AI无法回复

**可能原因**:
- API密钥未正确设置
- API密钥已过期或无效
- DeepSeek服务暂时不可用

**解决方法**:
1. 检查Netlify环境变量中的`DEEPSEEK_API_KEY`是否正确
2. 确认API密钥在DeepSeek平台仍然有效
3. 查看Netlify Functions日志获取详细错误信息

### 问题2：部署后无法访问

**解决方法**:
1. 确认所有文件都已正确上传
2. 检查`netlify.toml`配置是否正确
3. 查看Netlify部署日志

### 问题3：API调用频率限制

**解决方法**:
- 等待一段时间后再试
- 升级DeepSeek API套餐
- 优化提问频率

## 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **后端**: Netlify Functions (Node.js)
- **AI模型**: DeepSeek Chat
- **语音**: Web Speech API

## 安全说明

- API密钥存储在服务器端环境变量中，不会暴露在前端代码中
- 所有API调用通过Netlify Functions中转，保护密钥安全
- 支持CORS设置，确保只有授权域名可以访问

## 本地开发

```bash
# 安装依赖
npm install

# 设置本地环境变量
echo "DEEPSEEK_API_KEY=your-key-here" > .env

# 启动开发服务器
netlify dev
```

## 许可证

MIT License

## 联系方式

如有问题或建议，欢迎通过以下方式联系：
- 提交GitHub Issue
- 发送邮件反馈

---

**提示**: 请妥善保管您的API密钥，不要在公开代码中提交！
