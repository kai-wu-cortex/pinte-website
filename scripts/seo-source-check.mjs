import fs from 'node:fs';
import path from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { fileURLToPath } from 'node:url';
import {
  buildPublishedManifest,
  parseGuideFile,
  validateGuideRecords,
} from './lib/guide-content.mjs';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const SITE_URL = 'https://www.pintecl.com';
const GUIDE_LANGUAGES = ['en', 'cn'];
const GUIDE_TOPIC_ID_PATTERN = /^[A-Z]{2}-\d{6}$/;
const REQUIRED_MANIFEST_STRINGS = [
  'topicId',
  'lang',
  'slug',
  'status',
  'title',
  'description',
  'answer',
  'author',
  'reviewer',
  'bodyHtml',
];

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasVisibleHtml(value) {
  return hasText(value)
    && value.replace(/<[^>]*>/g, '').replace(/&(?:nbsp|#160);/gi, ' ').trim().length > 0;
}

function hasNonEmptyStringArray(value) {
  return Array.isArray(value) && value.length > 0 && value.every(hasText);
}

function isValidDate(value) {
  return (typeof value === 'string' || value instanceof Date)
    && !Number.isNaN(new Date(value).getTime());
}

function generatedRecordKey(record) {
  return `${record?.topicId ?? '<missing-topic>'}:${record?.lang ?? '<missing-lang>'}`;
}

function sourceRecordContext(record) {
  if (!record) return { topicId: '<unknown>', lang: '<unknown>' };
  return {
    topicId: record.topic_id || path.basename(path.dirname(record.filePath || '')) || '<unknown>',
    lang: record.lang || path.basename(record.filePath || '', path.extname(record.filePath || '')) || '<unknown>',
  };
}

function addGuideError(errors, { topicId = '<all>', lang = '<all>', field, message }) {
  errors.push(`topic=${topicId} lang=${lang} field=${field}: ${message}`);
}

function parseGeneratedManifest(source = read('data/generatedGuides.ts')) {
  const match = source.match(/^\s*\/\/[^\n]*\nexport default\s+([\s\S]*?)\s+as const;\s*$/);
  if (!match) throw new Error('expected AUTO-GENERATED JSON wrapped by `export default ... as const;`');
  const manifest = JSON.parse(match[1]);
  if (!Array.isArray(manifest)) throw new Error('expected the default export to be an array');
  return manifest;
}

function validationIssueField(issue) {
  const fields = {
    'duplicate-slug-language': 'slug/lang',
    'forbidden-public-term': 'customer-visible content/bodyHtml',
    'invalid-slug': 'slug',
    'insufficient-sources': 'sources',
    'invalid-source-url': `sources[${issue.sourceIndex ?? '?'}].url`,
    'missing-sampling-qualification': 'answer/bodyHtml',
    'missing-language-pair': 'lang',
    'pair-slug-mismatch': 'slug',
  };
  return issue.field || fields[issue.code] || 'record';
}

function validateManifestRecord(record, recordIndex, errors) {
  const topicId = record?.topicId || `<record-${recordIndex}>`;
  const lang = record?.lang || '<missing>';

  for (const field of REQUIRED_MANIFEST_STRINGS) {
    if (!hasText(record?.[field])) {
      addGuideError(errors, { topicId, lang, field, message: 'must be a non-empty string' });
    }
  }
  if (!GUIDE_LANGUAGES.includes(record?.lang)) {
    addGuideError(errors, { topicId, lang, field: 'lang', message: 'must be exactly `en` or `cn`' });
  }
  if (record?.status !== 'published') {
    addGuideError(errors, { topicId, lang, field: 'status', message: 'draft or incomplete generated records cannot be published' });
  }
  if (!hasVisibleHtml(record?.bodyHtml)) {
    addGuideError(errors, { topicId, lang, field: 'bodyHtml', message: 'must contain non-empty visible HTML content' });
  }

  for (const field of ['relatedProducts', 'relatedGuides']) {
    if (!hasNonEmptyStringArray(record?.[field])) {
      addGuideError(errors, { topicId, lang, field, message: 'must be a non-empty array of non-empty strings' });
    }
  }

  if (!Array.isArray(record?.faqs) || record.faqs.length === 0) {
    addGuideError(errors, { topicId, lang, field: 'faqs', message: 'must contain at least one FAQ' });
  } else {
    record.faqs.forEach((faq, faqIndex) => {
      for (const field of ['question', 'answer']) {
        if (!hasText(faq?.[field])) {
          addGuideError(errors, {
            topicId,
            lang,
            field: `faqs[${faqIndex}].${field}`,
            message: 'must be a non-empty string',
          });
        }
      }
    });
  }

  if (!Array.isArray(record?.sources) || record.sources.length < 2) {
    addGuideError(errors, { topicId, lang, field: 'sources', message: 'must contain at least two valid sources' });
  } else {
    record.sources.forEach((source, sourceIndex) => {
      for (const field of ['label', 'title', 'url']) {
        if (!hasText(source?.[field])) {
          addGuideError(errors, {
            topicId,
            lang,
            field: `sources[${sourceIndex}].${field}`,
            message: 'must be a non-empty string',
          });
        }
      }
    });
  }

  for (const field of ['datePublished', 'dateModified']) {
    if (!isValidDate(record?.[field])) {
      addGuideError(errors, { topicId, lang, field, message: 'must be a valid date' });
    }
  }
  if (isValidDate(record?.datePublished)
    && isValidDate(record?.dateModified)
    && new Date(record.dateModified) < new Date(record.datePublished)) {
    addGuideError(errors, {
      topicId,
      lang,
      field: 'dateModified',
      message: 'must not be earlier than datePublished',
    });
  }
}

function validateManifestPairs(manifest, errors) {
  const bySlug = new Map();
  const byTopic = new Map();
  for (const record of manifest) {
    if (!bySlug.has(record?.slug)) bySlug.set(record?.slug, []);
    if (!byTopic.has(record?.topicId)) byTopic.set(record?.topicId, []);
    bySlug.get(record?.slug).push(record);
    byTopic.get(record?.topicId).push(record);
  }

  for (const [slug, records] of bySlug) {
    const topicIds = new Set(records.map((record) => record?.topicId));
    for (const lang of GUIDE_LANGUAGES) {
      const count = records.filter((record) => record?.lang === lang).length;
      if (count !== 1) {
        addGuideError(errors, {
          topicId: [...topicIds].join(',') || '<missing>',
          lang,
          field: 'manifest pair',
          message: `slug=${slug ?? '<missing>'} must have exactly one ${lang} record; found ${count}`,
        });
      }
    }
    if (records.length !== 2 || topicIds.size !== 1) {
      addGuideError(errors, {
        topicId: [...topicIds].join(',') || '<missing>',
        field: 'topicId/slug',
        message: `slug=${slug ?? '<missing>'} must resolve to one bilingual topic; found ${records.length} records and ${topicIds.size} topic IDs`,
      });
    }
  }

  for (const [topicId, records] of byTopic) {
    const slugs = new Set(records.map((record) => record?.slug));
    if (records.length !== 2 || slugs.size !== 1) {
      addGuideError(errors, {
        topicId: topicId || '<missing>',
        field: 'topicId/slug',
        message: `topic must contain exactly one en+cn pair with a matching slug; found ${records.length} records and ${slugs.size} slugs`,
      });
    }
  }
}

function indexRecords(records, keyForRecord) {
  const indexed = new Map();
  for (const record of records) {
    const key = keyForRecord(record);
    if (!indexed.has(key)) indexed.set(key, []);
    indexed.get(key).push(record);
  }
  return indexed;
}

function buildGeneratedManifest(sourceRecords) {
  return JSON.parse(JSON.stringify(buildPublishedManifest(sourceRecords)));
}

export function validateManifestMatchesSource(manifest, sourceRecords, errors) {
  const expected = buildGeneratedManifest(sourceRecords);
  const expectedByKey = indexRecords(expected, generatedRecordKey);
  const actualByKey = indexRecords(manifest, generatedRecordKey);

  for (const [key, expectedMatches] of expectedByKey) {
    const [expectedRecord] = expectedMatches;
    const actualMatches = actualByKey.get(key) || [];
    const { topicId, lang } = expectedRecord;
    if (actualMatches.length !== 1) {
      addGuideError(errors, {
        topicId,
        lang,
        field: 'data/generatedGuides.ts',
        message: `expected exactly one generated record matching the authoring source; found ${actualMatches.length}`,
      });
      continue;
    }
    const [actualRecord] = actualMatches;
    const fields = new Set([...Object.keys(expectedRecord), ...Object.keys(actualRecord)]);
    for (const field of fields) {
      if (JSON.stringify(actualRecord[field]) !== JSON.stringify(expectedRecord[field])) {
        addGuideError(errors, {
          topicId,
          lang,
          field,
          message: 'generated manifest value is stale or differs from the authoring source',
        });
      }
    }
  }

  for (const [key, actualMatches] of actualByKey) {
    if (expectedByKey.has(key)) continue;
    for (const record of actualMatches) {
      addGuideError(errors, {
        topicId: record?.topicId || '<missing>',
        lang: record?.lang || '<missing>',
        field: 'authoring source',
        message: 'generated record has no complete published source pair',
      });
    }
  }

  if (!isDeepStrictEqual(manifest, expected)) {
    const record = expected[0] || manifest[0] || {};
    addGuideError(errors, {
      topicId: record.topicId || '<all>',
      lang: record.lang || '<all>',
      field: 'data/generatedGuides.ts',
      message: 'must exactly equal buildPublishedManifest(sourceRecords), including record order',
    });
  }
}

function xmlAttribute(tag, attribute) {
  const match = tag.match(new RegExp(`\\b${attribute}\\s*=\\s*(["'])(.*?)\\1`, 'i'));
  return match?.[2];
}

export function getLegacyGuideSlugs(source = read('data/geoGuides.ts')) {
  const slugs = [...source.matchAll(/^\s{4}slug:\s*'([a-z0-9]+(?:-[a-z0-9]+)*)',\s*$/gm)]
    .map((match) => match[1]);
  if (slugs.length === 0) throw new Error('could not find GEO_GUIDES slugs in data/geoGuides.ts');
  return [...new Set(slugs)].sort();
}

function guideSitemapUrl(lang, slug) {
  return `${SITE_URL}/${lang}/guides/${slug}/`;
}

function guideSitemapLocation(loc) {
  try {
    const url = new URL(loc);
    const match = url.pathname.match(/^\/+(en|cn)\/+guides\/+([^/]+)\/*$/);
    return match ? { lang: match[1], slug: match[2] } : null;
  } catch {
    return null;
  }
}

function sitemapEntries(sitemap) {
  return [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => {
    const block = match[1];
    const locs = [...block.matchAll(/<loc>([^<]+)<\/loc>/g)].map((locMatch) => locMatch[1].trim());
    const alternates = [...block.matchAll(/<xhtml:link\b[^>]*>/g)]
      .map((linkMatch) => linkMatch[0])
      .filter((tag) => xmlAttribute(tag, 'rel') === 'alternate')
      .map((tag) => ({ hreflang: xmlAttribute(tag, 'hreflang'), href: xmlAttribute(tag, 'href') }));
    return { locs, alternates };
  });
}

function expectedGuideLocations(manifest, legacySlugs) {
  const expected = new Map();
  for (const slug of legacySlugs) {
    for (const lang of GUIDE_LANGUAGES) {
      expected.set(`${lang}:${slug}`, { topicId: `legacy:${slug}`, lang, slug, generated: false });
    }
  }
  for (const record of manifest) {
    if (record?.status !== 'published' || !hasText(record?.slug) || !GUIDE_LANGUAGES.includes(record?.lang)) continue;
    expected.set(`${record.lang}:${record.slug}`, {
      topicId: record.topicId || '<missing>',
      lang: record.lang,
      slug: record.slug,
      generated: true,
    });
  }
  return expected;
}

export function validateGuideSitemap(
  manifest,
  errors,
  sitemap = read('public/sitemap.xml'),
  legacySlugs = getLegacyGuideSlugs(),
) {
  const entries = sitemapEntries(sitemap);
  const locs = entries.flatMap((entry) => entry.locs);
  const expected = expectedGuideLocations(manifest, legacySlugs);

  for (const expectedLocation of expected.values()) {
    const canonical = guideSitemapUrl(expectedLocation.lang, expectedLocation.slug);
    const locCount = locs.filter((loc) => loc === canonical).length;
    const matches = entries.filter((entry) => entry.locs.includes(canonical));
    if (locCount !== 1 || matches.length !== 1) {
      addGuideError(errors, {
        topicId: expectedLocation.topicId,
        lang: expectedLocation.lang,
        field: 'sitemap.loc',
        message: `expected canonical ${canonical} for slug=${expectedLocation.slug} exactly once; found ${locCount}`,
      });
      continue;
    }
    if (expectedLocation.generated) {
      const requiredAlternates = [
        { hreflang: 'en', href: guideSitemapUrl('en', expectedLocation.slug) },
        { hreflang: 'zh-CN', href: guideSitemapUrl('cn', expectedLocation.slug) },
        { hreflang: 'x-default', href: guideSitemapUrl('en', expectedLocation.slug) },
      ];
      for (const alternate of requiredAlternates) {
        const count = matches[0].alternates.filter((candidate) => (
          candidate.hreflang === alternate.hreflang && candidate.href === alternate.href
        )).length;
        if (count !== 1) {
          addGuideError(errors, {
            topicId: expectedLocation.topicId,
            lang: expectedLocation.lang,
            field: `sitemap.hreflang[${alternate.hreflang}]`,
            message: `expected reciprocal href=${alternate.href} exactly once; found ${count}`,
          });
        }
      }
    }
  }

  for (const loc of locs) {
    const location = guideSitemapLocation(loc);
    if (!location) continue;
    const expectedLocation = expected.get(`${location.lang}:${location.slug}`);
    if (!expectedLocation) {
      addGuideError(errors, {
        topicId: `<unknown:${location.slug}>`,
        lang: location.lang,
        field: 'sitemap.loc',
        message: `unexpected guide URL for slug=${location.slug}; it is not a legacy or published generated guide`,
      });
      continue;
    }
    const canonical = guideSitemapUrl(location.lang, location.slug);
    if (loc !== canonical) {
      addGuideError(errors, {
        topicId: expectedLocation.topicId,
        lang: location.lang,
        field: 'sitemap.loc',
        message: `noncanonical guide URL for slug=${location.slug}; expected ${canonical}, found ${loc}`,
      });
    }
  }
}

function addSharedValidationErrors(sourceRecords, errors) {
  const sourceValidation = validateGuideRecords(sourceRecords);
  for (const issue of sourceValidation.errors) {
    const record = issue.filePath
      ? sourceRecords.find((candidate) => path.resolve(candidate.filePath) === path.resolve(issue.filePath))
      : sourceRecords.find((candidate) => candidate.topic_id === issue.topicId);
    const context = sourceRecordContext(record);
    addGuideError(errors, {
      topicId: issue.topicId || context.topicId,
      lang: context.lang,
      field: validationIssueField(issue),
      message: `authoring validator rejected record (${issue.code})`,
    });
  }
}

export function validateGuidePublicationState({ sourceRecords, manifest, sitemap }) {
  const errors = [];
  addSharedValidationErrors(sourceRecords, errors);
  manifest.forEach((record, recordIndex) => validateManifestRecord(record, recordIndex, errors));
  validateManifestPairs(manifest, errors);
  validateManifestMatchesSource(manifest, sourceRecords, errors);
  validateGuideSitemap(buildGeneratedManifest(sourceRecords), errors, sitemap);
  return errors;
}

export function isGuideTopicDirectory(entry) {
  return entry.isDirectory() && GUIDE_TOPIC_ID_PATTERN.test(entry.name);
}

function readGuideSourceRecords(contentRoot, errors) {
  const sourceRecords = [];
  let topicDirectories = [];

  try {
    topicDirectories = fs.readdirSync(contentRoot, { withFileTypes: true })
      .filter(isGuideTopicDirectory)
      .map((entry) => entry.name)
      .sort();
  } catch (error) {
    addGuideError(errors, { field: 'content/guides', message: `cannot read guide source root: ${error.message}` });
  }

  for (const topicId of topicDirectories) {
    for (const lang of GUIDE_LANGUAGES) {
      const filePath = path.join(contentRoot, topicId, `${lang}.md`);
      if (!fs.existsSync(filePath)) continue;
      try {
        const record = parseGuideFile(filePath);
        sourceRecords.push(record);
        if (record.topic_id !== topicId) {
          addGuideError(errors, {
            topicId,
            lang,
            field: 'topic_id',
            message: `frontmatter must match source directory; found ${record.topic_id ?? '<missing>'}`,
          });
        }
        if (record.lang !== lang) {
          addGuideError(errors, {
            topicId,
            lang,
            field: 'lang',
            message: `frontmatter must match source filename; found ${record.lang ?? '<missing>'}`,
          });
        }
      } catch (error) {
        addGuideError(errors, {
          topicId,
          lang,
          field: 'source file',
          message: `cannot parse content/guides/${topicId}/${lang}.md: ${error.message}`,
        });
      }
    }
  }

  return sourceRecords;
}

export function loadGuideSourceRecords(contentRoot = path.join(root, 'content/guides')) {
  const errors = [];
  const sourceRecords = readGuideSourceRecords(contentRoot, errors);
  return { sourceRecords, errors };
}

export async function validateGeneratedGuidePublication() {
  const { sourceRecords, errors: readErrors } = loadGuideSourceRecords();

  let manifest = [];
  let sitemap = '';
  try {
    manifest = parseGeneratedManifest();
  } catch (error) {
    addGuideError(readErrors, { field: 'data/generatedGuides.ts', message: `cannot parse generated manifest: ${error.message}` });
  }
  try {
    sitemap = read('public/sitemap.xml');
  } catch (error) {
    addGuideError(readErrors, { field: 'public/sitemap.xml', message: `cannot read sitemap: ${error.message}` });
  }
  return [...readErrors, ...validateGuidePublicationState({ sourceRecords, manifest, sitemap })];
}

const isMainModule = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMainModule) {
const checks = [
  {
    name: 'Product detail page renders SEOMeta',
    pass: () => /import SEOMeta/.test(read('pages/ProductItem.tsx')) && /<SEOMeta[\s>]/.test(read('pages/ProductItem.tsx')),
  },
  {
    name: 'Solution detail page renders SEOMeta',
    pass: () => /import SEOMeta/.test(read('pages/SolutionDetail.tsx')) && /<SEOMeta[\s>]/.test(read('pages/SolutionDetail.tsx')),
  },
  {
    name: 'Sitemap includes hreflang alternates',
    pass: () => /xmlns:xhtml=/.test(read('public/sitemap.xml')) && /rel="alternate"/.test(read('public/sitemap.xml')),
  },
  {
    name: 'Sitemap URLs use final trailing-slash static route URLs',
    pass: () => {
      const sitemap = read('public/sitemap.xml');
      const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
      return locs.includes('https://www.pintecl.com/en/products/item/PC-Cold/')
        && !locs.includes('https://www.pintecl.com/en/products/item/PC-Cold');
    },
  },
  {
    name: 'Sitemap includes real source product and solution routes',
    pass: () => {
      const sitemap = read('public/sitemap.xml');
      const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
      const required = [
        'https://www.pintecl.com/cn/solutions/pkg_bags/',
        'https://www.pintecl.com/cn/solutions/special_paper/',
        'https://www.pintecl.com/cn/solutions/leather/',
        'https://www.pintecl.com/cn/solutions/plastic_surface/',
        'https://www.pintecl.com/cn/solutions/digital_cold/',
        'https://www.pintecl.com/cn/solutions/bottles/',
        'https://www.pintecl.com/cn/solutions/gift_pkg/',
        'https://www.pintecl.com/cn/solutions/reverse_uv/',
        'https://www.pintecl.com/cn/products/item/PK-Universal/',
        'https://www.pintecl.com/cn/products/item/PK-Heavy/',
        'https://www.pintecl.com/cn/products/item/PK-Matte/',
        'https://www.pintecl.com/cn/products/item/PK-Holo/',
        'https://www.pintecl.com/cn/products/item/PC-Standard/',
        'https://www.pintecl.com/cn/products/item/PC-Alcohol/',
        'https://www.pintecl.com/cn/products/item/PC-Cold/',
        'https://www.pintecl.com/cn/products/item/PL-Glossy/',
        'https://www.pintecl.com/cn/products/item/PY-Matte/',
        'https://www.pintecl.com/cn/products/item/PL-White/',
        'https://www.pintecl.com/cn/products/item/G-Hex/',
        'https://www.pintecl.com/cn/products/item/G-Strip/',
        'https://www.pintecl.com/cn/tour/',
        'https://www.pintecl.com/cn/about/',
      ];
      const stale = [
        'https://www.pintecl.com/cn/products/item/premium-gold-foil/',
        'https://www.pintecl.com/cn/solutions/cosmetics-packaging/',
        'https://www.pintecl.com/cn/products/category/general-hot-stamping/',
      ];
      return required.every((url) => locs.includes(url)) && stale.every((url) => !locs.includes(url));
    },
  },
  {
    name: 'Sitemap URLs do not contain path double slashes',
    pass: () => {
      const sitemap = read('public/sitemap.xml');
      const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
      return locs.every((url) => !url.replace('https://', '').includes('//'));
    },
  },
  {
    name: 'Sitemap generator emits hreflang alternates',
    pass: () => /xmlns:xhtml=/.test(read('scripts/generate-sitemap.js')) && /xhtml:link/.test(read('scripts/generate-sitemap.js')),
  },
  {
    name: 'llms.txt uses direct language canonical URLs',
    pass: () => {
      const llms = read('public/llms.txt');
      return /https:\/\/www\.pintecl\.com\/en\/products/.test(llms)
        && /https:\/\/www\.pintecl\.com\/cn\/products/.test(llms)
        && !/https:\/\/www\.pintecl\.com\/products\)/.test(llms)
        && !/https:\/\/www\.pintecl\.com\/about\)/.test(llms)
        && !/https:\/\/www\.pintecl\.com\/contact\)/.test(llms);
    },
  },
  {
    name: 'Audit report honors accepted Notion hardcoding',
    pass: () => {
      const report = read('SEO-SOURCE-AUDIT-2026-06-03.md');
      return !/Hardcoded credential risk/.test(report) && !/Rotate\/remove exposed credentials/.test(report);
    },
  },
  {
    name: 'Prerender injects static SEO body content',
    pass: () => /buildSnapshot/.test(read('prerender.ts')) && /class="seo-snapshot"/.test(read('prerender/snapshot-builder.ts')),
  },
  {
    name: 'Prerender injects static canonical and hreflang head tags',
    pass: () => /buildStaticHeadLinks/.test(read('prerender.ts'))
      && /rel="canonical"/.test(read('prerender.ts'))
      && /hreflang="x-default"/.test(read('prerender.ts')),
  },
];

let failures = 0;
for (const check of checks) {
  if (check.pass()) {
    console.log(`PASS ${check.name}`);
  } else {
    failures += 1;
    console.error(`FAIL ${check.name}`);
  }
}

const guideErrors = await validateGeneratedGuidePublication();
if (guideErrors.length === 0) {
  console.log('PASS Generated guide publication gate');
} else {
  failures += guideErrors.length;
  for (const error of guideErrors) console.error(`FAIL Generated guide publication gate: ${error}`);
}

if (failures > 0) {
  process.exit(1);
}
}
