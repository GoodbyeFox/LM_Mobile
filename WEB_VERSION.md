# 🎯 Web 版本使用说明

## 你下载的是什么？

`web-build.zip` 包含了完整的 Web 应用版本，可以在任何浏览器中运行。

## 📦 下载后的步骤

### 第一步：解压文件

```bash
unzip web-build.zip
cd dist
```

### 第二步：启动服务器（3 选 1）

#### ✅ 选项 A: Node.js（最推荐）
```bash
# 如果你安装了 Node.js
node serve.js

# 然后在浏览器打开：http://localhost:8000
```

#### ✅ 选项 B: Python
```bash
# Python 3
python serve.py

# 或简单方法
python -m http.server 8000
```

#### ✅ 选项 C: 其他工具
```bash
# 使用 npx http-server
npx http-server -p 8000

# 或使用 live-server
npx live-server --port=8000
```

### 第三步：在浏览器打开

访问：`http://localhost:8000`

你会看到欢迎屏幕，点击"启动应用"开始。

## ⚙️ 配置 LM Studio

1. **确保 LM Studio 正在运行**
   - 默认监听：`http://localhost:1234`

2. **打开应用的 Settings 标签**

3. **输入服务器地址**
   ```
   http://localhost:1234
   ```

4. **点击 "Test Connection" 验证连接**

5. **保存配置**

## 🎮 使用应用

### 1. Models 标签 - 加载模型
- 查看所有可用的模型
- 点击 "Load" 加载一个模型
- 等待模型加载完成

### 2. Chat 标签 - 开始聊天
- 输入你的问题
- 点击 "Send"
- 等待模型响应

### 3. Settings 标签 - 配置
- 更改服务器地址
- 添加 API 密钥（如需要）
- 测试连接

## 🌐 在其他设备上使用

想在网络上的其他设备访问？

```bash
# 获取你电脑的 IP 地址
# macOS/Linux:
ifconfig | grep "inet "

# Windows:
ipconfig

# 然后其他设备访问：
# http://<你的IP>:8000
# 例如：http://192.168.1.100:8000
```

## 🔧 常见问题

### Q: 端口 8000 已被占用
**A:** 使用其他端口：
```bash
# Node.js
PORT=3000 node serve.js

# Python
python -m http.server 3000
```

### Q: "无法连接到 LM Studio"
**A:**
1. 确保 LM Studio 正在运行
2. 检查防火墙设置
3. 尝试在浏览器直接访问：`http://localhost:1234/api/v1/models`

### Q: 刷新页面后变白屏
**A:** 这是正常的。要访问具体路由：
- 使用 serve.js 或 serve.py （已处理这个问题）
- 或直接访问文件：`/(tabs)/chat.html`

### Q: 如何关闭服务器
**A:** 按 `Ctrl + C`

## 📊 文件说明

```
dist/
├── index.html           # 欢迎页面
├── serve.js            # Node.js 服务器脚本
├── serve.py            # Python 服务器脚本
├── README.md           # 详细说明
├── /(tabs)/
│   ├── chat.html       # 聊天页面
│   ├── models.html     # 模型管理页面
│   └── settings.html   # 设置页面
├── _expo/              # 应用资源
└── assets/             # 静态资源
```

## 💡 提示

- 第一次使用可能会有缓存，按 F12 清除 DevTools 缓存
- 聊天历史会自动保存在浏览器存储中
- 配置也会被保存，下次打开无需重新配置

## 🚀 部署到在线服务器

如果想将应用部署到在线服务器：

### Vercel（最简单）
```bash
npm install -g vercel
vercel --prod
```

### GitHub Pages
- 上传 dist 目录到 GitHub Pages
- 访问：`https://username.github.io/lm_mobile/`

### Netlify
- 拖拽 dist 文件夹到 Netlify
- 自动部署并生成链接

## 🆘 需要帮助？

1. **查看 README.md** - 项目完整说明
2. **查看 QUICKSTART.md** - 5 分钟入门
3. **查看 CLAUDE.md** - 开发者指南

---

**现在就可以开始使用了！** 🎉
