import React, { createContext, useContext, useState, useEffect } from 'react';
import { Comment, Reply } from '../types';
import sensitiveWords from '../data/sensitive-words.json';

interface CommentsContextType {
  comments: Comment[];
  addComment: (comment: Omit<Comment, 'id' | 'date' | 'status' | 'replies'>) => void;
  addReply: (commentId: string, reply: Omit<Reply, 'id' | 'date' | 'commentId'>) => void;
  approveComment: (id: string, reviewer: string) => void;
  rejectComment: (id: string, reason: string, reviewer: string) => void;
  deleteComment: (id: string) => void;
  getPostComments: (postId: string) => Comment[];
  pendingCount: number;
}

const CommentsContext = createContext<CommentsContextType | undefined>(undefined);

const STORAGE_KEY = 'comments-data';

// 检测敏感词
const containsSensitiveWord = (text: string): boolean => {
  if (!sensitiveWords || sensitiveWords.length === 0) return false;
  const lowerText = text.toLowerCase();
  return sensitiveWords.some(word => lowerText.includes(word.toLowerCase()));
};

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
    // 关键词过滤
    if (containsSensitiveWord(data.content)) {
      throw new Error('评论内容包含敏感词，请修改后重试');
    }

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

  const approveComment = (id: string, reviewer: string) => {
    setComments(prev => prev.map(c =>
      c.id === id
        ? { ...c, status: 'approved', reviewedBy: reviewer, reviewedAt: new Date().toISOString() }
        : c
    ));
  };

  const rejectComment = (id: string, reason: string, reviewer: string) => {
    setComments(prev => prev.map(c =>
      c.id === id
        ? { ...c, status: 'rejected', reviewedBy: reviewer, reviewedAt: new Date().toISOString(), reviewReason: reason }
        : c
    ));
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
