import { Link, useLocation } from 'react-router-dom';
import { useDarkMode } from '../hooks/useDarkMode';
import { SearchBar } from './SearchBar';

export default function Navbar() {
  const { isDark, toggle } = useDarkMode();
  const location = useLocation();

  const navItems = [
    { to: '/', label: '首页' },
    { to: '/series', label: '专题' },
    { to: '/tags', label: '标签' },
    { to: '/about', label: '关于' },
    { to: '/contact', label: '联系' },
  ];

  return (
    <>
      {/* Skip Link - 无障碍跳转 */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-lobster-500 focus:text-white focus:rounded-lg focus:font-medium focus:shadow-lg"
      >
        跳到主要内容
      </a>

    <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#1a1d27]/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 transition-colors">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
        {/* 主行：Logo + 导航 + 搜索(桌面) + 暗模式 */}
        <div className="flex items-center justify-between gap-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <span className="text-2xl group-hover:scale-110 transition-transform duration-300 inline-block lobster-swim">🦞</span>
            <span className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
              <span className="hidden xs:inline">OpenClaw</span>
              <span className="text-lobster-500">龙虾</span>
              <span className="hidden sm:inline">养成计划</span>
            </span>
          </Link>

          {/* 桌面搜索框（居中） */}
          <div className="hidden sm:block flex-1 max-w-xs mx-4">
            <SearchBar />
          </div>

          {/* 右侧：导航链接 + 暗模式 */}
          <div className="flex items-center gap-1 sm:gap-4">
            {navItems.map(item => (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-link text-sm px-2 py-1 rounded-lg transition-colors ${
                  location.pathname === item.to
                    ? 'text-lobster-500 dark:text-lobster-400 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {item.label}
              </Link>
            ))}

            <button
              onClick={toggle}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300 shrink-0"
              aria-label="切换主题"
            >
              {isDark ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* 手机搜索框（第二行） */}
        <div className="sm:hidden mt-2">
          <SearchBar />
        </div>
      </nav>
    </header>
    </>
  );
}
