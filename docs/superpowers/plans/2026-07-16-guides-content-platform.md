# Guides Content Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Markdown-backed bilingual `/guides/` platform that validates, renders, prerenders, and indexes only reviewed published guide pairs while preserving all existing guides.

**Architecture:** Authoring lives in paired `content/guides/<topic-id>/{en,cn}.md` files. A Node build step parses and validates Markdown into a generated TypeScript manifest used by React, prerender snapshots, and sitemap generation; legacy `GEO_GUIDES` remain available through a merged registry.

**Tech Stack:** React 19, React Router 6, Vite 7, TypeScript 5.8, Node.js, `gray-matter`, `marked`, `sanitize-html`, Node test runner.

## Global Constraints

- Public titles, body copy, meta, and structured data under `/guides/` must not expose SEO, GEO, ChatGPT, Perplexity, Google AI, or AI search optimization strategy terms.
- English and Chinese files use the same `topic_id` and stable English `slug`.
- Only `published` pairs enter routes, catalog navigation, prerender output, or sitemap.
- Recommendations are test starting points and must say that final settings require sampling on the actual substrate, machine, artwork, and speed.
- Never invent prices, inventory, reviews, certifications, test results, customer cases, or absolute performance claims.
- Preserve the current `GEO_GUIDES` pages and their URLs.

---

## File Structure

- Create `content/guides/HF-000001/en.md`: English fixture guide.
- Create `content/guides/HF-000001/cn.md`: Chinese fixture guide.
- Create `content/guides/topics.json`: initial topic registry consumed by validation.
- Create `scripts/lib/guide-content.mjs`: Markdown parser, sanitizer, pair validator, similarity checks, and manifest builder.
- Create `scripts/build-guide-content.mjs`: CLI that writes `data/generatedGuides.ts` and a validation report.
- Create `scripts/validate-guide-content.mjs`: validation-only CLI.
- Create `scripts/guide-content.test.mjs`: Node tests for parsing, pairing, forbidden terms, status gating, and similarity.
- Create `data/generatedGuides.ts`: generated manifest, committed so TypeScript imports resolve before the first build.
- Create `data/guideContent.ts`: stable frontend and prerender interfaces over generated and legacy content.
- Create `pages/LongFormGuide.tsx`: customer-facing renderer for generated guides.
- Create `pages/GuideRoute.tsx`: dispatch generated guides to `LongFormGuide` and legacy guides to `GeoGuide`.
- Modify `App.tsx`: use `GuideRoute` for `guides/:slug`.
- Modify `pages/GeoGuideCatalog.tsx`: merge generated guide metadata with legacy guides and group by 12 clusters.
- Modify `prerender/snapshot-builder.ts`: render generated guide HTML and schemas from the manifest.
- Modify `prerender.ts`: add published generated guide routes.
- Modify `scripts/generate-sitemap.js`: include every published generated pair with real `lastmod`, hreflang, and image caption.
- Modify `scripts/seo-source-check.mjs`: verify generated guide coverage and customer-facing forbidden-term rules.
- Modify `package.json` and `package-lock.json`: dependencies and content commands.

---

### Task 1: Parser and Validation Core

**Files:**
- Create: `scripts/lib/guide-content.mjs`
- Create: `scripts/guide-content.test.mjs`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Produces: `parseGuideFile(filePath): GuideRecord`
- Produces: `loadGuidePairs(contentRoot): Promise<GuideRecord[]>`
- Produces: `validateGuideRecords(records, options): { errors: ValidationIssue[]; warnings: ValidationIssue[] }`
- Produces: `buildPublishedManifest(records): GeneratedGuideRecord[]`

- [ ] **Step 1: Install parsing dependencies**

Run:

```bash
npm install gray-matter marked sanitize-html
```

Expected: `package.json` and `package-lock.json` include all three packages with no peer dependency failure.

- [ ] **Step 2: Add failing parser and validator tests**

Create `scripts/guide-content.test.mjs` with tests that write temporary paired Markdown files and assert pairing/status rules:

```js
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
```

- [ ] **Step 3: Run tests and verify they fail**

Run:

```bash
node --test scripts/guide-content.test.mjs
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `scripts/lib/guide-content.mjs`.

- [ ] **Step 4: Implement parser, sanitizer, and validation**

Create `scripts/lib/guide-content.mjs` with these exports and exact status behavior:

```js
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
```

- [ ] **Step 5: Run tests and commit**

Run:

```bash
node --test scripts/guide-content.test.mjs
```

Expected: all tests PASS.

Commit:

```bash
git add package.json package-lock.json scripts/lib/guide-content.mjs scripts/guide-content.test.mjs
git commit -m "Add guide content parser and validation"
```

### Task 2: Build Manifest and Fixture Pair

**Files:**
- Create: `content/guides/HF-000001/en.md`
- Create: `content/guides/HF-000001/cn.md`
- Create: `content/guides/topics.json`
- Create: `scripts/build-guide-content.mjs`
- Create: `scripts/validate-guide-content.mjs`
- Create: `data/generatedGuides.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `loadGuidePairs`, `validateGuideRecords`, `buildPublishedManifest`
- Produces: `data/generatedGuides.ts` with a default `GeneratedGuideRecord[]` export

