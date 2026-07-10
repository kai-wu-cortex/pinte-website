/**
 * Complete Sitemap Generator for PINTE Website
 * Generates a proper XML sitemap from the same content IDs used by routes.
 * Run: npm run generate-sitemap
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { CONTENT_EN } from '../data/content.ts';
import { GEO_GUIDES } from '../data/geoGuides.ts';
import { mergeProductSeoProfile } from '../data/productSeoProfiles.ts';

dotenv.config();

const siteUrl = process.env.SITE_URL || 'https://www.pintecl.com';
const languages = ['cn', 'en'];
const routePath = (lang, route = '') => route ? `/${lang}/${route}/` : `/${lang}/`;
const notionDatabaseId = process.env.NOTION_DATABASE_ID || '30cf8285a7fd80979ba1000b8469ba95';
const blogSitemapPath = path.join(process.cwd(), 'public', 'sitemap-blog.json');

// Define all static pages with their priorities and change frequencies
const staticPages = [
  {
    loc: '',
    changefreq: 'daily',
    priority: '1.0',
  },
  {
    loc: 'about',
    changefreq: 'monthly',
    priority: '0.8',
  },
  {
    loc: 'products',
    changefreq: 'weekly',
    priority: '0.9',
  },
  {
    loc: 'products/foils',
    changefreq: 'weekly',
    priority: '0.8',
  },
  {
    loc: 'culture',
    changefreq: 'monthly',
    priority: '0.7',
  },
  {
    loc: 'quote',
    changefreq: 'weekly',
    priority: '0.8',
  },
  {
    loc: 'tour',
    changefreq: 'monthly',
    priority: '0.7',
  },
  {
    loc: 'blog',
    changefreq: 'daily',
    priority: '0.9',
  },
  {
    loc: 'pintefoils',
    changefreq: 'monthly',
    priority: '0.8',
  },
  {
    loc: 'seo-geo-sop',
    changefreq: 'monthly',
    priority: '0.5',
  },
  {
    loc: 'privacy',
    changefreq: 'yearly',
    priority: '0.3',
  },
  {
    loc: 'terms',
    changefreq: 'yearly',
    priority: '0.3',
  },
];

const productCategories = Object.keys(CONTENT_EN.PRODUCT_DATA);
const productItems = Array.from(new Set(
  Object.values(CONTENT_EN.CATALOG_DATA)
    .flat()
    .map((product) => product.id)
));
const solutions = Object.keys(CONTENT_EN.SOLUTIONS_DATA);
const guidePages = GEO_GUIDES.map((guide) => ({
  loc: `guides/${guide.slug}`,
  changefreq: 'monthly',
  priority: guide.priority <= 2 ? '0.9' : '0.8',
}));

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function trimText(value, maxLength = 180) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

function localizedCaption(caption, lang) {
  if (!caption) return '';
  return typeof caption === 'object' ? caption[lang] || caption.en || caption.cn || '' : caption;
}

function getNotionDate(page) {
  const props = page.properties || {};
  const dateProp = props['截止日期'] || props.Date || props.Published || props.published || props.LastEdited;
  return dateProp?.date?.start || page.last_edited_time?.split('T')[0] || new Date().toISOString().split('T')[0];
}

function notionPageToBlogSitemapEntry(page) {
  const slug = page.id.replace(/-/g, '');
  return {
    loc: `${siteUrl}/blog/${slug}`,
    lastmod: getNotionDate(page),
    changefreq: 'weekly',
    priority: 0.8,
  };
}

async function fetchBlogPagesFromNotion() {
  if (!notionDatabaseId) return [];

  const pages = [];
  let cursor;

  do {
    const response = await fetch(`https://api.pintecl.com/v1/data_sources/${notionDatabaseId}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Notion-Version': '2025-09-03',
      },
      body: JSON.stringify({
        page_size: 100,
        ...(cursor ? { start_cursor: cursor } : {}),
      }),
    });

    if (!response.ok) {
      throw new Error(`Notion proxy returned ${response.status}`);
    }

    const data = await response.json();
    pages.push(...(data.results || []).map(notionPageToBlogSitemapEntry));
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);

  return pages;
}

function readCachedBlogPages() {
  if (!fs.existsSync(blogSitemapPath)) return [];

  try {
    const blogSitemap = JSON.parse(fs.readFileSync(blogSitemapPath, 'utf8'));
    return Array.isArray(blogSitemap.pages) ? blogSitemap.pages : [];
  } catch (error) {
    console.warn('⚠️ Could not read cached blog sitemap:', error.message);
    return [];
  }
}

async function collectBlogPages() {
  try {
    const fetchedPages = await fetchBlogPagesFromNotion();

    if (fetchedPages.length > 0) {
      const pages = [
        {
          loc: `${siteUrl}/blog`,
          lastmod: new Date().toISOString().split('T')[0],
          changefreq: 'daily',
          priority: 0.9,
        },
        ...fetchedPages,
      ];

      fs.writeFileSync(blogSitemapPath, JSON.stringify({ pages }, null, 2), 'utf8');
      console.log(`✅ Refreshed blog sitemap cache with ${fetchedPages.length} Notion articles`);
      return pages;
    }
  } catch (error) {
    console.warn('⚠️ Could not refresh blog sitemap from Notion proxy:', error.message);
  }

  const cachedPages = readCachedBlogPages();
  console.log(`↩️ Using cached blog sitemap with ${Math.max(cachedPages.length - 1, 0)} articles`);
  return cachedPages;
}

// Generate XML sitemap
function generateSitemap(blogPages = []) {
  const today = new Date().toISOString().split('T')[0];
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

  const addUrl = ({ route, changefreq, priority, lastmod = today, images = [] }) => {
    languages.forEach((lang) => {
      const loc = `${siteUrl}${routePath(lang, route)}`;
      const enHref = `${siteUrl}${routePath('en', route)}`;
      const cnHref = `${siteUrl}${routePath('cn', route)}`;
      const imageXml = images
        .filter((image) => image?.loc)
        .map((image) => {
          const caption = localizedCaption(image.caption, lang);
          return `    <image:image>
      <image:loc>${escapeXml(image.loc)}</image:loc>${caption ? `
      <image:caption>${escapeXml(caption)}</image:caption>` : ''}
    </image:image>`;
        })
        .join('\n');

      xml += `  <url>
    <loc>${loc}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${enHref}" />
    <xhtml:link rel="alternate" hreflang="zh-CN" href="${cnHref}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${enHref}" />
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${imageXml ? `${imageXml}\n` : ''}  </url>
`;
    });
  };

  // Add static pages
  staticPages.forEach((page) => {
    addUrl({
      route: page.loc,
      changefreq: page.changefreq,
      priority: page.priority,
    });
  });

  guidePages.forEach((page) => {
    addUrl({
      route: page.loc,
      changefreq: page.changefreq,
      priority: page.priority,
    });
  });

  // Add product categories
  productCategories.forEach((categoryId) => {
    const product = CONTENT_EN.PRODUCT_DATA[categoryId];
    addUrl({
      route: `products/category/${categoryId}`,
      changefreq: 'weekly',
      priority: '0.8',
      images: product?.heroImage ? [{
        loc: product.heroImage,
        caption: {
          en: `${product.name} product roll for ${product.applications.join(', ')}. Compatible substrates include ${product.substrates.join(', ')}.`,
          cn: `${product.name} 产品卷料，适用于 ${product.applications.join('、')}，兼容底材包括 ${product.substrates.join('、')}。`,
        },
      }] : [],
    });
  });

  // Add product detail pages
  productItems.forEach((productId) => {
    let rawItem;
    let series;
    for (const [seriesId, items] of Object.entries(CONTENT_EN.CATALOG_DATA)) {
      const matched = items.find((item) => item.id === productId);
      if (matched) {
        rawItem = matched;
        series = CONTENT_EN.PRODUCT_DATA[seriesId];
        break;
      }
    }
    const item = rawItem ? mergeProductSeoProfile(rawItem, 'en') : undefined;
    addUrl({
      route: `products/item/${productId}`,
      changefreq: 'weekly',
      priority: '0.8',
      images: item?.image ? [{
        loc: item.image,
        caption: {
          en: `${item.imageAlt || item.name} - ${trimText(item.description || item.content || series?.description || '', 140)}`,
          cn: `${item.name} 产品图 - 适用于 ${(item.applications || series?.applications || []).join('、')}。`,
        },
      }] : [],
    });
  });

  // Add solution detail pages
  solutions.forEach((solutionId) => {
    addUrl({
      route: `solutions/${solutionId}`,
      changefreq: 'weekly',
      priority: '0.8',
    });
  });

  const addedBlogUrls = new Set();
  blogPages.forEach((page) => {
    if (page.loc && !addedBlogUrls.has(page.loc) && !page.loc.endsWith('/blog') && !page.loc.endsWith('/blog/')) {
      addedBlogUrls.add(page.loc);
      const route = page.loc
        .replace(siteUrl, '')
        .replace(/^\/(cn|en)\//, '')
        .replace(/^\/(cn|en)$/, '')
        .replace(/^\/+/, '')
        .replace(/\/+$/, '');

      if (route) {
        addUrl({
          route,
          lastmod: page.lastmod || today,
          changefreq: page.changefreq || 'weekly',
          priority: page.priority || '0.8',
        });
      }
    }
  });

  xml += '</urlset>';
  return xml;
}

// Write sitemap to file
async function writeSitemap() {
  console.log('🗺️ Generating XML sitemap...');

  try {
    const blogPages = await collectBlogPages();
    const sitemapXml = generateSitemap(blogPages);
    const outputPath = path.join(process.cwd(), 'public', 'sitemap.xml');

    fs.writeFileSync(outputPath, sitemapXml, 'utf8');
    console.log(`✅ XML sitemap generated successfully at: ${outputPath}`);

    // Count URLs
    const urlCount = (sitemapXml.match(/<url>/g) || []).length;
    console.log(`📊 Total URLs in sitemap: ${urlCount}`);

  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

// Generate robots.txt
function generateRobotsTxt() {
  const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');

  const robotsContent = `User-agent: *
Content-Signal: search=yes,ai-input=yes,ai-train=yes,use=full
Allow: /
Disallow: /api/

User-agent: Googlebot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: GoogleOther
Allow: /

User-agent: Bingbot
Allow: /

User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Bytespider
Allow: /

User-agent: Applebot
Allow: /

User-agent: CCBot
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: meta-externalagent
Allow: /

User-agent: Baiduspider
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

  fs.writeFileSync(robotsPath, robotsContent, 'utf8');
  console.log(`✅ robots.txt generated at: ${robotsPath}`);
}

function generateProductFeed() {
  const products = [];

  for (const [seriesId, series] of Object.entries(CONTENT_EN.PRODUCT_DATA)) {
    products.push({
      id: `series-${seriesId}`,
      title: series.name,
      description: series.description,
      link: `${siteUrl}/en/products/category/${seriesId}/`,
      image_link: series.heroImage,
      brand: 'PINTE',
      product_type: series.subtitle || 'Hot Stamping Foil',
      availability: 'in_stock',
      quote_url: `${siteUrl}/en/quote/`,
      substrates: series.substrates,
      applications: series.applications,
      colors: series.colors,
      specifications: series.params,
      recommended_temperature: series.temp,
      target_markets: ['Vietnam', 'Thailand', 'Malaysia', 'Indonesia', 'Singapore', 'Southeast Asia', 'United States', 'Europe'],
    });
  }

  for (const [seriesId, items] of Object.entries(CONTENT_EN.CATALOG_DATA)) {
    const series = CONTENT_EN.PRODUCT_DATA[seriesId];
    for (const item of items) {
      const enrichedItem = mergeProductSeoProfile(item, 'en');
      products.push({
        id: enrichedItem.id,
        title: enrichedItem.name,
        description: enrichedItem.content || enrichedItem.description,
        link: `${siteUrl}/en/products/item/${enrichedItem.id}/`,
        image_link: enrichedItem.image,
        image_alt: enrichedItem.imageAlt || enrichedItem.name,
        brand: 'PINTE',
        product_type: enrichedItem.subtitle || series?.name || 'Hot Stamping Foil',
        availability: 'in_stock',
        quote_url: `${siteUrl}/en/quote/`,
        series: series?.name,
        substrates: enrichedItem.compatibleSubstrates || series?.substrates || [],
        applications: enrichedItem.applications || series?.applications || [],
        colors: enrichedItem.colors || series?.colors || [],
        processes: enrichedItem.processes || [],
        tags: enrichedItem.tags || [],
        specifications: enrichedItem.specifications || enrichedItem.params || [],
        technical_parameters: enrichedItem.technicalParameters || [],
        quality_tests: enrichedItem.qualityTests || [],
        recommended_temperature: enrichedItem.temp || series?.temp,
        moq: enrichedItem.moq || 'MOQ depends on color, finish, roll width, and customization scope.',
        sample_policy: enrichedItem.samplePolicy || 'Sample rolls, color cards, slitting options, and substrate-based model recommendations are available before bulk orders.',
        customization_lead_time: enrichedItem.customizationLeadTime,
        faq: enrichedItem.faqs || [],
      });
    }
  }

  const outputPath = path.join(process.cwd(), 'public', 'product-feed.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    generated_at: new Date().toISOString(),
    merchant: 'PINTE',
    website: siteUrl,
    feed_type: 'b2b_hot_stamping_foil_catalog',
    note: 'Quote-based B2B catalog for AI/product discovery. Prices are omitted because orders require substrate, width, color, and sample confirmation.',
    products,
  }, null, 2), 'utf8');
  console.log(`✅ product-feed.json generated at: ${outputPath}`);
}

// Run both generators
await writeSitemap();
generateRobotsTxt();
generateProductFeed();

console.log('\n🎉 Sitemap generation complete!');
console.log(`📌 Next steps:
1. Test the sitemap at ${siteUrl}/sitemap.xml
2. Submit the sitemap to Google Search Console
3. Submit the sitemap to Bing Webmaster Tools
4. Submit with IndexNow after deployment`);
