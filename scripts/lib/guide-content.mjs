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
const EXCLUDED_BODY_SECTIONS = new Set([
  'faq',
  'frequently asked questions',
  '常见问题',
  'references',
  'sources',
  '参考资料',
  '参考来源',
]);
const SAMPLING_CONFIRMATION_PATTERNS = [
  /\bfinal\s+(?:settings?|parameters?)\b[\s\S]{0,80}\b(?:require|requires|must|need|needs|should)\b[\s\S]{0,80}\b(?:test(?:ing)?|sample(?:s|d)?|sampling|trial|proof|confirm(?:ation|ed|ing)?)\b/i,
  /(?:最终(?:设置|参数)|最终的?(?:设置|参数))[\s\S]{0,80}(?:需|需要|必须|应|应当)[\s\S]{0,80}(?:测试|试样|打样|样品|确认)/,
];
const SAMPLING_DIMENSIONS = [
  [/(?:\b(?:actual|production)\s+(?:substrate|material|stock)\b)/i, /(?:实际|真实|生产)(?:承印物|基材|材料)/],
  [/\b(?:machine|press|equipment)\b/i, /(?:机器|机台|设备|印刷机)/],
  [/\b(?:artwork|design)\b/i, /(?:图稿|设计稿|版面|图案|设计)/],
  [/\b(?:speed|press speed|production speed)\b/i, /(?:速度|车速|运行速度)/],
];

export function parseGuideFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = matter(raw);
  let excludeSection = false;
  const bodyTokens = marked.lexer(parsed.content).filter((token) => {
    if (token.type === 'heading' && token.depth === 2) {
      const sectionName = token.text.trim().replace(/\s+/g, ' ').toLowerCase();
      excludeSection = EXCLUDED_BODY_SECTIONS.has(sectionName);
      return !excludeSection;
    }
    return !excludeSection;
  });
  const bodyHtml = sanitizeHtml(marked.parser(bodyTokens), {
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

function collectText(value) {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(collectText);
  if (value && typeof value === 'object') return Object.values(value).flatMap(collectText);
  return [];
}

function sourceMetadata(source) {
  if (!source || typeof source !== 'object') return source;
  const { url, ...metadata } = source;
  return metadata;
}

function isValidSourceUrl(value) {
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
}

function hasForbiddenPublicTerm(record) {
  const publicCopy = [
    record.title,
    record.description,
    record.primary_keyword,
    record.secondary_keywords,
    record.related_products,
    record.related_guides,
    record.author,
    record.reviewer,
    record.hero_image,
    record.hero_alt,
    record.answer,
    record.faqs,
    record.markdown,
    record.bodyHtml,
    Array.isArray(record.sources) ? record.sources.map(sourceMetadata) : [],
  ].flatMap(collectText).join('\n');
  return FORBIDDEN_PUBLIC_TERMS.test(publicCopy);
}

function samplingStatements(value) {
  if (typeof value !== 'string') return [];
  return value
    .split(/\r?\n\s*\r?\n/)
    .flatMap((paragraph) => [paragraph, ...paragraph.split(/(?<=[.!?。！？])\s+/)])
    .map((statement) => statement.trim())
    .filter(Boolean);
}

function hasSamplingQualification(record) {
  return [record.answer, record.markdown]
    .flatMap(samplingStatements)
    .some((statement) => SAMPLING_CONFIRMATION_PATTERNS.some((pattern) => pattern.test(statement))
      && SAMPLING_DIMENSIONS.every((patterns) => patterns.some((pattern) => pattern.test(statement))));
}

function isCompletePublishedPair(records) {
  if (records.length !== 2) return false;
  const en = records.filter((record) => record.lang === 'en');
  const cn = records.filter((record) => record.lang === 'cn');
  return en.length === 1
    && cn.length === 1
    && en[0].status === 'published'
    && cn[0].status === 'published'
    && en[0].slug === cn[0].slug;
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
      if (hasForbiddenPublicTerm(record)) errors.push({ code: 'forbidden-public-term', filePath: record.filePath });
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.slug || '')) errors.push({ code: 'invalid-slug', filePath: record.filePath });
      if (!Array.isArray(record.sources) || record.sources.length < 2) errors.push({ code: 'insufficient-sources', filePath: record.filePath });
      if (Array.isArray(record.sources)) {
        record.sources.forEach((source, sourceIndex) => {
          if (!isValidSourceUrl(source?.url)) {
            errors.push({ code: 'invalid-source-url', sourceIndex, filePath: record.filePath });
          }
        });
      }
      if (!hasSamplingQualification(record)) errors.push({ code: 'missing-sampling-qualification', filePath: record.filePath });
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
  const byTopic = new Map();
  for (const record of records) {
    if (!byTopic.has(record.topic_id)) byTopic.set(record.topic_id, []);
    byTopic.get(record.topic_id).push(record);
  }
  return [...byTopic.values()]
    .filter(isCompletePublishedPair)
    .flat()
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
