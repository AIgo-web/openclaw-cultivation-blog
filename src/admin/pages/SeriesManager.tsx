import React, { useState } from 'react';
import {
  Plus, Trash2, Edit2, X, Check, GripVertical, BookOpen,
  Eye, EyeOff, FileText, FolderOpen, Globe, Wrench, Link2,
} from 'lucide-react';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useSeries } from '../../contexts/SeriesContext';
import { usePosts } from '../../contexts/PostsContext';
import type { Series, SeriesReport, SeriesMaterial, SeriesPlatform, SeriesTool } from '../../types';

const COVER_COLORS = [
  'from-lobster-400 to-lobster-600',
  'from-blue-400 to-blue-600',
  'from-purple-400 to-purple-600',
  'from-green-400 to-green-600',
  'from-amber-400 to-amber-600',
  'from-pink-400 to-pink-600',
  'from-cyan-400 to-cyan-600',
  'from-indigo-400 to-indigo-600',
];

const DEFAULT_ICONS = ['📚', '🔥', '💡', '🎯', '🚀', '🛠️', '⚡', '🌟', '🦞', '🔬'];

interface SeriesFormData {
  title: string;
  description: string;
  coverColor: string;
  icon: string;
  status: 'published' | 'draft';
}

const defaultForm: SeriesFormData = {
  title: '',
  description: '',
  coverColor: COVER_COLORS[0],
  icon: '📚',
  status: 'published',
};

// ─── 小工具 ───────────────────────────────────────────────────────────────────
function newId() {
  return `res-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── 资源Tab编辑面板 ──────────────────────────────────────────────────────────

type ResTab = 'reports' | 'materials' | 'platforms' | 'tools';

interface ResourceManagerProps {
  series: Series;
  onSave: (updated: Series) => void;
  onClose: () => void;
  isDark: boolean;
  inputCls: string;
}

/** 单行文件资源表单（报告 / 资料） */
function FileResourceForm({
  isDark,
  inputCls,
  typeOptions,
  onAdd,
}: {
  isDark: boolean;
  inputCls: string;
  typeOptions: { value: string; label: string }[];
  onAdd: (item: { title: string; description: string; url: string; type: string; size: string }) => void;
}) {
  const [f, setF] = useState({ title: '', url: '', description: '', type: typeOptions[0].value, size: '' });
  const handleAdd = () => {
    if (!f.title.trim() || !f.url.trim()) return;
    onAdd(f);
    setF({ title: '', url: '', description: '', type: typeOptions[0].value, size: '' });
  };
  return (
    <div className={`rounded-xl border p-4 space-y-3 ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
      <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>新增条目</p>
      <div className="grid grid-cols-2 gap-2">
        <input
          className={inputCls}
          placeholder="名称 *"
          value={f.title}
          onChange={e => setF(v => ({ ...v, title: e.target.value }))}
        />
        <select
          className={inputCls}
          value={f.type}
          onChange={e => setF(v => ({ ...v, type: e.target.value }))}
        >
          {typeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <input
        className={inputCls}
        placeholder="链接地址（支持网盘链接）*"
        value={f.url}
        onChange={e => setF(v => ({ ...v, url: e.target.value }))}
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          className={inputCls}
          placeholder="备注说明（可选）"
          value={f.description}
          onChange={e => setF(v => ({ ...v, description: e.target.value }))}
        />
        <input
          className={inputCls}
          placeholder="文件大小，如 2.4 MB（可选）"
          value={f.size}
          onChange={e => setF(v => ({ ...v, size: e.target.value }))}
        />
      </div>
      <button
        onClick={handleAdd}
        disabled={!f.title.trim() || !f.url.trim()}
        className="w-full py-2 bg-lobster-500 hover:bg-lobster-600 disabled:opacity-40 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors"
      >
        <Plus className="w-4 h-4" /> 添加
      </button>
    </div>
  );
}

