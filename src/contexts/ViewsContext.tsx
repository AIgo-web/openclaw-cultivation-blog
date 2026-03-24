import React, { createContext, useContext, useCallback } from 'react';

interface ViewsContextType {
  getViews: (postId: string) => number;
  incrementViews: (postId: string) => void;
  getTotalViews: () => number;
  getTopPosts: (postIds: string[], limit?: number) => Array<{ id: string; views: number }>;
}

const ViewsContext = createContext<ViewsContextType | undefined>(undefined);

const STORAGE_KEY = 'post-views';

const getViewsData = (): Record<string, number> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return {};
};

const saveViewsData = (data: Record<string, number>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
};

export const ViewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getViews = useCallback((postId: string): number => {
    return getViewsData()[postId] || 0;
  }, []);

  const incrementViews = useCallback((postId: string) => {
    // 防止同一会话重复计数
    const sessionKey = `viewed_${postId}`;
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, '1');

    const data = getViewsData();
    data[postId] = (data[postId] || 0) + 1;
    saveViewsData(data);
  }, []);

  const getTotalViews = useCallback((): number => {
    const data = getViewsData();
    return Object.values(data).reduce((sum, v) => sum + v, 0);
  }, []);

  const getTopPosts = useCallback((postIds: string[], limit = 5) => {
    const data = getViewsData();
    return postIds
      .map(id => ({ id, views: data[id] || 0 }))
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  }, []);

  return (
    <ViewsContext.Provider value={{ getViews, incrementViews, getTotalViews, getTopPosts }}>
      {children}
    </ViewsContext.Provider>
  );
};

export const useViews = () => {
  const ctx = useContext(ViewsContext);
  if (!ctx) throw new Error('useViews must be used within ViewsProvider');
  return ctx;
};
