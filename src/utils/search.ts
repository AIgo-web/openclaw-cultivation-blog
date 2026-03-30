import type { Post } from '../types';

// ✅ 安全防护常量
const MAX_SEARCH_LENGTH = 200;
const MAX_SEARCH_RESULTS = 50;
const MAX_SEARCH_TERMS = 5;

/**
 * 清理搜索输入 - XSS 防护
 * ✅ 移除尖括号、限制长度
 */
export function sanitizeSearchInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .slice(0, MAX_SEARCH_LENGTH);
}

/**
 * 验证搜索输入 - 防止恶意输入
 * ✅ 检查长度、特殊字符、词数
 */
export function validateSearchInput(query: string): boolean {
  // 空查询是合法的
  if (!query || query.trim().length === 0) return true;

  // 检查长度
  if (query.length > MAX_SEARCH_LENGTH) return false;

  // 检查词数
  const terms = query.trim().split(/\s+/);
  if (terms.length > MAX_SEARCH_TERMS) return false;

  // 检查是否只包含允许的字符（中文、英文、数字、基本标点）
  const allowedChars = /^[\w\s\-\.，。、；：！？「」【】（）\u4e00-\u9fff]*$/u;
  if (!allowedChars.test(query)) return false;

  return true;
}

/**
 * 搜索文章 - 支持标题、摘要、标签搜索
 * ✅ 接收动态 posts 数组，支持 localStorage 中新建的文章
 * ✅ 忽略大小写
 * ✅ 返回限制数量的结果
 */
export function searchPosts(query: string, posts: Post[]) {
  const sanitized = sanitizeSearchInput(query).toLowerCase().trim();

  if (!sanitized) {
    return [];
  }

  const searchTerms = sanitized.split(/\s+/);

  const results = posts
    .filter(post => post.status === 'published')
    .map(post => {
      let score = 0;
      const titleLower = post.title.toLowerCase();
      const excerptLower = (post.excerpt || '').toLowerCase();
      const tagsLower = post.tags.map(t => t.toLowerCase());

      searchTerms.forEach(term => {
        // 标题匹配权重最高
        if (titleLower.includes(term)) {
          score += 10;
          if (titleLower.startsWith(term)) score += 5;
        }
        // 摘要匹配
        if (excerptLower.includes(term)) {
          score += 5;
        }
        // 标签匹配
        if (tagsLower.some(t => t.includes(term))) {
          score += 3;
        }
      });

      return { post, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_SEARCH_RESULTS)
    .map(({ post }) => post);

  return results;
}

/**
 * 生成搜索摘要 - 从内容中提取相关片段
 * ✅ 显示关键词周围的上下文
 */
export function generateSearchPreview(content: string, query: string, previewLength = 100): string {
  const sanitized = sanitizeSearchInput(query).toLowerCase();
  if (!sanitized) return content.slice(0, previewLength) + '...';

  const index = content.toLowerCase().indexOf(sanitized);
  if (index === -1) {
    return content.slice(0, previewLength) + '...';
  }

  const start = Math.max(0, index - 30);
  const end = Math.min(content.length, index + previewLength);
  const preview = content.slice(start, end);

  return (start > 0 ? '...' : '') + preview + (end < content.length ? '...' : '');
}

/**
 * 高亮搜索结果 - 返回标记位置信息
 * ✅ 返回数组，由组件处理 JSX 渲染
 */
export function highlightSearchTerm(text: string, query: string): Array<{ type: 'highlight' | 'text'; content: string }> {
  const sanitized = sanitizeSearchInput(query).toLowerCase();
  if (!sanitized) return [{ type: 'text', content: text }];

  const parts = text.split(new RegExp(`(${sanitized})`, 'gi'));
  return parts
    .filter(p => p) // 过滤空字符串
    .map((part) => ({
      type: part.toLowerCase() === sanitized ? 'highlight' : 'text',
      content: part
    }));
}
