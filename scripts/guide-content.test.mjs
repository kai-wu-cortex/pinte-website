import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  buildPublishedManifest,
  loadGuidePairs,
  loadGuideTopicRegistry,
  parseGuideFile,
  validateGuideRecords,
} from './lib/guide-content.mjs';
import {
  GENERATED_GUIDE_LEGACY_SLUG_MIGRATIONS,
  extractLegacyGuideSlugs,
} from './lib/guide-slugs.mjs';

test('build CLI writes only to an explicit temporary output', (t) => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'pinte-guide-cli-'));
  const output = path.join(temporaryRoot, 'generatedGuides.ts');
  const productionManifest = fs.readFileSync('data/generatedGuides.ts', 'utf8');
  t.after(() => fs.rmSync(temporaryRoot, { recursive: true, force: true }));

  const result = spawnSync(process.execPath, ['scripts/build-guide-content.mjs', '--output', output], { encoding: 'utf8' });

  assert.equal(result.status, 0, result.stderr);
  assert.match(fs.readFileSync(output, 'utf8'), /AUTO-GENERATED/);
  assert.equal(fs.readFileSync('data/generatedGuides.ts', 'utf8'), productionManifest);
});

test('build CLI check mode detects a stale manifest without rewriting it', (t) => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'pinte-guide-check-'));
  const output = path.join(temporaryRoot, 'generatedGuides.ts');
  const staleManifest = '// stale manifest\nexport default [] as const;\n';
  fs.writeFileSync(output, staleManifest);
  t.after(() => fs.rmSync(temporaryRoot, { recursive: true, force: true }));

  const result = spawnSync(
    process.execPath,
    ['scripts/build-guide-content.mjs', '--check', '--output', output],
    { encoding: 'utf8' },
  );

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /out of date/i);
  assert.equal(fs.readFileSync(output, 'utf8'), staleManifest);
});

const QUALIFIED_ANSWER = 'Final settings require test sample confirmation on the actual substrate, machine, artwork, and speed.';
const QUALIFIED_BODY = 'Test the actual substrate, machine, artwork, and speed together before finalizing settings.';

const frontmatter = ({
  topicId = 'HF-TEST-001',
  lang,
  title,
  status = 'published',
  slug = 'uv-label-foil-adhesion-test',
  description = 'Practical diagnosis for foil adhesion.',
  primaryKeyword = 'foil adhesion test',
  secondaryKeywords = '[foil peeling]',
  heroImage = '',
  heroAlt = '',
  answer = QUALIFIED_ANSWER,
  faqQuestion = 'Why does foil peel?',
  faqAnswer = 'Check surface condition, heat, pressure, and foil grade.',
  sourceOneLabel = 'S1',
  sourceOneTitle = 'Technical source one',
  sourceOnePublisher = 'Technical publisher',
  sourceOneUrl = 'https://example.com/source-one',
  cluster = 'troubleshooting',
  intent = 'troubleshooting',
  relatedProducts = '[PC]',
  relatedGuides = '[hot-stamping-troubleshooting]',
  body = QUALIFIED_BODY,
}) => `---
topic_id: ${topicId}
lang: ${lang}
slug: ${slug}
status: ${status}
cluster: ${cluster}
intent: ${intent}
title: ${title}
description: ${description}
primary_keyword: ${primaryKeyword}
secondary_keywords: ${secondaryKeywords}
related_products: ${relatedProducts}
related_guides: ${relatedGuides}
author: PINTE Technical Team
reviewer: PINTE Application Engineer
date_published: 2026-07-16
date_modified: 2026-07-16
hero_image: ${heroImage}
hero_alt: ${heroAlt}
answer: ${answer}
faqs:
  - question: ${faqQuestion}
    answer: ${faqAnswer}
sources:
  - label: ${sourceOneLabel}
    title: ${sourceOneTitle}
    publisher: ${sourceOnePublisher}
    url: ${sourceOneUrl}
  - label: S2
    title: Technical source two
    url: https://example.com/source-two
---

## Diagnosis

${body}
`;

function createTopic(root, topicId) {
  const topic = path.join(root, topicId);
  fs.mkdirSync(topic, { recursive: true });
  return topic;
}

function writeGuide(root, topicId, lang, options) {
  const topic = createTopic(root, topicId);
  const filePath = path.join(topic, `${lang}.md`);
  fs.writeFileSync(filePath, frontmatter({ topicId, lang, ...options }));
  return filePath;
}

