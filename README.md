# Creative Studio 创意工作室

视频创意处理工具，部署于 Cloudflare Pages，使用 D1 数据库存储用户账号。

## 开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

## D1 数据库配置（首次部署必做）

1. **创建 D1 数据库**
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/) → Workers & Pages → D1
   - 点击「创建数据库」，名称填 `creative-studio-db`
   - 创建后进入数据库详情，复制 **数据库 ID**（UUID 格式）

2. **配置 wrangler.toml**
   - 打开 `wrangler.toml`，将 `YOUR_D1_DATABASE_ID` 替换为上面复制的数据库 ID

3. **执行数据库迁移**
   ```bash
   npx wrangler d1 migrations apply creative-studio-db --remote
   ```

4. **在 Cloudflare Pages 中绑定 D1**
   - 若使用 Git 连接部署，需在 Pages 项目设置中启用 **V2 构建系统**
   - 确保 `wrangler.toml` 中的 D1 配置正确，Pages 会自动读取

## 部署到 Cloudflare Pages

### 方式一：Git 连接（推荐）

1. 将代码推送到 GitHub 或 GitLab
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/) → Workers & Pages
3. 创建项目 → 从 Git 导入
4. 选择仓库，构建配置：
   - **框架预设**: Vite
   - **构建命令**: `npm run build`
   - **构建输出目录**: `dist`
5. 完成 D1 配置（见上方）
6. 保存并部署

### 方式二：Wrangler CLI 手动部署

```bash
npm run build
npx wrangler pages deploy dist --project-name=creative-studio
```

## 技术栈

- React + Vite
- Cloudflare Pages（静态托管 + Pages Functions）
- Cloudflare D1（用户账号存储）
- 客户端算力（ffmpeg.wasm、Whisper WASM 等，后续集成）
