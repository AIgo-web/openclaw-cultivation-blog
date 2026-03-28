import React from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Tags,
  Settings,
  LogOut,
  Menu,
  X,
  MessageSquare,
  BarChart2,
  Library
} from 'lucide-react';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useAuth } from '../context/AuthContext';
import { useComments } from '../../contexts/CommentsContext';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

const menuItems = [
  { icon: LayoutDashboard, label: '仪表盘', path: '/admin' },
  { icon: FileText, label: '文章管理', path: '/admin/posts' },
  { icon: Library, label: '专题管理', path: '/admin/series' },
  { icon: MessageSquare, label: '评论管理', path: '/admin/comments' },
  { icon: BarChart2, label: '访问统计', path: '/admin/analytics' },
  { icon: Tags, label: '标签管理', path: '/admin/tags' },
  { icon: Settings, label: '设置', path: '/admin/settings' },
];

export const AdminLayout: React.FC<AdminLayoutProps> = () => {
  const { isDark } = useDarkMode();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { pendingCount } = useComments();

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      logout();
      navigate('/admin/login');
    }
  };

  return (
    <div className={`flex h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40 lg:z-auto
        ${sidebarOpen ? 'block' : 'hidden'} lg:block
        w-64 h-screen
        ${isDark ? 'bg-gray-900 border-r border-gray-800' : 'bg-white border-r border-gray-200'}
        overflow-y-auto
        flex flex-col
      `}>
        {/* Close Button (Mobile) */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 hover:bg-gray-800"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            🦞 <span className="text-lobster-500">龙虾博客</span>网站管理后台
          </h2>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = window.location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive
                    ? 'bg-lobster-500 text-white'
                    : isDark
                      ? 'text-gray-300 hover:bg-gray-800'
                      : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.path === '/admin/comments' && pendingCount > 0 && (
                  <span className="ml-auto bg-lobster-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-6 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium
              transition-colors
              ${isDark
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-red-100 text-red-600 hover:bg-red-200'
              }
            `}
          >
            <LogOut className="w-5 h-5" />
            <span>退出登录</span>
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="flex flex-col flex-1">
        <header className={`
          lg:hidden p-4 border-b
          ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}
        `}>
          <button
            onClick={() => setSidebarOpen(true)}
            className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </header>

        {/* Main Content */}
        <main className={`
          flex-1 p-4 lg:p-8 overflow-y-auto
          ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}
        `}>
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
        />
      )}
    </div>
  );
};