function registryRecord({
  topicId,
  slug,
  status = 'published',
  cluster = 'troubleshooting',
  intent = 'troubleshooting',
  relatedProducts = ['PC'],
  relatedGuides = ['hot-stamping-troubleshooting'],
}) {
  return {
    topic_id: topicId,
    slug,
    status,
    cluster,
    intent,
    related_products: relatedProducts,
    related_guides: relatedGuides,
  };
}

test('package deployment scripts verify guides without mutating source artifacts', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  assert.equal(pkg.engines?.node, '>=22.12.0');
  assert.match(pkg.scripts['guides:verify'], /build-guide-content\.mjs --check/);
  assert.doesNotMatch(pkg.scripts['guides:check'], /guides:build/);
  assert.match(pkg.scripts.build, /^npm run guides:verify && vite build$/);
  assert.match(pkg.scripts['build:seo'], /^npm run guides:verify && vite build/);
});

test('omits dedicated FAQ and reference sections from bodyHtml while preserving frontmatter arrays', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pinte-guides-'));
  const filePath = writeGuide(root, 'HF-BODY-SECTIONS', 'en', {
    title: 'Foil Guide',
    body: `${QUALIFIED_BODY}

## FAQ

FAQ body sentinel.

### FAQ child heading

FAQ child sentinel.

## Keep after FAQ

Visible section one.

## Frequently Asked Questions

Frequently asked body sentinel.

## Keep after frequently asked questions

Visible section two.

## 常见问题

Chinese FAQ body sentinel.

## Keep after Chinese FAQ

Visible section three.

## References

References body sentinel.

## Keep after references

Visible section four.

## Sources

Sources body sentinel.

## Keep after sources

Visible section five.

## 参考资料

Chinese references body sentinel.

## Keep after Chinese references

Visible section six.

## 参考来源

Chinese sources body sentinel.`,
  });

  const record = parseGuideFile(filePath);

  assert.match(record.markdown, /FAQ body sentinel/);
  assert.match(record.markdown, /Chinese sources body sentinel/);
  assert.doesNotMatch(record.bodyHtml, /FAQ body sentinel|FAQ child sentinel|Frequently asked body sentinel/);
  assert.doesNotMatch(record.bodyHtml, /Chinese FAQ body sentinel|References body sentinel|Sources body sentinel/);
  assert.doesNotMatch(record.bodyHtml, /Chinese references body sentinel|Chinese sources body sentinel/);
  assert.match(record.bodyHtml, /Visible section one/);
  assert.match(record.bodyHtml, /Visible section six/);
  assert.equal(record.faqs[0].question, 'Why does foil peel?');
  assert.equal(record.sources[0].url, 'https://example.com/source-one');
});

test('rejects non-HTTPS and unsafe published source URLs', async () => {
  const cases = [
    ['javascript URL', 'javascript:alert(1)'],
    ['data URL', 'data:text/plain,source'],
    ['relative URL', '/technical-source'],
    ['HTTP URL', 'http://example.com/source'],
    ['credentialed URL', 'https://user:password@example.com/source'],
    ['malformed URL', 'https://[invalid'],
  ];

  for (const [label, sourceOneUrl] of cases) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pinte-guides-'));
    const topicId = `HF-SOURCE-${label.replaceAll(' ', '-').toUpperCase()}`;
    const enPath = writeGuide(root, topicId, 'en', { title: 'Foil Guide', sourceOneUrl });
    writeGuide(root, topicId, 'cn', { title: '烫金指南' });
    const result = validateGuideRecords(await loadGuidePairs(root));

    assert.ok(
      result.errors.some((issue) => issue.code === 'invalid-source-url' && issue.filePath === enPath),
      `expected invalid-source-url for ${label}`,
    );
  }
});

test('publishes only complete bilingual pairs', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pinte-guides-'));
  const topic = path.join(root, 'HF-TEST-001');
  fs.mkdirSync(topic, { recursive: true });
  fs.writeFileSync(path.join(topic, 'en.md'), frontmatter({ lang: 'en', title: 'UV Label Foil Adhesion Test' }));
  fs.writeFileSync(path.join(topic, 'cn.md'), frontmatter({ lang: 'cn', title: 'UV 标签烫金附着测试' }));
  const records = await loadGuidePairs(root);
  const result = validateGuideRecords(records);
  assert.deepEqual(result.errors, []);
  assert.equal(buildPublishedManifest(records).length, 2);
});

