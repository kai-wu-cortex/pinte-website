/**
 * Notion Blog Sync Script
 * 获取Notion数据库中的博客文章并生成静态JSON
 * 运行: node scripts/fetch-blog.js
 */

import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

// 确保必要的环境变量
if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
  console.error('❌ 请在 .env.local 中配置 NOTION_API_KEY 和 NOTION_DATABASE_ID');
  console.log('\n📝 配置步骤:');
  console.log('1. 访问 https://www.notion.so/my-integrations 创建Integration');
  console.log('2. 获取 NOTION_API_KEY (Internal Integration Token)');
  console.log('3. 在Notion数据库页面添加Integration访问权限');
  console.log('4. 获取数据库ID (URL中 ?xxx= 后面的32位字符串)');
  process.exit(1);
}

const notion = new Client({ auth: NOTION_API_KEY });
const n2m = new NotionToMarkdown({ notionClient: notion });

// 博客数据输出目录
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'blog');
const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'blog.json');

// 确保目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * 将Notion属性转换为标准格式
 */
function parseProperties(page) {
  const props = page.properties;
  
  // 获取标题
  const getTitle = (prop) => {
    if (!prop) return '';
    if (prop.type === 'title') {
      return prop.title?.[0]?.plain_text || '';
    }
    return '';
  };

  // 获取富文本
  const getRichText = (prop) => {
    if (!prop) return '';
    if (prop.type === 'rich_text') {
      return prop.rich_text?.[0]?.plain_text || '';
    }
    return '';
  };

  // 获取日期
  const getDate = (prop) => {
    if (!prop) return null;
    if (prop.type === 'date') {
      return prop.date?.start || null;
    }
    return null;
  };

  // 获取多选标签
  const getMultiSelect = (prop) => {
    if (!prop) return [];
    if (prop.type === 'multi_select') {
      return prop.multi_select?.map(item => item.name) || [];
    }
    return [];
  };

  // 获取单选
  const getSelect = (prop) => {
    if (!prop) return null;
    if (prop.type === 'select') {
      return prop.select?.name || null;
    }
    return null;
  };

  // 获取文件/图片
  const getFiles = (prop) => {
    if (!prop) return [];
    if (prop.type === 'files') {
      return prop.files?.map(file => ({
        name: file.name,
        url: file.file?.url || file.external?.url || ''
      })) || [];
    }
    return [];
  };

  // 获取摘要/描述
  const getSummary = () => {
    // 尝试从摘要字段获取，否则从内容中截取
    const summaryProp = props.Summary || props.Description || props.excerpt;
    if (summaryProp) {
      return getRichText(summaryProp);
    }
    return '';
  };

  // 生成slug
  const getSlug = () => {
    const slugProp = props.Slug || props.slug;
    if (slugProp) {
      return getRichText(slugProp);
    }
    // 从标题生成slug
    const title = getTitle(props.Name || props.Title || props.title);
    return title.toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // SEO字段
  const getSEO = () => {
    return {
      title: getRichText(props.SEO_Title || props['SEO Title']) || getTitle(props.Name || props.Title),
      description: getRichText(props.SEO_Description || props['SEO Description']) || getSummary(),
      keywords: getMultiSelect(props.SEO_Keywords || props.Keywords || props.keywords),
      ogImage: getFiles(props.OG_Image || props['OG Image'])?.[0]?.url || '',
    };
  };

  // GEO字段
  const getGEO = () => {
    return {
      region: getSelect(props.GEO_Region || props.Region || props.geo),
      language: getSelect(props.GEO_Language || props.Language || props.lang),
      locality: getRichText(props.GEO_Locality || props.Locality),
    };
  };

  return {
    id: page.id,
    title: getTitle(props.Name || props.Title || props.title),
    slug: getSlug(),
    summary: getSummary(),
    cover: page.cover?.external?.url || page.cover?.file?.url || '',
    date: getDate(props.Date || props.Published || props.published),
    author: getRichText(props.Author || props.author),
    category: getMultiSelect(props.Category || props.categories),
    tags: getMultiSelect(props.Tags || props.tag),
    status: getSelect(props.Status || props.status || props.publish),
    seo: getSEO(),
    geo: getGEO(),
  };
}

/**
 * 获取页面内容并转换为Markdown
 */
async function getPageContent(pageId) {
  try {
    const mdblocks = await n2m.pageToMarkdown(pageId);
    const mdString = n2m.toMarkdownString(mdblocks);
    return mdString.parent;
  } catch (error) {
    console.error(`❌ 获取内容失败: ${pageId}`, error.message);
    return '';
  }
}

/**
 * 生成结构化数据 (JSON-LD)
 */
function generateSchema(article, siteUrl) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.summary,
    "image": article.cover,
    "datePublished": article.date,
    "dateModified": article.date,
    "author": {
      "@type": "Organization",
      "name": "PINTE"
    },
    "publisher": {
      "@type": "Organization",
      "name": "PINTE",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${siteUrl}/blog/${article.slug}`
    },
    "articleSection": article.category?.[0] || 'Blog',
    "keywords": article.tags?.join(', '),
    "inLanguage": article.geo?.language || 'en-US',
    "spatial": article.geo?.region ? {
      "@type": "Place",
      "name": article.geo.region
    } : undefined
  };
}

/**
 * 生成sitemap条目
 */
function generateSitemapEntry(article, siteUrl) {
  return {
    loc: `${siteUrl}/blog/${article.slug}`,
    lastmod: article.date,
    changefreq: 'weekly',
    priority: 0.8,
    images: article.cover ? [article.cover] : []
  };
}

/**
 * 主函数：同步博客
 */
async function syncBlog() {
  console.log('🔄 开始同步Notion博客...\n');

  const siteUrl = process.env.SITE_URL || 'https://www.pintecl.com';
  
  try {
    // 1. 查询数据库中的所有博客文章
    console.log('📡 连接Notion数据库...');
    
    const response = await notion.databases.query({
      database_id: NOTION_DATABASE_ID,
      page_size: 100
    });

    console.log(`✅ 找到 ${response.results.length} 篇文章\n`);

    const articles = [];
    const sitemapEntries = [];
    const schemas = [];

    // 2. 处理每篇文章
    for (const page of response.results) {
      console.log(`📝 处理: ${page.id}`);
      
      const article = parseProperties(page);
      
      // 只有已发布的文章才获取内容
      if (article.status === 'Published' || article.status === 'published') {
        article.content = await getPageContent(page.id);
      }
      
      articles.push(article);
      
      // 生成SEO数据
      sitemapEntries.push(generateSitemapEntry(article, siteUrl));
      schemas.push(generateSchema(article, siteUrl));
    }

    // 3. 保存博客数据
    const blogData = {
      articles: articles.map(a => ({
        ...a,
        content: undefined // 不在列表中包含完整内容
      })),
      lastSync: new Date().toISOString(),
      totalCount: articles.length
    };

    // 确保目标目录存在
    const srcDataDir = path.dirname(DATA_FILE);
    if (!fs.existsSync(srcDataDir)) {
      fs.mkdirSync(srcDataDir, { recursive: true });
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(blogData, null, 2));
    console.log(`\n✅ 博客列表已保存: ${DATA_FILE}`);

    // 4. 为每篇文章生成静态HTML页面
    console.log('\n🏗️ 生成静态页面...');
    
    for (const article of articles) {
      if (article.status !== 'Published' && article.status !== 'published') continue;
      
      // 获取完整内容
      const fullArticle = {
        ...article,
        content: await getPageContent(article.id)
      };

      const articleData = {
        ...fullArticle,
        schema: generateSchema(fullArticle, siteUrl)
      };

      const articleFile = path.join(OUTPUT_DIR, `${article.slug}.json`);
      fs.writeFileSync(articleFile, JSON.stringify(articleData, null, 2));
    }

    console.log(`✅ 静态页面已生成: ${OUTPUT_DIR}`);

    // 5. 生成sitemap
    const sitemap = {
      site: siteUrl,
      pages: [
        { loc: `${siteUrl}/blog`, changefreq: 'daily', priority: 0.9 },
        ...sitemapEntries
      ]
    };

    fs.writeFileSync(
      path.join(process.cwd(), 'public', 'sitemap-blog.json'), 
      JSON.stringify(sitemap, null, 2)
    );
    console.log('✅ Sitemap已生成');

    // 6. 生成SEO汇总报告
    const seoReport = {
      generated: new Date().toISOString(),
      totalArticles: articles.length,
      byCategory: articles.reduce((acc, art) => {
        art.category?.forEach(cat => {
          acc[cat] = (acc[cat] || 0) + 1;
        });
        return acc;
      }, {}),
      byRegion: articles.reduce((acc, art) => {
        const region = art.geo?.region || 'Global';
        acc[region] = (acc[region] || 0) + 1;
        return acc;
      }, {}),
      byLanguage: articles.reduce((acc, art) => {
        const lang = art.geo?.language || 'en-US';
        acc[lang] = (acc[lang] || 0) + 1;
        return acc;
      }, {})
    };

    fs.writeFileSync(
      path.join(process.cwd(), 'public', 'blog-seo-report.json'), 
      JSON.stringify(seoReport, null, 2)
    );
    console.log('✅ SEO报告已生成');

    console.log('\n🎉 博客同步完成!');
    console.log(`📊 共同步 ${articles.length} 篇文章\n`);

  } catch (error) {
    console.error('❌ 同步失败:', error);
    process.exit(1);
  }
}

// 运行同步
syncBlog();
