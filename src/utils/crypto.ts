/**
 * 密码哈希工具（基于 Web Crypto API）
 * 使用 SHA-256 + 随机盐值进行密码哈希
 */

/**
 * 生成随机盐值（hex 字符串）
 * @param bytes 盐值字节数，默认 16
 */
export function generateSalt(bytes = 16): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * SHA-256 加盐哈希
 * @param password 明文密码
 * @param salt 盐值（hex 字符串）
 * @returns hex 格式哈希值
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer), b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 验证密码
 * @param password 明文密码
 * @param salt 盐值
 * @param expectedHash 期望的哈希值
 */
export async function verifyPassword(password: string, salt: string, expectedHash: string): Promise<boolean> {
  const hash = await hashPassword(password, salt);
  return hash === expectedHash;
}

/**
 * 存储格式：salt:hash
 */
export function formatStoredHash(salt: string, hash: string): string {
  return `${salt}:${hash}`;
}

export function parseStoredHash(stored: string): { salt: string; hash: string } | null {
  const idx = stored.indexOf(':');
  if (idx <= 0) return null;
  return { salt: stored.slice(0, idx), hash: stored.slice(idx + 1) };
}
