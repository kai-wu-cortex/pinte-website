/**
 * 预渲染插件 - 构建时生成静态 SEO 页面
 * 用于解决 SEO 问题：让搜索引擎能看到完整内容
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

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

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

function buildSeoSnapshotHtml(route: string, lang: 'cn' | 'en', meta?: { title: string; description: string }): string {
  const isCn = lang === 'cn';
  const title = meta?.title || (isCn ? 'PINTE 品特烫金箔' : 'PINTE Hot Stamping Foils');
  const description = meta?.description || (isCn
    ? 'PINTE 品特是中国东莞高端烫金箔制造商，供应烫金膜、冷烫箔、数码冷烫箔、颜料箔和全息烫金箔。'
    : 'PINTE is a Dongguan China manufacturer of premium hot stamping foil, cold foil, digital foil, pigment foil, and holographic foil.');
  const prefix = `/${lang}`;
  const routePath = route ? `${prefix}/${route}` : prefix;

  const products = isCn
    ? [
        ['PK 粗面烫金箔', `${prefix}/products/category/PK`],
        ['PC 塑胶与冷烫箔', `${prefix}/products/category/PC`],
        ['PL/PY 颜料箔', `${prefix}/products/category/PLPY`],
        ['数码冷烫箔', `${prefix}/products/category/DIGITAL`],
      ]
    : [
        ['PK Brown Back Rough Surface Foil', `${prefix}/products/category/PK`],
        ['PC Plastic and Cold Foils', `${prefix}/products/category/PC`],
        ['PL/PY Pigment Foils', `${prefix}/products/category/PLPY`],
        ['Digital Cold Foil', `${prefix}/products/category/DIGITAL`],
      ];
  const solutions = isCn
    ? [
        ['化妆品包装烫金解决方案', `${prefix}/solutions/cosmetics-packaging`],
        ['酒类包装烫金解决方案', `${prefix}/solutions/wine-spirits`],
        ['医药包装烫金解决方案', `${prefix}/solutions/pharmaceutical`],
      ]
    : [
        ['Cosmetics Packaging Foil Solutions', `${prefix}/solutions/cosmetics-packaging`],
        ['Wine and Spirits Packaging Foil Solutions', `${prefix}/solutions/wine-spirits`],
        ['Pharmaceutical Packaging Foil Solutions', `${prefix}/solutions/pharmaceutical`],
      ];

  return `
    <main class="seo-snapshot" data-route="${escapeHtml(routePath)}">
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(description)}</p>
      <section>
        <h2>${isCn ? '核心产品' : 'Core Products'}</h2>
        <ul>
          ${products.map(([label, href]) => `<li><a href="${href}">${escapeHtml(label)}</a></li>`).join('')}
        </ul>
      </section>
      <section>
        <h2>${isCn ? '应用方案' : 'Application Solutions'}</h2>
        <ul>
          ${solutions.map(([label, href]) => `<li><a href="${href}">${escapeHtml(label)}</a></li>`).join('')}
        </ul>
      </section>
      <p>${isCn
        ? '目标市场包括中国、越南、泰国、马来西亚、印尼、新加坡、欧洲和北美。'
        : 'Target markets include China, Vietnam, Thailand, Malaysia, Indonesia, Singapore, Europe, and North America.'}</p>
    </main>
  `.trim();
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
  async writeBundle() {
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
      'products/category/general-hot-stamping',
      'products/category/holographic-films',
      'products/category/cold-foil',
      'products/category/metallized-films',
      'products/category/security-films',
      'products/category/PK',
      'products/category/PC',
      'products/category/PLPY',
      'products/category/DIGITAL',
      'products/category/GLITTER',
      'products/item/premium-gold-foil',
      'products/item/silver-metallic',
      'products/item/holographic-pattern',
      'products/item/cold-foil-uv',
      'products/item/PK-Universal',
      'pintefoils',
      'culture',
      'quote',
      'tour',
      'blog',
      'solutions/cosmetics-packaging',
      'solutions/wine-spirits',
      'solutions/pharmaceutical',
      'solutions/tobacco',
      'solutions/gift-cards',
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
      // Product Categories
      'products/category/general-hot-stamping': {
        cn: {
          title: '普通烫金箔系列 - PINTE品特烫金箔',
          description: 'PINTE普通烫金箔系列产品，适用于多种包装印刷应用，提供稳定的烫印效果和优异的附着力，满足常规烫金加工需求。',
        },
        en: {
          title: 'General Hot Stamping Foils - PINTE',
          description: 'PINTE general hot stamping foil series for various packaging and printing applications, providing stable stamping performance and excellent adhesion for standard hot stamping requirements.',
        },
      },
      'products/category/holographic-films': {
        cn: {
          title: '全息烫金箔系列 - PINTE品特烫金箔',
          description: 'PINTE全息烫金箔系列，具有独特的光学效果和防伪特性，广泛应用于高端包装、品牌防伪和装饰烫金，提升产品视觉吸引力。',
        },
        en: {
          title: 'Holographic Foils - PINTE Hot Stamping',
          description: 'PINTE holographic foil series with unique optical effects and security features, widely used for premium packaging, brand authentication and decorative hot stamping to enhance product visual appeal.',
        },
      },
      'products/category/cold-foil': {
        cn: {
          title: '冷烫箔系列 - PINTE品特数码冷烫箔',
          description: 'PINTE冷烫箔系列专为数码印刷设计，不需要烫金版，适合短版活和个性化包装，提供高质量烫金效果于传统印刷工艺。',
        },
        en: {
          title: 'Cold Foil Series - PINTE Digital Cold Foil',
          description: 'PINTE cold foil series designed for digital printing, no hot stamping cylinder required, suitable for short runs and personalized packaging, delivering high quality foil effects with conventional printing processes.',
        },
      },
      'products/category/metallized-films': {
        cn: {
          title: '金属化烫金箔 - PINTE电镀烫金箔',
          description: 'PINTE金属化烫金箔具有优异的金属光泽度和遮盖力，适用于各类高档包装材料，提供持久的金属质感和光泽效果。',
        },
        en: {
          title: 'Metallized Foils - PINTE Electroplated Foil',
          description: 'PINTE metallized hot stamping foils offer excellent metallic luster and coverage, suitable for various high-end packaging materials, providing long-lasting metallic texture and gloss effects.',
        },
      },
      'products/category/security-films': {
        cn: {
          title: '防伪烫金箔 - PINTE安全防伪烫金材料',
          description: 'PINTE防伪烫金箔系列提供多种防伪技术，包括全息图案、微文字、变色效果等，帮助品牌保护知识产权，防止假冒伪劣产品。',
        },
        en: {
          title: 'Security Foils - PINTE Anti-Counterfeiting Foil',
          description: 'PINTE security hot stamping foils feature multiple anti-counterfeiting technologies including holographic patterns, micro-text, color-changing effects, helping brands protect intellectual property and prevent counterfeit products.',
        },
      },
      'products/category/PK': {
        cn: {
          title: 'PK粗面烫金箔系列 - PINTE粗表面专用烫金箔',
          description: 'PK咖啡底系列专为粗糙不平整表面设计的烫金箔，特别适合粗纹纸、压纹皮革、特种纸等难烫材料，特有抗氧化涂层保证重油墨纸张烫后光泽不发黑。东莞品特专业生产，供应东南亚市场。',
        },
        en: {
          title: 'PK Rough Surface Foil - PINTE Specialized Foil for Rough Surfaces',
          description: 'PK Brown Back series hot stamping foil designed for rough and uneven surfaces, specially for rough paper, embossed leather, specialty paper. Special anti-oxidation coating maintains gloss on heavy ink paper. Professional manufacturer from Dongguan China, supplying Southeast Asia market.',
        },
      },
      'products/category/PC': {
        cn: {
          title: 'PC塑胶烫金箔系列 - PINTE化妆品包材专用',
          description: 'PC系列专为塑胶材质设计，支持ABS、PS、PVC、亚克力等多种塑胶，优异耐酒精性能，完美通过百格测试，是化妆品包材烫金的最佳选择。',
        },
        en: {
          title: 'PC Plastic Foil - PINTE Cosmetic Packaging Foil',
          description: 'PC series hot stamping foil specially engineered for plastic materials, supports ABS, PS, PVC, acrylic and other plastics. Excellent alcohol resistance, passes cross-cut test perfectly, ideal for cosmetic packaging hot stamping.',
        },
      },
      'products/category/PLPY': {
        cn: {
          title: 'PLPY颜料烫金箔系列 - PINTE高遮盖力纯正色彩',
          description: 'PL/PY颜料箔是以颜料为原料的非镀铝产品，解决印刷油墨遮盖力不足问题，色彩饱满呈现纯正色彩，适合各种纸质基材和礼品包装。',
        },
        en: {
          title: 'PLPY Pigment Foil - PINTE High Coverage Pure Color',
          description: 'PL/PY pigment foils are non-aluminized products using pigment as raw material, solves insufficient ink coverage problem, provides full and pure colors, suitable for various paper substrates and gift packaging.',
        },
      },
      'products/category/DIGITAL': {
        cn: {
          title: '数码冷烫箔系列 - PINTE无需制版个性化烫金',
          description: '数码冷烫系列无需制版，直接在UV光油或数码墨层上进行固化转移，适合个性化定制与小批量生产，适配MGI、Scodix等数码增效设备。',
        },
        en: {
          title: 'Digital Cold Foil - PINTE Plate-Free Personalization',
          description: 'Digital cold foil series requires no plate making, direct curing transfer on UV varnish or digital toner layers, ideal for personalization and short-run production, compatible with MGI, Scodix and other digital enhancement equipment.',
        },
      },
      'products/category/GLITTER': {
        cn: {
          title: '金葱粉系列 - PINTE高温耐溶剂高品质闪粉',
          description: '品特25年生产经验金葱粉，六角形切片，耐高温耐溶剂，光泽持久不褪色，规格齐全从1/4英寸到1/500英寸，适合圣诞饰品、美甲、丝网印刷等应用。',
        },
        en: {
          title: 'Glitter Powder - PINTE Premium Heat Solvent Resistant Glitter',
          description: 'PINTE premium glitter powder with 25 years production experience, hexagonal cut, heat and solvent resistant, long-lasting shine no fading. Full range of sizes from 1/4" to 1/500", suitable for Christmas decorations, nail art, screen printing and more.',
        },
      },
      // Product Items
      'products/item/premium-gold-foil': {
        cn: {
          title: '特级金烫金箔 - PINTE高档金色烫金箔',
          description: 'PINTE特级金烫金箔，纯正黄金光泽，高遮盖力，适用于高端礼品包装、化妆品盒、烟酒包装，创造奢华高贵的视觉效果。',
        },
        en: {
          title: 'Premium Gold Foil - PINTE Luxury Gold Hot Stamping',
          description: 'PINTE premium gold hot stamping foil with pure gold luster and high coverage, ideal for premium gift packaging, cosmetic boxes, wine and tobacco packaging, creating a luxurious and noble visual effect.',
        },
      },
      'products/item/silver-metallic': {
        cn: {
          title: '银色素烫金箔 - PINTE金属银色烫金箔',
          description: 'PINTE银色素烫金箔，纯净银白色泽，优异的金属质感，适用于现代简约风格包装设计，提升产品高端气质。',
        },
        en: {
          title: 'Silver Metallic Foil - PINTE Silver Hot Stamping Foil',
          description: 'PINTE silver metallic hot stamping foil with pure silver color and excellent metallic texture, suitable for modern minimalist packaging design, enhancing the premium feel of products.',
        },
      },
      'products/item/holographic-pattern': {
        cn: {
          title: '全息图案烫金箔 - PINTE定制全息烫金箔',
          description: 'PINTE定制全息图案烫金箔，可根据客户需求设计特定全息纹样，具有动态光影效果和品牌防伪功能，为产品增添独特视觉吸引力。',
        },
        en: {
          title: 'Holographic Pattern Foil - PINTE Custom Holographic Foil',
          description: 'PINTE custom holographic pattern hot stamping foil, customizable with specific holographic designs according to customer requirements, featuring dynamic light effects and brand security, adding unique visual appeal to products.',
        },
      },
      'products/item/cold-foil-uv': {
        cn: {
          title: 'UV数码冷烫箔 - PINTE紫外线固化冷烫箔',
          description: 'PINTE UV数码冷烫箔专为UV印刷工艺设计，附着力强，烫印清晰，适合高速轮转印刷，提高生产效率，获得优质烫金效果。',
        },
        en: {
          title: 'Cold Foil UV - PINTE UV Curable Digital Cold Foil',
          description: 'PINTE UV curable digital cold foil designed for UV printing processes with strong adhesion and clear stamping, suitable for high-speed rotary printing, improving production efficiency and achieving excellent foil results.',
        },
      },
      'products/item/PK-Universal': {
        cn: {
          title: 'PK 通用型烫金箔 - PINTE PK Universal 经典全能烫金箔',
          description: 'PK 通用型是品特最畅销的烫金箔产品，经典配方优异通用性，在铜版纸、白卡纸、OPP复膜上都能提供出色光泽度和附着力，广泛适用于各类包装印刷，是印刷厂常备库存首选。',
        },
        en: {
          title: 'PK Universal Foil - PINTE Classic All-Round Hot Stamping Foil',
          description: 'PK Universal is one of PINTE best-selling hot stamping foils with excellent versatility. Provides outstanding gloss and adhesion on coated paper, cardboard, and OPP laminates, making it the top choice for general packaging applications.',
        },
      },
      // Solutions
      'solutions/cosmetics-packaging': {
        cn: {
          title: '化妆品包装烫金解决方案 - PINTE化妆品烫金箔',
          description: 'PINTE为化妆品包装提供专业烫金解决方案，包括口红管、香水瓶、面霜盒等不同部位烫金箔，满足耐酒精、耐磨擦等特殊要求，提升化妆品包装档次。',
        },
        en: {
          title: 'Cosmetics Packaging Solutions - PINTE Hot Stamping Foils',
          description: 'PINTE provides professional hot stamping foil solutions for cosmetics packaging including lipstick tubes, perfume bottles, cream jars, meeting special requirements such as alcohol resistance and abrasion resistance, elevating cosmetics packaging quality.',
        },
      },
      'solutions/wine-spirits': {
        cn: {
          title: '酒类包装烫金解决方案 - PINTE烟酒烫金箔',
          description: 'PINTE为葡萄酒、烈酒、香烟包装提供专业烫金解决方案，创造高贵奢华的品牌形象，符合高速自动化烫金生产，提供稳定一致的烫印效果。',
        },
        en: {
          title: 'Wine & Spirits Packaging - PINTE Hot Stamping Solutions',
          description: 'PINTE provides professional hot stamping foil solutions for wine, spirits and tobacco packaging, creating a noble and luxurious brand image, compatible with high-speed automatic stamping production, delivering consistent and stable results.',
        },
      },
      'solutions/pharmaceutical': {
        cn: {
          title: '药品包装烫金解决方案 - PINTE医药包装烫金箔',
          description: 'PINTE为医药包装提供符合标准的烫金箔解决方案，严格符合药品包装安全规范，提供美观烫金效果同时满足法规要求，提升药品包装品质。',
        },
        en: {
          title: 'Pharmaceutical Packaging - PINTE Hot Stamping Solutions',
          description: 'PINTE provides compliant hot stamping foil solutions for pharmaceutical packaging, strictly meeting pharmaceutical packaging safety regulations, delivering beautiful foil effects while satisfying regulatory requirements and enhancing packaging quality.',
        },
      },
      'solutions/tobacco': {
        cn: {
          title: '烟草包装烫金解决方案 - PINTE烟包烫金箔',
          description: 'PINTE为烟草包装提供专业烫金解决方案，适用于高速卷烟生产线，具有优异的烫印性能和耐磨性能，帮助烟草品牌创造高端视觉形象。',
        },
        en: {
          title: 'Tobacco Packaging - PINTE Hot Stamping Foil Solutions',
          description: 'PINTE provides professional hot stamping foil solutions for tobacco packaging, suitable for high-speed cigarette production lines with excellent stamping performance and abrasion resistance, helping tobacco brands create premium visual identity.',
        },
      },
      'solutions/gift-cards': {
        cn: {
          title: '礼品卡烫金解决方案 - PINTE礼品卡烫金箔应用',
          description: 'PINTE为礼品卡、优惠券、贺卡提供专业烫金解决方案，创造精美的烫金装饰效果，提升礼品卡档次和收礼体验，适合各类节日礼品和促销活动。',
        },
        en: {
          title: 'Gift Cards Packaging - PINTE Hot Stamping Solutions',
          description: 'PINTE provides professional hot stamping foil solutions for gift cards, coupons and greeting cards, creating exquisite decorative foil effects that elevate the gift card class and gifting experience, perfect for holiday gifts and promotional campaigns.',
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

          html = html.replace(
            '<div id="root"></div>',
            `<div id="root">${buildSeoSnapshotHtml(route, lang, meta)}</div>`
          );

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
      await prerender.writeBundle();
    } catch (e) {
      // Ignore - files are already generated successfully
    } finally {
      // Always exit with 0 since all files are already created
      process.exit(0);
    }
  }
})();
