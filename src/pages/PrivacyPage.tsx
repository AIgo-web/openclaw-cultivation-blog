/**
 * 隐私政策页面
 */
import { useEffect } from 'react';
import { setCanonicalUrl, BLOG_URL } from '../services/seoService';

export default function PrivacyPage() {
  useEffect(() => {
    document.title = '隐私政策 - OpenClaw 龙虾养成计划';
    setCanonicalUrl(`${BLOG_URL}/privacy`);
  }, []);
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <section className="mb-10">
        <div className="inline-flex items-center gap-3 mb-3">
          <span className="text-5xl">🔒</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          隐私政策
        </h1>
        <p className="text-gray-400 dark:text-gray-500 text-sm">
          最后更新：2026年4月1日
        </p>
      </section>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        {/* Section 1 */}
        <section className="card p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-lobster-500 rounded-full inline-block" />
            信息收集与使用
          </h2>
          <div className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed space-y-3">
            <p>
              <strong className="text-gray-800 dark:text-gray-200">本博客收集的信息非常有限。</strong>我们主要通过以下方式收集信息：
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong className="text-gray-800 dark:text-gray-200">评论功能：</strong>当您在文章下方发表评论时，系统会要求您提供昵称和邮箱地址。这些信息仅用于显示评论者和回复通知，不会用于任何商业推广目的。</li>
              <li><strong className="text-gray-800 dark:text-gray-200">访问统计：</strong>我们使用本地化的浏览量计数来统计文章阅读量，数据存储在您浏览器的 localStorage 中，不会上传到任何服务器。</li>
              <li><strong className="text-gray-800 dark:text-gray-200">Cookies：</strong>本博客不使用第三方追踪 Cookies。仅使用本地存储来记住您的主题偏好设置（明/暗模式）。</li>
            </ul>
          </div>
        </section>

        {/* Section 2 */}
        <section className="card p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-ocean-500 rounded-full inline-block" />
            第三方服务
          </h2>
          <div className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed space-y-3">
            <p>本博客可能接入以下第三方服务：</p>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong className="text-gray-800 dark:text-gray-200">外部链接：</strong>文章中可能包含指向外部网站的链接。我们对这些外部网站的隐私政策不负任何责任，建议在访问时阅读其隐私政策。</li>
              <li><strong className="text-gray-800 dark:text-gray-200">RSS 订阅：</strong>博客提供 RSS Feed 订阅功能，使用 RSS 阅读器时适用其各自的隐私政策。</li>
              <li><strong className="text-gray-800 dark:text-gray-200">微信公众号：</strong>部分内容通过微信公众号同步发布，适用微信平台的服务条款和隐私政策。</li>
            </ul>
          </div>
        </section>

        {/* Section 3 */}
        <section className="card p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-purple-500 rounded-full inline-block" />
            数据安全
          </h2>
          <div className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed space-y-3">
            <p>
              我们重视数据安全，采取以下措施保护您的信息：
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li>评论者的邮箱地址仅用于通知目的，不会公开显示或分享给第三方</li>
              <li>所有数据传输使用 HTTPS 加密连接</li>
              <li>评论数据存储在本地浏览器的 localStorage 中，您可以随时清除浏览器数据将其删除</li>
              <li>评论内容会经过敏感词过滤，防止不当内容发布</li>
            </ul>
          </div>
        </section>

        {/* Section 4 */}
        <section className="card p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-green-500 rounded-full inline-block" />
            您的权利
          </h2>
          <div className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed space-y-3">
            <p>
              关于您的个人信息，您享有以下权利：
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong className="text-gray-800 dark:text-gray-200">知情权：</strong>您有权了解我们收集了哪些关于您的信息</li>
              <li><strong className="text-gray-800 dark:text-gray-200">删除权：</strong>您可以联系我们删除您的评论数据</li>
              <li><strong className="text-gray-800 dark:text-gray-200">访问权：</strong>您可以联系博主获取我们持有的关于您的信息副本</li>
            </ul>
            <p className="pt-2">
              如需行使以上权利，请通过评论区留言或 QQ Bot 联系博主。
            </p>
          </div>
        </section>

        {/* Section 5 */}
        <section className="card p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-amber-500 rounded-full inline-block" />
            儿童隐私
          </h2>
          <div className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            <p>
              本博客面向一般受众，不针对或刻意收集 13 岁以下儿童的个人信息。如您是未成年人，请在监护人指导下使用本博客及其评论功能。
            </p>
          </div>
        </section>

        {/* Section 6 */}
        <section className="card p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-red-500 rounded-full inline-block" />
            隐私政策更新
          </h2>
          <div className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            <p>
              我们可能会不时更新本隐私政策。如有重大变更，我们将在博客首页或通过 RSS Feed 通知您。继续使用本博客即表示您同意最新的隐私政策。
            </p>
          </div>
        </section>

        {/* Section 7 */}
        <section className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-500 rounded-full inline-block" />
            联系我们
          </h2>
          <div className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed space-y-3">
            <p>
              如您对本隐私政策有任何疑问或担忧，请通过以下方式联系我们：
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li>在对应文章下方留言</li>
              <li>通过 QQ Bot 发送消息</li>
              <li>在博客管理后台（登录后）获取联系邮箱</li>
            </ul>
            <p className="pt-2 text-gray-500 dark:text-gray-500 text-xs">
              本隐私政策最后更新于 2026年4月1日。
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