test('rejects a published guide with no language pair', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pinte-guides-'));
  const topic = path.join(root, 'HF-TEST-001');
  fs.mkdirSync(topic, { recursive: true });
  fs.writeFileSync(path.join(topic, 'en.md'), frontmatter({ lang: 'en', title: 'UV Label Foil Adhesion Test' }));
  const records = await loadGuidePairs(root);
  const result = validateGuideRecords(records);
  assert.ok(result.errors.some((issue) => issue.code === 'missing-language-pair'));
});

test('rejects internal strategy terms in published customer copy', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pinte-guides-'));
  const topic = path.join(root, 'HF-TEST-001');
  fs.mkdirSync(topic, { recursive: true });
  fs.writeFileSync(path.join(topic, 'en.md'), frontmatter({ lang: 'en', title: 'AI Search Optimization for Foil' }));
  fs.writeFileSync(path.join(topic, 'cn.md'), frontmatter({ lang: 'cn', title: 'UV 标签烫金附着测试' }));
  const result = validateGuideRecords(await loadGuidePairs(root));
  assert.ok(result.errors.some((issue) => issue.code === 'forbidden-public-term'));
});

test('rejects punctuation variants of AI search terminology', async () => {
  for (const [index, title] of ['AI-search for foil', 'AI search optimization for foil', 'AI–search optimization'].entries()) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pinte-guides-'));
    const topicId = `HF-AI-TERM-${index}`;
    writeGuide(root, topicId, 'en', { title });
    writeGuide(root, topicId, 'cn', { title: `烫金指南 ${index}` });

    const result = validateGuideRecords(await loadGuidePairs(root));

    assert.ok(result.errors.some((issue) => issue.code === 'forbidden-public-term'), title);
  }
});

test('loads the topic registry and rejects duplicate IDs and slugs', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pinte-registry-'));
  const registryPath = path.join(root, 'topics.json');
  fs.writeFileSync(registryPath, JSON.stringify([
    registryRecord({ topicId: 'HF-REGISTRY-1', slug: 'registry-one' }),
    registryRecord({ topicId: 'HF-REGISTRY-1', slug: 'registry-two' }),
    registryRecord({ topicId: 'HF-REGISTRY-3', slug: 'registry-two' }),
  ]));

  const registry = loadGuideTopicRegistry(registryPath);
  const result = validateGuideRecords([], { registry });

  assert.ok(result.errors.some((issue) => issue.code === 'duplicate-registry-topic-id'));
  assert.ok(result.errors.some((issue) => issue.code === 'duplicate-registry-slug'));
});

test('requires published source metadata to match its registry record', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pinte-guides-'));
  writeGuide(root, 'HF-REGISTRY-MATCH', 'en', { slug: 'registry-match', title: 'Registry Match' });
  writeGuide(root, 'HF-REGISTRY-MATCH', 'cn', { slug: 'registry-match', title: '注册表匹配' });
  const records = await loadGuidePairs(root);
  const matching = registryRecord({ topicId: 'HF-REGISTRY-MATCH', slug: 'registry-match' });

  assert.deepEqual(validateGuideRecords(records, { registry: [matching] }).errors, []);

  for (const [field, value] of [
    ['topic_id', 'HF-WRONG-ID'],
    ['slug', 'wrong-slug'],
    ['status', 'reviewed'],
    ['cluster', 'selection'],
    ['intent', 'selection'],
    ['related_products', ['PK']],
    ['related_guides', ['hot-stamping-foil-buying-guide']],
  ]) {
    const registry = [{ ...matching, [field]: value }];
    const result = validateGuideRecords(records, { registry });
    const expectedCode = field === 'topic_id' ? 'missing-published-registry-record' : 'registry-source-mismatch';
    assert.ok(
      result.errors.some((issue) => issue.code === expectedCode && (field === 'topic_id' || issue.field === field)),
      `expected ${field} parity failure`,
    );
  }
});

test('allows draft or reviewed registry and source records outside the manifest', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pinte-guides-'));
  writeGuide(root, 'HF-REVIEWED-ONLY', 'en', {
    slug: 'reviewed-only',
    status: 'reviewed',
    title: 'Reviewed Only',
  });
  const records = await loadGuidePairs(root);
  const registry = [
    registryRecord({ topicId: 'HF-REVIEWED-ONLY', slug: 'reviewed-only', status: 'reviewed' }),
    registryRecord({ topicId: 'HF-DRAFT-REGISTRY', slug: 'draft-registry', status: 'draft' }),
  ];

  assert.deepEqual(validateGuideRecords(records, { registry }).errors, []);
  assert.deepEqual(buildPublishedManifest(records), []);
});

