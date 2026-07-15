# Guides First Publishing Batch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Research, write, review, publish, and verify the first 50 hot-stamping topics as 100 original English and Chinese `/guides/` pages.

**Architecture:** Select P0 topics from the 10,000-topic inventory, create one shared fact brief per topic, then write language-specific Markdown pairs in five editorial batches of ten topics. Automated gates reject missing citations, duplicate intent, internal strategy language, unsupported claims, and incomplete bilingual pairs before publication.

**Tech Stack:** Markdown/YAML, HotFoil_Database, web research, guide validation/build scripts, React/Vite prerender, sitemap and IndexNow.

## Global Constraints

- 50 unique topics produce exactly 100 localized pages.
- Chinese pages are normally 1,500-3,500 Chinese characters; English pages are normally 1,200-2,500 words.
- English must be written for overseas B2B procurement language, not mechanically translated from Chinese.
- Every article normally contains 4-8 internal links and 2-5 contextual external sources.
- Reddit may support question discovery but cannot be the only evidence for technical parameters.
- Each recommendation must state that final settings require sampling on the actual substrate, machine, artwork, and speed.
- A page remains `reviewed` until technical, citation, duplication, and build checks all pass.

---

## File Structure

- Create `content/guides/briefs/HF-xxxxxx.json`: one fact brief per selected topic.
- Create `content/guides/HF-xxxxxx/en.md` and `cn.md`: 50 paired topic directories.
- Create `reports/guides/first-batch-selection.json`: selected topics and rationale.
- Create `reports/guides/first-batch-review.json`: per-page review results.
- Create `scripts/select-first-guide-batch.mjs`: deterministic P0 selection.
- Create `scripts/audit-first-guide-batch.mjs`: length, source, link, claims, and publication audit.
- Modify `content/guides/topics.json`: move selected records through `draft`, `reviewed`, and `published`.
- Modify `public/sitemap.xml`: generated output after publication.

---

### Task 1: Select 50 Non-Overlapping P0 Topics

**Files:**
- Create: `scripts/select-first-guide-batch.mjs`
- Create: `reports/guides/first-batch-selection.json`
- Modify: `content/guides/topics.json`

**Interfaces:**
- Produces exactly 50 records with `batch: "2026-07-p0-01"` and balanced cluster quotas.

- [ ] **Step 1: Implement selection rules**

Select topics covering UV inkjet label adhesion, PP/PE scratching, textured leather, coated/laminated/UV paper, hot/cold/digital/Sleeking/metallic ink comparisons, large solid areas, fine lines, pinholes, emboss registration, tape/rub/alcohol/scratch/fold tests, machine/die variables, sampling, roll specifications, MOQ, and supplier evaluation. Exclude any topic whose intent duplicates a legacy guide unless the new page has a narrower documented difference.

- [ ] **Step 2: Generate the selection report**

Each selected record must include `selectionReason`, `legacyOverlapCheck`, `requiredEvidence`, `sourceKeys`, and `relatedProducts`.

- [ ] **Step 3: Verify exact selection**

Run:

```bash
node scripts/select-first-guide-batch.mjs
node -e "const x=require('./reports/guides/first-batch-selection.json'); if(x.length!==50) process.exit(1)"
```

Expected: exit 0 with 50 unique topic IDs and slugs.

- [ ] **Step 4: Commit**

```bash
git add scripts/select-first-guide-batch.mjs reports/guides/first-batch-selection.json content/guides/topics.json
git commit -m "Select first 50 guide topics"
```

### Task 2: Build Fact Briefs and Source Evidence

**Files:**
- Create: `content/guides/briefs/HF-xxxxxx.json` for all 50 selected topics.
- Modify: `content/guides/source-registry.json` only when a new verified source is needed.

**Interfaces:**
- Produces per-topic brief fields: `directAnswer`, `buyerConcern`, `variables`, `diagnosticRows`, `samplingSteps`, `claimEvidence`, `sourceKeys`, `relatedProducts`, `relatedGuides`, `unsupportedClaimsToAvoid`.

- [ ] **Step 1: Search internal knowledge**

For each topic, search HotFoil_Database for product series, substrate, process, defect, and test terms. Record exact note paths used; mark uncertain internal claims `needs_verification` instead of treating them as company standards.

- [ ] **Step 2: Verify external sources**

Open every planned source URL. Prefer official standards, manufacturers, equipment documentation, and recognized trade publications. Record the exact claim each source supports and its access date. Do not copy source wording beyond short compliant excerpts.

- [ ] **Step 3: Create 50 fact briefs**

