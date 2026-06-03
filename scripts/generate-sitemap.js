/**
 * Complete Sitemap Generator for PINTE Website
 * Generates a proper XML sitemap with all pages
 * Run: node scripts/generate-sitemap.js
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const siteUrl = process.env.SITE_URL || 'https://www.pintecl.com';
const languages = ['cn', 'en'];
const routePath = (lang, route = '') => route ? `/${lang}/${route}/` : `/${lang}/`;

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

// Product categories (example - these should be dynamically generated from your product data)
const productCategories = [
  { id: 'general-hot-stamping', name: 'General Hot Stamping' },
  { id: 'holographic-films', name: 'Holographic Films' },
  { id: 'cold-foil', name: 'Cold Foil' },
  { id: 'metallized-films', name: 'Metallized Films' },
  { id: 'security-films', name: 'Security Films' },
  { id: 'PK', name: 'PK Brown Back Series' },
  { id: 'PC', name: 'PC Plastic/Cold Foils' },
  { id: 'PLPY', name: 'PL/PY Pigment Foils' },
  { id: 'DIGITAL', name: 'Digital Cold Foils' },
  { id: 'GLITTER', name: 'Glitter Powder' },
];

// Solutions (example - these should be dynamically generated from your solution data)
const solutions = [
  { id: 'cosmetics-packaging', name: 'Cosmetics Packaging' },
  { id: 'wine-spirits', name: 'Wine & Spirits' },
  { id: 'pharmaceutical', name: 'Pharmaceutical' },
  { id: 'tobacco', name: 'Tobacco' },
  { id: 'gift-cards', name: 'Gift Cards' },
];

// Product items (example - these should be dynamically generated from your product data)
const products = [
  { id: 'premium-gold-foil', name: 'Premium Gold Foil' },
  { id: 'silver-metallic', name: 'Silver Metallic' },
  { id: 'holographic-pattern', name: 'Holographic Pattern' },
  { id: 'cold-foil-uv', name: 'Cold Foil UV' },
  { id: 'PK-Universal', name: 'PK Universal Foil' },
];

// Generate XML sitemap
function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

  const addUrl = ({ route, changefreq, priority, lastmod = today }) => {
    languages.forEach((lang) => {
      const loc = `${siteUrl}${routePath(lang, route)}`;
      const enHref = `${siteUrl}${routePath('en', route)}`;
      const cnHref = `${siteUrl}${routePath('cn', route)}`;

      xml += `  <url>
    <loc>${loc}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${enHref}" />
    <xhtml:link rel="alternate" hreflang="zh-CN" href="${cnHref}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${enHref}" />
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>
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

  // Add product categories
  productCategories.forEach((category) => {
    addUrl({
      route: `products/category/${category.id}`,
      changefreq: 'weekly',
      priority: '0.8',
    });
  });

  // Add product detail pages
  products.forEach((product) => {
    addUrl({
      route: `products/item/${product.id}`,
      changefreq: 'weekly',
      priority: '0.8',
    });
  });

  // Add solution detail pages
  solutions.forEach((solution) => {
    addUrl({
      route: `solutions/${solution.id}`,
      changefreq: 'weekly',
      priority: '0.8',
    });
  });

  // Add blog articles from sitemap-blog.json if it exists
  const blogSitemapPath = path.join(process.cwd(), 'public', 'sitemap-blog.json');
  if (fs.existsSync(blogSitemapPath)) {
    try {
      const blogSitemap = JSON.parse(fs.readFileSync(blogSitemapPath, 'utf8'));
      const addedBlogUrls = new Set(); // Track to avoid duplicates

      if (blogSitemap.pages && Array.isArray(blogSitemap.pages)) {
        blogSitemap.pages.forEach((page) => {
          // Skip duplicates and the main blog page (already added)
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
      }
    } catch (error) {
      console.warn('⚠️ Could not read blog sitemap:', error.message);
    }
  }

  xml += '</urlset>';
  return xml;
}

// Write sitemap to file
function writeSitemap() {
  console.log('🗺️ Generating XML sitemap...');

  try {
    const sitemapXml = generateSitemap();
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

Sitemap: ${siteUrl}/sitemap.xml
`;

  fs.writeFileSync(robotsPath, robotsContent, 'utf8');
  console.log(`✅ robots.txt generated at: ${robotsPath}`);
}

// Run both generators
writeSitemap();
generateRobotsTxt();

console.log('\n🎉 Sitemap generation complete!');
console.log(`📌 Next steps:
1. Test the sitemap at ${siteUrl}/sitemap.xml
2. Submit the sitemap to Google Search Console
3. Submit the sitemap to Bing Webmaster Tools
4. Submit with IndexNow after deployment`);
