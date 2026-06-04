import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Database,
  ExternalLink,
  Filter,
  Globe2,
  Search,
  Sparkles,
  Target,
} from 'lucide-react';
import SEOMeta from '../components/SEOMeta';
import { useLanguage } from '../contexts/LanguageContext';
import seoGeoConfig from '../scripts/seo-geo-sop.config.mjs';

type PriorityPage = {
  url: string;
  owner: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  geoTargets: string[];
};

type CoverageRow = {
  url: string;
  lang: string;
  pageType: string;
  owner: string;
  primaryKeyword: string;
  geoTargets: string[];
  source: 'configured' | 'inferred';
  action: 'monitor_and_refresh' | 'needs_keyword_mapping';
};

const markets = seoGeoConfig.markets as string[];
const priorityPages = seoGeoConfig.pages as PriorityPage[];

const sopSteps = [
  { id: 'gsc', cn: '导出 Google Search Console 最近 28 天查询', en: 'Export last 28 days of Google Search Console queries' },
  { id: 'bing', cn: '导出 Bing Webmaster Tools 关键词与抓取状态', en: 'Export Bing keyword and crawl data' },
  { id: 'ai', cn: '检查 ChatGPT、Gemini、豆包、Bing Copilot 是否引用品牌', en: 'Check ChatGPT, Gemini, Doubao, and Bing Copilot brand visibility' },
  { id: 'keywords', cn: '选择 3 个 SEO 关键词与 3 个 GEO 市场词', en: 'Select 3 SEO keywords and 3 GEO market terms' },
  { id: 'content', cn: '更新 title、H1、首段、H2、alt、内链与结构化数据', en: 'Update title, H1, intro, H2, alt text, internal links, and schema' },
  { id: 'submit', cn: '重新生成 sitemap 并提交 GSC、Bing、IndexNow', en: 'Regenerate sitemap and submit to GSC, Bing, and IndexNow' },
];

function normalizeUrl(url: string) {
  return url.replace(/\/+$/, '') + '/';
}

