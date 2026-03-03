# Creative Studio 创意工作室

视频创意处理工具，部署于 Cloudflare Pages。

## 开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

## 部署到 Cloudflare Pages

### 方式一：Git 连接（推荐）

1. 将代码推送到 GitHub 或 GitLab
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/) → Workers & Pages
3. 创建项目 → 从 Git 导入
4. 选择仓库，构建配置：
   - **构建命令**: `npm run build`
   - **构建输出目录**: `dist`
5. 保存并部署

### 方式二：Wrangler CLI 手动部署

```bash
npm run build
npx wrangler pages deploy dist --project-name=creative-studio
```

## 技术栈

- React + Vite
- Cloudflare Pages（静态托管）
- 客户端算力（ffmpeg.wasm、Whisper WASM 等，后续集成）
