/**
 * 批量导入 Markdown 文件弹窗
 * 支持多文件选择、文件夹拖拽、预览、状态设置
 */

import React, { useState, useRef, useCallback } from 'react';
import { calcReadTime } from '../../utils/readTime';
import {
  X,
  Upload,
  FileText,
  FolderOpen,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Trash2,
} from 'lucide-react';
import { useDarkMode } from '../../hooks/useDarkMode';
import type { Post } from '../../types';

interface ParsedMdFile {
  file: File;
  filename: string;
  title: string;
  summary: string;
  tags: string[];
  category: string;
  date: string;
  body: string;
  size: string;
}

interface BatchImportModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (posts: Omit<Post, 'id'>[]) => void;
}

/** 解析 Markdown frontmatter */
function parseFrontmatter(content: string): Record<string, unknown> {
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!fmMatch) return {};

  const [, fmStr] = fmMatch;
  const result: Record<string, unknown> = {};

  fmStr.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value: unknown = line.slice(colonIndex + 1).trim();

      // 去除引号
      if ((value as string).startsWith('"') && (value as string).endsWith('"')) {
        value = (value as string).slice(1, -1);
      } else if ((value as string).startsWith("'") && (value as string).endsWith("'")) {
        value = (value as string).slice(1, -1);
      }

      // 解析数组
      if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
        value = value
          .slice(1, -1)
          .split(',')
          .map(item => item.trim().replace(/["']/g, ''))
          .filter(Boolean);
      }

      result[key] = value;
    }
  });

  return result;
}

