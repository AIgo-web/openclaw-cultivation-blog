import React, { useEffect, useState } from 'react';
import type { TocHeading } from '../utils/toc';
import { extractHeadings, optimizeToc, getHeadingIndent } from '../utils/toc';

interface TableOfContentsProps {
  content: string;
  activeHeading?: string;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ content, activeHeading }) => {
  const [headings, setHeadings] = useState<TocHeading[]>([]);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const extracted = extractHeadings(content);
    const optimized = optimizeToc(extracted);
    setHeadings(optimized);
  }, [content]);

  // 监听滚动以粘贴 TOC
  useEffect(() => {
    const handleScroll = () => {
      const tocElement = document.getElementById('toc-container');
      if (tocElement) {
        const rect = tocElement.getBoundingClientRect();
        setIsSticky(rect.top <= 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (headings.length === 0) {
    return null;
  }

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      id="toc-container"
      className={`lg:fixed lg:top-20 lg:right-4 lg:w-56 transition-all duration-200 ${
        isSticky ? 'lg:fixed lg:top-0' : 'lg:relative'
      }`}
    >
      <div className="hidden lg:block bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 backdrop-blur-sm">
        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">
          文章目录
        </div>
        <nav className="space-y-1">
          {headings.map(heading => (
            <button
              key={heading.id}
              onClick={() => handleClick(heading.id)}
              className={`${getHeadingIndent(heading.level)} text-sm w-full text-left py-1 px-2 rounded transition-colors ${
                activeHeading === heading.id
                  ? 'text-lobster-500 dark:text-lobster-400 bg-lobster-50 dark:bg-gray-700'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <span className="line-clamp-2">{heading.text}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile accordion TOC */}
      <div className="lg:hidden mb-6">
        <details className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
          <summary className="cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <svg className="w-4 h-4 transition-transform" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            文章目录
          </summary>
          <nav className="mt-3 space-y-1">
            {headings.map(heading => (
              <button
                key={heading.id}
                onClick={() => handleClick(heading.id)}
                className={`${getHeadingIndent(heading.level)} text-sm w-full text-left py-1 px-2 rounded transition-colors ${
                  activeHeading === heading.id
                    ? 'text-lobster-500 dark:text-lobster-400 bg-lobster-50 dark:bg-gray-700'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <span className="line-clamp-2">{heading.text}</span>
              </button>
            ))}
          </nav>
        </details>
      </div>
    </div>
  );
};
