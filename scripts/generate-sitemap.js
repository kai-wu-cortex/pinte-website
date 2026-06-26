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

  guidePages.forEach((page) => {
    addUrl({
      route: page.loc,
      changefreq: page.changefreq,
      priority: page.priority,
    });
  });

  // Add product categories
  productCategories.forEach((categoryId) => {
    addUrl({
      route: `products/category/${categoryId}`,
      changefreq: 'weekly',
      priority: '0.8',
    });
  });

  // Add product detail pages
  productItems.forEach((productId) => {
    addUrl({
      route: `products/item/${productId}`,
      changefreq: 'weekly',
      priority: '0.8',
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
Disallow: /

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
      products.push({
        id: item.id,
        title: item.name,
        description: item.content || item.description,
        link: `${siteUrl}/en/products/item/${item.id}/`,
        image_link: item.image,
        brand: 'PINTE',
        product_type: item.subtitle || series?.name || 'Hot Stamping Foil',
        availability: 'in_stock',
        quote_url: `${siteUrl}/en/quote/`,
        series: series?.name,
        substrates: series?.substrates || [],
        applications: item.applications || series?.applications || [],
        tags: item.tags || [],
        specifications: item.params || [],
        recommended_temperature: item.temp || series?.temp,
        sample_policy: 'Sample rolls, color cards, slitting options, and substrate-based model recommendations are available before bulk orders.',
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
writeSitemap();
generateRobotsTxt();
generateProductFeed();

console.log('\n🎉 Sitemap generation complete!');
console.log(`📌 Next steps:
1. Test the sitemap at ${siteUrl}/sitemap.xml
2. Submit the sitemap to Google Search Console
3. Submit the sitemap to Bing Webmaster Tools
4. Submit with IndexNow after deployment`);
