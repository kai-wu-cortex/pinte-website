import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadGuidePairs, validateGuideRecords, buildPublishedManifest } from './lib/guide-content.mjs';

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
  heroAlt = '',
  answer = QUALIFIED_ANSWER,
  faqQuestion = 'Why does foil peel?',
  faqAnswer = 'Check surface condition, heat, pressure, and foil grade.',
  sourceOneTitle = 'Technical source one',
  sourceOneUrl = 'https://example.com/source-one',
  body = QUALIFIED_BODY,
}) => `---
topic_id: ${topicId}
lang: ${lang}
slug: ${slug}
status: ${status}
cluster: troubleshooting
intent: troubleshooting
title: ${title}
description: ${description}
primary_keyword: ${primaryKeyword}
secondary_keywords: ${secondaryKeywords}
related_products: [PC]
related_guides: [hot-stamping-troubleshooting]
author: PINTE Technical Team
reviewer: PINTE Application Engineer
date_published: 2026-07-16
date_modified: 2026-07-16
hero_alt: ${heroAlt}
answer: ${answer}
faqs:
  - question: ${faqQuestion}
    answer: ${faqAnswer}
sources:
  - label: S1
    title: ${sourceOneTitle}
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
    { field: 'hero alt', options: { heroAlt: 'GEO guide image' } },
    { field: 'source title', options: { sourceOneTitle: 'Perplexity technical source' } },
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

test('accepts Chinese sampling qualification language', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pinte-guides-'));
  writeGuide(root, 'HF-CHINESE-QUALIFICATION', 'en', { title: 'Foil Guide' });
  writeGuide(root, 'HF-CHINESE-QUALIFICATION', 'cn', {
    title: '烫金指南',
    answer: '最终参数必须通过实际承印物、机台、图稿和速度的打样确认。',
    body: '请在实际承印物、机台、图稿和速度条件下测试打样，再确认最终设置。',
  });
  const result = validateGuideRecords(await loadGuidePairs(root));

  assert.deepEqual(result.errors, []);
});
