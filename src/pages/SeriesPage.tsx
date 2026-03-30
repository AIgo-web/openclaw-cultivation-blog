import { Link } from 'react-router-dom';
import { useSeries } from '../contexts/SeriesContext';
import { usePosts } from '../contexts/PostsContext';
import { BookOpen, Clock, ChevronRight } from 'lucide-react';

/**
 * 打开文件链接。base64 Data URL（上传文件）先转 Blob URL 再打开，避免 CSP 限制。
 */
function openUrl(url: string) {
  if (!url) return;
  if (url.startsWith('data:')) {
    try {
      const [header, base64] = url.split(',');
      const mime = header.match(/data:([^;]+)/)?.[1] || 'application/octet-stream';
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      const win = window.open(blobUrl, '_blank');
      if (win) setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
      else URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    }
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

/** 将一行文本中的 **...** 解析为 <strong>，其余为普通文本（行内） */
function renderInline(line: string) {
  const segments = line.split(/(\*\*[^*]+\*\*)/g).filter(s => s !== '');
  if (segments.length === 1 && !line.startsWith('**')) return <>{line}</>;
  return (
    <>
      {segments.map((seg, i) =>
        seg.startsWith('**') && seg.endsWith('**') ? (
          <strong key={i} className="font-semibold text-gray-800 dark:text-gray-200">
            {seg.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{seg}</span>
        )
      )}
    </>
  );
}

/** 按换行分段 + 行内粗体渲染 */
function renderDescription(text: string) {
  const lines = text.split(/\n+/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length <= 1) {
    return <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{renderInline(text.trim())}</p>;
  }
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => (
        <p key={i} className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{renderInline(line)}</p>
      ))}
    </div>
  );
}

const COVER_COLORS = [
  'from-lobster-400 to-lobster-600',
  'from-blue-400 to-blue-600',
  'from-purple-400 to-purple-600',
  'from-green-400 to-green-600',
  'from-amber-400 to-amber-600',
];

