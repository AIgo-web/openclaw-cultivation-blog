/**
 * SEO 工具服务
 * 提供动态 Meta 标签、结构化数据、Open Graph 等 SEO 功能
 */

export const BLOG_URL = 'https://aievolution.site';

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  author?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
}

// 默认博客信息
const BLOG_INFO = {
  name: 'OpenClaw 龙虾养成计划',
  description: '记录 OpenClaw AI Agent 的折腾历程、技巧心得与踩坑实录。',
  url: 'https://openclaw.ai',
  author: 'OpenClaw 折腾人',
};

/**
 * 生成完整的 Meta 标签配置
 */
export function generateSEOMetadata(overrides: Partial<SEOMetadata> = {}): SEOMetadata {
  return {
    ...BLOG_INFO,
    ...overrides,
  };
}

/**
 * 应用 SEO Meta 标签到页面
 */
export function applySEOMeta(metadata: SEOMetadata): () => void {
  const previous: Record<string, string> = {};

  // 保存之前的值以便恢复
  const metaFields = [
    'title',
    'description',
    'keywords',
    'author',
    'og:title',
    'og:description',
    'og:image',
    'og:url',
    'og:type',
    'article:published_time',
    'article:modified_time',
    'article:tag',
    'twitter:card',
    'twitter:title',
    'twitter:description',
    'twitter:image',
  ];

  metaFields.forEach(field => {
    const selector = field.includes(':') 
      ? `meta[property="${field}"]` 
      : field === 'title'
        ? 'title'
        : `meta[name="${field}"]`;
    
    const el = document.querySelector(selector);
    if (el) {
      const key = field === 'title' ? 'title' : (el as HTMLMetaElement).name || (el as HTMLMetaElement).getAttribute('property') || '';
      previous[key] = (el as HTMLMetaElement).content;
    }
  });

  // 设置新的值
  if (metadata.title) {
    document.title = `${metadata.title} - ${BLOG_INFO.name}`;
  }

  setMetaTag('description', metadata.description);
  setMetaTag('keywords', metadata.keywords?.join(', ') || '');
  setMetaTag('author', metadata.author || BLOG_INFO.author);

  // Open Graph
  setMetaTag('og:title', metadata.title || BLOG_INFO.name, 'property');
  setMetaTag('og:description', metadata.description, 'property');
  setMetaTag('og:image', metadata.image || '', 'property');
  setMetaTag('og:url', metadata.url || '', 'property');
  setMetaTag('og:type', metadata.type || 'website', 'property');
  setMetaTag('og:site_name', BLOG_INFO.name, 'property');

  // Article specific
  if (metadata.type === 'article') {
    setMetaTag('article:published_time', metadata.publishedTime || '', 'property');
    setMetaTag('article:modified_time', metadata.modifiedTime || '', 'property');
    
    // 清除旧的 tags，添加新的
    document.querySelectorAll('meta[property="article:tag"]').forEach(el => el.remove());
    metadata.tags?.forEach(tag => {
      const tagEl = document.createElement('meta');
      tagEl.setAttribute('property', 'article:tag');
      tagEl.content = tag;
      document.head.appendChild(tagEl);
    });
  }

  // Twitter Card
  setMetaTag('twitter:card', 'summary_large_image', 'name');
  setMetaTag('twitter:title', metadata.title || BLOG_INFO.name, 'name');
  setMetaTag('twitter:description', metadata.description, 'name');
  setMetaTag('twitter:image', metadata.image || '', 'name');

  // 返回清理函数
  return () => {
    // 恢复之前的值（如果需要）
    Object.entries(previous).forEach(([key, value]) => {
      if (key === 'title') {
        document.title = value;
      } else {
        const selector = key.includes(':')
          ? `meta[property="${key}"]`
          : `meta[name="${key}"]`;
        const el = document.querySelector(selector);
        if (el) {
          (el as HTMLMetaElement).content = value;
        }
      }
    });
  };
}

function setMetaTag(name: string, content: string, type: 'name' | 'property' = 'name'): void {
  if (!content) return;
  
  const selector = type === 'property' 
    ? `meta[property="${name}"]` 
    : `meta[name="${name}"]`;
  
  let el = document.querySelector(selector) as HTMLMetaElement | null;
  
  if (!el) {
    el = document.createElement('meta');
    if (type === 'property') {
      el.setAttribute('property', name);
    } else {
      el.setAttribute('name', name);
    }
    document.head.appendChild(el);
  }
  
  el.content = content;
}

/**
 * 生成 JSON-LD 结构化数据
 */
export function generateArticleSchema(article: {
  title: string;
  description: string;
  url: string;
  image?: string;
  author: string;
  publishedTime: string;
  modifiedTime?: string;
  tags?: string[];
}): string {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    url: article.url,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: BLOG_INFO.name,
      url: BLOG_INFO.url,
    },
    datePublished: article.publishedTime,
    dateModified: article.modifiedTime || article.publishedTime,
  };

  if (article.image) {
    schema.image = article.image;
  }

  if (article.tags && article.tags.length > 0) {
    schema.keywords = article.tags.join(', ');
  }

  return JSON.stringify(schema);
}

/**
 * 生成网站地图结构
 */
export interface SitemapUrl {
  url: string;
  lastModified?: string;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export function generateSitemap(urls: SitemapUrl[]): string {
  const baseUrl = BLOG_INFO.url;
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(item => `  <url>
    <loc>${item.url}</loc>
    ${item.lastModified ? `<lastmod>${item.lastModified}</lastmod>` : ''}
    ${item.changeFrequency ? `<changefreq>${item.changeFrequency}</changefreq>` : ''}
    ${item.priority !== undefined ? `<priority>${item.priority.toFixed(1)}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;
  
  return xml;
}

/**
 * 注入结构化数据脚本到页面
 */
export function injectStructuredData(schema: string, id: string = 'structured-data'): () => void {
  const existing = document.getElementById(id);
  if (existing) {
    existing.remove();
  }

  const script = document.createElement('script');
  script.id = id;
  script.type = 'application/ld+json';
  script.textContent = schema;
  document.head.appendChild(script);

  return () => {
    script.remove();
  };
}

/**
 * 生成面包屑结构化数据
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
  return JSON.stringify(schema);
}

/**
 * 生成作者个人信息（用于 About 页面）
 */
export function generatePersonSchema(): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'OpenClaw 折腾人',
    url: BLOG_URL,
    description: 'AI Agent 爱好者，OpenClaw 深度用户，专注于 AI 自动化与工作流配置',
    sameAs: [
      'https://github.com/AIgo-web',
    ],
    knowsAbout: [
      'OpenClaw AI Agent',
      'Skill 开发',
      'QQ Bot 集成',
      'Automation 自动化',
      '工作记忆设计',
    ],
  };
  return JSON.stringify(schema);
}

/**
 * 设置 canonical URL
 */
export function setCanonicalUrl(url: string): void {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = url;
}

/**
 * 生成网站导航结构化数据
 */
export function generateSiteNavigationSchema(): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BLOG_INFO.name,
    url: BLOG_INFO.url,
    description: BLOG_INFO.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BLOG_INFO.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
  return JSON.stringify(schema);
}
