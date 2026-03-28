import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Home } from 'lucide-react';
import { useDarkMode } from '../../hooks/useDarkMode';
import { tags, addTag, deleteTag } from '../../data/tags';

export const TagManager: React.FC = () => {
  const { isDark } = useDarkMode();
  const [newTagName, setNewTagName] = useState('');
  const [tagList, setTagList] = useState(tags);

  // 当 tags 变化时（从 localStorage 重新加载），更新本地状态
  useEffect(() => {
    setTagList([...tags]);
  }, []);

  const handleAddTag = () => {
    if (!newTagName.trim()) {
      alert('请输入标签名称');
      return;
    }

    const newTag = addTag(newTagName.trim());
    if (newTag) {
      setTagList([...tags]);
      setNewTagName('');
      alert(`标签「${newTag.name}」添加成功`);
    } else {
      alert('标签已存在');
    }
  };

  const handleDeleteTag = (id: string) => {
    if (confirm('确定要删除这个标签吗？')) {
      deleteTag(id);
      setTagList([...tags]);
      alert('标签删除成功');
    }
  };

  const handleOpenHome = () => {
    const homeUrl = window.location.origin;
    window.open(homeUrl, 'blog-home', 'width=1200,height=800,scrollbars=yes,resizable=yes');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          } mb-2`}>
            标签管理
          </h1>
          <p className={`text-lg ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            管理博客标签
          </p>
        </div>
        <button
          onClick={handleOpenHome}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 border ${
            isDark
              ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
              : 'border-gray-300 text-gray-700 hover:bg-gray-100'
          }`}
          title="在新窗口中打开博客首页"
        >
          <Home className="w-5 h-5" />
          首页
        </button>
      </div>分类
        </p>
      </div>

      {/* Add Tag */}
      <div className={`
        p-6 rounded-lg
        ${isDark ? 'bg-gray-900' : 'bg-white'}
        border border-gray-200 dark:border-gray-800
      `}>
        <label className={`block text-sm font-medium mb-2 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          新建标签
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="输入标签名称..."
            onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
            className={`
              flex-1 px-4 py-2 rounded-lg border
              ${isDark 
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-lobster-500
            `}
          />
          <button
            onClick={handleAddTag}
            className="px-6 py-2 bg-lobster-500 hover:bg-lobster-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            添加
          </button>
        </div>
      </div>

      {/* Tags List */}
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
              <th className={`px-6 py-4 text-left text-sm font-semibold ${
                isDark ? 'text-gray-300' : 'text-gray-900'
              }`}>
                标签名称
              </th>
              <th className={`px-6 py-4 text-left text-sm font-semibold ${
                isDark ? 'text-gray-300' : 'text-gray-900'
              }`}>
                关联文章数
              </th>
              <th className={`px-6 py-4 text-right text-sm font-semibold ${
                isDark ? 'text-gray-300' : 'text-gray-900'
              }`}>
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {tagList.map((tag) => (
              <tr 
                key={tag.id}
                className={`border-t border-gray-200 dark:border-gray-800 hover:${
                  isDark ? 'bg-gray-800' : 'bg-gray-50'
                } transition-colors`}
              >
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isDark 
                      ? 'bg-lobster-500/20 text-lobster-400' 
                      : 'bg-lobster-100 text-lobster-700'
                  }`}>
                    {tag.name}
                  </span>
                </td>
                <td className={`px-6 py-4 text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {tag.count} 篇
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleDeleteTag(tag.id)}
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
      </div>

      {/* Stats */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6`}>
        <div className={`
          p-6 rounded-lg
          ${isDark ? 'bg-gray-900' : 'bg-white'}
          border border-gray-200 dark:border-gray-800
        `}>
          <p className={`text-sm font-medium ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          } mb-2`}>
            标签总数
          </p>
          <p className={`text-3xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {tagList.length}
          </p>
        </div>
        <div className={`
          p-6 rounded-lg
          ${isDark ? 'bg-gray-900' : 'bg-white'}
          border border-gray-200 dark:border-gray-800
        `}>
          <p className={`text-sm font-medium ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          } mb-2`}>
            有文章的标签
          </p>
          <p className={`text-3xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {tagList.filter(t => t.count > 0).length}
          </p>
        </div>
        <div className={`
          p-6 rounded-lg
          ${isDark ? 'bg-gray-900' : 'bg-white'}
          border border-gray-200 dark:border-gray-800
        `}>
          <p className={`text-sm font-medium ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          } mb-2`}>
            最多文章的标签
          </p>
          <p className={`text-3xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {tagList.length > 0 ? Math.max(...tagList.map(t => t.count)) : 0}
          </p>
        </div>
      </div>
    </div>
  );
};
