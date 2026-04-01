import { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import { usePosts } from '../contexts/PostsContext';
import { tags, getTagColor } from '../data/tags';
import { categories } from '../data/categories';
import { Link } from 'react-router-dom';
import HotSeriesWidget from '../components/HotSeriesWidget';

const BLOG_NAME = 'OpenClaw 龙虾养成计划';
const BLOG_DESC = '记录 OpenClaw AI Agent 的折腾历程、技巧心得与踩坑实录，涵盖 Skill 开发、QQ Bot 集成、Automation 自动化配置与工作记忆设计。';
const BLOG_URL = 'https://aievolution.site';

const PAGE_SIZE = 6;

// SEO 辅助函数
function setMeta(name: string, content: string, type: 'name' | 'property' = 'name'): void {
  if (!content) return;
  const selector = type === 'property'
    ? `meta[property="${name}"]`
    : `meta[name="${name}"]`;
  let el = document.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    if (type === 'property') el.setAttribute('property', name);
    else el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setCanonical(url: string): void {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = url;
}

export default function HomePage() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const { posts } = usePosts();

  // SEO 元数据初始化
  useEffect(() => {
    document.title = `${BLOG_NAME} | AI Agent 折腾笔记与技能开发教程`;
    setMeta('description', BLOG_DESC);
    setMeta('author', 'OpenClaw 折腾人');
    setMeta('og:title', `${BLOG_NAME} | AI Agent 折腾笔记与技能开发教程`, 'property');
    setMeta('og:description', BLOG_DESC, 'property');
    setMeta('og:url', BLOG_URL, 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('og:site_name', BLOG_NAME, 'property');
    setMeta('twitter:card', 'summary_large_image', 'name');
    setMeta('twitter:title', `${BLOG_NAME} | AI Agent 折腾笔记与技能开发教程`, 'name');
    setMeta('twitter:description', BLOG_DESC, 'name');
    setCanonical(BLOG_URL);
  }, []);

  const filteredPosts = posts.filter(p => {
    const isPublished = !p.status || p.status === 'published';
    const matchTag = !selectedTag || p.tags.includes(selectedTag);
    const matchCategory = !selectedCategory || p.category === selectedCategory;
    return isPublished && matchTag && matchCategory;
  });

  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  // 切换筛选时重置显示数量
  const handleTagChange = (tag: string | null) => {
    setSelectedTag(tag);
    setVisibleCount(PAGE_SIZE);
  };
  const handleCategoryChange = (cat: string | null) => {
    setSelectedCategory(cat);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Hero */}
      <section className="mb-8 sm:mb-12 text-center">
        <div className="inline-flex items-center gap-3 mb-3">
          <span className="text-5xl sm:text-6xl lobster-swim inline-block">🦞</span>
        </div>
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3">
          OpenClaw<span className="text-lobster-500">龙虾养成计划</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed px-2">
          记录 OpenClaw AI Agent 的折腾历程、技巧心得与踩坑实录。
          从配置到开发，从 Skill 扩展到自动化工作流，一起把这只龙虾养大。
        </p>

        {/* Stats */}
        <div className="flex items-center justify-center gap-6 sm:gap-8 mt-6">
          {[
            { label: '篇文章', value: posts.length },
            { label: '个标签', value: tags.length },
            { label: '分钟阅读', value: posts.reduce((a, p) => a + p.readTime, 0) },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-lobster-500">{stat.value}</div>
              <div className="text-xs text-gray-400 dark:text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* ── Left: main content ── */}
        <main className="flex-1 min-w-0">
          {/* Category filter */}
          <section className="mb-8">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400 mr-1">分类：</span>
              <button
                onClick={() => handleCategoryChange(null)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === null
                    ? 'bg-lobster-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                全部
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(selectedCategory === cat.id ? null : cat.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'ring-2 ring-offset-1 ring-lobster-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </section>

          {/* Tag filter */}
          <section className="mb-8">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400 mr-1">筛选：</span>
              <button
                onClick={() => handleTagChange(null)}
                className={`tag-badge transition-all ${
                  selectedTag === null
                    ? 'bg-lobster-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                全部
              </button>
              {tags.slice(0, 8).map(tag => (
                <button
                  key={tag.name}
                  onClick={() => handleTagChange(selectedTag === tag.name ? null : tag.name)}
                  className={`tag-badge ${
                    selectedTag === tag.name
                      ? 'ring-2 ring-lobster-400 ' + getTagColor(tag.name)
                      : getTagColor(tag.name)
                  }`}
                >
                  {tag.name}
                  <span className="opacity-60">({tag.count})</span>
                </button>
              ))}
              <Link
                to="/tags"
                className="text-sm text-lobster-500 hover:text-lobster-700 dark:text-lobster-400 ml-1"
              >
                查看全部 →
              </Link>
            </div>
          </section>

          {/* Post list */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {selectedCategory || selectedTag
                  ? `${selectedCategory ? categories.find(c => c.id === selectedCategory)?.name + ' · ' : ''}${selectedTag ? `「${selectedTag}」相关` : ''}文章`
                  : '全部文章'}
                <span className="text-sm font-normal text-gray-400 dark:text-gray-500 ml-2">
                  共 {filteredPosts.length} 篇
                </span>
              </h2>
            </div>

            {visiblePosts.length > 0 ? (
              <>
                <div className="grid gap-5">
                  {visiblePosts.map(post => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
                {hasMore && (
                  <div className="text-center mt-8">
                    <button
                      onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                      className="px-6 py-2.5 rounded-full border border-lobster-300 text-lobster-500 hover:bg-lobster-50 dark:border-lobster-700 dark:text-lobster-400 dark:hover:bg-lobster-900/20 text-sm font-medium transition-colors"
                    >
                      加载更多 ({filteredPosts.length - visibleCount} 篇)
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <span className="text-4xl">🦞</span>
                <p className="text-gray-400 dark:text-gray-500 mt-4">暂无相关文章</p>
              </div>
            )}
          </section>
        </main>

        {/* ── Right: sticky sidebar ── */}
        <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0 lg:sticky lg:top-20 self-start">
          <div className="bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 backdrop-blur-sm">
            <HotSeriesWidget />
          </div>
        </aside>
      </div>
    </div>
  );
}
