import React, { createContext, useContext, useState, useEffect } from 'react';
import { Comment, Reply } from '../types';

interface CommentsContextType {
  comments: Comment[];
  addComment: (comment: Omit<Comment, 'id' | 'date' | 'status' | 'replies'>) => void;
  addReply: (commentId: string, reply: Omit<Reply, 'id' | 'date' | 'commentId'>) => void;
  approveComment: (id: string) => void;
  rejectComment: (id: string) => void;
  deleteComment: (id: string) => void;
  getPostComments: (postId: string) => Comment[];
  pendingCount: number;
}

const CommentsContext = createContext<CommentsContextType | undefined>(undefined);

const STORAGE_KEY = 'comments-data';

const getStoredComments = (): Comment[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return [];
};

const saveComments = (comments: Comment[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
  } catch { /* ignore */ }
};

export const CommentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [comments, setComments] = useState<Comment[]>(() => getStoredComments());

  useEffect(() => {
    saveComments(comments);
  }, [comments]);

  const addComment = (data: Omit<Comment, 'id' | 'date' | 'status' | 'replies'>) => {
    const newComment: Comment = {
      ...data,
      id: `c_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      date: new Date().toISOString(),
      status: 'pending',
      replies: [],
    };
    setComments(prev => [newComment, ...prev]);
  };

  const addReply = (commentId: string, data: Omit<Reply, 'id' | 'date' | 'commentId'>) => {
    const reply: Reply = {
      ...data,
      id: `r_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      commentId,
      date: new Date().toISOString(),
    };
    setComments(prev =>
      prev.map(c =>
        c.id === commentId ? { ...c, replies: [...c.replies, reply] } : c
      )
    );
  };

  const approveComment = (id: string) => {
    setComments(prev => prev.map(c => c.id === id ? { ...c, status: 'approved' } : c));
  };

  const rejectComment = (id: string) => {
    setComments(prev => prev.map(c => c.id === id ? { ...c, status: 'rejected' } : c));
  };

  const deleteComment = (id: string) => {
    setComments(prev => prev.filter(c => c.id !== id));
  };

  const getPostComments = (postId: string) =>
    comments.filter(c => c.postId === postId && c.status === 'approved');

  const pendingCount = comments.filter(c => c.status === 'pending').length;

  return (
    <CommentsContext.Provider value={{
      comments, addComment, addReply,
      approveComment, rejectComment, deleteComment,
      getPostComments, pendingCount
    }}>
      {children}
    </CommentsContext.Provider>
  );
};

export const useComments = () => {
  const ctx = useContext(CommentsContext);
  if (!ctx) throw new Error('useComments must be used within CommentsProvider');
  return ctx;
};