- [ ] **Step 1: Add a failing CLI integration test**

Extend `scripts/guide-content.test.mjs`:

```js
import { spawnSync } from 'node:child_process';

test('build CLI creates a TypeScript manifest', () => {
  const result = spawnSync(process.execPath, ['scripts/build-guide-content.mjs'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(fs.readFileSync('data/generatedGuides.ts', 'utf8'), /AUTO-GENERATED/);
});
```

- [ ] **Step 2: Create a complete published fixture pair**

Create `HF-000001/en.md` and `cn.md` using the approved frontmatter, two HTTPS sources, visible FAQ, one related product, one related guide, and body sections `Direct answer`, `Diagnosis table`, `Sampling steps`, and `References`. Use only conservative claims and state that final settings require sampling.

- [ ] **Step 3: Implement the build and validation CLIs**

Create `scripts/build-guide-content.mjs`:

```js
import fs from 'node:fs';
import path from 'node:path';
import { loadGuidePairs, validateGuideRecords, buildPublishedManifest } from './lib/guide-content.mjs';

const root = path.resolve('content/guides');
const output = path.resolve('data/generatedGuides.ts');
const records = await loadGuidePairs(root);
const result = validateGuideRecords(records);
if (result.errors.length) {
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
const manifest = buildPublishedManifest(records);
fs.writeFileSync(output, `// AUTO-GENERATED by scripts/build-guide-content.mjs\nexport default ${JSON.stringify(manifest, null, 2)} as const;\n`);
console.log(`Generated ${manifest.length} localized guide records.`);
```

Create `scripts/validate-guide-content.mjs` with the same load and validation path, but no write; print counts and exit 1 on errors.

- [ ] **Step 4: Add package commands**

Add:

```json
"guides:build": "node scripts/build-guide-content.mjs",
"guides:validate": "node scripts/validate-guide-content.mjs",
"guides:test": "node --test scripts/guide-content.test.mjs"
```

Prefix `dev`, `build`, `build:seo`, `prerender`, and `generate-sitemap` with `npm run guides:build &&` so every entry point has a current manifest.

- [ ] **Step 5: Verify and commit**

Run:

```bash
npm run guides:test
npm run guides:validate
npm run guides:build
```

Expected: tests pass and the manifest reports 2 localized records.

Commit:

```bash
git add content/guides data/generatedGuides.ts scripts/build-guide-content.mjs scripts/validate-guide-content.mjs package.json package-lock.json
git commit -m "Add bilingual guide manifest build"
```

### Task 3: Runtime Registry and Long-Form Renderer

**Files:**
- Create: `data/guideContent.ts`
- Create: `pages/LongFormGuide.tsx`
- Create: `pages/GuideRoute.tsx`
- Modify: `App.tsx`

**Interfaces:**
- Produces: `getGeneratedGuide(slug: string | undefined, lang: GuideLang): GeneratedGuideRecord | undefined`
- Produces: `getPublishedGuideSummaries(lang: GuideLang): GuideSummary[]`
- Consumes: legacy `getGeoGuide(slug)` as fallback

- [ ] **Step 1: Add compile-time registry interfaces**

Create `data/guideContent.ts` defining `GeneratedGuideRecord`, `GuideSource`, `GuideFaq`, and `GuideSummary`; cast the generated manifest after runtime filtering for `status === 'published'` and export the two lookup functions above.

- [ ] **Step 2: Implement the customer-facing renderer**

Create `LongFormGuide.tsx` to render:

```tsx
<article>
  <header>
    <p>{guide.primaryKeyword}</p>
    <h1>{guide.title}</h1>
    <p>{guide.answer}</p>
    <p>{guide.author} · {guide.reviewer} · {guide.dateModified}</p>
  </header>
  <div dangerouslySetInnerHTML={{ __html: guide.bodyHtml }} />
  <section aria-labelledby="guide-faq-title">...</section>
  <section aria-labelledby="guide-references-title">...</section>
  <Link to={`/${lang}/quote`}>...</Link>
