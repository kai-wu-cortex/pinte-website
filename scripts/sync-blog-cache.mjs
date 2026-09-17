/**
 * Sync the public Notion blog into deployable static JSON files.
 *
 * Notion remains the editorial source. The generated files make production
 * page loads independent from Notion/API availability and give prerendering a
 * deterministic fallback when Cloudflare cannot reach Notion during a build.
 */

import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.production' });
dotenv.config();

const API_KEY = process.env.NOTION_API_KEY || process.env.VITE_NOTION_API_KEY || '';
const DATABASE_ID = process.env.VITE_NOTION_DATABASE_ID || '';
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'blog-data');
const NOTION_VERSION = '2022-06-28';
const CONCURRENCY = Math.max(1, Number(process.env.NOTION_SYNC_CONCURRENCY || 3));
const ALLOW_CACHE_FALLBACK = process.argv.includes('--fallback');

function cachedArticleCount() {
  const indexPath = path.join(OUTPUT_DIR, 'index.json');
  if (!fs.existsSync(indexPath)) return 0;
  try {
    const payload = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    return Array.isArray(payload?.articles) ? payload.articles.length : 0;
  } catch (_error) {
    return 0;
  }
}

if (!API_KEY || !DATABASE_ID) {
  const cachedCount = cachedArticleCount();
  if (ALLOW_CACHE_FALLBACK && cachedCount > 0) {
    console.warn(`Notion credentials unavailable; keeping ${cachedCount} cached articles.`);
    process.exit(0);
  }
  console.error('Missing NOTION_API_KEY/VITE_NOTION_API_KEY or VITE_NOTION_DATABASE_ID.');
  process.exit(1);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function notionRequest(pathname, options = {}, attempt = 0) {
  const response = await fetch(`https://api.notion.com/v1${pathname}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (response.status === 429 && attempt < 6) {
    const retryAfter = Number(response.headers.get('retry-after') || 1);
    await sleep(Math.max(1000, retryAfter * 1000));
    return notionRequest(pathname, options, attempt + 1);
  }

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Notion ${response.status} ${pathname}: ${detail.slice(0, 300)}`);
  }

  return response.json();
}

const plainText = (property) => {
  if (!property) return '';
  const values = property.title || property.rich_text;
  return Array.isArray(values) ? values.map((item) => item.plain_text || '').join('') : '';
};

const selectValue = (property) =>
  property?.select?.name || property?.status?.name || '';

