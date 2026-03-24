import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 加载对应 mode 的环境变量（.env.github / .env.tencent / .env 等）
  const env = loadEnv(mode, process.cwd(), '')

  // base 路径：
  //   github 模式  → /lobster-blog/（读 .env.github）
  //   tencent 模式 → /（读 .env.tencent）
  //   development  → /（本地开发不需要子路径）
  const base = env.VITE_BASE_PATH || '/'

  // 计算子路径层级（根路径=0，/lobster-blog/=1）
  const segmentCount = base === '/' ? 0 : base.split('/').filter(Boolean).length

  // 自定义插件：构建完成后将 404.html 中的 segmentCount 替换为实际值
  const inject404Plugin = {
    name: 'inject-404-segment-count',
    closeBundle() {
      const file404 = path.resolve(__dirname, 'dist/404.html')
      if (fs.existsSync(file404)) {
        let content = fs.readFileSync(file404, 'utf-8')
        content = content.replace(
          /var segmentCount = \d+;/,
          `var segmentCount = ${segmentCount};`
        )
        fs.writeFileSync(file404, content, 'utf-8')
      }
    }
  }

  return {
    base,
    plugins: [react(), inject404Plugin],
    server: {
      host: true,
      port: 5173,
      middlewareMode: false,
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 5173,
      },
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        output: {
          entryFileNames: `[name].[hash].js`,
          chunkFileNames: `[name].[hash].js`,
          assetFileNames: `[name].[hash][extname]`,
        },
      },
    },
  }
})
