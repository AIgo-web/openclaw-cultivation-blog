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
 * 从 localStorage 获取已保存的文章
 */
const getStoredPosts = (): Post[] => {
  try {
    const stored = localStorage.getItem('posts-data');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed;
    }
  } catch (error) {
    console.error('Failed to parse stored posts:', error);
  }
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
