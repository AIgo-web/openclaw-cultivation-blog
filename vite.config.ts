import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// 构建后修正 404.html 中的 segmentCount（根路径=0）
function inject404Plugin() {
  return {
    name: 'inject-404-segment-count',
    writeBundle() {
      const file404 = path.resolve(__dirname, 'dist/404.html')
      if (fs.existsSync(file404)) {
        const content = fs.readFileSync(file404, 'utf-8')
        const replaced = content.replace(/var segmentCount = \d+;/, 'var segmentCount = 0;')
        fs.writeFileSync(file404, replaced, 'utf-8')
      }
    },
  }
}

// 构建时生成 sitemap.xml 与 robots.txt（与历史产物保持一致）
function seoBuildPlugin() {
  return {
    name: 'seo-build-output',
    writeBundle() {
      const blogUrl = 'https://aievolution.site'
      const now = new Date().toISOString().split('T')[0]
      const distDir = path.resolve(__dirname, 'dist')
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${blogUrl}/</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>${blogUrl}/about</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>${blogUrl}/contact</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>
  <url><loc>${blogUrl}/privacy</loc><lastmod>${now}</lastmod><changefreq>yearly</changefreq><priority>0.3</priority></url>
  <url><loc>${blogUrl}/tags</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>
  <url><loc>${blogUrl}/series</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>
</urlset>`
      const robots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Crawl-delay: 1
Sitemap: ${blogUrl}/sitemap.xml
`
      fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap, 'utf-8')
      fs.writeFileSync(path.join(distDir, 'robots.txt'), robots, 'utf-8')
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = env.VITE_BASE_PATH || '/'
  return {
    base,
    plugins: [react(), inject404Plugin(), seoBuildPlugin()],
    server: { host: true, port: 5173 },
    build: {
      outDir: 'dist',
      rollupOptions: {
        output: {
          entryFileNames: '[name]-[hash].js',
          chunkFileNames: '[name]-[hash].js',
          assetFileNames: '[name]-[hash][extname]',
          manualChunks(id) {
            if (id.includes('node_modules/react')) return 'vendor-react'
            if (id.includes('node_modules/react-router')) return 'vendor-router'
            if (id.includes('node_modules/react-markdown') || id.includes('node_modules/remark') || id.includes('node_modules/rehype')) return 'vendor-markdown'
            if (id.includes('node_modules/highlight.js')) return 'vendor-highlight'
            if (id.includes('node_modules/lucide-react')) return 'vendor-icons'
            if (id.includes('node_modules')) return 'vendor-misc'
            if (id.includes('/admin/')) return 'admin'
          },
        },
      },
      cssCodeSplit: true,
      minify: 'esbuild',
      sourcemap: mode !== 'production',
    },
  }
})
