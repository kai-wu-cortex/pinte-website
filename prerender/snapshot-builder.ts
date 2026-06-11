/**
 * Snapshot builder — 预渲染 SEO/GEO 文本块生成器
 *
 * 给每个静态路由 + blog 详情页输出:
 *   - <main class="seo-snapshot"> ... HTML 文本块,带:H1、lead、行业痛点段落、规格、应用、FAQ、相关链接、GEO 标识
 *   - JSON-LD 数组(BreadcrumbList + 路由对应的主 schema: Product / Service / FAQPage / AboutPage / Article …)
 *
 * 所有材料均来自仓库已有数据源(data/content.ts + scripts/seo-geo-sop.config.mjs),不编造规格。
 *
 * 设计原则:
 *   - 纯函数:输入 (route, lang, ctx),输出 { html, jsonLd, meta }。
 *   - 文本面向 AI 搜索/GEO 优化:"痛点 → 方案 → 参数/场景 → 内链"四段式。
 *   - title/description/keywords 也由本模块产出,prerender.ts 仅做注入。
 */

import { CONTENT_EN, CONTENT_ZH } from '../data/content.js';
// @ts-ignore - .mjs 配置文件,无类型声明
import seoSop from '../scripts/seo-geo-sop.config.mjs';
import { t, htmlLangAttr, type Lang } from './i18n.js';

// Inline schema helpers — 不从 SEOMeta.tsx import,避免 TSX 在 prerender tsc 里报错。
// 与 components/SEOMeta.tsx 中同名 helper 保持一致。
function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function generateArticleSchema(article: {
  title: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  url: string;
  category?: string[];
  tags?: string[];
  geo?: { region?: string; language?: string; locality?: string };
}) {
  const siteUrl = 'https://www.pintecl.com';
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image
      ? article.image.startsWith('http')
        ? article.image
        : `${siteUrl}${article.image}`
      : `${siteUrl}/og-image.jpg`,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: { '@type': 'Organization', name: article.author || 'PINTE' },
    publisher: {
      '@type': 'Organization',
      name: 'PINTE',
      logo: { '@type': 'ImageObject', url: `${siteUrl}/logo.png` },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}${article.url}`,
    },
    articleSection: article.category?.[0] || 'Blog',
    keywords: article.tags?.join(', '),
    inLanguage: article.geo?.language || 'en-US',
  };
}

// ----------------------------- Types & helpers ----------------------------- //

interface SeoPage {
  url: string;
  owner: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  geoTargets: string[];
}

export interface SnapshotResult {
  html: string;
  jsonLd: Record<string, unknown>[];
  meta: {
    title: string;
    description: string;
    keywords: string[];
    geoTargets: string[];
    image?: string;
    type?: 'website' | 'article';
    publishedTime?: string;
  };
}

export interface BlogArticleLike {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  cover?: string;
  date?: string;
  contentMarkdown?: string;
}

const SITE = 'https://www.pintecl.com';

const escapeHtml = (value: string) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const trim = (s: string, max: number) =>
  s.length <= max ? s : s.slice(0, max - 1).trimEnd() + '…';

const getContent = (lang: Lang) => (lang === 'cn' ? CONTENT_ZH : CONTENT_EN);

const langPrefix = (lang: Lang) => `/${lang}`;

const buildCanonicalUrl = (route: string, lang: Lang) => {
  const pathPart = route ? `/${route}/` : '/';
  return `${SITE}/${lang}${pathPart}`;
};

const langPath = (route: string, lang: Lang) =>
  route ? `${langPrefix(lang)}/${route}` : langPrefix(lang);

// ----------------------------- SEO config lookup ----------------------------- //

const seoPagesByCanonical: Map<string, SeoPage> = new Map();
for (const p of (seoSop?.pages ?? []) as SeoPage[]) {
  seoPagesByCanonical.set(p.url.replace(/\/$/, ''), p);
}

function lookupSeoPage(route: string, lang: Lang): SeoPage | undefined {
  const url = buildCanonicalUrl(route, lang).replace(/\/$/, '');
  return seoPagesByCanonical.get(url);
}

const defaultGeoTargets = ['Vietnam', 'Thailand', 'Malaysia', 'Indonesia', 'Southeast Asia'];

// ----------------------------- HTML building blocks ----------------------------- //

const linkList = (items: Array<{ label: string; href: string }>) =>
  `<ul>${items
    .map((it) => `<li><a href="${escapeHtml(it.href)}">${escapeHtml(it.label)}</a></li>`)
    .join('')}</ul>`;

const dlList = (pairs: Array<{ label: string; value: string }>) =>
  `<dl>${pairs
    .map(
      (p) =>
        `<dt>${escapeHtml(p.label)}</dt><dd>${escapeHtml(p.value)}</dd>`
    )
    .join('')}</dl>`;

const ul = (items: string[]) =>
  `<ul>${items.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul>`;

const faqHtml = (lang: Lang, items: Array<{ q: string; a: string }>) => {
  if (!items.length) return '';
  return `
    <section class="seo-faq">
      <h2>${escapeHtml(t('faq', lang))}</h2>
      <dl>
        ${items
          .map(
            (it) =>
              `<dt><strong>Q:</strong> ${escapeHtml(it.q)}</dt><dd><strong>A:</strong> ${escapeHtml(it.a)}</dd>`
          )
          .join('')}
      </dl>
    </section>`;
};

const breadcrumbHtml = (
  lang: Lang,
  items: Array<{ label: string; href: string }>
) => {
  if (items.length === 0) return '';
  return `<nav aria-label="breadcrumb" class="seo-breadcrumb">${items
    .map((b, i) =>
      i === items.length - 1
        ? `<span aria-current="page">${escapeHtml(b.label)}</span>`
        : `<a href="${escapeHtml(b.href)}">${escapeHtml(b.label)}</a> <span aria-hidden="true">›</span> `
    )
    .join('')}</nav>`;
};

const geoLine = (lang: Lang, geoTargets: string[]) =>
  `<p class="seo-geo"><strong>${escapeHtml(
    t('servedMarkets', lang)
  )}:</strong> ${escapeHtml(geoTargets.join(', '))}</p>`;

// ----------------------------- Schema builders ----------------------------- //

function faqSchema(items: Array<{ q: string; a: string }>) {
  if (!items.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  };
}

function productSchema(opts: {
  name: string;
  description: string;
  image: string;
  url: string;
  brand?: string;
  sku?: string;
  category?: string;
  applications?: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: opts.name,
    description: opts.description,
    image: opts.image,
    url: opts.url,
    sku: opts.sku,
    category: opts.category,
    brand: { '@type': 'Brand', name: opts.brand || 'PINTE' },
    manufacturer: {
      '@type': 'Organization',
      name: 'PINTE',
      url: SITE,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Dongguan',
        addressRegion: 'Guangdong',
        addressCountry: 'CN',
      },
    },
    audience: opts.applications?.length
      ? { '@type': 'PeopleAudience', audienceType: opts.applications.join(', ') }
      : undefined,
  };
}

function serviceSchema(opts: {
  name: string;
  description: string;
  serviceType: string;
  url: string;
  areaServed: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.name,
    description: opts.description,
    serviceType: opts.serviceType,
    url: opts.url,
    provider: {
      '@type': 'Organization',
      name: 'PINTE',
      url: SITE,
    },
    areaServed: opts.areaServed.map((c) => ({ '@type': 'Country', name: c })),
  };
}

function pageTypeSchema(opts: {
  type: 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage';
  name: string;
  description: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': opts.type,
    name: opts.name,
    description: opts.description,
    url: opts.url,
    isPartOf: { '@type': 'WebSite', name: 'PINTE', url: SITE },
  };
}

function itemListSchema(opts: {
  name: string;
  url: string;
  items: Array<{ name: string; url: string }>;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: opts.name,
    url: opts.url,
    itemListElement: opts.items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      url: it.url,
    })),
  };
}

// ----------------------------- Breadcrumbs ----------------------------- //

function buildBreadcrumb(
  route: string,
  lang: Lang
): Array<{ label: string; href: string }> {
  const home = { label: t('home', lang), href: langPrefix(lang) + '/' };
  if (!route) return [home];

  const parts = route.split('/');
  // route taxonomy
  if (parts[0] === 'about') return [home, { label: t('about', lang), href: langPath('about', lang) + '/' }];
  if (parts[0] === 'culture') return [home, { label: t('culture', lang), href: langPath('culture', lang) + '/' }];
  if (parts[0] === 'tour') return [home, { label: t('tour', lang), href: langPath('tour', lang) + '/' }];
  if (parts[0] === 'quote') return [home, { label: t('quote', lang), href: langPath('quote', lang) + '/' }];
  if (parts[0] === 'privacy') return [home, { label: t('privacy', lang), href: langPath('privacy', lang) + '/' }];
  if (parts[0] === 'terms') return [home, { label: t('terms', lang), href: langPath('terms', lang) + '/' }];
  if (parts[0] === 'pintefoils') return [home, { label: t('pintefoils', lang), href: langPath('pintefoils', lang) + '/' }];
  if (parts[0] === 'seo-geo-sop') return [home, { label: t('seoSop', lang), href: langPath('seo-geo-sop', lang) + '/' }];

  if (parts[0] === 'blog') {
    const crumbs = [home, { label: t('blog', lang), href: langPath('blog', lang) + '/' }];
    if (parts[1]) crumbs.push({ label: parts[1], href: langPath(route, lang) + '/' });
    return crumbs;
  }

  if (parts[0] === 'products') {
    const crumbs = [
      home,
      { label: t('products', lang), href: langPath('products', lang) + '/' },
    ];
    if (parts[1] === 'foils') {
      crumbs.push({ label: t('foilColors', lang), href: langPath('products/foils', lang) + '/' });
    } else if (parts[1] === 'category' && parts[2]) {
      const cat = getContent(lang).PRODUCT_DATA[parts[2] as keyof typeof CONTENT_EN.PRODUCT_DATA];
      crumbs.push({
        label: cat?.name || parts[2],
        href: langPath(`products/category/${parts[2]}`, lang) + '/',
      });
    } else if (parts[1] === 'item' && parts[2]) {
      // find item by id across categories
      const catalog = getContent(lang).CATALOG_DATA;
      let foundItem: { name: string; series?: string } | undefined;
      let foundSeries: string | undefined;
      for (const [seriesId, items] of Object.entries(catalog)) {
        const m = (items as any[]).find((x) => x.id === parts[2]);
        if (m) {
          foundItem = m;
          foundSeries = seriesId;
          break;
        }
      }
      if (foundSeries) {
        const cat = getContent(lang).PRODUCT_DATA[foundSeries as keyof typeof CONTENT_EN.PRODUCT_DATA];
        crumbs.push({
          label: cat?.name || foundSeries,
          href: langPath(`products/category/${foundSeries}`, lang) + '/',
        });
      }
      crumbs.push({
        label: foundItem?.name || parts[2],
        href: langPath(`products/item/${parts[2]}`, lang) + '/',
      });
    }
    return crumbs;
  }

  if (parts[0] === 'solutions') {
    const crumbs = [
      home,
      { label: t('solutions', lang), href: langPath('solutions', lang) + '/' },
    ];
    if (parts[1]) {
      const sol = (getContent(lang).SOLUTIONS_DATA as any)[parts[1]];
      crumbs.push({
        label: sol?.title || parts[1],
        href: langPath(`solutions/${parts[1]}`, lang) + '/',
      });
    }
    return crumbs;
  }

  return [home];
}

function crumbsToSchema(crumbs: Array<{ label: string; href: string }>) {
  return generateBreadcrumbSchema(
    crumbs.map((c) => ({ name: c.label, url: `${SITE}${c.href}` }))
  );
}

// ----------------------------- Common assemblers ----------------------------- //

function wrapMain(opts: {
  route: string;
  lang: Lang;
  breadcrumb: string;
  inner: string;
}) {
  return `<main class="seo-snapshot" lang="${htmlLangAttr(opts.lang)}" data-route="${escapeHtml(
    langPath(opts.route, opts.lang)
  )}">${opts.breadcrumb}${opts.inner}</main>`;
}

