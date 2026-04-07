/**
 * 预渲染插件 - 构建时生成静态 SEO 页面
 * 用于解决 SEO 问题：让搜索引擎能看到完整内容
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config({ path: '.env.production' });

const NOTION_API_KEY = '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';
const NOTION_DATABASE_ID = '30cf8285a7fd80979ba1000b8469ba95';

// 简单的 Markdown 转 HTML
function markdownToHtml(md: string): string {
  return md
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
    .replace(/\n/gim, '<br />');
}

// 获取所有文章
async function fetchArticles(): Promise<any[]> {
  if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
    console.warn('Notion API credentials not configured, using cached data');
    return [];
  }

  try {
    // Use proxy through cloud function - correct path verified by browser dev tools
    const fullUrl = `https://api.pintecl.com/v1/data_sources/${NOTION_DATABASE_ID}/query`;
    console.log('Fetching from Notion API via proxy... URL:', fullUrl);
    console.log('Token:', NOTION_API_KEY ? `${NOTION_API_KEY.substring(0, 4)}...${NOTION_API_KEY.length} chars` : 'NO TOKEN');

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2025-09-03',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ page_size: 100 }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Notion API error:', data);
      console.error('Response status:', response.status, response.statusText);
      return [];
    }

    console.log('Got response, status:', response.status, 'results:', data.results?.length);

    if (!data.results) {
      console.error('No results in response:', JSON.stringify(data, null, 2));
      return [];
    }

    return data.results.map((page: any) => {
      const props = page.properties;
      const getTitle = (prop: any) => {
        // Different property formats - handle both
        if (prop && prop.title && Array.isArray(prop.title)) {
          return prop.title[0]?.plain_text || '';
        }
        if (prop && prop.title && prop.title[0] && prop.title[0].plain_text) {
          return prop.title[0].plain_text;
        }
        return '';
      };
      const getRichText = (prop: any) => prop?.rich_text?.[0]?.plain_text || '';
      const getDate = (prop: any) => prop?.date?.start || new Date().toISOString();
      const title = getTitle(props['文章标题']) || getTitle(props['文章标题']) || getTitle(props.Name) || getTitle(props.Title);
      const slug = page.id.replace(/-/g, '');

      return {
        id: page.id,
        title,
        slug,
        summary: getRichText(props.Summary || props.Description),
        date: getDate(props['截止日期'] || props.Date),
        cover: page.cover?.external?.url || page.cover?.file?.url || '',
      };
    });
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    return [];
  }
}

// 获取单篇文章内容
async function fetchArticleContent(pageId: string): Promise<string> {
  if (!NOTION_API_KEY) return '';

  try {
    // 获取 blocks via proxy - correct path verified by browser dev tools
    const blocksRes = await fetch(`https://api.pintecl.com/v1/blocks/${pageId}/children?page_size=100`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2025-09-03',
      },
    });

    const blocksData = await blocksRes.json();
    
    if (!blocksData.results || blocksData.results.length === 0) {
      return '';
    }

    return blocksData.results.map((block: any) => {
      if (block.type === 'paragraph') {
        return block.paragraph?.rich_text?.map((t: any) => t.plain_text).join('') || '';
      } else if (block.type === 'heading_1') {
        return '# ' + (block.heading_1?.rich_text?.map((t: any) => t.plain_text).join('') || '');
      } else if (block.type === 'heading_2') {
        return '## ' + (block.heading_2?.rich_text?.map((t: any) => t.plain_text).join('') || '');
      } else if (block.type === 'heading_3') {
        return '### ' + (block.heading_3?.rich_text?.map((t: any) => t.plain_text).join('') || '');
      } else if (block.type === 'bulleted_list_item') {
        return '- ' + (block.bulleted_list_item?.rich_text?.map((t: any) => t.plain_text).join('') || '');
      }
      return '';
    }).join('\n\n');
  } catch (error) {
    console.error('Failed to fetch content:', error);
    return '';
  }
}

// 生成文章页面的 HTML
function generateArticleHtml(article: any, content: string): string {
  const contentHtml = markdownToHtml(content || article.summary || '');
  
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${article.title} | PINTE Blog</title>
  <meta name="description" content="${article.summary || article.title}">
  <meta name="keywords" content="烫金膜, Hot Stamping Foil, 包装印刷">
  <meta property="og:title" content="${article.title}">
  <meta property="og:description" content="${article.summary || article.title}">
  <meta property="og:type" content="article">
  <meta property="og:image" content="${article.cover}">
  <link rel="canonical" href="/blog/${article.slug}">
</head>
<body>
  <header>
    <nav>
      <a href="/">Home</a>
      <a href="/blog">Blog</a>
      <a href="/products">Products</a>
      <a href="/contact">Contact</a>
    </nav>
  </header>
  <main>
    <article>
      <h1>${article.title}</h1>
      <time>${new Date(article.date).toLocaleDateString()}</time>
      <div class="content">
        ${contentHtml}
      </div>
    </article>
  </main>
  <footer>
    <p>&copy; 2026 PINTE - High-End Hot Stamping Foils</p>
  </footer>
</body>
</html>
  `.trim();
}

export const prerender = {
  name: 'prerender',
  async closeBundle() {
    console.log('🚀 Starting prerender...');

    const articles = await fetchArticles();
    console.log(`📄 Found ${articles.length} articles`);

    const distDir = path.resolve('dist');

    // 确保 blog 目录存在
    const blogDir = path.join(distDir, 'blog');
    if (!fs.existsSync(blogDir)) {
      fs.mkdirSync(blogDir, { recursive: true });
    }

    // 为每篇文章生成静态 HTML
    for (const article of articles) {
      try {
        console.log(`📝 Prerendering: ${article.title}`);

        // 获取文章内容
        const content = await fetchArticleContent(article.id);

        // 生成 HTML
        const html = generateArticleHtml(article, content);

        // 写入文件
        const filePath = path.join(blogDir, `${article.slug}.html`);
        fs.writeFileSync(filePath, html);

        console.log(`✅ Generated: /blog/${article.slug}.html`);
      } catch (error) {
        console.error(`❌ Failed to prerender ${article.title}:`, error);
      }
    }

    console.log('🎉 Prerender complete!');
  },
};

// When run directly via node (npm run prerender), execute it
import { fileURLToPath } from 'url';

async function runMain() {
  await prerender.closeBundle();
  process.exit(0);
}

const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
if (isMainModule) {
  runMain();
}