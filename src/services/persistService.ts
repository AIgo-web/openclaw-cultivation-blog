/**
 * 博客数据持久化服务 — SECURED version
 * FIX (VULN-0001): 写入操作附带管理员会话 token（由 /api/admin/login 签发）。
 * 读取保持公开（博客前台需要）；写入无 token 时后端返回 401，前端静默降级到 localStorage。
 */

const API_BASE = '';

type DataKey = 'posts-data' | 'series-data';

async function getAuthHeader(): Promise<Record<string, string>> {
  try {
    const { getAuthToken } = await import('./authToken');
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

/**
 * 从后端读取数据（公开）
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
 * 向后端写入数据（需管理员会话）
 * 失败时静默忽略（不影响本地使用）
 */
export async function pushRemoteData<T>(key: DataKey, data: T): Promise<void> {
  try {
    const headers = await getAuthHeader();
    await fetch(`${API_BASE}/api/blog/data/${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ data }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // 后端不可用/未登录时不报错，数据已在 localStorage 中
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