function defaultGeoForRoute(route: string, lang: Lang): string[] {
  const seo = lookupSeoPage(route, lang);
  return seo?.geoTargets?.length ? seo.geoTargets : defaultGeoTargets;
}

function defaultKeywords(route: string, lang: Lang, extras: string[] = []): string[] {
  const seo = lookupSeoPage(route, lang);
  const list = seo
    ? [seo.primaryKeyword, ...(seo.secondaryKeywords || [])]
    : [];
  return Array.from(new Set([...list, ...extras])).filter(Boolean);
}

// ----------------------------- Per-route builders ----------------------------- //

function buildHomeSnapshot(lang: Lang): SnapshotResult {
  const c = getContent(lang);
  const route = '';
  const url = buildCanonicalUrl(route, lang);
  const geoTargets = defaultGeoForRoute(route, lang);

  const meta = {
    title:
      lang === 'cn'
        ? '品特PINTE - 高端烫金膜制造专家｜中国东莞烫金膜制造商'
        : 'PINTE - Premium Hot Stamping Foil Manufacturer | Dongguan China',
    description:
      lang === 'cn'
        ? '主营烫金箔、烫金膜、冷烫箔、电化铝、颜料箔、全息烫金箔,拥有25年涂布经验,专业定制化生产,供应越南、东南亚、马来西亚、泰国、印尼等全球市场。'
        : 'PINTE is a leading manufacturer of high-end hot stamping foils based in Dongguan China with 25 years of coating experience. We supply hot stamping foil, cold foil, digital foil, pigment foil, and holographic foil to Vietnam, Southeast Asia, Malaysia, Thailand, Indonesia, and global markets.',
    keywords: defaultKeywords(route, lang),
    geoTargets,
    type: 'website' as const,
  };

  const crumbs = buildBreadcrumb(route, lang);
  const series = Object.values(c.PRODUCT_DATA);
  const solutions = Object.values(c.SOLUTIONS_DATA);

  // 行业痛点段落:聚合 8 个方案的 painPoints 去重 → 串成一句
  const painPoints = Array.from(
    new Set(
      Object.values(c.SOLUTIONS_DATA).flatMap((s: any) => s.painPoints || [])
    )
  );

  const painLead =
    lang === 'cn'
      ? `烫金膜在生产中常见痛点 — ${painPoints.join('、')} — 品特针对每一类痛点都开发了对应的产品系列与解决方案,经过 25 年市场验证。`
      : `Common pain points in hot stamping production — ${painPoints.join(
          ', '
        )} — are each addressed by a dedicated PINTE product series, validated over 25 years.`;

  const faq = [
    {
      q: lang === 'cn' ? '品特生产哪些种类的烫金箔?' : 'What types of foil does PINTE manufacture?',
      a:
        lang === 'cn'
          ? '主营 PK 咖啡底烫金箔、PC 塑胶/冷烫箔、PL/PY 颜料箔、数码冷烫箔以及金葱粉等 5 大系列,覆盖纸张、塑胶、皮革、特种纸、UV 光油等几乎所有印刷基材。'
          : 'PINTE manufactures 5 main series: PK Brown Back foil, PC Plastic/Cold foil, PL/PY Pigment foil, Digital Cold foil, and Premium Glitter Powder — covering paper, plastics, leather, specialty paper and UV-varnished substrates.',
    },
    {
      q: t('qOEM', lang),
      a: t('aOEM', lang),
    },
    {
      q: t('qLeadTime', lang),
      a: t('aLeadTime', lang),
    },
    {
      q: t('qMarkets', lang),
      a:
        (lang === 'cn' ? '品特长期服务: ' : 'PINTE primarily serves: ') +
        geoTargets.join(', ') +
        (lang === 'cn'
          ? '。在越南、泰国、马来西亚、印度尼西亚均有长期合作客户与本地物流支持。'
          : '. Long-term partnerships and local logistics support in Vietnam, Thailand, Malaysia, and Indonesia.'),
    },
  ];

  const inner = `
    <h1>${escapeHtml(meta.title)}</h1>
    <p class="seo-lead">${escapeHtml(meta.description)}</p>

    <section>
      <h2>${escapeHtml(t('industryChallenges', lang))}</h2>
      <p>${escapeHtml(painLead)}</p>
    </section>

    <section>
      <h2>${escapeHtml(t('products', lang))}</h2>
      ${linkList(
        series.map((s: any) => ({
          label: `${s.name} — ${trim(s.subtitle || '', 60)}`,
          href: langPath(`products/category/${s.id}`, lang) + '/',
        }))
      )}
    </section>

    <section>
      <h2>${escapeHtml(t('solutions', lang))}</h2>
      ${linkList(
        solutions.map((s: any) => ({
          label: s.title,
          href: langPath(`solutions/${s.id}`, lang) + '/',
        }))
      )}
    </section>

    ${faqHtml(lang, faq)}
    ${geoLine(lang, geoTargets)}
  `;

  const html = wrapMain({
    route,
    lang,
    breadcrumb: breadcrumbHtml(lang, crumbs),
    inner,
  });

  const jsonLd: Record<string, unknown>[] = [
    crumbsToSchema(crumbs),
    pageTypeSchema({
      type: 'WebPage',
      name: meta.title,
      description: meta.description,
      url,
    }),
    itemListSchema({
      name: lang === 'cn' ? '产品系列' : 'Product Series',
      url,
      items: series.map((s: any) => ({
        name: s.name,
        url: `${SITE}${langPath(`products/category/${s.id}`, lang)}/`,
      })),
    }),
  ];
  const fq = faqSchema(faq);
  if (fq) jsonLd.push(fq);

  return { html, jsonLd, meta };
}

