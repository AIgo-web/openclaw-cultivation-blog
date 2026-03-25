# 🦞 OpenClaw 龙虾养成计划博客

> 一个完整的 React + TypeScript 技术博客，包含前台展示和管理后台。

## ⚡ 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

**访问地址**：
- 🌐 前台首页：http://localhost:5173/
- 🔐 后台登录：http://localhost:5173/admin/login
- 📝 默认账号：`admin / admin123`

---

## 📚 项目文档

### 快速参考
- 📖 **[快速参考卡片](.workbuddy/QUICK_REFERENCE.md)** - 常用命令和文件位置
- 🔄 **[记忆唤醒指南](.workbuddy/MEMORY_WAKUP.md)** - 如何在新任务中恢复项目记忆

### 完整文档
- 📋 **[项目架构](./docs/ARCHITECTURE.md)** - 详细的前后台架构说明
- 📊 **[优化规划](./OPTIMIZATION_PLAN.md)** - 5大优化方向和实施步骤
- 📅 **[工作日志](.workbuddy/memory/2026-03-23.md)** - 开发进度和问题修复记录

### Obsidian 文档（`C:\IT\IT运维笔记`）
- OpenClaw龙虾养成计划博客项目总结.md
- OpenClaw龙虾博客快速参考.md
- OpenClaw龙虾博客工作进度.md

---

## 🎯 项目结构

### 前台（公开访问）
```
/                    首页（文章列表 + 标签筛选）
/post/:id            文章详情（Markdown 渲染）
/tags                标签分类页
/about               关于页面
```

### 后台管理（需登录）
```
/admin/login         登录页面
/admin               仪表盘（数据统计）
/admin/posts         文章列表和搜索
/admin/posts/new     新建文章
/admin/posts/edit/:id 编辑文章
/admin/tags          标签管理
/admin/settings      设置页面
```

---

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19+ | UI 框架 |
| TypeScript | 最新 | 类型安全 |
| Vite | 最新 | 构建工具 |
| Tailwind CSS | 最新 | 样式框架 |
| React Router | v6+ | 路由管理 |
| @uiw/react-md-editor | 最新 | Markdown 编辑器 |
| lucide-react | 最新 | 图标库 |
| react-markdown | ^8 | Markdown 渲染 |

---

## 📂 项目文件结构

```
lobster-blog/
├── src/
│   ├── admin/                      # 后台管理模块
│   │   ├── context/
│   │   │   └── AuthContext.tsx     # 认证系统
│   │   ├── components/
│   │   │   ├── ProtectedRoute.tsx  # 路由守卫
│   │   │   ├── StatCard.tsx        # 统计卡片
│   │   │   └── MarkdownEditor.tsx  # MD 编辑器
│   │   ├── layout/
│   │   │   └── AdminLayout.tsx     # 后台布局
│   │   └── pages/
│   │       ├── LoginPage.tsx       # 登录页
│   │       ├── Dashboard.tsx       # 仪表盘
│   │       ├── PostList.tsx        # 文章列表
│   │       ├── PostEditor.tsx      # 文章编辑
│   │       ├── TagManager.tsx      # 标签管理
│   │       └── Settings.tsx        # 设置页
│   ├── components/                 # 前台组件
│   │   ├── Navbar.tsx              # 导航栏
│   │   ├── Footer.tsx              # 页脚
│   │   ├── PostCard.tsx            # 文章卡片
│   │   └── TagFilter.tsx           # 标签过滤
│   ├── pages/                      # 前台页面
│   │   ├── HomePage.tsx
│   │   ├── PostDetailPage.tsx
│   │   ├── TagsPage.tsx
│   │   └── AboutPage.tsx
│   ├── data/                       # 数据文件
│   │   ├── posts.ts
│   │   ├── tags.ts
│   │   └── about.ts
│   ├── hooks/
│   │   └── useDarkMode.ts
│   ├── App.tsx                     # 主路由
│   ├── main.tsx
│   └── index.css                   # 全局样式
├── .workbuddy/
│   ├── memory/
│   │   ├── MEMORY.md               # 项目长期记忆
│   │   └── 2026-03-23.md           # 工作日志
│   ├── MEMORY_WAKUP.md             # 记忆唤醒指南
│   └── QUICK_REFERENCE.md          # 快速参考卡片
├── OPTIMIZATION_PLAN.md            # 优化规划文档
└── package.json
```

---

## 🔐 认证系统

### 默认账号
```
用户名：admin
密码：admin123
```

### 存储方式
- localStorage 持久化会话
- 刷新页面自动恢复登录状态
- 退出登录可清除会话

