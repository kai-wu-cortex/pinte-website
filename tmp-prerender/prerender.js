/**
 * 预渲染插件 - 构建时生成静态 SEO 页面
 *
 * 关键职责:
 *   1. 给每个静态路由(及 blog 详情)生成独立的 index.html
 *   2. 把页面级 SEO 文本快照 (<main class="seo-snapshot">) + JSON-LD + 完整 meta 注入
 *   3. 校正 asset 路径,使各级嵌套目录都能正确引用 /assets/*
 *
 * 所有页面级文案与 schema 由 ./prerender/snapshot-builder.ts 统一产出,
 * 避免在本文件中维护重复的 routeMetadata 字典(历史包袱:旧的字典缺漏严重)。
 */
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { CONTENT_EN } from './data/content.js';
import { GEO_GUIDES } from './data/geoGuides.js';
import GENERATED_GUIDES from './data/generatedGuides.js';
import { buildSnapshot, renderJsonLdScripts, } from './prerender/snapshot-builder.js';
dotenv.config({ path: '.env.production' });
const NOTION_API_KEY = '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';
const NOTION_DATABASE_ID = '30cf8285a7fd80979ba1000b8469ba95';
const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
function buildCanonicalUrl(route, lang) {
    const pathPart = route ? `/${route}/` : '/';
    return `https://www.pintecl.com/${lang}${pathPart}`;
}
function buildStaticHeadLinks(route, lang) {
    const canonical = buildCanonicalUrl(route, lang);
    const en = buildCanonicalUrl(route, 'en');
    const cn = buildCanonicalUrl(route, 'cn');
    return `
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="en" href="${en}">
  <link rel="alternate" hreflang="zh-CN" href="${cn}">
  <link rel="alternate" hreflang="x-default" href="${en}">`.trim();
}
// ---- Markdown helper (blog only) ----
function markdownToHtml(md) {
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
async function fetchArticles() {
    if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
        console.warn('Notion API credentials not configured, using cached data');
        return [];
    }
    try {
        const fullUrl = `https://api.pintecl.com/v1/data_sources/${NOTION_DATABASE_ID}/query`;
        console.log('Fetching from Notion API via proxy... URL:', fullUrl);
        const notionPages = [];
        let cursor;
        do {
            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${NOTION_API_KEY}`,
                    'Notion-Version': '2025-09-03',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    page_size: 100,
                    ...(cursor ? { start_cursor: cursor } : {}),
                }),
            });
            const data = (await response.json());
            if (!response.ok) {
                console.error('Notion API error:', data);
                return [];
            }
            notionPages.push(...(data.results || []));
            cursor = data.has_more ? data.next_cursor || undefined : undefined;
        } while (cursor);
        if (!notionPages.length)
            return [];
        return notionPages.map((page) => {
            const props = page.properties;
            const getTitle = (prop) => {
                if (prop && prop.title && Array.isArray(prop.title))
                    return prop.title[0]?.plain_text || '';
                if (prop && prop.title && prop.title[0] && prop.title[0].plain_text)
                    return prop.title[0].plain_text;
                return '';
            };
            const getRichText = (prop) => prop?.rich_text?.[0]?.plain_text || '';
            const getDate = (prop) => prop?.date?.start || new Date().toISOString();
            const title = getTitle(props['文章标题']) || getTitle(props.Name) || getTitle(props.Title);
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
    }
    catch (error) {
        console.error('Failed to fetch articles:', error);
        return [];
    }
}
// 获取单篇文章正文(用于 blog 详情 snapshot 的正文摘要)
async function fetchArticleContent(pageId) {
    if (!NOTION_API_KEY)
        return '';
    try {
        const blocksRes = await fetch(`https://api.pintecl.com/v1/blocks/${pageId}/children?page_size=100`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${NOTION_API_KEY}`,
                'Notion-Version': '2025-09-03',
            },
        });
        const blocksData = (await blocksRes.json());
        if (!blocksData.results || blocksData.results.length === 0)
            return '';
        return blocksData.results
            .map((block) => {
            if (block.type === 'paragraph')
                return block.paragraph?.rich_text?.map((t) => t.plain_text).join('') || '';
            if (block.type === 'heading_1')
                return '# ' + (block.heading_1?.rich_text?.map((t) => t.plain_text).join('') || '');
            if (block.type === 'heading_2')
                return '## ' + (block.heading_2?.rich_text?.map((t) => t.plain_text).join('') || '');
            if (block.type === 'heading_3')
                return '### ' + (block.heading_3?.rich_text?.map((t) => t.plain_text).join('') || '');
            if (block.type === 'bulleted_list_item')
                return ('- ' +
                    (block.bulleted_list_item?.rich_text?.map((t) => t.plain_text).join('') || ''));
            return '';
        })
            .join('\n\n');
    }
    catch (error) {
        console.error('Failed to fetch content:', error);
        return '';
    }
}
// ---- HTML injection helpers ----
/**
 * 把 builder 输出的 snapshot 注入到模板里:
 *   - <title>: 替换为新标题
 *   - <meta name="description">: 替换
 *   - <meta name="keywords">: 替换为新 keywords (或注入,如果原模板已被移除)
 *   - <head> 末尾: 追加 og/twitter/geo meta 和 JSON-LD
 *   - <div id="root"></div>: 注入 snapshot HTML
 */
