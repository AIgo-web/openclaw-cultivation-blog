# 龙虾博客 V3.0.0 更新日志

## 🎉 V3.0.0 (2026-03-25)

### 🚀 性能优化

#### 代码分割与懒加载
- **路由懒加载**：管理后台所有页面（PostList、PostEditor、Settings 等）现在使用 `React.lazy()` 和 `Suspense` 进行代码分割
- **手动分包策略**：根据依赖类型自动分包
  - `vendor-react`: React 核心库
  - `vendor-router`: React Router
  - `vendor-markdown`: Markdown 渲染相关库
  - `vendor-highlight`: 代码高亮库
  - `vendor-icons`: Lucide 图标库
  - `admin`: 管理后台模块
- **加载骨架屏**：新增 `PageSkeleton` 组件，在页面加载时显示优雅的加载动画
- **CSS 代码分割**：启用 CSS 代码分割，减少首屏样式体积

#### 构建优化
- 升级构建工具配置，启用更好的压缩
- 添加 sourcemap 支持（开发模式）
- 配置 chunkSizeWarningLimit 为 500KB

### 🔍 SEO 优化

#### 结构化数据
- **文章 Schema**：自动生成 Article 结构化数据（JSON-LD）
- **面包屑导航**：`generateBreadcrumbSchema()` 生成面包屑结构化数据
- **网站导航**：`generateSiteNavigationSchema()` 生成网站导航结构化数据
- **站点地图**：`generateSitemap()` 生成 XML 站点地图

#### Meta 标签优化
- **Open Graph**：完整的 og:title、og:description、og:image、og:type 支持
- **Twitter Card**：支持 summary_large_image 卡片类型
- **Article Meta**：文章发布时间、修改时间、标签等元数据

#### RSS 订阅
- **RSS Feed 组件**：`RSSFeed` 组件支持生成 RSS 2.0 和 Atom 格式
- **静态生成**：`generateStaticRSS()` 支持构建时生成完整 RSS 文件
- **订阅按钮**：前台页面显示 RSS 订阅入口

### ✨ 用户体验优化

#### Markdown 编辑器增强
- **键盘快捷键**：
  - `Ctrl/Cmd + S`: 保存草稿
  - `Ctrl/Cmd + Z`: 撤销
  - `Ctrl/Cmd + Y`: 重做
  - `Ctrl/Cmd + B`: 加粗
  - `Ctrl/Cmd + I`: 斜体
  - `Ctrl/Cmd + K`: 插入链接
  - `Ctrl/Cmd + \``: 行内代码
  - `Tab`: 缩进
- **撤销/重做**：支持 50 步历史记录
- **快捷键提示浮层**：点击键盘图标显示所有快捷键
- **自动保存优化**：1.5 秒防抖保存到 localStorage

#### 文章列表批量操作
- **全选/取消全选**：快速选择所有文章
- **批量导出**：一次性导出多篇文章为 Markdown
- **批量删除**：带确认对话框的批量删除
- **搜索过滤**：支持标题和摘要搜索
- **排序选项**：按日期、状态排序

### 💾 数据管理

#### 导入/导出
- **JSON 备份**：`exportAllDataAsJSON()` 导出完整备份
- **Base64 压缩**：`exportAllDataAsBase64()` 生成可迁移的压缩格式
- **Markdown 导入**：`importPostFromMarkdown()` 支持导入带 frontmatter 的 Markdown
- **Frontmatter 解析**：自动解析 title、date、tags、category 等字段

#### 备份恢复
- **本地备份**：`handleBackupToLocal()` 保存到 localStorage
- **一键恢复**：`handleRestoreFromLocal()` 从本地备份恢复
- **数据合并**：智能合并策略，不覆盖已存在的文章

#### Markdown 导出
- **Frontmatter 生成**：导出的 Markdown 自动包含完整的 YAML frontmatter
- **元数据保留**：title、date、tags、category、coverImage 等全部保留

### 🎁 社交功能

#### 分享组件
- **原生分享**：`Web Share API` 支持移动端原生分享
- **社交平台**：微博、Twitter、LinkedIn、Reddit 一键分享
- **链接复制**：一键复制文章链接
- **分享卡片**：支持生成分享预览卡片（图片下载功能）

#### 打赏组件
- **多渠道**：支持微信和支付宝两种打赏方式
- **Tab 切换**：优雅的 Tab 切换体验
- **暗色模式**：完美适配暗色主题
- **响应式设计**：移动端友好的展示

### 📦 新增文件

```
src/
├── services/
│   ├── seoService.ts       # SEO 工具服务
│   └── dataService.ts      # 数据管理服务
├── components/
│   ├── Donation.tsx        # 打赏组件
│   ├── RSSFeed.tsx         # RSS 订阅组件
│   └── ShareCard.tsx       # 分享卡片组件
├── hooks/
│   └── useBatchOperations.ts  # 批量操作 Hook
├── utils/
│   └── sitemapGenerator.ts # Sitemap 生成工具
└── vite-plugins/
    └── analyzer.ts         # Bundle 分析插件
```

### 🔧 配置更新

#### vite.config.ts
- 添加 `manualChunks` 配置实现代码分割
- 添加 `cssCodeSplit` 启用 CSS 分割
- 配置 `optimizeDeps.include` 预构建依赖

### 📝 其他改进

- 版本号从 `0.0.0` 更新到 `3.0.0`
- SEO 初始化组件自动注入网站导航结构化数据
- 设置页面整合数据管理功能
- 更完整的错误处理

---

## 📋 升级指南

### 从 V2 升级
1. 拉取最新代码
2. 运行 `npm install` 更新依赖
3. 运行 `npm run build` 重新构建
4. 测试所有功能是否正常

### 注意事项
- 备份功能格式已更新，但兼容旧版本备份文件
- 如遇构建问题，尝试删除 `node_modules` 和 `dist` 后重新安装

---

**感谢使用龙虾博客！🦞**
