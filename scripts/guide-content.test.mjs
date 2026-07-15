import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadGuidePairs, validateGuideRecords, buildPublishedManifest } from './lib/guide-content.mjs';

const frontmatter = ({ lang, title, status = 'published' }) => `---
topic_id: HF-TEST-001
lang: ${lang}
slug: uv-label-foil-adhesion-test
status: ${status}
cluster: troubleshooting
intent: troubleshooting
title: ${title}
description: Practical diagnosis for foil adhesion.
primary_keyword: foil adhesion test
secondary_keywords: [foil peeling]
related_products: [PC]
related_guides: [hot-stamping-troubleshooting]
author: PINTE Technical Team
reviewer: PINTE Application Engineer
date_published: 2026-07-16
date_modified: 2026-07-16
answer: Final settings require sampling on the actual substrate and machine.
faqs:
  - question: Why does foil peel?
    answer: Check surface condition, heat, pressure, and foil grade.
sources:
  - label: S1
    title: Technical source one
    url: https://example.com/source-one
  - label: S2
    title: Technical source two
    url: https://example.com/source-two
---

## Diagnosis

The actual substrate, ink, pressure, heat, and speed must be tested together.
`;

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