/** 格式化文件大小 */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** 解析单个 MD 文件 */
function parseMdFile(file: File): Promise<ParsedMdFile> {
  return file.text().then(content => {
    const fm = parseFrontmatter(content);
    const bodyMatch = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$/);
    const body = bodyMatch ? bodyMatch[1].trim() : content.trim();

    let title = file.name.replace(/\.md$/i, '').replace(/\.markdown$/i, '');
    let summary = '';
    let tags: string[] = [];
    let category = 'tech';
    let date = new Date().toISOString().split('T')[0];

    if (fm.title) title = fm.title as string;
    if (fm.summary || fm.description || fm.excerpt) {
      summary = (fm.summary || fm.description || fm.excerpt) as string;
    }
    if (fm.date) date = fm.date as string;
    if (fm.tags && Array.isArray(fm.tags)) tags = fm.tags as string[];
    if (fm.category) category = fm.category as string;

    if (!summary) {
      summary = body.replace(/[#*`\[\]>]/g, '').slice(0, 150).trim() + '...';
    }

    return {
      file,
      filename: file.name,
      title,
      summary,
      tags,
      category,
      date,
      body,
      size: formatSize(file.size),
    };
  });
}

export const BatchImportModal: React.FC<BatchImportModalProps> = ({
  open,
  onClose,
  onImport,
}) => {
  const { isDark } = useDarkMode();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<ParsedMdFile[]>([]);
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'done'>('idle');
  const [defaultStatus, setDefaultStatus] = useState<'draft' | 'published'>('draft');
  const [errors, setErrors] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dragOver, setDragOver] = useState(false);

  const isAllSelected = files.length > 0 && files.length === selectedIds.size;

  const handleFileSelect = useCallback(async (fileList: FileList | File[]) => {
    const mdFiles = Array.from(fileList).filter(
      f => f.name.endsWith('.md') || f.name.endsWith('.markdown')
    );

    if (mdFiles.length === 0) {
      setErrors(['未找到有效的 .md 文件']);
      return;
    }

    setErrors([]);
    setImportStatus('idle');

    const parsed = await Promise.all(mdFiles.map(parseMdFile));
    setFiles(prev => {
      // 去重（按文件名）
      const existingNames = new Set(prev.map(f => f.filename));
      const newFiles = parsed.filter(f => !existingNames.has(f.filename));
      return [...prev, ...newFiles];
    });

    // 自动全选新导入的文件
    setSelectedIds(prev => {
      const next = new Set(prev);
      parsed.forEach(f => next.add(f.filename));
      return next;
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const items = e.dataTransfer.items;
      if (items) {
        const filePromises: Promise<File[]>[] = [];
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.kind === 'file') {
            const entry = item.webkitGetAsEntry?.();
            if (entry?.isFile) {
              filePromises.push(
                new Promise(resolve => {
                  (entry as FileSystemFileEntry).file(f => resolve([f]));
                })
              );
            } else if (entry?.isDirectory) {
              // 递归读取文件夹中的 .md 文件
              filePromises.push(
                new Promise(resolve => {
                  const dirReader = (entry as FileSystemDirectoryEntry).createReader();
                  const allFiles: File[] = [];

                  const readBatch = () => {
                    dirReader.readEntries(async (entries) => {
                      if (entries.length === 0) {
                        resolve(allFiles.filter(f => f.name.endsWith('.md') || f.name.endsWith('.markdown')));
                        return;
                      }
                      for (const e of entries) {
                        if (e.isFile) {
                          const file = await new Promise<File>((res) => (e as FileSystemFileEntry).file(res));
                          allFiles.push(file);
                        }
                      }
                      readBatch();
                    });
                  };
                  readBatch();
                })
              );
            }
          }
        }
        Promise.all(filePromises).then(results => {
          const allFiles = results.flat();
          if (allFiles.length > 0) handleFileSelect(allFiles);
        });
      } else {
        handleFileSelect(e.dataTransfer.files);
      }
    },
    [handleFileSelect]
  );

  const handleRemove = (filename: string) => {
    setFiles(prev => prev.filter(f => f.filename !== filename));
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(filename);
      return next;
    });
  };

  const handleClear = () => {
    setFiles([]);
    setSelectedIds(new Set());
    setErrors([]);
    setImportStatus('idle');
  };

  const toggleSelect = (filename: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(filename) ? next.delete(filename) : next.add(filename);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(files.map(f => f.filename)));
    }
  };

  const handleImport = () => {
    if (selectedIds.size === 0) {
      setErrors(['请至少选择一篇文章']);
      return;
    }

    setImportStatus('importing');
    setErrors([]);

    const toImport = files.filter(f => selectedIds.has(f.filename));

    const posts: Omit<Post, 'id'>[] = toImport.map(f => ({
      title: f.title,
      summary: f.summary,
      content: f.body,
      tags: f.tags,
      category: f.category,
      date: f.date,
      status: defaultStatus as 'draft' | 'published',
      readTime: calcReadTime(f.body),
    }));

    // 模拟短暂延迟让用户看到进度
    setTimeout(() => {
      onImport(posts);
      setImportStatus('done');
    }, 500);
  };

  const handleClose = () => {
    if (importStatus === 'importing') return;
    handleClear();
    onClose();
  };

  if (!open) return null;

  const cardClass = `p-6 rounded-xl ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border`;
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDark ? 'text-gray-500' : 'text-gray-400';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <div>
            <h2 className={`text-xl font-semibold ${textPrimary}`}>批量导入 Markdown 文章</h2>
            <p className={`text-sm ${textMuted}`}>
              支持 .md / .markdown 文件，可解析 YAML frontmatter
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={importStatus === 'importing'}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'
            } disabled:opacity-50`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Upload Area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
              dragOver
                ? 'border-lobster-500 bg-lobster-50 dark:bg-lobster-900/20'
                : isDark
                  ? 'border-gray-700 hover:border-gray-500 bg-gray-800/50'
                  : 'border-gray-300 hover:border-gray-400 bg-gray-50'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className={`w-10 h-10 mx-auto mb-3 ${dragOver ? 'text-lobster-500' : textMuted}`} />
            <p className={`font-medium ${textSecondary}`}>
              拖拽 .md 文件或文件夹到此处，或点击选择
            </p>
            <p className={`text-sm mt-1 ${textMuted}`}>
              支持 YAML frontmatter（title, date, tags, category, summary）
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.markdown"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleFileSelect(e.target.files);
                e.target.value = '';
              }}
            />
            {/* 隐藏的文件夹选择器 */}
            <input
              ref={folderInputRef}
              type="file"
              accept=".md,.markdown"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleFileSelect(e.target.files);
                e.target.value = '';
              }}
            />
          </div>

          {/* Quick Actions */}
          {files.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                  isDark ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                继续添加
              </button>
              <button
                onClick={handleClear}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                  isDark ? 'border-red-700 text-red-300 hover:bg-red-900/30' : 'border-red-300 text-red-700 hover:bg-red-50'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                清空全部
              </button>
              <span className={`text-sm ml-auto ${textMuted}`}>
                已选 {selectedIds.size} / {files.length} 篇
              </span>
            </div>
          )}

          {/* File List */}
          {files.length > 0 && (
            <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
              {/* Select All Header */}
              <div className={`flex items-center gap-3 px-4 py-3 text-sm font-medium border-b ${
                isDark ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'
              }`}>
                <button onClick={toggleSelectAll} className="text-lobster-500 hover:text-lobster-600">
                  {isAllSelected ? '✅' : '⬜'} 全选
                </button>
                <span className="flex-1">文章标题</span>
                <span className="w-20 text-center">日期</span>
                <span className="w-20 text-center">大小</span>
                <span className="w-20 text-center">状态</span>
                <span className="w-8" />
              </div>

              {/* File Rows */}
              <div className="max-h-60 overflow-y-auto">
                {files.map((f) => (
                  <div
                    key={f.filename}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm border-b last:border-b-0 transition-colors ${
                      selectedIds.has(f.filename)
                        ? isDark ? 'bg-lobster-900/20' : 'bg-lobster-50'
                        : isDark ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'
                    } ${isDark ? 'border-gray-800' : 'border-gray-100'}`}
                  >
                    <button onClick={() => toggleSelect(f.filename)} className="text-lobster-500">
                      {selectedIds.has(f.filename) ? '✅' : '⬜'}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${textPrimary}`}>{f.title}</p>
                      <p className={`text-xs truncate ${textMuted}`}>
                        {f.tags.length > 0 && <span>{f.tags.join(', ')} · </span>}
                        {f.filename}
                      </p>
                    </div>
                    <span className={`w-20 text-center text-xs ${textMuted}`}>{f.date}</span>
                    <span className={`w-20 text-center text-xs ${textMuted}`}>{f.size}</span>
                    <span className={`w-20 text-center text-xs ${textMuted}`}>
                      {f.tags.length > 0 ? (
                        <span className="px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300">
                          {f.tags.length} 标签
                        </span>
                      ) : (
                        <span className="text-gray-400">无标签</span>
                      )}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemove(f.filename); }}
                      className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <div>
                {errors.map((err, i) => (
                  <p key={i} className="text-sm text-red-600 dark:text-red-400">{err}</p>
                ))}
              </div>
            </div>
          )}

          {/* Success Message */}
          {importStatus === 'done' && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              <p className="text-sm text-green-700 dark:text-green-300">
                成功导入 {selectedIds.size} 篇文章（{defaultStatus === 'draft' ? '草稿' : '已发布'}）
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800 shrink-0">
          {/* Default Status Selector */}
          <div className="flex items-center gap-3">
            <span className={`text-sm ${textMuted}`}>导入后状态：</span>
            <div className="flex gap-2">
              <button
                onClick={() => setDefaultStatus('draft')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                  defaultStatus === 'draft'
                    ? 'bg-amber-500 text-white border-amber-500'
                    : isDark ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-600'
                }`}
              >
                📝 草稿
              </button>
              <button
                onClick={() => setDefaultStatus('published')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                  defaultStatus === 'published'
                    ? 'bg-green-500 text-white border-green-500'
                    : isDark ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-600'
                }`}
              >
                ✅ 已发布
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={importStatus === 'importing'}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50`}
            >
              {importStatus === 'done' ? '完成' : '取消'}
            </button>
            {importStatus !== 'done' && (
              <button
                onClick={handleImport}
                disabled={selectedIds.size === 0 || importStatus === 'importing'}
                className="px-4 py-2 bg-lobster-500 hover:bg-lobster-600 disabled:bg-lobster-400 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-60"
              >
                {importStatus === 'importing' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />导入中...</>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    导入 {selectedIds.size > 0 ? `${selectedIds.size} 篇` : ''}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
