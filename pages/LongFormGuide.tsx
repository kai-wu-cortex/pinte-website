import React from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEOMeta, { generateBreadcrumbSchema } from '../components/SEOMeta';
import { getGeneratedGuide, type GeneratedGuideRecord } from '../data/guideContent';
import { getGeoGuide, guideCustomerText, type GuideLang } from '../data/geoGuides';
import { CONTENT_EN, CONTENT_ZH } from '../data/content';
import { resolveGuideImageAsset, resolveGuideInlineImageAssets } from '../data/guideImages';
import type { ProductId } from '../types';

const SITE_URL = 'https://www.pintecl.com';

interface LongFormGuideProps {
  guide: GeneratedGuideRecord;
  lang: GuideLang;
}

const absoluteUrl = (value: string) => {
  if (!value || value.startsWith('http://') || value.startsWith('https://')) return value;
  return `${SITE_URL}${value.startsWith('/') ? value : `/${value}`}`;
};

const isValidSourceUrl = (value: string) => {
  if (typeof value !== 'string' || !/^https:\/\//i.test(value)) return false;

  try {
    const url = new URL(value);
    return url.protocol === 'https:'
      && url.hostname.length > 0
      && url.username === ''
      && url.password === '';
  } catch {
    return false;
  }
};

const LongFormGuide: React.FC<LongFormGuideProps> = ({ guide, lang }) => {
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const isChinese = lang === 'cn';
  const canonicalPath = `/${lang}/guides/${guide.slug}/`;
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;
  const languageCode = isChinese ? 'zh-CN' : 'en';
  const homeLabel = isChinese ? '首页' : 'Home';
  const guidesLabel = isChinese ? '指南' : 'Guides';
  const faqTitle = isChinese ? '常见问题' : 'Frequently Asked Questions';
  const referencesTitle = isChinese ? '参考资料' : 'References';
  const relatedProductsTitle = isChinese ? '相关产品' : 'Related products';
  const relatedGuidesTitle = isChinese ? '相关指南' : 'Related guides';
  const viewProductLabel = isChinese ? '查看产品' : 'View product';
  const readGuideLabel = isChinese ? '阅读指南' : 'Read guide';
  const fallbackImage = resolveGuideImageAsset({
    slug: guide.slug,
    cluster: guide.cluster,
    intent: guide.intent,
    primaryKeyword: guide.primaryKeyword,
  });
  const inlineImages = resolveGuideInlineImageAssets({
    slug: guide.slug,
    cluster: guide.cluster,
    intent: guide.intent,
    primaryKeyword: guide.primaryKeyword,
  });
  const visualImage = guide.heroImage
    ? {
      src: guide.heroImage,
      width: 1200,
      height: 630,
      alt: guide.heroAlt || guide.title,
      caption: guide.heroAlt || guide.description,
    }
    : {
      src: fallbackImage.src,
      width: fallbackImage.width,
      height: fallbackImage.height,
      alt: fallbackImage.alt[lang],
      caption: fallbackImage.caption[lang],
    };
  const heroImage = absoluteUrl(visualImage.src);
  const productData = (isChinese ? CONTENT_ZH : CONTENT_EN).PRODUCT_DATA;
  const relatedProducts = guide.relatedProducts.flatMap((productId) => {
    const product = productData[productId as ProductId];
    if (!product) return [];

    return [{
      id: productId,
      name: product.name,
      path: `/${lang}/products/category/${productId}/`,
    }];
  });
  const relatedGuides = guide.relatedGuides.flatMap((slug) => {
    const generatedGuide = getGeneratedGuide(slug, lang);
    if (generatedGuide) {
      return [{ slug, title: generatedGuide.title }];
    }

    const legacyGuide = getGeoGuide(slug);
    if (!legacyGuide) return [];

    return [{ slug, title: guideCustomerText(legacyGuide.title[lang], lang) }];
  });
  const safeSources = guide.sources.filter((source) => isValidSourceUrl(source.url));

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    datePublished: guide.datePublished,
    dateModified: guide.dateModified,
    author: {
      '@type': 'Organization',
      name: guide.author,
    },
    reviewedBy: {
      '@type': 'Organization',
      name: guide.reviewer,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    inLanguage: languageCode,
    ...(heroImage ? {
      image: {
        '@type': 'ImageObject',
        url: heroImage,
        width: visualImage.width,
        height: visualImage.height,
        caption: visualImage.caption,
      },
    } : {}),
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guide.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  const breadcrumbs = [
    { name: homeLabel, path: `/${lang}/` },
    { name: guidesLabel, path: `/${lang}/guides/` },
    { name: guide.title, path: canonicalPath },
  ];
  const breadcrumbSchema = generateBreadcrumbSchema(
    breadcrumbs.map(({ name, path }) => ({ name, url: `${SITE_URL}${path}` })),
  );

  React.useEffect(() => {
    bodyRef.current?.querySelectorAll<HTMLAnchorElement>('a[href^="http://"], a[href^="https://"]')
      .forEach((link) => {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      });
  }, [guide.bodyHtml]);

  return (
    <>
      <SEOMeta
        title={guide.title}
        description={guide.description}
        keywords={[guide.primaryKeyword]}
        image={visualImage.src}
        type="article"
        publishedTime={guide.datePublished}
        author={guide.author}
        tags={[guide.primaryKeyword]}
        locale={isChinese ? 'zh_CN' : 'en_US'}
        canonicalUrl={canonicalPath}
      />
      <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>

      <main className="bg-white pt-24 pb-20">
        <article lang={languageCode} className="max-w-[920px] mx-auto px-6">
          <nav aria-label={isChinese ? '面包屑导航' : 'Breadcrumb'} className="py-5 border-b border-neutral-200">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
              {breadcrumbs.map((item, index) => (
                <li key={item.path} className="flex min-w-0 items-center gap-2">
                  {index > 0 && <span aria-hidden="true">/</span>}
                  {index === breadcrumbs.length - 1 ? (
                    <span aria-current="page" className="truncate text-neutral-700">{item.name}</span>
                  ) : (
                    <Link to={item.path} className="hover:text-pinte-blue transition-colors">{item.name}</Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <header className="py-10 md:py-14 border-b border-neutral-200">
            <p className="text-sm font-bold uppercase text-pinte-blue mb-4">{guide.primaryKeyword}</p>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-neutral-950 leading-tight mb-5">
              {guide.title}
            </h1>
            <p className="text-base md:text-lg text-neutral-600 leading-relaxed mb-6">{guide.description}</p>
            <p className="text-lg md:text-xl font-medium text-neutral-800 leading-relaxed">{guide.answer}</p>
            <dl className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-neutral-500">
              <div className="flex gap-1.5">
                <dt>{isChinese ? '作者' : 'Author'}:</dt>
                <dd>{guide.author}</dd>
              </div>
              <div className="flex gap-1.5">
                <dt>{isChinese ? '审核' : 'Reviewer'}:</dt>
                <dd>{guide.reviewer}</dd>
              </div>
              <div className="flex gap-1.5">
                <dt>{isChinese ? '发布' : 'Published'}:</dt>
                <dd><time dateTime={guide.datePublished}>{guide.datePublished}</time></dd>
              </div>
              <div className="flex gap-1.5">
                <dt>{isChinese ? '更新' : 'Updated'}:</dt>
                <dd><time dateTime={guide.dateModified}>{guide.dateModified}</time></dd>
              </div>
            </dl>
          </header>

          <figure className="py-8 border-b border-neutral-200">
            <img
              src={visualImage.src}
              alt={visualImage.alt}
              width={visualImage.width}
              height={visualImage.height}
              loading="eager"
              className="w-full max-h-[520px] object-cover rounded"
            />
            <figcaption className="mt-3 text-sm text-neutral-500">{visualImage.caption}</figcaption>
          </figure>

          <section className="py-8 border-b border-neutral-200">
            <h2 className="text-2xl font-bold text-neutral-950 mb-4">
              {isChinese ? '这篇指南应该怎样使用？' : 'How to use this guide'}
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded border border-neutral-200 bg-neutral-50 p-4">
                <h3 className="font-bold text-neutral-950 mb-2">
                  {isChinese ? '先锁定订单条件' : 'Define the job first'}
                </h3>
                <p className="text-sm leading-relaxed text-neutral-600">
                  {isChinese
                    ? '把底材、表面处理、图稿细节、设备路线、速度和后处理要求写成同一张订单卡。'
                    : 'Record substrate, surface treatment, artwork detail, machine route, speed, and post-process requirements in one job card.'}
                </p>
              </div>
              <div className="rounded border border-neutral-200 bg-neutral-50 p-4">
                <h3 className="font-bold text-neutral-950 mb-2">
                  {isChinese ? '再设计打样变量' : 'Then plan sample variables'}
                </h3>
                <p className="text-sm leading-relaxed text-neutral-600">
                  {isChinese
                    ? '每轮只改变一个变量，例如温度、压力、停留时间、速度或膜材型号，避免结果无法归因。'
                    : 'Change one variable per trial, such as temperature, pressure, dwell time, speed, or foil grade, so results remain readable.'}
                </p>
              </div>
              <div className="rounded border border-neutral-200 bg-neutral-50 p-4">
                <h3 className="font-bold text-neutral-950 mb-2">
                  {isChinese ? '最后保留确认样' : 'Keep the approved sample'}
                </h3>
                <p className="text-sm leading-relaxed text-neutral-600">
                  {isChinese
                    ? '确认样应标注底材批次、卷料信息、机台、参数和测试结果，作为复购和量产比对标准。'
                    : 'Mark the retained sample with substrate batch, roll details, press, settings, and test results for repeat orders and production checks.'}
                </p>
              </div>
            </div>
          </section>

          <section className="py-8 border-b border-neutral-200">
            <h2 className="text-2xl font-bold text-neutral-950 mb-4">
              {isChinese ? '图示检查点' : 'Visual checks'}
            </h2>
            <div className="grid gap-5 md:grid-cols-2">
              {inlineImages.map((image) => (
                <figure key={image.src} className="rounded border border-neutral-200 bg-neutral-50 p-3">
                  <img
                    src={image.src}
                    alt={image.alt[lang]}
                    width={image.width}
                    height={image.height}
                    loading="lazy"
                    className="aspect-[16/9] w-full rounded object-cover"
                  />
                  <figcaption className="mt-3 text-sm leading-relaxed text-neutral-600">
                    {image.caption[lang]}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>

          <div
            ref={bodyRef}
            className="py-10 text-neutral-700 leading-relaxed
              [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-neutral-950 [&_h2]:mt-10 [&_h2]:mb-4
              [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-neutral-950 [&_h3]:mt-8 [&_h3]:mb-3
              [&_h4]:text-lg [&_h4]:font-bold [&_h4]:text-neutral-950 [&_h4]:mt-6 [&_h4]:mb-3
              [&_p]:my-4 [&_ul]:my-5 [&_ul]:pl-6 [&_ul]:list-disc
              [&_ol]:my-5 [&_ol]:pl-6 [&_ol]:list-decimal [&_li]:my-2
              [&_a]:text-pinte-blue [&_a]:font-semibold [&_a]:underline [&_a]:underline-offset-4
              [&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-pinte-blue [&_blockquote]:pl-5
              [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto [&_table]:my-7 [&_table]:border-collapse
              [&_th]:border [&_th]:border-neutral-200 [&_th]:bg-neutral-50 [&_th]:p-3 [&_th]:text-left [&_th]:text-sm
              [&_td]:border [&_td]:border-neutral-200 [&_td]:p-3 [&_td]:align-top [&_td]:text-sm"
            dangerouslySetInnerHTML={{ __html: guide.bodyHtml }}
          />

          <section aria-labelledby="guide-faq-title" className="py-10 border-t border-neutral-200">
            <h2 id="guide-faq-title" className="text-2xl font-bold text-neutral-950 mb-5">{faqTitle}</h2>
            <div className="border-t border-neutral-200">
              {guide.faqs.map((faq) => (
                <details key={faq.question} className="group border-b border-neutral-200 py-5">
                  <summary className="cursor-pointer font-bold text-neutral-950 marker:text-pinte-blue">
                    {faq.question}
                  </summary>
                  <p className="mt-3 pr-6 text-neutral-700 leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <section aria-labelledby="guide-references-title" className="py-10 border-t border-neutral-200">
            <h2 id="guide-references-title" className="text-2xl font-bold text-neutral-950 mb-5">
              {referencesTitle}
            </h2>
            <ol className="space-y-6">
              {safeSources.map((source) => (
                <li key={source.url} className="border-l-2 border-neutral-200 pl-4">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-start gap-2 font-bold text-neutral-950 hover:text-pinte-blue transition-colors"
                  >
                    <span>{source.label}: {source.title}</span>
                    <ExternalLink size={16} aria-hidden="true" className="mt-1 shrink-0" />
                  </a>
                  {source.publisher && <p className="mt-1 text-sm text-neutral-500">{source.publisher}</p>}
                  {source.summary && <p className="mt-2 text-neutral-700 leading-relaxed">{source.summary}</p>}
                </li>
              ))}
            </ol>
          </section>

          {relatedProducts.length > 0 && (
            <section aria-labelledby="guide-related-products-title" className="py-10 border-t border-neutral-200">
              <nav aria-labelledby="guide-related-products-title">
                <h2 id="guide-related-products-title" className="text-2xl font-bold text-neutral-950 mb-5">
                  {relatedProductsTitle}
                </h2>
                <ul className="border-t border-neutral-200">
                  {relatedProducts.map((product) => (
                    <li key={product.id} className="border-b border-neutral-200">
                      <Link
                        to={product.path}
                        className="flex items-center justify-between gap-4 py-4 font-bold text-neutral-950 hover:text-pinte-blue transition-colors"
                      >
                        <span>{product.name}</span>
                        <span className="inline-flex shrink-0 items-center gap-2 text-sm">
                          {viewProductLabel}
                          <ArrowRight size={16} aria-hidden="true" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </section>
          )}

          {relatedGuides.length > 0 && (
            <section aria-labelledby="guide-related-guides-title" className="py-10 border-t border-neutral-200">
              <nav aria-labelledby="guide-related-guides-title">
                <h2 id="guide-related-guides-title" className="text-2xl font-bold text-neutral-950 mb-5">
                  {relatedGuidesTitle}
                </h2>
                <ul className="border-t border-neutral-200">
                  {relatedGuides.map((relatedGuide) => (
                    <li key={relatedGuide.slug} className="border-b border-neutral-200">
                      <Link
                        to={`/${lang}/guides/${relatedGuide.slug}/`}
                        className="flex items-center justify-between gap-4 py-4 font-bold text-neutral-950 hover:text-pinte-blue transition-colors"
                      >
                        <span>{relatedGuide.title}</span>
                        <span className="inline-flex shrink-0 items-center gap-2 text-sm">
                          {readGuideLabel}
                          <ArrowRight size={16} aria-hidden="true" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </section>
          )}

          <section className="py-10 border-t border-neutral-200">
            <h2 className="text-2xl font-bold text-neutral-950 mb-3">
              {isChinese ? '需要针对实际材料进行打样？' : 'Need to sample on your actual material?'}
            </h2>
            <p className="text-neutral-600 leading-relaxed mb-6">
              {isChinese
                ? '请提供承印物、设备、图稿和生产要求，我们会协助确认合适的打样起点。'
                : 'Share your substrate, machine, artwork, and production requirements so we can help define a practical sampling starting point.'}
            </p>
            <Link
              to={`/${lang}/quote/`}
              className="inline-flex items-center gap-2 rounded bg-pinte-blue px-5 py-3 font-bold text-white hover:bg-pinte-blue/90 transition-colors"
            >
              {isChinese ? '申请样品 / 报价' : 'Request Sample / Quote'}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </section>
        </article>
      </main>
    </>
  );
};

export default LongFormGuide;
