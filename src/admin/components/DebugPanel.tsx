/**
 * 调试日志面板组件
 * 在管理后台显示实时日志，支持过滤、搜索、导出
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Bug,
  Trash2,
  Download,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  X,
  Circle,
} from 'lucide-react';
import { useDarkMode } from '../../hooks/useDarkMode';
import {
  type LogEntry,
  type LogLevel,
  onLogUpdate,
  clearLogs,
  exportLogs,
  searchLogs,
  setLogLevel,
  getLogLevel,
  getAllLogs,
} from '../../utils/debugLogger';

const LEVEL_STYLES: Record<LogLevel, { bg: string; text: string; dot: string; label: string }> = {
  debug: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', dot: 'bg-gray-400', label: 'DEBUG' },
  info: { bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500', label: 'INFO' },
  warn: { bg: 'bg-yellow-50 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', dot: 'bg-yellow-500', label: 'WARN' },
  error: { bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500', label: 'ERROR' },
};

interface DebugPanelProps {
  className?: string;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ className = '' }) => {
  const { isDark } = useDarkMode();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<LogLevel | 'all'>('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [showLevelSelector, setShowLevelSelector] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onLogUpdate(setLogs);
    return unsubscribe;
  }, []);

  // 自动滚动到底部
  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs.length, autoScroll]);

  const filteredLogs = searchTerm
    ? searchLogs(searchTerm)
    : levelFilter === 'all'
      ? logs
      : logs.filter(l => l.level === levelFilter);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const levelCounts = {
    debug: logs.filter(l => l.level === 'debug').length,
    info: logs.filter(l => l.level === 'info').length,
    warn: logs.filter(l => l.level === 'warn').length,
    error: logs.filter(l => l.level === 'error').length,
  };

  const currentLevel = getLogLevel();

  return (
    <div className={`flex flex-col ${className}`} style={{ height: '500px' }}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 rounded-t-xl border ${
        isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center gap-3">
          <Bug className="w-5 h-5 text-lobster-500" />
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            调试日志
          </h3>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-600'
          }`}>
            {logs.length} 条
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* 最低级别选择器 */}
          <div className="relative">
            <button
              onClick={() => setShowLevelSelector(!showLevelSelector)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                isDark
                  ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              最低级别: {currentLevel.toUpperCase()}
            </button>
            {showLevelSelector && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowLevelSelector(false)} />
                <div className={`absolute right-0 top-full mt-1 z-20 rounded-lg shadow-lg border py-1 ${
                  isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  {(['debug', 'info', 'warn', 'error'] as LogLevel[]).map(level => (
                    <button
                      key={level}
                      onClick={() => { setLogLevel(level); setShowLevelSelector(false); }}
                      className={`block w-full text-left px-4 py-1.5 text-sm transition-colors ${
                        currentLevel === level
                          ? 'text-lobster-500 font-medium'
                          : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {level.toUpperCase()}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <button
            onClick={exportLogs}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}
            title="导出日志"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={clearLogs}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-gray-400 hover:bg-red-900/30 hover:text-red-400' : 'text-gray-500 hover:bg-red-50 hover:text-red-500'
            }`}
            title="清空日志"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={`flex items-center gap-2 px-4 py-2 border-x ${
        isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50/50 border-gray-200'
      }`}>
        <div className="relative flex-1">
          <Search className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${
            isDark ? 'text-gray-500' : 'text-gray-400'
          }`} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索日志..."
            className={`w-full pl-8 pr-3 py-1.5 rounded-lg text-sm border ${
              isDark
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            } focus:outline-none focus:ring-2 focus:ring-lobster-500`}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setLevelFilter('all')}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              levelFilter === 'all'
                ? 'bg-lobster-500 text-white'
                : isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            全部
          </button>
          {(['debug', 'info', 'warn', 'error'] as LogLevel[]).map(level => (
            <button
              key={level}
              onClick={() => setLevelFilter(level)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                levelFilter === level
                  ? `${isDark ? 'bg-gray-700' : 'bg-gray-200'} ${LEVEL_STYLES[level].text}`
                  : isDark ? 'text-gray-500 hover:bg-gray-800' : 'text-gray-400 hover:bg-gray-100'
              }`}
            >
              <Circle className="w-2 h-2" fill={LEVEL_STYLES[level].dot.replace('bg-', '')} style={{ fill: undefined, color: undefined }} />
              <span>{levelCounts[level]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Log List */}
      <div
        ref={containerRef}
        className={`flex-1 overflow-y-auto border-x border-b rounded-b-xl ${
          isDark ? 'bg-gray-950' : 'bg-white'
        }`}
        onScroll={() => {
          if (!containerRef.current) return;
          const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
          setAutoScroll(scrollHeight - scrollTop - clientHeight < 50);
        }}
      >
        {filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className={`text-sm ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
              {logs.length === 0 ? '暂无日志' : '没有匹配的日志'}
            </p>
          </div>
        ) : (
          filteredLogs.map(log => {
            const style = LEVEL_STYLES[log.level];
            const isExpanded = expandedIds.has(log.id);
            return (
              <div
                key={log.id}
                className={`border-b last:border-b-0 ${
                  isDark ? 'border-gray-800/50' : 'border-gray-100'
                }`}
              >
                <button
                  className="w-full flex items-start gap-2 px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => toggleExpand(log.id)}
                >
                  {log.data || log.stack ? (
                    isExpanded
                      ? <ChevronDown className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-400" />
                      : <ChevronRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-400" />
                  ) : (
                    <span className="w-3.5 shrink-0" />
                  )}
                  <span className={`text-xs font-mono shrink-0 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                    {log.timestamp.slice(11, 23)}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-mono font-medium shrink-0 ${style.bg} ${style.text}`}>
                    {style.label}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-mono shrink-0 ${
                    isDark ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {log.module}
                  </span>
                  <span className={`text-sm flex-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {log.message}
                  </span>
                </button>
                {isExpanded && (log.data || log.stack) && (
                  <div className={`mx-4 mb-2 px-3 py-2 rounded-lg text-xs font-mono overflow-auto max-h-40 ${
                    isDark ? 'bg-gray-900 text-gray-400' : 'bg-gray-50 text-gray-600'
                  }`}>
                    {log.data && (
                      <pre className="whitespace-pre-wrap break-all">
                        {typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2)}
                      </pre>
                    )}
                    {log.stack && (
                      <pre className="mt-2 whitespace-pre text-red-400 dark:text-red-300">
                        {log.stack}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
