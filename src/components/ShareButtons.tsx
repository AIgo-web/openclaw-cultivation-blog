import React, { useState, useCallback } from 'react';
import { Share2, Link as LinkIcon, CheckCheck, Twitter } from 'lucide-react';
import type { Post } from '../types';

interface ShareButtonsProps {
  post: Post;
}

// 检测是否在微信内置浏览器
function isWechatBrowser(): boolean {
  return /MicroMessenger/i.test(navigator.userAgent);
}

// 微信绿色 SVG 图标
const WechatIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.295.295a.328.328 0 0 0 .186-.059l1.853-1.078a.9.9 0 0 1 .433-.112c.1 0 .198.018.292.051C6.437 16.763 7.555 17 8.691 17c.088 0 .176-.004.263-.006C8.725 16.35 8.69 15.688 8.69 15c0-4.418 4.064-8 9.076-8 .136 0 .271.004.406.01C17.208 4.131 13.285 2.188 8.691 2.188zm-2.45 4.613c.637 0 1.155.518 1.155 1.155S6.878 9.11 6.24 9.11s-1.154-.517-1.154-1.154.517-1.155 1.154-1.155zm4.9 0c.637 0 1.155.518 1.155 1.155S11.778 9.11 11.14 9.11s-1.154-.517-1.154-1.154.517-1.155 1.154-1.155zm4.46 4.386c-4.174 0-7.557 2.865-7.557 6.4 0 3.534 3.383 6.4 7.557 6.4.904 0 1.772-.147 2.572-.413a.7.7 0 0 1 .232-.04.716.716 0 0 1 .345.09l1.48.86a.264.264 0 0 0 .148.048.236.236 0 0 0 .236-.236.263.263 0 0 0-.038-.17l-.312-1.183a.471.471 0 0 1 .17-.532C22.36 20.624 24 18.88 24 16.587c0-3.535-3.383-6.4-7.399-6.4zm-2.45 3.844c.51 0 .924.413.924.924s-.414.924-.924.924a.924.924 0 0 1-.924-.924c0-.51.413-.924.924-.924zm4.9 0c.51 0 .923.413.923.924s-.413.924-.923.924a.924.924 0 0 1-.924-.924c0-.51.414-.924.924-.924z"/>
  </svg>
);

// 朋友圈图标
const MomentsIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
  </svg>
);

// 微博图标
const WeiboIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M9.31 7.327c-3.56.263-6.28 2.887-6.09 5.867.195 2.98 3.22 5.198 6.783 4.935 3.56-.263 6.278-2.887 6.087-5.868-.19-2.98-3.22-5.197-6.78-4.934zm3.29 8.51c-.747 1.108-2.35 1.534-3.563 .952-1.19-.567-1.49-1.922-.745-3.032.74-1.095 2.302-1.53 3.508-.99 1.222.55 1.54 1.894.8 3.07zm-1.39-1.12c-.33.516-1.04.724-1.582.466-.53-.25-.67-.847-.34-1.364.327-.51.02-1.082-.716-.84-.734.24-.89 1.1-.478 1.792.64 1.074 2.23 1.168 3.02.128.79-1.04.495-2.64-.67-3.22-1.17-.58-2.63.01-3.29.13.76-.3 1.68-.293 2.44.065 1.12.523 1.44 1.86.616 3.07v-.027zm7.22-9.327c-.53-.618-1.3-.927-2.182-.875a3.22 3.22 0 0 0-.353.038 1.01 1.01 0 0 0-.8 1.185c.1.54.622.902 1.165.803l.13-.025c.292-.044.57.065.753.293.182.228.226.526.115.798-.202.506.044 1.08.548 1.28.506.2 1.082-.044 1.284-.55.445-1.11.233-2.337-.66-2.947zm1.64-2.47C18.9 1.787 17.46 1.148 15.92 1.25a1.016 1.016 0 0 0-.934 1.09c.05.557.54.967 1.093.917.876-.06 1.724.31 2.34.99.615.682.865 1.583.686 2.454a1.013 1.013 0 0 0 .796 1.194 1.015 1.015 0 0 0 1.196-.795c.29-1.44-.125-2.95-1.118-4.06l.002.002z"/>
  </svg>
);

