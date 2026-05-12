/**
 * Markdown → Lobster Blog 导入脚本
 *
 * 将桌面"小报童专栏内容"中的 Markdown 文件转换为龙虾博客的 Post[] + Series JSON。
 * 用法：node scripts/import-xiaobotong.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── 路径配置 ───────────────────────────────────────────────────
const SOURCE_DIR = path.join(process.env.USERPROFILE || '/root', 'Desktop', '小报童专栏内容');
const BLOG_DATA_DIR = path.resolve(__dirname, '../src/data');
const POSTS_FILE = path.join(BLOG_DATA_DIR, 'posts.ts');
const SERIES_FILE = path.join(BLOG_DATA_DIR, 'series.ts');

// ─── 配置 ───────────────────────────────────────────────────────
const SERIES_ID = 'clawcode-design-insider';
const SERIES_TITLE = 'ClawCode 设计揭秘';
const SERIES_DESC = '从小报童专栏精选的 12 篇深度文章，全方位解析 ClawCode 的核心设计——跨会话记忆、多 Agent 协作、Rust 工程实践，直至开源商业化。';
const SERIES_ICON = '🦞';
const SERIES_COVER = 'from-orange-500 to-red-500';
const CATEGORY = 'tech';
const TAGS_MAP = {
  1: ['AI编程助手', 'ClawCode', '产品进化'],
  2: ['记忆系统', 'ClawCode', '跨会话'],
  3: ['记忆系统', 'ClawCode', '存储检索'],
  4: ['记忆系统', 'ClawCode', '调优实验'],
  5: ['多Agent', 'ClawCode', '系统设计'],
  6: ['SICA', 'ClawCode', '元循环'],
  7: ['Rust', 'ClawCode', '高性能'],
  8: ['SOP', 'ClawCode', '最佳实践'],
  9: ['知识图谱', 'ClawCode', '代码理解'],
  10: ['推理优化', 'ClawCode', '成本控制'],
  11: ['开源', 'ClawCode', '商业化'],
  12: ['总结', 'ClawCode', '未来展望'],
};

// ─── 工具函数 ───────────────────────────────────────────────────

/** 从文件名中提取编号 */
function extractNumber(filename) {
  const match = filename.match(/第(\d+)篇/);
  return match ? parseInt(match[1], 10) : null;
}