function buildCategorySnapshot(catId: string, lang: Lang): SnapshotResult {
  const c = getContent(lang);
  const route = `products/category/${catId}`;
  const url = buildCanonicalUrl(route, lang);
  const cat = c.PRODUCT_DATA[catId as keyof typeof c.PRODUCT_DATA] as any;
  const items = (c.CATALOG_DATA[catId as keyof typeof c.CATALOG_DATA] as any[]) || [];
  const solutions = Object.values(c.SOLUTIONS_DATA).filter(
    (s: any) => s.series === catId
  );
  const geoTargets = defaultGeoForRoute(route, lang);

  const title =
    lang === 'cn'
      ? `${cat.name} — PINTE ${cat.subtitle}｜东莞烫金箔制造商`
      : `${cat.name} — PINTE ${cat.subtitle} | Dongguan Hot Stamping Foil Manufacturer`;
  const description = trim(cat.description, 280);

  // 痛点段落:从同系列 solutions 聚合
  const painPoints = Array.from(
    new Set(solutions.flatMap((s: any) => s.painPoints || []))
  );
  const painLead =
    painPoints.length === 0
      ? cat.description
      : lang === 'cn'
      ? `常见痛点:${painPoints.join('、')}。${cat.name}通过${cat.features
          .map((f: any) => f.title)
          .join('、')}等关键特性提供解决方案。`
      : `Common pain points: ${painPoints.join(', ')}. The ${cat.name} addresses these with ${cat.features
          .map((f: any) => f.title)
          .join(', ')}.`;

  // FAQ:每个特性 → 1 个 Q,加 OEM/lead time/markets
  const faq: Array<{ q: string; a: string }> = [
    ...cat.features.map((f: any) => ({
      q:
        lang === 'cn'
          ? `${cat.name} 的 ${f.title} 体现在哪里?`
          : `How does ${cat.name} deliver ${f.title}?`,
      a: f.desc,
    })),
    ...painPoints.slice(0, 3).map((p) => ({
      q:
        lang === 'cn'
          ? `如何避免「${p}」?`
          : `How to avoid "${p}"?`,
      a:
        lang === 'cn'
          ? `${cat.name}通过${cat.features
              .map((f: any) => f.title)
              .slice(0, 2)
              .join('与')}等特性,可有效避免${p}。具体可参考下方"典型应用"或联系销售获取样品测试。`
          : `${cat.name} addresses "${p}" via ${cat.features
              .map((f: any) => f.title)
              .slice(0, 2)
              .join(' and ')}. See typical applications below or request a sample for testing.`,
    })),
    { q: t('qOEM', lang), a: t('aOEM', lang) },
    { q: t('qLeadTime', lang), a: t('aLeadTime', lang) },
  ];

  const features = cat.features as any[];
  const featuresHtml = `
    <section>
      <h2>${escapeHtml(t('features', lang))}</h2>
      <ul>
        ${features
          .map(
            (f: any) =>
              `<li><strong>${escapeHtml(f.title)}:</strong> ${escapeHtml(f.desc)}</li>`
          )
          .join('')}
      </ul>
    </section>`;

  const inner = `
    <h1>${escapeHtml(cat.name)} — ${escapeHtml(cat.subtitle)}</h1>
    <p class="seo-lead">${escapeHtml(trim(cat.description, 400))}</p>

    <section>
      <h2>${escapeHtml(t('industryChallenges', lang))}</h2>
      <p>${escapeHtml(painLead)}</p>
    </section>

    ${featuresHtml}

    <section>
      <h2>${escapeHtml(t('specifications', lang))}</h2>
      ${dlList(cat.params || [])}
      ${
        cat.temp
          ? `<p><strong>${escapeHtml(t('temperature', lang))}</strong> — ${escapeHtml(
              t('flatTemp', lang)
            )}: ${escapeHtml(cat.temp.flat)}; ${escapeHtml(
              t('roundTemp', lang)
            )}: ${escapeHtml(cat.temp.round)}</p>`
          : ''
      }
    </section>

    <section>
      <h2>${escapeHtml(t('substrates', lang))}</h2>
      ${ul(cat.substrates || [])}
    </section>

    <section>
      <h2>${escapeHtml(t('applications', lang))}</h2>
      ${ul(cat.applications || [])}
    </section>

    ${
      items.length > 0
        ? `<section>
        <h2>${escapeHtml(t('productItems', lang))}</h2>
        ${linkList(
          items.map((it: any) => ({
            label: `${it.name} — ${trim(it.subtitle || it.description || '', 60)}`,
            href: langPath(`products/item/${it.id}`, lang) + '/',
          }))
        )}
      </section>`
        : ''
    }

    ${
      solutions.length > 0
        ? `<section>
        <h2>${escapeHtml(t('related', lang))}</h2>
        ${linkList(
          solutions.map((s: any) => ({
            label: s.title,
            href: langPath(`solutions/${s.id}`, lang) + '/',
          }))
        )}
      </section>`
        : ''
    }

    ${faqHtml(lang, faq)}
    ${geoLine(lang, geoTargets)}
  `;

  const crumbs = buildBreadcrumb(route, lang);
  const html = wrapMain({
    route,
    lang,
    breadcrumb: breadcrumbHtml(lang, crumbs),
    inner,
  });

  const jsonLd: Record<string, unknown>[] = [
    crumbsToSchema(crumbs),
    productSchema({
      name: cat.name,
      description: cat.description,
      image: cat.heroImage,
      url,
      sku: cat.id,
      category: cat.subtitle,
      applications: cat.applications,
    }),
    itemListSchema({
      name: `${cat.name} — ${t('productItems', lang)}`,
      url,
      items: items.map((it: any) => ({
        name: it.name,
        url: `${SITE}${langPath(`products/item/${it.id}`, lang)}/`,
      })),
    }),
  ];
  const fq = faqSchema(faq);
  if (fq) jsonLd.push(fq);

  return {
    html,
    jsonLd,
    meta: {
      title,
      description,
      keywords: defaultKeywords(route, lang, [cat.name, cat.subtitle]),
      geoTargets,
      image: cat.heroImage,
      type: 'website',
    },
  };
}

