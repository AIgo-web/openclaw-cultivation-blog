/**
 * 管理员会话 token 存储（新增，FIX VULN-0003/VULN-0004）
 * token 由后端 /api/admin/login 签发，仅存 sessionStorage（关闭标签页即失效）。
 * 客户端不再保存任何密码或静态发布 token。
 */
const TOKEN_KEY = 'strix_admin_token';

export function getAuthToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  try {
    if (token) {
      sessionStorage.setItem(TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // storage 不可用时静默失败（登录后管理操作会被后端拒绝，属安全降级）
  }
}