/** 计算 readTime（中文 ~400 字/分钟） */
function calcReadTime(text) {
  // 去掉 markdown 标记后的纯文字
  const plain = text
    .replace(/```[\s\S]*?```/g, '')      // 代码块（不计入阅读时间）
    .replace(/`[^`]+`/g, '')             // 行内代码
    .replace(/[#*>|~\-]/g, '')           // markdown 符号
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 链接保留文字
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')  // 图片去掉
    .trim();
  const charCount = plain.replace(/\s/g, '').length;
  return Math.max(1, Math.ceil(charCount / 400));
}

/** 生成唯一 ID（基于系列编号，避免与现有文章冲突） */
function generateId(num) {
  return `xbt-${String(num).padStart(2, '0')}`;
}

/** 解析单篇 Markdown 文件 */
function parseMarkdown(filePath, fileNum) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const lines = raw.split('\n');

  // 第 1 行：标题（去掉 # 和可能的 "第 N 篇：" 前缀）
  const titleLine = lines[0] || '';
  let title = titleLine.replace(/^#\s*/, '').trim();
  // 统一去掉 "第 N 篇：" / "第 N 篇：" 前缀
  title = title.replace(/^第\s*\d+\s*篇[：:]\s*/, '').trim();

  // 第 3 行左右：引用摘要
  let summary = '';
  for (const line of lines) {
    if (line.startsWith('> ')) {
      summary = line.replace(/^>\s*/, '').trim();
      break;
    }
  }
  // 第 1 篇的摘要是 "免费试读"，不是真正的摘要，需要从正文中提取
  if (summary === '免费试读' || summary === '🔓 免费试读' || summary === '🔓免费试读') {
    // 从正文第一段非空文字提取摘要
    for (let i = 1; i < lines.length; i++) {
      const text = lines[i].replace(/^[#>*\-\s]+/, '').trim();
      if (text.length > 10 && !text.startsWith('---')) {
        summary = text.length > 100 ? text.slice(0, 97) + '...' : text;
        break;
      }
    }
    if (!summary) summary = title;
  }

  // 找到第一个 --- 之后的所有内容作为正文
  let contentStartIdx = lines.findIndex((l, i) => i > 0 && l.trim() === '---');
  if (contentStartIdx === -1) contentStartIdx = 2;
  // 跳过连续的 --- 行
  while (contentStartIdx < lines.length && lines[contentStartIdx].trim() === '---') {
    contentStartIdx++;
  }
  const content = lines.slice(contentStartIdx).join('\n').trim();

  const readTime = calcReadTime(content);
  const tags = TAGS_MAP[fileNum] || ['ClawCode'];

  // 封面图文件名（PNG 版本）
  const coverFileName = `cover-${String(fileNum).padStart(2, '0')}-第${fileNum}篇.png`;

  return {
    id: generateId(fileNum),
    title,
    summary,
    content,
    tags,
    date: '2026-05-12',
    readTime,
    category: CATEGORY,
    coverImage: `/images/covers/${coverFileName}`,
    status: 'published',
    seriesId: SERIES_ID,
    seriesOrder: fileNum,
  };
}

// ─── 主流程 ─────────────────────────────────────────────────────

function main() {
  console.log('📖 小报童专栏内容 → 龙虾博客导入工具\n');

  // 1. 找到所有 Markdown 文件并按编号排序
  const mdFiles = fs.readdirSync(SOURCE_DIR)
    .filter(f => f.endsWith('.md'))
    .sort((a, b) => {
      const na = extractNumber(a) ?? 999;
      const nb = extractNumber(b) ?? 999;
      return na - nb;
    });

  console.log(`找到 ${mdFiles.length} 篇 Markdown 文件\n`);

  // 2. 逐篇解析
  const posts = [];
  const postIds = [];

  for (const file of mdFiles) {
    const num = extractNumber(file);
    if (!num) {
      console.warn(`⚠️  跳过无法解析编号的文件: ${file}`);
      continue;
    }
    const post = parseMarkdown(path.join(SOURCE_DIR, file), num);
    posts.push(post);
    postIds.push(post.id);
    console.log(`  ✅ #${num} ${post.title} (${post.readTime}min, ${post.tags.length} tags)`);
  }

  console.log(`\n共解析 ${posts.length} 篇文章`);

  // 3. 构建 Series
  const series = {
    id: SERIES_ID,
    title: SERIES_TITLE,
    description: SERIES_DESC,
    coverColor: SERIES_COVER,
    icon: SERIES_ICON,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    postIds,
    status: 'published',
    reports: [],
    materials: [],
    platforms: [],
    tools: [],
    sections: [],
  };

  // 4. 生成 posts 导入 JSON
  const importData = {
    type: 'xiaobotong-import',
    series,
    posts,
    generatedAt: new Date().toISOString(),
    instructions: [
      '1. 将封面 PNG 图片复制到 public/images/covers/ 目录',
      '2. 在博客管理后台使用"数据导入"功能导入此 JSON',
      '3. 或手动将 posts 合并到 src/data/posts.ts，series 合并到 src/data/series.ts',
    ],
  };

  const outputPath = path.join(SOURCE_DIR, '_lobster_import.json');
  fs.writeFileSync(outputPath, JSON.stringify(importData, null, 2), 'utf-8');
  console.log(`\n📦 导入文件已生成: ${outputPath}`);
  console.log(`   文件大小: ${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB`);

  // 5. 生成直接可用的 posts.ts 追加内容
  const postsTsSnippet = generatePostsTsAppend(posts);
  const seriesTsSnippet = generateSeriesTsAppend(series);
  const snippetPath = path.join(SOURCE_DIR, '_lobster_snippets.txt');
  fs.writeFileSync(snippetPath, postsTsSnippet + '\n\n' + seriesTsSnippet, 'utf-8');
  console.log(`📄 TS 代码片段已生成: ${snippetPath}`);

  // 6. 复制封面图片
  const coversPngDir = path.join(SOURCE_DIR, 'covers', 'png');
  const targetCoversDir = path.resolve(__dirname, '../public/images/covers');
  if (fs.existsSync(coversPngDir)) {
    if (!fs.existsSync(targetCoversDir)) {
      fs.mkdirSync(targetCoversDir, { recursive: true });
    }
    let copied = 0;
    for (const post of posts) {
      const num = post.seriesOrder;
      const srcPng = path.join(coversPngDir, `cover-${String(num).padStart(2, '0')}-第${num}篇.png`);
      if (fs.existsSync(srcPng)) {
        const dstPng = path.join(targetCoversDir, path.basename(srcPng));
        fs.copyFileSync(srcPng, dstPng);
        copied++;
      }
    }
    console.log(`🖼️  已复制 ${copied} 张封面图到 public/images/covers/`);
  } else {
    console.log('⚠️  未找到 covers/png/ 目录，跳过封面复制');
  }

  console.log('\n✅ 导入完成！请查看桌面"小报童专栏内容"目录中的：');
  console.log('   - _lobster_import.json (完整导入数据)');
  console.log('   - _lobster_snippets.txt (可直接粘贴到 posts.ts 的代码)');
}

function generatePostsTsAppend(posts) {
  const lines = [
    '// ─── 小报童专栏导入 (ClawCode 设计揭秘) ───',
    '// 导入时间: ' + new Date().toISOString(),
    '',
  ];

  for (const p of posts) {
    const postObj = {
      id: p.id,
      title: p.title,
      summary: p.summary,
      content: p.content,
      tags: p.tags,
      date: p.date,
      readTime: p.readTime,
      category: p.category,
      coverImage: p.coverImage,
      status: 'published',
      seriesId: p.seriesId,
      seriesOrder: p.seriesOrder,
    };

    lines.push('  {');
    for (const [key, val] of Object.entries(postObj)) {
      if (key === 'content') {
        // content 太长，用模板字符串
        lines.push(`    ${key}: ${JSON.stringify(val)},`);
      } else if (Array.isArray(val)) {
        lines.push(`    ${key}: ${JSON.stringify(val)},`);
      } else if (typeof val === 'string') {
        lines.push(`    ${key}: ${JSON.stringify(val)},`);
      } else if (typeof val === 'number') {
        lines.push(`    ${key}: ${val},`);
      }
    }
    lines.push('  },');
  }

  return lines.join('\n');
}

function generateSeriesTsAppend(series) {
  return `// ─── 小报童专栏专题 (ClawCode 设计揭秘) ───
// 追加到 defaultSeries 数组中
{
  id: ${JSON.stringify(series.id)},
  title: ${JSON.stringify(series.title)},
  description: ${JSON.stringify(series.description)},
  coverColor: ${JSON.stringify(series.coverColor)},
  icon: ${JSON.stringify(series.icon)},
  createdAt: ${JSON.stringify(series.createdAt)},
  updatedAt: ${JSON.stringify(series.updatedAt)},
  postIds: ${JSON.stringify(series.postIds)},
  status: 'published',
  reports: [],
  materials: [],
  platforms: [],
  tools: [],
  sections: [],
},`;
}

main();
