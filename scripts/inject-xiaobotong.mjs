/**
 * 将小报童导入数据注入到博客的 posts.ts 和 series.ts 中
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_JSON = path.join(
  process.env.USERPROFILE || '/root', 'Desktop', '小报童专栏内容', '_lobster_import.json'
);
const POSTS_TS = path.resolve(__dirname, '../src/data/posts.ts');
const SERIES_TS = path.resolve(__dirname, '../src/data/series.ts');

const data = JSON.parse(fs.readFileSync(SOURCE_JSON, 'utf-8'));

// ─── 修改 posts.ts ─────────────────────────────────────────────
function patchPostsTs() {
  let src = fs.readFileSync(POSTS_TS, 'utf-8');

  // 将 JSON 中的每篇 post 转为 TS 对象字面量
  const postEntries = data.posts.map(p => {
    const fields = [
      `    "id": ${JSON.stringify(p.id)}`,
      `    "title": ${JSON.stringify(p.title)}`,
      `    "summary": ${JSON.stringify(p.summary)}`,
      `    "content": ${JSON.stringify(p.content)}`,
      `    "tags": ${JSON.stringify(p.tags)}`,
      `    "date": ${JSON.stringify(p.date)}`,
      `    "readTime": ${p.readTime}`,
      `    "category": ${JSON.stringify(p.category)}`,
    ];
    if (p.coverImage) fields.push(`    "coverImage": ${JSON.stringify(p.coverImage)}`);
    if (p.seriesId) fields.push(`    "seriesId": ${JSON.stringify(p.seriesId)}`);
    if (p.seriesOrder) fields.push(`    "seriesOrder": ${p.seriesOrder}`);
    fields.push(`    "status": "published" as const`);
    return '  {\n' + fields.join(',\n') + '\n  }';
  });

  const block = `  // ─── 小报童专栏：ClawCode 设计揭秘 (${new Date().toISOString().slice(0,10)}) ───\n` +
    postEntries.join(',\n');

  // 在 ]; 之前插入
  const closingBracket = '];';
  const lastClosingIdx = src.lastIndexOf(closingBracket);
  if (lastClosingIdx === -1) throw new Error('Cannot find ]; in posts.ts');

  src = src.slice(0, lastClosingIdx) + ',\n' + block + '\n' + src.slice(lastClosingIdx);
  fs.writeFileSync(POSTS_TS, src, 'utf-8');
  console.log(`✅ 已追加 ${data.posts.length} 篇文章到 posts.ts`);
}

// ─── 修改 series.ts ────────────────────────────────────────────
function patchSeriesTs() {
  let src = fs.readFileSync(SERIES_TS, 'utf-8');

  const s = data.series;
  const entry = `  // ─── 小报童专栏：ClawCode 设计揭秘 (${new Date().toISOString().slice(0,10)}) ───
  {
    id: ${JSON.stringify(s.id)},
    title: ${JSON.stringify(s.title)},
    description: ${JSON.stringify(s.description)},
    coverColor: ${JSON.stringify(s.coverColor)},
    icon: ${JSON.stringify(s.icon)},
    createdAt: ${JSON.stringify(s.createdAt)},
    updatedAt: ${JSON.stringify(s.updatedAt)},
    postIds: ${JSON.stringify(s.postIds)},
    status: 'published' as const,
    reports: [],
    materials: [],
    platforms: [],
    tools: [],
    sections: [],
  }`;

  // 在最后一个 }]; 之前插入
  const closingIdx = src.lastIndexOf('];');
  if (closingIdx === -1) throw new Error('Cannot find ]; in series.ts');

  src = src.slice(0, closingIdx) + ',\n' + entry + '\n' + src.slice(closingIdx);
  fs.writeFileSync(SERIES_TS, src, 'utf-8');
  console.log(`✅ 已追加专题「${s.title}」到 series.ts`);
}

patchPostsTs();
patchSeriesTs();
console.log('\n🎉 数据注入完成！');
