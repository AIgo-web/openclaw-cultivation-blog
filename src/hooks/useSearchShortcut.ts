import { useEffect } from 'react';
import { useSearch } from '../contexts/SearchContext';

/**
 * 全局搜索快捷键 Hook
 * 监听 Cmd+K (Mac) 或 Ctrl+K (Windows/Linux)
 * 或按 Esc 关闭
 */
export const useSearchShortcut = () => {
  const { toggleSearch, closeSearch } = useSearch();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K (Mac) 或 Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleSearch();
      }
      
      // Esc 关闭搜索
      if (e.key === 'Escape') {
        closeSearch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSearch, closeSearch]);
};