function buildItemSnapshot(itemId: string, lang: Lang): SnapshotResult | null {
  const c = getContent(lang);
  const route = `products/item/${itemId}`;
  const url = buildCanonicalUrl(route, lang);

  // find item across categories
  let item: any;
  let seriesId: string | undefined;
  for (const [sid, items] of Object.entries(c.CATALOG_DATA)) {
    const m = (items as any[]).find((x) => x.id === itemId);
    if (m) {
      item = m;
      seriesId = sid;
      break;
    }
  }
  if (!item) return null;

  const cat = c.PRODUCT_DATA[seriesId as keyof typeof c.PRODUCT_DATA] as any;
  const sameSeries = (c.CATALOG_DATA[seriesId as keyof typeof c.CATALOG_DATA] as any[]).filter(
    (x: any) => x.id !== itemId
  );
  const relatedSolutions = Object.values(c.SOLUTIONS_DATA).filter(
    (s: any) => s.series === seriesId
  );
  const geoTargets = defaultGeoForRoute(route, lang);

  const title =
    lang === 'cn'
      ? `${item.name} — PINTE ${item.subtitle || cat.name}`
      : `${item.name} — PINTE ${item.subtitle || cat.name}`;
  const description = trim(item.description || item.content || cat.description, 280);

  const features = (item.features || []) as Array<{ title: string; desc: string }>;
  const params = item.params || [];
  const applications = item.applications || [];

  // 痛点段落:用 cat.description 中提到的痛点 + item 自带 content
  const painLead = item.content
    ? trim(item.content, 400)
    : lang === 'cn'
    ? `${item.name} 是 ${cat.name} 的成员之一,继承了系列的${cat.features
        .map((f: any) => f.title)
        .join('、')}等核心特性,并在${item.subtitle || '应用场景'}方面做了专门优化。`
    : `${item.name} is part of the ${cat.name} family, inheriting ${cat.features
        .map((f: any) => f.title)
        .join(', ')}, with additional optimization for ${item.subtitle || 'specific applications'}.`;

  const faq: Array<{ q: string; a: string }> = [
    ...features.map((f) => ({
      q:
        lang === 'cn'
          ? `${item.name} 的 ${f.title} 是怎么实现的?`
          : `What does "${f.title}" mean for ${item.name}?`,
      a: f.desc,
    })),
    ...(item.temp
      ? [
          {
            q:
              lang === 'cn'
                ? `${item.name} 的烫印温度建议是?`
                : `What is the recommended stamping temperature for ${item.name}?`,
            a:
              (lang === 'cn'
                ? `平面烫印推荐 ${item.temp.flat};圆面/曲面烫印推荐 ${item.temp.round}。`
                : `Flat stamping: ${item.temp.flat}; round/curved stamping: ${item.temp.round}.`) +
              (lang === 'cn'
                ? ' 建议结合基材与印刷设备做小批量测试。'
                : ' Recommend a small-batch test combined with your substrate and press.'),
          },
        ]
      : []),
    { q: t('qOEM', lang), a: t('aOEM', lang) },
    { q: t('qLeadTime', lang), a: t('aLeadTime', lang) },
  ];

  const inner = `
    <h1>${escapeHtml(item.name)}${item.subtitle ? ` — ${escapeHtml(item.subtitle)}` : ''}</h1>
    <p class="seo-lead">${escapeHtml(item.description)}</p>

    <section>
      <h2>${escapeHtml(t('industryChallenges', lang))}</h2>
      <p>${escapeHtml(painLead)}</p>
    </section>

    ${
      features.length
        ? `<section>
        <h2>${escapeHtml(t('features', lang))}</h2>
        <ul>${features
          .map(
            (f) =>
              `<li><strong>${escapeHtml(f.title)}:</strong> ${escapeHtml(f.desc)}</li>`
          )
          .join('')}</ul>
      </section>`
        : ''
    }

    ${
      params.length
        ? `<section>
        <h2>${escapeHtml(t('specifications', lang))}</h2>
        ${dlList(params)}
        ${
          item.temp
            ? `<p><strong>${escapeHtml(t('temperature', lang))}</strong> — ${escapeHtml(
                t('flatTemp', lang)
              )}: ${escapeHtml(item.temp.flat)}; ${escapeHtml(
                t('roundTemp', lang)
              )}: ${escapeHtml(item.temp.round)}</p>`
            : ''
        }
      </section>`
        : ''
    }

    ${
      applications.length
        ? `<section>
        <h2>${escapeHtml(t('applications', lang))}</h2>
        ${ul(applications)}
      </section>`
        : ''
    }

    <section>
      <h2>${escapeHtml(t('related', lang))}</h2>
      <p>${escapeHtml(t('partOfSeries', lang, { series: cat.name }))} — <a href="${escapeHtml(
        langPath(`products/category/${seriesId}`, lang) + '/'
      )}">${escapeHtml(t('viewSeries', lang, { series: cat.name }))}</a></p>
      ${
        sameSeries.length
          ? linkList(
              sameSeries.map((x: any) => ({
                label: x.name,
                href: langPath(`products/item/${x.id}`, lang) + '/',
              }))
            )
          : ''
      }
      ${
        relatedSolutions.length
          ? linkList(
              relatedSolutions.map((s: any) => ({
                label: s.title,
                href: langPath(`solutions/${s.id}`, lang) + '/',
              }))
            )
          : ''
      }
    </section>

    ${faqHtml(lang, faq)}
    ${geoLine(lang, geoTargets)}
  `;

  const crumbs = buildBreadcrumb(route, lang);
  const html = wrapMain({
    route,
    lang,
    breadcrumb: breadcrumbHtml(lang, crumbs),
    inner,
  });

  const jsonLd: Record<string, unknown>[] = [
    crumbsToSchema(crumbs),
    productSchema({
      name: item.name,
      description: item.description,
      image: item.image || cat.heroImage,
      url,
      sku: item.id,
      category: cat.name,
      applications,
    }),
  ];
  const fq = faqSchema(faq);
  if (fq) jsonLd.push(fq);

  return {
    html,
    jsonLd,
    meta: {
      title,
      description,
      keywords: defaultKeywords(route, lang, [item.name, cat.name]),
      geoTargets,
      image: item.image || cat.heroImage,
      type: 'website',
    },
  };
}

