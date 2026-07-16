import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import { isDeepStrictEqual } from 'node:util';
import {
  GENERATED_GUIDE_LEGACY_SLUG_MIGRATIONS,
  isLegacySlugMigrationAllowed,
} from './guide-slugs.mjs';

const REQUIRED_PUBLISHED_FIELDS = [
  'topic_id', 'lang', 'slug', 'status', 'cluster', 'intent', 'title',
  'description', 'primary_keyword', 'related_products', 'related_guides',
  'author', 'reviewer', 'date_published', 'date_modified', 'answer', 'faqs', 'sources',
];
const FORBIDDEN_PUBLIC_TERMS = /\b(?:SEO|GEO|ChatGPT|Perplexity|Google[\s\p{Pd}_/]+AI|AI[\s\p{Pd}_/]+search(?:[\s\p{Pd}_/]+optimization)?)\b/iu;
const REGISTRY_PARITY_FIELDS = [
  'topic_id', 'slug', 'status', 'cluster', 'intent', 'related_products', 'related_guides',
];
const SUPPORTED_PRODUCT_CATEGORY_IDS = new Set(['PK', 'PC', 'PLPY', 'DIGITAL']);
const BODY_SHINGLE_SIZE = 5;
const MINIMUM_BODY_TOKENS = 30;
const HIGH_BODY_SIMILARITY_THRESHOLD = 0.9;
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

export function loadGuideTopicRegistry(filePath) {
  const registry = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!Array.isArray(registry)) throw new Error('guide topic registry must be a JSON array');
  return registry;
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

function normalizedDuplicateText(value) {
  return typeof value === 'string'
    ? value.normalize('NFKC').toLocaleLowerCase('und').replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
    : '';
}

function bodyTokens(record) {
  const normalized = normalizedDuplicateText(record.markdown || '');
  return normalized.match(/[\p{Script=Han}]|[\p{L}\p{N}]+/gu) || [];
}

function bodyShingles(tokens) {
  const shingles = new Set();
  for (let index = 0; index <= tokens.length - BODY_SHINGLE_SIZE; index += 1) {
    shingles.add(tokens.slice(index, index + BODY_SHINGLE_SIZE).join('\u0001'));
  }
  return shingles;
}

function jaccardSimilarity(left, right) {
  let intersection = 0;
  for (const value of left) {
    if (right.has(value)) intersection += 1;
  }
  const union = left.size + right.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function validateRegistry(registry, errors) {
  const topicIds = new Map();
  const slugs = new Map();
  registry.forEach((record, registryIndex) => {
    for (const [field, index] of [['topic_id', topicIds], ['slug', slugs]]) {
      const value = record?.[field];
      if (typeof value !== 'string' || value.length === 0) continue;
      if (index.has(value)) {
        errors.push({
          code: field === 'topic_id' ? 'duplicate-registry-topic-id' : 'duplicate-registry-slug',
          field,
          registryIndex,
          duplicateOf: index.get(value),
        });
      } else {
        index.set(value, registryIndex);
      }
    }
  });
}

function validatePublishedRegistryParity(records, byTopic, registry, errors) {
  const registryByTopic = new Map(registry.map((record) => [record?.topic_id, record]));
  for (const [topicId, pair] of byTopic) {
    if (!isCompletePublishedPair(pair)) continue;
    const registryRecord = registryByTopic.get(topicId);
    if (!registryRecord) {
      errors.push({ code: 'missing-published-registry-record', topicId });
      continue;
    }
    for (const record of pair) {
      for (const field of REGISTRY_PARITY_FIELDS) {
        if (!isDeepStrictEqual(record[field], registryRecord[field])) {
          errors.push({
            code: 'registry-source-mismatch',
            topicId,
            lang: record.lang,
            field,
            filePath: record.filePath,
          });
        }
      }
    }
  }
}

function validatePublishedDuplicates(records, errors) {
  const publishedByLanguage = new Map();
  for (const record of records.filter((candidate) => candidate.status === 'published')) {
    if (!publishedByLanguage.has(record.lang)) publishedByLanguage.set(record.lang, []);
    publishedByLanguage.get(record.lang).push(record);
  }

  for (const [lang, localizedRecords] of publishedByLanguage) {
    const exact = new Map();
    for (const record of localizedRecords) {
      const key = `${normalizedDuplicateText(record.title)}\u0000${normalizedDuplicateText(record.intent)}`;
      if (exact.has(key)) {
        errors.push({
          code: 'duplicate-title-intent',
          lang,
          topicId: record.topic_id,
          duplicateTopicId: exact.get(key).topic_id,
          filePath: record.filePath,
        });
      } else {
        exact.set(key, record);
      }
    }

    const bodies = localizedRecords.map((record) => {
      const tokens = bodyTokens(record);
      return { record, tokens, shingles: bodyShingles(tokens) };
    });
    for (let leftIndex = 0; leftIndex < bodies.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < bodies.length; rightIndex += 1) {
        const left = bodies[leftIndex];
        const right = bodies[rightIndex];
        if (left.tokens.length < MINIMUM_BODY_TOKENS || right.tokens.length < MINIMUM_BODY_TOKENS) continue;
        const similarity = jaccardSimilarity(left.shingles, right.shingles);
        if (similarity >= HIGH_BODY_SIMILARITY_THRESHOLD) {
          errors.push({
            code: 'high-body-similarity',
            lang,
            topicId: right.record.topic_id,
            duplicateTopicId: left.record.topic_id,
            similarity,
            filePath: right.record.filePath,
          });
        }
      }
    }
  }
}

