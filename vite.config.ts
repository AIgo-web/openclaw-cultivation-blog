import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// XML 转义函数
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

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
    writeBundle() {
      const file404 = path.resolve(__dirname, 'dist/404.html')
      if (fs.existsSync(file404)) {
        let content = fs.readFileSync(file404, 'utf-8')
        const replaced = content.replace(
          /var segmentCount = \d+;/,
          `var segmentCount = ${segmentCount};`
        )
        fs.writeFileSync(file404, replaced, 'utf-8')
        console.log(`[inject-404] segmentCount set to ${segmentCount}`)
      } else {
        console.warn('[inject-404] dist/404.html not found, skipping')
      }
    }
  }

  // 自定义插件：开发模式下提供 RSS Feed
  const rssFeedPlugin = {
    name: 'rss-feed',
    configureServer(server: any) {
      server.middlewares.use('/feed.xml', (_req: any, res: any) => {
        const blogUrl = env.VITE_BLOG_URL || 'https://openclaw.ai'
        const blogTitle = env.VITE_BLOG_TITLE || 'OpenClaw 龙虾养成计划'
        const blogDesc = env.VITE_BLOG_DESC || '记录 OpenClaw AI Agent 的折腾历程'

        const rssContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(blogTitle)}</title>
    <link>${blogUrl}</link>
    <description>${escapeXml(blogDesc)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${blogUrl}/feed.xml" rel="self" type="application/rss+xml" />
  </channel>
</rss>`

        res.setHeader('Content-Type', 'application/xml; charset=utf-8')
        res.setHeader('Cache-Control', 'no-cache')
        res.end(rssContent)
      })
    }
  }

  // 自定义插件：构建时生成 sitemap.xml 和 robots.txt
  const seoBuildPlugin = {
    name: 'seo-build-output',
    async writeBundle() {
      const blogUrl = env.VITE_BLOG_URL || 'https://openclaw.ai'
      const now = new Date().toISOString().split('T')[0]
      const distDir = path.resolve(__dirname, 'dist')

      // 生成 sitemap.xml
      const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${blogUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${blogUrl}/about</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${blogUrl}/contact</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${blogUrl}/privacy</loc>
    <lastmod>${now}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${blogUrl}/tags</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${blogUrl}/series</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`

      // 生成 robots.txt（针对国内外搜索引擎优化）
      const robotsTxt = `# ============================================
# 国内搜索引擎蜘蛛配置
# ============================================

# 百度蜘蛛
User-agent: Baiduspider
Allow: /
Disallow: /admin/
Disallow: /api/
Crawl-delay: 10

# 360 搜索蜘蛛
User-agent: 360Spider
Allow: /
Disallow: /admin/
Disallow: /api/
Crawl-delay: 10

# 搜狗蜘蛛
User-agent: Sogou Spider
Allow: /
Disallow: /admin/
Disallow: /api/
Crawl-delay: 10

# 神马搜索蜘蛛（移动端）
User-agent: YisouSpider
Allow: /
Disallow: /admin/
Disallow: /api/
Crawl-delay: 10

# 通用配置（兜底）
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

# Sitemap
Sitemap: ${blogUrl}/sitemap.xml

# 抓取延迟
Crawl-delay: 1
`

      fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf-8')
      fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsTxt, 'utf-8')
      console.log('[seo-build] sitemap.xml and robots.txt generated')
    }
  }

  return {
    base,
    plugins: [react(), inject404Plugin, rssFeedPlugin, seoBuildPlugin],
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
      // ✅ V3 性能优化：代码分割配置
      rollupOptions: {
        output: {
          // 入口文件命名
          entryFileNames: `[name]-[hash].js`,
          // 异步 chunk 命名（用于代码分割）
          chunkFileNames: `[name]-[hash].js`,
          // 静态资源命名
          assetFileNames: `[name]-[hash][extname]`,
          // ✅ 手动分包策略
          manualChunks: (id: string) => {
            // React 核心库
            if (id.includes('node_modules/react')) {
              return 'vendor-react';
            }
            // React Router
            if (id.includes('node_modules/react-router')) {
              return 'vendor-router';
            }
            // Markdown 相关库
            if (id.includes('node_modules/react-markdown') || 
                id.includes('node_modules/remark') || 
                id.includes('node_modules/rehype')) {
              return 'vendor-markdown';
            }
            // Highlight.js
            if (id.includes('node_modules/highlight.js')) {
              return 'vendor-highlight';
            }
            // Lucide 图标库
            if (id.includes('node_modules/lucide-react')) {
              return 'vendor-icons';
            }
            // 其他第三方库
            if (id.includes('node_modules')) {
              return 'vendor-misc';
            }
            // 管理后台页面单独分包
            if (id.includes('/admin/')) {
              return 'admin';
            }
          },
        },
      },
      // ✅ 启用 CSS 代码分割
      cssCodeSplit: true,
      // ✅ 启用打包压缩
      minify: 'esbuild',
      // ✅ 生成 sourcemap（生产环境可关闭）
      sourcemap: mode !== 'production',
      // ✅ 启用 gzip 压缩（需要服务器配合）
      chunkSizeWarningLimit: 500, // KB
    },
    // ✅ V3 性能优化：依赖预构建
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'lucide-react',
        'date-fns',
      ],
    },
    // ✅ V3 性能优化：构建后分析
    // @ts-ignore
    ...(process.env.ANALYZE && { plugins: [] }),
  }
})
