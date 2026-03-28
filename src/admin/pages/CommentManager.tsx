import React, { useState } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { MessageSquare, CheckCircle, XCircle, Trash2, Filter, User, AlertCircle, Home } from 'lucide-react';
import { useComments } from '../../contexts/CommentsContext';
import { usePosts } from '../../contexts/PostsContext';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../../hooks/useDarkMode';
import type { Comment } from '../../types';

type FilterType = 'all' | 'pending' | 'approved' | 'rejected';

export const CommentManager: React.FC = () => {
  const { isDark } = useDarkMode();
  const { username } = useAuth();
  const { comments, approveComment, rejectComment, deleteComment } = useComments();
  const { posts } = usePosts();
  const [filter, setFilter] = useState<FilterType>('pending');
  const [selectedPostId, setSelectedPostId] = useState<string>('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingCommentId, setRejectingCommentId] = useState<string | null>(null);

  const getPostTitle = (postId: string) =>
    posts.find(p => p.id === postId)?.title || '未知文章';

  let filtered = filter === 'all' ? comments : comments.filter(c => c.status === filter);
  if (selectedPostId) filtered = filtered.filter(c => c.postId === selectedPostId);
  filtered = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const pendingCount = comments.filter(c => c.status === 'pending').length;
  const approvedCount = comments.filter(c => c.status === 'approved').length;
  const rejectedCount = comments.filter(c => c.status === 'rejected').length;

  const statusBadge = (status: Comment['status']) => {
    if (status === 'approved') return <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">已通过</span>;
    if (status === 'rejected') return <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400">已拒绝</span>;
    return <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400">待审核</span>;
  };

  const handleRejectWithReason = () => {
    if (rejectingCommentId && rejectReason.trim()) {
      rejectComment(rejectingCommentId, rejectReason.trim(), username || 'admin');
      setRejectReason('');
      setShowRejectModal(false);
      setRejectingCommentId(null);
    }
  };

  const handleApprove = (id: string) => {
    approveComment(id, username || 'admin');
  };

  const handleOpenHome = () => {
    const homeUrl = window.location.origin;
    window.open(homeUrl, 'blog-home', 'width=1200,height=800,scrollbars=yes,resizable=yes');
  };

  const filterBtnClass = (f: FilterType) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      filter === f
        ? 'bg-lobster-500 text-white'
        : isDark
          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            评论管理
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            审核和管理读者留下的评论
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

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: '待审核', count: pendingCount, color: 'yellow' },
          { label: '已通过', count: approvedCount, color: 'green' },
          { label: '已拒绝', count: rejectedCount, color: 'red' },
        ].map(({ label, count, color }) => (
          <div key={label} className={`rounded-xl p-4 shadow-sm border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            <div className={`text-2xl font-bold ${
              color === 'yellow' ? 'text-yellow-500' :
              color === 'green' ? 'text-green-500' : 'text-red-500'
            }`}>{count}</div>
            <div className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className={`rounded-xl p-4 shadow-sm border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>筛选：</span>
          </div>
          <button onClick={() => setFilter('all')} className={filterBtnClass('all')}>全部 ({comments.length})</button>
          <button onClick={() => setFilter('pending')} className={filterBtnClass('pending')}>待审核 ({pendingCount})</button>
          <button onClick={() => setFilter('approved')} className={filterBtnClass('approved')}>已通过 ({approvedCount})</button>
          <button onClick={() => setFilter('rejected')} className={filterBtnClass('rejected')}>已拒绝 ({rejectedCount})</button>

          <select
            value={selectedPostId}
            onChange={e => setSelectedPostId(e.target.value)}
            className={`ml-auto px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-lobster-400 ${
              isDark ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-700'
            }`}
          >
            <option value="">所有文章</option>
            {posts.map(p => (
              <option key={p.id} value={p.id}>{p.title.slice(0, 30)}{p.title.length > 30 ? '…' : ''}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Comment List */}
      <div className={`rounded-xl shadow-sm border divide-y ${
        isDark ? 'bg-gray-900 border-gray-800 divide-gray-800' : 'bg-white border-gray-200 divide-gray-100'
      }`}>
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <MessageSquare className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-700' : 'text-gray-200'}`} />
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>暂无评论</p>
          </div>
        ) : (
          filtered.map(comment => (
            <div key={comment.id} className="p-5">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-lobster-100 dark:bg-lobster-900/40 flex items-center justify-center">
                  <User className="w-5 h-5 text-lobster-500" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {comment.author}
                    </span>
                    {statusBadge(comment.status)}
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {format(new Date(comment.date), 'yyyy年M月d日 HH:mm', { locale: zhCN })}
                    </span>
                  </div>

                  <p className={`text-sm mb-2 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {comment.content}
                  </p>

                  <div className="space-y-1">
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      文章：<span className="text-lobster-500">{getPostTitle(comment.postId)}</span>
                      {comment.replies.length > 0 && (
                        <span className="ml-3">{comment.replies.length} 条回复</span>
                      )}
                    </p>
                    {(comment.reviewedBy || comment.reviewedAt) && (
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        审核记录：
                        <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                          {comment.reviewedBy} 于 {format(new Date(comment.reviewedAt!), 'M月d日 HH:mm', { locale: zhCN })}
                        </span>
                        {comment.reviewReason && (
                          <span className="ml-2 text-red-500">原因：{comment.reviewReason}</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 flex items-center gap-2">
                  {comment.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(comment.id)}
                        title="通过"
                        className="p-1.5 rounded-lg text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setRejectingCommentId(comment.id);
                          setShowRejectModal(true);
                        }}
                        title="拒绝"
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  {comment.status === 'rejected' && (
                    <button
                      onClick={() => handleApprove(comment.id)}
                      title="重新通过"
                      className="p-1.5 rounded-lg text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  )}
                  {comment.status === 'approved' && (
                    <button
                      onClick={() => {
                        setRejectingCommentId(comment.id);
                        setShowRejectModal(true);
                      }}
                      title="撤回"
                      className="p-1.5 rounded-lg text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (window.confirm('确认删除该评论？')) deleteComment(comment.id);
                    }}
                    title="删除"
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 拒绝原因模态框 */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl shadow-xl max-w-md w-full p-6 ${
            isDark ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                拒绝评论
              </h3>
            </div>

            <div className="mb-4">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                请说明拒绝原因（可选）
              </label>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value.slice(0, 200))}
                rows={3}
                placeholder="例如：包含敏感词、违反社区规范等"
                className={`w-full px-3 py-2 rounded-lg border resize-none text-sm focus:outline-none focus:ring-2 focus:ring-red-400 ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setRejectingCommentId(null);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                取消
              </button>
              <button
                onClick={handleRejectWithReason}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                确认拒绝
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
