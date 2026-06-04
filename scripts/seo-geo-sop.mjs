import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export function loadSitemapUrls(sitemapPath) {
  const xml = fs.readFileSync(sitemapPath, 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
}

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(rows) {
  return rows.map((row) => row.map(csvEscape).join(',')).join('\n') + '\n';
}

function formatList(items) {
  return items.map((item) => `- ${item}`).join('\n');
}

function normalizeUrl(url) {
  return String(url || '').replace(/\/+$/, '') + '/';
}

function slugToKeyword(slug) {
  return decodeURIComponent(slug || '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseSitemapPage(url) {
  const parsed = new URL(url);
  const parts = parsed.pathname.split('/').filter(Boolean);
  const lang = ['cn', 'en'].includes(parts[0]) ? parts[0] : '';
  const routeParts = lang ? parts.slice(1) : parts;
  const route = routeParts.join('/');
  const lastSegment = routeParts.at(-1) || 'home';

  let pageType = 'static';
  let owner = 'Core Website';
  let inferredKeyword = slugToKeyword(lastSegment);

  if (route.startsWith('products/category/')) {
    pageType = 'product_category';
    owner = 'Product Series';
    inferredKeyword = `${slugToKeyword(lastSegment)} hot stamping foil`;
  } else if (route.startsWith('products/item/')) {
    pageType = 'product_detail';
    owner = 'Product Item';
    inferredKeyword = `${slugToKeyword(lastSegment)} foil`;
  } else if (route.startsWith('solutions/')) {
    pageType = 'solution';
    owner = 'Application Solution';
    inferredKeyword = `hot stamping foil for ${slugToKeyword(lastSegment)}`;
  } else if (route.startsWith('blog/')) {
    pageType = 'blog';
    owner = 'Content';
    inferredKeyword = slugToKeyword(lastSegment);
  } else if (route === 'products' || route === 'products/foils') {
    pageType = 'product_catalog';
    owner = 'Product Catalog';
    inferredKeyword = 'hot stamping foil manufacturer';
  } else if (route === 'quote') {
    pageType = 'conversion';
    owner = 'Sales Inquiry';
    inferredKeyword = 'hot stamping foil supplier inquiry';
  } else if (!route) {
    pageType = 'home';
    owner = 'Homepage';
    inferredKeyword = 'hot stamping foil manufacturer';
  }

  return { lang, route, pageType, owner, inferredKeyword };
}

function pageInSitemap(pageUrl, sitemapUrls) {
  const sitemapSet = new Set(sitemapUrls.map(normalizeUrl));
  return sitemapSet.has(normalizeUrl(pageUrl)) ? 'yes' : 'no';
}

function buildConfiguredPageMap(config) {
  return new Map(config.pages.map((page) => [normalizeUrl(page.url), page]));
}

export function buildSitemapCoverageRows({ config, sitemapUrls }) {
  const configuredPages = buildConfiguredPageMap(config);

  return sitemapUrls.map((url) => {
    const normalizedUrl = normalizeUrl(url);
    const configuredPage = configuredPages.get(normalizedUrl);
    const parsed = parseSitemapPage(normalizedUrl);
    const source = configuredPage ? 'configured' : 'inferred';
    const primaryKeyword = configuredPage?.primaryKeyword || parsed.inferredKeyword;
    const secondaryKeywords = configuredPage?.secondaryKeywords || [];
    const geoTargets = configuredPage?.geoTargets || config.markets.slice(0, 4);
    const action = configuredPage ? 'monitor_and_refresh' : 'needs_keyword_mapping';

    return {
      pageUrl: normalizedUrl,
      lang: parsed.lang,
      pageType: parsed.pageType,
      owner: configuredPage?.owner || parsed.owner,
      primaryKeyword,
      secondaryKeywords,
      geoTargets,
      source,
      action,
    };
  });
}

export function buildSopArtifacts({ runDate, config, sitemapUrls }) {
  const coverageRows = buildSitemapCoverageRows({ config, sitemapUrls });

  const checklist = `# Monthly SEO/GEO SOP - ${runDate}

## 1. Collect Search Evidence
- Export Google Search Console queries for the last 28 days.
- Export Bing Webmaster Tools keyword and crawl/indexing data.
- Record high-impression, low-CTR queries in \`03-gsc-bing-log.csv\`.
- Search ChatGPT, Gemini, Doubao, Bing Copilot, and Perplexity for the target product + market terms.

## 2. Select Keywords
- Pick 3 primary keywords to improve this cycle.
- Pick 3 GEO keywords for target markets.
- Pick 2 pages that already rank or receive impressions.
- Pick 1 net-new page if a market or product intent is missing.

## 3. Update Page Placement
- Update title, H1, meta description, intro paragraph, H2 sections, image alt text, internal links, schema, and llms.txt references.
- Keep each page focused on one primary keyword and two to four secondary terms.
- Avoid keyword stuffing; use buyer-intent phrasing.

## 4. Publish and Submit
- Rebuild the site.
- Regenerate sitemap.
- Submit sitemap in Google Search Console and Bing Webmaster Tools.
- Submit changed URLs with IndexNow.

## 5. Review Next Cycle
- Recheck impressions, CTR, average position, indexed status, and AI citation visibility after 14 and 28 days.
`;

  const keywordRows = [
    ['page_url', 'lang', 'page_type', 'owner', 'primary_keyword', 'secondary_keywords', 'geo_targets', 'source', 'status'],
    ...coverageRows.map((page) => [
      page.pageUrl,
      page.lang,
      page.pageType,
      page.owner,
      page.primaryKeyword,
      page.secondaryKeywords.join(' | '),
      page.geoTargets.join(' | '),
      page.source,
      page.action,
    ]),
  ];

  const briefs = `# SEO/GEO Page Briefs - ${runDate}

## Global Product Keywords
${formatList(config.productKeywords)}

## GEO Keywords
${formatList(config.geoKeywords)}

## Where to place keywords
- \`<title>\`: primary keyword + brand or market.
- H1: primary keyword only, written naturally.
- Meta description: primary keyword + market + buyer benefit.
- First 100-150 words: primary keyword and one GEO phrase.
- H2/H3: use secondary keywords and buyer questions.
- Image alt: product + application + market when relevant.
- Internal links: use descriptive anchors, not "click here".
- Product schema / Service schema: product category, manufacturer, areaServed, and inquiry URL.
- \`llms.txt\`: add the best canonical pages for AI citation.

${config.pages.map((page) => `## ${page.primaryKeyword}
- Page: ${page.url}
- Owner: ${page.owner}
- GEO targets: ${page.geoTargets.join(', ')}
- Secondary keywords: ${page.secondaryKeywords.join(', ')}
- Title pattern: ${page.primaryKeyword} | ${config.brand}
- Description pattern: ${config.brand} supplies ${page.primaryKeyword} for ${page.geoTargets.slice(0, 3).join(', ')} buyers, with custom production and export support.
- Content task: add one buyer-problem paragraph, one application paragraph, one specification paragraph, and one inquiry CTA.
`).join('\n')}`;

  const logRows = [
    ['date', 'source', 'query', 'page_url', 'impressions', 'clicks', 'ctr', 'avg_position', 'index_status', 'action_taken', 'next_review_date'],
    [runDate, 'Google Search Console', '', '', '', '', '', '', '', '', ''],
    [runDate, 'Bing Webmaster Tools', '', '', '', '', '', '', '', '', ''],
    [runDate, 'AI Search Check', '', '', '', '', '', '', '', '', ''],
  ];

  const submit = `# Submit and Verify - ${runDate}

## Sitemap
- URL count in current sitemap: ${sitemapUrls.length}
- Sitemap URL: https://www.pintecl.com/sitemap.xml
- Confirm URLs use final trailing-slash canonical format.

## IndexNow
- Run: \`npm run indexnow\`
- Confirm Bing returns HTTP 200.

## Manual checks
- Google Search Console: submit sitemap and inspect 3 changed URLs.
- Bing Webmaster Tools: submit sitemap and inspect 3 changed URLs.
- Confirm page source contains canonical, hreflang, H1, and static SEO snapshot.

## Priority URLs this cycle
${formatList(config.pages.map((page) => page.url))}

## Sitemap coverage
- Fully inventoried sitemap URLs: ${coverageRows.length}
- Configured priority URLs: ${coverageRows.filter((row) => row.source === 'configured').length}
- URLs needing explicit keyword mapping: ${coverageRows.filter((row) => row.action === 'needs_keyword_mapping').length}
`;

  const coverageCsvRows = [
    ['page_url', 'lang', 'page_type', 'owner', 'primary_keyword', 'geo_targets', 'source', 'action'],
    ...coverageRows.map((page) => [
      page.pageUrl,
      page.lang,
      page.pageType,
      page.owner,
      page.primaryKeyword,
      page.geoTargets.join(' | '),
      page.source,
      page.action,
    ]),
  ];

  return [
    { filename: '00-sop-checklist.md', content: checklist },
    { filename: '01-keyword-map.csv', content: toCsv(keywordRows) },
    { filename: '02-page-briefs.md', content: briefs },
    { filename: '03-gsc-bing-log.csv', content: toCsv(logRows) },
    { filename: '04-submit-and-verify.md', content: submit },
    { filename: '05-sitemap-coverage.csv', content: toCsv(coverageCsvRows) },
  ];
}

function parseArgs(argv) {
  const args = {
    date: new Date().toISOString().slice(0, 10),
    outDir: path.join(rootDir, 'seo-geo-runs'),
    configPath: path.join(__dirname, 'seo-geo-sop.config.mjs'),
    sitemapPath: path.join(rootDir, 'public', 'sitemap.xml'),
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--date') args.date = argv[++i];
    if (arg === '--out') args.outDir = path.resolve(argv[++i]);
    if (arg === '--config') args.configPath = path.resolve(argv[++i]);
    if (arg === '--sitemap') args.sitemapPath = path.resolve(argv[++i]);
  }

  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const configModule = await import(pathToFileURL(args.configPath).href);
  const config = configModule.default;
  const sitemapUrls = loadSitemapUrls(args.sitemapPath);
  const artifacts = buildSopArtifacts({ runDate: args.date, config, sitemapUrls });
  const runDir = path.join(args.outDir, args.date);

  fs.mkdirSync(runDir, { recursive: true });
  for (const artifact of artifacts) {
    fs.writeFileSync(path.join(runDir, artifact.filename), artifact.content, 'utf8');
  }

  console.log(`SEO/GEO SOP generated: ${runDir}`);
  for (const artifact of artifacts) {
    console.log(`- ${artifact.filename}`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