</article>
```

Use existing typography and spacing conventions, but keep headings compact. Generate `Article`, `FAQPage`, and `BreadcrumbList` JSON-LD from exactly the visible values, including `datePublished`, `dateModified`, author, reviewer, hero image, and language.

- [ ] **Step 3: Implement route dispatch and preserve legacy behavior**

`GuideRoute.tsx` must select generated content first and return the existing `<GeoGuide />` when no generated record matches. Modify only the `guides/:slug` lazy route in `App.tsx` to use `GuideRoute`.

- [ ] **Step 4: Type-check changed files**

Run:

```bash
npx tsc --noEmit --pretty false 2>&1 | tee /tmp/pinte-tsc.log
```

Expected: no new errors referring to `guideContent.ts`, `LongFormGuide.tsx`, `GuideRoute.tsx`, or `App.tsx`; existing simulator/type errors may remain and must be reported unchanged.

- [ ] **Step 5: Commit**

```bash
git add data/guideContent.ts pages/LongFormGuide.tsx pages/GuideRoute.tsx App.tsx
git commit -m "Render generated long-form guides"
```

### Task 4: Clustered Guides Catalog

**Files:**
- Modify: `pages/GeoGuideCatalog.tsx`
- Create: `data/guideClusters.ts`

**Interfaces:**
- Consumes: `getPublishedGuideSummaries(lang)`
- Produces: `GUIDE_CLUSTERS` with 12 stable IDs and bilingual labels/descriptions

- [ ] **Step 1: Define the 12 cluster records**

Create `guideClusters.ts` with IDs matching frontmatter, bilingual customer-facing names, ordering, and fallback `general` mapping.

- [ ] **Step 2: Merge generated and legacy summaries**

Refactor `GeoGuideCatalog.tsx` so it normalizes both data sources into `{ slug, title, description, cluster, priority }`, sorts by cluster order then priority, and renders the existing guides without URL changes.

- [ ] **Step 3: Verify catalog behavior**

Run the development server and inspect `/en/guides/` and `/cn/guides/`. Expected: the new fixture appears in its cluster, every legacy guide remains linked, and no internal strategy terms are visible.

- [ ] **Step 4: Commit**

```bash
git add data/guideClusters.ts pages/GeoGuideCatalog.tsx
git commit -m "Group guides into customer topic clusters"
```

### Task 5: Prerender and Sitemap Integration

**Files:**
- Modify: `prerender/snapshot-builder.ts`
- Modify: `prerender.ts`
- Modify: `scripts/generate-sitemap.js`
- Modify: `tsconfig.prerender.json`

**Interfaces:**
- Consumes: `GENERATED_GUIDES`, filtered to `status === 'published'`
- Produces: static `dist/{lang}/guides/{slug}/index.html` containing answer, body, FAQs, sources, and JSON-LD

- [ ] **Step 1: Add generated guide lookup to snapshot builder**

Import `data/generatedGuides.ts`; when `route` starts with `guides/`, first find the matching generated record for `lang`, build crawlable article HTML, and return Article/FAQ/Breadcrumb schemas. Fall back to the existing `GEO_GUIDES` branch.

- [ ] **Step 2: Add only published generated slugs to static routes**

In `prerender.ts`, union legacy slugs with generated published slugs:

```ts
const guideRoutes = Array.from(new Set([
  ...GEO_GUIDES.map((guide) => `guides/${guide.slug}`),
  ...GENERATED_GUIDES.filter((guide) => guide.status === 'published').map((guide) => `guides/${guide.slug}`),
]));
```

- [ ] **Step 3: Add generated pages and image captions to sitemap**

In `generate-sitemap.js`, group generated records by slug, require both `en` and `cn`, use the newest pair `dateModified` as `lastmod`, and pass `heroImage`/`heroAlt` through `images`. Keep all previously published URLs on every regeneration.

- [ ] **Step 4: Verify prerender and sitemap**

Run:

```bash
npm run guides:build
npx tsc --skipLibCheck -p tsconfig.prerender.json
node scripts/generate-sitemap.js
node scripts/seo-source-check.mjs
```

Expected: commands pass; sitemap contains both fixture URLs and symmetric hreflang; generated static HTML contains the guide H1 and at least one source link.

- [ ] **Step 5: Commit**

```bash
git add prerender/snapshot-builder.ts prerender.ts scripts/generate-sitemap.js tsconfig.prerender.json public/sitemap.xml
git commit -m "Prerender and index published guide content"
```

### Task 6: Release Gates and End-to-End Verification

**Files:**
- Modify: `scripts/seo-source-check.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `npm run guides:check` as the mandatory pre-publish gate

- [ ] **Step 1: Add source checks**

Check that every generated published slug appears twice in sitemap, has both language files, has no forbidden public terms, and has non-empty body HTML, FAQs, sources, related products, and related guides.

- [ ] **Step 2: Add the aggregate command**

Add:

```json
"guides:check": "npm run guides:test && npm run guides:validate && npm run guides:build && node scripts/seo-source-check.mjs"
```

- [ ] **Step 3: Run proportional verification**

Run:

```bash
npm run guides:check
npm run build
git diff --check
```

Expected: guide checks and build pass. If the known Notion prerender network stage stalls, verify the Vite and generated-guide static stages completed, terminate the session, and document the unrelated Notion limitation.

- [ ] **Step 4: Commit**

```bash
git add scripts/seo-source-check.mjs package.json
git commit -m "Add guide publication quality gates"
```