Every brief must contain at least two independent technical sources or one authoritative source plus a PINTE internal source. Reddit-only briefs fail review.

- [ ] **Step 4: Audit briefs**

Verify there are exactly 50 non-empty briefs and every source key resolves in `source-registry.json`.

- [ ] **Step 5: Commit**

```bash
git add content/guides/briefs content/guides/source-registry.json
git commit -m "Add evidence briefs for first guide batch"
```

### Task 3: Write Editorial Batch 1 (Selected Topics 1-10)

**Files:**
- Create: paired `en.md` and `cn.md` files for selected topic positions 1-10.
- Modify: matching records in `content/guides/topics.json`.

**Interfaces:**
- Consumes: exact topic records and fact briefs for positions 1-10.
- Produces: 20 localized Markdown files with `status: reviewed`.

- [ ] **Step 1: Draft ten English articles**

Write direct-answer openings, decision factors, diagnosis tables, sampling steps, visible FAQs, source links, related products, related guides, author/reviewer metadata, and conservative parameter language. Target 1,200-2,500 words according to intent.

- [ ] **Step 2: Draft ten Chinese articles independently**

Use the same fact briefs but natural Chinese procurement and operator terminology. Target 1,500-3,500 Chinese characters according to intent; do not translate sentence-by-sentence.

- [ ] **Step 3: Validate and review**

Run `npm run guides:validate && npm run guides:build`. Compare every numerical or compliance claim to its brief; remove or qualify unsupported claims and confirm every source supports its nearby statement.

- [ ] **Step 4: Commit**

```bash
git add content/guides content/guides/topics.json
git commit -m "Add first P0 guide editorial batch"
```

### Task 4: Write Editorial Batch 2 (Selected Topics 11-20)

**Files:**
- Create: paired `en.md` and `cn.md` files for selected topic positions 11-20.
- Modify: matching records in `content/guides/topics.json`.

**Interfaces:**
- Consumes: exact topic records and fact briefs for positions 11-20.
- Produces: 20 localized Markdown files with `status: reviewed`.

- [ ] **Step 1: Draft ten English articles**

Write 1,200-2,500 word articles from the briefs with direct answers, decision factors, diagnosis tables, sampling steps, visible FAQs, source links, related products, related guides, and conservative parameter language.

- [ ] **Step 2: Draft ten Chinese articles independently**

Write 1,500-3,500 character Chinese articles from the same facts using natural procurement and operator terminology, without sentence-level translation.

- [ ] **Step 3: Validate and review**

Run `npm run guides:validate && npm run guides:build`. Trace every numerical, compliance, sustainability, and machine-compatibility statement to its brief and correct unsupported wording.

- [ ] **Step 4: Commit**

```bash
git add content/guides content/guides/topics.json
git commit -m "Add second P0 guide editorial batch"
```

### Task 5: Write Editorial Batch 3 (Selected Topics 21-30)

**Files:**
- Create: paired `en.md` and `cn.md` files for selected topic positions 21-30.
- Modify: matching records in `content/guides/topics.json`.

**Interfaces:**
- Consumes: exact topic records and fact briefs for positions 21-30.
- Produces: 20 localized Markdown files with `status: reviewed`.

- [ ] **Step 1: Draft ten English articles**

Write 1,200-2,500 word articles with answer-first copy, substrate/process boundaries, defect logic, test actions, visible FAQs, verified sources, and product/sample links.

- [ ] **Step 2: Draft ten Chinese articles independently**

Write 1,500-3,500 character Chinese versions from the fact briefs, preserving technical meaning while using Chinese buyer and machine-operator language.

- [ ] **Step 3: Validate and review**

Run `npm run guides:validate && npm run guides:build`; inspect all ten pairs for intent overlap with batches 1-2 and rewrite any page that competes with an existing main answer.

- [ ] **Step 4: Commit**

```bash
git add content/guides content/guides/topics.json
git commit -m "Add third P0 guide editorial batch"
```

### Task 6: Write Editorial Batch 4 (Selected Topics 31-40)

**Files:**
- Create: paired `en.md` and `cn.md` files for selected topic positions 31-40.
- Modify: matching records in `content/guides/topics.json`.

**Interfaces:**
- Consumes: exact topic records and fact briefs for positions 31-40.
- Produces: 20 localized Markdown files with `status: reviewed`.

- [ ] **Step 1: Draft ten English articles**

Write complete 1,200-2,500 word pages with direct answers, tables, test procedures, sources, internal links, product mapping, and sample-request actions.

- [ ] **Step 2: Draft ten Chinese articles independently**

