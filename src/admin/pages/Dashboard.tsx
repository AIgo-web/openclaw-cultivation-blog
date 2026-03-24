import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Tags, MessageSquare, TrendingUp } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { useDarkMode } from '../../hooks/useDarkMode';
import { usePosts } from '../../contexts/PostsContext';
import { useComments } from '../../contexts/CommentsContext';
import { useViews } from '../../contexts/ViewsContext';
import { tags } from '../../data/tags';

export const Dashboard: React.FC = () => {
  const { isDark } = useDarkMode();
  const navigate = useNavigate();
  const { posts } = usePosts();
  const { comments, pendingCount } = useComments();
  const { getTotalViews } = useViews();

  const totalViews = getTotalViews();
  const approvedComments = comments.filter(c => c.status === 'approved').length;

  const stats = [
    {
      title: '文章总数',
      value: posts.length,
      icon: <FileText className="w-6 h-6 text-lobster-500" />,
      trend: { value: 20, isPositive: true },
      color: 'red' as const
    },
    {
      title: '标签数量',
      value: tags.length,
      icon: <Tags className="w-6 h-6 text-blue-500" />,
      trend: { value: 15, isPositive: true },
      color: 'blue' as const
    },
    {
      title: `评论 (${pendingCount > 0 ? `${pendingCount}待审` : '已全审'})`,
      value: approvedComments,
      icon: <MessageSquare className={`w-6 h-6 ${pendingCount > 0 ? 'text-yellow-500' : 'text-green-500'}`} />,
      trend: { value: 100, isPositive: true },
      color: 'green' as const
    },
    {
      title: '总阅读量',
      value: totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}K` : totalViews,
      icon: <TrendingUp className="w-6 h-6 text-purple-500" />,
      trend: { value: 30, isPositive: true },
      color: 'purple' as const
    }
  ];

  const recentPosts = [...posts].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold ${
          isDark ? 'text-white' : 'text-gray-900'
        } mb-2`}>
          仪表板
        </h1>
        <p className={`text-lg ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          欢迎回来，查看博客的整体数据概览
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Posts */}
        <div className={`
          rounded-xl p-6
          ${isDark ? 'bg-gray-900' : 'bg-white'}
          shadow-sm border border-gray-200 dark:border-gray-800
        `}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              最近文章
            </h2>
            <button
              onClick={() => navigate('/admin/posts')}
              className="text-lobster-500 hover:text-lobster-600 text-sm font-medium"
            >
              查看全部 →
            </button>
          </div>
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => navigate(`/admin/posts/edit/${post.id}`)}
                className={`
                  p-4 rounded-lg cursor-pointer transition-colors
                  ${isDark 
                    ? 'hover:bg-gray-800' 
                    : 'hover:bg-gray-50'
                  }
                `}
              >
                <h3 className={`font-medium ${
                  isDark ? 'text-white' : 'text-gray-900'
                } mb-1 line-clamp-1`}>
                  {post.title}
                </h3>
                <p className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {post.date}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`
          rounded-xl p-6
          ${isDark ? 'bg-gray-900' : 'bg-white'}
          shadow-sm border border-gray-200 dark:border-gray-800
        `}>
          <h2 className={`text-xl font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          } mb-6`}>
            快速操作
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/admin/posts/new')}
              className="p-4 rounded-lg bg-lobster-500 hover:bg-lobster-600 text-white transition-colors"
            >
              <FileText className="w-6 h-6 mx-auto mb-2" />
              <span className="font-medium">新建文章</span>
            </button>
            <button
              onClick={() => navigate('/admin/tags')}
              className={`
                p-4 rounded-lg border-2 border-dashed transition-colors
                ${isDark 
                  ? 'border-gray-700 hover:border-lobster-500 text-gray-300' 
                  : 'border-gray-300 hover:border-lobster-500 text-gray-700'
                }
              `}
            >
              <Tags className="w-6 h-6 mx-auto mb-2" />
              <span className="font-medium">管理标签</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
