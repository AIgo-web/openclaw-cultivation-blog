import type { Tag } from '../types';

// 默认标签列表
const defaultTags: Tag[] = [
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

// 预定义颜色列表（用于新标签）
const tagColors = [
  'bg-lobster-100 text-lobster-700 dark:bg-lobster-900/30 dark:text-lobster-300',
  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
];

// 从 localStorage 加载标签，如果没有则使用默认标签
const loadTags = (): Tag[] => {
  const saved = localStorage.getItem('blog-tags');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load tags from localStorage:', e);
      return defaultTags;
    }
  }
  return defaultTags;
};

// 保存标签到 localStorage
const saveTags = (tags: Tag[]): void => {
  localStorage.setItem('blog-tags', JSON.stringify(tags));
};

// 导出标签列表（动态获取）
export const tags: Tag[] = loadTags();

// 获取标签颜色
export const getTagColor = (tagName: string): string => {
  const tag = tags.find(t => t.name === tagName);
  return tag?.color || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
};

// 添加新标签
export const addTag = (name: string): Tag | null => {
  // 检查是否已存在
  const existing = tags.find(t => t.name === name);
  if (existing) {
    return existing;
  }

  // 生成 ID（基于名称转拼音或使用时间戳）
  const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u4e00-\u9fa5-]/g, '') || `tag-${Date.now()}`;

  // 随机分配一个颜色
  const color = tagColors[Math.floor(Math.random() * tagColors.length)];

  const newTag: Tag = {
    id,
    name,
    count: 0,
    color,
  };

  // 添加到标签列表并保存
  tags.push(newTag);
  saveTags(tags);

  return newTag;
};

// 删除标签
export const deleteTag = (tagId: string): void => {
  const index = tags.findIndex(t => t.id === tagId);
  if (index !== -1) {
    tags.splice(index, 1);
    saveTags(tags);
  }
};
