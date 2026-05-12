/**
 * 博客数据持久化服务
 * 将 localStorage 数据同步到 Python 后端，实现跨设备数据持久化
 */

const API_BASE = 'http://localhost:5001';

type DataKey = 'posts-data' | 'series-data';

/**
 * 通用 fetch 重试工具
 * @param url 请求地址
 * @param options fetch 选项
 * @param retries 重试次数（默认 1 次）
 * @param retryDelay 重试延迟（毫秒，默认 500ms）
 */
async function retryFetch(
  url: string,
  options: RequestInit,
  retries = 1,
  retryDelay = 500
): Promise<Response> {
  try {
    const res = await fetch(url, options);
    return res;
  } catch (err) {
    if (retries <= 0) throw err;
    console.debug(`[persistService] Request failed, retrying in ${retryDelay}ms...`, err);
    await new Promise(r => setTimeout(r, retryDelay));
    return retryFetch(url, options, retries - 1, retryDelay);
  }
}

/**
 * 从后端读取数据
 * 失败时静默返回 null（降级到 localStorage）
 */
export async function fetchRemoteData<T>(key: DataKey): Promise<T | null> {
  try {
    const res = await retryFetch(
      `${API_BASE}/api/blog/data/${key}`,
      { signal: AbortSignal.timeout(8000) },
      1,
      500
    );
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
    await retryFetch(
      `${API_BASE}/api/blog/data/${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
        signal: AbortSignal.timeout(10000),
      },
      1,
      500
    );
  } catch {
    // 后端不可用时不报错，数据已在 localStorage 中
  }
}

/**
 * 检查后端是否可用
 */
export async function isBackendAvailable(): Promise<boolean> {
  try {
    const res = await retryFetch(
      `${API_BASE}/api/wechat/health`,
      { signal: AbortSignal.timeout(5000) },
      1,
      500
    );
    return res.ok;
  } catch {
    return false;
  }
}
