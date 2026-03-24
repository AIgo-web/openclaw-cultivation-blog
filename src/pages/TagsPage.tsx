import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { tags, getTagColor } from '../data/tags';
import { posts } from '../data/posts';
import PostCard from '../components/PostCard';

export default function TagsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTag, setSelectedTag] = useState<string | null>(
    searchParams.get('tag')
  );

  useEffect(() => {
    const tag = searchParams.get('tag');
    setSelectedTag(tag);
  }, [searchParams]);

  const filteredPosts = selectedTag
    ? posts.filter(p => p.tags.includes(selectedTag))
    : [];

  const handleTagClick = (tagName: string) => {
    if (selectedTag === tagName) {
      setSelectedTag(null);
      setSearchParams({});
    } else {
      setSelectedTag(tagName);
      setSearchParams({ tag: tagName });
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <section className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          标签分类
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          共 {tags.length} 个标签，涵盖龙虾养殖全流程知识体系
        </p>
      </section>

      {/* Tags cloud */}
      <section className="card p-6 mb-10">
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
          所有标签
        </h2>
        <div className="flex flex-wrap gap-3">
          {tags.map(tag => (
            <button
              key={tag.name}
              onClick={() => handleTagClick(tag.name)}
              className={`
                tag-badge text-sm px-4 py-1.5 
                ${getTagColor(tag.name)}
                ${selectedTag === tag.name
                  ? 'ring-2 ring-lobster-400 ring-offset-2 dark:ring-offset-gray-900 scale-105'
                  : 'hover:scale-105'
                }
              `}
            >
              {tag.name}
              <span className="ml-1 opacity-60 text-xs">({tag.count})</span>
            </button>
          ))}
        </div>
      </section>

      {/* Category visualization */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          标签分布
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tags.sort((a, b) => b.count - a.count).map(tag => (
            <button
              key={tag.name}
              onClick={() => handleTagClick(tag.name)}
              className={`
                flex items-center justify-between p-3 rounded-xl border
                transition-all duration-200 text-left
                ${selectedTag === tag.name
                  ? 'border-lobster-300 dark:border-lobster-700 bg-lobster-50 dark:bg-lobster-900/20'
                  : 'border-gray-200 dark:border-gray-800 hover:border-lobster-200 dark:hover:border-lobster-800 bg-white dark:bg-[#1a1d27]'
                }
              `}
            >
              <span className={`tag-badge ${getTagColor(tag.name)}`}>
                {tag.name}
              </span>
              <div className="flex items-center gap-3">
                <div className="w-20 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-lobster-400 to-orange-400 rounded-full"
                    style={{ width: `${(tag.count / Math.max(...tags.map(t => t.count))) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-gray-400 dark:text-gray-500 w-8 text-right">
                  {tag.count}篇
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Filtered results */}
      {selectedTag && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              「{selectedTag}」的文章
              <span className="text-sm font-normal text-gray-400 dark:text-gray-500 ml-2">
                共 {filteredPosts.length} 篇
              </span>
            </h2>
            <button
              onClick={() => { setSelectedTag(null); setSearchParams({}); }}
              className="text-sm text-gray-400 hover:text-lobster-500 dark:text-gray-500 dark:hover:text-lobster-400 transition-colors"
            >
              清除筛选
            </button>
          </div>

          {filteredPosts.length > 0 ? (
            <div className="grid gap-5">
              {filteredPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="text-4xl">🦞</span>
              <p className="text-gray-400 dark:text-gray-500 mt-3">暂无相关文章</p>
            </div>
          )}
        </section>
      )}

      {!selectedTag && (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
          <span className="text-3xl">👆</span>
          <p className="mt-3 text-sm">点击上方标签查看相关文章</p>
          <Link to="/" className="text-lobster-500 hover:text-lobster-700 text-sm mt-2 inline-block">
            或者查看全部文章 →
          </Link>
        </div>
      )}
    </main>
  );
}
