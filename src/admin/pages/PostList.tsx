import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, CheckSquare, Square, Minus, Download } from 'lucide-react';
import { useDarkMode } from '../../hooks/useDarkMode';
import { usePosts } from '../../contexts/PostsContext';
import { exportPosts } from '../../utils/exportPost';

export const PostList: React.FC = () => {
  const { isDark } = useDarkMode();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { posts, deletePost } = usePosts();

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAllSelected = filteredPosts.length > 0 && filteredPosts.every(p => selectedIds.has(p.id));
  const isPartialSelected = filteredPosts.some(p => selectedIds.has(p.id)) && !isAllSelected;

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPosts.map(p => p.id)));
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这篇文章吗？')) {
      deletePost(id);
      setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
      alert('删除成功');
    }
  };

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;
    if (confirm(`确定要删除选中的 ${selectedIds.size} 篇文章吗？此操作不可恢复。`)) {
      selectedIds.forEach(id => deletePost(id));
      setSelectedIds(new Set());
      alert(`已删除 ${selectedIds.size} 篇文章`);
    }
  };

  const handleBatchExport = () => {
    if (selectedIds.size === 0) return;
    const toExport = posts.filter(p => selectedIds.has(p.id));
    exportPosts(toExport);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          } mb-2`}>
            文章管理
          </h1>
          <p className={`text-lg ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            管理博客文章内容
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/posts/new')}
          className="px-4 py-2 bg-lobster-500 hover:bg-lobster-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          新建文章
        </button>
      </div>

      {/* Search */}
      <div className={`
        p-4 rounded-lg
        ${isDark ? 'bg-gray-900' : 'bg-white'}
        border border-gray-200 dark:border-gray-800
      `}>
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
            isDark ? 'text-gray-500' : 'text-gray-400'
          }`} />
          <input
            type="text"
            placeholder="搜索文章标题或摘要..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`
              w-full pl-10 pr-4 py-2 rounded-lg border
              ${isDark 
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-lobster-500
            `}
          />
        </div>
      </div>

      {/* Batch Action Bar */}
      {selectedIds.size > 0 && (
        <div className={`
          flex items-center justify-between px-5 py-3 rounded-lg
          bg-lobster-50 dark:bg-lobster-900/30
          border border-lobster-200 dark:border-lobster-800
        `}>
          <span className="text-sm font-medium text-lobster-700 dark:text-lobster-300">
            已选中 {selectedIds.size} 篇文章
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              取消选择
            </button>
            <button
              onClick={handleBatchExport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              导出 .md
            </button>
            <button
              onClick={handleBatchDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              批量删除
            </button>
          </div>
        </div>
      )}

      {/* Posts Table */}
      <div className={`
        rounded-lg overflow-hidden
        ${isDark ? 'bg-gray-900' : 'bg-white'}
        border border-gray-200 dark:border-gray-800
      `}>
        <table className="w-full">
          <thead className={`
            ${isDark ? 'bg-gray-800' : 'bg-gray-50'}
          `}>
            <tr>
              <th className="px-4 py-4 w-12">
                <button onClick={toggleSelectAll} className="text-gray-400 dark:text-gray-500 hover:text-lobster-500 transition-colors">
                  {isAllSelected 
                    ? <CheckSquare className="w-5 h-5 text-lobster-500" />
                    : isPartialSelected 
                      ? <Minus className="w-5 h-5" />
                      : <Square className="w-5 h-5" />
                  }
                </button>
              </th>
              <th className={`px-6 py-4 text-left text-sm font-semibold ${
                isDark ? 'text-gray-300' : 'text-gray-900'
              }`}>
                文章标题
              </th>
              <th className={`px-6 py-4 text-left text-sm font-semibold ${
                isDark ? 'text-gray-300' : 'text-gray-900'
              }`}>
                发布日期
              </th>
              <th className={`px-6 py-4 text-left text-sm font-semibold ${
                isDark ? 'text-gray-300' : 'text-gray-900'
              }`}>
                状态
              </th>
              <th className={`px-6 py-4 text-left text-sm font-semibold ${
                isDark ? 'text-gray-300' : 'text-gray-900'
              }`}>
                标签
              </th>
              <th className={`px-6 py-4 text-right text-sm font-semibold ${
                isDark ? 'text-gray-300' : 'text-gray-900'
              }`}>
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.map((post) => (
              <tr 
                key={post.id}
                className={`border-t border-gray-200 dark:border-gray-800 transition-colors ${
                  selectedIds.has(post.id)
                    ? isDark ? 'bg-lobster-900/20' : 'bg-lobster-50'
                    : isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                }`}
              >
                <td className="px-4 py-4">
                  <button onClick={() => toggleSelect(post.id)} className="text-gray-400 dark:text-gray-500 hover:text-lobster-500 transition-colors">
                    {selectedIds.has(post.id)
                      ? <CheckSquare className="w-5 h-5 text-lobster-500" />
                      : <Square className="w-5 h-5" />
                    }
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className={`font-medium ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {post.title}
                    </p>
                    <p className={`text-sm mt-1 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    } line-clamp-1`}>
                      {post.summary}
                    </p>
                  </div>
                </td>
                <td className={`px-6 py-4 text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {post.date}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    (!post.status || post.status === 'published')
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                  }`}>
                    {(!post.status || post.status === 'published') ? '✅ 已发布' : '📝 草稿'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className={`px-2 py-1 text-xs rounded-full ${
                          isDark 
                            ? 'bg-lobster-500/20 text-lobster-400' 
                            : 'bg-lobster-100 text-lobster-700'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                    {post.tags.length > 3 && (
                      <span className={`text-xs ${
                        isDark ? 'text-gray-500' : 'text-gray-600'
                      }`}>
                        +{post.tags.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => navigate(`/admin/posts/edit/${post.id}`)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDark 
                          ? 'text-gray-400 hover:bg-gray-700 hover:text-white' 
                          : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                      }`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDark 
                          ? 'text-gray-400 hover:bg-red-900/30 hover:text-red-400' 
                          : 'text-gray-600 hover:bg-red-100 hover:text-red-600'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredPosts.length === 0 && (
          <div className="p-12 text-center">
            <p className={`text-lg ${
              isDark ? 'text-gray-500' : 'text-gray-600'
            }`}>
              没有找到匹配的文章
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
