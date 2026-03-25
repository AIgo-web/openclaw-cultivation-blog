/**
 * 数据管理组件
 * 提供导入、导出、备份、恢复功能
 */

import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  FileJson,
  FileText,
  Database,
  RefreshCw,
  Trash2,
  Check,
  X,
  AlertTriangle,
  Loader2,
  HardDrive,
  Cloud,
  FolderOpen
} from 'lucide-react';
import { useDarkMode } from '../../hooks/useDarkMode';
import {
  exportAllDataAsJSON,
  exportPostToMarkdown,
  exportAllDataAsBase64,
  importPostFromMarkdown,
  parseBackupData,
  decodeBackupData,
  mergeBackupData,
  generateBackupFilename,
  downloadFile,
  readFileContent,
  type BackupData
} from '../../services/dataService';
import type { Post, Comment, Tag } from '../../types';

interface DataManagerProps {
  posts: Post[];
  comments?: Comment[];
  tags?: Tag[];
  onImportData: (data: { posts: Post[]; comments?: Comment[] }) => void;
  onExportAll: () => void;
  className?: string;
}

export const DataManager: React.FC<DataManagerProps> = ({
  posts,
  comments = [],
  tags = [],
  onImportData,
  onExportAll,
  className = '',
}) => {
  const { isDark } = useDarkMode();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'backup'>('export');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // 导出为 JSON
  const handleExportJSON = () => {
    const json = exportAllDataAsJSON({ posts, comments, tags });
    downloadFile(json, `${generateBackupFilename()}.json`, 'application/json');
    setResult({ success: true, message: 'JSON 备份文件已下载' });
    setTimeout(() => setResult(null), 3000);
  };

  // 导出为 Base64（压缩格式）
  const handleExportBase64 = () => {
    const base64 = exportAllDataAsBase64({ posts, comments, tags });
    downloadFile(base64, `${generateBackupFilename()}.txt`, 'text/plain');
    setResult({ success: true, message: 'Base64 备份文件已下载（可用于迁移）' });
    setTimeout(() => setResult(null), 3000);
  };

  // 导出单篇文章
  const handleExportPost = (post: Post) => {
    const md = exportPostToMarkdown(post);
    downloadFile(md, `${post.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-')}.md`, 'text/markdown');
    setResult({ success: true, message: `「${post.title}」已导出为 Markdown` });
    setTimeout(() => setResult(null), 3000);
  };

  // 导入 JSON 备份
  const handleImportJSON = async (file: File) => {
    setIsProcessing(true);
    try {
      const content = await readFileContent(file);
      const backup = parseBackupData(content);
      
      if (!backup) {
        setResult({ success: false, message: '文件格式无效或已损坏' });
        setIsProcessing(false);
        return;
      }

      // 确认合并
      setPendingAction(() => () => {
        const merged = mergeBackupData({ posts, comments }, backup, { overwriteExisting: false });
        onImportData(merged);
        setResult({ success: true, message: `成功导入 ${backup.posts.length} 篇文章` });
        setShowConfirm(false);
      });
      setShowConfirm(true);
    } catch (error) {
      setResult({ success: false, message: '读取文件失败' });
    }
    setIsProcessing(false);
  };

  // 导入 Markdown
  const handleImportMarkdown = async (file: File) => {
    setIsProcessing(true);
    try {
      const content = await readFileContent(file);
      const post = importPostFromMarkdown(content);
      
      if (!post) {
        setResult({ success: false, message: 'Markdown 文件解析失败' });
        setIsProcessing(false);
        return;
      }

      onImportData({ posts: [...posts, post as Post], comments });
      setResult({ success: true, message: `成功导入「${post.title}」` });
    } catch (error) {
      setResult({ success: false, message: '读取文件失败' });
    }
    setIsProcessing(false);
  };

  // 本地备份到 localStorage
  const handleBackupToLocal = () => {
    const backup: BackupData = {
      version: '3.0.0',
      createdAt: new Date().toISOString(),
      posts,
      comments,
      tags,
    };
    localStorage.setItem('blog-backup', JSON.stringify(backup));
    setResult({ success: true, message: '已备份到浏览器存储' });
    setTimeout(() => setResult(null), 3000);
  };

  // 从 localStorage 恢复
  const handleRestoreFromLocal = () => {
    const backupStr = localStorage.getItem('blog-backup');
    if (!backupStr) {
      setResult({ success: false, message: '没有找到本地备份' });
      return;
    }

    const backup = parseBackupData(backupStr);
    if (!backup) {
      setResult({ success: false, message: '本地备份已损坏' });
      return;
    }

    setPendingAction(() => () => {
      onImportData({ posts: backup.posts, comments: backup.comments });
      setResult({ success: true, message: `已恢复 ${backup.posts.length} 篇文章` });
      setShowConfirm(false);
    });
    setShowConfirm(true);
  };

  // 确认对话框
  const ConfirmDialog = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-2xl shadow-2xl max-w-sm w-full p-6`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          </div>
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>确认操作</h3>
        </div>
        <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          导入将合并数据到现有文章中，不会覆盖已存在的文章。确定继续吗？
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => { setShowConfirm(false); setPendingAction(null); }}
            className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-colors ${
              isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            取消
          </button>
          <button
            onClick={() => pendingAction?.()}
            className="flex-1 py-2.5 bg-lobster-500 hover:bg-lobster-600 text-white rounded-lg font-medium text-sm transition-colors"
          >
            确认导入
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tab 切换 */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'export', label: '导出', icon: Download },
          { id: 'import', label: '导入', icon: Upload },
          { id: 'backup', label: '备份恢复', icon: Database },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-lobster-500 text-lobster-500'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* 导出 Tab */}
      {activeTab === 'export' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 导出全部 */}
          <button
            onClick={handleExportJSON}
            className={`p-6 rounded-xl border-2 border-dashed transition-all hover:border-lobster-400 hover:bg-lobster-50/50 dark:hover:bg-lobster-900/10 ${
              isDark ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50/50'
            }`}
          >
            <FileJson className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
            <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>导出完整备份</h4>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>JSON 格式，包含所有文章和设置</p>
          </button>

          {/* 导出压缩格式 */}
          <button
            onClick={handleExportBase64}
            className={`p-6 rounded-xl border-2 border-dashed transition-all hover:border-lobster-400 hover:bg-lobster-50/50 dark:hover:bg-lobster-900/10 ${
              isDark ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50/50'
            }`}
          >
            <Cloud className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-purple-400' : 'text-purple-500'}`} />
            <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>导出迁移文件</h4>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Base64 格式，适合跨平台迁移</p>
          </button>

          {/* 文章列表 */}
          <div className={`md:col-span-2 p-4 rounded-xl ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-gray-50 border border-gray-200'}`}>
            <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              导出单篇文章
            </h4>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {posts.map(post => (
                <div
                  key={post.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isDark ? 'bg-gray-800' : 'bg-white'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {post.title}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {post.date} · {post.tags.slice(0, 2).join(', ')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleExportPost(post)}
                    className="ml-3 p-2 text-lobster-500 hover:bg-lobster-50 dark:hover:bg-lobster-900/30 rounded-lg transition-colors"
                    title="导出为 Markdown"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 导入 Tab */}
      {activeTab === 'import' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 导入 JSON */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className={`p-6 rounded-xl border-2 border-dashed transition-all hover:border-lobster-400 hover:bg-lobster-50/50 dark:hover:bg-lobster-900/10 disabled:opacity-50 ${
              isDark ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50/50'
            }`}
          >
            {isProcessing ? (
              <Loader2 className={`w-10 h-10 mx-auto mb-3 animate-spin ${isDark ? 'text-lobster-400' : 'text-lobster-500'}`} />
            ) : (
              <FileJson className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
            )}
            <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>导入备份文件</h4>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>选择 JSON 备份文件</p>
          </button>

          {/* 导入 Markdown */}
          <button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.md,.markdown';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) handleImportMarkdown(file);
              };
              input.click();
            }}
            disabled={isProcessing}
            className={`p-6 rounded-xl border-2 border-dashed transition-all hover:border-lobster-400 hover:bg-lobster-50/50 dark:hover:bg-lobster-900/10 disabled:opacity-50 ${
              isDark ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50/50'
            }`}
          >
            <FileText className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
            <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>导入 Markdown</h4>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>导入单篇 .md 文件</p>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImportJSON(file);
              e.target.value = '';
            }}
            className="hidden"
          />
        </div>
      )}

      {/* 备份恢复 Tab */}
      {activeTab === 'backup' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 备份到本地 */}
          <button
            onClick={handleBackupToLocal}
            className={`p-6 rounded-xl border-2 border-dashed transition-all hover:border-lobster-400 hover:bg-lobster-50/50 dark:hover:bg-lobster-900/10 ${
              isDark ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50/50'
            }`}
          >
            <HardDrive className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-cyan-400' : 'text-cyan-500'}`} />
            <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>备份到浏览器</h4>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>保存到 localStorage</p>
          </button>

          {/* 从本地恢复 */}
          <button
            onClick={handleRestoreFromLocal}
            className={`p-6 rounded-xl border-2 border-dashed transition-all hover:border-lobster-400 hover:bg-lobster-50/50 dark:hover:bg-lobster-900/10 ${
              isDark ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50/50'
            }`}
          >
            <RefreshCw className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} />
            <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>从浏览器恢复</h4>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>恢复最近的本地备份</p>
          </button>
        </div>
      )}

      {/* 结果提示 */}
      {result && (
        <div className={`flex items-center gap-3 p-4 rounded-xl ${
          result.success
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          {result.success
            ? <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
            : <X className="w-5 h-5 text-red-600 dark:text-red-400" />
          }
          <p className={result.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
            {result.message}
          </p>
        </div>
      )}

      {/* 确认对话框 */}
      {showConfirm && <ConfirmDialog />}
    </div>
  );
};

export default DataManager;