---

## 🎨 功能特性

### 前台
- ✅ 文章列表展示
- ✅ 标签云筛选
- ✅ Markdown 渲染
- ✅ 暗色模式
- ✅ 响应式设计
- ✅ 文章导航（上/下篇）
- ✅ 文章目录（目录左对齐）
- ✅ 阅读进度条
- ✅ 打赏功能（微信/支付宝收款码）
- ✅ RSS 订阅
- ✅ SEO 优化（结构化数据、Sitemap、Robots.txt）
- ✅ Open Graph + Twitter Card 支持

### 后台
- ✅ 用户认证登录
- ✅ 仪表盘统计
- ✅ 文章管理（增删改查）
- ✅ Markdown 实时预览编辑
- ✅ Markdown 编辑器快捷键（Ctrl+S/B/I/K 等）
- ✅ 标签管理
- ✅ 博客设置（含收款码配置）
- ✅ 响应式侧边栏
- ✅ 路由守卫保护
- ✅ 数据导入/导出/备份/恢复
- ✅ 批量操作（选择、导出、删除）
- ✅ 代码分割（懒加载）

---

## ⚠️ 重要说明

### 数据持久化
目前所有数据编辑**仅在前端保存**，刷新页面会丢失。

**解决方案**：
1. 接入后端 API（Node.js/Express）
2. 使用 localStorage 存储数据
3. 使用 File System Access API（需权限）

### 已知问题
- 编辑后的数据不会真正保存到文件
- 需要实现真正的持久化方案

---

## 🚀 下一步优化

详见 [OPTIMIZATION_PLAN.md](./OPTIMIZATION_PLAN.md)

### 高优先级
1. 搜索功能
2. 文章目录（TOC）
3. 操作反馈系统（Toast）

### 中优先级
1. 性能优化（代码分割）
2. 数据持久化
3. 界面美化（动画效果）

### 低优先级
1. SEO 优化
2. CI/CD 部署
3. 性能监控

---

## 📝 命令行速查

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 清除依赖
rm -r node_modules package-lock.json
npm install

# 重启 dev server（如果依赖有变化）
# 先 Ctrl+C 停止，再 npm run dev
```

---

## 🤝 贡献指南

### 添加新文章
编辑 `src/data/posts.ts`，新增对象到 `posts` 数组

### 添加新标签
编辑 `src/data/tags.ts`，新增标签到 `tags` 数组

### 修改样式
- 全局样式：`src/index.css`
- 组件样式：各组件 `className`
- 主题切换：`src/hooks/useDarkMode.ts`

### 添加新页面
1. 创建页面文件：`src/pages/NewPage.tsx`
2. 在 `App.tsx` 添加路由
3. 在导航栏添加链接（如需）

---

## 📊 项目统计

| 指标 | 数值 |
|------|------|
| 前台页面 | 4 个 |
| 后台页面 | 6 个 |
| 组件总数 | 20+ |
| 代码行数 | ~3000+ |
| 开发耗时 | ~2 小时 |
| TypeScript 覆盖 | 100% |

---

## 📚 记忆恢复

新任务中，复制以下任一指令快速恢复项目记忆：

```
接上一个任务，继续优化龙虾博客。计划实现：[你的需求]
```

或直接提及：
- "龙虾博客" / "lobster-blog"
- "博客优化" / "文章搜索"
- 任何具体的功能或文件名

更多细节见 [MEMORY_WAKUP.md](.workbuddy/MEMORY_WAKUP.md)

---

## 📞 常见问题

**Q：如何登录后台？**  
A：访问 http://localhost:5173/admin/login，使用 `admin / admin123`

**Q：修改文章后为什么没有保存？**  
A：目前是演示模式，需要实现持久化（见 OPTIMIZATION_PLAN.md）

**Q：如何修改博客标题？**  
A：编辑 `src/data/about.ts` 中的 `blogTitle` 字段

**Q：怎样添加暗色模式？**  
A：已内置，点击导航栏的月亮/太阳图标切换

---

## 🎯 快速链接

| 链接 | 用途 |
|------|------|
| http://localhost:5173/ | 前台首页 |
| http://localhost:5173/admin/login | 后台登录 |
| .workbuddy/memory/MEMORY.md | 项目架构 |
| .workbuddy/MEMORY_WAKUP.md | 记忆恢复指南 |
| OPTIMIZATION_PLAN.md | 优化规划 |

---

**创建时间**：2026-03-23  
**最后更新**：2026-03-25 23:19  
**项目状态**：✅ 功能完善中  
**维护者**：WorkBuddy AI 助手
