# 龙虾博客 (Lobster Blog) — 项目蓝图

> **版本**: 3.4 | **最后更新**: 2026-05-12 | **线上地址**: [aievolution.site](https://aievolution.site)

---

## 1. 项目概述

龙虾博客是一个面向 AI Agent 开发者（特别是 Clawcode/OpenClaw 用户）的技术博客，提供教程、实战案例和资源汇总。前端基于 React + Vite + TypeScript，部署在腾讯云 Ubuntu 服务器上。

### 核心功能

| 功能 | 描述 |
|------|------|
| 博客前台 | 首页、文章详情、标签页、专题页、关于/联系/隐私页 |
| 管理后台 | 文章 CRUD、标签管理、专题管理、评论审核、数据统计、数据导入导出 |
| 发布渠道 | GitHub Pages 同步、微信公众号同步 |
| SEO | sitemap.xml、robots.txt、结构化数据、百度/360 验证 |
| 数据持久化 | localStorage + 后端 API 双写（后端可选） |
| 专题系统 | 支持资源中心（报告/资料/平台/工具）、自定义分区 |

---

## 2. 技术架构

```
┌─────────────────────────────────────────────────────┐
│                    前端 (SPA)                        │
│  React 19 + TypeScript + Vite 8 + Tailwind CSS 3    │
├─────────────────────────────────────────────────────┤
│  Context 层                                         │
│  PostsContext / SeriesContext / CommentsContext /    │
│  ViewsContext / SearchContext / ToastContext        │
├─────────────────────────────────────────────────────┤
│  数据层                                             │
│  localStorage (主) ←→ persistService ←→ 后端 API    │
│  data/posts.ts (内置初始文章)                        │
├─────────────────────────────────────────────────────┤
│  服务层                                             │
│  dataService / githubService / wechatService /      │
│  seoService / persistService                        │
└─────────────────────────────────────────────────────┘
         │
    部署: GitHub Actions → 腾讯云 SCP
    服务器: Apache2 (Ubuntu) 静态托管
```

### 技术栈明细

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | React | 19.2 |
| 构建 | Vite | 8.0 |
| 语言 | TypeScript | 5.9 |
| 样式 | Tailwind CSS | 3.4 |
| 路由 | react-router-dom | 7.13 |
| Markdown | react-markdown + remark-gfm + rehype-highlight | - |
| 图标 | lucide-react | 0.577 |
| 日期 | date-fns | 4.1 |
| 代码高亮 | highlight.js | 11.11 |
| HTML→MD | turndown | 7.2 |

---

## 3. 目录结构

```
lobster-blog/
├── .env.github              # GitHub Pages 构建环境变量
├── .env.tencent             # 腾讯云构建环境变量
├── .github/workflows/deploy.yml  # CI/CD 部署配置
├── nginx.conf               # Nginx 配置模板
├── index.html               # SPA 入口 HTML
├── package.json             # 依赖和脚本
├── vite.config.ts           # Vite 配置（含自定义插件）
├── tailwind.config.cjs      # Tailwind 配置
├── tsconfig.json            # TypeScript 配置
├── docs/                    # 项目文档
│   ├── BLUEPRINT.md         # 项目蓝图（本文件）
│   └── CHANGELOG.md         # 变更日志
│
├── public/                  # 静态资源
│   └── 404.html             # SPA 404 回退
│
└── src/
    ├── main.tsx             # 应用入口
    ├── App.tsx              # 路由配置 + Provider 层
    │
    ├── pages/               # 前台页面
    │   ├── HomePage.tsx
    │   ├── PostDetailPage.tsx
    │   ├── TagsPage.tsx
    │   ├── SeriesPage.tsx
    │   ├── SeriesDetailPage.tsx
    │   ├── AboutPage.tsx
    │   ├── ContactPage.tsx
    │   └── PrivacyPage.tsx
    │
    ├── admin/               # 管理后台
    │   ├── layout/AdminLayout.tsx
    │   ├── context/AuthContext.tsx
    │   ├── components/
    │   │   ├── ProtectedRoute.tsx
    │   │   ├── DataManager.tsx
    │   │   ├── MarkdownEditor.tsx
    │   │   ├── MarkdownToolbar.tsx
    │   │   ├── PreviewModal.tsx
    │   │   ├── StatCard.tsx
    │   │   └── EditorSkeleton.tsx
    │   └── pages/
    │       ├── LoginPage.tsx
    │       ├── Dashboard.tsx
    │       ├── PostList.tsx
    │       ├── PostEditor.tsx
    │       ├── PostPreviewPage.tsx
    │       ├── TagManager.tsx
    │       ├── SeriesManager.tsx
    │       ├── CommentManager.tsx
    │       ├── Analytics.tsx
    │       └── Settings.tsx
    │
    ├── components/          # 前台公共组件
    │   ├── Navbar.tsx
    │   ├── Footer.tsx
    │   ├── PostCard.tsx
    │   ├── CommentSection.tsx
    │   ├── MarkdownRenderer.tsx
    │   ├── SearchBar.tsx
    │   ├── TableOfContents.tsx
    │   ├── Donation.tsx
    │   ├── ShareButtons.tsx
    │   ├── ShareCard.tsx
    │   ├── HotSeriesWidget.tsx
    │   ├── RSSFeed.tsx
    │   └── ToastContainer.tsx
    │
    ├── contexts/            # React Context 状态管理
    │   ├── PostsContext.tsx
    │   ├── SeriesContext.tsx
    │   ├── CommentsContext.tsx
    │   ├── ViewsContext.tsx
    │   ├── SearchContext.tsx
    │   └── ToastContext.tsx
    │
    ├── services/            # 业务服务层
    │   ├── dataService.ts       # 数据导入/导出/备份
    │   ├── githubService.ts     # GitHub 发布/图片上传
    │   ├── wechatService.ts     # 微信公众号同步
    │   ├── seoService.ts        # SEO 结构化数据
    │   └── persistService.ts    # 后端数据持久化
    │
    ├── data/                # 静态数据
    │   ├── posts.ts            # 内置文章（硬编码）
    │   ├── tags.ts             # 标签数据
    │   ├── categories.ts       # 分类数据
    │   └── sensitive-words.json # 敏感词过滤
    │
    ├── hooks/               # 自定义 Hooks
    │   ├── useDarkMode.ts
    │   ├── useSearchShortcut.ts
    │   └── useBatchOperations.ts
    │
    ├── utils/               # 工具函数
    │   ├── search.ts
    │   ├── toc.ts
    │   ├── sitemapGenerator.ts
    │   ├── exportPost.ts
    │   └── debugLogger.ts
    │
    ├── types/               # TypeScript 类型定义
    │   └── index.ts
    │
    └── vite-plugins/        # Vite 自定义插件
        └── analyzer.ts
```

---

## 4. 数据流

```
用户操作（新增/编辑/删除文章）
    │
    ▼
PostsContext (React State)
    │
    ├──► localStorage（即时写入）
    │
    └──► persistService.pushRemoteData()
              │
              ▼
        后端 API /api/blog/data/{key}
        （异步写入，失败静默降级）

启动加载:
后端 API ──► fetchRemoteData() ──► PostsContext
    │                                     │
    ▼ (失败)                              ▼
localStorage ──► getStoredPosts() ──► 合并初始数据
    │                                     │
    ▼ (无数据)                            ▼
data/posts.ts ────────────────────► 初始文章集
```

### 数据模型

- **Post**: 文章（id, title, summary, content/markdown, tags, date, status, views, seriesId...）
- **Series**: 专题（id, title, postIds, reports, materials, platforms, tools, sections...）
- **Comment**: 评论（id, postId, author, content, status, replies...）
- **Tag**: 标签（id, name, count, color）

---

## 5. 部署架构

```
GitHub (main 分支)
    │
    ▼ GitHub Actions
    │
    ├──► build-github  → deploy-github → GitHub Pages
    │
    └──► deploy-tencent → SCP → /var/www/lobster-blog → Apache2
                                        │
                                        ▼
                                  aievolution.site
```

### 环境配置

| 环境 | VITE_BASE_PATH | VITE_BLOG_URL | 部署方式 |
|------|---------------|---------------|---------|
| GitHub Pages | /openclaw-cultivation-blog/ | https://AIgo-web.github.io/openclaw-cultivation-blog/ | gh-pages |
| 腾讯云 | / | https://aievolution.site | SCP + Apache2 |
| 开发环境 | / | http://localhost:5173 | Vite dev server |

---

## 6. 构建优化

- **代码分割**: vendor-react / vendor-router / vendor-markdown / vendor-highlight / vendor-icons / vendor-misc / admin
- **懒加载**: 管理后台页面全部 lazy import + Suspense 骨架屏
- **CSS 分割**: cssCodeSplit 已启用
- **压缩**: esbuild minify
- **静态资源缓存**: hash 文件名 + immutable Cache-Control
- **HTML 不缓存**: no-cache 策略确保更新生效

---

## 7. 管理后台功能

| 页面 | 路由 | 功能 |
|------|------|------|
| 仪表盘 | /admin | 统计概览（文章数/标签数/评论数/阅读量） |
| 文章管理 | /admin/posts | 列表、搜索、排序、多选批量操作 |
| 文章编辑 | /admin/posts/edit/:id | Markdown 编辑器 + HTML 预览、封面图上传 |
| 标签管理 | /admin/tags | CRUD |
| 专题管理 | /admin/series | CRUD、资源中心（4类分区）、自定义主题 |
| 评论管理 | /admin/comments | 审核/回复/删除 |
| 数据统计 | /admin/analytics | 阅读量统计 |
| 设置 | /admin/settings | 密码修改、GitHub 配置、微信配置、数据导入导出 |

---

## 8. 版本历史

| 版本 | 日期 | 内容 |
|------|------|------|
| V1.0 | 2026-03-15 | 初始版本：基础博客功能 |
| V3.0 | 2026-03-20 | 专题系统、代码分割、懒加载 |
| V3.1 | 2026-03-25 | 公安备案功能、RSS、懒加载修复、打赏 |
| V3.2 | 2026-03-27 | 后端数据持久化、微信同步 |
| V3.3 | 2026-04-01 | 专题系统优化、数据持久化、搜索改进 |
| V3.4 | 2026-04-05 | SEO 优化、meta/OG、百度360验证 |
| V3.5 | 2026-05-12 | 蓝图文档、调试日志、批量 Markdown 导入 |

---

## 9. 已知问题 & 改进计划

### 已知问题
- [ ] GitHub Token 暴露在 git remote URL 中（ghp_xxx），应使用 GitHub Secrets
- [ ] Dashboard 统计趋势数据是硬编码的（value: 20, value: 15, value: 100）
- [ ] readTime 计算使用英文分词（split(/\s+/)），中文文章不准确
- [ ] nginx.conf 使用 Apache2 部署但配置是 Nginx 格式（不一致）
- [ ] 后端 API 超时仅 3s，弱网环境下容易降级到 localStorage
- [ ] localStorage 5MB 限制，专题附件过多会触发 QuotaExceededError

### 改进计划
- [ ] 添加调试日志系统（debugLogger）
- [ ] 后台批量导入 Markdown 文件功能
- [ ] 后端 Node.js Express 服务独立化
- [ ] 图片压缩和 WebP 转换
- [ ] 文章全文搜索（目前只搜标题和摘要）
- [ ] 国际化 (i18n) 支持
- [ ] PWA 离线支持
- [ ] 暗色模式下的代码高亮适配
- [ ] Markdown 编辑器自动保存增强
- [ ] 接入真正的后端数据库（替代 localStorage）