function buildSolutionSnapshot(solId: string, lang: Lang): SnapshotResult | null {
  const c = getContent(lang);
  const route = `solutions/${solId}`;
  const url = buildCanonicalUrl(route, lang);
  const sol = (c.SOLUTIONS_DATA as any)[solId];
  if (!sol) return null;

  const seriesId = sol.series;
  const cat = (c.PRODUCT_DATA as any)[seriesId];
  const sameSeriesItems = (c.CATALOG_DATA as any)[seriesId] || [];
  const geoTargets = defaultGeoForRoute(route, lang);

  const title =
    lang === 'cn'
      ? `${sol.title} — PINTE 烫金箔行业方案`
      : `${sol.title} — PINTE Hot Stamping Foil Industry Solution`;
  const description = trim(sol.description, 280);

  const painPoints: string[] = sol.painPoints || [];
  const features: string[] = sol.features || [];

  const painLead =
    painPoints.length > 0
      ? lang === 'cn'
        ? `典型痛点:${painPoints.join('、')}。本方案基于 ${cat?.name || seriesId},通过${features.join('、')}等关键性能解决这些问题。`
        : `Typical pain points: ${painPoints.join(', ')}. This solution is built on ${cat?.name || seriesId}, addressing them via ${features.join(', ')}.`
      : sol.description;

  // 痛点 → 问答
  const faq: Array<{ q: string; a: string }> = [
    ...painPoints.map((p: string) => ({
      q:
        lang === 'cn'
          ? `${sol.title} 如何解决「${p}」?`
          : `How does PINTE solve "${p}" in ${sol.title}?`,
      a:
        (lang === 'cn'
          ? `选择 ${cat?.name || seriesId}(主打${features.join('、')})可有效避免${p}。`
          : `Use the ${cat?.name || seriesId} series, featuring ${features.join(', ')}, to mitigate "${p}".`) +
        (cat?.temp
          ? lang === 'cn'
            ? ` 推荐烫印温度:平面 ${cat.temp.flat},圆面 ${cat.temp.round}。`
            : ` Recommended stamping temperature: flat ${cat.temp.flat}, round ${cat.temp.round}.`
          : ''),
    })),
    ...features.slice(0, 2).map((f: string) => ({
      q:
        lang === 'cn'
          ? `「${f}」具体表现如何?`
          : `What does "${f}" deliver in this solution?`,
      a:
        (cat?.description ? trim(cat.description, 300) : sol.description),
    })),
    { q: t('qOEM', lang), a: t('aOEM', lang) },
    { q: t('qLeadTime', lang), a: t('aLeadTime', lang) },
  ];

  const inner = `
    <h1>${escapeHtml(sol.title)}</h1>
    <p class="seo-lead">${escapeHtml(sol.description)}</p>

    <section>
      <h2>${escapeHtml(t('industryChallenges', lang))}</h2>
      <p>${escapeHtml(painLead)}</p>
      ${painPoints.length ? ul(painPoints) : ''}
    </section>

    ${
      features.length
        ? `<section>
        <h2>${escapeHtml(t('features', lang))}</h2>
        ${ul(features)}
      </section>`
        : ''
    }

    ${
      cat
        ? `<section>
        <h2>${escapeHtml(t('specifications', lang))}</h2>
        ${dlList(cat.params || [])}
        ${
          cat.temp
            ? `<p><strong>${escapeHtml(t('temperature', lang))}</strong> — ${escapeHtml(
                t('flatTemp', lang)
              )}: ${escapeHtml(cat.temp.flat)}; ${escapeHtml(
                t('roundTemp', lang)
              )}: ${escapeHtml(cat.temp.round)}</p>`
            : ''
        }
      </section>`
        : ''
    }

    ${
      cat?.applications?.length
        ? `<section>
        <h2>${escapeHtml(t('applications', lang))}</h2>
        ${ul(cat.applications)}
      </section>`
        : ''
    }

    ${
      cat
        ? `<section>
        <h2>${escapeHtml(t('related', lang))}</h2>
        <p><a href="${escapeHtml(
          langPath(`products/category/${seriesId}`, lang) + '/'
        )}">${escapeHtml(t('viewSeries', lang, { series: cat.name }))}</a></p>
        ${
          sameSeriesItems.length
            ? linkList(
                sameSeriesItems.map((it: any) => ({
                  label: it.name,
                  href: langPath(`products/item/${it.id}`, lang) + '/',
                }))
              )
            : ''
        }
      </section>`
        : ''
    }

    ${faqHtml(lang, faq)}
    ${geoLine(lang, geoTargets)}
  `;

  const crumbs = buildBreadcrumb(route, lang);
  const html = wrapMain({
    route,
    lang,
    breadcrumb: breadcrumbHtml(lang, crumbs),
    inner,
  });

  const jsonLd: Record<string, unknown>[] = [
    crumbsToSchema(crumbs),
    serviceSchema({
      name: sol.title,
      description: sol.description,
      serviceType: sol.title,
      url,
      areaServed: geoTargets,
    }),
  ];
  const fq = faqSchema(faq);
  if (fq) jsonLd.push(fq);

  return {
    html,
    jsonLd,
    meta: {
      title,
      description,
      keywords: defaultKeywords(route, lang, [sol.title, cat?.name].filter(Boolean) as string[]),
      geoTargets,
      image: sol.img,
      type: 'website',
    },
  };
}

