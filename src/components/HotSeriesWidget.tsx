import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSeries } from '../contexts/SeriesContext';
import { usePosts } from '../contexts/PostsContext';

/**
 * 热门专题侧边栏组件
 * - 自动向上滚动展示专题卡片
 * - 鼠标悬停暂停滚动
 * - 支持点击跳转专题详情页
 */
const HotSeriesWidget: React.FC = () => {
  const { seriesList } = useSeries();
  const { posts } = usePosts();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const animFrameRef = useRef<number>(0);
  const posRef = useRef(0);

  // 只展示已发布且有文章的专题
  const published = seriesList.filter(
    s => s.status === 'published' && s.postIds.length > 0
  );

  // 每个专题的文章数（已发布）
  const getPostCount = (seriesId: string) =>
    seriesList
      .find(s => s.id === seriesId)
      ?.postIds.filter(pid => {
        const p = posts.find(pp => pp.id === pid);
        return p && p.status !== 'draft';
      }).length ?? 0;

  // 拼接两遍以实现无缝循环（2个及以上专题时才复制）
  const items = published.length >= 2 ? [...published, ...published] : published;

  useEffect(() => {
    if (published.length <= 1) return; // 1 个及以下无需滚动

    const SPEED = 0.4; // px/frame，越小越慢
    const container = scrollRef.current;
    if (!container) return;

    const tick = () => {
      if (!isPaused && container) {
        posRef.current += SPEED;
        // 当滚动超过一半（原始列表高度），重置到 0
        const half = container.scrollHeight / 2;
        if (posRef.current >= half) {
          posRef.current = 0;
        }
        container.scrollTop = posRef.current;
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPaused, published.length]);

  if (published.length === 0) return null;

  return (
    <div className="w-full">
      {/* 标题 */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
          <span className="w-1 h-4 bg-amber-500 rounded-full inline-block" />
          热门专题
        </h3>
        <Link
          to="/series"
          className="text-xs text-lobster-500 hover:text-lobster-700 dark:text-lobster-400 dark:hover:text-lobster-300 transition-colors"
        >
          全部 →
        </Link>
      </div>

      {/* 滚动容器 */}
      <div
        className="relative overflow-hidden rounded-xl"
        style={{ height: published.length === 1 ? 'auto' : '420px' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* 顶部渐变遮罩 */}
        {published.length > 1 && (
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-6 z-10 bg-gradient-to-b from-gray-50 dark:from-gray-950 to-transparent" />
        )}

        <div
          ref={scrollRef}
          className="overflow-hidden h-full"
          style={{ scrollBehavior: 'auto' }}
        >
          <div className="flex flex-col gap-3 py-1 px-0.5">
            {items.map((series, idx) => {
              const count = getPostCount(series.id);
              const latestPostId = series.postIds[series.postIds.length - 1];
              const latestPost = posts.find(p => p.id === latestPostId && p.status !== 'draft');

              return (
                <Link
                  key={`${series.id}-${idx}`}
                  to={`/series/${series.id}`}
                  className="group block rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-md transition-all overflow-hidden"
                >
                  {/* 顶部彩条 */}
                  <div
                    className={`h-1 w-full bg-gradient-to-r ${
                      series.coverColor || 'from-amber-400 to-orange-400'
                    }`}
                  />

                  <div className="p-3.5">
                    {/* 图标 + 标题 + 文章数 */}
                    <div className="flex items-start gap-2.5 mb-2.5">
                      <span className="text-2xl flex-shrink-0 leading-none mt-0.5">
                        {series.icon || '📚'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-800 dark:text-gray-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug line-clamp-2 mb-1">
                          {series.title}
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                          {count} 篇文章
                        </span>
                      </div>
                    </div>

                    {/* 简介：左竖线 + 文字 */}
                    {series.description && (
                      <div className="flex gap-2 mb-2.5">
                        <div className="w-0.5 flex-shrink-0 rounded-full bg-amber-300 dark:bg-amber-700 self-stretch min-h-[1em]" />
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed">
                          {series.description}
                        </p>
                      </div>
                    )}

                    {/* 最新文章预览 */}
                    {latestPost && (
                      <div className="border-t border-gray-100 dark:border-gray-800 pt-2">
                        <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 mb-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          最新
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300 line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {latestPost.title}
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 底部渐变遮罩 */}
        {published.length > 1 && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 z-10 bg-gradient-to-t from-gray-50 dark:from-gray-950 to-transparent" />
        )}
      </div>
    </div>
  );
};

export default HotSeriesWidget;
