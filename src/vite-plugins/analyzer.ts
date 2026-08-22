/**
 * V3 性能优化：依赖分析插件
 * 
 * 使用方法：
 * 1. 开发时：npm run dev:analyze
 * 2. 构建时：npm run build:analyze
 * 
 * 会生成一个 .、本dist/stats.html 文件，用于可视化分析 Bundle 组成
 */

// // import { visualizer } from 'rollup-plugin-visualizer'; // disabled // disabled
import type { Plugin } from 'vite';

export function createAnalyzerPlugin(): Plugin {
  // 插件已禁用，返回空插件
  return {
    name: 'analyzer-plugin-disabled'
  } as unknown as Plugin;
}
