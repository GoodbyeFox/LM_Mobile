# 🚀 GitHub Actions 构建指南 - 完整教程

本指南教你如何通过 GitHub Actions 自动构建、测试和打包 LM Studio 移动应用。

## 📌 快速概览

```
你的代码 → GitHub → Actions 触发 → 自动构建 → 生成产物 → 你下载测试
```

## 🎯 三个简单步骤看到效果

### 第一步：推送代码

```bash
# 确保你在正确的分支
git branch

# 推送你的改动
git add .
git commit -m "Your changes"
git push origin claude/lm-studio-mobile-app-VqKml
```

### 第二步：等待构建

1. **打开 GitHub 仓库**
   - 点击仓库名称进入 GitHub

2. **进入 Actions 页面**
   - 点击导航栏中的 "Actions" 标签

3. **查看工作流**
   - 你会看到 "Build and Test" 工作流
   - 状态会显示为黄色圆点（运行中）或绿色勾号（成功）

### 第三步：下载产物

1. **点击最新的工作流运行**
   - 找到最新推送对应的工作流

2. **向下滚动到 "Artifacts" 部分**
   - 看到两个产物：
     - `web-build` - Web 版本应用
     - `build-info` - 构建信息文档

3. **下载产物**
   - 点击产物名称即可下载

## 📊 构建过程详解

### 完整的构建流程

```
┌─ 推送代码到 GitHub
│
├─ 自动触发 GitHub Actions
│
├─ 执行 Build and Test 工作流
│  ├─ ✓ 检出代码
│  ├─ ✓ 设置 Node.js
│  ├─ ✓ 安装依赖
│  ├─ ✓ TypeScript 类型检查
│  ├─ ✓ ESLint 代码检查
│  ├─ ✓ 构建 Web 版本
│  └─ ✓ 生成构建信息
│
├─ 如果推送到 main 分支
│  └─ 自动部署到 GitHub Pages
│
├─ 生成产物
│  ├─ web-build/
│  ├─ build-info.md
│  └─ ...
│
└─ 完成！🎉
```

### 构建耗时

| 步骤 | 耗时 |
|-----|------|
| 检出代码 | < 10 秒 |
| 设置环境 | 10-20 秒 |
| 安装依赖 | 20-40 秒 |
| 代码检查 | 10-20 秒 |
| 构建 Web | 30-60 秒 |
| **总计** | **2-3 分钟** |

## 🎨 实时查看构建进度

### 方法 1：在 GitHub 网站查看

1. 打开仓库 → Actions 选项卡
2. 点击最新的工作流运行
3. 实时查看每个步骤的进度
4. 如果失败，展开步骤查看错误

### 方法 2：使用 GitHub CLI

```bash
# 安装 GitHub CLI（如果还没安装）
# macOS: brew install gh
# Ubuntu: sudo apt install gh
# Windows: choco install gh

# 登录 GitHub
gh auth login

# 查看最新工作流运行
gh run list --workflow build-apk.yml

# 查看详细状态
gh run view <run-id>

# 查看日志
gh run view <run-id> --log
```

## 📦 使用下载的产物

### 测试 Web 版本

```bash
# 1. 下载 web-build.zip 并解压
unzip web-build.zip
cd dist

# 2. 启动本地服务器（3 个选择）

# 选项 A: Python 3
python -m http.server 8000

# 选项 B: Python 2
python -m SimpleHTTPServer 8000

# 选项 C: Node.js (如果安装了)
npx http-server

# 3. 在浏览器打开
# http://localhost:8000

# 4. 配置 LM Studio
# 点击 Settings 标签
# 输入 http://localhost:1234
# 点击 "Save Configuration"

# 5. 加载模型
# 点击 Models 标签
# 选择一个模型点击 Load

# 6. 开始聊天！
# 点击 Chat 标签
```

### 查看构建信息

```bash
# 1. 下载 build-info.md
# 2. 用文本编辑器打开
# 3. 查看详细的构建信息和说明
```

## 🔍 查看构建状态的三种方式

### 方式 1: GitHub 网站 (最简单)

**路径**: GitHub → Repo → Actions → 工作流

```
https://github.com/yourname/LM_Mobile/actions
```

**优点**:
- 无需安装任何工具
- 可视化界面
- 实时更新

**缺点**:
- 需要打开浏览器
- 刷新才能看到更新

### 方式 2: GitHub CLI (最快)

**安装**:
```bash
# macOS
brew install gh

# Ubuntu/Debian
sudo apt install gh

# Windows
choco install gh
```

**使用**:
```bash
# 查看所有运行
gh run list --workflow build-apk.yml

# 查看详细信息
gh run view <run-id>

# 跟踪最新运行
gh run watch
```

**优点**:
- 命令行操作快速
- 可以脚本化
- 完全离线工作

### 方式 3: GitHub 邮件通知 (最被动)

**设置**:
1. 仓库 → Settings → Notifications
2. 勾选 "Send notifications for failed workflows"

**优点**:
- 自动通知
- 无需主动查询

**缺点**:
- 仅在失败时通知
- 需要等待邮件