test('derives only GEO_GUIDES slugs and exposes an explicit empty migration allowlist', () => {
  const source = `
interface Example { slug: string }
export const GEO_GUIDES = [
  {
    slug: 'legacy-one',
    nested: { slug: 'nested-ignore' },
  },
  {
    slug: 'legacy-two',
  },
];
`;

  assert.deepEqual(extractLegacyGuideSlugs(source), ['legacy-one', 'legacy-two']);
  assert.deepEqual(GENERATED_GUIDE_LEGACY_SLUG_MIGRATIONS, []);
});

test('rejects generated published slugs that collide with GEO_GUIDES slugs', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pinte-guides-'));
  writeGuide(root, 'HF-LEGACY-COLLISION', 'en', { slug: 'legacy-guide', title: 'Legacy Collision' });
  writeGuide(root, 'HF-LEGACY-COLLISION', 'cn', { slug: 'legacy-guide', title: '旧指南冲突' });

  const result = validateGuideRecords(await loadGuidePairs(root), {
    legacySlugs: ['legacy-guide', 'hot-stamping-troubleshooting'],
  });

  assert.ok(result.errors.some((issue) => issue.code === 'legacy-slug-collision'));
});

test('validates related products and complete guide targets', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pinte-guides-'));
  writeGuide(root, 'HF-REFERENCE-A', 'en', {
    slug: 'reference-a',
    title: 'Reference A',
    relatedProducts: '[PK, PC, PLPY, DIGITAL]',
    relatedGuides: '[reference-b, legacy-guide]',
  });
  writeGuide(root, 'HF-REFERENCE-A', 'cn', {
    slug: 'reference-a',
    title: '引用 A',
    relatedProducts: '[PK, PC, PLPY, DIGITAL]',
    relatedGuides: '[reference-b, legacy-guide]',
  });
  writeGuide(root, 'HF-REFERENCE-B', 'en', { slug: 'reference-b', title: 'Reference B' });
  writeGuide(root, 'HF-REFERENCE-B', 'cn', { slug: 'reference-b', title: '引用 B' });

  const result = validateGuideRecords(await loadGuidePairs(root), {
    legacySlugs: ['legacy-guide', 'hot-stamping-troubleshooting'],
  });

  assert.deepEqual(result.errors, []);
});

test('rejects unsupported products and self or missing related guides', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pinte-guides-'));
  writeGuide(root, 'HF-BAD-REFERENCE', 'en', {
    slug: 'bad-reference',
    title: 'Bad Reference',
    relatedProducts: '[PC, UNKNOWN]',
    relatedGuides: '[bad-reference, missing-guide]',
  });
  writeGuide(root, 'HF-BAD-REFERENCE', 'cn', {
    slug: 'bad-reference',
    title: '错误引用',
    relatedProducts: '[PC, UNKNOWN]',
    relatedGuides: '[bad-reference, missing-guide]',
  });

  const result = validateGuideRecords(await loadGuidePairs(root), { legacySlugs: [] });

  assert.ok(result.errors.some((issue) => issue.code === 'unsupported-related-product'));
  assert.ok(result.errors.some((issue) => issue.code === 'self-related-guide'));
  assert.ok(result.errors.some((issue) => issue.code === 'missing-related-guide'));
});

test('rejects normalized duplicate title and intent within one language', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pinte-guides-'));
  writeGuide(root, 'HF-DUPLICATE-A', 'en', { slug: 'duplicate-a', title: 'Foil - Selection Guide!' });
  writeGuide(root, 'HF-DUPLICATE-A', 'cn', { slug: 'duplicate-a', title: '烫金选择指南 A' });
  writeGuide(root, 'HF-DUPLICATE-B', 'en', { slug: 'duplicate-b', title: '  foil selection guide  ' });
  writeGuide(root, 'HF-DUPLICATE-B', 'cn', { slug: 'duplicate-b', title: '烫金选择指南 B' });

  const result = validateGuideRecords(await loadGuidePairs(root));

  assert.ok(result.errors.some((issue) => issue.code === 'duplicate-title-intent'));
});

