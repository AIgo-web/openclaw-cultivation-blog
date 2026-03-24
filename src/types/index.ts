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
}
