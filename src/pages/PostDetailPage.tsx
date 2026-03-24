import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Eye, Download } from 'lucide-react';
import { usePosts } from '../contexts/PostsContext';
import { useViews } from '../contexts/ViewsContext';
import { getCategoryIcon, getCategoryName } from '../data/categories';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { TableOfContents } from '../components/TableOfContents';
import { ShareButtons } from '../components/ShareButtons';
import { CommentSection } from '../components/CommentSection';
import { getTagColor } from '../data/tags';
import { exportPost } from '../utils/exportPost';

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeHeading, setActiveHeading] = useState<string>();
  const [readProgress, setReadProgress] = useState(0);
  const { posts } = usePosts();
  const { getViews, incrementViews } = useViews();
  const post = posts.find(p => p.id === id);
  const currentIndex = posts.findIndex(p => p.id === id);
  const prevPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const nextPost = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;

  // 自动计数浏览量
  useEffect(() => {
    if (id) incrementViews(id);
  }, [id, incrementViews]);

  // ✅ 滚动监听 - 同步 TOC 高亮 + 阅读进度
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

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <span className="text-6xl">🦞</span>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mt-6 mb-4">文章不存在</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">这篇文章可能已经被删除，或者链接有误。</p>
        <Link to="/" className="btn-primary">
          返回首页
        </Link>
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
          返回
        </button>

        {/* Article header */}
        <header className="mb-8">
          {/* Cover gradient bar */}
          <div className={`h-1.5 rounded-full bg-gradient-to-r ${post.coverColor || 'from-lobster-400 to-orange-400'} mb-5`} />

          {/* Tags + Category */}
          <div className="flex flex-wrap gap-2 mb-4">
            {post.category && (
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                {getCategoryIcon(post.category)} {getCategoryName(post.category)}
              </span>
            )}
            {post.tags.map(tag => (
              <Link
                key={tag}
                to={`/tags?tag=${encodeURIComponent(tag)}`}
                className={`tag-badge ${getTagColor(tag)} hover:opacity-80`}
              >
                {tag}
              </Link>
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
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              {(getViews(post.id) || 0).toLocaleString()} 次
            </span>
            {readProgress > 0 && (
              <span className="flex items-center gap-1.5 text-lobster-500 dark:text-lobster-400 font-medium">
                📖 {readProgress}%
              </span>
            )}
          </div>
        </header>

        {/* 手机端 TOC（内联，在文章内容上方） */}
        <div className="lg:hidden mb-6">
          <TableOfContents content={post.content} activeHeading={activeHeading} />
        </div>

        {/* Article content */}
        <article className="mb-10">
          <MarkdownRenderer content={post.content} />
        </article>

        {/* Share + Export */}
        <div className="py-5 border-t border-gray-200 dark:border-gray-800 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-sm text-gray-500 dark:text-gray-400">觉得有帮助？分享给更多人 🦞</p>
              <button
                onClick={() => exportPost(post)}
                title="导出为 Markdown"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-lobster-400 hover:text-lobster-500 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                导出 .md
              </button>
            </div>
            <div className="self-start sm:self-auto">
              <ShareButtons post={post} />
            </div>
          </div>
        </div>

        {/* Comment Section */}
        {id && <CommentSection postId={id} />}

        {/* Related Posts */}
        {(() => {
          // 优先用手动指定，否则按标签自动匹配
          let relatedPosts = [];
          if (post.relatedPostIds && post.relatedPostIds.length > 0) {
            relatedPosts = post.relatedPostIds
              .map(rid => posts.find(p => p.id === rid && p.status !== 'draft'))
              .filter(Boolean) as typeof posts;
          } else {
            relatedPosts = posts
              .filter(p =>
                p.id !== post.id &&
                p.status !== 'draft' &&
                p.tags.some(t => post.tags.includes(t))
              )
              .sort((a, b) => {
                // 共同标签越多越靠前
                const aScore = a.tags.filter(t => post.tags.includes(t)).length;
                const bScore = b.tags.filter(t => post.tags.includes(t)).length;
                return bScore - aScore;
              })
              .slice(0, 4);
          }
          if (relatedPosts.length === 0) return null;
          return (
            <section className="border-t border-gray-200 dark:border-gray-800 pt-8 mb-8">
              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-lobster-500 rounded-full inline-block" />
                关联阅读
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {relatedPosts.map(related => (
                  <Link
                    key={related.id}
                    to={`/post/${related.id}`}
                    className="card p-4 hover:shadow-md hover:-translate-y-0.5 group transition-all"
                  >
                    <div className={`h-0.5 rounded-full bg-gradient-to-r ${related.coverColor || 'from-lobster-400 to-orange-400'} mb-3`} />
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-lobster-500 dark:group-hover:text-lobster-400 transition-colors line-clamp-2 mb-2">
                      {related.title}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                      <span>{related.date}</span>
                      <span>·</span>
                      <span>约 {related.readTime} 分钟</span>
                    </div>
                    {related.tags.filter(t => post.tags.includes(t)).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {related.tags.filter(t => post.tags.includes(t)).slice(0, 2).map(t => (
                          <span key={t} className={`text-xs px-2 py-0.5 rounded-full ${getTagColor(t)}`}>{t}</span>
                        ))}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          );
        })()}

        {/* Prev/Next navigation */}
        <nav className="border-t border-gray-200 dark:border-gray-800 pt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prevPost ? (
            <Link
              to={`/post/${prevPost.id}`}
              className="card p-4 hover:shadow-md hover:-translate-y-0.5 group"
            >
              <div className="text-xs text-gray-400 dark:text-gray-500 mb-1 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
                </svg>
                上一篇
              </div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-lobster-500 dark:group-hover:text-lobster-400 transition-colors line-clamp-2">
                {prevPost.title}
              </div>
            </Link>
          ) : <div className="hidden sm:block" />}

          {nextPost ? (
            <Link
              to={`/post/${nextPost.id}`}
              className="card p-4 hover:shadow-md hover:-translate-y-0.5 group sm:text-right"
            >
              <div className="text-xs text-gray-400 dark:text-gray-500 mb-1 flex items-center gap-1 sm:justify-end">
                下一篇
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
              </div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-lobster-500 dark:group-hover:text-lobster-400 transition-colors line-clamp-2">
                {nextPost.title}
              </div>
            </Link>
          ) : <div className="hidden sm:block" />}
        </nav>
      </main>

      {/* TOC Sidebar（桌面端固定侧边栏） */}
      <aside className="hidden lg:block flex-shrink-0">
        <TableOfContents content={post.content} activeHeading={activeHeading} />
      </aside>
    </div>
  );
}
