import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Eye, BarChart2, Award, FileText, Home } from 'lucide-react';
import { usePosts } from '../../contexts/PostsContext';
import { useViews } from '../../contexts/ViewsContext';
import { useDarkMode } from '../../hooks/useDarkMode';

export const Analytics: React.FC = () => {
  const { isDark } = useDarkMode();
  const { posts } = usePosts();
  const { getViews, getTotalViews, getTopPosts } = useViews();
  const navigate = useNavigate();

  const totalViews = getTotalViews();
  const topPosts = useMemo(() =>
    getTopPosts(posts.map(p => p.id), 10).map(({ id, views }) => ({
      post: posts.find(p => p.id === id)!,
      views,
    })).filter(x => x.post),
    [posts, getTopPosts]
  );

  const allPosts = useMemo(() =>
    posts.map(p => ({ post: p, views: getViews(p.id) }))
      .sort((a, b) => b.views - a.views),
    [posts, getViews]
  );

  const avgViews = posts.length > 0 ? Math.round(totalViews / posts.length) : 0;

  const cardClass = `rounded-xl p-5 shadow-sm border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`;

  const handleOpenHome = () => {
    const homeUrl = window.location.origin;
    window.open(homeUrl, 'blog-home', 'width=1200,height=800,scrollbars=yes,resizable=yes');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            访问统计
          </h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            了解文章的阅读情况和热门内容
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
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Eye, label: '总阅读量', value: totalViews.toLocaleString(), color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { icon: FileText, label: '文章数量', value: posts.length, color: 'text-lobster-500', bg: 'bg-lobster-50 dark:bg-lobster-900/20' },
          { icon: TrendingUp, label: '平均阅读', value: avgViews, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
          { icon: Award, label: '最高阅读', value: topPosts[0]?.views || 0, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className={cardClass}>
            <div className={`inline-flex p-2.5 rounded-lg ${bg} mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className={`text-2xl font-bold mb-0.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {value}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Posts Bar Chart */}
        <div className={cardClass}>
          <h2 className={`text-lg font-semibold mb-5 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <BarChart2 className="w-5 h-5 text-lobster-500" />
            热门文章 Top {Math.min(5, topPosts.length)}
          </h2>
          {topPosts.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">暂无阅读数据</div>
          ) : (
            <div className="space-y-3">
              {topPosts.slice(0, 5).map(({ post, views }, i) => {
                const maxViews = topPosts[0]?.views || 1;
                const pct = maxViews > 0 ? (views / maxViews) * 100 : 0;
                return (
                  <div key={post.id}>
                    <div className="flex items-center justify-between mb-1">
                      <button
                        onClick={() => navigate(`/admin/posts/edit/${post.id}`)}
                        className="text-sm text-gray-700 dark:text-gray-300 hover:text-lobster-500 dark:hover:text-lobster-400 truncate max-w-[200px] text-left transition-colors"
                        title={post.title}
                      >
                        <span className={`inline-block w-5 text-xs font-bold mr-1 ${
                          i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-400' : 'text-gray-300'
                        }`}>#{i + 1}</span>
                        {post.title}
                      </button>
                      <span className="text-sm font-semibold text-lobster-500 ml-2 flex-shrink-0">
                        {views.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-lobster-400 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* All Posts Table */}
        <div className={cardClass}>
          <h2 className={`text-lg font-semibold mb-5 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Eye className="w-5 h-5 text-blue-500" />
            全部文章阅读量
          </h2>
          <div className="overflow-auto max-h-72">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                  <th className={`pb-2 text-left font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>文章</th>
                  <th className={`pb-2 text-right font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>阅读量</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {allPosts.map(({ post, views }) => (
                  <tr key={post.id} className="group">
                    <td className="py-2 pr-2">
                      <button
                        onClick={() => navigate(`/admin/posts/edit/${post.id}`)}
                        className="text-gray-700 dark:text-gray-300 group-hover:text-lobster-500 dark:group-hover:text-lobster-400 truncate max-w-[180px] block text-left transition-colors"
                        title={post.title}
                      >
                        {post.title}
                      </button>
                    </td>
                    <td className="py-2 text-right">
                      <span className={`font-medium ${views > 0 ? 'text-lobster-500' : isDark ? 'text-gray-600' : 'text-gray-300'}`}>
                        {views > 0 ? views.toLocaleString() : '-'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
