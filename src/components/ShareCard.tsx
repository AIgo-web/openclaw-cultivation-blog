/**
 * 分享卡片组件
 * 生成可自定义的分享预览卡片
 */

import React, { useState, useEffect } from 'react';
import { Share2, Download, Check, X } from 'lucide-react';
import type { Post } from '../types';

interface ShareCardProps {
  post: Post;
  className?: string;
}

export const ShareCard: React.FC<ShareCardProps> = ({ post, className = '' }) => {
  const [showCard, setShowCard] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/post/${post.id}` 
    : `/post/${post.id}`;

  const shareData = {
    title: post.title,
    text: post.summary,
    url: shareUrl,
  };

  // 检测是否支持 Web Share API
  const canUseWebShare = 'share' in navigator;

  const handleNativeShare = async () => {
    if (canUseWebShare) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const shareToPlatform = (platform: 'weibo' | 'twitter' | 'linkedin' | 'reddit') => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(post.title);
    const encodedText = encodeURIComponent(post.summary);

    const urls: Record<string, string> = {
      weibo: `https://service.weibo.com/share/share.php?url=${encodedUrl}&title=${encodedTitle}&pic=${post.coverImage || ''}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      reddit: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    };

    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  return (
    <>
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <button
          onClick={() => setShowCard(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-lobster-600 dark:text-lobster-400 bg-lobster-50 dark:bg-lobster-900/30 hover:bg-lobster-100 dark:hover:bg-lobster-900/50 rounded-lg transition-colors"
        >
          <Share2 className="w-4 h-4" />
          分享
        </button>

        {/* 移动端支持 Web Share API */}
        {canUseWebShare && (
          <button
            onClick={handleNativeShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg transition-colors"
          >
            <Share2 className="w-4 h-4" />
            分享到...
          </button>
        )}
      </div>

      {/* 分享弹窗 */}
      {showCard && (
        <ShareModal
          post={post}
          shareUrl={shareUrl}
          onClose={() => setShowCard(false)}
          onCopy={copyToClipboard}
          onNativeShare={handleNativeShare}
          copied={copied}
        />
      )}
    </>
  );
};

interface ShareModalProps {
  post: Post;
  shareUrl: string;
  onClose: () => void;
  onCopy: () => void;
  onNativeShare: () => void;
  copied: boolean;
}

const ShareModal: React.FC<ShareModalProps> = ({
  post,
  shareUrl,
  onClose,
  onCopy,
  onNativeShare,
  copied,
}) => {
  const [activeTab, setActiveTab] = useState<'link' | 'card'>('link');

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white">分享文章</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab 切换 */}
        <div className="flex border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'link'
                ? 'text-lobster-500 border-b-2 border-lobster-500'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            分享链接
          </button>
          <button
            onClick={() => setActiveTab('card')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'card'
                ? 'text-lobster-500 border-b-2 border-lobster-500'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            分享卡片
          </button>
        </div>

        {/* 内容 */}
        <div className="p-4">
          {activeTab === 'link' ? (
            <div className="space-y-4">
              {/* 链接输入框 */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 truncate"
                />
                <button
                  onClick={onCopy}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-1.5 ${
                    copied
                      ? 'bg-green-500 text-white'
                      : 'bg-lobster-500 hover:bg-lobster-600 text-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      已复制
                    </>
                  ) : (
                    '复制'
                  )}
                </button>
              </div>

              {/* 社交平台 */}
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={() => shareToPlatform('weibo')}
                  className="flex flex-col items-center gap-1.5 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  <span className="text-2xl">📱</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">微博</span>
                </button>
                <button
                  onClick={() => shareToPlatform('twitter')}
                  className="flex flex-col items-center gap-1.5 p-3 bg-sky-50 dark:bg-sky-900/20 rounded-xl hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-colors"
                >
                  <span className="text-2xl">🐦</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Twitter</span>
                </button>
                <button
                  onClick={() => shareToPlatform('linkedin')}
                  className="flex flex-col items-center gap-1.5 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <span className="text-2xl">💼</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">LinkedIn</span>
                </button>
                <button
                  onClick={() => shareToPlatform('reddit')}
                  className="flex flex-col items-center gap-1.5 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                >
                  <span className="text-2xl">🤖</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Reddit</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                生成分享卡片图片，方便在社交媒体使用
              </p>
              <div className="bg-gradient-to-br from-lobster-400 to-orange-400 rounded-xl p-6 text-white">
                <h4 className="font-bold text-lg mb-2 line-clamp-2">{post.title}</h4>
                <p className="text-sm opacity-90 line-clamp-3">{post.summary}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs opacity-75">OpenClaw 龙虾养成计划</span>
                  <span className="text-xs opacity-75">🦞</span>
                </div>
              </div>
              <button
                className="w-full py-2.5 bg-lobster-500 hover:bg-lobster-600 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                下载卡片图片
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function shareToPlatform(platform: 'weibo' | 'twitter' | 'linkedin' | 'reddit') {
  // 占位函数，实际实现在 ShareCard 组件内
  console.log('Share to:', platform);
}

export default ShareCard;