test('rejects highly similar published bodies within one language', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pinte-guides-'));
  const duplicatedBody = `Inspect the substrate coating and surface energy before selecting a foil grade.
Record machine temperature pressure dwell speed and artwork coverage during every controlled sample.
Compare edge definition transfer completeness gloss and adhesion using the agreed acceptance method.
Keep the approved sample settings and production material together for final order confirmation.`;
  writeGuide(root, 'HF-SIMILAR-A', 'en', { slug: 'similar-a', title: 'Similarity A', body: duplicatedBody });
  writeGuide(root, 'HF-SIMILAR-A', 'cn', { slug: 'similar-a', title: '相似性 A', body: '这是一篇不同的中文技术内容。' });
  writeGuide(root, 'HF-SIMILAR-B', 'en', { slug: 'similar-b', title: 'Similarity B', body: duplicatedBody });
  writeGuide(root, 'HF-SIMILAR-B', 'cn', { slug: 'similar-b', title: '相似性 B', body: '另一篇独立的中文技术内容。' });

  const result = validateGuideRecords(await loadGuidePairs(root));

  assert.ok(result.errors.some((issue) => issue.code === 'high-body-similarity' && issue.lang === 'en'));
});

test('does not compare bilingual counterparts for duplicate content', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pinte-guides-'));
  const sharedBody = `Inspect substrate coating and surface energy before selecting the foil grade.
Record machine temperature pressure dwell speed and artwork coverage during each controlled sample.
Compare transfer completeness edge definition gloss and adhesion with the agreed acceptance method.`;
  writeGuide(root, 'HF-BILINGUAL-CONTENT', 'en', { title: 'Shared Technical Guide', body: sharedBody });
  writeGuide(root, 'HF-BILINGUAL-CONTENT', 'cn', { title: 'Shared Technical Guide', body: sharedBody });

  const result = validateGuideRecords(await loadGuidePairs(root));

  assert.ok(!result.errors.some((issue) => ['duplicate-title-intent', 'high-body-similarity'].includes(issue.code)));
});

test('publishes only complete, non-duplicate bilingual pairs', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pinte-guides-'));
  writeGuide(root, 'HF-COMPLETE', 'en', { slug: 'complete-guide', title: 'Complete Guide' });
  writeGuide(root, 'HF-COMPLETE', 'cn', { slug: 'complete-guide', title: '完整指南' });
  writeGuide(root, 'HF-INCOMPLETE', 'en', { slug: 'incomplete-guide', title: 'Incomplete Guide' });
  writeGuide(root, 'HF-DRAFT', 'en', { slug: 'draft-guide', title: 'Draft Pair' });
  writeGuide(root, 'HF-DRAFT', 'cn', { slug: 'draft-guide', status: 'draft', title: '草稿配对' });
  writeGuide(root, 'HF-MISMATCHED', 'en', { slug: 'english-guide', title: 'Mismatched Guide' });
  writeGuide(root, 'HF-MISMATCHED', 'cn', { slug: 'chinese-guide', title: '不匹配指南' });
  writeGuide(root, 'HF-DUPLICATE', 'en', { slug: 'duplicate-guide', title: 'Duplicate Guide' });
  writeGuide(root, 'HF-DUPLICATE', 'cn', { slug: 'duplicate-guide', title: '重复指南' });

  const records = await loadGuidePairs(root);
  const duplicate = {
    ...records.find((record) => record.topic_id === 'HF-DUPLICATE' && record.lang === 'en'),
    filePath: path.join(root, 'HF-DUPLICATE', 'en-duplicate.md'),
  };
  const manifest = buildPublishedManifest([...records, duplicate]);

  assert.deepEqual(
    manifest.map((record) => `${record.topicId}:${record.lang}`),
    ['HF-COMPLETE:cn', 'HF-COMPLETE:en'],
  );
});