function slugToKeyword(slug: string) {
  return decodeURIComponent(slug || '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseSitemap(url: string) {
  const parsed = new URL(url);
  const parts = parsed.pathname.split('/').filter(Boolean);
  const lang = ['cn', 'en'].includes(parts[0]) ? parts[0] : '';
  const routeParts = lang ? parts.slice(1) : parts;
  const route = routeParts.join('/');
  const lastSegment = routeParts.at(-1) || 'home';

  if (!route) return { lang, pageType: 'home', owner: 'Homepage', primaryKeyword: 'hot stamping foil manufacturer' };
  if (route.startsWith('products/category/')) return { lang, pageType: 'product_category', owner: 'Product Series', primaryKeyword: `${slugToKeyword(lastSegment)} hot stamping foil` };
  if (route.startsWith('products/item/')) return { lang, pageType: 'product_detail', owner: 'Product Item', primaryKeyword: `${slugToKeyword(lastSegment)} foil` };
  if (route.startsWith('solutions/')) return { lang, pageType: 'solution', owner: 'Application Solution', primaryKeyword: `hot stamping foil for ${slugToKeyword(lastSegment)}` };
  if (route.startsWith('blog/')) return { lang, pageType: 'blog', owner: 'Content', primaryKeyword: slugToKeyword(lastSegment) };
  if (route === 'products' || route === 'products/foils') return { lang, pageType: 'product_catalog', owner: 'Product Catalog', primaryKeyword: 'hot stamping foil manufacturer' };
  if (route === 'quote') return { lang, pageType: 'conversion', owner: 'Sales Inquiry', primaryKeyword: 'hot stamping foil supplier inquiry' };
  return { lang, pageType: 'static', owner: 'Core Website', primaryKeyword: slugToKeyword(lastSegment) };
}

function buildCoverageRows(urls: string[]): CoverageRow[] {
  const pageMap = new Map(priorityPages.map((page) => [normalizeUrl(page.url), page]));

  return urls.map((url) => {
    const normalized = normalizeUrl(url);
    const configured = pageMap.get(normalized);
    const parsed = parseSitemap(normalized);

    return {
      url: normalized,
      lang: parsed.lang,
      pageType: parsed.pageType,
      owner: configured?.owner || parsed.owner,
      primaryKeyword: configured?.primaryKeyword || parsed.primaryKeyword,
      geoTargets: configured?.geoTargets || markets.slice(0, 4),
      source: configured ? 'configured' : 'inferred',
      action: configured ? 'monitor_and_refresh' : 'needs_keyword_mapping',
    };
  });
}

const SeoGeoSop: React.FC = () => {
  const { lang } = useLanguage();
  const [sitemapUrls, setSitemapUrls] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState('');
  const [copyState, setCopyState] = useState('');

  const isCn = lang === 'cn';

  useEffect(() => {
    const savedSteps = window.localStorage.getItem('pinte-seo-geo-steps');
    const savedNotes = window.localStorage.getItem('pinte-seo-geo-notes');
    if (savedSteps) setCheckedSteps(JSON.parse(savedSteps));
    if (savedNotes) setNotes(savedNotes);
  }, []);

  useEffect(() => {
    fetch('/sitemap.xml')
      .then((response) => response.text())
      .then((xml) => {
        const urls = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((match) => match[1]);
        setSitemapUrls(urls);
      })
      .catch(() => setSitemapUrls(priorityPages.map((page) => page.url)));
  }, []);

  useEffect(() => {
    window.localStorage.setItem('pinte-seo-geo-steps', JSON.stringify(checkedSteps));
  }, [checkedSteps]);

  useEffect(() => {
    window.localStorage.setItem('pinte-seo-geo-notes', notes);
  }, [notes]);

  const coverageRows = useMemo(() => buildCoverageRows(sitemapUrls), [sitemapUrls]);
  const pageTypes = useMemo(() => ['all', ...Array.from(new Set(coverageRows.map((row) => row.pageType))).sort()], [coverageRows]);
  const configuredCount = coverageRows.filter((row) => row.source === 'configured').length;
  const pendingCount = coverageRows.filter((row) => row.action === 'needs_keyword_mapping').length;
  const completedSteps = sopSteps.filter((step) => checkedSteps[step.id]).length;

  const filteredRows = coverageRows.filter((row) => {
    const text = `${row.url} ${row.primaryKeyword} ${row.owner} ${row.geoTargets.join(' ')}`.toLowerCase();
    const matchesQuery = !query || text.includes(query.toLowerCase());
    const matchesType = typeFilter === 'all' || row.pageType === typeFilter;
    const matchesStatus = statusFilter === 'all' || row.action === statusFilter || row.source === statusFilter;
    return matchesQuery && matchesType && matchesStatus;
  });

  const monthlyBrief = [
    `PINTE SEO/GEO Cycle`,
    `Sitemap URLs: ${coverageRows.length}`,
    `Configured priority pages: ${configuredCount}`,
    `Needs keyword mapping: ${pendingCount}`,
    `Markets: ${markets.join(', ')}`,
    `Next actions: export GSC/Bing data, select 3 SEO terms, select 3 GEO terms, update content placements, regenerate sitemap, submit IndexNow.`,
  ].join('\n');

  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopyState(label);
    window.setTimeout(() => setCopyState(''), 1800);
  };

  return (
    <>
      <SEOMeta
        title={isCn ? 'SEO/GEO SOP 工作台 - PINTE' : 'SEO/GEO SOP Workspace - PINTE'}
        description={isCn
          ? 'PINTE SEO/GEO SOP 工作台，用于盘点 sitemap 覆盖、关键词映射、GSC/Bing 记录和 AI 搜索可见性检查。'
          : 'PINTE SEO/GEO SOP workspace for sitemap coverage, keyword mapping, GSC/Bing records, and AI search visibility checks.'}
        keywords={['SEO SOP', 'GEO SEO', 'sitemap coverage', 'IndexNow', 'Google Search Console', 'Bing Webmaster Tools', 'AI search visibility']}
        type="website"
        locale={isCn ? 'zh_CN' : 'en_US'}
        canonicalUrl={`/${lang}/seo-geo-sop`}
      />

      <main className="pt-24 pb-16 bg-neutral-50 min-h-screen">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <section className="mb-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-3xl md:text-5xl font-display font-bold text-neutral-950">
                  {isCn ? 'SEO/GEO SOP 工作台' : 'SEO/GEO SOP Workspace'}
                </h1>
                <p className="mt-4 max-w-3xl text-base md:text-lg text-neutral-600">
                  {isCn
                    ? '按 sitemap 全量 URL 盘点关键词、地域词、收录状态和 AI 搜索可见性，每次优化都留下可复查记录。'
                    : 'Audit every sitemap URL for keywords, market terms, indexing status, and AI search visibility with a repeatable workflow.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(monthlyBrief, isCn ? '已复制月度摘要' : 'Monthly brief copied')}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-pinte-blue px-4 text-sm font-semibold text-white shadow-soft transition hover:bg-pinte-dark"
              >
                <Copy size={18} />
                {isCn ? '复制月度摘要' : 'Copy Monthly Brief'}
              </button>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-8">
            {[
              { icon: <Database size={22} />, label: isCn ? 'Sitemap URL' : 'Sitemap URLs', value: coverageRows.length, sub: isCn ? '自动读取 /sitemap.xml' : 'Loaded from /sitemap.xml' },
              { icon: <Target size={22} />, label: isCn ? '重点页配置' : 'Priority Pages', value: configuredCount, sub: isCn ? '已有明确关键词' : 'Explicit keyword mapping' },
              { icon: <Filter size={22} />, label: isCn ? '待补关键词' : 'Needs Mapping', value: pendingCount, sub: isCn ? '下一轮优先补齐' : 'Prioritize next cycle' },
              { icon: <ClipboardCheck size={22} />, label: isCn ? 'SOP 进度' : 'SOP Progress', value: `${completedSteps}/${sopSteps.length}`, sub: isCn ? '本地保存' : 'Saved locally' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="text-pinte-blue">{item.icon}</div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{item.label}</span>
                </div>
                <div className="mt-5 text-3xl font-bold text-neutral-950">{item.value}</div>
                <div className="mt-1 text-sm text-neutral-500">{item.sub}</div>
              </div>
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-neutral-200 p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-950">{isCn ? 'Sitemap 关键词覆盖' : 'Sitemap Keyword Coverage'}</h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      {isCn ? '筛出待补映射页面，逐步把所有 URL 纳入 SEO/GEO 内容维护。' : 'Filter unmapped pages and bring every URL into the SEO/GEO content cycle.'}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <label className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={17} />
                      <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={isCn ? '搜索 URL / 关键词 / 市场' : 'Search URL / keyword / market'}
                        className="h-10 w-full sm:w-64 rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-pinte-blue"
                      />
                    </label>
                    <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-pinte-blue">
                      {pageTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                    </select>
                    <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-pinte-blue">
                      <option value="all">{isCn ? '全部状态' : 'All status'}</option>
                      <option value="configured">configured</option>
                      <option value="needs_keyword_mapping">needs_keyword_mapping</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-left text-sm">
                  <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
                    <tr>
                      <th className="px-5 py-3 font-semibold">URL</th>
                      <th className="px-5 py-3 font-semibold">{isCn ? '类型' : 'Type'}</th>
                      <th className="px-5 py-3 font-semibold">{isCn ? '主关键词' : 'Primary keyword'}</th>
                      <th className="px-5 py-3 font-semibold">GEO</th>
                      <th className="px-5 py-3 font-semibold">{isCn ? '状态' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredRows.slice(0, 80).map((row) => (
                      <tr key={row.url} className="align-top hover:bg-neutral-50">
                        <td className="px-5 py-4">
                          <a className="inline-flex max-w-[360px] items-start gap-2 break-all font-medium text-neutral-900 hover:text-pinte-blue" href={row.url} target="_blank" rel="noreferrer">
                            {row.url.replace('https://www.pintecl.com', '')}
                            <ExternalLink size={14} className="mt-0.5 shrink-0" />
                          </a>
                          <div className="mt-1 text-xs text-neutral-500">{row.owner} · {row.lang || 'n/a'}</div>
                        </td>
                        <td className="px-5 py-4 text-neutral-600">{row.pageType}</td>
                        <td className="px-5 py-4 font-medium text-neutral-900">{row.primaryKeyword}</td>
                        <td className="px-5 py-4 text-neutral-600">{row.geoTargets.slice(0, 3).join(', ')}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${row.action === 'monitor_and_refresh' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                            {row.action}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredRows.length > 80 && (
                <div className="border-t border-neutral-100 px-5 py-3 text-sm text-neutral-500">
                  {isCn ? `已显示前 80 条，共 ${filteredRows.length} 条。继续缩小筛选条件。` : `Showing first 80 of ${filteredRows.length}. Narrow the filters to inspect more.`}
                </div>
              )}
            </div>

            <aside className="space-y-6">
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-pinte-blue" />
                  <h2 className="text-lg font-bold text-neutral-950">{isCn ? '月度 SOP' : 'Monthly SOP'}</h2>
                </div>
                <div className="mt-4 space-y-3">
                  {sopSteps.map((step) => (
                    <label key={step.id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-100 p-3 transition hover:border-pinte-blue/40 hover:bg-pinte-light">
                      <input
                        type="checkbox"
                        checked={Boolean(checkedSteps[step.id])}
                        onChange={(event) => setCheckedSteps((current) => ({ ...current, [step.id]: event.target.checked }))}
                        className="mt-1 h-4 w-4 accent-pinte-blue"
                      />
                      <span className="text-sm leading-6 text-neutral-700">{isCn ? step.cn : step.en}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <Globe2 size={20} className="text-pinte-blue" />
                  <h2 className="text-lg font-bold text-neutral-950">{isCn ? 'GEO 市场词' : 'GEO Market Terms'}</h2>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {markets.map((market) => (
                    <button
                      key={market}
                      type="button"
                      onClick={() => setQuery(market)}
                      className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 transition hover:border-pinte-blue hover:text-pinte-blue"
                    >
                      {market}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <Sparkles size={20} className="text-pinte-blue" />
                  <h2 className="text-lg font-bold text-neutral-950">{isCn ? '本轮记录' : 'Cycle Notes'}</h2>
                </div>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={8}
                  placeholder={isCn ? '记录本轮 GSC/Bing 查询、平均排名、待改页面、AI 引用情况...' : 'Record GSC/Bing queries, average position, target pages, AI citation status...'}
                  className="mt-4 w-full resize-none rounded-xl border border-neutral-200 p-3 text-sm outline-none focus:border-pinte-blue"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(notes || monthlyBrief, isCn ? '已复制记录' : 'Notes copied')}
                  className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 text-sm font-semibold text-neutral-700 transition hover:border-pinte-blue hover:text-pinte-blue"
                >
                  <Copy size={16} />
                  {copyState || (isCn ? '复制记录' : 'Copy Notes')}
                </button>
              </div>
            </aside>
          </section>
        </div>
      </main>
    </>
  );
};

export default SeoGeoSop;
