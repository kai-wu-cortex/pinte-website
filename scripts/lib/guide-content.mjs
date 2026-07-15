import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

const REQUIRED_PUBLISHED_FIELDS = [
  'topic_id', 'lang', 'slug', 'status', 'cluster', 'intent', 'title',
  'description', 'primary_keyword', 'related_products', 'related_guides',
  'author', 'reviewer', 'date_published', 'date_modified', 'answer', 'faqs', 'sources',
];
const FORBIDDEN_PUBLIC_TERMS = /\b(?:SEO|GEO|ChatGPT|Perplexity|Google AI|AI search(?: optimization)?)\b/i;
const ALLOWED_TAGS = ['h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'blockquote', 'code', 'pre', 'hr'];

export function parseGuideFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = matter(raw);
  const bodyHtml = sanitizeHtml(marked.parse(parsed.content), {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: { a: ['href', 'title', 'target', 'rel'] },
    allowedSchemes: ['http', 'https', 'mailto'],
  });
  return { ...parsed.data, filePath, markdown: parsed.content.trim(), bodyHtml };
}

export async function loadGuidePairs(contentRoot) {
  if (!fs.existsSync(contentRoot)) return [];
  return fs.readdirSync(contentRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => ['en', 'cn']
      .map((lang) => path.join(contentRoot, entry.name, `${lang}.md`))
      .filter((filePath) => fs.existsSync(filePath))
      .map(parseGuideFile));
}

export function validateGuideRecords(records) {
  const errors = [];
  const warnings = [];
  const byTopic = new Map();
  const slugLang = new Set();
  for (const record of records) {
    const key = `${record.slug}:${record.lang}`;
    if (slugLang.has(key)) errors.push({ code: 'duplicate-slug-language', filePath: record.filePath });
    slugLang.add(key);
    if (!byTopic.has(record.topic_id)) byTopic.set(record.topic_id, []);
    byTopic.get(record.topic_id).push(record);
    if (record.status === 'published') {
      for (const field of REQUIRED_PUBLISHED_FIELDS) {
        const value = record[field];
        if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
          errors.push({ code: 'missing-required-field', field, filePath: record.filePath });
        }
      }
      const publicCopy = [record.title, record.description, record.answer, record.markdown].join('\n');
      if (FORBIDDEN_PUBLIC_TERMS.test(publicCopy)) errors.push({ code: 'forbidden-public-term', filePath: record.filePath });
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.slug || '')) errors.push({ code: 'invalid-slug', filePath: record.filePath });
      if (!Array.isArray(record.sources) || record.sources.length < 2) errors.push({ code: 'insufficient-sources', filePath: record.filePath });
    }
  }
  for (const [topicId, pair] of byTopic) {
    const published = pair.filter((record) => record.status === 'published');
    if (published.length && !['en', 'cn'].every((lang) => published.some((record) => record.lang === lang))) {
      errors.push({ code: 'missing-language-pair', topicId });
    }
    if (published.length === 2 && published[0].slug !== published[1].slug) errors.push({ code: 'pair-slug-mismatch', topicId });
  }
  return { errors, warnings };
}

export function buildPublishedManifest(records) {
  return records
    .filter((record) => record.status === 'published')
    .map((record) => ({
      topicId: record.topic_id,
      lang: record.lang,
      slug: record.slug,
      status: record.status,
      cluster: record.cluster,
      intent: record.intent,
      title: record.title,
      description: record.description,
      primaryKeyword: record.primary_keyword,
      secondaryKeywords: record.secondary_keywords || [],
      relatedProducts: record.related_products,
      relatedGuides: record.related_guides,
      author: record.author,
      reviewer: record.reviewer,
      datePublished: record.date_published,
      dateModified: record.date_modified,
      heroImage: record.hero_image || '',
      heroAlt: record.hero_alt || '',
      answer: record.answer,
      faqs: record.faqs,
      sources: record.sources,
      bodyHtml: record.bodyHtml,
    }))
    .sort((a, b) => `${a.slug}:${a.lang}`.localeCompare(`${b.slug}:${b.lang}`));
}
