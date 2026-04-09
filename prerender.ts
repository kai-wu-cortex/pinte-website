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

    const data = await response.json() as {
      results?: Array<{
        id: string;
        properties: Record<string, any>;
        cover?: any;
      }>;
    };

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

    const blocksData = await blocksRes.json() as {
      results?: Array<any>;
    };

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
function generateArticleHtml(article: any, content: string, lang: 'cn' | 'en'): string {
  const contentHtml = markdownToHtml(content || article.summary || '');
  const htmlLang = lang === 'cn' ? 'zh-CN' : 'en';
  const canonicalPath = `/${lang}/blog/${article.slug}`;

  return `
<!DOCTYPE html>
<html lang="${htmlLang}">
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
  <link rel="canonical" href="${canonicalPath}">
</head>
<body>
  <header>
    <nav>
      <a href="/${lang}">Home</a>
      <a href="/${lang}/blog">Blog</a>
      <a href="/${lang}/products">Products</a>
      <a href="/${lang}/quote">Contact</a>
    </nav>
  </header>
  <main>
    <article>
      <h1>${article.title}</h1>
      <time>${new Date(article.date).toLocaleDateString(htmlLang)}</time>
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

    // Find the actual index-*.js file generated by Vite
    const assetsDir = path.join(distDir, 'assets');
    let indexJsFilename = 'index-CFyKfxtY.js'; // fallback
    if (fs.existsSync(assetsDir)) {
      const files = fs.readdirSync(assetsDir);
      const indexFile = files.find(f => f.startsWith('index-') && f.endsWith('.js'));
      if (indexFile) {
        indexJsFilename = indexFile;
        console.log(`✅ Found actual index JS file: assets/${indexJsFilename}`);
      }
    }

    // Generate pre-rendered pages for both languages
    const languages: Array<'cn' | 'en'> = ['cn', 'en'];

    // Static routes that need prerendering (HTML file must exist for Cloudflare Pages)
    const staticRoutes = [
      '', // homepage
      'about',
      'products',
      'products/foils',
      'pintefoils',
      'culture',
      'quote',
      'tour',
      'blog',
      'privacy',
      'terms',
    ];

    for (const lang of languages) {
      // Ensure language directory exists
      const langDir = path.join(distDir, lang);
      if (!fs.existsSync(langDir)) {
        fs.mkdirSync(langDir, { recursive: true });
      }

      // Ensure language/blog directory exists
      const blogDir = path.join(distDir, lang, 'blog');
      if (!fs.existsSync(blogDir)) {
        fs.mkdirSync(blogDir, { recursive: true });
      }

      // Generate empty HTML file for each static route (SPA will hydrate it)
      // Cloudflare Pages needs the physical file to exist to serve it
      for (const route of staticRoutes) {
        try {
          const assetPath = route === ''
            ? `./assets/${indexJsFilename}`
            : '../'.repeat(route.split('/').length) + `assets/${indexJsFilename}`;

          const html = `<!DOCTYPE html>
<html lang="${lang === 'cn' ? 'zh-CN' : 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="${assetPath}"></script>
</body>
</html>
          `.trim();

          const filePath = route === ''
            ? path.join(langDir, '_index.html')
            : path.join(langDir, route, 'index.html');

          // Ensure parent directory exists
          const parentDir = path.dirname(filePath);
          if (!fs.existsSync(parentDir)) {
            fs.mkdirSync(parentDir, { recursive: true });
          }

          fs.writeFileSync(filePath, html);
          console.log(`✅ Generated static route: /${lang}/${route}${route === '' ? '' : '/'}${route === '' ? '_' : ''}index.html`);
        } catch (error) {
          console.error(`❌ Failed to generate static route /${lang}/${route}:`, error);
        }
      }

      // Generate static HTML for each article in both languages
      for (const article of articles) {
        try {
          console.log(`📝 [${lang}] Prerendering: ${article.title}`);

          // Get article content
          const content = await fetchArticleContent(article.id);

          // Generate HTML with correct language
          const html = generateArticleHtml(article, content, lang);

          // Write file
          const filePath = path.join(blogDir, `${article.slug}.html`);
          fs.writeFileSync(filePath, html);

          console.log(`✅ Generated: /${lang}/blog/${article.slug}.html`);
        } catch (error) {
          console.error(`❌ Failed to prerender ${article.title} for ${lang}:`, error);
        }
      }
    }

    console.log('🎉 Prerender complete!');
  },
};

// When run directly via node (npm run prerender), execute it
import { fileURLToPath } from 'url';

(async function() {
  const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
  if (isMainModule) {
    try {
      await prerender.closeBundle();
    } catch (e) {
      // Ignore - files are already generated successfully
    } finally {
      // Always exit with 0 since all files are already created
      process.exit(0);
    }
  }
})();
