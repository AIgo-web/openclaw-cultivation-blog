import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React, { lazy, Suspense } from 'react';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PostDetailPage from './pages/PostDetailPage';
import TagsPage from './pages/TagsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import SeriesPage from './pages/SeriesPage';
import SeriesDetailPage from './pages/SeriesDetailPage';
import { AdminLayout } from './admin/layout/AdminLayout';
import { LoginPage } from './admin/pages/LoginPage';
import { AuthProvider } from './admin/context/AuthContext';
import { ProtectedRoute } from './admin/components/ProtectedRoute';
import { ToastProvider } from './contexts/ToastContext';
import { ToastContainer } from './components/ToastContainer';
import { SearchProvider } from './contexts/SearchContext';
import { PostsProvider } from './contexts/PostsContext';
import { CommentsProvider } from './contexts/CommentsContext';
import { ViewsProvider } from './contexts/ViewsContext';
import { SeriesProvider } from './contexts/SeriesContext';
import { useSearchShortcut } from './hooks/useSearchShortcut';
import { injectStructuredData, generateSiteNavigationSchema } from './services/seoService';
import { Dashboard } from './admin/pages/Dashboard';

// ✅ 代码分割：懒加载管理后台页面（使用命名导出）
const PostList = lazy(() => import('./admin/pages/PostList').then(m => ({ default: m.PostList })));
const PostEditor = lazy(() => import('./admin/pages/PostEditor').then(m => ({ default: m.PostEditor })));
const PostPreview = lazy(() => import('./admin/pages/PostPreviewPage').then(m => ({ default: m.default })));
const TagManager = lazy(() => import('./admin/pages/TagManager').then(m => ({ default: m.TagManager })));
const Settings = lazy(() => import('./admin/pages/Settings').then(m => ({ default: m.default })));
const CommentManager = lazy(() => import('./admin/pages/CommentManager').then(m => ({ default: m.CommentManager })));
const Analytics = lazy(() => import('./admin/pages/Analytics').then(m => ({ default: m.Analytics })));
const SeriesManager = lazy(() => import('./admin/pages/SeriesManager').then(m => ({ default: m.SeriesManager })));

// ✅ 加载骨架屏组件
const PageSkeleton = () => (
  <div className="animate-pulse space-y-6 p-6">
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  </div>
);

// 搜索快捷键组件
function SearchShortcutListener() {
  useSearchShortcut();
  return null;
}

// SEO 初始化组件
function SEOInitializer() {
  useEffect(() => {
    // 注入网站导航结构化数据
    const schema = generateSiteNavigationSchema();
    const cleanup = injectStructuredData(schema, 'site-navigation');
    
    return cleanup;
  }, []);
  
  return null;
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <PostsProvider>
          <CommentsProvider>
            <ViewsProvider>
              <SeriesProvider>
              <ToastProvider>
                <SearchProvider>
                  <SEOInitializer />
                  <ToastContainer />
                  <SearchShortcutListener />
                  <Routes>
                    {/* 后台路由 - 优先匹配 */}
                    <Route path="/admin/login" element={<LoginPage />} />
                    <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                      <Route path="/admin" element={<Dashboard />} />
                      <Route path="/admin/posts" element={
                        <Suspense fallback={<PageSkeleton />}><PostList /></Suspense>
                      } />
                      <Route path="/admin/posts/new" element={
                        <Suspense fallback={<PageSkeleton />}><PostEditor /></Suspense>
                      } />
                      <Route path="/admin/posts/edit/:id" element={
                        <Suspense fallback={<PageSkeleton />}><PostEditor /></Suspense>
                      } />
                      <Route path="/admin/preview" element={
                        <Suspense fallback={<PageSkeleton />}><PostPreview /></Suspense>
                      } />
                      <Route path="/admin/tags" element={
                        <Suspense fallback={<PageSkeleton />}><TagManager /></Suspense>
                      } />
                      <Route path="/admin/settings" element={
                        <Suspense fallback={<PageSkeleton />}><Settings /></Suspense>
                      } />
                      <Route path="/admin/comments" element={
                        <Suspense fallback={<PageSkeleton />}><CommentManager /></Suspense>
                      } />
                      <Route path="/admin/analytics" element={
                        <Suspense fallback={<PageSkeleton />}><Analytics /></Suspense>
                      } />
                      <Route path="/admin/series" element={
                        <Suspense fallback={<PageSkeleton />}><SeriesManager /></Suspense>
                      } />
                    </Route>

                    {/* 前台路由 */}
                    <Route
                      path="/*"
                      element={
                        <div className="min-h-screen flex flex-col bg-[--color-bg] transition-colors">
                          <Navbar />
                          <div className="flex-1" id="main-content">
                            <Routes>
                              <Route path="/" element={<HomePage />} />
                              <Route path="/post/:id" element={<PostDetailPage />} />
                              <Route path="/tags" element={<TagsPage />} />
                              <Route path="/series" element={<SeriesPage />} />
                              <Route path="/series/:id" element={<SeriesDetailPage />} />
                              <Route path="/about" element={<AboutPage />} />
                              <Route path="/contact" element={<ContactPage />} />
                              <Route path="/privacy" element={<PrivacyPage />} />
                            </Routes>
                          </div>
                          <Footer />
                        </div>
                      }
                    />
                  </Routes>
                </SearchProvider>
              </ToastProvider>
              </SeriesProvider>
            </ViewsProvider>
          </CommentsProvider>
        </PostsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
