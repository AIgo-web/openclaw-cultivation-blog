import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchPosts, highlightSearchTerm, generateSearchPreview, validateSearchInput, sanitizeSearchInput } from '../utils/search';
import { useToast } from '../contexts/ToastContext';
import { useSearch } from '../contexts/SearchContext';
import { usePosts } from '../contexts/PostsContext';

export const SearchBar: React.FC = () => {
  const { isOpen, closeSearch } = useSearch();
  const [query, setQuery] = useState('');
  const { showToast } = useToast();
  const { posts } = usePosts();
  const inputRef = useRef<HTMLInputElement>(null);

  // 当搜索栏打开时自动获得焦点
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // ✅ 防抖搜索 - 使用动态 posts 数据（含 localStorage 新建文章）
  const results = useMemo(() => {
    if (!query.trim()) {
      return [];
    }

    if (!validateSearchInput(query)) {
      return [];
    }

    return searchPosts(query, posts);
  }, [query, posts]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const sanitized = sanitizeSearchInput(value);
    setQuery(sanitized);

    // 验证不通过时提示用户
    if (value !== sanitized || !validateSearchInput(sanitized)) {
      if (sanitized.length > 200) {
        showToast('搜索内容过长（最多 200 字符）', 'warning', 2000);
      }
    }
  }, [showToast]);

  const handleClear = useCallback(() => {
    setQuery('');
  }, []);

  const handleClose = useCallback(() => {
    setQuery('');
    closeSearch();
  }, [closeSearch]);

  return (
    <div className="relative w-full">
      {/* Search input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="搜索文章... (Cmd+K)"
          value={query}
          onChange={handleSearch}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lobster-500 transition-all"
          maxLength={200}
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* Search results dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={handleClose}
          />

          {/* Results */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-20 max-h-96 overflow-y-auto">
            {query.trim() === '' ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <p className="text-sm">输入关键词开始搜索</p>
              </div>
            ) : results.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <p className="text-sm">未找到相关文章</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {results.map(post => (
                  <Link
                    key={post.id}
                    to={`/post/${post.id}`}
                    onClick={handleClose}
                    className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-lobster-500 transition-colors">
                      {highlightSearchTerm(post.title, query).map((part, i) =>
                        part.type === 'highlight' ? (
                          <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 font-semibold">
                            {part.content}
                          </mark>
                        ) : (
                          <span key={i}>{part.content}</span>
                        )
                      )}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {post.excerpt
                        ? generateSearchPreview(post.excerpt, query, 80)
                        : generateSearchPreview(post.content.replace(/#\s/g, ''), query, 80)}
                    </p>
                    {post.tags.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {post.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                        {post.tags.length > 2 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">+{post.tags.length - 2}</span>
                        )}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
            <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 text-right">
              {results.length > 0 && `共 ${results.length} 项结果`}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
