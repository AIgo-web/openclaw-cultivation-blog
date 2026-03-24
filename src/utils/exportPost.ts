import type { Post } from '../types';
import { getCategoryName } from '../data/categories';

/**
 * 导出单篇文章为 Markdown 格式字符串
 */
export function postToMarkdown(post: Post): string {
  const frontmatter = [
    '---',
    `title: "${post.title.replace(/"/g, '\\"')}"`,
    `date: ${post.date}`,
    `tags: [${post.tags.map(t => `"${t}"`).join(', ')}]`,
    post.category ? `category: ${getCategoryName(post.category)}` : null,
    `status: ${post.status || 'published'}`,
    `readTime: ${post.readTime}`,
    `summary: "${(post.summary || '').replace(/"/g, '\\"')}"`,
    '---',
  ].filter(Boolean).join('\n');

  return `${frontmatter}\n\n${post.content}`;
}

/**
 * 触发浏览器下载文件
 */
export function downloadFile(content: string, filename: string, mimeType = 'text/markdown;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 生成安全的文件名（去掉特殊字符）
 */
export function safeFilename(title: string): string {
  return title
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
    .trim();
}

/**
 * 导出单篇文章
 */
export function exportPost(post: Post) {
  const md = postToMarkdown(post);
  const filename = `${safeFilename(post.title)}.md`;
  downloadFile(md, filename);
}

/**
 * 批量导出多篇文章（逐个下载）
 */
export async function exportPosts(posts: Post[]) {
  for (let i = 0; i < posts.length; i++) {
    exportPost(posts[i]);
    // 小延迟防止浏览器阻止多次下载
    if (i < posts.length - 1) {
      await new Promise(r => setTimeout(r, 300));
    }
  }
}
