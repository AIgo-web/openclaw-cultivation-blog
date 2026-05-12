/**
 * 中文友好的阅读时间计算工具
 * 中文字符：300 字/分钟
 * 英文单词：200 词/分钟
 */

/** 统计中文字符数（含中文标点） */
function countChineseChars(text: string): number {
  return (text.match(/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/g) || []).length;
}

/** 统计英文单词数 */
function countEnglishWords(text: string): number {
  // 移除中文字符后按空白分割
  const stripped = text.replace(/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/g, ' ');
  return stripped.split(/\s+/).filter(Boolean).length;
}

/**
 * 计算内容预估阅读时间（分钟）
 * @param content HTML 或纯文本内容
 * @returns 至少 1 分钟
 */
export function calcReadTime(content: string): number {
  if (!content || content.trim().length === 0) return 1;

  // 去除 HTML 标签
  const plainText = content.replace(/<[^>]+>/g, '');

  const chineseChars = countChineseChars(plainText);
  const englishWords = countEnglishWords(plainText);

  const minutes = chineseChars / 300 + englishWords / 200;
  return Math.max(1, Math.ceil(minutes));
}
