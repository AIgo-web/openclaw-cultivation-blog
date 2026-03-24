import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Eye } from 'lucide-react';
import type { Post } from '../types';
import { getTagColor } from '../data/tags';
import { getCategoryIcon, getCategoryName } from '../data/categories';
import { useViews } from '../contexts/ViewsContext';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const { getViews } = useViews();
  const views = getViews(post.id);

  return (
    <article className="card hover:shadow-lg hover:-translate-y-1 group overflow-hidden">
      {/* Cover: image or gradient */}
      {post.coverImage ? (
        <div className="h-44 overflow-hidden">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      ) : (
        <div className={`h-2 bg-gradient-to-r ${post.coverColor || 'from-lobster-400 to-orange-400'}`} />
      )}

      <div className="p-6">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3 items-center">
          {post.category && (
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
              {getCategoryIcon(post.category)} {getCategoryName(post.category)}
            </span>
          )}
          {post.tags.map(tag => (
            <Link
              key={tag}
              to={`/tags?tag=${encodeURIComponent(tag)}`}
              className={`tag-badge ${getTagColor(tag)} hover:opacity-80`}
              onClick={e => e.stopPropagation()}
            >
              {tag}
            </Link>
          ))}
        </div>

        {/* Title */}
        <Link to={`/post/${post.id}`}>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-lobster-500 dark:group-hover:text-lobster-400 transition-colors mb-3 leading-tight">
            {post.title}
          </h2>
        </Link>

        {/* Excerpt */}
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
          {post.summary}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
            </svg>
            {format(new Date(post.date), 'yyyy年M月d日', { locale: zhCN })}
          </span>
          <div className="flex items-center gap-3">
            {views > 0 && (
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {views.toLocaleString()}
              </span>
            )}
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              约 {post.readTime} 分钟
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
