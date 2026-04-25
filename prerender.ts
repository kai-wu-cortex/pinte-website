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

    // SEO metadata for each static route (used during prerender to inject into static HTML)
    const routeMetadata: Record<string, { cn: { title: string; description: string }, en: { title: string; description: string } }> = {
      '': {
        cn: {
          title: '品特PINTE - 高端烫金膜制造专家｜中国东莞烫金膜制造商',
          description: '主营烫金箔、烫金膜、冷烫箔、电化铝、颜料箔、全息烫金箔，拥有25年涂布经验，专业定制化生产，供应越南、东南亚、马来西亚、泰国、印尼等全球市场。',
        },
        en: {
          title: 'PINTE - Premium Hot Stamping Foil Manufacturer | Dongguan China',
          description: 'PINTE is a leading manufacturer of high-end hot stamping foils based in Dongguan China with 25 years of coating experience and custom production capabilities. We supply hot stamping foil, cold foil, digital foil, pigment foil, holographic foil to Vietnam, Southeast Asia, Malaysia, Thailand, Indonesia and global markets.',
        },
      },
      'about': {
        cn: {
          title: '关于品特 - PINTE高端烫金箔制造商',
          description: 'PINTE品特是一家拥有25年烫金箔生产经验的专业厂家，位于中国东莞，专注高端烫金箔研发生产，服务全球客户。',
        },
        en: {
          title: 'About Us - PINTE Hot Stamping Foils',
          description: 'PINTE is a professional manufacturer with 25 years of experience in hot stamping foil production located in Dongguan China, focusing on R&D and manufacturing of high-end hot stamping foils, serving customers worldwide.',
        },
      },
      'products': {
        cn: {
          title: '产品中心 - PINTE品特烫金箔产品目录',
          description: '品特PINTE提供全系列烫金箔产品，包括PK咖啡底系列、PC塑胶冷烫系列、PL/PY颜料箔、数码冷烫系列、金葱粉系列等，满足不同行业烫金需求。',
        },
        en: {
          title: 'Products - PINTE Hot Stamping Foil Catalog',
          description: 'PINTE offers a complete range of hot stamping foil products including PK Brown Back Series, PC Plastic/Cold Foil Series, PL/PY Pigment Foils, Digital Cold Foil Series, Glitter Series, meeting various industry requirements.',
        },
      },
      'culture': {
        cn: {
          title: '关于我们 - PINTE品特烫金箔',
          description: 'PINTE品特是一家拥有25年烫金箔生产经验的专业厂家，位于中国东莞，专注高端烫金箔研发生产，服务全球客户。',
        },
        en: {
          title: 'About Us - PINTE Hot Stamping Foils',
          description: 'PINTE is a professional manufacturer with 25 years of experience in hot stamping foil production located in Dongguan China, focusing on R&D and manufacturing of high-end hot stamping foils, serving customers worldwide.',
        },
      },
      'quote': {
        cn: {
          title: '获取报价 - 联系PINTE品特烫金箔',
          description: '联系PINTE品特获取烫金箔报价，我们提供专业的烫金箔定制服务，快速响应全球客户需求。',
        },
        en: {
          title: 'Get a Quote - Contact PINTE Hot Stamping Foils',
          description: 'Contact PINTE to get a quotation for hot stamping foils. We provide custom foil solutions with fast response for global customers.',
        },
      },
      'tour': {
        cn: {
          title: '工厂在线参观 - PINTE烫金箔',
          description: '线上参观 PINTE 东莞烫金箔生产工厂，了解我们的生产流程和质检标准。',
        },
        en: {
          title: 'Factory Virtual Tour - PINTE Hot Stamping Foils',
          description: 'Take a virtual tour of our PINTE hot stamping foil manufacturing factory in Dongguan China, learn about our production process and quality standards.',
        },
      },
      'blog': {
        cn: {
          title: '博客中心 - PINTE烫金箔行业资讯',
          description: '探索烫金膜行业最新资讯、技术文章和行业见解，了解烫金箔生产工艺、应用案例和市场动态。',
        },
        en: {
          title: 'Blog - PINTE Hot Stamping Foil Insights',
          description: 'Explore the latest insights, technical articles and industry knowledge about hot stamping foils, covering production techniques, application case studies and market trends.',
        },
      },
      'privacy': {
        cn: {
          title: '隐私政策 - PINTE品特烫金箔',
          description: 'PINTE品特烫金箔官网隐私政策。本页说明我们如何收集、使用、存储和保护您访问网站时提供的个人信息，包括联系方式、浏览数据和Cookie使用规则。',
        },
        en: {
          title: 'Privacy Policy - PINTE Hot Stamping Foils',
          description: 'Privacy Policy for PINTE Hot Stamping Foils official website. This page explains how we collect, use, store and protect your personal information when you visit our website.',
        },
      },
      'terms': {
        cn: {
          title: '服务条款 - PINTE品特烫金箔',
          description: 'PINTE品特烫金箔官网使用服务条款。本页说明您访问和使用本网站需要遵守的条件，包括知识产权归属、产品信息免责声明、报价订单规则、责任限制和适用法律等内容。',
        },
        en: {
          title: 'Terms of Service - PINTE Hot Stamping Foils',
          description: 'Terms of Service for PINTE Hot Stamping Foils official website. This page outlines the terms and conditions you agree to when accessing and using this website.',
        },
      },
    };

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
      // Read the root index.html as template to preserve all CSS and meta tags
      const rootIndexPath = path.join(distDir, 'index.html');
      let rootIndexTemplate = fs.readFileSync(rootIndexPath, 'utf8');

      for (const route of staticRoutes) {
        try {
          // File is at /lang/[route...]/index.html
          // assets are at /assets/ from root, so need ../ for each level
          // route = '' -> file at /lang/index.html -> 1 level deep -> ../
          // route = 'about' -> file at /lang/about/index.html -> 2 levels deep -> ../../
          // route = 'products/foils' -> file at /lang/products/foils/index.html -> 3 levels deep -> ../../../
          const levels = (route === '' ? 1 : route.split('/').length + 1);
          const assetPath = '../'.repeat(levels) + `assets/${indexJsFilename}`;
          const modulePreloadPath = '../'.repeat(levels) + `assets/vendor-DE--IVNv.js`;
          const htmlLang = lang === 'cn' ? 'zh-CN' : 'en';

          // Replace the key parts in the template
          let html = rootIndexTemplate
            .replace(/<html lang="[^"]+">/, `<html lang="${htmlLang}">`);

          // Inject correct SEO metadata for this route into static HTML
          // This ensures search engines see title/description even without executing JS
          const meta = routeMetadata[route]?.[lang];
          if (meta) {
            // Replace or inject title
            if (html.match(/<title>[^<]+<\/title>/)) {
              html = html.replace(/<title>[^<]+<\/title>/, `<title>${meta.title}</title>`);
            } else {
              html = html.replace(/<head>/, `<head>\n  <title>${meta.title}</title>`);
            }
            // Replace or inject meta description
            if (html.match(/<meta name="description"[^>]*>/)) {
              html = html.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${meta.description}">`);
            } else {
              html = html.replace(/<head>/, `<head>\n  <meta name="description" content="${meta.description}">`);
            }
          } else {
            // Fallback: remove static tags for routes not in metadata (SEOMeta will inject)
            html = html
              .replace(/<title>[^<]+<\/title>/, '')
              .replace(/<meta name="description"[^>]*>/, '');
          }

          // Always remove keywords from template - SEOMeta injects correct ones
          html = html.replace(/<meta name="keywords"[^>]*>/, '');

          // Update asset paths
          html = html
            .replace(/type="module" crossorigin src="[^"]+"/, `type="module" crossorigin src="${assetPath}"`)
            .replace(/<link rel="modulepreload" crossorigin href="[^"]+">/, `<link rel="modulepreload" crossorigin href="${modulePreloadPath}">`);

          const filePath = route === ''
            ? path.join(langDir, 'index.html')
            : path.join(langDir, route, 'index.html');

          // Ensure parent directory exists
          const parentDir = path.dirname(filePath);
          if (!fs.existsSync(parentDir)) {
            fs.mkdirSync(parentDir, { recursive: true });
          }

          fs.writeFileSync(filePath, html);
          console.log(`✅ Generated static route: /${lang}/${route}${route === '' ? '' : '/'}index.html`);
        } catch (error) {
          console.error(`❌ Failed to generate static route /${lang}/${route}:`, error);
        }
      }

      // Generate static HTML for each article in both languages
      // Same pattern as other routes - create /lang/blog/slug/index.html with empty root for React hydration
      // This allows direct URL access to work correctly with client-side navigation
      for (const article of articles) {
        try {
          console.log(`📝 [${lang}] Prerendering: ${article.title}`);

          // Article route is /lang/blog/slug -> create index.html in that directory
          const articleDir = path.join(blogDir, article.slug);
          if (!fs.existsSync(articleDir)) {
            fs.mkdirSync(articleDir, { recursive: true });
          }

          // Read root index template and replace asset path like other static routes
          const rootIndexPath = path.join(distDir, 'index.html');
          let htmlTemplate = fs.readFileSync(rootIndexPath, 'utf8');

          // Calculate correct asset path depth: /lang/blog/slug/index.html -> ../../assets/...
          // lang (1) + blog (1) + slug (1) = 3 levels deep -> ../../
          const levels = 3;
          const assetPath = '../'.repeat(levels) + `assets/${indexJsFilename}`;
          const modulePreloadPath = '../'.repeat(levels) + `assets/vendor-DE--IVNv.js`;
          const htmlLang = lang === 'cn' ? 'zh-CN' : 'en';

          // Replace template
          let html = htmlTemplate
            .replace(/<html lang="[^"]+">/, `<html lang="${htmlLang}">`)
            // Remove static title/meta description from template - SEOMeta component will inject correct ones
            .replace(/<title>[^<]+<\/title>/, '')
            .replace(/<meta name="description"[^>]*>/, '')
            .replace(/<meta name="keywords"[^>]*>/, '')
            .replace(/type="module" crossorigin src="[^"]+"/, `type="module" crossorigin src="${assetPath}"`)
            .replace(/<link rel="modulepreload" crossorigin href="[^"]+">/, `<link rel="modulepreload" crossorigin href="${modulePreloadPath}">`);

          // Write file
          const filePath = path.join(articleDir, 'index.html');
          fs.writeFileSync(filePath, html);

          console.log(`✅ Generated: /${lang}/blog/${article.slug}/index.html`);
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
