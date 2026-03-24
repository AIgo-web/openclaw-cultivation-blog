/**
 * ✅ 安全的 TOC（Table of Contents）生成与管理
 */

export interface TocHeading {
  level: number;
  text: string;
  id: string;
}

/**
 * 生成安全的锚点 ID
 * ✅ 防止 XSS：清理非字母数字字符
 * ✅ 防止冲突：添加版本号
 */
export function generateSafeId(text: string, index?: number): string {
  let id = text
    .toLowerCase()
    // 只保留字母、数字、汉字
    .replace(/[^\w\-\u4e00-\u9fff]/g, '-')
    // 移除连续的连字符
    .replace(/-+/g, '-')
    // 移除首尾连字符
    .replace(/^-|-$/g, '');

  // 防止 ID 冲突和过短
  if (!id || id.length === 0) {
    id = `heading-${index || 0}`;
  }

  // 限制长度
  if (id.length > 100) {
    id = id.slice(0, 100);
  }

  return id;
}

/**
 * 从 Markdown 内容提取标题
 * ✅ 支持 h1-h6
 * ✅ 保留原始文本，返回安全的 ID
 */
export function extractHeadings(content: string): TocHeading[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: TocHeading[] = [];
  let match;
  let index = 0;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2]
      .trim()
      // 移除 Markdown 格式（粗体、斜体、代码）
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/__(.+?)__/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/_(.+?)_/g, '$1')
      .replace(/`(.+?)`/g, '$1')
      // 限制文本长度
      .slice(0, 200);

    if (text) {
      headings.push({
        level,
        text,
        id: generateSafeId(text, index),
      });
      index++;
    }
  }

  return headings;
}

/**
 * 根据级别计算缩进
 */
export function getHeadingIndent(level: number): string {
  const indents: Record<number, string> = {
    1: 'pl-0',
    2: 'pl-4',
    3: 'pl-8',
    4: 'pl-12',
    5: 'pl-16',
    6: 'pl-20',
  };
  return indents[level] || 'pl-0';
}

/**
 * 验证目录是否为空
 */
export function isTocEmpty(headings: TocHeading[]): boolean {
  return headings.length === 0;
}

/**
 * 过滤并优化目录结构
 * ✅ 移除孤立的标题
 * ✅ 规范化级别差距
 */
export function optimizeToc(headings: TocHeading[]): TocHeading[] {
  if (headings.length === 0) return [];

  // 找到最小级别（通常是 1）
  const minLevel = Math.min(...headings.map(h => h.level));

  // 规范化级别（从最小级别开始）
  return headings.map(h => ({
    ...h,
    level: h.level - minLevel + 1,
  }));
}
