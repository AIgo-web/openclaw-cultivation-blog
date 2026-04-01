import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Eye, Download } from 'lucide-react';
import { usePosts } from '../contexts/PostsContext';
import { useViews } from '../contexts/ViewsContext';
import { useSeries } from '../contexts/SeriesContext';
import { getCategoryIcon, getCategoryName } from '../data/categories';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { TableOfContents } from '../components/TableOfContents';
import { ShareButtons } from '../components/ShareButtons';
import { CommentSection } from '../components/CommentSection';
import { getTagColor } from '../data/tags';
import { exportPost } from '../utils/exportPost';
import { Donation } from '../components/Donation';
import { setCanonicalUrl, generateArticleSchema, injectStructuredData, BLOG_URL } from '../services/seoService';

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeHeading, setActiveHeading] = useState<string>();
  const [readProgress, setReadProgress] = useState(0);
  const { posts } = usePosts();
  const { getViews, incrementViews } = useViews();
  const { seriesList } = useSeries();
  const post = posts.find(p => p.id === id);
  const currentIndex = posts.findIndex(p => p.id === id);
  const prevPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const nextPost = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 所属专题
  const currentSeries = post?.seriesId ? seriesList.find(s => s.id === post.seriesId) : null;
  // 专题中的有序文章列表（只显示已发布）
  const seriesPosts = currentSeries
    ? currentSeries.postIds
        .map(pid => posts.find(p => p.id === pid))
        .filter((p): p is NonNullable<typeof p> => !!p && p.status !== 'draft')
    : [];
  const seriesCurrentIndex = seriesPosts.findIndex(p => p.id === id);
  const seriesPrevPost = seriesCurrentIndex > 0 ? seriesPosts[seriesCurrentIndex - 1] : null;
  const seriesNextPost = seriesCurrentIndex < seriesPosts.length - 1 ? seriesPosts[seriesCurrentIndex + 1] : null;

  // 检测内容是否是完整的 HTML 文档
  const isFullHtmlDocument = post ? /<!DOCTYPE|<html/i.test(post.content) : false;

  // 自动计数浏览量
  useEffect(() => {
    if (id) incrementViews(id);
  }, [id, incrementViews]);

  // SEO: 动态设置 title 和 meta description
  useEffect(() => {
    if (!post) return;
    const prevTitle = document.title;
    document.title = `${post.title} - OpenClaw 龙虾养成计划`;

    // description
    let descEl = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!descEl) {
      descEl = document.createElement('meta');
      descEl.name = 'description';
      document.head.appendChild(descEl);
    }
    const prevDesc = descEl.content;
    descEl.content = post.summary.slice(0, 160);

    // og:title
    let ogTitleEl = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    if (!ogTitleEl) {
      ogTitleEl = document.createElement('meta');
      ogTitleEl.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitleEl);
    }
    ogTitleEl.content = post.title;

    // og:description
    let ogDescEl = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    if (!ogDescEl) {
      ogDescEl = document.createElement('meta');
      ogDescEl.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescEl);
    }
    ogDescEl.content = post.summary.slice(0, 160);

    // og:image
    let ogImgEl = document.querySelector<HTMLMetaElement>('meta[property="og:image"]');
    if (!ogImgEl) {
      ogImgEl = document.createElement('meta');
      ogImgEl.setAttribute('property', 'og:image');
      document.head.appendChild(ogImgEl);
    }
    if (post.coverImage) ogImgEl.content = post.coverImage;

    // og:url + canonical
    let ogUrlEl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');
    if (!ogUrlEl) {
      ogUrlEl = document.createElement('meta');
      ogUrlEl.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrlEl);
    }
    const articleUrl = `${BLOG_URL}/post/${post.id}`;
    ogUrlEl.content = articleUrl;
    setCanonicalUrl(articleUrl);

    // og:type + article metadata
    let ogTypeEl = document.querySelector<HTMLMetaElement>('meta[property="og:type"]');
    if (!ogTypeEl) {
      ogTypeEl = document.createElement('meta');
      ogTypeEl.setAttribute('property', 'og:type');
      document.head.appendChild(ogTypeEl);
    }
    ogTypeEl.content = 'article';

    const pubDate = new Date(post.date).toISOString();
    let pubTimeEl = document.querySelector<HTMLMetaElement>('meta[property="article:published_time"]');
    if (!pubTimeEl) {
      pubTimeEl = document.createElement('meta');
      pubTimeEl.setAttribute('property', 'article:published_time');
      document.head.appendChild(pubTimeEl);
    }
    pubTimeEl.content = pubDate;

    // Article JSON-LD schema
    const articleSchema = generateArticleSchema({
      title: post.title,
      description: post.summary,
      url: articleUrl,
      image: post.coverImage,
      author: 'OpenClaw 折腾人',
      publishedTime: pubDate,
      tags: post.tags,
    });
    injectStructuredData(articleSchema, 'article-schema');

    return () => {
      document.title = prevTitle;
      if (descEl) descEl.content = prevDesc;
      document.getElementById('article-schema')?.remove();
    };
  }, [post]);

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

          {/* Tags + Category + Series */}
          <div className="flex flex-wrap gap-2 mb-4">
            {post.category && (
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                {getCategoryIcon(post.category)} {getCategoryName(post.category)}
              </span>
            )}
            {currentSeries && (
              <Link
                to={`/series/${currentSeries.id}`}
                className="px-3 py-1 rounded-full text-sm font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300 hover:opacity-80 transition-opacity"
              >
                {currentSeries.icon || '📚'} {currentSeries.title}
                {seriesPosts.length > 0 && (
                  <span className="ml-1 opacity-70">({seriesCurrentIndex + 1}/{seriesPosts.length})</span>
                )}
              </Link>
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
              title="HTML Content"
              className="w-full border-0"
              style={{ minHeight: '600px' }}
            />
          ) : (
            <MarkdownRenderer content={post.content} />
          )}
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

        {/* 打赏 */}
        <div className="flex flex-wrap items-center justify-center py-4 mb-8">
          <Donation author="OpenClaw" />
        </div>

        {/* Comment Section */}
        {id && <CommentSection postId={id} />}

        {/* 所属专题信息 */}
        {currentSeries && (
          <section className="border-t border-gray-200 dark:border-gray-800 pt-8 mb-8">
            {/* 专题头部 */}
            <Link
              to={`/series/${currentSeries.id}`}
              className="flex items-start gap-4 p-5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 hover:shadow-md transition-all group mb-4"
            >
              <span className="text-3xl flex-shrink-0">{currentSeries.icon || '📚'}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                  本文属于专题系列 · 第 {seriesCurrentIndex + 1} / {seriesPosts.length} 篇
                </div>
                <h3 className="text-base font-bold text-amber-900 dark:text-amber-200 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors mb-1 truncate">
                  {currentSeries.title}
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-400/80 line-clamp-2">
                  {currentSeries.description}
                </p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-amber-500 group-hover:translate-x-1 transition-transform mt-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>

            {/* 专题内上下篇 */}
            {(seriesPrevPost || seriesNextPost) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {seriesPrevPost ? (
                  <Link
                    to={`/post/${seriesPrevPost.id}`}
                    className="card p-4 hover:shadow-md hover:-translate-y-0.5 group transition-all border border-amber-200/60 dark:border-amber-800/30"
                  >
                    <div className="text-xs text-amber-500 dark:text-amber-400 mb-1 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                      专题上一篇
                    </div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
                      {seriesPrevPost.title}
                    </div>
                  </Link>
                ) : <div className="hidden sm:block" />}

                {seriesNextPost ? (
                  <Link
                    to={`/post/${seriesNextPost.id}`}
                    className="card p-4 hover:shadow-md hover:-translate-y-0.5 group transition-all border border-amber-200/60 dark:border-amber-800/30 sm:text-right"
                  >
                    <div className="text-xs text-amber-500 dark:text-amber-400 mb-1 flex items-center gap-1 sm:justify-end">
                      专题下一篇
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
                      {seriesNextPost.title}
                    </div>
                  </Link>
                ) : <div className="hidden sm:block" />}
              </div>
            )}
          </section>
        )}

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
      {isFullHtmlDocument ? null : (
        <aside className="hidden lg:block flex-shrink-0">
          <TableOfContents content={post.content} activeHeading={activeHeading} />
        </aside>
      )}
    </div>
  );
}
