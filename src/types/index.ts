export interface Post {
  id: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  date: string;
  readTime: number;
  coverColor?: string;
  coverImage?: string;       // 封面图片 URL（优先于 coverColor 渐变）
  category?: string;
  status?: 'published' | 'draft';
  views?: number;
  relatedPostIds?: string[];  // 手动指定的关联文章 ID 列表
  seriesId?: string;          // 所属专题 ID
  seriesOrder?: number;       // 在专题中的排序（从 1 开始）
}

/** 专题报告文件（PDF / HTML） */
export interface SeriesReport {
  id: string;
  title: string;
  description?: string;
  url: string;              // 文件链接或网盘链接
  type: 'pdf' | 'html' | 'other';
  size?: string;            // 如 "2.4 MB"
}

/** 资料与资质文件 */
export interface SeriesMaterial {
  id: string;
  title: string;
  description?: string;
  url: string;
  type: 'pdf' | 'doc' | 'image' | 'zip' | 'other';
  size?: string;
}

/** 相关平台链接 */
export interface SeriesPlatform {
  id: string;
  name: string;
  description?: string;
  url: string;
  icon?: string;            // emoji 或平台图标
  category?: string;        // 如 "视频平台"、"知识付费"
}

/** 工具软件 */
export interface SeriesTool {
  id: string;
  name: string;
  description?: string;
  url: string;              // 下载链接或网盘链接
  platform?: string;        // 如 "Windows / macOS"
  version?: string;
  icon?: string;
  isFree?: boolean;
}

export interface Series {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  coverColor?: string;      // 渐变封面色
  createdAt: string;
  updatedAt: string;
  postIds: string[];        // 专题内文章 ID 列表（有序）
  status: 'published' | 'draft';
  icon?: string;            // emoji 图标
  // 四大资源分区
  reports?: SeriesReport[];
  materials?: SeriesMaterial[];
  platforms?: SeriesPlatform[];
  tools?: SeriesTool[];
}

export interface Tag {
  id: string;
  name: string;
  count: number;
  color?: string;
}

export interface Reply {
  id: string;
  commentId: string;
  author: string;
  content: string;
  date: string;
}

export interface Comment {
  id: string;
  postId: string;
  author: string;
  email?: string;
  content: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  replies: Reply[];
  reviewedBy?: string;    // 审核人
  reviewedAt?: string;    // 审核时间
  reviewReason?: string;   // 拒绝原因（可选）
}
