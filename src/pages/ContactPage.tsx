/**
 * 联系页面
 */
import { useEffect } from 'react';
import { setCanonicalUrl, BLOG_URL } from '../services/seoService';

export default function ContactPage() {
  useEffect(() => {
    document.title = '联系我 - OpenClaw 龙虾养成计划';
    setCanonicalUrl(`${BLOG_URL}/contact`);
  }, []);
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <section className="mb-10">
        <div className="inline-flex items-center gap-3 mb-3">
          <span className="text-5xl">📬</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          联系我
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
          有问题、建议或想交流？欢迎通过以下方式找到我
        </p>
      </section>

      {/* Contact Methods */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-lobster-500 rounded-full inline-block" />
          联系方式
        </h2>
        <div className="grid gap-4">
          {[
            {
              icon: '🤖',
              title: 'QQ Bot 直接对话',
              desc: '通过 OpenClaw QQ Bot 与我直接对话，询问问题或讨论技术话题',
              action: '在 QQ 中搜索并添加 Bot 账号',
              highlight: true,
            },
            {
              icon: '💬',
              title: '文章评论区',
              desc: '每篇文章底部都有评论功能，有什么想说的直接留言',
              action: '前往任意文章底部评论',
              highlight: false,
            },
            {
              icon: '📧',
              title: '电子邮件',
              desc: '发送邮件至博客管理邮箱（需登录后才可见邮箱地址）',
              action: '登录管理后台获取联系邮箱',
              highlight: false,
            },
          ].map(item => (
            <div
              key={item.title}
              className={`card p-5 flex flex-col sm:flex-row items-start gap-4 ${
                item.highlight
                  ? 'border-lobster-300 dark:border-lobster-700 ring-1 ring-lobster-200 dark:ring-lobster-800'
                  : ''
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                item.highlight
                  ? 'bg-lobster-100 dark:bg-lobster-900/30'
                  : 'bg-gray-100 dark:bg-gray-800'
              }`}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-2">{item.desc}</p>
                <p className={`text-xs font-medium ${
                  item.highlight
                    ? 'text-lobster-500 dark:text-lobster-400'
                    : 'text-gray-400 dark:text-gray-500'
                }`}>
                  → {item.action}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-ocean-500 rounded-full inline-block" />
          常见问题
        </h2>
        <div className="space-y-3">
          {[
            {
              q: 'OpenClaw 是什么？在哪里下载？',
              a: 'OpenClaw 是一个本地运行的 AI Agent 框架，支持多种大模型和渠道集成。请访问 OpenClaw 官网或 GitHub 仓库获取最新版本。',
            },
            {
              q: '我可以转载博客文章吗？',
              a: '欢迎转载，但请注明出处并附上原文链接。对于商业使用，请提前联系作者获得授权。',
            },
            {
              q: '如何向我提问？',
              a: '在对应的文章下留言是最快捷的方式，或者通过 QQ Bot 与我直接对话。',
            },
            {
              q: '博客使用什么技术栈？',
              a: '前端：React + TypeScript + Vite + Tailwind CSS + React Router。后端：通过 GitHub Gist 做数据持久化。文章同步：微信公众号 API。',
            },
          ].map((item, i) => (
            <details key={i} className="card p-5 group cursor-pointer">
              <summary className="font-medium text-gray-800 dark:text-gray-200 list-none flex items-center justify-between gap-3 select-none">
                <span>{item.q}</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </span>
              </summary>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mt-3 border-t border-gray-100 dark:border-gray-800 pt-3">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="card p-6 bg-gradient-to-br from-lobster-50 to-orange-50 dark:from-lobster-900/20 dark:to-orange-900/20 text-center">
          <span className="text-4xl mb-3 inline-block">🦞</span>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            欢迎一起折腾 OpenClaw
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            有什么想聊的，随时来找我！
          </p>
        </div>
      </section>
    </main>
  );
}
