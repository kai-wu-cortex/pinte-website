import generatedGuides from './generatedGuides';
const publishedGuides = generatedGuides
    .filter((guide) => guide.status === 'published');
export const getGeneratedGuide = (slug, lang) => {
    if (!slug)
        return undefined;
    return publishedGuides.find((guide) => guide.slug === slug && guide.lang === lang);
};
export const getPublishedGuideSummaries = (lang) => publishedGuides
    .filter((guide) => guide.lang === lang)
    .map(({ slug, title, description, cluster }) => ({ slug, title, description, cluster }));
