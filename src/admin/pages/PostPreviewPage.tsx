import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { getCategoryIcon, getCategoryName } from '../../data/categories';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import { TableOfContents } from '../../components/TableOfContents';
import { ShareButtons } from '../../components/ShareButtons';
import { getTagColor } from '../../data/tags';
import { Donation } from '../../components/Donation';
import { useDarkMode } from '../../hooks/useDarkMode';

interface PreviewPost {
  title: string;
  summary: string;
  content: string;
  tags: string[];
  date: string;
  category: string;
  readTime: number;
  coverImage?: string;
  coverColor?: string;
}

export default function PostPreviewPage() {
  const navigate = useNavigate();
  const { isDark } = useDarkMode();
  const [activeHeading, setActiveHeading] = useState<string>();
  const [readProgress, setReadProgress] = useState(0);
  const [post, setPost] = useState<PreviewPost | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 从 sessionStorage 读取预览数据
  useEffect(() => {
    const previewData = sessionStorage.getItem('post-preview');
    if (previewData) {
      try {
        const data = JSON.parse(previewData);
        setPost(data);
      } catch (e) {
        console.error('Failed to parse preview data:', e);
        navigate('/admin/posts');
      }
    } else {
      navigate('/admin/posts');
    }
  }, [navigate]);

  // 检测内容是否是完整的 HTML 文档
  const isFullHtmlDocument = post ? /<!DOCTYPE|<html/i.test(post.content) : false;

  // 滚动监听 - 同步 TOC 高亮 + 阅读进度
  useEffect(() => {
    const handleScroll = () => {
      // TOC 高亮
      const headings = document.querySelectorAll('article h1, article h2, article h3, article h4, article h5, article h6');
      let activeId: string | undefined;

      for (const heading of headings) {
        const rect = heading.getBoundingClientRect();
        if (rect.top >= 0 && rect.top <= 100) {
          activeId = heading.id;
          break;
        }
      }

      setActiveHeading(activeId);

      // 阅读进度
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(100, Math.round((scrollTop / docHeight) * 100)) : 0;
      setReadProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 将 HTML 内容加载到 iframe 中
  useEffect(() => {
    if (iframeRef.current && post && isFullHtmlDocument) {
      const iframe = iframeRef.current;
      iframe.srcdoc = post.content;
    }
  }, [post, isFullHtmlDocument]);

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <span className="text-6xl">🦞</span>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mt-6 mb-4">加载预览中...</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-0 lg:gap-8">
      {/* 阅读进度条 */}
      <div className="fixed top-0 left-0 w-full h-1 z-50 bg-gray-200 dark:bg-gray-800">
        <div
          className="h-full bg-lobster-500 transition-all duration-100"
          style={{ width: `${readProgress}%` }}
        />
      </div>

      {/* Main content */}
      <main className="flex-1 min-w-0 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-lobster-500 dark:hover:text-lobster-400 mb-6 transition-colors group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
            <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
          </svg>
          返回编辑器
        </button>

        {/* 预览提示 */}
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            💡 这是文章预览页面，您的更改还未保存。点击"返回编辑器"继续编辑或保存文章。
          </p>
        </div>

        {/* Article header */}
        <header className="mb-8">
          {/* Cover: image or gradient bar */}
          {post.coverImage ? (
            <div className="h-56 sm:h-72 rounded-xl overflow-hidden mb-5">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className={`h-1.5 rounded-full bg-gradient-to-r ${post.coverColor || 'from-lobster-400 to-orange-400'} mb-5`} />
          )}

          {/* Tags + Category */}
          <div className="flex flex-wrap gap-2 mb-4">
            {post.category && (
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                {getCategoryIcon(post.category)} {getCategoryName(post.category)}
              </span>
            )}
            {post.tags.map(tag => (
              <span
                key={tag}
                className={`tag-badge ${getTagColor(tag)} cursor-default`}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-5">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 dark:text-gray-500 pb-5 border-b border-gray-200 dark:border-gray-800">
            <span className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
              </svg>
              {format(new Date(post.date), 'yyyy年M月d日', { locale: zhCN })}
            </span>
            <span className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              约 {post.readTime} 分钟
            </span>
            {readProgress > 0 && (
              <span className="flex items-center gap-1.5 text-lobster-500 dark:text-lobster-400 font-medium">
                📖 {readProgress}%
              </span>
            )}
          </div>
        </header>

        {/* 手机端 TOC（内联，在文章内容上方） */}
        {isFullHtmlDocument ? null : (
          <div className="lg:hidden mb-6">
            <TableOfContents content={post.content} activeHeading={activeHeading} />
          </div>
        )}

        {/* Article content */}
        <article className="mb-10">
          {isFullHtmlDocument ? (
            <iframe
              ref={iframeRef}
              title="HTML Preview"
              className="w-full border-0"
              style={{ minHeight: '600px', background: isDark ? '#1a1a1a' : '#ffffff' }}
            />
          ) : (
            <MarkdownRenderer content={post.content} />
          )}
        </article>

        {/* Share */}
        <div className="py-5 border-t border-gray-200 dark:border-gray-800 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">觉得有帮助？分享给更多人 🦞</p>
            <div className="self-start sm:self-auto">
              <ShareButtons post={{
                id: 'preview',
                title: post.title,
                summary: post.summary,
                content: post.content,
                date: post.date,
                tags: post.tags,
                category: post.category,
                readTime: post.readTime,
                coverImage: post.coverImage
              }} />
            </div>
          </div>
        </div>

        {/* 打赏 */}
        <div className="flex flex-wrap items-center justify-center py-4 mb-8">
          <Donation author="OpenClaw" />
        </div>
      </main>

      {/* TOC Sidebar（桌面端固定侧边栏） */}
      {isFullHtmlDocument ? null : (
        <aside className="hidden lg:block flex-shrink-0">
          <TableOfContents content={post.content} activeHeading={activeHeading} />
        </aside>
      )}
    </div>
  );
}
