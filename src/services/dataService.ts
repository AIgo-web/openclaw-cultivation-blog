/**
 * 数据管理服务
 * 提供导入、导出、备份、恢复等功能
 */

import type { Post } from '../types';
import type { Comment } from '../types';
import type { Tag } from '../types';

export interface BackupData {
  version: string;
  createdAt: string;
  posts: Post[];
  comments?: Comment[];
  tags?: Tag[];
  settings?: Record<string, unknown>;
}

const BACKUP_VERSION = '3.0.0';

/**
 * 导出单篇文章为 Markdown 格式
 */
export function exportPostToMarkdown(post: Post): string {
  const frontMatter = [
    '---',
    `title: "${post.title}"`,
    `date: "${post.date}"`,
    post.summary ? `summary: "${post.summary.replace(/"/g, '\\"')}"` : '',
    post.tags.length ? `tags: [${post.tags.map(t => `"${t}"`).join(', ')}]` : '',
    post.category ? `category: "${post.category}"` : '',
    post.coverImage ? `coverImage: "${post.coverImage}"` : '',
    post.status ? `status: "${post.status}"` : '',
    '---',
    '',
  ].filter(Boolean).join('\n');

  return `${frontMatter}${post.content}`;
}

/**
 * 导出所有数据为 JSON
 */
export function exportAllDataAsJSON(data: {
  posts: Post[];
  comments?: Comment[];
  tags?: Tag[];
  settings?: Record<string, unknown>;
}): string {
  const backup: BackupData = {
    version: BACKUP_VERSION,
    createdAt: new Date().toISOString(),
    ...data,
  };
  return JSON.stringify(backup, null, 2);
}

/**
 * 导出所有数据为压缩的 Base64 格式（用于安全传输）
 */
export function exportAllDataAsBase64(data: {
  posts: Post[];
  comments?: Comment[];
  tags?: Tag[];
  settings?: Record<string, unknown>;
}): string {
  const json = exportAllDataAsJSON(data);
  // 使用 btoa 进行 Base64 编码
  const base64 = btoa(unescape(encodeURIComponent(json)));
  return base64;
}

/**
 * 解析 Markdown 文件中的 frontmatter
 */
export function parseMarkdownFrontmatter(content: string): {
  frontmatter: Record<string, unknown>;
  body: string;
} {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: {}, body: content };
  }

  const [, frontmatterStr, body] = match;
  const frontmatter: Record<string, unknown> = {};

  // 简单的 YAML 解析（支持基本类型）
  frontmatterStr.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value: unknown = line.slice(colonIndex + 1).trim();

      // 去除引号
      if ((value as string).startsWith('"') && (value as string).endsWith('"')) {
        value = (value as string).slice(1, -1);
      } else if ((value as string).startsWith("'") && (value as string).endsWith("'")) {
        value = (value as string).slice(1, -1);
      }

      // 解析数组
      if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(item => {
          item = item.trim();
          if (item.startsWith('"') && item.endsWith('"')) {
            return item.slice(1, -1);
          }
          return item;
        });
      }

      frontmatter[key] = value;
    }
  });

  return { frontmatter, body };
}

/**
 * 从 Markdown 内容导入文章
 */
export function importPostFromMarkdown(content: string): Partial<Post> | null {
  try {
    const { frontmatter, body } = parseMarkdownFrontmatter(content);

    const post: Partial<Post> = {
      id: `imported-${Date.now()}`,
      title: (frontmatter.title as string) || '未命名文章',
      date: (frontmatter.date as string) || new Date().toISOString().split('T')[0],
      summary: (frontmatter.summary as string) || body.slice(0, 200).replace(/\n/g, ' ') + '...',
      content: body.trim(),
      tags: Array.isArray(frontmatter.tags) ? frontmatter.tags as string[] : [],
      category: frontmatter.category as string || 'tech',
      status: (frontmatter.status as 'published' | 'draft') || 'draft',
      coverImage: frontmatter.coverImage as string | undefined,
      readTime: Math.ceil(body.split(/\s+/).length / 200),
    };

    return post;
  } catch (error) {
    console.error('Failed to import markdown:', error);
    return null;
  }
}

/**
 * 验证备份数据格式
 */
export function validateBackupData(data: unknown): data is BackupData {
  if (typeof data !== 'object' || data === null) return false;
  
  const backup = data as BackupData;
  
  return (
    typeof backup.version === 'string' &&
    typeof backup.createdAt === 'string' &&
    Array.isArray(backup.posts) &&
    backup.posts.every(post => 
      typeof post.id === 'string' &&
      typeof post.title === 'string' &&
      typeof post.content === 'string'
    )
  );
}

/**
 * 解析导入的 JSON 备份数据
 */
export function parseBackupData(jsonString: string): BackupData | null {
  try {
    const data = JSON.parse(jsonString);
    
    if (!validateBackupData(data)) {
      console.error('Invalid backup format');
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to parse backup data:', error);
    return null;
  }
}

/**
 * 解码 Base64 备份数据
 */
export function decodeBackupData(base64String: string): BackupData | null {
  try {
    const json = decodeURIComponent(escape(atob(base64String)));
    return parseBackupData(json);
  } catch (error) {
    console.error('Failed to decode backup data:', error);
    return null;
  }
}

/**
 * 生成备份文件名
 */
export function generateBackupFilename(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10); // YYYY-MM-DD
  const timeStr = date.toTimeString().slice(0, 5).replace(':', '-'); // HH-MM
  return `lobster-blog-backup-${dateStr}-${timeStr}`;
}

/**
 * 下载文件
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 读取文件内容
 */
export function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * 合并导入的数据与现有数据
 */
export function mergeBackupData(
  existing: { posts: Post[]; comments?: Comment[] },
  backup: BackupData,
  options: {
    overwriteExisting?: boolean;
    mergeComments?: boolean;
  } = {}
): { posts: Post[]; comments?: Comment[] } {
  const { overwriteExisting = false, mergeComments = true } = options;

  let posts = [...existing.posts];

  for (const backupPost of backup.posts) {
    const existingIndex = posts.findIndex(p => p.id === backupPost.id);
    
    if (existingIndex >= 0) {
      if (overwriteExisting) {
        posts[existingIndex] = backupPost;
      }
      // else: 跳过已存在的文章
    } else {
      posts.push(backupPost);
    }
  }

  let comments = existing.comments;
  if (mergeComments && backup.comments && backup.comments.length > 0) {
    comments = comments || [];
    for (const backupComment of backup.comments) {
      if (!comments.find(c => c.id === backupComment.id)) {
        comments.push(backupComment);
      }
    }
  }

  return { posts, comments };
}