function buildAboutLikeSnapshot(
  route: 'about' | 'culture' | 'tour',
  lang: Lang
): SnapshotResult {
  const url = buildCanonicalUrl(route, lang);
  const geoTargets = defaultGeoForRoute(route, lang);
  const c = getContent(lang);

  const titles: Record<string, { cn: string; en: string }> = {
    about: {
      cn: '关于品特 — PINTE 高端烫金箔制造商｜东莞 25 年涂布经验',
      en: 'About PINTE — Dongguan Hot Stamping Foil Manufacturer | 25 Years of Coating Expertise',
    },
    culture: {
      cn: '品特企业文化 — 工艺、品质、客户至上',
      en: 'PINTE Culture — Craftsmanship, Quality, Customer First',
    },
    tour: {
      cn: '工厂在线参观 — PINTE 东莞烫金箔生产基地',
      en: 'Factory Virtual Tour — PINTE Dongguan Hot Stamping Foil Facility',
    },
  };

  const title = titles[route][lang];
  const lead =
    route === 'tour'
      ? t('tourIntro', lang)
      : t('aboutLead', lang);

  const stats = c.COMPANY_STATS as any[];

  const faq: Array<{ q: string; a: string }> = [
    {
      q:
        lang === 'cn'
          ? '品特工厂在哪里?生产能力多大?'
          : 'Where is PINTE\'s factory and what is its production capacity?',
      a:
        lang === 'cn'
          ? '工厂位于中国广东东莞,占地 20,000+ ㎡,3 条以上自动化涂布生产线,月产能超过 180 万米。通过 ISO9001 体系认证。'
          : 'PINTE operates from Dongguan, Guangdong, China — over 20,000 m² of production area, 3+ automated coating lines, monthly capacity above 1.8 million meters, ISO9001 certified.',
    },
    {
      q: t('qOEM', lang),
      a: t('aOEM', lang),
    },
    {
      q: t('qMarkets', lang),
      a:
        (lang === 'cn' ? '品特长期出口至: ' : 'PINTE exports to: ') +
        geoTargets.join(', ') +
        (lang === 'cn'
          ? ',在越南、泰国、马来西亚、印尼等市场拥有稳定的本地客户群。'
          : ', with established customer base in Vietnam, Thailand, Malaysia, Indonesia.'),
    },
  ];

  const inner = `
    <h1>${escapeHtml(title)}</h1>
    <p class="seo-lead">${escapeHtml(lead)}</p>

    ${
      stats?.length
        ? `<section>
        <h2>${escapeHtml(lang === 'cn' ? '关键数据' : 'Key Numbers')}</h2>
        <ul>${stats
          .map(
            (s: any) =>
              `<li><strong>${escapeHtml(s.targetValue)}${s.suffix || ''}</strong> — ${escapeHtml(s.label)}</li>`
          )
          .join('')}</ul>
      </section>`
        : ''
    }

    ${faqHtml(lang, faq)}
    ${geoLine(lang, geoTargets)}
  `;

  const crumbs = buildBreadcrumb(route, lang);
  const html = wrapMain({
    route,
    lang,
    breadcrumb: breadcrumbHtml(lang, crumbs),
    inner,
  });

  const jsonLd: Record<string, unknown>[] = [
    crumbsToSchema(crumbs),
    pageTypeSchema({
      type: route === 'about' || route === 'culture' ? 'AboutPage' : 'WebPage',
      name: title,
      description: lead,
      url,
    }),
  ];
  const fq = faqSchema(faq);
  if (fq) jsonLd.push(fq);

  return {
    html,
    jsonLd,
    meta: {
      title,
      description: lead,
      keywords: defaultKeywords(route, lang),
      geoTargets,
      type: 'website',
    },
  };
}

function buildProductsListSnapshot(lang: Lang): SnapshotResult {
  const route = 'products';
  const url = buildCanonicalUrl(route, lang);
  const c = getContent(lang);
  const series = Object.values(c.PRODUCT_DATA) as any[];
  const geoTargets = defaultGeoForRoute(route, lang);

  const title =
    lang === 'cn'
      ? '产品中心 — PINTE 品特烫金箔产品目录(PK / PC / PLPY / Digital / Glitter)'
      : 'Products — PINTE Hot Stamping Foil Catalog (PK / PC / PLPY / Digital / Glitter)';
  const description =
    lang === 'cn'
      ? '品特 PINTE 提供 5 大系列烫金箔产品: PK 咖啡底、PC 塑胶/冷烫、PL/PY 颜料箔、数码冷烫、金葱粉,满足纸张、塑胶、皮革、UV 等几乎所有印刷基材需求。'
      : 'PINTE offers 5 product series: PK Brown Back, PC Plastic/Cold Foil, PL/PY Pigment, Digital Cold Foil, Premium Glitter Powder — covering paper, plastic, leather, UV-coated and more.';

  const faq: Array<{ q: string; a: string }> = [
    {
      q:
        lang === 'cn'
          ? '我该选哪个烫金箔系列?'
          : 'Which foil series should I choose?',
      a:
        lang === 'cn'
          ? '基材是粗糙/有纹理纸张或皮革 → PK;基材是塑胶或需要耐酒精 → PC;需要高遮盖纯色或印在深色卡纸 → PL/PY;短单、个性化、可变数据 → Digital;装饰/化妆品/丝印闪粉 → Glitter。'
          : 'Rough or textured paper / leather → PK. Plastic substrate or alcohol resistance needed → PC. Solid color coverage on dark stock → PL/PY. Short run / personalization / variable data → Digital. Decoration / cosmetic / silk-print sparkle → Glitter.',
    },
    { q: t('qOEM', lang), a: t('aOEM', lang) },
    { q: t('qLeadTime', lang), a: t('aLeadTime', lang) },
  ];

  const inner = `
    <h1>${escapeHtml(title)}</h1>
    <p class="seo-lead">${escapeHtml(description)}</p>

    <section>
      <h2>${escapeHtml(t('productCategories', lang))}</h2>
      ${linkList(
        series.map((s) => ({
          label: `${s.name} — ${trim(s.subtitle || s.description, 80)}`,
          href: langPath(`products/category/${s.id}`, lang) + '/',
        }))
      )}
    </section>

    ${faqHtml(lang, faq)}
    ${geoLine(lang, geoTargets)}
  `;

  const crumbs = buildBreadcrumb(route, lang);
  const html = wrapMain({
    route,
    lang,
    breadcrumb: breadcrumbHtml(lang, crumbs),
    inner,
  });

  const jsonLd: Record<string, unknown>[] = [
    crumbsToSchema(crumbs),
    pageTypeSchema({
      type: 'CollectionPage',
      name: title,
      description,
      url,
    }),
    itemListSchema({
      name: title,
      url,
      items: series.map((s) => ({
        name: s.name,
        url: `${SITE}${langPath(`products/category/${s.id}`, lang)}/`,
      })),
    }),
  ];
  const fq = faqSchema(faq);
  if (fq) jsonLd.push(fq);

  return {
    html,
    jsonLd,
    meta: {
      title,
      description,
      keywords: defaultKeywords(route, lang),
      geoTargets,
      type: 'website',
    },
  };
}

