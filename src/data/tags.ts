import type { Tag } from '../types';

export const tags: Tag[] = [
  { id: 'openclaw', name: 'OpenClaw', count: 5, color: 'bg-lobster-100 text-lobster-700 dark:bg-lobster-900/30 dark:text-lobster-300' },
  { id: 'beginner', name: '新手入门', count: 1, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  { id: 'config', name: '环境配置', count: 1, color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  { id: 'skill', name: 'Skill开发', count: 1, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  { id: 'advanced', name: '进阶技巧', count: 2, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  { id: 'qqbot', name: 'QQ Bot', count: 1, color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300' },
  { id: 'channel', name: '渠道集成', count: 1, color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
  { id: 'automation', name: 'Automation', count: 1, color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' },
  { id: 'auto', name: '自动化', count: 1, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  { id: 'memory', name: '工作记忆', count: 1, color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' },
  { id: 'pitfall', name: '踩坑记录', count: 0, color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  { id: 'ai-agent', name: 'AI Agent', count: 0, color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
];

export const getTagColor = (tagName: string): string => {
  const tag = tags.find(t => t.name === tagName);
  return tag?.color || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
};
