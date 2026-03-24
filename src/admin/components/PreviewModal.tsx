import React from 'react';
import ReactMarkdown from 'react-markdown';
import { X } from 'lucide-react';
import { useDarkMode } from '../../hooks/useDarkMode';
import { getCategoryIcon, getCategoryName } from '../../data/categories';
import type { Post } from '../../types';

interface PreviewModalProps {
  post: Partial<Post>;
  isOpen: boolean;
  onClose: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ post, isOpen, onClose }) => {
  const { isDark } = useDarkMode();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景蒙层 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* 模态框 */}
      <div className={`relative w-11/12 h-5/6 rounded-lg overflow-hidden flex flex-col ${
        isDark ? 'bg-gray-900' : 'bg-white'
      }`}>
        {/* 头部 */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
        }`}>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            文章预览
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark 
                ? 'text-gray-400 hover:bg-gray-700 hover:text-white' 
                : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto">
          <div className={`max-w-3xl mx-auto p-8 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
            {/* 标题 */}
            <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {post.title || '（未填写标题）'}
            </h1>

            {/* 文章信息 */}
            <div className={`flex items-center gap-4 mb-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {post.category && (
                <span>{getCategoryIcon(post.category)} {getCategoryName(post.category)}</span>
              )}
              {post.date && (
                <span>{new Date(post.date + 'T00:00:00').toLocaleDateString('zh-CN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              )}
              {post.readTime && (
                <span>· 阅读时间 {post.readTime} 分钟</span>
              )}
            </div>

            {/* 标签 */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map(tag => (
                  <span
                    key={tag}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isDark 
                        ? 'bg-lobster-900 text-lobster-200' 
                        : 'bg-lobster-100 text-lobster-700'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* 摘要 */}
            {post.summary && (
              <p className={`text-lg mb-6 leading-relaxed whitespace-pre-wrap ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {post.summary}
              </p>
            )}

            {/* 分隔线 */}
            <div className={`my-8 ${isDark ? 'border-gray-700' : 'border-gray-200'} border-t`} />

            {/* Markdown 内容 */}
            <div className={`prose ${isDark ? 'prose-invert' : ''} max-w-none`}>
              <ReactMarkdown
                components={{
                  h1: (props) => <h1 className={`text-3xl font-bold mt-8 mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`} {...props} />,
                  h2: (props) => <h2 className={`text-2xl font-bold mt-6 mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`} {...props} />,
                  h3: (props) => <h3 className={`text-xl font-bold mt-4 mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`} {...props} />,
                  p: (props) => <p className={`mb-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`} {...props} />,
                  strong: (props) => <strong className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`} {...props} />,
                  em: (props) => <em className={`italic ${isDark ? 'text-gray-300' : 'text-gray-600'}`} {...props} />,
                  code: (props) => (
                    <code className={`px-2 py-1 rounded text-sm font-mono ${
                      isDark 
                        ? 'bg-gray-800 text-gray-300' 
                        : 'bg-gray-100 text-gray-800'
                    }`} {...props} />
                  ),
                  pre: (props) => (
                    <pre className={`p-4 rounded-lg overflow-x-auto mb-4 ${
                      isDark 
                        ? 'bg-gray-800 text-gray-300' 
                        : 'bg-gray-100 text-gray-800'
                    }`} {...props} />
                  ),
                  ul: (props) => <ul className={`list-disc list-inside mb-4 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} {...props} />,
                  ol: (props) => <ol className={`list-decimal list-inside mb-4 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} {...props} />,
                  li: (props) => <li className="mb-2" {...props} />,
                  blockquote: (props) => (
                    <blockquote className={`border-l-4 pl-4 italic my-4 ${
                      isDark 
                        ? 'border-gray-600 text-gray-400' 
                        : 'border-gray-300 text-gray-600'
                    }`} {...props} />
                  ),
                  a: (props) => (
                    <a className={`font-medium underline transition-colors ${
                      isDark 
                        ? 'text-lobster-400 hover:text-lobster-300' 
                        : 'text-lobster-600 hover:text-lobster-700'
                    }`} {...props} />
                  ),
                }}
              >
                {post.content || '（未填写内容）'}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
