/**
 * 打赏组件
 * 支持微信和支付宝二维码展示
 */

import React, { useState } from 'react';
import { Heart, X } from 'lucide-react';

interface DonationProps {
  author?: string;
  className?: string;
}

export const Donation: React.FC<DonationProps> = ({
  author = 'OpenClaw',
  className = '',
}) => {
  // 从 localStorage 读取收款码
  const wechatQR = localStorage.getItem('blog_wechat_qr') || '';
  const alipayQR = localStorage.getItem('blog_alipay_qr') || '';

  // 如果没有配置收款码，显示配置提示
  if (!wechatQR && !alipayQR) {
    return (
      <span className={`text-sm text-gray-400 dark:text-gray-500 ${className}`}>
        打赏功能待配置
      </span>
    );
  }
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'wechat' | 'alipay'>('wechat');

  if (!showModal) {
    return (
      <button
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-full text-sm font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${className}`}
      >
        <Heart className="w-4 h-4" />
        赞赏支持
      </button>
    );
  }

  return (
    <>
      {/* 遮罩 */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={() => setShowModal(false)}
      >
        {/* 模态框 */}
        <div 
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 关闭按钮 */}
          <button
            onClick={() => setShowModal(false)}
            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* 标题 */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              觉得有帮助？赞赏支持一下 🥰
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              您的支持是我持续创作的动力
            </p>
          </div>

          {/* Tab 切换 */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('wechat')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                activeTab === 'wechat'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              微信支付
            </button>
            <button
              onClick={() => setActiveTab('alipay')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                activeTab === 'alipay'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              支付宝
            </button>
          </div>

          {/* 二维码 */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
            {activeTab === 'wechat' ? (
              <div>
                <img
                  src={wechatQR}
                  alt="微信收款码"
                  className="w-48 h-48 mx-auto rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <p className="hidden text-sm text-gray-500 mt-2">微信收款码加载失败</p>
                <p className="text-sm text-gray-500 mt-2">打开微信扫一扫</p>
              </div>
            ) : (
              <div>
                <img
                  src={alipayQR}
                  alt="支付宝收款码"
                  className="w-48 h-48 mx-auto rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <p className="hidden text-sm text-gray-500 mt-2">支付宝收款码加载失败</p>
                <p className="text-sm text-gray-500 mt-2">打开支付宝扫一扫</p>
              </div>
            )}
          </div>

          {/* 作者 */}
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
            感谢 {author} 的支持 🙏
          </p>
        </div>
      </div>
    </>
  );
};

export default Donation;
