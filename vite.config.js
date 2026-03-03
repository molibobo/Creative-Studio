import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 本地开发时，将 /api 代理到已部署的 Cloudflare Pages
// 在项目根目录创建 .env.local，设置 API_PROXY=https://你的站点.pages.dev
const apiProxy = process.env.API_PROXY || 'https://creative-studio-v4y.pages.dev'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: apiProxy,
        changeOrigin: true,
      },
    },
  },
})