// 微信内置浏览器分享引导弹窗
const WechatInAppGuide = ({
  type,
  onClose
}: {
  type: 'chat' | 'moments';
  onClose: () => void;
}) => {
  const isMoments = type === 'moments';
  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* 右上角箭头动画 */}
      <div className="absolute top-0 right-0 flex flex-col items-end pr-4 pt-2 pointer-events-none">
        {/* 弯箭头指向右上角「···」按钮 */}
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="animate-bounce">
          <path
            d="M20 70 Q60 60 70 10"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <polygon points="65,5 75,15 80,5" fill="white" />
        </svg>
      </div>

      {/* 说明气泡（右上角附近） */}
      <div
        className="absolute top-16 right-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-5 max-w-[220px]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shrink-0">
            {isMoments
              ? <MomentsIcon className="w-4 h-4 text-white" />
              : <WechatIcon className="w-4 h-4 text-white" />
            }
          </div>
          <span className="font-semibold text-gray-900 dark:text-white text-sm">
            {isMoments ? '分享到朋友圈' : '分享给朋友'}
          </span>
        </div>

        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
            <span>点击右上角 <strong>「···」</strong> 按钮</span>
          </div>
          {isMoments ? (
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
              <span>选择 <strong>「分享到朋友圈」</strong></span>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
              <span>选择 <strong>「发送给朋友」</strong></span>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 rounded-xl bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors"
        >
          知道了
        </button>
      </div>
    </div>
  );
};

// 手机浏览器（非微信）复制链接引导
const MobileCopyGuide = ({
  type,
  url,
  title,
  onClose
}: {
  type: 'chat' | 'moments';
  url: string;
  title: string;
  onClose: () => void;
}) => {
  const [copied, setCopied] = useState(false);
  const isMoments = type === 'moments';

  const handleCopy = useCallback(async () => {
    const text = `${title}\n${url}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }, [url, title]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl p-5 pb-safe"
        onClick={e => e.stopPropagation()}
      >
        {/* 拖动条 */}
        <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shrink-0">
            {isMoments
              ? <MomentsIcon className="w-5 h-5 text-white" />
              : <WechatIcon className="w-5 h-5 text-white" />
            }
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {isMoments ? '分享到朋友圈' : '分享给微信好友'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              复制链接后，在微信中粘贴发送
            </p>
          </div>
        </div>

        {/* 文章预览卡片 */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-lobster-100 dark:bg-lobster-900/30 rounded-lg flex items-center justify-center text-xl shrink-0">
            🦞
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-1">{title}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{url}</p>
          </div>
        </div>

        {/* 步骤说明 */}
        <div className="flex items-center gap-4 mb-5 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
            <span>复制链接</span>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-gray-300 dark:text-gray-600 shrink-0">
            <path d="M6 3l5 5-5 5V3z"/>
          </svg>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
            <span>打开微信</span>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-gray-300 dark:text-gray-600 shrink-0">
            <path d="M6 3l5 5-5 5V3z"/>
          </svg>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
            <span>粘贴发送</span>
          </div>
        </div>

        {/* 复制按钮 */}
        <button
          onClick={handleCopy}
          className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
            copied
              ? 'bg-green-500 text-white'
              : 'bg-green-500 text-white hover:bg-green-600 active:scale-95'
          }`}
        >
          {copied ? '✓ 已复制，去微信粘贴吧~' : '复制链接'}
        </button>

        <button
          onClick={onClose}
          className="w-full py-2.5 mt-2 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          取消
        </button>
      </div>
    </div>
  );
};



