import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Eye, AlertCircle, Trash2, Github, Loader2, CheckCircle, XCircle, ExternalLink, Image, Upload, X } from 'lucide-react';
import { useDarkMode } from '../../hooks/useDarkMode';
import { MarkdownEditor } from '../components/MarkdownEditor';
import { EditorSkeleton } from '../components/EditorSkeleton';
import { PreviewModal } from '../components/PreviewModal';
import { usePosts } from '../../contexts/PostsContext';
import { tags } from '../../data/tags';
import { categories } from '../../data/categories';
import type { Post } from '../../types';
import { loadGitHubConfig, publishToGitHub, uploadImageToGitHub } from '../../services/githubService';

export const PostEditor: React.FC = () => {
  const { isDark } = useDarkMode();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = id !== undefined && id !== 'new';
  const { posts, addPost, updatePost } = usePosts();


  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('tech');
  const [postStatus, setPostStatus] = useState<'published' | 'draft'>('published');
  const [publishDate, setPublishDate] = useState(new Date().toISOString().split('T')[0]);
  const [relatedPostIds, setRelatedPostIds] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [showPreview, setShowPreview] = useState(false);

  // GitHub 发布状态
  const [ghPublishing, setGhPublishing] = useState(false);
  const [ghResult, setGhResult] = useState<{ success: boolean; message: string; commitUrl?: string } | null>(null);
  const ghConfigured = !!loadGitHubConfig()?.token;

  useEffect(() => {
    // 检查是否有保存的草稿
    const draft = localStorage.getItem('markdown-draft');
    setHasDraft(!!draft);

    if (isEditing) {
      // 模拟加载延迟
      const timer = setTimeout(() => {
        const post = posts.find(p => p.id === id);
        if (post) {
          setTitle(post.title);
          setSummary(post.summary);
          setContent(post.content);
          setSelectedTags(post.tags);
          setSelectedCategory(post.category || 'tech');
          setPostStatus(post.status || 'published');
          setPublishDate(post.date);
          setRelatedPostIds(post.relatedPostIds || []);
          setCoverImage(post.coverImage || '');
        }
        setIsLoading(false);
      }, 300); // 300ms 加载动画

      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [id, isEditing]);

  const handleRestoreDraft = () => {
    const draft = localStorage.getItem('markdown-draft');
    if (draft) {
      setContent(draft);
      setHasDraft(false);
    }
  };

  const handleClearDraft = () => {
    localStorage.removeItem('markdown-draft');
    setHasDraft(false);
  };

  const handleSave = () => {
    if (!title.trim() || !summary.trim() || !content.trim()) {
      alert('请填写完整信息');
      return;
    }

    const newPost: Post = {
      id: isEditing ? id! : `post-${Date.now()}`,
      title: title.trim(),
      summary: summary.trim(),
      content: content.trim(),
      date: publishDate,
      tags: selectedTags,
      category: selectedCategory,
      status: postStatus,
      readTime: Math.ceil(content.split(/\s+/).length / 200),
      relatedPostIds: relatedPostIds.length > 0 ? relatedPostIds : undefined,
      coverImage: coverImage.trim() || undefined,
    };

    if (isEditing) {
      if (!id) {
        alert('错误：文章 ID 缺失，无法保存');
        return;
      }
      updatePost(id, newPost);
    } else {
      addPost(newPost);
    }

    localStorage.removeItem('markdown-draft');
    setHasDraft(false);

    alert(isEditing ? '文章更新成功' : '文章创建成功');
    navigate('/admin/posts');
  };

  /** 保存到 localStorage 并推送到 GitHub */
  const handlePublishToGitHub = async () => {
    if (!title.trim() || !summary.trim() || !content.trim()) {
      alert('请先填写完整的标题、摘要和内容');
      return;
    }

    const config = loadGitHubConfig();
    if (!config?.token) {
      alert('请先在「设置」页面配置 GitHub Token');
      return;
    }

    const thisPost: Post = {
      id: isEditing ? id! : `post-${Date.now()}`,
      title: title.trim(),
      summary: summary.trim(),
      content: content.trim(),
      date: publishDate,
      tags: selectedTags,
      category: selectedCategory,
      status: postStatus,
      readTime: Math.ceil(content.split(/\s+/).length / 200),
      relatedPostIds: relatedPostIds.length > 0 ? relatedPostIds : undefined,
      coverImage: coverImage.trim() || undefined,
    };

    // 先更新本地
    if (isEditing && id) {
      updatePost(id, thisPost);
    } else {
      addPost(thisPost);
    }

    // 获取最新的完整文章列表（含刚刚添加/更新的文章）
    const allPosts = isEditing
      ? posts.map(p => (p.id === id ? thisPost : p))
      : [...posts, thisPost];

    setGhPublishing(true);
    setGhResult(null);

    const result = await publishToGitHub(
      config,
      allPosts,
      `content: ${isEditing ? 'update' : 'add'} post "${thisPost.title}"`
    );

    setGhResult(result);
    setGhPublishing(false);

    if (result.success) {
      localStorage.removeItem('markdown-draft');
      setHasDraft(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    const config = loadGitHubConfig();
    if (!config?.token) {
      setImageError('请先配置 GitHub Token 才能上传图片');
      return;
    }
    setImageUploading(true);
    setImageError('');
    const result = await uploadImageToGitHub(config, file);
    setImageUploading(false);
    if (result.success && result.url) {
      setCoverImage(result.url);
    } else {
      setImageError(result.message);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/posts')}
            className={`p-2 rounded-lg transition-colors ${
              isDark 
                ? 'text-gray-400 hover:bg-gray-800 hover:text-white' 
                : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className={`text-3xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {isLoading ? '加载中...' : (isEditing ? '编辑文章' : '新建文章')}
            </h1>
            <p className={`text-lg ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {isLoading ? '正在加载文章内容' : (isEditing ? '修改已有文章内容' : '创建新的博客文章')}
            </p>
          </div>
        </div>
        {!isLoading && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreview(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 border ${
                isDark 
                  ? 'border-gray-700 text-gray-300 hover:bg-gray-800' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Eye className="w-5 h-5" />
              预览
            </button>
            <button
              onClick={handleSave}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 border ${
                isDark
                  ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Save className="w-5 h-5" />
              仅本地保存
            </button>
            {ghConfigured ? (
              <button
                onClick={handlePublishToGitHub}
                disabled={ghPublishing}
                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-60"
              >
                {ghPublishing
                  ? <><Loader2 className="w-5 h-5 animate-spin" />推送中...</>
                  : <><Github className="w-5 h-5" />发布到 GitHub</>
                }
              </button>
            ) : (
              <button
                onClick={() => navigate('/admin/settings')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 border border-dashed ${
                  isDark
                    ? 'border-gray-600 text-gray-500 hover:bg-gray-800'
                    : 'border-gray-400 text-gray-400 hover:bg-gray-50'
                }`}
                title="前往设置配置 GitHub Token"
              >
                <Github className="w-5 h-5" />
                配置 GitHub 发布
              </button>
            )}
          </div>
        )}
      </div>

      {/* Show skeleton or form */}
      {isLoading ? (
        <EditorSkeleton isDark={isDark} />
      ) : (
        <>
          {/* Title */}
        <div className={`
          p-6 rounded-lg
          ${isDark ? 'bg-gray-900' : 'bg-white'}
          border border-gray-200 dark:border-gray-800
        `}>
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            文章标题
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="输入文章标题..."
            className={`
              w-full px-4 py-3 rounded-lg border text-lg font-medium
              ${isDark 
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-lobster-500
            `}
          />
        </div>

        {/* Summary */}
        <div className={`
          p-6 rounded-lg
          ${isDark ? 'bg-gray-900' : 'bg-white'}
          border border-gray-200 dark:border-gray-800
        `}>
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            文章摘要
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="输入文章简短摘要，用于列表展示..."
            rows={3}
            className={`
              w-full px-4 py-3 rounded-lg border resize-none
              ${isDark 
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-lobster-500
            `}
          />
        </div>

        {/* Cover Image */}
        <div className={`
          p-6 rounded-lg
          ${isDark ? 'bg-gray-900' : 'bg-white'}
          border border-gray-200 dark:border-gray-800
        `}>
          <label className={`block text-sm font-medium mb-3 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            封面图片 <span className={`text-xs font-normal ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>（可选，无图则显示渐变色条）</span>
          </label>
          <div className="flex gap-3 items-start">
            <input
              type="text"
              value={coverImage}
              onChange={(e) => { setCoverImage(e.target.value); setImageError(''); }}
              placeholder="输入图片 URL，或点右侧按钮上传到 GitHub..."
              className={`
                flex-1 px-4 py-2.5 rounded-lg border text-sm
                ${isDark 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-lobster-500
              `}
            />
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
                e.target.value = '';
              }}
            />
            <button
              onClick={() => imageInputRef.current?.click()}
              disabled={imageUploading}
              title="上传图片到 GitHub"
              className={`px-3 py-2.5 rounded-lg border text-sm font-medium flex items-center gap-1.5 transition-colors shrink-0 ${
                isDark
                  ? 'border-gray-700 text-gray-300 hover:bg-gray-800 disabled:opacity-50'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50'
              }`}
            >
              {imageUploading
                ? <><Loader2 className="w-4 h-4 animate-spin" />上传中...</>
                : <><Upload className="w-4 h-4" />上传图片</>
              }
            </button>
            {coverImage && (
              <button
                onClick={() => { setCoverImage(''); setImageError(''); }}
                title="清除封面图"
                className="p-2.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {imageError && (
            <p className="text-xs text-red-500 mt-2">{imageError}</p>
          )}
          {coverImage && (
            <div className="mt-3 rounded-lg overflow-hidden h-32 border border-gray-200 dark:border-gray-700">
              <img
                src={coverImage}
                alt="封面预览"
                className="w-full h-full object-cover"
                onError={() => setImageError('图片加载失败，请检查 URL 是否正确')}
              />
            </div>
          )}
          {!coverImage && (
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
              <Image className="w-4 h-4" />
              未设置封面图，将显示渐变色装饰条
            </div>
          )}
        </div>

        {/* Status Toggle */}
        <div className={`
          p-6 rounded-lg
          ${isDark ? 'bg-gray-900' : 'bg-white'}
          border border-gray-200 dark:border-gray-800
        `}>
          <label className={`block text-sm font-medium mb-3 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            发布状态
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setPostStatus('published')}
              className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all border ${
                postStatus === 'published'
                  ? 'bg-green-500 text-white border-green-500 shadow-sm'
                  : isDark
                    ? 'border-gray-700 text-gray-400 hover:bg-gray-800'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              ✅ 已发布
            </button>
            <button
              onClick={() => setPostStatus('draft')}
              className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all border ${
                postStatus === 'draft'
                  ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                  : isDark
                    ? 'border-gray-700 text-gray-400 hover:bg-gray-800'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              📝 草稿
            </button>
          </div>
          <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {postStatus === 'draft' ? '草稿不会显示在前台，可随时发布' : '前台读者可以看到这篇文章'}
          </p>
        </div>

        {/* Category Selection */}
        <div className={`
          p-6 rounded-lg
          ${isDark ? 'bg-gray-900' : 'bg-white'}
          border border-gray-200 dark:border-gray-800
        `}>
          <label className={`block text-sm font-medium mb-3 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            文章分类
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`
              w-full px-4 py-2 rounded-lg border
              ${isDark 
                ? 'bg-gray-800 border-gray-700 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-lobster-500
            `}
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
          <p className={`text-xs mt-2 ${
            isDark ? 'text-gray-500' : 'text-gray-400'
          }`}>
            {categories.find(c => c.id === selectedCategory)?.description}
          </p>
        </div>

        {/* Publish Date */}
        <div className={`
          p-6 rounded-lg
          ${isDark ? 'bg-gray-900' : 'bg-white'}
          border border-gray-200 dark:border-gray-800
        `}>
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            发布日期
          </label>
          <input
            type="date"
            value={publishDate}
            onChange={(e) => setPublishDate(e.target.value)}
            className={`
              w-full px-4 py-3 rounded-lg border
              ${isDark 
                ? 'bg-gray-800 border-gray-700 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-lobster-500
            `}
          />
          <p className={`text-xs mt-2 ${
            isDark ? 'text-gray-500' : 'text-gray-400'
          }`}>
            当前选择：{new Date(publishDate + 'T00:00:00').toLocaleDateString('zh-CN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className={`
          p-6 rounded-lg
          ${isDark ? 'bg-gray-900' : 'bg-white'}
          border border-gray-200 dark:border-gray-800
        `}>
          <label className={`block text-sm font-medium mb-3 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            选择标签
          </label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.name)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedTags.includes(tag.name)
                    ? 'bg-lobster-500 text-white'
                    : isDark
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        {/* Related Posts */}
        <div className={`
          p-6 rounded-lg
          ${isDark ? 'bg-gray-900' : 'bg-white'}
          border border-gray-200 dark:border-gray-800
        `}>
          <label className={`block text-sm font-medium mb-1 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            关联阅读
          </label>
          <p className={`text-xs mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            选择要在文章底部展示的关联文章（最多 4 篇），未选择时自动根据标签推荐
          </p>
          <div className="space-y-2">
            {posts
              .filter(p => p.id !== id && p.status !== 'draft')
              .map(p => (
                <label
                  key={p.id}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    relatedPostIds.includes(p.id)
                      ? isDark
                        ? 'bg-lobster-900/40 border border-lobster-700'
                        : 'bg-lobster-50 border border-lobster-300'
                      : isDark
                        ? 'border border-gray-800 hover:bg-gray-800'
                        : 'border border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={relatedPostIds.includes(p.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        if (relatedPostIds.length < 4) {
                          setRelatedPostIds(prev => [...prev, p.id]);
                        }
                      } else {
                        setRelatedPostIds(prev => prev.filter(rid => rid !== p.id));
                      }
                    }}
                    className="w-4 h-4 rounded accent-lobster-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium truncate ${
                      isDark ? 'text-gray-200' : 'text-gray-800'
                    }`}>{p.title}</div>
                    <div className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {p.date} · {p.tags.slice(0, 3).join('、')}
                    </div>
                  </div>
                  {relatedPostIds.includes(p.id) && (
                    <span className="text-xs text-lobster-500 font-medium shrink-0">
                      第 {relatedPostIds.indexOf(p.id) + 1} 篇
                    </span>
                  )}
                </label>
              ))}
            {posts.filter(p => p.id !== id && p.status !== 'draft').length === 0 && (
              <p className={`text-sm py-4 text-center ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                暂无其他已发布文章
              </p>
            )}
          </div>
          {relatedPostIds.length >= 4 && (
            <p className={`text-xs mt-2 text-amber-500`}>已选满 4 篇，取消勾选才能添加新的</p>
          )}
        </div>

        {/* Content */}
        <div className={`
          p-6 rounded-lg
          ${isDark ? 'bg-gray-900' : 'bg-white'}
          border border-gray-200 dark:border-gray-800
        `}>
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            文章内容(Markdown)
          </label>

          {/* 草稿恢复提示 */}
          {hasDraft && (
            <div className={`mb-4 p-3 rounded-lg flex items-center gap-3 ${
              isDark 
                ? 'bg-yellow-900 border border-yellow-700' 
                : 'bg-yellow-50 border border-yellow-300'
            }`}>
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  isDark ? 'text-yellow-200' : 'text-yellow-800'
                }`}>
                  检测到未保存的草稿，是否恢复？
                </p>
              </div>
              <button
                onClick={handleRestoreDraft}
                className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition-colors whitespace-nowrap"
              >
                恢复
              </button>
              <button
                onClick={handleClearDraft}
                className={`px-3 py-1.5 text-sm rounded transition-colors whitespace-nowrap ${
                  isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          <MarkdownEditor
            value={content}
            onChange={(val) => setContent(val || '')}
            height={500}
          />

          {/* 字数统计 */}
          {content && (() => {
            const chars = content.replace(/\s/g, '').length;
            const words = content.trim().split(/\s+/).filter(Boolean).length;
            const readMin = Math.max(1, Math.ceil(chars / 300));
            return (
              <div className={`mt-2 flex items-center gap-4 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <span>字符数：<span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{chars.toLocaleString()}</span></span>
                <span>词数：<span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{words.toLocaleString()}</span></span>
                <span>预计阅读：<span className="text-lobster-500 font-medium">约 {readMin} 分钟</span></span>
              </div>
            );
          })()}
        </div>
        </>
      )}

      {/* 预览模态框 */}
      {ghResult && (
        <div className={`fixed bottom-6 right-6 z-50 max-w-sm w-full shadow-xl rounded-xl p-4 flex items-start gap-3 ${
          ghResult.success
            ? 'bg-green-50 dark:bg-green-900/80 border border-green-200 dark:border-green-700'
            : 'bg-red-50 dark:bg-red-900/80 border border-red-200 dark:border-red-700'
        }`}>
          {ghResult.success
            ? <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
            : <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          }
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${ghResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-700 dark:text-red-300'}`}>
              {ghResult.success ? '发布成功！' : '发布失败'}
            </p>
            <p className={`text-xs mt-0.5 ${ghResult.success ? 'text-green-700 dark:text-green-300' : 'text-red-600 dark:text-red-400'}`}>
              {ghResult.message}
            </p>
            {ghResult.commitUrl && (
              <a
                href={ghResult.commitUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-green-700 dark:text-green-300 underline mt-1 hover:text-green-900"
              >
                <ExternalLink className="w-3 h-3" />
                查看 commit
              </a>
            )}
          </div>
          <button
            onClick={() => setGhResult(null)}
            className="text-gray-400 hover:text-gray-600 shrink-0 text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}
      <PreviewModal
        post={{
          title,
          summary,
          content,
          tags: selectedTags,
          date: publishDate,
          readTime: Math.ceil(content.split(/\s+/).length / 200)
        }}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
};