test('rejects forbidden terms in public FAQ and metadata fields', async () => {
  const cases = [
    { field: 'primary keyword', options: { primaryKeyword: 'AI search optimization' } },
    { field: 'secondary keyword', options: { secondaryKeywords: '[GEO guidance]' } },
    { field: 'FAQ question', options: { faqQuestion: 'Can ChatGPT set foil parameters?' } },
    { field: 'FAQ answer', options: { faqAnswer: 'Ask ChatGPT for a recommendation.' } },
    { field: 'hero image', options: { heroImage: 'https://cdn.example.com/seo-foil.jpg' } },
    { field: 'hero alt', options: { heroAlt: 'GEO guide image' } },
    { field: 'source label', options: { sourceOneLabel: 'GEO source' } },
    { field: 'source title', options: { sourceOneTitle: 'Perplexity technical source' } },
    { field: 'source metadata', options: { sourceOnePublisher: 'Google AI reference library' } },
  ];

  for (const { field, options } of cases) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pinte-guides-'));
    const topicId = `HF-FORBIDDEN-${field.replaceAll(' ', '-').toUpperCase()}`;
    const enPath = writeGuide(root, topicId, 'en', { title: 'Foil Guide', ...options });
    writeGuide(root, topicId, 'cn', { title: '烫金指南' });
    const result = validateGuideRecords(await loadGuidePairs(root));

    assert.ok(
      result.errors.some((issue) => issue.code === 'forbidden-public-term' && issue.filePath === enPath),
      `expected forbidden term in ${field}`,
    );
  }
});

test('does not scan source URLs for forbidden public terms', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pinte-guides-'));
  writeGuide(root, 'HF-SOURCE-URL', 'en', {
    title: 'Foil Guide',
    sourceOneUrl: 'https://example.com/seo-reference',
  });
  writeGuide(root, 'HF-SOURCE-URL', 'cn', { title: '烫金指南' });
  const result = validateGuideRecords(await loadGuidePairs(root));

  assert.ok(!result.errors.some((issue) => issue.code === 'forbidden-public-term'));
});

test('requires every sampling qualification dimension for published records', async () => {
  const dimensions = ['actual substrate', 'machine', 'artwork', 'speed'];
  for (const missingDimension of dimensions) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pinte-guides-'));
    const topicId = `HF-QUALIFICATION-${missingDimension.replaceAll(' ', '-').toUpperCase()}`;
    const remainingDimensions = dimensions.filter((dimension) => dimension !== missingDimension).join(', ');
    const enPath = writeGuide(root, topicId, 'en', {
      title: 'Foil Guide',
      answer: `Final settings require test sample confirmation on the ${remainingDimensions}.`,
      body: `Test the ${remainingDimensions} together before finalizing settings.`,
    });
    writeGuide(root, topicId, 'cn', { title: '烫金指南' });
    const result = validateGuideRecords(await loadGuidePairs(root));

    assert.ok(
      result.errors.some((issue) => issue.code === 'missing-sampling-qualification' && issue.filePath === enPath),
      `expected missing qualification for ${missingDimension}`,
    );
  }
});

test('accepts sampling wording for final settings', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pinte-guides-'));
  writeGuide(root, 'HF-SAMPLING-WORDING', 'en', {
    title: 'Foil Guide',
    answer: 'Final settings require sampling on the actual substrate, machine, artwork, and speed.',
    body: 'Use the actual substrate, machine, artwork, and speed before finalizing settings.',
  });
  writeGuide(root, 'HF-SAMPLING-WORDING', 'cn', { title: '烫金指南' });
  const result = validateGuideRecords(await loadGuidePairs(root));

  assert.deepEqual(result.errors, []);
});

test('rejects sampling details scattered across unrelated paragraphs', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pinte-guides-'));
  const enPath = writeGuide(root, 'HF-SCATTERED-QUALIFICATION', 'en', {
    title: 'Foil Guide',
    answer: 'Final settings require sampling confirmation.',
    body: `The actual substrate determines surface response.

Machine condition affects heat transfer.

Artwork details affect coverage.

Speed changes dwell time.`,
  });
  writeGuide(root, 'HF-SCATTERED-QUALIFICATION', 'cn', { title: '烫金指南' });
  const result = validateGuideRecords(await loadGuidePairs(root));

  assert.ok(result.errors.some((issue) => issue.code === 'missing-sampling-qualification' && issue.filePath === enPath));
});

test('accepts canonical English and Chinese sampling qualification language', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pinte-guides-'));
  writeGuide(root, 'HF-CHINESE-QUALIFICATION', 'en', {
    title: 'Foil Guide',
    answer: 'Final settings require test sample confirmation on the actual substrate, machine, artwork, and speed.',
  });
  writeGuide(root, 'HF-CHINESE-QUALIFICATION', 'cn', {
    title: '烫金指南',
    answer: '最终参数必须通过实际承印物、机台、图稿和速度的打样确认。',
    body: '请在实际承印物、机台、图稿和速度条件下测试打样，再确认最终设置。',
  });
  const result = validateGuideRecords(await loadGuidePairs(root));

  assert.deepEqual(result.errors, []);
});
