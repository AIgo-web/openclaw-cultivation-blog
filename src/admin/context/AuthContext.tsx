import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => { success: boolean; message: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 密码存储 key
const PASSWORD_KEY = 'adminPassword';
const DEFAULT_PASSWORD = 'admin123';

// 获取当前有效密码（优先读 localStorage，fallback 默认值）
const getStoredPassword = (): string => {
  try {
    return localStorage.getItem(PASSWORD_KEY) || DEFAULT_PASSWORD;
  } catch {
    return DEFAULT_PASSWORD;
  }
};

// 会话配置
const SESSION_KEY = 'adminSession';
const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 分钟（毫秒）

interface SessionData {
  isAuthenticated: boolean;
  loginTime: number;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 从 localStorage 恢复会话
  const restoreSession = () => {
    try {
      const sessionJson = localStorage.getItem(SESSION_KEY);
      if (sessionJson) {
        const session: SessionData = JSON.parse(sessionJson);
        const now = Date.now();
        const sessionAge = now - session.loginTime;

        // 检查会话是否仍然有效（10 分钟内）
        if (session.isAuthenticated && sessionAge < SESSION_TIMEOUT) {
          setIsAuthenticated(true);
          // 刷新登录时间戳（延长会话）
          updateSessionTimestamp();
        } else {
          // 会话已过期
          localStorage.removeItem(SESSION_KEY);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
      localStorage.removeItem(SESSION_KEY);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // 更新会话时间戳（不修改认证状态）
  const updateSessionTimestamp = () => {
    try {
      const sessionJson = localStorage.getItem(SESSION_KEY);
      if (sessionJson) {
        const session: SessionData = JSON.parse(sessionJson);
        session.loginTime = Date.now();
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      }
    } catch (error) {
      console.error('Failed to update session timestamp:', error);
    }
  };

  useEffect(() => {
    // 应用加载时恢复会话
    restoreSession();

    // 定期检查会话是否过期（每 30 秒检查一次）
    const sessionCheckInterval = setInterval(() => {
      const sessionJson = localStorage.getItem(SESSION_KEY);
      if (sessionJson) {
        try {
          const session: SessionData = JSON.parse(sessionJson);
          const now = Date.now();
          const sessionAge = now - session.loginTime;

          if (session.isAuthenticated && sessionAge >= SESSION_TIMEOUT) {
            // 会话已过期，清除认证状态
            localStorage.removeItem(SESSION_KEY);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Session check failed:', error);
        }
      }
    }, 30000); // 30 秒检查一次

    return () => clearInterval(sessionCheckInterval);
  }, []);

  // 页面获得焦点时更新会话时间戳
  useEffect(() => {
    const handleFocus = () => {
      if (isAuthenticated) {
        updateSessionTimestamp();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isAuthenticated]);

  const login = (username: string, password: string): boolean => {
    if (username === 'admin' && password === getStoredPassword()) {
      const session: SessionData = {
        isAuthenticated: true,
        loginTime: Date.now()
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const changePassword = (currentPassword: string, newPassword: string): { success: boolean; message: string } => {
    if (currentPassword !== getStoredPassword()) {
      return { success: false, message: '当前密码不正确' };
    }
    if (newPassword.length < 6) {
      return { success: false, message: '新密码至少 6 位' };
    }
    try {
      localStorage.setItem(PASSWORD_KEY, newPassword);
      return { success: true, message: '密码修改成功，下次登录请使用新密码' };
    } catch {
      return { success: false, message: '保存失败，请重试' };
    }
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, changePassword }}>
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

// 添加导出以便其他组件使用
export default AuthContext;