function buildFoilsListSnapshot(lang: Lang): SnapshotResult {
  const route = 'products/foils';
  const url = buildCanonicalUrl(route, lang);
  const geoTargets = defaultGeoForRoute(route, lang);
  const title =
    lang === 'cn'
      ? '烫金箔色卡 — PINTE 标准色与定制 Pantone 专色'
      : 'Hot Stamping Foil Color Range — PINTE Standard & Custom Pantone Colors';
  const description =
    lang === 'cn'
      ? '查看 PINTE 全系列烫金箔标准色卡,包括亮金、亮银、哑金、哑银、玫瑰金、镭射七彩等。支持 Pantone 专色与品牌色定制。'
      : 'Browse PINTE\'s full hot stamping foil color range — bright gold, silver, matte variants, rose gold, holographic and more. Pantone and brand-color customization available.';
  const inner = `
    <h1>${escapeHtml(title)}</h1>
    <p class="seo-lead">${escapeHtml(description)}</p>
    <p>${escapeHtml(t('aOEM', lang))}</p>
    ${geoLine(lang, geoTargets)}
  `;
  const crumbs = buildBreadcrumb(route, lang);
  return {
    html: wrapMain({
      route,
      lang,
      breadcrumb: breadcrumbHtml(lang, crumbs),
      inner,
    }),
    jsonLd: [
      crumbsToSchema(crumbs),
      pageTypeSchema({ type: 'CollectionPage', name: title, description, url }),
    ],
    meta: {
      title,
      description,
      keywords: defaultKeywords(route, lang),
      geoTargets,
      type: 'website',
    },
  };
}

function buildQuoteSnapshot(lang: Lang): SnapshotResult {
  const route = 'quote';
  const url = buildCanonicalUrl(route, lang);
  const geoTargets = defaultGeoForRoute(route, lang);
  const title =
    lang === 'cn'
      ? '获取报价 — 联系 PINTE 品特烫金箔｜一个工作日内回复'
      : 'Get a Quote — Contact PINTE Hot Stamping Foil | 1-Business-Day Reply';
  const description = t('quoteIntro', lang);

  const faq = [
    {
      q:
        lang === 'cn'
          ? '索取样品需要哪些信息?'
          : 'What info do you need to send samples?',
      a:
        lang === 'cn'
          ? '请提供:基材类型(纸/塑胶/皮革/UV 光油等)、烫金面积大致尺寸、是否平烫/圆烫、想要的颜色或 Pantone 编号、印刷设备型号(如有)。我们会推荐合适的型号并寄送 A4 样卡。'
          : 'Please share: substrate type (paper / plastic / leather / UV varnish, etc.), approximate stamping size, flat or round stamping, target color or Pantone code, and your press model (if available). We will recommend the right SKU and ship an A4 sample card.',
    },
    { q: t('qLeadTime', lang), a: t('aLeadTime', lang) },
    { q: t('qOEM', lang), a: t('aOEM', lang) },
    { q: t('qMarkets', lang), a: geoTargets.join(', ') },
  ];

  const inner = `
    <h1>${escapeHtml(title)}</h1>
    <p class="seo-lead">${escapeHtml(description)}</p>
    <section>
      <h2>${escapeHtml(t('quoteContact', lang))}</h2>
      <ul>
        <li>Email: <a href="mailto:sales@bestglitter.com">sales@bestglitter.com</a></li>
        <li>${lang === 'cn' ? '电话/微信' : 'Phone / WeChat'}: <a href="tel:+8613192267509">+86-13192267509</a></li>
      </ul>
    </section>
    ${faqHtml(lang, faq)}
    ${geoLine(lang, geoTargets)}
  `;
  const crumbs = buildBreadcrumb(route, lang);
  const jsonLd: Record<string, unknown>[] = [
    crumbsToSchema(crumbs),
    pageTypeSchema({ type: 'ContactPage', name: title, description, url }),
  ];
  const fq = faqSchema(faq);
  if (fq) jsonLd.push(fq);

  return {
    html: wrapMain({ route, lang, breadcrumb: breadcrumbHtml(lang, crumbs), inner }),
    jsonLd,
    meta: {
      title,
      description,
      keywords: defaultKeywords(route, lang),
      geoTargets,
      type: 'website',
    },
  };
}

function buildLegalSnapshot(
  route: 'privacy' | 'terms',
  lang: Lang
): SnapshotResult {
  const url = buildCanonicalUrl(route, lang);
  const titles: Record<string, { cn: string; en: string }> = {
    privacy: {
      cn: '隐私政策 — PINTE 品特烫金箔',
      en: 'Privacy Policy — PINTE Hot Stamping Foils',
    },
    terms: {
      cn: '服务条款 — PINTE 品特烫金箔',
      en: 'Terms of Service — PINTE Hot Stamping Foils',
    },
  };
  const title = titles[route][lang];
  const description = route === 'privacy' ? t('privacyLead', lang) : t('termsLead', lang);

  const inner = `
    <h1>${escapeHtml(title)}</h1>
    <p class="seo-lead">${escapeHtml(description)}</p>
  `;
  const crumbs = buildBreadcrumb(route, lang);
  return {
    html: wrapMain({ route, lang, breadcrumb: breadcrumbHtml(lang, crumbs), inner }),
    jsonLd: [
      crumbsToSchema(crumbs),
      pageTypeSchema({ type: 'WebPage', name: title, description, url }),
    ],
    meta: {
      title,
      description,
      keywords: defaultKeywords(route, lang),
      geoTargets: defaultGeoForRoute(route, lang),
      type: 'website',
    },
  };
}

function buildBlogListSnapshot(lang: Lang): SnapshotResult {
  const route = 'blog';
  const url = buildCanonicalUrl(route, lang);
  const geoTargets = defaultGeoForRoute(route, lang);
  const title =
    lang === 'cn'
      ? '博客中心 — PINTE 烫金箔行业资讯与工艺指南'
      : 'Blog — PINTE Hot Stamping Foil Insights & Technical Guides';
  const description = t('blogIntro', lang);

  const inner = `
    <h1>${escapeHtml(title)}</h1>
    <p class="seo-lead">${escapeHtml(description)}</p>
    ${geoLine(lang, geoTargets)}
  `;
  const crumbs = buildBreadcrumb(route, lang);
  return {
    html: wrapMain({ route, lang, breadcrumb: breadcrumbHtml(lang, crumbs), inner }),
    jsonLd: [
      crumbsToSchema(crumbs),
      pageTypeSchema({ type: 'CollectionPage', name: title, description, url }),
    ],
    meta: {
      title,
      description,
      keywords: defaultKeywords(route, lang),
      geoTargets,
      type: 'website',
    },
  };
}

