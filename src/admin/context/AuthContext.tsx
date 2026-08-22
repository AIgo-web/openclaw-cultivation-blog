import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getAuthToken, setAuthToken } from '../../services/authToken';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  username: string | null;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  changePassword: () => { success: boolean; message: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);

  // FIX (VULN-0004): 认证状态由服务端签发/校验的 token 决定，不再信任 localStorage 会话标志。
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      // 有 token 视为已登录（真实校验在每次管理 API 调用时由后端执行）
      setIsAuthenticated(true);
      setUsername('admin');
    } else {
      setIsAuthenticated(false);
      setUsername(null);
    }
    setIsLoading(false);
  }, []);

  const login = async (usernameInput: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password }),
      });
      if (!res.ok) {
        return { success: false, message: '用户名或密码错误' };
      }
      const json = await res.json();
      setAuthToken(json.token);
      setIsAuthenticated(true);
      setUsername(json.username || usernameInput);
      return { success: true };
    } catch {
      return { success: false, message: '登录服务不可用，请稍后再试' };
    }
  };

  const changePassword = (): { success: boolean; message: string } => {
    // 密码由服务器管理（/etc/markdown-publish.env），客户端不再存储密码
    return { success: false, message: '密码由服务器环境变量管理，请联系管理员修改' };
  };

  const logout = () => {
    setAuthToken(null);
    setIsAuthenticated(false);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, username, login, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
