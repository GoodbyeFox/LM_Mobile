# GitHub Actions 构建指南

本项目配置了自动化CI/CD流程，可以自动构建、测试和打包应用。

## 🚀 快速开始

### 1. 推送代码触发构建

当你推送代码到以下分支时，GitHub Actions会自动触发：
- `claude/lm-studio-mobile-app-VqKml` (主开发分支)
- `main`
- `develop`

### 2. 查看构建状态

1. 打开 GitHub 仓库
2. 点击 "Actions" 选项卡
3. 查看最新的工作流运行状态

### 3. 下载构建产物

1. 点击工作流运行
2. 向下滚动到 "Artifacts" 部分
3. 下载所需的产物：
   - **web-build**: Web 版本应用
   - **build-info**: 构建详情文档

## 📋 工作流说明

### 构建工作流 (build-apk.yml)

#### 触发条件
- ✅ Push 到指定分支
- ✅ Pull Request 到指定分支
- ✅ 手动触发 (Workflow Dispatch)

#### 执行步骤

1. **检出代码** - 获取最新源代码
2. **设置 Node.js** - 安装 Node.js 18
3. **安装依赖** - 运行 `npm install`
4. **TypeScript 检查** - 验证类型安全
5. **ESLint 检查** - 代码质量检查
6. **Web 版本构建** - 导出 Expo web 应用
7. **上传产物** - 保存构建输出
8. **生成构建信息** - 创建使用说明
9. **PR 评论** - 自动评论构建状态

#### 输出产物

| 产物名称 | 用途 | 说明 |
|---------|------|------|
| web-build | 网页版应用 | 可直接在浏览器中运行 |
| build-info | 构建说明 | 使用和测试指南 |

### 部署工作流 (GitHub Pages)

当推送到 `main` 分支时，web 版本会自动部署到 GitHub Pages。

**部署地址**: `https://yourname.github.io/lm_mobile/`

## 📱 使用构建产物

### 测试 Web 版本

1. **下载 web-build 产物**
   ```bash
   # 从 GitHub Actions 中下载
   ```

2. **解压文件**
   ```bash
   unzip web-build.zip
   cd dist
   ```

3. **启动本地服务器**
   ```bash
   # 使用 Python
   python -m http.server 8000

   # 或使用 Node.js
   npx http-server
   ```

4. **在浏览器中打开**
   - 访问 `http://localhost:8000`
   - 配置 LM Studio 服务器地址
   - 开始使用应用

### 构建 Android APK

对于完整的 Android APK，需要使用 EAS 服务：

1. **安装 EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **登录 Expo 账户**
   ```bash
   eas login
   ```

3. **构建 APK**
   ```bash
   eas build --platform android
   ```

4. **等待构建完成**
   - 构建时间: 10-20 分钟
   - 完成后会收到邮件通知

5. **下载 APK**
   - 从 EAS 仪表盘下载
   - 或通过邮件链接

### 构建 iOS 应用

```bash
# 需要 macOS 和 Apple Developer 账户
eas build --platform ios
```

## 🔧 配置说明

### eas.json

EAS 构建配置文件：

```json
{
  "build": {
    "production": {
      "channel": "production",
      "distribution": "store"
    },
    "preview": {
      "channel": "preview",
      "distribution": "internal"
    },
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    }
  }
}
```

### 环境变量

GitHub Actions 工作流使用以下环境变量：

| 变量名 | 说明 | 来源 |
|-------|------|------|
| EXPO_TOKEN | Expo 认证令牌 | GitHub Secrets |
| GITHUB_SHA | 提交 SHA | GitHub 自动提供 |
| GITHUB_REF | 分支名称 | GitHub 自动提供 |

### 添加密钥

如需使用 Expo 服务构建原生应用：

1. **获取 EXPO_TOKEN**
   - 访问 https://expo.dev
   - 创建账户并生成令牌

