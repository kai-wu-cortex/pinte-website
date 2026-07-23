import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpenText, CalendarCheck, ClipboardCheck, Factory } from 'lucide-react';
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
import { GUIDE_IMAGE_ASSETS, resolveGuideImageAsset } from '../data/guideImages';

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

const normalizeGeneratedCopy = (value: string, lang: GuideLang): string => {
  let output = value
    .replace(/the target packaging application/gi, lang === 'cn' ? '具体包装应用' : 'the packaging application')
    .replace(/the actual surface treatment/gi, lang === 'cn' ? '实际表面处理' : 'the actual surface treatment')
    .replace(/the planned stamping process/gi, lang === 'cn' ? '计划烫印工艺' : 'the planned stamping process')
    .replace(/Combined foil stamping and embossing/gi, lang === 'cn' ? '烫金压凸' : 'combined foil stamping and embossing')
    .replace(/Flatbed or platen hot stamping/gi, lang === 'cn' ? '平压平热烫' : 'flatbed or platen hot stamping')
    .replace(/Narrow-web cold foil transfer/gi, lang === 'cn' ? '窄幅冷烫' : 'narrow-web cold foil transfer')
    .replace(/Corona or plasma treatment/gi, lang === 'cn' ? '电晕或等离子处理' : 'corona or plasma treatment')
    .replace(/As-supplied or uncoated surface/gi, lang === 'cn' ? '原始或未涂布表面' : 'as-supplied or uncoated surface')
    .replace(/Roll width, length, winding, and core/gi, lang === 'cn' ? '宽幅、长度、绕向和卷芯' : 'roll width, length, winding, and core')
    .replace(/Foil web tension and feed/gi, lang === 'cn' ? '膜带张力和走膜' : 'foil web tension and feed')
    .replace(/MOQ and order quantity/gi, lang === 'cn' ? '起订量和采购数量' : 'MOQ and order quantity')
    .replace(/Lead time and logistics/gi, lang === 'cn' ? '交期和物流' : 'lead time and logistics')
    .replace(/Alcohol or chemical resistance failure/gi, lang === 'cn' ? '酒精或化学擦拭失败' : 'alcohol or chemical resistance failure')
    .replace(/Blurred detail, filling, or loss of negative space/gi, lang === 'cn' ? '糊边、糊版或反白细节丢失' : 'blurred detail, filling, or loss of negative space')
    .replace(/Color, gloss, or optical-effect variation/gi, lang === 'cn' ? '颜色、光泽或光学效果差异' : 'color, gloss, or optical-effect variation')
    .replace(/Foil flaking, dusting, or edge debris/gi, lang === 'cn' ? '掉粉、碎金或边缘碎屑' : 'foil flaking, dusting, or edge debris')
    .replace(/Incomplete or missing transfer/gi, lang === 'cn' ? '缺金或转移不完整' : 'incomplete or missing transfer')
    .replace(/Mottling, pinholes, or uneven solid coverage/gi, lang === 'cn' ? '发花、针孔或大面积不均' : 'mottling, pinholes, or uneven solid coverage')
    .replace(/Poor adhesion or peeling/gi, lang === 'cn' ? '附着不牢或掉金' : 'poor adhesion or peeling')
    .replace(/Register shift or hologram placement error/gi, lang === 'cn' ? '套准偏移或镭射定位偏差' : 'register shift or hologram placement error')
    .replace(/Scratch, scuff, or rub failure/gi, lang === 'cn' ? '刮擦或耐磨失败' : 'scratch, scuff, or rub failure')
    .replace(/\s+/g, ' ')
    .trim();

  if (lang === 'cn') {
    output = output
      .replace(/^[A-Za-z0-9,&/().\-\s]+：/, '')
      .replace(/在烫金中的含义在具体包装应用中的采购术语/g, '在烫金中的含义')
      .replace(/在具体包装应用中的采购术语/g, '在烫金项目中的采购术语')
      .replace(/，重点处理[^）。]+/g, '，说明打样确认、参数窗口和量产验收')
      .replace(/重点处理[^）。]+/g, '说明打样确认、参数窗口和量产验收')
      .replace(/（[^）]*$/g, '')
      .replace(/。+$/g, '。')
      .trim();
  }

  return output;
};

const cleanCatalogTitle = (value: string, lang: GuideLang): string => {
  let title = normalizeGeneratedCopy(value, lang);

  if (lang === 'cn') {
    if (title.length > 42 && title.includes('（')) {
      title = title.split('（')[0].trim();
    }
    title = title
      .replace(/^[^：]{1,14}）：/, '')
      .replace(/出现(.+)的原因$/, '出现$1的原因与处理')
      .replace(/什么区别？$/, '区别与选型建议')
      .replace(/采购术语$/, '采购含义')
      .replace(/指南指南/g, '指南');
  }

  return title;
};

