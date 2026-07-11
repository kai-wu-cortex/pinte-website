import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpenText, ClipboardCheck, Layers, SearchCheck, Wrench } from 'lucide-react';
import SEOMeta, { generateBreadcrumbSchema } from '../components/SEOMeta';
import { GEO_GUIDES, type GeoGuide, type GuideLang } from '../data/geoGuides';
import { useLanguage } from '../contexts/LanguageContext';

const SITE_URL = 'https://www.pintecl.com';

const asGuideLang = (lang: string): GuideLang => (lang === 'cn' ? 'cn' : 'en');

const guideCategory = (guide: GeoGuide, lang: GuideLang) => {
  const text = `${guide.slug} ${guide.title.en} ${guide.title.cn}`.toLowerCase();
  if (text.includes('troubleshooting') || text.includes('structure') || text.includes('substrate') || text.includes('故障') || text.includes('结构') || text.includes('底材')) {
    return lang === 'cn' ? '结构、底材与故障排查' : 'Structure, Substrate and Troubleshooting';
  }
  if (text.includes('cold') || text.includes('holographic') || text.includes('foil-vs') || text.includes('冷烫') || text.includes('镭射')) {
    return lang === 'cn' ? '工艺与产品对比' : 'Process and Product Comparison';
  }
  if (text.includes('chatgpt') || text.includes('geo') || text.includes('buyer question') || text.includes('aig') || text.includes('ai')) {
    return lang === 'cn' ? 'AI 搜索与 GEO 内容策略' : 'AI Search and GEO Content Strategy';
  }
  return lang === 'cn' ? '核心采购指南' : 'Core Procurement Guides';
};

const categoryIcon = (category: string) => {
  if (category.includes('故障') || category.includes('Troubleshooting')) return Wrench;
  if (category.includes('对比') || category.includes('Comparison')) return Layers;
  if (category.includes('AI') || category.includes('GEO')) return SearchCheck;
  return ClipboardCheck;
};

const categoryId = (category: string) => {
  if (category.includes('故障') || category.includes('Troubleshooting')) return 'structure-troubleshooting';
  if (category.includes('对比') || category.includes('Comparison')) return 'process-comparison';
  if (category.includes('AI') || category.includes('GEO')) return 'ai-geo';
  return 'procurement-guides';
};

