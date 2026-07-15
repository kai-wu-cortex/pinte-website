import generatedGuides from './generatedGuides';
import type { GuideLang } from './geoGuides';

export interface GuideSource {
  readonly label: string;
  readonly title: string;
  readonly publisher?: string;
  readonly url: string;
  readonly summary?: string;
}

export interface GuideFaq {
  readonly question: string;
  readonly answer: string;
}

export interface GeneratedGuideRecord {
  readonly topicId: string;
  readonly lang: GuideLang;
  readonly slug: string;
  readonly status: 'published';
  readonly cluster: string;
  readonly intent: string;
  readonly title: string;
  readonly description: string;
  readonly primaryKeyword: string;
  readonly secondaryKeywords: readonly string[];
  readonly relatedProducts: readonly string[];
  readonly relatedGuides: readonly string[];
  readonly author: string;
  readonly reviewer: string;
  readonly datePublished: string;
  readonly dateModified: string;
  readonly heroImage: string;
  readonly heroAlt: string;
  readonly answer: string;
  readonly faqs: readonly GuideFaq[];
  readonly sources: readonly GuideSource[];
  readonly bodyHtml: string;
}

export interface GuideSummary {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly cluster: string;
}

const publishedGuides = generatedGuides
  .filter((guide) => guide.status === 'published') as unknown as readonly GeneratedGuideRecord[];

export const getGeneratedGuide = (
  slug: string | undefined,
  lang: GuideLang,
): GeneratedGuideRecord | undefined => {
  if (!slug) return undefined;
  return publishedGuides.find((guide) => guide.slug === slug && guide.lang === lang);
};

export const getPublishedGuideSummaries = (lang: GuideLang): GuideSummary[] => publishedGuides
  .filter((guide) => guide.lang === lang)
  .map(({ slug, title, description, cluster }) => ({ slug, title, description, cluster }));