Write complete 1,500-3,500 character pages from the shared facts and use qualified parameter language throughout.

- [ ] **Step 3: Validate and review**

Run `npm run guides:validate && npm run guides:build`; verify the source context, product scope, visible FAQ parity, and related-link targets for all 20 files.

- [ ] **Step 4: Commit**

```bash
git add content/guides content/guides/topics.json
git commit -m "Add fourth P0 guide editorial batch"
```

### Task 7: Write Editorial Batch 5 (Selected Topics 41-50)

**Files:**
- Create: paired `en.md` and `cn.md` files for selected topic positions 41-50.
- Modify: matching records in `content/guides/topics.json`.

**Interfaces:**
- Consumes: exact topic records and fact briefs for positions 41-50.
- Produces: 20 localized Markdown files with `status: reviewed`.

- [ ] **Step 1: Draft ten English articles**

Write complete 1,200-2,500 word pages and ensure each one has a unique buyer decision, not only a different keyword phrase.

- [ ] **Step 2: Draft ten Chinese articles independently**

Write complete 1,500-3,500 character pages with natural Chinese terminology and the same evidence boundaries.

- [ ] **Step 3: Validate and review**

Run `npm run guides:validate && npm run guides:build`; perform the same claim/source/product review and a cross-batch intent comparison against all previous 40 topics.

- [ ] **Step 4: Commit**

```bash
git add content/guides content/guides/topics.json
git commit -m "Add fifth P0 guide editorial batch"
```

### Task 8: Cross-Batch Duplication and Publication Audit

**Files:**
- Create: `scripts/audit-first-guide-batch.mjs`
- Create: `reports/guides/first-batch-review.json`
- Modify: 100 Markdown files only where audit findings require correction.

**Interfaces:**
- Produces per-page checks for length, bilingual pairing, duplicate intent, body similarity, source count, external link count, internal link count, forbidden terms, sampling disclaimer, visible FAQ/schema parity, and related product/guide presence.

- [ ] **Step 1: Implement audit output**

The script exits 1 when any reviewed/published page fails a blocking rule. Similarity warnings require human resolution and cannot be automatically ignored without adding a written `difference` explanation to the report.

- [ ] **Step 2: Run the full audit**

```bash
node scripts/audit-first-guide-batch.mjs
npm run guides:check
```

Expected: 100 localized pages checked, zero blocking failures.

- [ ] **Step 3: Review random and risk-based samples**

Read at least one pair from every cluster plus every page containing a numeric parameter, compliance statement, sustainability claim, or specific machine compatibility claim.

- [ ] **Step 4: Commit corrections and report**

```bash
git add scripts/audit-first-guide-batch.mjs reports/guides/first-batch-review.json content/guides
git commit -m "Audit first bilingual guide publishing batch"
```

### Task 9: Publish, Prerender, and Verify 100 Pages

**Files:**
- Modify: selected entries in `content/guides/topics.json`
- Modify: frontmatter status in 100 Markdown files
- Modify: `data/generatedGuides.ts`
- Modify: `public/sitemap.xml`

**Interfaces:**
- Produces exactly 50 English and 50 Chinese published guide records and URLs.

- [ ] **Step 1: Change reviewed pairs to published**

Set `date_published` and `date_modified` to the actual release date in both languages. Do not publish only one language of a pair.

- [ ] **Step 2: Generate manifest and sitemap**

```bash
npm run guides:check
npm run generate-sitemap
```

Expected: generated manifest contains 100 new localized records; sitemap contains 100 new URLs with symmetric hreflang and no draft/reviewed topics.

- [ ] **Step 3: Build and inspect static output**

```bash
npm run build
```

Inspect at least ten generated `dist/{lang}/guides/{slug}/index.html` files. Each must contain H1, direct answer, body sections, FAQ, sources, canonical, hreflang, Article, FAQPage, and BreadcrumbList.

- [ ] **Step 4: Browser verification**

Run a local server and verify desktop/mobile catalog navigation, long tables, source links, related links, and quote CTA for both languages. Confirm no customer-visible internal strategy terms.

- [ ] **Step 5: Commit publication artifacts**

```bash
git add content/guides content/guides/topics.json data/generatedGuides.ts public/sitemap.xml
git commit -m "Publish first 50 bilingual hot stamping guides"
```

- [ ] **Step 6: Submit changed URLs after deployment**

After the production deployment returns HTTP 200 for sampled pages, run `npm run indexnow`. Record submitted URL count and monitor Google Search Console, Bing Webmaster Tools, and `utm_source=chatgpt.com` referrals. Do not submit before deployment.
