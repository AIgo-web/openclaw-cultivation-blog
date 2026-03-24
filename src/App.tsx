import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PostDetailPage from './pages/PostDetailPage';
import TagsPage from './pages/TagsPage';
import AboutPage from './pages/AboutPage';
import { AdminLayout } from './admin/layout/AdminLayout';
import { Dashboard } from './admin/pages/Dashboard';
import { PostList } from './admin/pages/PostList';
import { PostEditor } from './admin/pages/PostEditor';
import { TagManager } from './admin/pages/TagManager';
import { Settings } from './admin/pages/Settings';
import { CommentManager } from './admin/pages/CommentManager';
import { Analytics } from './admin/pages/Analytics';
import { LoginPage } from './admin/pages/LoginPage';
import { AuthProvider } from './admin/context/AuthContext';
import { ProtectedRoute } from './admin/components/ProtectedRoute';
import { ToastProvider } from './contexts/ToastContext';
import { ToastContainer } from './components/ToastContainer';
import { SearchProvider } from './contexts/SearchContext';
import { PostsProvider } from './contexts/PostsContext';
import { CommentsProvider } from './contexts/CommentsContext';
import { ViewsProvider } from './contexts/ViewsContext';
import { useSearchShortcut } from './hooks/useSearchShortcut';

// 搜索快捷键组件（在 SearchProvider 内部）
function SearchShortcutListener() {
  useSearchShortcut();
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PostsProvider>
          <CommentsProvider>
            <ViewsProvider>
              <ToastProvider>
                <SearchProvider>
                  <ToastContainer />
                  <SearchShortcutListener />
                  <Routes>
                    {/* 后台路由 - 优先匹配 */}
                    <Route path="/admin/login" element={<LoginPage />} />
                    <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                      <Route path="/admin" element={<Dashboard />} />
                      <Route path="/admin/posts" element={<PostList />} />
                      <Route path="/admin/posts/new" element={<PostEditor />} />
                      <Route path="/admin/posts/edit/:id" element={<PostEditor />} />
                      <Route path="/admin/tags" element={<TagManager />} />
                      <Route path="/admin/settings" element={<Settings />} />
                      <Route path="/admin/comments" element={<CommentManager />} />
                      <Route path="/admin/analytics" element={<Analytics />} />
                    </Route>

                    {/* 前台路由 */}
                    <Route
                      path="/*"
                      element={
                        <div className="min-h-screen flex flex-col bg-[--color-bg] transition-colors">
                          <Navbar />
                          <div className="flex-1">
                            <Routes>
                              <Route path="/" element={<HomePage />} />
                              <Route path="/post/:id" element={<PostDetailPage />} />
                              <Route path="/tags" element={<TagsPage />} />
                              <Route path="/about" element={<AboutPage />} />
                            </Routes>
                          </div>
                          <Footer />
                        </div>
                      }
                    />
                  </Routes>
                </SearchProvider>
              </ToastProvider>
            </ViewsProvider>
          </CommentsProvider>
        </PostsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
