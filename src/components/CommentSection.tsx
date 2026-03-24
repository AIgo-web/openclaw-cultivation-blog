import React, { useState } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { MessageSquare, Reply, Send, User, ChevronDown, ChevronUp } from 'lucide-react';
import { useComments } from '../contexts/CommentsContext';
import { Comment } from '../types';

interface CommentItemProps {
  comment: Comment;
  onReply: (commentId: string, author: string, content: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onReply }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [replyAuthor, setReplyAuthor] = useState('');
  const [replyContent, setReplyContent] = useState('');

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    const author = replyAuthor.trim().slice(0, 20) || '匿名';
    const content = replyContent.trim().slice(0, 500);
    if (!content) return;
    onReply(comment.id, author, content);
    setReplyAuthor('');
    setReplyContent('');
    setShowReplyForm(false);
  };

  return (
    <div className="py-5 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-lobster-100 dark:bg-lobster-900 flex items-center justify-center">
          <User className="w-5 h-5 text-lobster-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-gray-900 dark:text-white">
              {comment.author}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {format(new Date(comment.date), 'yyyy年M月d日 HH:mm', { locale: zhCN })}
            </span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
            {comment.content}
          </p>

          {/* 操作按钮 */}
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-lobster-500 dark:hover:text-lobster-400 transition-colors"
            >
              <Reply className="w-3.5 h-3.5" />
              回复
            </button>
            {comment.replies.length > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-lobster-500 dark:hover:text-lobster-400 transition-colors"
              >
                {showReplies ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {comment.replies.length} 条回复
              </button>
            )}
          </div>

          {/* 回复表单 */}
          {showReplyForm && (
            <form onSubmit={handleSubmitReply} className="mt-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
              <input
                type="text"
                placeholder="你的名字（选填）"
                value={replyAuthor}
                onChange={e => setReplyAuthor(e.target.value.slice(0, 20))}
                className="w-full mb-2 px-3 py-1.5 text-sm rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-lobster-400"
              />
              <textarea
                placeholder={`回复 ${comment.author}...`}
                value={replyContent}
                onChange={e => setReplyContent(e.target.value.slice(0, 500))}
                rows={2}
                className="w-full mb-2 px-3 py-1.5 text-sm rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-lobster-400 resize-none"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowReplyForm(false)}
                  className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={!replyContent.trim()}
                  className="px-3 py-1 text-xs bg-lobster-500 text-white rounded hover:bg-lobster-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <Send className="w-3 h-3" /> 发送
                </button>
              </div>
            </form>
          )}

          {/* 回复列表 */}
          {showReplies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3 pl-3 border-l-2 border-gray-100 dark:border-gray-700">
              {comment.replies.map(reply => (
                <div key={reply.id} className="flex gap-2">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-xs text-gray-800 dark:text-gray-200">{reply.author}</span>
                      <span className="text-xs text-gray-400">
                        {format(new Date(reply.date), 'M月d日 HH:mm', { locale: zhCN })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                      {reply.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface CommentSectionProps {
  postId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { getPostComments, addComment, addReply } = useComments();
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const approvedComments = getPostComments(postId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAuthor = author.trim().slice(0, 20) || '匿名游客';
    const cleanContent = content.trim().slice(0, 1000);
    if (!cleanContent) return;

    addComment({ postId, author: cleanAuthor, content: cleanContent });
    setAuthor('');
    setContent('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  const handleReply = (commentId: string, replyAuthor: string, replyContent: string) => {
    addReply(commentId, { author: replyAuthor, content: replyContent });
  };

  return (
    <section className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
      <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white mb-8">
        <MessageSquare className="w-5 h-5 text-lobster-500" />
        评论
        {approvedComments.length > 0 && (
          <span className="text-sm font-normal text-gray-400 ml-1">({approvedComments.length})</span>
        )}
      </h2>

      {/* 评论表单 */}
      <div className="card p-6 mb-8">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">发表评论</h3>
        {submitted ? (
          <div className="py-4 text-center">
            <div className="text-2xl mb-2">🦞</div>
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">评论已提交，等待审核后显示</p>
            <p className="text-xs text-gray-400 mt-1">感谢你的参与！</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="你的名字（选填，默认匿名游客）"
              value={author}
              onChange={e => setAuthor(e.target.value.slice(0, 20))}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-lobster-400 focus:border-transparent"
            />
            <textarea
              placeholder="写下你的想法..."
              value={content}
              onChange={e => setContent(e.target.value.slice(0, 1000))}
              rows={4}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-lobster-400 focus:border-transparent resize-none"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{content.length}/1000 · 评论需审核后显示</span>
              <button
                type="submit"
                disabled={!content.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-lobster-500 text-white text-sm font-medium rounded-lg hover:bg-lobster-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
                提交评论
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 评论列表 */}
      {approvedComments.length === 0 ? (
        <div className="text-center py-10 text-gray-400 dark:text-gray-500">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">还没有评论，来说点什么吧</p>
        </div>
      ) : (
        <div className="card p-4 sm:p-6">
          {approvedComments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
            />
          ))}
        </div>
      )}
    </section>
  );
};