const cleanCatalogDescription = (value: string | undefined, fallback: string, lang: GuideLang): string => {
  let cleaned = normalizeGeneratedCopy(value?.trim() || fallback, lang);
  if (!cleaned) return fallback;
  if (lang === 'cn' && cleaned.length < 26) return fallback;
  if (lang === 'cn' && !/[。！？]$/.test(cleaned)) {
    cleaned = `${cleaned}，说明打样确认、参数窗口和量产验收。`;
  }
  return cleaned;
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
      title: cleanCatalogTitle(text(guide.title[lang]), lang),
      description: cleanCatalogDescription(text(guide.metaDescription[lang], descriptionFallback), descriptionFallback, lang),
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
      title: cleanCatalogTitle(text(title), lang),
      description: cleanCatalogDescription(text(guide.description?.trim(), descriptionFallback), descriptionFallback, lang),
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
  const featuredImages = [
    GUIDE_IMAGE_ASSETS.sourceMetallicFoilRollLibrary,
    GUIDE_IMAGE_ASSETS.sourceCosmeticPackagingDisplay,
  ];
  const selectionMatrix = lang === 'cn'
    ? [
      ['纸张 / 纸盒', '铜版纸、白卡、特种纸、覆膜纸板', '确认表面涂层、纹理深浅、细线与大面积实地是否同时存在。', '纸张与纸盒包装'],
      ['化妆品包装', '纸盒、标签、瓶盖、塑料件', '优先验证色差、耐酒精、耐磨、边缘洁净度和复购批次稳定性。', '化妆品包装'],
      ['标签冷烫', '薄膜标签、纸质标签、UV 胶层', '重点看张力、胶量、套准、固化和镭射光学效果复现。', '标签印刷'],
      ['塑料 / 皮革', 'ABS、PP、PE、PU、真皮、合成革', '必须先确认表面能、油污、涂层和耐刮耐磨要求。', '塑料制品 / 皮革制品'],
    ]
    : [
      ['Paper / carton', 'Coated paper, white card, specialty paper, laminated board', 'Confirm coating, texture, fine detail, and large solid areas together.', 'Paper and carton packaging'],
      ['Cosmetic packaging', 'Cartons, labels, caps, plastic parts', 'Verify color consistency, alcohol resistance, rub resistance, clean edges, and repeat batches.', 'Cosmetic packaging'],
      ['Cold foil labels', 'Film labels, paper labels, UV adhesive layer', 'Check web tension, adhesive volume, registration, curing, and holographic repeatability.', 'Label printing'],
      ['Plastic / leather', 'ABS, PP, PE, PU, natural leather, synthetic leather', 'Confirm surface energy, contamination, coating, scratch resistance, and rub resistance first.', 'Plastics / leather'],
    ];
  const defectMatrix = lang === 'cn'
    ? [
      ['烫不上 / 缺金', '压力接触不足、离型不匹配、底材表面能低', '先固定图稿和速度，只调压力/温度其中一个变量。'],
      ['掉金 / 附着不牢', '底材污染、涂层相容性差、耐性膜型选错', '做胶带、耐磨、耐酒精或折痕测试，不用手擦代替。'],
      ['糊边 / 细节丢失', '温度过高、压力过大、版纹磨损或膜释放过宽', '用小字、反白线和 Logo 细节做专门打样区。'],
      ['色差 / 光泽差异', '批次、底材颜色、烫印温度和观察角度不同', '保留确认样和卷标，复购时按样品和批号沟通。'],
    ]
    : [
      ['Missing transfer', 'Insufficient contact, release mismatch, low surface energy', 'Hold artwork and speed constant; change only pressure or temperature first.'],
      ['Peeling / poor adhesion', 'Contamination, coating incompatibility, wrong durability grade', 'Use tape, rub, alcohol, or fold tests instead of informal hand rubbing.'],
      ['Blurred edges', 'Excessive temperature/pressure, worn die, overly broad release', 'Include small text, reverse lines, and logo detail in the sampling area.'],
      ['Color / gloss variation', 'Batch, substrate color, stamping temperature, or viewing angle', 'Keep approved samples and roll labels for repeat-order communication.'],
    ];
  const faqItems = lang === 'cn'
    ? [
      {
        question: '采购烫金膜时第一步应该确认什么？',
        answer: '第一步不是选金色或银色，而是确认底材、表面处理、工艺路线、图稿难度和成品耐性要求；这些条件决定膜材胶层、离型和打样窗口。',
      },
      {
        question: '同一种烫金膜能不能同时用于纸张、塑料和皮革？',
        answer: '不建议直接通用。纸张、塑料和皮革的表面能、纹理、涂层和耐磨要求不同，需要分别打样并保留确认样。',
      },
      {
        question: '询价时需要给供应商哪些资料？',
        answer: '至少提供底材样、颜色或效果目标、卷宽/卷长/纸芯、烫印设备、温度压力速度范围、图稿难点、测试方法、数量和交期。',
      },
      {
        question: '页面里的指南适合谁使用？',
        answer: '适合包装厂、印刷厂、标签厂、化妆品包材采购、皮具厂和品牌包装负责人，用于选型、打样、故障排查和供应商沟通。',
      },
    ]
    : [
      {
        question: 'What should buyers confirm first when sourcing hot stamping foil?',
        answer: 'Start with substrate, surface treatment, process route, artwork difficulty, and durability expectations, because these conditions determine adhesive, release, and sampling window.',
      },
      {
        question: 'Can one foil grade be used on paper, plastic, and leather?',
        answer: 'Do not assume one universal grade. Paper, plastic, and leather differ in surface energy, texture, coating, and abrasion requirements, so each should be sampled separately.',
      },
      {
        question: 'What information should an RFQ include?',
        answer: 'Include substrate samples, target color/effect, roll width/length/core, machine route, temperature-pressure-speed range, artwork risks, test method, quantity, and lead time.',
      },
      {
        question: 'Who are these guides written for?',
        answer: 'They are written for packaging converters, printers, label shops, cosmetic packaging buyers, leather goods manufacturers, and brand packaging teams.',
      },
    ];
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
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
      <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>

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

          <section className="mb-12 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]" aria-label={lang === 'cn' ? 'PINTE 烫金膜指南编辑说明' : 'PINTE guide editorial notes'}>
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-pinte-blue/10 px-4 py-2 text-sm font-semibold text-pinte-blue">
                  <Factory size={16} aria-hidden="true" />
                  {lang === 'cn' ? '基于工厂打样与订单沟通整理' : 'Based on factory sampling and order communication'}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-700">
                  <CalendarCheck size={16} aria-hidden="true" />
                  {lang === 'cn' ? '最后更新：2026-07-23' : 'Last updated: 2026-07-23'}
                </span>
              </div>
              <h2 className="mb-3 text-2xl font-bold text-neutral-950">
                {lang === 'cn' ? '如何使用这个烫金膜知识中心' : 'How to use this hot stamping foil knowledge hub'}
              </h2>
              <p className="mb-4 leading-relaxed text-neutral-600">
                {lang === 'cn'
                  ? '本页不是普通博客列表，而是给采购、打样、机长和质量人员使用的烫金膜选型入口。建议先按底材和应用场景缩小范围，再进入对应指南核对参数、故障原因、打样方法和供应商询价信息。'
                  : 'This page is more than a blog list. It is a selection entry point for buyers, sampling teams, press operators, and quality teams. Start with substrate and application, then use the matching guide to confirm parameters, failure causes, sampling method, and RFQ details.'}
              </p>
              <p className="leading-relaxed text-neutral-600">
                {lang === 'cn'
                  ? 'PINTE 建议所有烫金膜订单至少保留三类样品：外观确认样、耐性测试样和量产留样。复购时用样品、卷标、批次和测试记录沟通，比只说“亮金”“哑金”或“镭射”更可靠。'
                  : 'PINTE recommends keeping three samples for every foil order: visual master, durability test sample, and retained production reference. For repeat orders, communicate with samples, roll labels, batch records, and test notes instead of only saying “bright gold,” “matte gold,” or “holographic.”'}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {featuredImages.map((image, index) => (
                <figure key={image.src} className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
                  <img
                    src={image.src}
                    alt={image.alt[lang]}
                    width={image.width}
                    height={image.height}
                    loading={index === 0 ? undefined : 'lazy'}
                    decoding="async"
                    className="aspect-[16/9] w-full object-cover"
                  />
                  <figcaption className="px-4 py-3 text-sm leading-relaxed text-neutral-600">
                    {image.caption[lang]}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>

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

          <section className="mb-12 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm" aria-labelledby="foil-selection-matrix">
            <div className="mb-5 max-w-3xl">
              <h2 id="foil-selection-matrix" className="text-2xl font-bold text-neutral-950">
                {lang === 'cn' ? '烫金膜选型快速判断表' : 'Quick hot stamping foil selection matrix'}
              </h2>
              <p className="mt-2 leading-relaxed text-neutral-600">
                {lang === 'cn'
                  ? '烫金膜选型的核心是“底材 + 表面处理 + 工艺路线 + 成品测试”。下面的表格用于先判断应该阅读哪个分类，而不是替代真实打样。'
                  : 'Foil selection depends on substrate, surface treatment, process route, and finished-product testing. Use this table to choose the right guide category before production sampling.'}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[760px] w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-500">
                    <th className="py-3 pr-4 font-semibold">{lang === 'cn' ? '应用场景' : 'Application'}</th>
                    <th className="py-3 pr-4 font-semibold">{lang === 'cn' ? '常见底材' : 'Common substrates'}</th>
                    <th className="py-3 pr-4 font-semibold">{lang === 'cn' ? '先确认的问题' : 'First checks'}</th>
                    <th className="py-3 font-semibold">{lang === 'cn' ? '建议入口' : 'Suggested entry'}</th>
                  </tr>
                </thead>
                <tbody>
                  {selectionMatrix.map(([application, substrate, check, entry]) => (
                    <tr key={application} className="border-b border-neutral-100 last:border-0">
                      <td className="py-4 pr-4 font-semibold text-neutral-950">{application}</td>
                      <td className="py-4 pr-4 text-neutral-700">{substrate}</td>
                      <td className="py-4 pr-4 leading-relaxed text-neutral-600">{check}</td>
                      <td className="py-4 font-semibold text-pinte-blue">{entry}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-12 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-neutral-950">
                {lang === 'cn' ? '常见故障先这样分流' : 'Route common foil defects this way'}
              </h2>
              <div className="space-y-4">
                {defectMatrix.map(([issue, cause, action]) => (
                  <div key={issue} className="rounded-2xl bg-neutral-50 p-4">
                    <h3 className="mb-1 font-bold text-neutral-950">{issue}</h3>
                    <p className="text-sm leading-relaxed text-neutral-600">
                      <span className="font-semibold text-neutral-800">{lang === 'cn' ? '可能原因：' : 'Likely cause: '}</span>
                      {cause}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-neutral-600">
                      <span className="font-semibold text-neutral-800">{lang === 'cn' ? '建议动作：' : 'Recommended action: '}</span>
                      {action}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <aside className="rounded-3xl border border-pinte-gold/30 bg-gradient-to-br from-pinte-gold/10 to-white p-6 shadow-sm">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-pinte-gold text-neutral-950">
                <ClipboardCheck size={22} aria-hidden="true" />
              </div>
              <h2 className="mb-3 text-2xl font-bold text-neutral-950">
                {lang === 'cn' ? '询价资料建议一次给全' : 'RFQ details to send at once'}
              </h2>
              <ul className="space-y-3 text-sm leading-relaxed text-neutral-700">
                {(lang === 'cn'
                  ? ['真实底材或成品样，不只发照片', '目标颜色、效果和可接受色差范围', '设备路线：热烫、冷烫、平压、圆压或数字烫', '图稿难点：大面积、细线、小字、反白、套准', '测试要求：百格、胶带、耐磨、耐酒精、折痕或运输摩擦', '卷宽、卷长、纸芯、绕向、数量、包装和交期']
                  : ['Actual substrate or finished sample, not only photos', 'Target color/effect and acceptable color tolerance', 'Process route: hot foil, cold foil, flatbed, rotary, or digital foil', 'Artwork risks: large solids, fine lines, small type, reverse detail, registration', 'Test requirements: cross-hatch, tape, rub, alcohol, fold, or transport abrasion', 'Roll width, roll length, core, winding, quantity, packing, and lead time']
                ).map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-pinte-blue" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs leading-relaxed text-neutral-500">
                {lang === 'cn'
                  ? '合规和化学限制可参考欧盟 REACH 与 RoHS 官方页面；具体订单仍需按客户市场、材料体系和测试项目确认。'
                  : 'For compliance and chemical restrictions, refer to official EU REACH and RoHS pages; each order still needs market, material, and test-specific confirmation.'}
                {' '}
                <a href="https://environment.ec.europa.eu/topics/chemicals/reach-regulation_en" target="_blank" rel="noopener noreferrer" className="font-semibold text-pinte-blue hover:underline">REACH</a>
                {' / '}
                <a href="https://environment.ec.europa.eu/topics/waste-and-recycling/rohs-directive_en" target="_blank" rel="noopener noreferrer" className="font-semibold text-pinte-blue hover:underline">RoHS</a>
              </p>
            </aside>
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

          <section className="mb-12 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm" aria-labelledby="guide-faq">
            <h2 id="guide-faq" className="mb-5 text-2xl font-bold text-neutral-950">
              {lang === 'cn' ? '采购烫金膜前的常见问题' : 'Common questions before buying hot stamping foil'}
            </h2>
            <div className="grid gap-5 md:grid-cols-2">
              {faqItems.map((item) => (
                <div key={item.question} className="rounded-2xl bg-neutral-50 p-5">
                  <h3 className="mb-2 font-bold text-neutral-950">{item.question}</h3>
                  <p className="text-sm leading-relaxed text-neutral-600">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>

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
                              decoding="async"
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