export const ShareButtons: React.FC<ShareButtonsProps> = ({ post }) => {
  const [copied, setCopied] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [wechatModal, setWechatModal] = useState<'chat' | 'moments' | null>(null);

  const pageUrl = window.location.href;
  const encodedUrl = encodeURIComponent(pageUrl);
  const encodedTitle = encodeURIComponent(post.title);

  const inWechat = isWechatBrowser();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = pageUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWechat = (type: 'chat' | 'moments') => {
    setWechatModal(type);
    setShowPanel(false);
  };

  const shareActions = [
    {
      label: '复制链接',
      icon: copied ? <CheckCheck className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />,
      onClick: handleCopyLink,
      color: copied
        ? 'bg-green-500 text-white'
        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700',
      label2: copied ? '已复制！' : '复制链接',
      keepOpen: true,
    },
    {
      label: '微信',
      icon: <WechatIcon className="w-4 h-4" />,
      onClick: () => handleWechat('chat'),
      color: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40',
      label2: '微信好友',
      keepOpen: false,
    },
    {
      label: '朋友圈',
      icon: <MomentsIcon className="w-4 h-4" />,
      onClick: () => handleWechat('moments'),
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40',
      label2: '朋友圈',
      keepOpen: false,
    },
    {
      label: '微博',
      icon: <WeiboIcon className="w-4 h-4" />,
      onClick: () => window.open(`https://service.weibo.com/share/share.php?url=${encodedUrl}&title=${encodedTitle}`, '_blank'),
      color: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40',
      label2: '微博',
      keepOpen: false,
    },
    {
      label: 'QQ空间',
      icon: <span className="text-xs font-bold leading-none">QQ</span>,
      onClick: () => window.open(`https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${encodedUrl}&title=${encodedTitle}`, '_blank'),
      color: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/40',
      label2: 'QQ',
      keepOpen: false,
    },
    {
      label: 'Twitter/X',
      icon: <Twitter className="w-4 h-4" />,
      onClick: () => window.open(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, '_blank'),
      color: 'bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/40',
      label2: 'Twitter',
      keepOpen: false,
    },
  ];

  return (
    <>
      <div className="relative">
        {/* 触发按钮 */}
        <button
          onClick={() => setShowPanel(!showPanel)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
            showPanel
              ? 'bg-lobster-500 text-white border-lobster-500'
              : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Share2 className="w-4 h-4" />
          分享
        </button>

        {showPanel && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowPanel(false)} />

            {/* 桌面端：下拉浮层 */}
            <div className="hidden sm:block absolute right-0 top-12 z-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4 min-w-[200px]">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-wide">分享到</p>
              <div className="space-y-1.5">
                {shareActions.map(action => (
                  <button
                    key={action.label}
                    onClick={() => { action.onClick(); if (!action.keepOpen) setShowPanel(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${action.color}`}
                  >
                    <span className="w-5 flex justify-center items-center">{action.icon}</span>
                    {action.label2}
                  </button>
                ))}
              </div>
            </div>

            {/* 手机端：底部弹窗 */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 z-20 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 rounded-t-2xl shadow-2xl p-5 pb-safe">
              <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4" />
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-4 uppercase tracking-wide text-center">分享到</p>
              <div className="grid grid-cols-3 gap-3 mb-3">
                {shareActions.map(action => (
                  <button
                    key={action.label}
                    onClick={() => { action.onClick(); if (!action.keepOpen) setShowPanel(false); }}
                    className={`flex flex-col items-center gap-2 px-2 py-3.5 rounded-xl text-xs font-medium transition-all active:scale-95 ${action.color}`}
                  >
                    <span className="w-6 h-6 flex justify-center items-center">{action.icon}</span>
                    <span className="leading-tight text-center">{action.label2}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 微信/朋友圈弹窗：根据环境显示不同内容 */}
      {wechatModal && (
        inWechat ? (
          // 微信内置浏览器：右上角引导动画
          <WechatInAppGuide
            type={wechatModal}
            onClose={() => setWechatModal(null)}
          />
        ) : (
          // 手机/桌面浏览器：复制链接引导
          <MobileCopyGuide
            type={wechatModal}
            url={pageUrl}
            title={post.title}
            onClose={() => setWechatModal(null)}
          />
        )
      )}
    </>
  );
};