export default function SeriesPage() {
  const { seriesList } = useSeries();
  const { posts } = usePosts();

  const publishedSeries = seriesList.filter(s => s.status === 'published');

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Header */}
      <section className="mb-10">
        <div className="inline-flex items-center gap-3 mb-3">
          <span className="text-5xl">📚</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          专题合集
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
          精心策划的系列内容，帮你系统掌握每个主题
        </p>
        <div className="flex items-center gap-6 mt-5">
          <div className="text-center">
            <div className="text-xl font-bold text-lobster-500">{publishedSeries.length}</div>
            <div className="text-xs text-gray-400 dark:text-gray-500">个专题</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-lobster-500">
              {publishedSeries.reduce((sum, s) => sum + s.postIds.length, 0)}
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500">篇文章</div>
          </div>
        </div>
      </section>

      {/* Series Grid */}
      {publishedSeries.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-5xl block mb-4">📚</span>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            暂无专题
          </h3>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            管理员正在整理中，敬请期待
          </p>
          <Link
            to="/"
            className="text-lobster-500 hover:text-lobster-600 text-sm mt-4 inline-block"
          >
            ← 返回首页查看全部文章
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {publishedSeries.map((series, idx) => {
            const seriesPosts = series.postIds
              .map(id => posts.find(p => p.id === id))
              .filter(Boolean);
            const publishedPosts = seriesPosts.filter(p => !p!.status || p!.status === 'published');
            const totalReadTime = publishedPosts.reduce((sum, p) => sum + (p?.readTime || 0), 0);
            const coverColor = series.coverColor || COVER_COLORS[idx % COVER_COLORS.length];

            return (
              <Link
                key={series.id}
                to={`/series/${series.id}`}
                className="group flex flex-col sm:flex-row rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1d27] hover:border-lobster-300 dark:hover:border-lobster-700 hover:shadow-xl dark:hover:shadow-lobster-900/10 transition-all duration-300"
              >
                {/* Cover */}
                <div className={`relative bg-gradient-to-br ${coverColor} sm:w-44 h-36 sm:h-auto flex-shrink-0 flex flex-col items-center justify-center gap-2`}>
                  <span className="text-5xl group-hover:scale-110 transition-transform duration-300 drop-shadow">
                    {series.icon || '📚'}
                  </span>
                  {/* 统计徽章 */}
                  <div className="flex items-center gap-1 bg-black/20 backdrop-blur-sm rounded-full px-2.5 py-1 text-white/90 text-xs font-medium">
                    <BookOpen className="w-3 h-3" />
                    <span>{publishedPosts.length} 篇</span>
                    {totalReadTime > 0 && (
                      <>
                        <span className="opacity-50">·</span>
                        <Clock className="w-3 h-3" />
                        <span>{totalReadTime} 分钟</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between min-w-0">
                  {/* 标题 */}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2.5 group-hover:text-lobster-500 dark:group-hover:text-lobster-400 transition-colors leading-tight">
                      {series.title}
                    </h2>

                    {/* 简介：左边竖线 + 正文 */}
                    {series.description ? (
                      <div className="flex gap-2.5 mb-4">
                        <div className={`w-0.5 flex-shrink-0 rounded-full bg-gradient-to-b ${coverColor} opacity-60 self-stretch min-h-[1em]`} />
                        <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed min-w-0">
                          {renderDescription(series.description)}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 dark:text-gray-500 mb-4 italic">暂无简介</p>
                    )}
                  </div>

                  {/* 相关主题：分隔线 + 列表 */}
                  {(() => {
                    const reportsCount   = (series.reports   || []).length;
                    const materialsCount = (series.materials || []).length;
                    const platformsCount = (series.platforms || []).length;
                    const toolsCount     = (series.tools     || []).length;
                    const sectionsCount  = (series.sections  || []).length;
                    const hasAny = true; // 固定4个资源主题始终显示
                    if (!hasAny) return null;

                    return (
                      <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                        <div className="text-xs text-gray-400 dark:text-gray-500 font-medium mb-2 flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/></svg>
                          相关主题
                        </div>
                        <div className="space-y-1.5">
                          {/* 文章列表 */}
                          {publishedPosts.map((post, i) => (
                            <div key={post!.id} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                              <span className="w-5 h-5 flex-shrink-0 rounded-full bg-gray-100 dark:bg-gray-800 text-xs flex items-center justify-center font-semibold text-gray-400 dark:text-gray-500">
                                {i + 1}
                              </span>
                              <span className="truncate group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">{post!.title}</span>
                            </div>
                          ))}

                          {/* 报告文件：每条单独展示，可点击 */}
                          {reportsCount === 0 ? (
                            <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
                              <span className="w-5 h-5 flex-shrink-0 rounded-full bg-gray-100 dark:bg-gray-800 text-xs flex items-center justify-center">📄</span>
                              <span className="truncate">报告文件</span>
                              <span className="ml-auto flex-shrink-0 text-xs text-gray-300 dark:text-gray-600">0 项</span>
                            </div>
                          ) : (
                            (series.reports || []).map(r => {
                              const pdfUrl  = r.pdfUrl  || (r.type === 'pdf'  ? r.url : undefined);
                              const htmlUrl = r.htmlUrl || (r.type === 'html' ? r.url : undefined);
                              return (
                                <div key={r.id} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                  <span className="w-5 h-5 flex-shrink-0 rounded-full bg-red-50 dark:bg-red-900/20 text-xs flex items-center justify-center">📄</span>
                                  <span className="flex-1 truncate">{r.title}</span>
                                  <div className="flex gap-1 flex-shrink-0">
                                    {pdfUrl && (
                                      <button
                                        onClick={e => { e.preventDefault(); e.stopPropagation(); openUrl(pdfUrl); }}
                                        className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors whitespace-nowrap"
                                      >
                                        {pdfUrl.startsWith('data:') ? 'PDF↗' : '打开 PDF'}
                                      </button>
                                    )}
                                    {htmlUrl && (
                                      <button
                                        onClick={e => { e.preventDefault(); e.stopPropagation(); openUrl(htmlUrl); }}
                                        className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors whitespace-nowrap"
                                      >
                                        {htmlUrl.startsWith('data:') ? 'HTML↗' : '打开 HTML'}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}

                          {/* 其余资源主题：显示分类+数量 */}
                          {[
                            { label: '资料与资质', count: materialsCount, emoji: '🗂️' },
                            { label: '相关平台',   count: platformsCount,  emoji: '🌐' },
                            { label: '工具软件',   count: toolsCount,      emoji: '🔧' },
                            ...(series.sections || []).map(s => ({ label: s.title, count: s.items.length, emoji: s.icon || '📌' })),
                          ].map(r => (
                            <div key={r.label} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                              <span className="w-5 h-5 flex-shrink-0 rounded-full bg-gray-100 dark:bg-gray-800 text-xs flex items-center justify-center">
                                {r.emoji}
                              </span>
                              <span className="truncate">{r.label}</span>
                              <span className="ml-auto flex-shrink-0 text-xs text-gray-300 dark:text-gray-600">{r.count} 项</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="flex items-center justify-end mt-4">
                    <span className="text-sm font-medium text-lobster-500 dark:text-lobster-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                      进入专题
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
