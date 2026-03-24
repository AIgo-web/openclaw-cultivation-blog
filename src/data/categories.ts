export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const categories: Category[] = [
  {
    id: 'tech',
    name: '技术',
    description: '技术文章、编程、开发',
    icon: '💻',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
  },
  {
    id: 'life',
    name: '生活',
    description: '生活随笔、思考、感悟',
    icon: '🌟',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200'
  },
  {
    id: 'travel',
    name: '旅游',
    description: '旅行记录、攻略、见闻',
    icon: '✈️',
    color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
  },
  {
    id: 'work',
    name: '工作',
    description: '工作相关、项目总结、经验',
    icon: '📊',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200'
  },
  {
    id: 'reading',
    name: '阅读',
    description: '书籍推荐、读书笔记、感想',
    icon: '📚',
    color: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200'
  },
  {
    id: 'other',
    name: '其他',
    description: '其他分类内容',
    icon: '🎯',
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
  }
];

/**
 * 根据分类 ID 获取分类信息
 */
export function getCategoryById(id: string): Category | undefined {
  return categories.find(c => c.id === id);
}

/**
 * 获取分类的显示名称
 */
export function getCategoryName(id: string): string {
  return getCategoryById(id)?.name ?? '未分类';
}

/**
 * 获取分类的图标
 */
export function getCategoryIcon(id: string): string {
  return getCategoryById(id)?.icon ?? '🎯';
}
