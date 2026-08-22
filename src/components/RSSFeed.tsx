/**
 * RSS 订阅组件
 * 生成博客 RSS Feed
 */

import React from 'react';
import { Rss } from 'lucide-react';
import type { Post } from '../types';

interface RSSFeedProps {
  posts: Post[];
  blogInfo?: {
    title?: string;
    description?: string;
    link?: string;
  };
}

export const RSSFeed: React.FC<RSSFeedProps> = ({
  posts,
  blogInfo = {
    title: 'OpenClaw 龙虾养成计划',
    description: '记录 OpenClaw AI Agent 的折腾历程',
    link: 'https://openclaw.ai',
  },
}) => {
  /**
   * 生成 RSS 2.0 XML
   */
  const generateRSS = () => {
    const items = posts
      .filter(post => post.status !== 'draft')
      .slice(0, 20) // 限制最新 20 篇
      .map(post => {
        const pubDate = new Date(post.date).toUTCString();
        const categories = post.tags.map(tag => `<category>${escapeXml(tag)}</category>`).join('');
        const description = escapeXml(post.summary);
        const content = escapeXml(post.content);
        
        return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${blogInfo.link}/post/${post.id}</link>
      <guid isPermaLink="true">${blogInfo.link}/post/${post.id}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${description}]]></description>
      <content:encoded><![CDATA[${content}]]></content:encoded>
      ${categories}
      ${post.coverImage ? `<enclosure url="${post.coverImage}" type="image/jpeg" />` : ''}
    </item>`;
      })
      .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(blogInfo.title || '')}</title>
    <link>${blogInfo.link}</link>
    <description>${escapeXml(blogInfo.description || '')}</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${blogInfo.link}/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${blogInfo.link}/favicon.ico</url>
      <title>${escapeXml(blogInfo.title || '')}</title>
      <link>${blogInfo.link}</link>
    </image>${items}
  </channel>
</rss>`;
  };

  const escapeXml = (str: string): string => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const rssUrl = '/feed.xml';

  return (
    <a
      href={rssUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-900/50 rounded-full transition-colors"
      title="订阅 RSS Feed"
    >
      <Rss className="w-3.5 h-3.5" />
      RSS
    </a>
  );
};

/**
 * 生成静态 RSS 文件（供构建时调用）
 */
export function generateStaticRSS(posts: Post[], blogInfo: {
  title: string;
  description: string;
  link: string;
}): string {
  const items = posts
    .filter(post => post.status !== 'draft')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 50)
    .map(post => {
      const pubDate = new Date(post.date).toUTCString();
      const categories = post.tags.map(tag => `<category>${escapeXml(tag)}</category>`).join('');
      const description = escapeXml(post.summary);
      const content = escapeXml(post.content);
      
      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${blogInfo.link}/post/${post.id}</link>
      <guid isPermaLink="true">${blogInfo.link}/post/${post.id}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${description}]]></description>
      <content:encoded><![CDATA[${content}]]></content:encoded>
      ${categories}
      ${post.coverImage ? `<enclosure url="${post.coverImage}" type="image/jpeg" />` : ''}
    </item>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(blogInfo.title)}</title>
    <link>${blogInfo.link}</link>
    <description>${escapeXml(blogInfo.description)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${blogInfo.link}/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${blogInfo.link}/favicon.ico</url>
      <title>${escapeXml(blogInfo.title)}</title>
      <link>${blogInfo.link}</link>
    </image>${items}
  </channel>
</rss>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default RSSFeed;