## 🐛 调试：构建失败怎么办？

### 常见问题和解决方案

#### 问题 1: TypeScript 错误

**症状**: `error TS2345: ...`

**本地调试**:
```bash
# 在本地检查
npx tsc --noEmit

# 修复错误
# 提交和推送
git add .
git commit -m "Fix TypeScript errors"
git push
```

#### 问题 2: 依赖安装失败

**症状**: `npm ERR! ...`

**解决**:
```bash
# 清除缓存
rm -rf node_modules package-lock.json

# 重新安装
npm install --legacy-peer-deps

# 推送
git add .
git commit -m "Reinstall dependencies"
git push
```

#### 问题 3: Web 构建失败

**症状**: `Error: Unable to export web bundle`

**调试步骤**:
```bash
# 1. 本地测试
npx expo export --platform web --output-dir test-dist

# 2. 检查错误信息
# 3. 修复问题
# 4. 推送
```

### 查看详细错误

1. 打开 GitHub Actions
2. 点击失败的工作流
3. 展开 "Build and Test" 任务
4. 找到失败的步骤
5. 点击展开箭头查看完整日志

## 📈 监控构建状态

### 实时监控脚本

保存为 `watch-build.sh`:

```bash
#!/bin/bash

echo "🔍 监控最新的构建..."

while true; do
    clear
    echo "构建状态检查 - $(date)"
    echo "=================================="
    
    # 获取最新的 5 个运行
    gh run list --workflow build-apk.yml --limit 5
    
    echo ""
    echo "按 Ctrl+C 停止监控"
    
    # 每 30 秒刷新一次
    sleep 30
done
```

**使用**:
```bash
chmod +x watch-build.sh
./watch-build.sh
```

## 🎯 常见用途

### 用途 1: 检查代码是否能构建

```
推送代码 → 自动构建 → 
如果绿色 ✓ → 代码正确
如果红色 ✗ → 需要修复
```

### 用途 2: 获取最新的 Web 版本

```
推送新代码 → 构建完成 → 下载 web-build → 测试新功能
```

### 用途 3: 分享给他人测试

```
推送代码 → Actions 完成 → 
告诉同事下载 web-build → 他们可以在浏览器中测试
```

### 用途 4: 自动化质量检查

```
推送代码时自动运行：
✓ TypeScript 类型检查
✓ ESLint 代码风格
✓ 依赖安装
```

## 📱 测试手机应用

### 测试 Web 版本（简单）

```bash
# 1. 下载 web-build
# 2. 用 Python 启动服务器
python -m http.server 8000
# 3. 在手机浏览器打开
# 访问 http://<你的电脑IP>:8000
```

### 测试原生应用（复杂）

对于完整的 Android APK 或 iOS 应用：

```bash
# 方法 1: 使用 EAS（推荐）
npm install -g eas-cli
eas build --platform android
# 等待 10-20 分钟，完成后下载 APK

# 方法 2: 本地开发
npx expo start
# 在手机上用 Expo Go 扫描二维码
```

## 🔐 关键信息

### 不会构建的原因

❌ 仓库是私有的，但没有给 Action 权限
❌ node_modules 或缓存问题
❌ TypeScript 或 ESLint 错误
❌ GitHub API 临时故障

### 如何重新运行

1. 打开失败的工作流
2. 点击右上角 "Re-run all jobs"
3. 等待重新构建

## 📚 完整检查清单

在推送代码前：

- [ ] 代码能在本地运行吗？
  ```bash
  npm install --legacy-peer-deps
  npx expo start
  ```

- [ ] TypeScript 检查通过了吗？
  ```bash
  npx tsc --noEmit
  ```

- [ ] ESLint 检查通过了吗？
  ```bash
  npx eslint . --ext .ts,.tsx
  ```

- [ ] Web 能导出吗？
  ```bash
  npx expo export --platform web
  ```

准备好后：
- [ ] Git add 和 commit
- [ ] Git push
- [ ] 打开 GitHub Actions 页面
- [ ] 等待构建完成
- [ ] 下载产物进行测试

## 🎓 学习资源

- [GitHub Actions 官方文档](https://docs.github.com/actions)
- [GitHub CLI 使用指南](https://cli.github.com)
- [Expo 构建文档](https://docs.expo.dev/build)

## 🆘 需要帮助？

### 快速问题

**Q: 为什么构建没有自动开始？**
A: 确保你推送到了配置的分支（main、develop 等）

**Q: 如何看到更详细的日志？**
A: 点击工作流运行 → Build and Test → 展开每个步骤

**Q: web-build 怎么部署？**
A: 可以上传到 GitHub Pages、Vercel、Netlify 等

**Q: 可以自动部署吗？**
A: 可以！推送到 main 分支会自动部署到 GitHub Pages

### 完整问题

1. 查看 GITHUB_ACTIONS.md
2. 查看具体工作流日志
3. 在本地重现问题
4. 打开 GitHub Issue

---

**现在就试试吧！** 推送你的代码，然后在 GitHub Actions 中看着应用自动构建！ 🚀
