/**
 * 批量操作 Hook
 * 提供文章批量选择、批量发布、批量删除等功能
 */

import { useState, useCallback } from 'react';
import type { Post } from '../types';

export interface BatchOperation {
  type: 'publish' | 'unpublish' | 'delete' | 'export';
  count: number;
}

export function useBatchOperations(posts: Post[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectAll, setIsSelectAll] = useState(false);

  // 全选/取消全选
  const toggleSelectAll = useCallback(() => {
    if (isSelectAll) {
      setSelectedIds(new Set());
      setIsSelectAll(false);
    } else {
      setSelectedIds(new Set(posts.map(p => p.id)));
      setIsSelectAll(true);
    }
  }, [isSelectAll, posts]);

  // 选择/取消选择单个
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      setIsSelectAll(newSet.size === posts.length);
      return newSet;
    });
  }, [posts.length]);

  // 清除选择
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setIsSelectAll(false);
  }, []);

  // 获取选中的文章
  const getSelectedPosts = useCallback(() => {
    return posts.filter(p => selectedIds.has(p.id));
  }, [posts, selectedIds]);

  // 执行批量操作
  const executeBatchOperation = useCallback((
    operation: BatchOperation['type'],
    onUpdate: (ids: string[], operation: BatchOperation['type']) => void
  ) => {
    if (selectedIds.size === 0) return;
    onUpdate(Array.from(selectedIds), operation);
    clearSelection();
  }, [selectedIds, clearSelection]);

  return {
    selectedIds,
    isSelectAll,
    selectedCount: selectedIds.size,
    toggleSelectAll,
    toggleSelect,
    clearSelection,
    getSelectedPosts,
    executeBatchOperation,
  };
}