2. **添加到 GitHub**
   - 仓库 → Settings → Secrets and variables
   - 点击 "New repository secret"
   - 名称: `EXPO_TOKEN`
   - 值: 粘贴你的 Expo 令牌

## 🎯 常见任务

### 手动触发构建

```bash
# 使用 GitHub CLI
gh workflow run build-apk.yml

# 或在 GitHub 网站上：
# Actions → Build and Test → Run workflow
```

### 查看构建日志

1. 打开 "Actions" 选项卡
2. 选择工作流运行
3. 点击 "Build and Test" 任务
4. 展开各步骤查看详细日志

### 清除构建缓存

```bash
# GitHub Actions 自动管理缓存
# 如需手动清除：
# 1. 仓库 Settings
# 2. Actions → General
# 3. "Caches" 部分
# 4. 点击删除按钮
```

## ⚠️ 故障排除

### 构建失败 - TypeScript 错误

**问题**: `error TS1234: ...`

**解决**:
```bash
# 本地检查
npx tsc --noEmit

# 修复错误后推送
git add .
git commit -m "Fix TypeScript errors"
git push
```

### 构建失败 - 依赖问题

**问题**: `npm ERR! ...`

**解决**:
```bash
# 清除缓存
rm -rf node_modules
npm cache clean --force

# 重新安装
npm install --legacy-peer-deps

# 推送
git add package-lock.json
git commit -m "Update dependencies"
git push
```

### Web 构建失败

**问题**: `Error: Unable to export web bundle`

**解决**:
```bash
# 本地测试
npx expo export --platform web --output-dir ./test-dist

# 检查错误信息
# 修复问题后推送
```

## 📊 构建状态徽章

在 README.md 中添加构建状态徽章：

```markdown
[![Build Status](https://github.com/yourname/LM_Mobile/workflows/Build%20and%20Test/badge.svg)](https://github.com/yourname/LM_Mobile/actions)
```

## 🔐 安全最佳实践

### 不要在代码中提交密钥
- ❌ 不要 commit `.env` 文件
- ❌ 不要 commit 密钥或令牌
- ✅ 使用 GitHub Secrets
- ✅ 使用 `.env.example` 作为模板

### 环境文件示例

```bash
# .env.example (提交到 repo)
REACT_APP_API_URL=
EXPO_TOKENS=

# .env.local (不提交)
REACT_APP_API_URL=https://api.example.com
EXPO_TOKEN=your_real_token_here
```

## 📈 持续改进

### 添加更多检查

要添加额外的检查步骤：

1. 编辑 `.github/workflows/build-apk.yml`
2. 在 `build` job 下添加新步骤：

```yaml
- name: Custom Check
  run: |
    # 你的命令
    echo "Running custom check"
```

3. 提交并推送

### 性能优化

- GitHub Actions 自动缓存 `node_modules`
- 使用 `actions/cache@v3` 加速构建
- 并行运行多个 job 节省时间

## 📚 相关资源

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Expo 构建文档](https://docs.expo.dev/build/introduction/)
- [EAS Build 指南](https://docs.expo.dev/build/setup/)

## 🆘 获取帮助

### 本地调试

如果 GitHub Actions 失败，先在本地测试：

```bash
# 安装依赖
npm install --legacy-peer-deps

# 运行 TypeScript 检查
npx tsc --noEmit

# 运行 ESLint
npx eslint . --ext .ts,.tsx

# 尝试构建 web 版本
npx expo export --platform web
```

### 查看日志

- 访问 GitHub Actions 选项卡
- 选择失败的工作流
- 展开失败的步骤
- 查看详细的错误信息

### 获取支持

- 检查 [GitHub Actions 常见问题](https://docs.github.com/en/actions/guides)
- 查阅 [Expo 社区论坛](https://forums.expo.dev)
- 打开 GitHub Issue 描述问题

---

**提示**: 本地开发时使用 `npx expo start`，推送到 GitHub 时 Actions 会自动构建和测试！