function injectSnapshot(template, snapshot, route, lang) {
    const { html: snapshotHtml, jsonLd, meta } = snapshot;
    const canonical = buildCanonicalUrl(route, lang);
    const ogLocale = lang === 'cn' ? 'zh_CN' : 'en_US';
    const ogLocaleAlt = lang === 'cn' ? 'en_US' : 'zh_CN';
    const ogImage = meta.image || 'https://www.pintecl.com/og-image.jpg';
    // Build extra head tags
    const extraHead = `
  <meta name="keywords" content="${escapeHtml(meta.keywords.join(', '))}">
  <meta name="author" content="Dongguan Best Craftwork Products Co., Ltd.">
  <meta name="robots" content="index, follow">
  <meta name="googlebot" content="index, follow">
  <meta name="geo.region" content="CN-44">
  <meta name="geo.placename" content="Dongguan">
  <meta name="geo.position" content="23.0489;113.7447">

  <meta property="og:type" content="${meta.type || 'website'}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta property="og:title" content="${escapeHtml(meta.title)}">
  <meta property="og:description" content="${escapeHtml(meta.description)}">
  <meta property="og:image" content="${escapeHtml(ogImage)}">
  <meta property="og:site_name" content="PINTE">
  <meta property="og:locale" content="${ogLocale}">
  <meta property="og:locale:alternate" content="${ogLocaleAlt}">
  ${meta.type === 'article' && meta.publishedTime
        ? `<meta property="article:published_time" content="${escapeHtml(meta.publishedTime)}">`
        : ''}

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${escapeHtml(canonical)}">
  <meta name="twitter:title" content="${escapeHtml(meta.title)}">
  <meta name="twitter:description" content="${escapeHtml(meta.description)}">
  <meta name="twitter:image" content="${escapeHtml(ogImage)}">

  <meta name="served-markets" content="${escapeHtml(meta.geoTargets.join(', '))}">
  ${buildStaticHeadLinks(route, lang)}
  ${renderJsonLdScripts(jsonLd)}`.trim();
    let html = template;
    // <html lang>
    const htmlLang = lang === 'cn' ? 'zh-CN' : 'en';
    html = html.replace(/<html lang="[^"]+">/, `<html lang="${htmlLang}">`);
    // title
    if (/<title>[^<]*<\/title>/.test(html)) {
        html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(meta.title)}</title>`);
    }
    else {
        html = html.replace(/<head>/, `<head>\n  <title>${escapeHtml(meta.title)}</title>`);
    }
    // description
    if (/<meta name="description"[^>]*>/.test(html)) {
        html = html.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${escapeHtml(meta.description)}">`);
    }
    else {
        html = html.replace(/<head>/, `<head>\n  <meta name="description" content="${escapeHtml(meta.description)}">`);
    }
    // remove static keywords from template (we re-inject in extraHead)
    html = html.replace(/<meta name="keywords"[^>]*>/, '');
    // append extras before </head>
    html = html.replace('</head>', `\n${extraHead}\n</head>`);
    // inject snapshot into root
    html = html.replace('<div id="root"></div>', `<div id="root">${snapshotHtml}</div>`);
    return html;
}
function fixAssetPaths(html, levels, indexJsFilename, vendorJsFilename) {
    const assetPath = '../'.repeat(levels) + `assets/${indexJsFilename}`;
    const modulePreloadPath = '../'.repeat(levels) + `assets/${vendorJsFilename}`;
    return html
        .replace(/type="module" crossorigin src="[^"]+"/, `type="module" crossorigin src="${assetPath}"`)
        .replace(/<link rel="modulepreload" crossorigin href="[^"]+">/, `<link rel="modulepreload" crossorigin href="${modulePreloadPath}">`);
}
export const prerender = {
    name: 'prerender',
    async writeBundle() {
        console.log('🚀 Starting prerender...');
        const articles = await fetchArticles();
        console.log(`📄 Found ${articles.length} articles`);
        const distDir = path.resolve('dist');
        // Find the actual index-*.js and vendor-*.js generated by Vite
        const assetsDir = path.join(distDir, 'assets');
        let indexJsFilename = 'index-CFyKfxtY.js';
        let vendorJsFilename = 'vendor-DE--IVNv.js';
        if (fs.existsSync(assetsDir)) {
            const files = fs.readdirSync(assetsDir);
            const indexFile = files.find((f) => f.startsWith('index-') && f.endsWith('.js'));
            const vendorFile = files.find((f) => f.startsWith('vendor-') && f.endsWith('.js'));
            if (indexFile)
                indexJsFilename = indexFile;
            if (vendorFile)
                vendorJsFilename = vendorFile;
            console.log(`✅ Found assets: index=${indexJsFilename}, vendor=${vendorJsFilename}`);
        }
        const languages = ['cn', 'en'];
        const productCategoryRoutes = Object.keys(CONTENT_EN.PRODUCT_DATA).map((id) => `products/category/${id}`);
        const productItemRoutes = Array.from(new Set(Object.values(CONTENT_EN.CATALOG_DATA)
            .flat()
            .map((product) => `products/item/${product.id}`)));
        const solutionRoutes = Object.keys(CONTENT_EN.SOLUTIONS_DATA).map((id) => `solutions/${id}`);
        const guideRoutes = Array.from(new Set([
            ...GEO_GUIDES.map((guide) => `guides/${guide.slug}`),
            ...GENERATED_GUIDES.filter((guide) => guide.status === 'published').map((guide) => `guides/${guide.slug}`),
        ]));
        // Static routes that need prerendering (HTML file must exist for Cloudflare Pages)
        const staticRoutes = [
            '', // homepage
            'about',
            'products',
            'products/foils',
            ...productCategoryRoutes,
            ...productItemRoutes,
            'pintefoils',
            'culture',
            'quote',
            'tour',
            'blog',
            'guides',
            ...guideRoutes,
            'seo-geo-sop',
            ...solutionRoutes,
            'privacy',
            'terms',
        ];
        const rootIndexPath = path.join(distDir, 'index.html');
        const rootIndexTemplate = fs.readFileSync(rootIndexPath, 'utf8');
        for (const lang of languages) {
            const langDir = path.join(distDir, lang);
            if (!fs.existsSync(langDir))
                fs.mkdirSync(langDir, { recursive: true });
            const blogDir = path.join(distDir, lang, 'blog');
            if (!fs.existsSync(blogDir))
                fs.mkdirSync(blogDir, { recursive: true });
            for (const route of staticRoutes) {
                try {
                    const levels = route === '' ? 1 : route.split('/').length + 1;
                    const snapshot = buildSnapshot(route, lang);
                    if (!snapshot) {
                        console.warn(`⚠️  No snapshot builder for /${lang}/${route} — using empty root`);
                    }
                    let html = rootIndexTemplate;
                    if (snapshot) {
                        html = injectSnapshot(html, snapshot, route, lang);
                    }
                    html = fixAssetPaths(html, levels, indexJsFilename, vendorJsFilename);
                    const filePath = route === ''
                        ? path.join(langDir, 'index.html')
                        : path.join(langDir, route, 'index.html');
                    const parentDir = path.dirname(filePath);
                    if (!fs.existsSync(parentDir))
                        fs.mkdirSync(parentDir, { recursive: true });
                    fs.writeFileSync(filePath, html);
                    console.log(`✅ Generated static route: /${lang}/${route}${route === '' ? '' : '/'}index.html`);
                }
                catch (error) {
                    console.error(`❌ Failed to generate static route /${lang}/${route}:`, error);
                }
            }
            // Generate static HTML for each article in both languages
            for (const article of articles) {
                try {
                    console.log(`📝 [${lang}] Prerendering: ${article.title}`);
                    const articleDir = path.join(blogDir, article.slug);
                    if (!fs.existsSync(articleDir))
                        fs.mkdirSync(articleDir, { recursive: true });
                    // 拉正文(用于注入 lead 段落与 Article schema 描述)
                    let contentMarkdown = '';
                    try {
                        contentMarkdown = await fetchArticleContent(article.id);
                    }
                    catch (_e) {
                        // 网络问题不阻塞构建
                    }
                    const articleLike = {
                        id: article.id,
                        title: article.title,
                        slug: article.slug,
                        summary: article.summary,
                        cover: article.cover,
                        date: article.date,
                        contentMarkdown,
                    };
                    const snapshot = buildSnapshot(`blog/${article.slug}`, lang, { article: articleLike });
                    let html = rootIndexTemplate;
                    if (snapshot) {
                        html = injectSnapshot(html, snapshot, `blog/${article.slug}`, lang);
                    }
                    html = fixAssetPaths(html, 3, indexJsFilename, vendorJsFilename);
                    const filePath = path.join(articleDir, 'index.html');
                    fs.writeFileSync(filePath, html);
                    console.log(`✅ Generated: /${lang}/blog/${article.slug}/index.html`);
                }
                catch (error) {
                    console.error(`❌ Failed to prerender ${article.title} for ${lang}:`, error);
                }
            }
        }
        console.log('🎉 Prerender complete!');
    },
};
// When run directly via node (npm run prerender), execute it
import { fileURLToPath } from 'url';
(async function () {
    const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
    if (isMainModule) {
        try {
            await prerender.writeBundle();
        }
        catch (e) {
            console.error(e);
        }
        finally {
            process.exit(0);
        }
    }
})();
// Silence unused-import lint warning (markdownToHtml retained for future blog body rendering)
export { markdownToHtml };