function ResourceManager({ series, onSave, onClose, isDark, inputCls }: ResourceManagerProps) {
  const [tab, setTab] = useState<ResTab>('reports');
  // 用本地 state 暂存，点保存才写入
  const [reports, setReports] = useState<SeriesReport[]>(series.reports || []);
  const [materials, setMaterials] = useState<SeriesMaterial[]>(series.materials || []);
  const [platforms, setPlatforms] = useState<SeriesPlatform[]>(series.platforms || []);
  const [tools, setTools] = useState<SeriesTool[]>(series.tools || []);

  const handleSave = () => {
    onSave({ ...series, reports, materials, platforms, tools, updatedAt: new Date().toISOString() });
  };

  const RES_TABS: { key: ResTab; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'reports', label: '报告文件', icon: <FileText className="w-4 h-4" />, count: reports.length },
    { key: 'materials', label: '资料资质', icon: <FolderOpen className="w-4 h-4" />, count: materials.length },
    { key: 'platforms', label: '平台网址', icon: <Globe className="w-4 h-4" />, count: platforms.length },
    { key: 'tools', label: '工具软件', icon: <Wrench className="w-4 h-4" />, count: tools.length },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-2xl rounded-2xl shadow-2xl ${isDark ? 'bg-gray-900' : 'bg-white'} flex flex-col max-h-[90vh]`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 pt-5 pb-0 flex-shrink-0`}>
          <div>
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {series.icon} {series.title} · 资源管理
            </h2>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              管理报告、资料、平台和工具，前台专题页对外展示
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Tabs */}
        <div className={`flex gap-0 border-b mt-4 px-6 flex-shrink-0 ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          {RES_TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
                tab === t.key
                  ? 'border-lobster-500 text-lobster-600 dark:text-lobster-400'
                  : `border-transparent ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
              }`}
            >
              {t.icon} {t.label}
              {t.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  tab === t.key ? 'bg-lobster-100 text-lobster-600 dark:bg-lobster-900/30 dark:text-lobster-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                }`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0 space-y-4">

          {/* ── 报告文件 ── */}
          {tab === 'reports' && (
            <>
              <FileResourceForm
                isDark={isDark} inputCls={inputCls}
                typeOptions={[
                  { value: 'pdf', label: 'PDF' },
                  { value: 'html', label: 'HTML 网页' },
                  { value: 'other', label: '其他' },
                ]}
                onAdd={f => setReports(prev => [...prev, { id: newId(), ...f } as SeriesReport])}
              />
              {reports.length > 0 && (
                <div className="space-y-2">
                  {reports.map(r => (
                    <div key={r.id} className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <FileText className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{r.title}</p>
                        <p className="text-xs text-gray-400 truncate">{r.url}</p>
                      </div>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium uppercase ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>{r.type}</span>
                      <button onClick={() => setReports(prev => prev.filter(x => x.id !== r.id))}
                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {reports.length === 0 && <p className={`text-center text-sm py-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>暂无报告，从上方添加</p>}
            </>
          )}

          {/* ── 资料资质 ── */}
          {tab === 'materials' && (
            <>
              <FileResourceForm
                isDark={isDark} inputCls={inputCls}
                typeOptions={[
                  { value: 'pdf', label: 'PDF' },
                  { value: 'doc', label: 'Word/文档' },
                  { value: 'image', label: '图片/截图' },
                  { value: 'zip', label: '压缩包' },
                  { value: 'other', label: '其他' },
                ]}
                onAdd={f => setMaterials(prev => [...prev, { id: newId(), ...f } as SeriesMaterial])}
              />
              {materials.length > 0 && (
                <div className="space-y-2">
                  {materials.map(m => (
                    <div key={m.id} className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <FolderOpen className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{m.title}</p>
                        <p className="text-xs text-gray-400 truncate">{m.url}</p>
                      </div>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium uppercase ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>{m.type}</span>
                      <button onClick={() => setMaterials(prev => prev.filter(x => x.id !== m.id))}
                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {materials.length === 0 && <p className={`text-center text-sm py-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>暂无资料，从上方添加</p>}
            </>
          )}

          {/* ── 平台网址 ── */}
          {tab === 'platforms' && (
            <>
              {/* 添加表单 */}
              <PlatformForm isDark={isDark} inputCls={inputCls}
                onAdd={p => setPlatforms(prev => [...prev, { id: newId(), ...p } as SeriesPlatform])} />
              {platforms.length > 0 && (
                <div className="space-y-2">
                  {platforms.map(p => (
                    <div key={p.id} className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <span className="text-xl flex-shrink-0">{p.icon || '🔗'}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{p.name}</p>
                        <p className="text-xs text-gray-400 truncate">{p.url}</p>
                      </div>
                      {p.category && (
                        <span className={`text-xs px-1.5 py-0.5 rounded ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>{p.category}</span>
                      )}
                      <button onClick={() => setPlatforms(prev => prev.filter(x => x.id !== p.id))}
                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {platforms.length === 0 && <p className={`text-center text-sm py-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>暂无平台，从上方添加</p>}
            </>
          )}

          {/* ── 工具软件 ── */}
          {tab === 'tools' && (
            <>
              <ToolForm isDark={isDark} inputCls={inputCls}
                onAdd={t => setTools(prev => [...prev, { id: newId(), ...t } as SeriesTool])} />
              {tools.length > 0 && (
                <div className="space-y-2">
                  {tools.map(t => (
                    <div key={t.id} className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <span className="text-xl flex-shrink-0">{t.icon || '⚙️'}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{t.name}</p>
                        <p className="text-xs text-gray-400 truncate">{t.url}</p>
                      </div>
                      {t.isFree !== undefined && (
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                          t.isFree ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                        }`}>{t.isFree ? '免费' : '付费'}</span>
                      )}
                      <button onClick={() => setTools(prev => prev.filter(x => x.id !== t.id))}
                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {tools.length === 0 && <p className={`text-center text-sm py-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>暂无工具，从上方添加</p>}
            </>
          )}
        </div>

        {/* Footer */}
        <div className={`flex justify-end gap-3 px-6 py-4 border-t flex-shrink-0 ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          <button onClick={onClose}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${isDark ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
            取消
          </button>
          <button onClick={handleSave}
            className="px-4 py-2 bg-lobster-500 hover:bg-lobster-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Check className="w-4 h-4" /> 保存资源
          </button>
        </div>
      </div>
    </div>
  );
}

/** 平台添加表单 */
function PlatformForm({ isDark, inputCls, onAdd }: {
  isDark: boolean; inputCls: string;
  onAdd: (p: Omit<SeriesPlatform, 'id'>) => void;
}) {
  const [f, setF] = useState({ name: '', url: '', description: '', icon: '🔗', category: '' });
  const handle = () => {
    if (!f.name.trim() || !f.url.trim()) return;
    onAdd(f);
    setF({ name: '', url: '', description: '', icon: '🔗', category: '' });
  };
  return (
    <div className={`rounded-xl border p-4 space-y-3 ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
      <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>新增平台</p>
      <div className="grid grid-cols-3 gap-2">
        <input className={inputCls} placeholder="图标 Emoji" value={f.icon} onChange={e => setF(v => ({ ...v, icon: e.target.value }))} />
        <input className={`${inputCls} col-span-2`} placeholder="平台名称 *" value={f.name} onChange={e => setF(v => ({ ...v, name: e.target.value }))} />
      </div>
      <input className={inputCls} placeholder="平台网址 *" value={f.url} onChange={e => setF(v => ({ ...v, url: e.target.value }))} />
      <div className="grid grid-cols-2 gap-2">
        <input className={inputCls} placeholder="分类，如 视频平台（可选）" value={f.category} onChange={e => setF(v => ({ ...v, category: e.target.value }))} />
        <input className={inputCls} placeholder="简短说明（可选）" value={f.description} onChange={e => setF(v => ({ ...v, description: e.target.value }))} />
      </div>
      <button onClick={handle} disabled={!f.name.trim() || !f.url.trim()}
        className="w-full py-2 bg-lobster-500 hover:bg-lobster-600 disabled:opacity-40 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors">
        <Plus className="w-4 h-4" /> 添加
      </button>
    </div>
  );
}

/** 工具添加表单 */
function ToolForm({ isDark, inputCls, onAdd }: {
  isDark: boolean; inputCls: string;
  onAdd: (t: Omit<SeriesTool, 'id'>) => void;
}) {
  const [f, setF] = useState({ name: '', url: '', description: '', icon: '⚙️', platform: '', version: '', isFree: true });
  const handle = () => {
    if (!f.name.trim() || !f.url.trim()) return;
    onAdd(f);
    setF({ name: '', url: '', description: '', icon: '⚙️', platform: '', version: '', isFree: true });
  };
  return (
    <div className={`rounded-xl border p-4 space-y-3 ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
      <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>新增工具</p>
      <div className="grid grid-cols-3 gap-2">
        <input className={inputCls} placeholder="图标 Emoji" value={f.icon} onChange={e => setF(v => ({ ...v, icon: e.target.value }))} />
        <input className={`${inputCls} col-span-2`} placeholder="工具名称 *" value={f.name} onChange={e => setF(v => ({ ...v, name: e.target.value }))} />
      </div>
      <input className={inputCls} placeholder="下载链接（支持网盘链接）*" value={f.url} onChange={e => setF(v => ({ ...v, url: e.target.value }))} />
      <div className="grid grid-cols-2 gap-2">
        <input className={inputCls} placeholder="适用平台，如 Windows/macOS" value={f.platform} onChange={e => setF(v => ({ ...v, platform: e.target.value }))} />
        <input className={inputCls} placeholder="版本号（可选）" value={f.version} onChange={e => setF(v => ({ ...v, version: e.target.value }))} />
      </div>
      <input className={inputCls} placeholder="软件简介（可选）" value={f.description} onChange={e => setF(v => ({ ...v, description: e.target.value }))} />
      <div className="flex items-center gap-3">
        <label className={`flex items-center gap-2 cursor-pointer text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          <input type="checkbox" checked={f.isFree} onChange={e => setF(v => ({ ...v, isFree: e.target.checked }))}
            className="w-4 h-4 rounded border-gray-300 text-lobster-500 focus:ring-lobster-500" />
          免费工具
        </label>
      </div>
      <button onClick={handle} disabled={!f.name.trim() || !f.url.trim()}
        className="w-full py-2 bg-lobster-500 hover:bg-lobster-600 disabled:opacity-40 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors">
        <Plus className="w-4 h-4" /> 添加
      </button>
    </div>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────

export const SeriesManager: React.FC = () => {
  const { isDark } = useDarkMode();
  const { seriesList, addSeries, updateSeries, deleteSeries } = useSeries();
  const { posts, updatePost } = usePosts();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SeriesFormData>(defaultForm);
  const [managingId, setManagingId] = useState<string | null>(null);
  const [resourceId, setResourceId] = useState<string | null>(null);

  const managingSeries = managingId ? seriesList.find(s => s.id === managingId) : null;
  const resourceSeries = resourceId ? seriesList.find(s => s.id === resourceId) : null;

  const inputCls = `w-full px-4 py-2 rounded-lg border text-sm ${
    isDark
      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  } focus:outline-none focus:ring-2 focus:ring-lobster-500`;

  const cardCls = `rounded-xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`;

  const handleOpenForm = (series?: Series) => {
    if (series) {
      setEditingId(series.id);
      setFormData({
        title: series.title,
        description: series.description,
        coverColor: series.coverColor || COVER_COLORS[0],
        icon: series.icon || '📚',
        status: series.status,
      });
    } else {
      setEditingId(null);
      setFormData(defaultForm);
    }
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.title.trim()) { alert('请输入专题标题'); return; }
    const now = new Date().toISOString();
    if (editingId) {
      const existing = seriesList.find(s => s.id === editingId)!;
      updateSeries(editingId, { ...existing, ...formData, updatedAt: now });
    } else {
      const newSeries: Series = {
        id: `series-${Date.now()}`,
        ...formData,
        postIds: [],
        createdAt: now,
        updatedAt: now,
      };
      addSeries(newSeries);
    }
    setShowForm(false);
    setEditingId(null);
    setFormData(defaultForm);
  };

  const handleToggleStatus = (series: Series) => {
    const newStatus = series.status === 'published' ? 'draft' : 'published';
    updateSeries(series.id, { ...series, status: newStatus, updatedAt: new Date().toISOString() });
  };

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`确定要删除专题「${title}」吗？专题内文章不会被删除，但会解除关联。`)) return;
    const series = seriesList.find(s => s.id === id);
    if (series) {
      series.postIds.forEach(postId => {
        const post = posts.find(p => p.id === postId);
        if (post) updatePost(postId, { ...post, seriesId: undefined, seriesOrder: undefined });
      });
    }
    deleteSeries(id);
    if (managingId === id) setManagingId(null);
    if (resourceId === id) setResourceId(null);
  };

  const handleAddPostToSeries = (postId: string) => {
    if (!managingSeries) return;
    if (managingSeries.postIds.includes(postId)) return;
    const newPostIds = [...managingSeries.postIds, postId];
    updateSeries(managingSeries.id, { ...managingSeries, postIds: newPostIds, updatedAt: new Date().toISOString() });
    const post = posts.find(p => p.id === postId);
    if (post) updatePost(postId, { ...post, seriesId: managingSeries.id, seriesOrder: newPostIds.length });
  };

  const handleRemovePostFromSeries = (postId: string) => {
    if (!managingSeries) return;
    const newPostIds = managingSeries.postIds.filter(id => id !== postId);
    newPostIds.forEach((pid, idx) => {
      const p = posts.find(pp => pp.id === pid);
      if (p) updatePost(pid, { ...p, seriesOrder: idx + 1 });
    });
    updateSeries(managingSeries.id, { ...managingSeries, postIds: newPostIds, updatedAt: new Date().toISOString() });
    const post = posts.find(p => p.id === postId);
    if (post) updatePost(postId, { ...post, seriesId: undefined, seriesOrder: undefined });
  };

  const handleMoveUp = (index: number) => {
    if (!managingSeries || index === 0) return;
    const newPostIds = [...managingSeries.postIds];
    [newPostIds[index - 1], newPostIds[index]] = [newPostIds[index], newPostIds[index - 1]];
    newPostIds.forEach((pid, idx) => { const p = posts.find(pp => pp.id === pid); if (p) updatePost(pid, { ...p, seriesOrder: idx + 1 }); });
    updateSeries(managingSeries.id, { ...managingSeries, postIds: newPostIds, updatedAt: new Date().toISOString() });
  };

  const handleMoveDown = (index: number) => {
    if (!managingSeries || index >= managingSeries.postIds.length - 1) return;
    const newPostIds = [...managingSeries.postIds];
    [newPostIds[index], newPostIds[index + 1]] = [newPostIds[index + 1], newPostIds[index]];
    newPostIds.forEach((pid, idx) => { const p = posts.find(pp => pp.id === pid); if (p) updatePost(pid, { ...p, seriesOrder: idx + 1 }); });
    updateSeries(managingSeries.id, { ...managingSeries, postIds: newPostIds, updatedAt: new Date().toISOString() });
  };

  const availablePosts = posts.filter(
    p => (!p.status || p.status === 'published') && (!managingSeries || !managingSeries.postIds.includes(p.id))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>专题管理</h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>将相关文章组织成系列专题，方便读者系统学习</p>
        </div>
        <button onClick={() => handleOpenForm()}
          className="px-4 py-2 bg-lobster-500 hover:bg-lobster-600 text-white rounded-lg font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> 新建专题
        </button>
      </div>

      {/* ── 新建/编辑专题 Modal ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-2xl shadow-2xl ${isDark ? 'bg-gray-900' : 'bg-white'} p-6`}>
            <div className="flex items-center justify-between mb-5">
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{editingId ? '编辑专题' : '新建专题'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>图标</label>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_ICONS.map(icon => (
                    <button key={icon} onClick={() => setFormData(f => ({ ...f, icon }))}
                      className={`w-10 h-10 text-xl rounded-lg border-2 flex items-center justify-center transition-all ${
                        formData.icon === icon ? 'border-lobster-500 bg-lobster-50 dark:bg-lobster-900/20 scale-110' : 'border-gray-200 dark:border-gray-700 hover:border-lobster-300'
                      }`}>{icon}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>专题标题 <span className="text-red-500">*</span></label>
                <input type="text" value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                  placeholder="给专题起个好名字..." className={inputCls} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>专题简介</label>
                <textarea value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                  placeholder="用 1-3 句话介绍这个专题的核心价值&#10;例如：系统梳理 OpenClaw Agent 的安装与配置流程，从零开始帮助新手快速上手，涵盖环境搭建、常见问题与最佳实践。"
                  rows={4} className={`${inputCls} resize-none`} />
                <p className={`text-xs mt-1.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>建议 30–100 字，说清楚「学什么」「适合谁」「能收获什么」</p>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>封面颜色</label>
                <div className="flex gap-2 flex-wrap">
                  {COVER_COLORS.map(color => (
                    <button key={color} onClick={() => setFormData(f => ({ ...f, coverColor: color }))}
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${color} transition-all ${formData.coverColor === color ? 'ring-2 ring-offset-2 ring-lobster-500 scale-110' : ''}`} />
                  ))}
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>状态</label>
                <select value={formData.status} onChange={e => setFormData(f => ({ ...f, status: e.target.value as 'published' | 'draft' }))} className={inputCls}>
                  <option value="published">已发布</option>
                  <option value="draft">草稿</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowForm(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${isDark ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}>取消</button>
              <button onClick={handleSave}
                className="px-4 py-2 bg-lobster-500 hover:bg-lobster-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                <Check className="w-4 h-4" /> 保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 管理文章 Modal ── */}
      {managingSeries && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-2xl rounded-2xl shadow-2xl ${isDark ? 'bg-gray-900' : 'bg-white'} p-6 max-h-[85vh] flex flex-col`}>
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <div>
                <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{managingSeries.icon} {managingSeries.title} · 管理文章</h2>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>已添加 {managingSeries.postIds.length} 篇文章</p>
              </div>
              <button onClick={() => setManagingId(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
              <div>
                <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>专题内文章（按顺序排列）</h3>
                {managingSeries.postIds.length === 0 ? (
                  <div className={`text-center py-6 rounded-lg border-dashed border-2 ${isDark ? 'border-gray-700 text-gray-500' : 'border-gray-300 text-gray-400'}`}>
                    <BookOpen className="w-6 h-6 mx-auto mb-2 opacity-50" /> 暂无文章，从下方添加
                  </div>
                ) : (
                  <div className="space-y-2">
                    {managingSeries.postIds.map((postId, index) => {
                      const post = posts.find(p => p.id === postId);
                      if (!post) return null;
                      return (
                        <div key={postId} className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                          <GripVertical className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                          <span className={`text-xs font-mono w-5 text-center flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{index + 1}</span>
                          <span className={`flex-1 text-sm font-medium truncate ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{post.title}</span>
                          <div className="flex gap-1">
                            <button onClick={() => handleMoveUp(index)} disabled={index === 0}
                              className={`px-2 py-1 rounded text-xs transition-colors disabled:opacity-30 ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}>↑</button>
                            <button onClick={() => handleMoveDown(index)} disabled={index === managingSeries.postIds.length - 1}
                              className={`px-2 py-1 rounded text-xs transition-colors disabled:opacity-30 ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}>↓</button>
                            <button onClick={() => handleRemovePostFromSeries(postId)}
                              className="px-2 py-1 rounded text-xs text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">移除</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div>
                <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>添加已发布文章</h3>
                {availablePosts.length === 0 ? (
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>暂无可添加的文章</p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {availablePosts.map(post => (
                      <div key={post.id} onClick={() => handleAddPostToSeries(post.id)}
                        className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${isDark ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-gray-50 hover:bg-gray-100'}`}>
                        <Plus className="w-4 h-4 text-lobster-500 flex-shrink-0" />
                        <span className={`flex-1 text-sm truncate ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{post.title}</span>
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{post.date}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end mt-4 flex-shrink-0">
              <button onClick={() => setManagingId(null)}
                className="px-4 py-2 bg-lobster-500 hover:bg-lobster-600 text-white rounded-lg text-sm font-medium transition-colors">完成</button>
            </div>
          </div>
        </div>
      )}

      {/* ── 资源管理 Modal ── */}
      {resourceSeries && (
        <ResourceManager
          series={resourceSeries}
          isDark={isDark}
          inputCls={inputCls}
          onSave={updated => { updateSeries(updated.id, updated); setResourceId(null); }}
          onClose={() => setResourceId(null)}
        />
      )}

      {/* Series List */}
      {seriesList.length === 0 ? (
        <div className={`${cardCls} p-16 text-center`}>
          <span className="text-5xl mb-4 block">📚</span>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>还没有专题</h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-4`}>创建专题将相关文章组织起来，帮助读者系统性地阅读</p>
          <button onClick={() => handleOpenForm()}
            className="px-6 py-2.5 bg-lobster-500 hover:bg-lobster-600 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> 创建第一个专题
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {seriesList.map(series => {
            const postCount = series.postIds.length;
            const realPosts = series.postIds.map(id => posts.find(p => p.id === id)).filter(Boolean);
            const resCount = (series.reports?.length || 0) + (series.materials?.length || 0)
              + (series.platforms?.length || 0) + (series.tools?.length || 0);
            return (
              <div key={series.id} className={`${cardCls} overflow-hidden group`}>
                {/* Cover */}
                <div className={`h-24 bg-gradient-to-br ${series.coverColor || COVER_COLORS[0]} flex items-center justify-center relative`}>
                  <span className="text-4xl">{series.icon || '📚'}</span>
                  <span className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-medium ${
                    series.status === 'published' ? 'bg-green-500/80 text-white' : 'bg-yellow-400 text-yellow-900'
                  }`}>
                    {series.status === 'published' ? '✓ 已发布' : '草稿'}
                  </span>
                </div>
                {/* Content */}
                <div className="p-4">
                  <h3 className={`font-bold text-base mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{series.title}</h3>
                  <p className={`text-sm mb-2 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{series.description || '暂无简介'}</p>
                  <div className={`text-xs mb-4 flex items-center gap-2 flex-wrap ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <span>共 {postCount} 篇</span>
                    {resCount > 0 && <span className="text-lobster-500 font-medium">· {resCount} 份资源</span>}
                    <span>· {realPosts.length > 0 ? `更新 ${realPosts[realPosts.length - 1]?.date}` : '尚未添加文章'}</span>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button onClick={() => setManagingId(series.id)}
                      className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-lobster-500/10 text-lobster-600 dark:text-lobster-400 hover:bg-lobster-500/20 transition-colors flex items-center justify-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" /> 文章
                    </button>
                    <button onClick={() => setResourceId(series.id)}
                      title="管理资源（报告/资料/平台/工具）"
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                        isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                      }`}>
                      <Link2 className="w-3.5 h-3.5" /> 资源
                    </button>
                    <button onClick={() => handleToggleStatus(series)}
                      title={series.status === 'published' ? '取消发布' : '立即发布'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        series.status === 'published'
                          ? isDark ? 'hover:bg-gray-800 text-green-400' : 'hover:bg-gray-100 text-green-600'
                          : isDark ? 'hover:bg-yellow-900/30 text-yellow-400' : 'hover:bg-yellow-50 text-yellow-600'
                      }`}>
                      {series.status === 'published' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button onClick={() => handleOpenForm(series)}
                      className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                      title="编辑专题">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(series.id, series.title)}
                      className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-red-900/30 text-gray-400 hover:text-red-400' : 'hover:bg-red-100 text-gray-400 hover:text-red-500'}`}
                      title="删除专题">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats */}
      {seriesList.length > 0 && (
        <div className={`${cardCls} p-4`}>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{seriesList.length}</div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>专题总数</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {seriesList.filter(s => s.status === 'published').length}
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>已发布</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {seriesList.reduce((sum, s) => sum + s.postIds.length, 0)}
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>专题文章数</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
