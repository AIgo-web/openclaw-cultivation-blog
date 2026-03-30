import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSeries } from '../contexts/SeriesContext';
import { usePosts } from '../contexts/PostsContext';
import {
  BookOpen, Clock, ChevronRight, ArrowLeft,
  FileText, FolderOpen, Globe, Wrench,
  Download, ExternalLink, File, FileImage, Archive, Code, Layers,
} from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { SeriesReport, SeriesMaterial, SeriesPlatform, SeriesTool, SeriesSection } from '../types';

// ─── 简介渲染（支持换行分段 + 行内 **粗体**）────────────────────────────────────

/** 将一行文本中的 **...** 解析为 <strong>，其余为普通文本 */
function renderInline(line: string, key: number) {
  const segments = line.split(/(\*\*[^*]+\*\*)/g).filter(s => s !== '');
  if (segments.length === 1 && !line.startsWith('**')) {
    return (
      <p key={key} className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-7">
        {line}
      </p>
    );
  }
  return (
    <p key={key} className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-7">
      {segments.map((seg, i) =>
        seg.startsWith('**') && seg.endsWith('**') ? (
          <strong key={i} className="font-semibold text-gray-800 dark:text-gray-100">
            {seg.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{seg}</span>
        )
      )}
    </p>
  );
}

function renderDescription(text: string) {
  // 按换行符分段，过滤掉空行但保留段落间距
  const lines = text.split(/\n+/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0)
    return <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-7">{text}</p>;
  if (lines.length === 1)
    return renderInline(lines[0], 0);
  return <div className="space-y-2">{lines.map((line, i) => renderInline(line, i))}</div>;
}

// ─── 工具函数 ─────────────────────────────────────────────────────────────────

/**
 * 打开文件链接。
 * - 普通 URL：直接在新标签页打开
 * - base64 Data URL（本地上传文件）：转为 Blob URL 再打开，避免浏览器 CSP 限制
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
      // 延迟释放，让浏览器有时间加载
      if (win) setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
      else URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    }
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}


function fileTypeIcon(type: string) {
  switch (type) {
    case 'pdf':   return <FileText  className="w-5 h-5 text-red-500" />;
    case 'html':  return <Code      className="w-5 h-5 text-blue-500" />;
    case 'doc':   return <FileText  className="w-5 h-5 text-blue-400" />;
    case 'image': return <FileImage className="w-5 h-5 text-green-500" />;
    case 'zip':   return <Archive   className="w-5 h-5 text-yellow-500" />;
    default:      return <File      className="w-5 h-5 text-gray-400" />;
  }
}

function fileTypeBadge(type: string) {
  const map: Record<string, string> = {
    pdf:   'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    html:  'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    doc:   'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400',
    image: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    zip:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    other: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  };
  return map[type] || map.other;
}

// ─── 分区标题组件 ─────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  count?: number;
  accent?: string; // Tailwind 色彩前缀，如 'red' 'blue' 'green' 'amber'
}

function SectionHeader({ icon, title, description, count, accent = 'lobster' }: SectionHeaderProps) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-${accent}-50 dark:bg-${accent}-900/20 text-${accent}-500`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight">
            {title}
          </h2>
          {count !== undefined && count > 0 && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium bg-${accent}-100 text-${accent}-600 dark:bg-${accent}-900/30 dark:text-${accent}-400`}>
              {count} 项
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
    </div>
  );
}

// ─── 空提示 ───────────────────────────────────────────────────────────────────

function EmptyHint({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="text-center py-10 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
      <span className="text-3xl block mb-2">{icon}</span>
      <p className="text-gray-400 dark:text-gray-500 text-sm">{text}</p>
    </div>
  );
}

// ─── 固定分区：报告文件 ───────────────────────────────────────────────────────

function ReportsSection({ reports }: { reports: SeriesReport[] }) {
  return (
    <section className="mb-10">
      <SectionHeader
        icon={<FileText className="w-5 h-5" />}
        title="报告文件"
        description="完整报告下载与在线查阅，支持 PDF 和 HTML 格式"
        count={reports.length}
        accent="red"
      />
      {reports.length === 0 ? (
        <EmptyHint icon="📄" text="暂无报告文件，可在后台「资源 → 报告文件」中添加" />
      ) : (
        <div className="space-y-3">
          {reports.map(r => {
            const pdfUrl  = r.pdfUrl  || (r.type === 'pdf'  ? r.url : undefined);
            const htmlUrl = r.htmlUrl || (r.type === 'html' ? r.url : undefined);
            return (
              <div
                key={r.id}
                className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1d27]"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {r.title}
                    </span>
                    {r.size && <span className="text-xs text-gray-400 dark:text-gray-500">{r.size}</span>}
                  </div>
                  {r.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-2">{r.description}</p>
                  )}
                  {/* 打开按钮 */}
                  <div className="flex gap-2 flex-wrap">
                    {pdfUrl && (
                      <button
                        onClick={() => openUrl(pdfUrl)}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 font-medium transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        {pdfUrl.startsWith('data:') ? '打开 PDF（本地）' : '打开 PDF'}
                      </button>
                    )}
                    {htmlUrl && (
                      <button
                        onClick={() => openUrl(htmlUrl)}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 font-medium transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        {htmlUrl.startsWith('data:') ? '打开 HTML（本地）' : '打开 HTML'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ─── 固定分区：资料与资质 ─────────────────────────────────────────────────────

function MaterialsSection({ materials }: { materials: SeriesMaterial[] }) {
  return (
    <section className="mb-10">
      <SectionHeader
        icon={<FolderOpen className="w-5 h-5" />}
        title="资料与资质"
        description="相关资质材料、参考资料，可供下载和查阅"
        count={materials.length}
        accent="blue"
      />
      {materials.length === 0 ? (
        <EmptyHint icon="🗂️" text="暂无资料资质，可在后台「资源 → 资料资质」中添加" />
      ) : (
        <div className="space-y-3">
          {materials.map(m => (
            <div
              key={m.id}
              className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1d27] hover:border-lobster-300 dark:hover:border-lobster-700 hover:shadow-md transition-all"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                {fileTypeIcon(m.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {m.title}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium uppercase ${fileTypeBadge(m.type)}`}>
                    {m.type}
                  </span>
                  {m.size && <span className="text-xs text-gray-400 dark:text-gray-500">{m.size}</span>}
                </div>
                {m.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-2">{m.description}</p>
                )}
                {/* 操作按钮行 */}
                <div className="flex gap-2 flex-wrap">
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 font-medium transition-colors border border-gray-200 dark:border-gray-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    下载 / 查看
                  </a>
                  {m.htmlUrl && (
                    <button
                      onClick={() => openUrl(m.htmlUrl!)}
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 font-medium transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {m.htmlUrl.startsWith('data:') ? '打开网页（本地）' : '打开网页'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── 固定分区：平台网址 ───────────────────────────────────────────────────────

function PlatformsSection({ platforms }: { platforms: SeriesPlatform[] }) {
  const grouped: Record<string, SeriesPlatform[]> = {};
  platforms.forEach(p => {
    const cat = p.category || '平台列表';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(p);
  });
  const categories = Object.keys(grouped);

  return (
    <section className="mb-10">
      <SectionHeader
        icon={<Globe className="w-5 h-5" />}
        title="相关平台"
        description="报告中涉及的所有平台网址，方便直接访问和注册"
        count={platforms.length}
        accent="green"
      />
      {platforms.length === 0 ? (
        <EmptyHint icon="🌐" text="暂无平台网址，可在后台「资源 → 平台网址」中添加" />
      ) : (
        <div className="space-y-6">
          {categories.map(cat => (
            <div key={cat}>
              {categories.length > 1 && (
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span className="w-3 h-px bg-gray-300 dark:bg-gray-700 inline-block rounded" />
                  {cat}
                  <span className="w-3 h-px bg-gray-300 dark:bg-gray-700 inline-block rounded" />
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {grouped[cat].map(p => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1d27] hover:border-lobster-300 dark:hover:border-lobster-700 hover:shadow-md transition-all"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-xl">
                      {p.icon || '🔗'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">
                        {p.name}
                      </p>
                      {p.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{p.description}</p>
                      )}
                      {/* 操作按钮 */}
                      <div className="flex gap-2 mt-1.5 flex-wrap">
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                        >
                          <ExternalLink className="w-3 h-3" />
                          访问平台
                        </a>
                        {p.htmlUrl && (
                          <button
                            onClick={() => openUrl(p.htmlUrl!)}
                            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-colors"
                          >
                            <Globe className="w-3 h-3" />
                            {p.htmlUrl.startsWith('data:') ? '打开网页（本地）' : '打开网页'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── 固定分区：工具软件 ───────────────────────────────────────────────────────

function ToolsSection({ tools }: { tools: SeriesTool[] }) {
  return (
    <section className="mb-10">
      <SectionHeader
        icon={<Wrench className="w-5 h-5" />}
        title="工具软件"
        description="报告中推荐的工具软件，提供下载地址，支持网盘链接"
        count={tools.length}
        accent="amber"
      />
      {tools.length === 0 ? (
        <EmptyHint icon="🔧" text="暂无工具软件，可在后台「资源 → 工具软件」中添加" />
      ) : (
        <div className="space-y-3">
          {tools.map(t => (
            <div
              key={t.id}
              className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1d27] hover:border-lobster-300 dark:hover:border-lobster-700 hover:shadow-md transition-all"
            >
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-2xl">
                {t.icon || '⚙️'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-semibold text-gray-900 dark:text-white">
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
                  <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mb-2">
                    <Wrench className="w-3 h-3" />
                    {t.platform}
                  </p>
                )}
                {/* 操作按钮行 */}
                <div className="flex gap-2 flex-wrap">
                  <a
                    href={t.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 font-medium transition-colors border border-gray-200 dark:border-gray-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    下载
                  </a>
                  {t.htmlUrl && (
                    <button
                      onClick={() => openUrl(t.htmlUrl!)}
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 font-medium transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {t.htmlUrl.startsWith('data:') ? '打开网页（本地）' : '打开网页'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── 自定义主题分区 ────────────────────────────────────────────────────────────

const BADGE_COLOR_MAP: Record<string, string> = {
  green:  'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  blue:   'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  red:    'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  gray:   'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  amber:  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

function CustomSection({ section }: { section: SeriesSection }) {
  return (
    <section className="mb-10">
      <SectionHeader
        icon={<span className="text-lg">{section.icon || '📌'}</span>}
        title={section.title}
        description={section.description}
        count={section.items.length}
        accent="lobster"
      />
      {section.items.length === 0 ? (
        <EmptyHint icon="📋" text="暂无内容" />
      ) : (
        <div className="space-y-3">
          {section.items.map(item => {
            const Inner = (
              <>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="font-semibold text-gray-900 dark:text-white group-hover:text-lobster-500 transition-colors">
                      {item.name}
                    </span>
                    {item.badge && (
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${BADGE_COLOR_MAP[item.badgeColor || 'gray']}`}>
                        {item.badge}
                      </span>
                    )}
                    {item.extra && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">{item.extra}</span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.description}</p>
                  )}
                </div>
                {item.url && (
                  <ExternalLink className="flex-shrink-0 w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-lobster-400 transition-colors self-center" />
                )}
              </>
            );

            return item.url ? (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1d27] hover:border-lobster-300 dark:hover:border-lobster-700 hover:shadow-md transition-all"
              >
                {Inner}
              </a>
            ) : (
              <div
                key={item.id}
                className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1d27]"
              >
                {Inner}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ─── 相关主题分区 ─────────────────────────────────────────────────────────────

function PostsSection({ series, posts: seriesPosts }: {
  series: { coverColor?: string };
  posts: (ReturnType<typeof usePosts>['posts'][number] | undefined)[];
}) {
  const validPosts = seriesPosts.filter(Boolean);
  return (
    <section className="mb-10">
      <SectionHeader
        icon={<BookOpen className="w-5 h-5" />}
        title="相关主题"
        description="按顺序阅读，循序渐进掌握本专题内容"
        count={validPosts.length}
        accent="lobster"
      />
      {validPosts.length === 0 ? (
        <EmptyHint icon="🦞" text="专题内暂无文章" />
      ) : (
        <>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 mb-4">
            <span className="text-amber-500 text-lg flex-shrink-0">💡</span>
            <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
              建议按顺序阅读，从第 1 篇开始，循序渐进掌握本专题内容。
            </p>
          </div>
          <div className="space-y-2">
            {validPosts.map((post, index) => (
              <Link
                key={post!.id}
                to={`/post/${post!.id}`}
                className="group flex items-start gap-0 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1d27] hover:border-lobster-300 dark:hover:border-lobster-700 hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                {/* 左侧序号 */}
                <div className="flex-shrink-0 w-12 sm:w-14 flex flex-col items-center justify-start pt-4 pb-4 gap-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 border-lobster-400 bg-lobster-50 dark:bg-lobster-900/20 text-lobster-600 dark:text-lobster-400`}>
                    {index + 1}
                  </div>
                  {index < validPosts.length - 1 && (
                    <div className="w-0.5 flex-1 min-h-[12px] bg-gray-200 dark:bg-gray-700 rounded mt-1" />
                  )}
                </div>
                {/* 内容 */}
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
        </>
      )}
    </section>
  );
}

// ─── 主页面 ───────────────────────────────────────────────────────────────────

// 导航锚点 Tab
type NavKey = 'posts' | 'reports' | 'materials' | 'platforms' | 'tools' | string;

export default function SeriesDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getSeriesById } = useSeries();
  const { posts } = usePosts();
  const [activeNav, setActiveNav] = useState<NavKey>('posts');

  const series = id ? getSeriesById(id) : undefined;

  if (!series || series.status !== 'published') {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 text-center">
        <span className="text-5xl block mb-4">😵</span>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">专题不存在</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">该专题可能已被删除或尚未发布</p>
        <Link to="/series" className="inline-flex items-center gap-2 text-lobster-500 hover:text-lobster-600 font-medium">
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

  // 组装导航条目（所有主题都显示，不过滤空的）
  const navItems: { key: NavKey; label: string; count: number; icon: React.ReactNode }[] = [
    { key: 'posts',     label: '相关主题', count: seriesPosts.length,              icon: <BookOpen   className="w-3.5 h-3.5" /> },
    { key: 'reports',   label: '报告文件', count: (series.reports   || []).length,  icon: <FileText   className="w-3.5 h-3.5" /> },
    { key: 'materials', label: '资料资质', count: (series.materials || []).length,  icon: <FolderOpen className="w-3.5 h-3.5" /> },
    { key: 'platforms', label: '相关平台', count: (series.platforms || []).length,  icon: <Globe      className="w-3.5 h-3.5" /> },
    { key: 'tools',     label: '工具软件', count: (series.tools     || []).length,  icon: <Wrench     className="w-3.5 h-3.5" /> },
    ...(series.sections || []).map(s => ({
      key: s.id,
      label: s.title,
      count: s.items.length,
      icon: <span className="text-xs">{s.icon || '📌'}</span>,
    })),
  ];

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
      <section className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mb-8 shadow-sm">
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

      {/* 快速导航（始终显示，超过1个主题时显示） */}
      {navItems.length > 1 && (
        <nav className="flex items-center gap-1.5 flex-wrap mb-8 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800">
          <span className="text-xs text-gray-400 dark:text-gray-500 mr-1 flex-shrink-0">快速跳转：</span>
          {navItems.map(nav => (
            <button
              key={nav.key}
              onClick={() => {
                setActiveNav(nav.key);
                const el = document.getElementById(`section-${nav.key}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                activeNav === nav.key
                  ? 'bg-lobster-500 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-lobster-300 dark:hover:border-lobster-700 hover:text-lobster-500'
              }`}
            >
              {nav.icon}
              {nav.label}
              <span className={`text-xs rounded-full px-1.5 py-0 ${activeNav === nav.key ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                {nav.count}
              </span>
            </button>
          ))}
        </nav>
      )}

      {/* ── 相关主题（纵向，全部显示） ── */}
      <div>
        {/* 文章目录 */}
        <div id="section-posts">
          <PostsSection series={series} posts={seriesPosts} />
        </div>

        {/* 固定4个资源主题（始终显示，空时有占位提示） */}
        <div id="section-reports">
          <ReportsSection reports={series.reports || []} />
        </div>
        <div id="section-materials">
          <MaterialsSection materials={series.materials || []} />
        </div>
        <div id="section-platforms">
          <PlatformsSection platforms={series.platforms || []} />
        </div>
        <div id="section-tools">
          <ToolsSection tools={series.tools || []} />
        </div>

        {/* 自定义主题分区 */}
        {(series.sections || []).map(section => (
          <div key={section.id} id={`section-${section.id}`}>
            <CustomSection section={section} />
          </div>
        ))}
      </div>

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
