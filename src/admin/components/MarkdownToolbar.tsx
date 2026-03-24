import React from 'react';
import type { LucideProps } from 'lucide-react';
import { Bold, Italic, Code, Heading2, List, ListOrdered, Link, Image, Upload } from 'lucide-react';

type LucideIcon = React.ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>>;

interface MarkdownToolbarProps {
  onInsert: (before: string, after: string, placeholder?: string) => void;
  onImport?: () => void;
}

interface ToolButton {
  icon?: LucideIcon;
  tooltip: string;
  label?: string;
  action?: () => void;
}

/**
 * Markdown 编辑器工具栏
 * 提供快速插入 Markdown 语法的按钮
 */
export const MarkdownToolbar: React.FC<MarkdownToolbarProps> = ({ onInsert, onImport }) => {
  const tools: ToolButton[] = [
    ...(onImport ? [{
      icon: Upload,
      tooltip: '导入 Markdown 文件',
      action: onImport,
    }] : []),
    {
      icon: Heading2,
      tooltip: '标题 2',
      action: () => onInsert('## ', '', '标题'),
    },
    {
      icon: Bold,
      tooltip: '粗体',
      action: () => onInsert('**', '**', '粗体文字'),
    },
    {
      icon: Italic,
      tooltip: '斜体',
      action: () => onInsert('*', '*', '斜体文字'),
    },
    {
      icon: Code,
      tooltip: '代码',
      action: () => onInsert('`', '`', '代码'),
    },
    {
      icon: undefined,
      tooltip: '分隔线',
      label: '---',
      action: () => onInsert('\n---\n', '', ''),
    },
    {
      icon: List,
      tooltip: '无序列表',
      action: () => onInsert('- ', '', '列表项'),
    },
    {
      icon: ListOrdered,
      tooltip: '有序列表',
      action: () => onInsert('1. ', '', '列表项'),
    },
    {
      icon: Code,
      tooltip: '代码块',
      action: () => onInsert('```\n', '\n```', '输入代码'),
    },
    {
      icon: Link,
      tooltip: '链接',
      action: () => onInsert('[', '](https://example.com)', '链接文字'),
    },
    {
      icon: Image,
      tooltip: '图片',
      action: () => onInsert('![', '](https://example.com/image.jpg)', '图片描述'),
    },
  ];

  return (
    <div className="flex flex-wrap gap-1 p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 rounded-t-lg">
      {tools.map((tool, i) => {
        const Icon = tool.icon;
        return (
          <button
            key={i}
            onClick={() => tool.action?.()}
            title={tool.tooltip}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            {Icon ? (
              <Icon className="w-4 h-4" />
            ) : (
              <span className="text-xs font-bold">{tool.label}</span>
            )}
          </button>
        );
      })}
      {/* 分隔线 */}
      <div className="w-px bg-gray-300 dark:bg-gray-700 mx-1 my-2" />
    </div>
  );
};
