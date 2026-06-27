import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ClipboardCheck, HelpCircle, Layers, Wrench } from 'lucide-react';
import SEOMeta, { generateBreadcrumbSchema } from '../components/SEOMeta';
import { GEO_GUIDES, getGeoGuide, type GuideLang } from '../data/geoGuides';
import { useLanguage } from '../contexts/LanguageContext';

const SITE_URL = 'https://www.pintecl.com';

const asGuideLang = (lang: string): GuideLang => (lang === 'cn' ? 'cn' : 'en');

const faqSchema = (guide: NonNullable<ReturnType<typeof getGeoGuide>>, lang: GuideLang) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: guide.faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question[lang],
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer[lang],
    },
  })),
});

const articleSchema = (guide: NonNullable<ReturnType<typeof getGeoGuide>>, lang: GuideLang) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: guide.title[lang],
  description: guide.metaDescription[lang],
  author: {
    '@type': 'Organization',
    name: 'PINTE',
    url: SITE_URL,
  },
  publisher: {
    '@type': 'Organization',
    name: 'PINTE',
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/logo.png`,
    },
  },
  mainEntityOfPage: `${SITE_URL}/${lang}/guides/${guide.slug}/`,
  articleSection: 'Hot Stamping Foil Procurement Guide',
  keywords: [guide.primaryKeyword[lang], ...guide.secondaryKeywords[lang]].join(', '),
  inLanguage: lang === 'cn' ? 'zh-CN' : 'en',
});

const GeoGuide: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { lang: currentLang } = useLanguage();
  const lang = asGuideLang(currentLang);
  const guide = getGeoGuide(slug);

  if (!guide) {
    return (
      <main className="min-h-screen pt-32 pb-20 bg-neutral-50">
        <div className="max-w-[920px] mx-auto px-6 text-center">
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">
            {lang === 'cn' ? '指南不存在' : 'Guide Not Found'}
          </h1>
          <button onClick={() => navigate(`/${lang}/products`)} className="text-pinte-blue font-semibold">
            {lang === 'cn' ? '返回产品中心' : 'Back to Products'}
          </button>
        </div>
      </main>
    );
  }

  const canonicalUrl = `/${lang}/guides/${guide.slug}`;
  const keywords = [guide.primaryKeyword[lang], ...guide.secondaryKeywords[lang], 'PINTE', 'hot stamping foil'];
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: lang === 'cn' ? '首页' : 'Home', url: `${SITE_URL}/${lang}/` },
    { name: lang === 'cn' ? '采购指南' : 'Procurement Guides', url: `${SITE_URL}/${lang}/guides/${guide.slug}/` },
    { name: guide.title[lang], url: `${SITE_URL}${canonicalUrl}/` },
  ]);

  return (
    <>
      <SEOMeta
        title={`${guide.title[lang]} | PINTE`}
        description={guide.metaDescription[lang]}
        keywords={keywords}
        type="article"
        publishedTime="2026-06-26"
        author="PINTE"
        section="Hot Stamping Foil Procurement"
        tags={keywords}
        locale={lang === 'cn' ? 'zh_CN' : 'en_US'}
        canonicalUrl={canonicalUrl}
      />
      <script type="application/ld+json">{JSON.stringify(articleSchema(guide, lang))}</script>
      <script type="application/ld+json">{JSON.stringify(faqSchema(guide, lang))}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>

      <main className="bg-neutral-50 pt-24 pb-20">
        <article className="max-w-[1120px] mx-auto px-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-pinte-blue font-semibold mb-8"
          >
            <ArrowLeft size={18} />
            {lang === 'cn' ? '返回' : 'Back'}
          </button>

          <section className="bg-white border border-neutral-100 rounded-3xl p-8 md:p-12 shadow-sm mb-8">
            <p className="text-sm font-bold tracking-wide uppercase text-pinte-blue mb-4">
              {guide.primaryKeyword[lang]}
            </p>
            <h1 className="text-3xl md:text-5xl font-display font-bold text-neutral-950 leading-tight mb-6">
              {guide.title[lang]}
            </h1>
            <p className="text-lg text-neutral-700 leading-relaxed max-w-4xl">
              {guide.answer[lang]}
            </p>
            <p className="mt-6 text-sm text-neutral-500">
              {lang === 'cn' ? '目标读者：' : 'Audience: '}
              {guide.audience[lang]}
            </p>
          </section>

          <section className="grid md:grid-cols-3 gap-5 mb-8">
            {guide.factors.map((factor) => (
              <div key={factor.label.en} className="bg-white rounded-2xl border border-neutral-100 p-6">
                <Layers size={22} className="text-pinte-blue mb-4" />
                <h2 className="text-lg font-bold text-neutral-950 mb-3">{factor.label[lang]}</h2>
                <p className="text-neutral-600 leading-relaxed">{factor.guidance[lang]}</p>
              </div>
            ))}
          </section>

          {guide.articleSections && (
            <section className="bg-white border border-neutral-100 rounded-3xl p-6 md:p-10 mb-8">
              <div className="space-y-10">
                {guide.articleSections.map((section) => (
                  <section key={section.title.en} className="max-w-4xl">
                    <h2 className="text-2xl md:text-3xl font-bold text-neutral-950 mb-4">
                      {section.title[lang]}
                    </h2>
                    <div className="space-y-4">
                      {section.body[lang].map((paragraph) => (
                        <p key={paragraph} className="text-neutral-700 leading-relaxed text-base md:text-lg">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    {section.bullets?.[lang]?.length ? (
                      <ul className="mt-5 grid gap-3">
                        {section.bullets[lang].map((item) => (
                          <li key={item} className="flex gap-3 text-neutral-700">
                            <CheckCircle2 size={18} className="text-green-600 mt-1 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                ))}
              </div>
            </section>
          )}

          {guide.processNotes && (
            <section className="bg-white border border-neutral-100 rounded-3xl p-6 md:p-8 mb-8">
              <h2 className="text-2xl font-bold text-neutral-950 mb-5">
                {lang === 'cn' ? '核心采购判断' : 'Core Procurement Notes'}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {guide.processNotes.map((note) => (
                  <div key={note.title.en} className="rounded-2xl bg-neutral-50 p-5">
                    <h3 className="font-bold text-neutral-950 mb-2">{note.title[lang]}</h3>
                    <p className="text-neutral-600 leading-relaxed">{note.body[lang]}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {guide.selectionTable && (
            <section className="bg-white border border-neutral-100 rounded-3xl p-6 md:p-8 mb-8">
              <h2 className="text-2xl font-bold text-neutral-950 mb-3">
                {lang === 'cn' ? '采购选型因素对比表' : 'Selection Factors Comparison Table'}
              </h2>
              <p className="text-neutral-600 mb-5">
                {lang === 'cn'
                  ? '下单前需要同时确认底材、表面处理、图案、设备、版材、耐性和卷料规格。'
                  : 'Before ordering, confirm substrate, surface treatment, artwork, machine, die, durability, and roll specifications together.'}
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-[980px] w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 text-neutral-500">
                      <th className="py-3 pr-4">{lang === 'cn' ? '选型因素' : 'Selection factor'}</th>
                      <th className="py-3 pr-4">{lang === 'cn' ? '采购前确认' : 'Confirm before buying'}</th>
                      <th className="py-3 pr-4">{lang === 'cn' ? '为什么重要' : 'Why it matters'}</th>
                      <th className="py-3">{lang === 'cn' ? '询问供应商' : 'Ask your supplier'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guide.selectionTable.map((row) => (
                      <tr key={row.factor.en} className="border-b border-neutral-100 align-top">
                        <td className="py-4 pr-4 font-semibold text-neutral-900">{row.factor[lang]}</td>
                        <td className="py-4 pr-4 text-neutral-600">{row.confirm[lang]}</td>
                        <td className="py-4 pr-4 text-neutral-600">{row.why[lang]}</td>
                        <td className="py-4 text-neutral-700">{row.ask[lang]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {guide.researchMatrix && (
            <section className="bg-white border border-neutral-100 rounded-3xl p-6 md:p-8 mb-8">
              <h2 className="text-2xl font-bold text-neutral-950 mb-3">
                {lang === 'cn' ? 'ChatGPT 高概率采购问题矩阵' : 'ChatGPT Buyer Question Matrix'}
              </h2>
              <p className="text-neutral-600 mb-5">
                {lang === 'cn'
                  ? '按采购型、对比型、故障解决型、参数型、应用场景型拆分，并给出真实采购顾虑、常见引用来源、页面类型和评分。'
                  : 'Segmented by procurement, comparison, troubleshooting, parameter, and application intent, with buyer concerns, source types, page formats, and scores.'}
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-[1180px] w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 text-neutral-500">
                      <th className="py-3 pr-4">#</th>
                      <th className="py-3 pr-4">{lang === 'cn' ? '用途场景' : 'Scenario'}</th>
                      <th className="py-3 pr-4">{lang === 'cn' ? '问题' : 'Question'}</th>
                      <th className="py-3 pr-4">{lang === 'cn' ? '意图' : 'Intent'}</th>
                      <th className="py-3 pr-4">{lang === 'cn' ? '真实采购顾虑' : 'Real buyer concern'}</th>
                      <th className="py-3 pr-4">{lang === 'cn' ? '常见引用来源' : 'Common sources'}</th>
                      <th className="py-3 pr-4">{lang === 'cn' ? '页面类型' : 'Page type'}</th>
                      <th className="py-3 pr-4">{lang === 'cn' ? '转化' : 'Conv.'}</th>
                      <th className="py-3 pr-4">{lang === 'cn' ? 'AI引用' : 'AI cite'}</th>
                      <th className="py-3">{lang === 'cn' ? '优先级' : 'Priority'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guide.researchMatrix.map((row, index) => (
                      <tr key={`${row.scenario.en}-${row.question.en}`} className="border-b border-neutral-100 align-top">
                        <td className="py-4 pr-4 font-bold text-neutral-500">{index + 1}</td>
                        <td className="py-4 pr-4 font-semibold text-neutral-900">{row.scenario[lang]}</td>
                        <td className="py-4 pr-4 text-neutral-900">{row.question[lang]}</td>
                        <td className="py-4 pr-4 text-pinte-blue font-semibold">{row.intent[lang]}</td>
                        <td className="py-4 pr-4 text-neutral-600">{row.concern[lang]}</td>
                        <td className="py-4 pr-4 text-neutral-600">{row.sources[lang]}</td>
                        <td className="py-4 pr-4 text-neutral-600">{row.pageType[lang]}</td>
                        <td className="py-4 pr-4 font-bold text-neutral-900">{row.conversionScore}</td>
                        <td className="py-4 pr-4 font-bold text-neutral-900">{row.citationScore}</td>
                        <td className="py-4 font-bold text-pinte-blue">{row.priority}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {guide.pageRecommendations && (
            <section className="bg-white border border-neutral-100 rounded-3xl p-6 md:p-8 mb-8">
              <h2 className="text-2xl font-bold text-neutral-950 mb-5">
                {lang === 'cn' ? '站内页面分配建议' : 'Recommended Site Page Allocation'}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {guide.pageRecommendations[lang].map((item) => (
                  <div key={item.pageType} className="rounded-2xl bg-neutral-50 p-5">
                    <h3 className="font-bold text-neutral-950 mb-2">{item.pageType}</h3>
                    <p className="text-neutral-600">{item.questions}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="bg-white border border-neutral-100 rounded-3xl p-6 md:p-8 mb-8">
            <h2 className="text-2xl font-bold text-neutral-950 mb-5">
              {lang === 'cn' ? '底材适配表' : 'Substrate Fit Table'}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 text-sm text-neutral-500">
                    <th className="py-3 pr-4">{lang === 'cn' ? '底材' : 'Substrate'}</th>
                    <th className="py-3 pr-4">{lang === 'cn' ? '推荐系列' : 'Recommended foil'}</th>
                    <th className="py-3">{lang === 'cn' ? '选型备注' : 'Selection note'}</th>
                  </tr>
                </thead>
                <tbody>
                  {guide.substrateFit.map((row) => (
                    <tr key={row.substrate.en} className="border-b border-neutral-100">
                      <td className="py-4 pr-4 font-semibold text-neutral-900">{row.substrate[lang]}</td>
                      <td className="py-4 pr-4 text-pinte-blue font-semibold">{row.recommendedFoil}</td>
                      <td className="py-4 text-neutral-600">{row.note[lang]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-white border border-neutral-100 rounded-3xl p-6 md:p-8 mb-8">
            <h2 className="text-2xl font-bold text-neutral-950 mb-5 flex items-center gap-2">
              <Wrench size={24} className="text-pinte-blue" />
              {lang === 'cn' ? '常见问题与解决方向' : 'Common Problems and Fixes'}
            </h2>
            <div className="grid gap-4">
              {guide.troubleshooting.map((row) => (
                <div key={row.issue.en} className="rounded-2xl bg-neutral-50 p-5">
                  <h3 className="font-bold text-neutral-950 mb-2">{row.issue[lang]}</h3>
                  <p className="text-sm text-neutral-500 mb-2">
                    {lang === 'cn' ? '可能原因：' : 'Likely cause: '}
                    {row.likelyCause[lang]}
                  </p>
                  <p className="text-neutral-700">
                    {lang === 'cn' ? '处理方向：' : 'Action: '}
                    {row.action[lang]}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-neutral-100 rounded-3xl p-6 md:p-8 mb-8">
            <h2 className="text-2xl font-bold text-neutral-950 mb-5 flex items-center gap-2">
              <ClipboardCheck size={24} className="text-pinte-blue" />
              {lang === 'cn' ? '采购前打样测试清单' : 'Sampling Checklist Before Bulk Purchase'}
            </h2>
            <ul className="grid md:grid-cols-2 gap-3">
              {guide.samplingChecklist[lang].map((item) => (
                <li key={item} className="flex gap-3 text-neutral-700">
                  <CheckCircle2 size={18} className="text-green-600 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white border border-neutral-100 rounded-3xl p-6 md:p-8 mb-8">
            <h2 className="text-2xl font-bold text-neutral-950 mb-5 flex items-center gap-2">
              <HelpCircle size={24} className="text-pinte-blue" />
              FAQ
            </h2>
            <div className="space-y-4">
              {guide.faqs.map((faq) => (
                <details key={faq.question.en} className="group rounded-2xl bg-neutral-50 p-5">
                  <summary className="cursor-pointer list-none font-bold text-neutral-950">
                    {faq.question[lang]}
                  </summary>
                  <p className="mt-3 text-neutral-700 leading-relaxed">{faq.answer[lang]}</p>
                </details>
              ))}
            </div>
          </section>

          {guide.sourceReferences && (
            <section className="bg-white border border-neutral-100 rounded-3xl p-6 md:p-8 mb-8">
              <h2 className="text-2xl font-bold text-neutral-950 mb-5">
                {lang === 'cn' ? '参考资料' : 'Technical References'}
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {guide.sourceReferences.map((source) => (
                  <a
                    key={source.label}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl bg-neutral-50 p-4 text-neutral-700 hover:text-pinte-blue transition-colors"
                  >
                    <span className="font-bold text-neutral-950">{source.label}. </span>
                    {source.title}
                  </a>
                ))}
              </div>
            </section>
          )}

          <section className="bg-pinte-blue text-white rounded-3xl p-8 md:p-10">
            <h2 className="text-2xl font-bold mb-4">
              {lang === 'cn' ? '需要按底材推荐型号？' : 'Need a substrate-based foil recommendation?'}
            </h2>
            <p className="text-white/85 mb-6 max-w-3xl">
              {lang === 'cn'
                ? '发送底材样品、烫印图稿和测试标准，PINTE 可提供色卡、样卷、分切规格和按底材推荐型号服务。'
                : 'Send your substrate, artwork, and testing standard. PINTE can provide color cards, sample rolls, slitting options, and substrate-based model recommendations.'}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to={`/${lang}/quote`} className="bg-white text-pinte-blue px-6 py-3 rounded-full font-bold">
                {lang === 'cn' ? '申请样品 / 报价' : 'Request Sample / Quote'}
              </Link>
              {GEO_GUIDES.filter((item) => item.slug !== guide.slug).slice(0, 2).map((item) => (
                <Link key={item.slug} to={`/${lang}/guides/${item.slug}`} className="border border-white/30 px-6 py-3 rounded-full font-semibold text-white">
                  {item.title[lang]}
                </Link>
              ))}
            </div>
          </section>
        </article>
      </main>
    </>
  );
};

export default GeoGuide;