function buildBlogPostSnapshot(article: BlogArticleLike, lang: Lang): SnapshotResult {
  const route = `blog/${article.slug}`;
  const url = buildCanonicalUrl(route, lang);
  const geoTargets = defaultGeoForRoute('blog', lang);

  const title = article.title
    ? `${article.title} | PINTE Blog`
    : lang === 'cn'
    ? 'PINTE 博客文章'
    : 'PINTE Blog Article';
  const description = trim(article.summary || article.title || '', 280);
  const body = article.contentMarkdown || article.summary || article.title || '';
  const lead = trim(body, 600);

  const inner = `
    <article>
      <h1>${escapeHtml(article.title || '')}</h1>
      ${article.date ? `<p class="seo-meta"><time datetime="${escapeHtml(article.date)}">${escapeHtml(
        t('publishedOn', lang)
      )} ${escapeHtml(article.date)}</time></p>` : ''}
      <p class="seo-lead">${escapeHtml(lead)}</p>
    </article>
    ${geoLine(lang, geoTargets)}
  `;
  const crumbs = buildBreadcrumb(route, lang);
  const jsonLd: Record<string, unknown>[] = [
    crumbsToSchema(crumbs),
    generateArticleSchema({
      title: article.title || '',
      description,
      image: article.cover || '',
      datePublished: article.date || new Date(0).toISOString(),
      url: langPath(route, lang) + '/',
      geo: { language: htmlLangAttr(lang) },
    }),
  ];

  return {
    html: wrapMain({ route, lang, breadcrumb: breadcrumbHtml(lang, crumbs), inner }),
    jsonLd,
    meta: {
      title,
      description,
      keywords: defaultKeywords('blog', lang, [article.title || '']),
      geoTargets,
      image: article.cover,
      type: 'article',
      publishedTime: article.date,
    },
  };
}

function buildSeoSopSnapshot(lang: Lang): SnapshotResult {
  const route = 'seo-geo-sop';
  const url = buildCanonicalUrl(route, lang);
  const title =
    lang === 'cn'
      ? 'SEO / GEO SOP 工作台 — PINTE'
      : 'SEO / GEO SOP Workspace — PINTE';
  const description =
    lang === 'cn'
      ? 'PINTE 内部 SEO/GEO SOP 工作台:盘点 sitemap 覆盖、关键词映射、GSC/Bing 记录、IndexNow 提交与 AI 搜索可见性检查。'
      : 'PINTE internal SEO/GEO SOP workspace: sitemap coverage, keyword mapping, GSC/Bing records, IndexNow submission, AI search visibility audits.';
  const inner = `
    <h1>${escapeHtml(title)}</h1>
    <p class="seo-lead">${escapeHtml(description)}</p>
  `;
  const crumbs = buildBreadcrumb(route, lang);
  return {
    html: wrapMain({ route, lang, breadcrumb: breadcrumbHtml(lang, crumbs), inner }),
    jsonLd: [
      crumbsToSchema(crumbs),
      pageTypeSchema({ type: 'WebPage', name: title, description, url }),
    ],
    meta: {
      title,
      description,
      keywords: defaultKeywords(route, lang),
      geoTargets: defaultGeoTargets,
      type: 'website',
    },
  };
}

function buildPintefoilsSnapshot(lang: Lang): SnapshotResult {
  const route = 'pintefoils';
  const url = buildCanonicalUrl(route, lang);
  const title =
    lang === 'cn'
      ? 'PINTE 烫金膜 3D 展示｜全系列烫金箔产品总览'
      : 'PINTE Foils 3D Showcase | Hot Stamping Foil Full Range Overview';
  const description =
    lang === 'cn'
      ? '3D 互动方式浏览 PINTE 全系列烫金箔产品 — 包括 PK 咖啡底、PC 塑胶/冷烫、PL/PY 颜料、数码冷烫与金葱粉。'
      : 'Explore PINTE\'s full hot stamping foil range in an interactive 3D showcase — PK Brown Back, PC Plastic/Cold, PL/PY Pigment, Digital Cold Foil, and Premium Glitter Powder.';
  const inner = `
    <h1>${escapeHtml(title)}</h1>
    <p class="seo-lead">${escapeHtml(description)}</p>
  `;
  const crumbs = buildBreadcrumb(route, lang);
  return {
    html: wrapMain({ route, lang, breadcrumb: breadcrumbHtml(lang, crumbs), inner }),
    jsonLd: [
      crumbsToSchema(crumbs),
      pageTypeSchema({ type: 'WebPage', name: title, description, url }),
    ],
    meta: {
      title,
      description,
      keywords: defaultKeywords(route, lang, ['PINTE foils', 'hot stamping foil showcase']),
      geoTargets: defaultGeoForRoute(route, lang),
      type: 'website',
    },
  };
}

// ----------------------------- Public API ----------------------------- //

export function buildSnapshot(
  route: string,
  lang: Lang,
  extras?: { article?: BlogArticleLike }
): SnapshotResult | null {
  if (route === '') return buildHomeSnapshot(lang);
  if (route === 'about') return buildAboutLikeSnapshot('about', lang);
  if (route === 'culture') return buildAboutLikeSnapshot('culture', lang);
  if (route === 'tour') return buildAboutLikeSnapshot('tour', lang);
  if (route === 'products') return buildProductsListSnapshot(lang);
  if (route === 'products/foils') return buildFoilsListSnapshot(lang);
  if (route === 'quote') return buildQuoteSnapshot(lang);
  if (route === 'privacy') return buildLegalSnapshot('privacy', lang);
  if (route === 'terms') return buildLegalSnapshot('terms', lang);
  if (route === 'blog') return buildBlogListSnapshot(lang);
  if (route === 'seo-geo-sop') return buildSeoSopSnapshot(lang);
  if (route === 'pintefoils') return buildPintefoilsSnapshot(lang);

  if (route.startsWith('products/category/')) {
    const id = route.split('/')[2];
    return buildCategorySnapshot(id, lang);
  }
  if (route.startsWith('products/item/')) {
    const id = route.split('/')[2];
    return buildItemSnapshot(id, lang);
  }
  if (route.startsWith('solutions/')) {
    const id = route.split('/')[1];
    return buildSolutionSnapshot(id, lang);
  }
  if (route.startsWith('blog/') && extras?.article) {
    return buildBlogPostSnapshot(extras.article, lang);
  }

  return null;
}

/**
 * 把多个 JSON-LD 对象渲染成 <script> 标签连接,用于注入 <head>。
 * 同时移除 undefined 字段(JSON.stringify 默认会去掉)。
 */
export function renderJsonLdScripts(items: Record<string, unknown>[]): string {
  return items
    .map(
      (it) =>
        `<script type="application/ld+json">${JSON.stringify(it).replace(
          /</g,
          '\\u003c'
        )}</script>`
    )
    .join('\n');
}
