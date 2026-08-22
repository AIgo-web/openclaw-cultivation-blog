/**
 * V3 性能优化：依赖分析插件
 * 
 * 使用方法：
 * 1. 开发时：npm run dev:analyze
 * 2. 构建时：npm run build:analyze
 * 
 * 会生成一个 .、本dist/stats.html 文件，用于可视化分析 Bundle 组成
 */

import { visualizer } from 'rollup-plugin-visualizer';
import type { Plugin } from 'vite';

export function createAnalyzerPlugin(): Plugin {
  return visualizer({
    filename: 'stats.html',
    open: true,
    gzipSize: true,
    brotliSize: true,
  }) as unknown as Plugin;
}
