import fs from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.production' });
dotenv.config();

const notionToken = process.env.NOTION_API_KEY || process.env.VITE_NOTION_API_KEY;
const databaseId = process.env.VITE_NOTION_DATABASE_ID || '30cf8285a7fd80018526e6f2c0e3e6cd';
const siteUrl = (process.env.SITE_URL || 'https://www.pintecl.com').replace(/\/+$/, '');
const outputDir = path.join(process.cwd(), 'public', 'images', 'blog-covers');
const notionVersion = '2022-06-28';
const maxPages = Number(process.env.NOTION_BLOG_COVER_MAX_PAGES || 1000);
const dryRun = process.argv.includes('--dry-run');
const skipNotion = process.argv.includes('--skip-notion');

if (!notionToken && !skipNotion) {
  console.error('Missing NOTION_API_KEY or VITE_NOTION_API_KEY.');
  process.exit(1);
}

const palettes = [
  { key: 'cold', match: /cold|冷烫|uv|digital|数码|silk|screen|丝印/i, bg: '#07111f', accent: '#2dd4bf', foil: '#b7f7ff' },
  { key: 'hot', match: /hot|烫金|stamping|电化铝|foil/i, bg: '#19130a', accent: '#f59e0b', foil: '#fff0a3' },
  { key: 'abrasion', match: /rub|abrasion|resistant|耐磨|不掉金|耐刮/i, bg: '#111827', accent: '#60a5fa', foil: '#dbeafe' },
  { key: 'label', match: /label|标签|sticker|barcode|qr/i, bg: '#101322', accent: '#a78bfa', foil: '#ede9fe' },
  { key: 'cosmetic', match: /cosmetic|beauty|perfume|skincare|makeup|化妆品|香水|美妆|护肤|彩妆/i, bg: '#181018', accent: '#f472b6', foil: '#ffe4f1' },
  { key: 'packaging', match: /box|carton|gift|wine|packaging|盒|包装|礼盒|酒/i, bg: '#102018', accent: '#34d399', foil: '#dcfce7' },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function plainText(prop) {
  if (!prop) return '';
  const values = prop.title || prop.rich_text;
  return Array.isArray(values) ? values.map((item) => item.plain_text || '').join('') : '';
}

function selectName(prop) {
  return prop?.select?.name || prop?.status?.name || '';
}

function cleanText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function truncate(value, maxLength) {
  const text = cleanText(value);
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

function charWeight(char) {
  return /[\u3400-\u9fff\u3040-\u30ff\uff00-\uffef]/.test(char) ? 1.85 : 1;
}

function wrapText(value, maxWeight, maxLines) {
  const text = cleanText(value);
  const lines = [];
  let current = '';
  let weight = 0;

  for (const char of text) {
    const nextWeight = charWeight(char);
    if (weight + nextWeight > maxWeight && current) {
      lines.push(current.trim());
      current = char;
      weight = nextWeight;
      if (lines.length >= maxLines) break;
    } else {
      current += char;
      weight += nextWeight;
    }
  }

  if (current && lines.length < maxLines) lines.push(current.trim());
  if (lines.length === maxLines && text.length > lines.join('').length) {
    lines[lines.length - 1] = `${lines[lines.length - 1].replace(/…$/, '')}…`;
  }
  return lines;
}

function categoryFor(page) {
  const props = page.properties || {};
  return selectName(props['主题分类'] || props.Category || props.categories) || 'Technical Blog';
}

function titleFor(page) {
  const props = page.properties || {};
  return plainText(props['文章标题'] || props.Name || props.Title || props.title) || 'PINTE Foil Technical Blog';
}

function summaryFor(page) {
  const props = page.properties || {};
  return truncate(
    plainText(props.Summary || props.Description || props['SEO Description'] || props.excerpt || props.摘要 || props.描述) ||
      plainText(props['主关键词'] || props.Keywords || props.keywords) ||
      titleFor(page),
    230
  );
}

function paletteFor(page) {
  const haystack = `${titleFor(page)} ${summaryFor(page)} ${categoryFor(page)}`;
  return palettes.find((palette) => palette.match.test(haystack)) || palettes[1];
}

function slugFor(page) {
  return page.id.replace(/-/g, '');
}

function coverUrlFor(page) {
  return `${siteUrl}/images/blog-covers/${slugFor(page)}.svg`;
}

function renderCover(page) {
  const title = titleFor(page);
  const summary = summaryFor(page);
  const category = categoryFor(page);
  const palette = paletteFor(page);
  const titleLines = wrapText(title, 25, 3);
  const summaryLines = wrapText(summary, 44, 4);
  const keyword = truncate(
    cleanText(plainText((page.properties || {})['主关键词']) || category)
      .split(',')
      .slice(0, 2)
      .join(' / '),
    58
  );

  const titleSvg = titleLines
    .map((line, index) => `<text x="72" y="${184 + index * 52}" font-family="Arial, 'Noto Sans SC', 'Microsoft YaHei', sans-serif" font-size="43" font-weight="800" fill="#ffffff">${escapeXml(line)}</text>`)
    .join('');
  const summarySvg = summaryLines
    .map((line, index) => `<text x="74" y="${392 + index * 33}" font-family="Arial, 'Noto Sans SC', 'Microsoft YaHei', sans-serif" font-size="24" font-weight="500" fill="#e5e7eb">${escapeXml(line)}</text>`)
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(title)}</title>
  <desc id="desc">${escapeXml(summary)}</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${palette.bg}"/>
      <stop offset="0.58" stop-color="#111827"/>
      <stop offset="1" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="foil" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${palette.foil}" stop-opacity="0.1"/>
      <stop offset="0.3" stop-color="${palette.foil}" stop-opacity="0.92"/>
      <stop offset="0.52" stop-color="#ffffff" stop-opacity="0.98"/>
      <stop offset="0.72" stop-color="${palette.accent}" stop-opacity="0.82"/>
      <stop offset="1" stop-color="${palette.foil}" stop-opacity="0.16"/>
    </linearGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="24" flood-color="#000000" flood-opacity="0.28"/>
    </filter>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <path d="M-80 520 C160 430 280 548 480 466 C700 375 780 220 1040 265 C1180 290 1260 180 1320 122 L1320 690 L-80 690 Z" fill="url(#foil)" opacity="0.72"/>
  <path d="M760 70 C920 118 965 250 1136 218" fill="none" stroke="${palette.accent}" stroke-width="2" opacity="0.42"/>
  <path d="M815 118 C950 150 1005 320 1160 304" fill="none" stroke="${palette.foil}" stroke-width="8" opacity="0.16"/>
  <g opacity="0.12">
    <circle cx="1010" cy="110" r="112" fill="${palette.accent}"/>
    <circle cx="1100" cy="500" r="168" fill="${palette.foil}"/>
    <circle cx="170" cy="530" r="120" fill="${palette.accent}"/>
  </g>

  <rect x="52" y="48" width="1096" height="534" rx="28" fill="#ffffff" opacity="0.055" stroke="#ffffff" stroke-opacity="0.16"/>
  <g filter="url(#softShadow)">
    <rect x="72" y="78" width="196" height="42" rx="21" fill="${palette.accent}" opacity="0.92"/>
    <text x="170" y="106" text-anchor="middle" font-family="Arial, 'Noto Sans SC', sans-serif" font-size="17" font-weight="700" fill="#04111f">${escapeXml(category)}</text>
  </g>
  <text x="1004" y="106" text-anchor="end" font-family="Arial, 'Noto Sans SC', sans-serif" font-size="23" font-weight="800" fill="#ffffff">PINTE</text>
  ${titleSvg}
  <line x1="72" y1="336" x2="416" y2="336" stroke="${palette.accent}" stroke-width="5" stroke-linecap="round"/>
  ${summarySvg}
  <text x="74" y="548" font-family="Arial, 'Noto Sans SC', sans-serif" font-size="18" font-weight="700" fill="${palette.foil}">${escapeXml(keyword)}</text>
  <text x="1128" y="548" text-anchor="end" font-family="Arial, 'Noto Sans SC', sans-serif" font-size="18" font-weight="600" fill="#cbd5e1">Hot Stamping Foil Knowledge</text>
</svg>
`;
}

async function notionRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${notionToken}`,
      'Notion-Version': notionVersion,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${text.slice(0, 300)}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

async function fetchPages() {
  const pages = [];
  let cursor;

  do {
    const data = await notionRequest(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      body: JSON.stringify({
        page_size: 100,
        ...(cursor ? { start_cursor: cursor } : {}),
      }),
    });
    pages.push(...(data.results || []));
    cursor = data.has_more ? data.next_cursor || undefined : undefined;
  } while (cursor && pages.length < maxPages);

  return pages;
}

async function updateCover(page) {
  const url = coverUrlFor(page);
  if (dryRun || skipNotion) return { id: page.id, url, updated: false };

  await notionRequest(`https://api.notion.com/v1/pages/${page.id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      cover: {
        type: 'external',
        external: { url },
      },
    }),
  });

  return { id: page.id, url, updated: true };
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });
  const pages = await fetchPages();
  const results = [];

  for (const [index, page] of pages.entries()) {
    const filePath = path.join(outputDir, `${slugFor(page)}.svg`);
    await fs.writeFile(filePath, renderCover(page), 'utf8');
    const result = await updateCover(page);
    results.push(result);

    if ((index + 1) % 25 === 0 || index + 1 === pages.length) {
      console.log(`Processed ${index + 1}/${pages.length} covers`);
    }
    if (!dryRun && !skipNotion) await sleep(130);
  }

  const report = {
    generatedAt: new Date().toISOString(),
    total: pages.length,
    updatedInNotion: results.filter((item) => item.updated).length,
    outputDir,
    sample: results.slice(0, 5),
  };
  await fs.mkdir(path.join(process.cwd(), 'reports'), { recursive: true });
  await fs.writeFile(
    path.join(process.cwd(), 'reports', 'notion-blog-covers-2026-09-08.json'),
    JSON.stringify(report, null, 2),
    'utf8'
  );
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
