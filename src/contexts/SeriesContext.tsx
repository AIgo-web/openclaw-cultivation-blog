import React, { createContext, useContext, useState, useEffect } from 'react';
import { Series } from '../types';
import { fetchRemoteData, pushRemoteData } from '../services/persistService';

interface SeriesContextType {
  seriesList: Series[];
  addSeries: (series: Series) => void;
  updateSeries: (id: string, series: Series) => void;
  deleteSeries: (id: string) => void;
  getSeriesById: (id: string) => Series | undefined;
  reorderSeries: (newList: Series[]) => void;
}

const SeriesContext = createContext<SeriesContextType | undefined>(undefined);

const STORAGE_KEY = 'series-data';

const getStoredSeries = (): Series[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: Series[] = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse stored series:', e);
  }
  return [];
};

const saveSeriesToStorage = (list: Series[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save series to localStorage:', e);
    // localStorage 超限时给用户提示
    const isQuotaError =
      e instanceof DOMException &&
      (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED');
    if (isQuotaError) {
      alert(
        '⚠️ 存储空间不足！\n\n本地上传的 PDF/HTML 文件过大，已超过浏览器 localStorage 5MB 限制。\n\n建议：\n1. 将文件上传到网盘/OSS，使用「网址」模式粘贴外链\n2. 或删除部分大文件后重新保存'
      );
    }
  }
  // 异步推送到后端
  pushRemoteData('series-data', list);
};

export const SeriesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [seriesList, setSeriesList] = useState<Series[]>(() => getStoredSeries());
  const [initialized, setInitialized] = useState(false);

  // 启动时从后端拉取最新数据
  useEffect(() => {
    fetchRemoteData<Series[]>('series-data').then(remoteList => {
      if (remoteList && Array.isArray(remoteList) && remoteList.length > 0) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteList));
        } catch {}
        setSeriesList(remoteList);
      }
      setInitialized(true);
    });
  }, []);

  useEffect(() => {
    if (!initialized) return;
    saveSeriesToStorage(seriesList);
  }, [seriesList, initialized]);

  const addSeries = (series: Series) => {
    setSeriesList(prev => [...prev, series]);
  };

  const updateSeries = (id: string, series: Series) => {
    setSeriesList(prev => prev.map(s => s.id === id ? series : s));
  };

  const deleteSeries = (id: string) => {
    setSeriesList(prev => prev.filter(s => s.id !== id));
  };

  const getSeriesById = (id: string) => {
    return seriesList.find(s => s.id === id);
  };

  const reorderSeries = (newList: Series[]) => {
    setSeriesList(newList);
  };

  return (
    <SeriesContext.Provider value={{ seriesList, addSeries, updateSeries, deleteSeries, getSeriesById, reorderSeries }}>
      {children}
    </SeriesContext.Provider>
  );
};

export const useSeries = () => {
  const context = useContext(SeriesContext);
  if (!context) throw new Error('useSeries must be used within SeriesProvider');
  return context;
};