export function validateGuideRecords(records, {
  registry,
  legacySlugs,
  legacySlugMigrationAllowlist = GENERATED_GUIDE_LEGACY_SLUG_MIGRATIONS,
} = {}) {
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
      if (!Array.isArray(record.related_products)) {
        errors.push({ code: 'invalid-related-products', filePath: record.filePath });
      } else {
        for (const productId of record.related_products) {
          if (!SUPPORTED_PRODUCT_CATEGORY_IDS.has(productId)) {
            errors.push({ code: 'unsupported-related-product', productId, filePath: record.filePath });
          }
        }
      }
    }
  }
  const completePublishedSlugs = new Set(
    [...byTopic.values()].filter(isCompletePublishedPair).map((pair) => pair[0].slug),
  );
  for (const [topicId, pair] of byTopic) {
    const published = pair.filter((record) => record.status === 'published');
    if (published.length && !['en', 'cn'].every((lang) => published.some((record) => record.lang === lang))) {
      errors.push({ code: 'missing-language-pair', topicId });
    }
    if (published.length === 2 && published[0].slug !== published[1].slug) errors.push({ code: 'pair-slug-mismatch', topicId });
    if (isCompletePublishedPair(pair)
      && legacySlugs?.includes(pair[0].slug)
      && !isLegacySlugMigrationAllowed(pair[0].slug, legacySlugMigrationAllowlist)) {
      errors.push({ code: 'legacy-slug-collision', topicId, slug: pair[0].slug });
    }
  }
  if (legacySlugs) {
    const validRelatedGuideSlugs = new Set([...legacySlugs, ...completePublishedSlugs]);
    for (const record of records.filter((candidate) => candidate.status === 'published')) {
      if (!Array.isArray(record.related_guides)) {
        errors.push({ code: 'invalid-related-guides', filePath: record.filePath });
        continue;
      }
      for (const relatedSlug of record.related_guides) {
        if (relatedSlug === record.slug) {
          errors.push({ code: 'self-related-guide', relatedSlug, filePath: record.filePath });
        } else if (!validRelatedGuideSlugs.has(relatedSlug)) {
          errors.push({ code: 'missing-related-guide', relatedSlug, filePath: record.filePath });
        }
      }
    }
  }
  if (registry) {
    validateRegistry(registry, errors);
    validatePublishedRegistryParity(records, byTopic, registry, errors);
  }
  validatePublishedDuplicates(records, errors);
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

export function renderPublishedManifest(records) {
  const manifest = buildPublishedManifest(records);
  return `// AUTO-GENERATED by scripts/build-guide-content.mjs\nexport default ${JSON.stringify(manifest, null, 2)} as const;\n`;
}
