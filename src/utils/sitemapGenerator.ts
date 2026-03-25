/**
 * Sitemap 生成工具
 * 用于构建时生成静态 sitemap.xml
 */

import type { Post } from '../types';
import { generateSitemap, type SitemapUrl } from '../services/seoService';

const BLOG_URL = 'https://openclaw.ai';

export interface SitemapConfig {
  siteUrl: string;
  posts: Post[];
  lastMod?: Date;
}

/**
 * 生成完整的网站地图
 */
export function generateSitemapXML(posts: Post[], siteUrl: string = BLOG_URL): string {
  const urls: SitemapUrl[] = [];
  const now = new Date().toISOString().split('T')[0];

  // 首页
  urls.push({
    url: siteUrl,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 1.0,
  });

  // 关于页面
  urls.push({
    url: `${siteUrl}/about`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  });

  // 标签页面
  urls.push({
    url: `${siteUrl}/tags`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  });

  // 文章页面
  posts
    .filter(post => post.status !== 'draft')
    .forEach(post => {
      urls.push({
        url: `${siteUrl}/post/${post.id}`,
        lastModified: post.date,
        changeFrequency: 'monthly',
        priority: post.coverImage ? 0.9 : 0.8,
      });
    });

  return generateSitemap(urls);
}

/**
 * 生成 robots.txt
 */
export function generateRobotsTxt(siteUrl: string): string {
  return `User-agent: *
Allow: /
Disallow: /admin/

# Sitemap
Sitemap: ${siteUrl}/sitemap.xml

# Crawl-delay (optional, be nice to small sites)
Crawl-delay: 1
`;
}

/**
 * 生成 Atom Feed（替代 RSS）
 */
export function generateAtomFeed(posts: Post[], blogInfo: {
  title: string;
  description: string;
  link: string;
}): string {
  const updated = posts
    .filter(p => p.status !== 'draft')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date || new Date().toISOString();

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(blogInfo.title)}</title>
  <subtitle>${escapeXml(blogInfo.description)}</subtitle>
  <link href="${blogInfo.link}/feed.xml" rel="self"/>
  <link href="${blogInfo.link}"/>
  <id>${blogInfo.link}/</id>
  <updated>${new Date(updated).toISOString()}</updated>
  ${posts
    .filter(post => post.status !== 'draft')
    .slice(0, 20)
    .map(post => `
  <entry>
    <title>${escapeXml(post.title)}</title>
    <link href="${blogInfo.link}/post/${post.id}"/>
    <id>${blogInfo.link}/post/${post.id}</id>
    <published>${new Date(post.date).toISOString()}</published>
    <updated>${new Date(post.date).toISOString()}</updated>
    <summary>${escapeXml(post.summary)}</summary>
    ${post.tags.map(tag => `<category term="${escapeXml(tag)}"/>`).join('\n    ')}
  </entry>`).join('')}
</feed>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
