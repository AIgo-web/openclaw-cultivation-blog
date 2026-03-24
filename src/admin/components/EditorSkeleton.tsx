import React from 'react';

interface SkeletonProps {
  isDark: boolean;
}

export const EditorSkeleton: React.FC<SkeletonProps> = ({ isDark }) => {
  const baseClass = isDark ? 'bg-gray-800' : 'bg-gray-200';
  
  return (
    <div className="space-y-6">
      {/* Title skeleton */}
      <div className={`p-6 rounded-lg border ${
        isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      }`}>
        <div className={`h-2 w-20 ${baseClass} rounded mb-4 animate-pulse`} />
        <div className={`h-12 w-full ${baseClass} rounded animate-pulse`} />
      </div>

      {/* Summary skeleton */}
      <div className={`p-6 rounded-lg border ${
        isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      }`}>
        <div className={`h-2 w-20 ${baseClass} rounded mb-4 animate-pulse`} />
        <div className={`space-y-2`}>
          <div className={`h-8 w-full ${baseClass} rounded animate-pulse`} />
          <div className={`h-8 w-full ${baseClass} rounded animate-pulse`} />
          <div className={`h-8 w-2/3 ${baseClass} rounded animate-pulse`} />
        </div>
      </div>

      {/* Date skeleton */}
      <div className={`p-6 rounded-lg border ${
        isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      }`}>
        <div className={`h-2 w-20 ${baseClass} rounded mb-4 animate-pulse`} />
        <div className={`h-12 w-full ${baseClass} rounded animate-pulse`} />
      </div>

      {/* Tags skeleton */}
      <div className={`p-6 rounded-lg border ${
        isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      }`}>
        <div className={`h-2 w-20 ${baseClass} rounded mb-4 animate-pulse`} />
        <div className={`flex gap-2`}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-10 w-20 ${baseClass} rounded-full animate-pulse`} />
          ))}
        </div>
      </div>

      {/* Editor skeleton */}
      <div className={`p-6 rounded-lg border ${
        isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      }`}>
        <div className={`h-2 w-32 ${baseClass} rounded mb-4 animate-pulse`} />
        <div className={`h-80 w-full ${baseClass} rounded animate-pulse`} />
      </div>
    </div>
  );
};
