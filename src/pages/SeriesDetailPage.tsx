import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSeries } from '../contexts/SeriesContext';
import { usePosts } from '../contexts/PostsContext';
import {
  BookOpen, Clock, ChevronRight, ArrowLeft,
  FileText, FolderOpen, Globe, Wrench,
  Download, ExternalLink, File, FileImage, Archive, Code,
} from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { SeriesReport, SeriesMaterial, SeriesPlatform, SeriesTool } from '../types';

/**
 * 将简介文本按 **粗体** 分段渲染：
 * - 检测到 **文字** 时作为段落标题（加粗 + 颜色）
 * - 其后跟随的普通文字作为段落正文
 */
function renderDescription(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(p => p !== '');
  const paragraphs: { bold: string; body: string }[] = [];
  let current: { bold: string; body: string } | null = null;

  for (const part of parts) {
    if (part.startsWith('**') && part.endsWith('**')) {
      if (current) paragraphs.push(current);
      current = { bold: part.slice(2, -2), body: '' };
    } else {
      if (current) {
        current.body += part;
      } else {
        paragraphs.push({ bold: '', body: part });
      }
    }
  }
  if (current) paragraphs.push(current);

  if (paragraphs.length === 0) return <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-7">{text}</p>;

  return (
    <div className="space-y-3">
      {paragraphs.map((p, i) => (
        <div key={i}>
          {p.bold && (
            <p className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-100 mb-0.5">
              {p.bold}
            </p>
          )}
          {p.body.trim() && (
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-7">
              {p.body.trim()}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── 工具函数 ─────────────────────────────────────────────────────────────────

function fileTypeIcon(type: string) {
  switch (type) {
    case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
    case 'html': return <Code className="w-5 h-5 text-blue-500" />;
    case 'doc': return <FileText className="w-5 h-5 text-blue-400" />;
    case 'image': return <FileImage className="w-5 h-5 text-green-500" />;
    case 'zip': return <Archive className="w-5 h-5 text-yellow-500" />;
    default: return <File className="w-5 h-5 text-gray-400" />;
  }
}

function fileTypeBadge(type: string) {
  const map: Record<string, string> = {
    pdf: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    html: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    doc: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400',
    image: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    zip: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    other: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  };
  return map[type] || map.other;
}

// ─── 子区块组件 ───────────────────────────────────────────────────────────────

function EmptyHint({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="text-center py-14">
      <span className="text-4xl block mb-3">{icon}</span>
      <p className="text-gray-400 dark:text-gray-500 text-sm">{text}</p>
    </div>
  );
}

/** Tab1：报告文件 */
function ReportsTab({ reports }: { reports: SeriesReport[] }) {
  if (!reports || reports.length === 0) {
    return <EmptyHint icon="📄" text="暂无报告文件" />;
  }
  return (
    <div className="space-y-3">
      {reports.map(r => (
        <a
          key={r.id}
          href={r.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-start gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1d27] hover:border-lobster-300 dark:hover:border-lobster-700 hover:shadow-md transition-all"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
            {fileTypeIcon(r.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-medium text-gray-900 dark:text-white group-hover:text-lobster-500 transition-colors">
                {r.title}
              </span>
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium uppercase ${fileTypeBadge(r.type)}`}>
                {r.type}
              </span>
              {r.size && (
                <span className="text-xs text-gray-400 dark:text-gray-500">{r.size}</span>
              )}
            </div>
            {r.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{r.description}</p>
            )}
          </div>
          <div className="flex-shrink-0 flex items-center gap-1 text-xs text-gray-400 group-hover:text-lobster-500 transition-colors pt-0.5">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">查看/下载</span>
          </div>
        </a>
      ))}
    </div>
  );
}

/** Tab2：资料与资质 */
function MaterialsTab({ materials }: { materials: SeriesMaterial[] }) {
  if (!materials || materials.length === 0) {
    return <EmptyHint icon="🗂️" text="暂无资料文件" />;
  }
  return (
    <div className="space-y-3">
      {materials.map(m => (
        <a
          key={m.id}
          href={m.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-start gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1d27] hover:border-lobster-300 dark:hover:border-lobster-700 hover:shadow-md transition-all"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
            {fileTypeIcon(m.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-medium text-gray-900 dark:text-white group-hover:text-lobster-500 transition-colors">
                {m.title}
              </span>
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium uppercase ${fileTypeBadge(m.type)}`}>
                {m.type}
              </span>
              {m.size && (
                <span className="text-xs text-gray-400 dark:text-gray-500">{m.size}</span>
              )}
            </div>
            {m.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{m.description}</p>
            )}
          </div>
          <div className="flex-shrink-0 flex items-center gap-1 text-xs text-gray-400 group-hover:text-lobster-500 transition-colors pt-0.5">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">下载</span>
          </div>
        </a>
      ))}
    </div>
  );
}

/** Tab3：平台网址 */
function PlatformsTab({ platforms }: { platforms: SeriesPlatform[] }) {
  if (!platforms || platforms.length === 0) {
    return <EmptyHint icon="🌐" text="暂无平台链接" />;
  }

  // 按 category 分组
  const grouped: Record<string, SeriesPlatform[]> = {};
  platforms.forEach(p => {
    const cat = p.category || '其他';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(p);
  });
  const categories = Object.keys(grouped);

  return (
    <div className="space-y-6">
      {categories.map(cat => (
        <div key={cat}>
          {categories.length > 1 && (
            <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-1">
              {cat}
            </h3>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {grouped[cat].map(p => (
              <a
                key={p.id}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1d27] hover:border-lobster-300 dark:hover:border-lobster-700 hover:shadow-md transition-all"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-xl">
                  {p.icon || '🔗'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white group-hover:text-lobster-500 transition-colors truncate">
                    {p.name}
                  </p>
                  {p.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{p.description}</p>
                  )}
                </div>
                <ExternalLink className="flex-shrink-0 w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-lobster-400 transition-colors" />
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Tab4：工具软件 */
function ToolsTab({ tools }: { tools: SeriesTool[] }) {
  if (!tools || tools.length === 0) {
    return <EmptyHint icon="🛠️" text="暂无工具软件" />;
  }
  return (
    <div className="space-y-3">
      {tools.map(t => (
        <a
          key={t.id}
          href={t.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-start gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1d27] hover:border-lobster-300 dark:hover:border-lobster-700 hover:shadow-md transition-all"
        >
          <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-2xl">
            {t.icon || '⚙️'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-medium text-gray-900 dark:text-white group-hover:text-lobster-500 transition-colors">
                {t.name}
              </span>
              {t.version && (
                <span className="text-xs text-gray-400 dark:text-gray-500">v{t.version}</span>
              )}
              {t.isFree !== undefined && (
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                  t.isFree
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                }`}>
                  {t.isFree ? '免费' : '付费'}
                </span>
              )}
            </div>
            {t.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-1">{t.description}</p>
            )}
            {t.platform && (
              <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                <Wrench className="w-3 h-3" />
                {t.platform}
              </p>
            )}
          </div>
          <div className="flex-shrink-0 flex items-center gap-1 text-xs text-gray-400 group-hover:text-lobster-500 transition-colors pt-0.5">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">下载</span>
          </div>
        </a>
      ))}
    </div>
  );
}

// ─── 主页面 ───────────────────────────────────────────────────────────────────

type TabKey = 'posts' | 'reports' | 'materials' | 'platforms' | 'tools';

const TABS: { key: TabKey; label: string; icon: React.ReactNode; countKey?: 'posts' | 'reports' | 'materials' | 'platforms' | 'tools' }[] = [
  { key: 'posts', label: '目录', icon: <BookOpen className="w-4 h-4" /> },
  { key: 'reports', label: '报告', icon: <FileText className="w-4 h-4" /> },
  { key: 'materials', label: '资料', icon: <FolderOpen className="w-4 h-4" /> },
  { key: 'platforms', label: '平台', icon: <Globe className="w-4 h-4" /> },
  { key: 'tools', label: '工具', icon: <Wrench className="w-4 h-4" /> },
];

export default function SeriesDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getSeriesById } = useSeries();
  const { posts } = usePosts();
  const [activeTab, setActiveTab] = useState<TabKey>('posts');

  const series = id ? getSeriesById(id) : undefined;

  if (!series || series.status !== 'published') {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 text-center">
        <span className="text-5xl block mb-4">😵</span>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">专题不存在</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">该专题可能已被删除或尚未发布</p>
        <Link
          to="/series"
          className="inline-flex items-center gap-2 text-lobster-500 hover:text-lobster-600 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          返回专题列表
        </Link>
      </main>
    );
  }

  const seriesPosts = series.postIds
    .map(pid => posts.find(p => p.id === pid))
    .filter(p => p && (!p.status || p.status === 'published'));

  const totalReadTime = seriesPosts.reduce((sum, p) => sum + (p?.readTime || 0), 0);

  // 各 Tab 的数量徽章
  const counts: Partial<Record<TabKey, number>> = {
    posts: seriesPosts.length,
    reports: (series.reports || []).length,
    materials: (series.materials || []).length,
    platforms: (series.platforms || []).length,
    tools: (series.tools || []).length,
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 mb-6">
        <Link to="/" className="hover:text-lobster-500 transition-colors">首页</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/series" className="hover:text-lobster-500 transition-colors">专题合集</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-600 dark:text-gray-300 truncate">{series.title}</span>
      </div>

      {/* Hero */}
      <section className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mb-10 shadow-sm">
        {/* 顶部彩色条 */}
        <div className={`h-2 w-full bg-gradient-to-r ${series.coverColor || 'from-lobster-400 to-lobster-600'}`} />

        <div className="p-7 sm:p-10">
          {/* 图标 + 标题行 */}
          <div className="flex items-start gap-4 mb-5">
            <div className={`w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-2xl bg-gradient-to-br ${series.coverColor || 'from-lobster-400 to-lobster-600'} flex items-center justify-center shadow-md`}>
              <span className="text-3xl sm:text-4xl drop-shadow">{series.icon || '📚'}</span>
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight mb-2">
                {series.title}
              </h1>
              {/* 统计胶囊 */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  {seriesPosts.length} 篇文章
                </span>
                {totalReadTime > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1">
                    <Clock className="w-3.5 h-3.5" />
                    约 {totalReadTime} 分钟读完
                  </span>
                )}
                {(series.reports || []).length > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1">
                    <FileText className="w-3.5 h-3.5" />
                    {(series.reports || []).length} 份报告
                  </span>
                )}
                {(series.platforms || []).length > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1">
                    <Globe className="w-3.5 h-3.5" />
                    {(series.platforms || []).length} 个平台
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 简介 */}
          {series.description && (
            <div className="flex gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className={`w-1 flex-shrink-0 rounded-full bg-gradient-to-b ${series.coverColor || 'from-lobster-400 to-lobster-600'} self-stretch min-h-[1em]`} />
              <div className="flex-1 min-w-0">
                {renderDescription(series.description)}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Tab 区域 ── */}
      <section>
        {/* Tab 导航 */}
        <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-800 mb-6 overflow-x-auto scrollbar-none">
          {TABS.map(tab => {
            const count = counts[tab.key] ?? 0;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                  isActive
                    ? 'border-lobster-500 text-lobster-600 dark:text-lobster-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {tab.icon}
                {tab.label}
                {count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                    isActive
                      ? 'bg-lobster-100 text-lobster-600 dark:bg-lobster-900/30 dark:text-lobster-400'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab 内容 */}
        {activeTab === 'posts' && (
          <>
            {seriesPosts.length > 0 && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 mb-5">
                <span className="text-amber-500 text-lg flex-shrink-0">💡</span>
                <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
                  建议按顺序阅读，从第 1 篇开始，循序渐进掌握本专题内容。
                </p>
              </div>
            )}
            {seriesPosts.length === 0 ? (
              <EmptyHint icon="🦞" text="专题内暂无文章" />
            ) : (
              <div className="space-y-2">
                {seriesPosts.map((post, index) => (
                  <Link
                    key={post!.id}
                    to={`/post/${post!.id}`}
                    className="group flex items-start gap-0 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1d27] hover:border-lobster-300 dark:hover:border-lobster-700 hover:shadow-md transition-all duration-200 overflow-hidden"
                  >
                    {/* 左侧序号 */}
                    <div className="flex-shrink-0 w-12 sm:w-14 flex flex-col items-center justify-start pt-4 pb-4 gap-1">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 border-lobster-400 bg-lobster-50 dark:bg-lobster-900/20 text-lobster-600 dark:text-lobster-400">
                        {index + 1}
                      </div>
                      {index < seriesPosts.length - 1 && (
                        <div className="w-0.5 flex-1 min-h-[12px] bg-gray-200 dark:bg-gray-700 rounded mt-1" />
                      )}
                    </div>

                    {/* 右侧内容 */}
                    <div className="flex-1 min-w-0 px-4 py-4 border-l border-gray-100 dark:border-gray-800">
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-lobster-500 dark:group-hover:text-lobster-400 transition-colors leading-snug mb-1.5 pr-6">
                        {post!.title}
                      </h3>
                      {post!.summary && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-2.5">
                          {post!.summary}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                          {format(new Date(post!.date), 'yyyy年M月d日', { locale: zhCN })}
                        </span>
                        <span className="text-gray-300 dark:text-gray-700">·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          约 {post!.readTime} 分钟
                        </span>
                      </div>
                    </div>

                    <div className="flex-shrink-0 flex items-center pr-4 self-stretch">
                      <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-lobster-400 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'reports' && <ReportsTab reports={series.reports || []} />}
        {activeTab === 'materials' && <MaterialsTab materials={series.materials || []} />}
        {activeTab === 'platforms' && <PlatformsTab platforms={series.platforms || []} />}
        {activeTab === 'tools' && <ToolsTab tools={series.tools || []} />}
      </section>

      {/* Bottom nav */}
      <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <Link
          to="/series"
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-lobster-500 dark:hover:text-lobster-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          所有专题
        </Link>
        <Link
          to="/"
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-lobster-500 dark:hover:text-lobster-400 transition-colors"
        >
          返回首页
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </main>
  );
}
