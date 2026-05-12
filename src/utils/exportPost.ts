import type { Post } from '../types';
import { getCategoryName } from '../data/categories';
import JSZip from 'jszip';

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
 * 批量导出多篇文章为 ZIP 打包下载
 * @param posts 要导出的文章列表
 * @param zipFilename ZIP 文件名（默认 lobster-blog-export.zip）
 */
export async function exportPostsAsZip(posts: Post[], zipFilename = 'lobster-blog-export.zip'): Promise<void> {
  const zip = new JSZip();

  for (const post of posts) {
    const md = postToMarkdown(post);
    const filename = `${safeFilename(post.title)}.md`;
    zip.file(filename, md);
  }

  // 添加导出时间信息
  const manifest = {
    exportedAt: new Date().toISOString(),
    count: posts.length,
    posts: posts.map(p => ({ title: p.title, date: p.date, id: p.id })),
  };
  zip.file('_manifest.json', JSON.stringify(manifest, null, 2));

  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = zipFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 批量导出多篇文章（逐个下载，兼容旧版）
 * @deprecated 推荐使用 exportPostsAsZip
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