const GeoGuideCatalog: React.FC = () => {
  const { lang: currentLang } = useLanguage();
  const lang = asGuideLang(currentLang);
  const sortedGuides = [...GEO_GUIDES].sort((a, b) => a.priority - b.priority || a.title[lang].localeCompare(b.title[lang]));
  const groups = sortedGuides.reduce<Record<string, GeoGuide[]>>((acc, guide) => {
    const category = guideCategory(guide, lang);
    acc[category] = acc[category] || [];
    acc[category].push(guide);
    return acc;
  }, {});

  const title = lang === 'cn'
    ? '烫金膜采购指南与 GEO 文章导航'
    : 'Hot Stamping Foil Procurement Guides and GEO Article Directory';
  const description = lang === 'cn'
    ? '浏览 PINTE 烫金膜采购指南、底材选型、故障排查、热烫冷烫对比、化妆品包装、纸盒包装和 AI 搜索 GEO 内容。'
    : 'Browse PINTE hot stamping foil procurement guides, substrate selection, troubleshooting, hot foil vs cold foil comparisons, cosmetic packaging, paper box packaging, and AI-search-ready GEO content.';
  const canonicalUrl = `/${lang}/guides`;
  const keywords = lang === 'cn'
    ? ['烫金膜采购指南', '烫金膜选型', '烫金膜故障排查', '热烫膜', '冷烫膜', 'GEO', 'AI 搜索优化']
    : ['hot stamping foil guides', 'hot stamping foil buying guide', 'foil troubleshooting', 'hot foil', 'cold foil', 'GEO', 'AI search optimization'];
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: lang === 'cn' ? '首页' : 'Home', url: `${SITE_URL}/${lang}/` },
    { name: lang === 'cn' ? '采购指南' : 'Procurement Guides', url: `${SITE_URL}${canonicalUrl}/` },
  ]);
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    description,
    itemListElement: sortedGuides.map((guide, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: guide.title[lang],
      url: `${SITE_URL}/${lang}/guides/${guide.slug}/`,
    })),
  };

  return (
    <>
      <SEOMeta
        title={`${title} | PINTE`}
        description={description}
        keywords={keywords}
        type="website"
        locale={lang === 'cn' ? 'zh_CN' : 'en_US'}
        canonicalUrl={canonicalUrl}
      />
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>

      <main className="bg-neutral-50 pt-28 pb-20">
        <section className="max-w-[1120px] mx-auto px-6">
          <div className="mb-10">
            <p className="text-sm font-bold tracking-wide uppercase text-pinte-blue mb-4">
              {lang === 'cn' ? 'Procurement Guides / GEO Content Hub' : 'Procurement Guides / GEO Content Hub'}
            </p>
            <h1 className="text-3xl md:text-5xl font-display font-bold text-neutral-950 leading-tight mb-5">
              {title}
            </h1>
            <p className="text-lg text-neutral-600 leading-relaxed max-w-4xl">
              {description}
            </p>
          </div>

          <nav className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-12" aria-label={lang === 'cn' ? '指南分类导航' : 'Guide category navigation'}>
            {Object.keys(groups).map((category) => {
              const Icon = categoryIcon(category);
              return (
                <a key={category} href={`#${categoryId(category)}`} className="bg-white border border-neutral-100 rounded-2xl p-4 hover:border-pinte-blue/30 hover:shadow-sm transition-all">
                  <Icon size={20} className="text-pinte-blue mb-3" />
                  <span className="block font-bold text-neutral-950">{category}</span>
                  <span className="block text-sm text-neutral-500 mt-1">
                    {groups[category].length} {lang === 'cn' ? '篇' : 'guides'}
                  </span>
                </a>
              );
            })}
          </nav>

          <div className="space-y-12">
            {Object.entries(groups).map(([category, guides]) => {
              const Icon = categoryIcon(category);
              return (
                <section key={category} id={categoryId(category)} className="scroll-mt-28">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-pinte-blue/10 text-pinte-blue flex items-center justify-center">
                      <Icon size={21} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-neutral-950">{category}</h2>
                      <p className="text-sm text-neutral-500">
                        {lang === 'cn' ? '用于采购判断、技术选型和 AI 搜索可引用答案。' : 'For procurement decisions, technical selection, and AI-search-citable answers.'}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    {guides.map((guide) => (
                      <article key={guide.slug} className="bg-white border border-neutral-100 rounded-2xl p-6 hover:border-pinte-blue/30 hover:shadow-sm transition-all">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <BookOpenText size={22} className="text-pinte-blue shrink-0 mt-1" />
                          <span className="text-xs font-bold text-neutral-500 bg-neutral-100 rounded-full px-3 py-1">
                            P{guide.priority}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-neutral-950 leading-snug mb-3">
                          <Link to={`/${lang}/guides/${guide.slug}`} className="hover:text-pinte-blue transition-colors">
                            {guide.title[lang]}
                          </Link>
                        </h3>
                        <p className="text-neutral-600 leading-relaxed mb-5">
                          {guide.metaDescription[lang]}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-5">
                          {[guide.primaryKeyword[lang], ...guide.secondaryKeywords[lang].slice(0, 3)].map((keyword) => (
                            <span key={keyword} className="text-xs text-neutral-600 bg-neutral-50 border border-neutral-100 rounded-full px-3 py-1">
                              {keyword}
                            </span>
                          ))}
                        </div>
                        <Link to={`/${lang}/guides/${guide.slug}`} className="inline-flex items-center gap-2 text-pinte-blue font-bold">
                          {lang === 'cn' ? '阅读指南' : 'Read guide'}
                          <ArrowRight size={17} />
                        </Link>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
};

export default GeoGuideCatalog;
