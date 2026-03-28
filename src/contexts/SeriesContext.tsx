import React, { createContext, useContext, useState, useEffect } from 'react';
import { Series } from '../types';

interface SeriesContextType {
  seriesList: Series[];
  addSeries: (series: Series) => void;
  updateSeries: (id: string, series: Series) => void;
  deleteSeries: (id: string) => void;
  getSeriesById: (id: string) => Series | undefined;
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
  }
};

export const SeriesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [seriesList, setSeriesList] = useState<Series[]>(() => getStoredSeries());

  useEffect(() => {
    saveSeriesToStorage(seriesList);
  }, [seriesList]);

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

  return (
    <SeriesContext.Provider value={{ seriesList, addSeries, updateSeries, deleteSeries, getSeriesById }}>
      {children}
    </SeriesContext.Provider>
  );
};

export const useSeries = () => {
  const context = useContext(SeriesContext);
  if (!context) throw new Error('useSeries must be used within SeriesProvider');
  return context;
};
