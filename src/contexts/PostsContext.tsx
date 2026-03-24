import React, { createContext, useContext, useState, useEffect } from 'react';
import { Post } from '../types';
import { posts as initialPosts } from '../data/posts';

interface PostsContextType {
  posts: Post[];
  addPost: (post: Post) => void;
  updatePost: (id: string, post: Post) => void;
  deletePost: (id: string) => void;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

/**
 * 从 localStorage 获取已保存的文章。
 * 如果 localStorage 中没有数据，或数据为空数组，则使用内置文章。
 * 已有文章以 localStorage 为准（保留管理后台添加的文章），
 * 但内置文章中若 localStorage 里缺失的，会自动补回来。
 */
const getStoredPosts = (): Post[] => {
  try {
    const stored = localStorage.getItem('posts-data');
    if (stored) {
      const parsed: Post[] = JSON.parse(stored);
      // 如果 localStorage 里有数据（非空），直接使用
      if (Array.isArray(parsed) && parsed.length > 0) {
        // 补回 localStorage 中可能缺失的内置文章
        const storedIds = new Set(parsed.map(p => p.id));
        const missing = initialPosts.filter(p => !storedIds.has(p.id));
        return missing.length > 0 ? [...missing, ...parsed] : parsed;
      }
    }
  } catch (error) {
    console.error('Failed to parse stored posts:', error);
  }
  // localStorage 为空或解析失败，使用内置数据
  return initialPosts;
};

/**
 * 保存文章到 localStorage
 */
const savePostsToStorage = (posts: Post[]) => {
  try {
    localStorage.setItem('posts-data', JSON.stringify(posts));
  } catch (error) {
    console.error('Failed to save posts to localStorage:', error);
  }
};

export const PostsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>(() => getStoredPosts());

  // 每当 posts 更新时，自动保存到 localStorage
  useEffect(() => {
    savePostsToStorage(posts);
  }, [posts]);

  const addPost = (post: Post) => {
    setPosts(prev => [...prev, post]);
  };

  const updatePost = (id: string, post: Post) => {
    setPosts(prev =>
      prev.map(p => p.id === id ? post : p)
    );
  };

  const deletePost = (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <PostsContext.Provider value={{ posts, addPost, updatePost, deletePost }}>
      {children}
    </PostsContext.Provider>
  );
};

export const usePosts = () => {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error('usePosts must be used within PostsProvider');
  }
  return context;
};
