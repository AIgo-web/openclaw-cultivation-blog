/**
 * 龙虾博客调试日志系统
 * 提供分级日志记录、时间戳、模块标记和持久化存储
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: unknown;
  stack?: string;
}

const LOG_STORAGE_KEY = 'lobster-debug-logs';
const MAX_LOG_ENTRIES = 500; // 最多保留 500 条日志
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// 当前日志级别（production 环境默认 warn）
let currentMinLevel: LogLevel = (import.meta.env.DEV ? 'debug' : 'warn') as LogLevel;

// 内存中的日志缓存
let logBuffer: LogEntry[] = [];
let logListeners: Array<(logs: LogEntry[]) => void> = [];

/** 从 localStorage 加载历史日志 */
function loadPersistedLogs(): LogEntry[] {
  try {
    const stored = localStorage.getItem(LOG_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as LogEntry[];
    }
  } catch {
    // 解析失败忽略
  }
  return [];
}

/** 持久化日志到 localStorage */
function persistLogs(logs: LogEntry[]) {
  try {
    // 只持久化最近 MAX_LOG_ENTRIES 条
    const toStore = logs.slice(-MAX_LOG_ENTRIES);
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(toStore));
  } catch {
    // localStorage 满了也不报错
  }
}

/** 通知监听器 */
function notifyListeners() {
  logListeners.forEach(fn => fn(logBuffer));
}

/** 设置最低日志级别 */
export function setLogLevel(level: LogLevel): void {
  currentMinLevel = level;
}

/** 获取当前日志级别 */
export function getLogLevel(): LogLevel {
  return currentMinLevel;
}

/** 注册日志监听器（用于调试面板） */
export function onLogUpdate(listener: (logs: LogEntry[]) => void): () => void {
  logListeners.push(listener);
  // 立即推送当前日志
  listener(logBuffer);
  return () => {
    logListeners = logListeners.filter(fn => fn !== listener);
  };
}

/** 获取所有日志 */
export function getAllLogs(): LogEntry[] {
  return [...logBuffer];
}

/** 清空日志 */
export function clearLogs(): void {
  logBuffer = [];
  persistLogs([]);
  notifyListeners();
}

/** 按级别过滤日志 */
export function getLogsByLevel(level: LogLevel): LogEntry[] {
  return logBuffer.filter(log => log.level === level);
}

/** 搜索日志 */
export function searchLogs(query: string): LogEntry[] {
  const q = query.toLowerCase();
  return logBuffer.filter(
    log =>
      log.message.toLowerCase().includes(q) ||
      log.module.toLowerCase().includes(q) ||
      (typeof log.data === 'string' && log.data.toLowerCase().includes(q))
  );
}

/** 核心日志函数 */
function log(level: LogLevel, module: string, message: string, data?: unknown) {
  if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[currentMinLevel]) return;

  const entry: LogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    level,
    module,
    message,
    data: data !== undefined ? data : undefined,
  };

  // error 级别捕获调用栈
  if (level === 'error') {
    try {
      throw new Error();
    } catch (e) {
      const stack = (e as Error).stack?.split('\n').slice(3, 6).join('\n');
      if (stack) entry.stack = stack;
    }
  }

  // 控制台输出（带颜色）
  const colors: Record<LogLevel, string> = {
    debug: '#888',
    info: '#2196F3',
    warn: '#FF9800',
    error: '#F44336',
  };
  const prefix = `%c[${entry.timestamp.slice(11, 19)}]%c[${level.toUpperCase()}]%c[${module}]`;
  console.log(
    prefix,
    'color: #666',
    `color: ${colors[level]}; font-weight: bold`,
    'color: #333',
    message,
    data !== undefined ? data : ''
  );

  // 写入缓冲
  logBuffer.push(entry);
  if (logBuffer.length > MAX_LOG_ENTRIES) {
    logBuffer = logBuffer.slice(-MAX_LOG_ENTRIES);
  }

  // 持久化
  persistLogs(logBuffer);
  notifyListeners();
}

// === 便捷 API ===

/** 创建模块专属的 logger 工厂 */
export function createLogger(module: string) {
  return {
    debug: (message: string, data?: unknown) => log('debug', module, message, data),
    info: (message: string, data?: unknown) => log('info', module, message, data),
    warn: (message: string, data?: unknown) => log('warn', module, message, data),
    error: (message: string, data?: unknown) => log('error', module, message, data),
  };
}

// 全局默认 logger
export const logger = createLogger('App');

/** 导出日志为 JSON 文件 */
export function exportLogs(): void {
  const content = JSON.stringify(logBuffer, null, 2);
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lobster-debug-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 初始化：加载历史日志
logBuffer = loadPersistedLogs();
