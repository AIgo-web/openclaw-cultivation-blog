import { Link } from 'react-router-dom';
import { Rss } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 mt-16 py-8 bg-white dark:bg-[#1a1d27] transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          <span className="text-xl mr-2">🦞</span>
          OpenClaw 龙虾养成计划 · 记录每一次 AI Agent 进化的故事
        </p>
        
        {/* RSS 订阅 */}
        <div className="mt-3 flex items-center justify-center">
          <a
            href="/feed.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-900/50 rounded-full transition-colors"
            title="订阅 RSS Feed"
          >
            <Rss className="w-3.5 h-3.5" />
            RSS 订阅
          </a>
        </div>
        
        <p className="text-gray-400 dark:text-gray-600 text-xs mt-3">
          Built with React + TypeScript + Tailwind CSS
        </p>
        <p className="text-gray-500 dark:text-gray-600 text-xs mt-2">
          <Link to="/privacy" className="hover:text-lobster-500 dark:hover:text-lobster-400 transition-colors">隐私政策</Link>
          <span className="mx-2">·</span>
          <Link to="/contact" className="hover:text-lobster-500 dark:hover:text-lobster-400 transition-colors">联系我们</Link>
        </p>
      </div>
    </footer>
  );
}
