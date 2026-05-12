import { Series } from '../types';

/**
 * 默认专题列表（仅用于初始化 localStorage）
 * 当 localStorage 中没有专题数据时，会自动加载这些默认数据
 */
export const defaultSeries: Series[] = [
  {
    id: 'ai-manga-drama',
    title: 'AI漫剧',
    description: '探索AI技术在漫剧创作中的应用，包括AI绘画、剧本生成、角色设计等前沿技术和实践案例。',
    coverColor: 'from-purple-600 to-pink-600',
    icon: '🎬',
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
    postIds: [],
    status: 'published',
    reports: [],
    materials: [],
    platforms: [],
    tools: [],
    sections: []
  }
,
  // ─── 小报童专栏：ClawCode 设计揭秘 (2026-05-12) ───
  {
    id: "clawcode-design-insider",
    title: "ClawCode 设计揭秘",
    description: "从小报童专栏精选的 12 篇深度文章，全方位解析 ClawCode 的核心设计——跨会话记忆、多 Agent 协作、Rust 工程实践，直至开源商业化。",
    coverColor: "from-orange-500 to-red-500",
    icon: "🦞",
    createdAt: "2026-05-12T01:54:49.942Z",
    updatedAt: "2026-05-12T01:54:49.942Z",
    postIds: ["xbt-01","xbt-02","xbt-03","xbt-04","xbt-05","xbt-06","xbt-07","xbt-08","xbt-09","xbt-10","xbt-11","xbt-12"],
    status: 'published' as const,
    reports: [],
    materials: [],
    platforms: [],
    tools: [],
    sections: [],
  }
];