const multiSelectValues = (property) => {
  if (!property) return [];
  if (Array.isArray(property.multi_select)) return property.multi_select.map((item) => item.name);
  const selected = selectValue(property);
  if (selected) return [selected];
  return plainText(property)
    .split(/[,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
};

function parsePage(page) {
  const props = page.properties || {};
  const title = plainText(props['文章标题'] || props.Name || props.Title || props.title) || 'Untitled';
  const summary = plainText(
    props.Summary || props.Description || props['SEO Description'] || props.excerpt || props.摘要 || props.描述
  );
  const slug = page.id.replace(/-/g, '');

  return {
    id: page.id,
    title,
    slug,
    summary,
    cover: page.cover?.external?.url || page.cover?.file?.url || '',
    date:
      props['更新日期']?.date?.start ||
      props['截止日期']?.date?.start ||
      props.Date?.date?.start ||
      props.Published?.date?.start ||
      page.last_edited_time ||
      new Date().toISOString(),
    author: plainText(props.Author || props.author || props.作者),
    category: multiSelectValues(props['主题分类'] || props.Category || props.categories),
    tags: multiSelectValues(props.Tags || props.tag || props.标签),
    status: selectValue(props['写作状态'] || props.Status || props.status || props.publish),
    seo: {
      title: plainText(props.SEO_Title || props['SEO Title']) || title,
      description: plainText(props.SEO_Description || props['SEO Description']) || summary,
      keywords: multiSelectValues(
        props.SEO_Keywords || props['SEO Keywords'] || props.Keywords || props.keywords
      ),
      ogImage: '',
    },
    geo: {
      region: selectValue(props.GEO_Region || props.Region || props.geo),
      language: selectValue(props.GEO_Language || props.Language || props.lang),
      locality: plainText(props.GEO_Locality || props.Locality),
    },
  };
}

const richTextToMarkdown = (richText = []) =>
  richText
    .map((item) => {
      let text = item.plain_text || '';
      if (item.href) text = `[${text}](${item.href})`;
      if (item.annotations?.code) text = `\`${text}\``;
      if (item.annotations?.bold) text = `**${text}**`;
      if (item.annotations?.italic) text = `*${text}*`;
      return text;
    })
    .join('');

function blockToMarkdown(block) {
  const value = block[block.type] || {};
  const text = richTextToMarkdown(value.rich_text);

  switch (block.type) {
    case 'paragraph': return text;
    case 'heading_1': return `# ${text}`;
    case 'heading_2': return `## ${text}`;
    case 'heading_3': return `### ${text}`;
    case 'bulleted_list_item': return `- ${text}`;
    case 'numbered_list_item': return `1. ${text}`;
    case 'to_do': return `${value.checked ? '[x]' : '[ ]'} ${text}`;
    case 'quote': return `> ${text}`;
    case 'callout': return `> ${text}`;
    case 'code': return `\`\`\`${value.language || ''}\n${text}\n\`\`\``;
    case 'divider': return '---';
    case 'image': {
      const url = value.external?.url || value.file?.url || '';
      const caption = richTextToMarkdown(value.caption) || 'Article image';
      return url ? `![${caption}](${url})` : '';
    }
    case 'bookmark': return value.url ? `[${value.url}](${value.url})` : '';
    default: return text;
  }
}

async function fetchAllPages() {
  const pages = [];
  let cursor;

  do {
    const data = await notionRequest(`/databases/${DATABASE_ID}/query`, {
      method: 'POST',
      body: JSON.stringify({ page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) }),
    });
    pages.push(...(data.results || []));
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);

  return pages;
}

async function fetchPageContent(pageId) {
  const blocks = [];
  let cursor;

  do {
    const query = new URLSearchParams({ page_size: '100' });
    if (cursor) query.set('start_cursor', cursor);
    const data = await notionRequest(`/blocks/${pageId}/children?${query}`);
    blocks.push(...(data.results || []));
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);

  return blocks.map(blockToMarkdown).filter(Boolean).join('\n\n');
}

async function mapConcurrent(items, limit, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await mapper(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function main() {
  console.log('Fetching Notion blog metadata...');
  const pages = await fetchAllPages();
  console.log(`Found ${pages.length} articles. Fetching content...`);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const articles = await mapConcurrent(pages, CONCURRENCY, async (page, index) => {
    const article = parsePage(page);
    try {
      article.content = await fetchPageContent(page.id);
    } catch (error) {
      console.warn(`Content fallback for ${article.slug}: ${error.message}`);
      article.content = article.summary;
    }
    console.log(`[${index + 1}/${pages.length}] ${article.title}`);
    return article;
  });

  const activeFiles = new Set(articles.map((article) => `${article.slug}.json`));
  for (const filename of fs.readdirSync(OUTPUT_DIR)) {
    if (filename !== 'index.json' && filename.endsWith('.json') && !activeFiles.has(filename)) {
      fs.unlinkSync(path.join(OUTPUT_DIR, filename));
    }
  }

  for (const article of articles) {
    fs.writeFileSync(
      path.join(OUTPUT_DIR, `${article.slug}.json`),
      `${JSON.stringify(article)}\n`,
      'utf8'
    );
  }

  const index = articles.map(({ content: _content, ...article }) => article);
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'index.json'),
    `${JSON.stringify({ articles: index, generatedAt: new Date().toISOString() })}\n`,
    'utf8'
  );

  console.log(`Static blog cache written to ${OUTPUT_DIR} (${articles.length} articles).`);
}

main().catch((error) => {
  console.error(error);
  const cachedCount = cachedArticleCount();
  if (ALLOW_CACHE_FALLBACK && cachedCount > 0) {
    console.warn(`Notion sync failed; keeping ${cachedCount} cached articles for this build.`);
    process.exit(0);
  }
  process.exit(1);
});
