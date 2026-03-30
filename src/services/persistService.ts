/**
 * 博客数据持久化服务
 * 将 localStorage 数据同步到 Python 后端，实现跨设备数据持久化
 */

const API_BASE = 'http://localhost:5001';

type DataKey = 'posts-data' | 'series-data';

/**
 * 从后端读取数据
 * 失败时静默返回 null（降级到 localStorage）
 */
export async function fetchRemoteData<T>(key: DataKey): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}/api/blog/data/${key}`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? (json.data as T) : null;
  } catch {
    return null;
  }
}

/**
 * 向后端写入数据
 * 失败时静默忽略（不影响本地使用）
 */
export async function pushRemoteData<T>(key: DataKey, data: T): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/blog/data/${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // 后端不可用时不报错，数据已在 localStorage 中
  }
}

/**
 * 检查后端是否可用
 */
export async function isBackendAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/wechat/health`, {
      signal: AbortSignal.timeout(2000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
