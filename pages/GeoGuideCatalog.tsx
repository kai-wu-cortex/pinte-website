import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpenText } from 'lucide-react';
import SEOMeta, { generateBreadcrumbSchema } from '../components/SEOMeta';
import { getPublishedGuideSummaries } from '../data/guideContent';
import {
  GUIDE_CLUSTERS,
  LEGACY_GUIDE_CLUSTERS,
  resolveGuideClusterId,
  type GuideClusterId,
} from '../data/guideClusters';
import { GEO_GUIDES, guideCustomerText, type GuideLang } from '../data/geoGuides';
import { useLanguage } from '../contexts/LanguageContext';
import { resolveGuideImageAsset } from '../data/guideImages';

const SITE_URL = 'https://www.pintecl.com';
const GENERATED_GUIDE_DEFAULT_PRIORITY = 100;

const asGuideLang = (lang: string): GuideLang => (lang === 'cn' ? 'cn' : 'en');

interface CatalogGuideSummary {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly cluster: GuideClusterId;
  readonly priority: number;
  readonly imageSrc: string;
  readonly imageAlt: string;
}

const compareTitles = (a: string, b: string) => {
  if (a === b) return 0;
  return a < b ? -1 : 1;
};

const GeoGuideCatalog: React.FC = () => {
  const { lang: currentLang } = useLanguage();
  const lang = asGuideLang(currentLang);
  const text = (value: string | undefined, fallback = '') => guideCustomerText(value ?? fallback, lang);
  const descriptionFallback = lang === 'cn'
    ? '查看本指南，了解烫金膜选型、打样和生产确认要点。'
    : 'Read this guide for hot stamping foil selection, sampling, and production checks.';
  const clusterOrder = new Map(GUIDE_CLUSTERS.map((cluster) => [cluster.id, cluster.order]));
  const mergedGuides = new Map<string, CatalogGuideSummary>();

  GEO_GUIDES.forEach((guide) => {
    mergedGuides.set(guide.slug, {
      slug: guide.slug,
      title: text(guide.title[lang]),
      description: text(guide.metaDescription[lang], descriptionFallback),
      cluster: resolveGuideClusterId(LEGACY_GUIDE_CLUSTERS[guide.slug]),
      priority: guide.priority,
      imageSrc: resolveGuideImageAsset({
        slug: guide.slug,
        cluster: LEGACY_GUIDE_CLUSTERS[guide.slug],
        primaryKeyword: guide.primaryKeyword[lang],
      }).src,
      imageAlt: resolveGuideImageAsset({
        slug: guide.slug,
        cluster: LEGACY_GUIDE_CLUSTERS[guide.slug],
        primaryKeyword: guide.primaryKeyword[lang],
      }).alt[lang],
    });
  });

  getPublishedGuideSummaries(lang).forEach((guide) => {
    const slug = guide.slug?.trim();
    const title = guide.title?.trim();
    if (!slug || !title) return;

    mergedGuides.set(slug, {
      slug,
      title: text(title),
      description: text(guide.description?.trim(), descriptionFallback),
      cluster: resolveGuideClusterId(guide.cluster?.trim()),
      priority: GENERATED_GUIDE_DEFAULT_PRIORITY,
      imageSrc: resolveGuideImageAsset({
        slug,
        cluster: guide.cluster,
        primaryKeyword: guide.title,
      }).src,
      imageAlt: resolveGuideImageAsset({
        slug,
        cluster: guide.cluster,
        primaryKeyword: guide.title,
      }).alt[lang],
    });
  });

  const sortedGuides = [...mergedGuides.values()].sort((a, b) => (
    (clusterOrder.get(a.cluster) ?? Number.MAX_SAFE_INTEGER)
      - (clusterOrder.get(b.cluster) ?? Number.MAX_SAFE_INTEGER)
    || a.priority - b.priority
    || compareTitles(a.title, b.title)
    || compareTitles(a.slug, b.slug)
  ));
  const groupedGuides = new Map<GuideClusterId, CatalogGuideSummary[]>(
    GUIDE_CLUSTERS.map((cluster) => [cluster.id, []]),
  );
  sortedGuides.forEach((guide) => groupedGuides.get(guide.cluster)?.push(guide));

  const title = lang === 'cn'
    ? '烫金膜采购指南与技术文章导航'
    : 'Hot Stamping Foil Procurement Guides and Technical Article Directory';
  const description = lang === 'cn'
    ? '浏览 PINTE 烫金膜采购指南、底材选型、故障排查、热烫冷烫对比、化妆品包装、纸盒包装和技术资料。'
    : 'Browse PINTE hot stamping foil procurement guides, substrate selection, troubleshooting, hot foil vs cold foil comparisons, cosmetic packaging, paper box packaging, and technical resources.';
  const canonicalUrl = `/${lang}/guides`;
  const keywords = lang === 'cn'
    ? ['烫金膜采购指南', '烫金膜选型', '烫金膜故障排查', '热烫膜', '冷烫膜', '包装烫金技术']
    : ['hot stamping foil guides', 'hot stamping foil buying guide', 'foil troubleshooting', 'hot foil', 'cold foil', 'foil stamping technical resources'];
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
      name: guide.title,
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
              {lang === 'cn' ? '采购指南 / 技术资料中心' : 'Procurement Guides / Technical Resource Center'}
            </p>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-neutral-950 leading-tight mb-5">
              {title}
            </h1>
            <p className="text-lg text-neutral-600 leading-relaxed max-w-4xl">
              {description}
            </p>
          </div>

          <section className="mb-12 grid gap-5 md:grid-cols-3" aria-label={lang === 'cn' ? '指南使用方法' : 'How to use these guides'}>
            {[
              {
                title: lang === 'cn' ? '按底材开始' : 'Start from substrate',
                body: lang === 'cn'
                  ? '先确认纸张、塑料、皮革、UV 光油、覆膜或标签面材，再筛选膜系和打样范围。'
                  : 'Confirm paper, plastic, leather, UV varnish, lamination, or label facestock before choosing foil families and sample scope.',
              },
              {
                title: lang === 'cn' ? '按问题定位' : 'Locate the defect',
                body: lang === 'cn'
                  ? '把掉金、缺金、糊边、断线、套准偏移和颜色差异分开排查，避免混合调整。'
                  : 'Separate peeling, missing transfer, blurred edges, broken lines, registration shift, and color variation before changing settings.',
              },
              {
                title: lang === 'cn' ? '按打样锁定' : 'Lock by sampling',
                body: lang === 'cn'
                  ? '所有建议都应回到真实底材、机台、图稿和速度条件下验证，并保留确认样。'
                  : 'Validate every recommendation on the actual substrate, press, artwork, and speed, then keep an approved sample.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <h2 className="mb-2 text-lg font-bold text-neutral-950">{item.title}</h2>
                <p className="text-sm leading-relaxed text-neutral-600">{item.body}</p>
              </div>
            ))}
          </section>

          <nav className="-mx-6 mb-12 overflow-x-auto px-6 pb-2" aria-label={lang === 'cn' ? '指南分类导航' : 'Guide category navigation'}>
            <ul className="flex min-w-max gap-2 lg:min-w-0 lg:flex-wrap">
              {GUIDE_CLUSTERS.map((cluster) => (
                <li key={cluster.id}>
                  <a
                    href={`#${cluster.id}`}
                    className="inline-flex min-h-11 items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-800 transition-colors hover:border-pinte-blue/40 hover:text-pinte-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pinte-blue"
                  >
                    <span>{cluster.label[lang]}</span>
                    <span className="text-neutral-500">{groupedGuides.get(cluster.id)?.length ?? 0}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-12">
            {GUIDE_CLUSTERS.map((cluster) => {
              const guides = groupedGuides.get(cluster.id) ?? [];
              return (
                <section key={cluster.id} id={cluster.id} className="scroll-mt-28">
                  <header className="mb-3 max-w-3xl">
                    <h2 className="text-2xl font-bold text-neutral-950">{cluster.label[lang]}</h2>
                    <p className="mt-2 text-neutral-600 leading-relaxed">{cluster.description[lang]}</p>
                  </header>

                  {guides.length > 0 ? (
                    <div className="grid md:grid-cols-2 md:gap-x-8">
                      {guides.map((guide) => (
                        <article key={guide.slug} className="min-w-0 border-t border-neutral-200 py-6">
                          <Link to={`/${lang}/guides/${guide.slug}/`} className="group mb-4 block overflow-hidden rounded-xl bg-neutral-100">
                            <img
                              src={guide.imageSrc}
                              alt={guide.imageAlt}
                              width={1200}
                              height={675}
                              loading="lazy"
                              className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </Link>
                          <BookOpenText size={21} className="mb-3 text-pinte-blue" aria-hidden="true" />
                          <h3 className="text-xl font-bold text-neutral-950 leading-snug mb-3">
                            <Link to={`/${lang}/guides/${guide.slug}/`} className="hover:text-pinte-blue transition-colors">
                              {guide.title}
                            </Link>
                          </h3>
                          <p className="text-neutral-600 leading-relaxed mb-5">
                            {guide.description}
                          </p>
                          <Link to={`/${lang}/guides/${guide.slug}/`} className="inline-flex items-center gap-2 text-pinte-blue font-bold">
                            {lang === 'cn' ? '阅读指南' : 'Read guide'}
                            <ArrowRight size={17} aria-hidden="true" />
                          </Link>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="border-t border-neutral-200 py-5 text-sm text-neutral-500">
                      {lang === 'cn' ? '更多相关指南正在整理中。' : 'More guides on this topic are in preparation.'}
                    </p>
                  )}
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
