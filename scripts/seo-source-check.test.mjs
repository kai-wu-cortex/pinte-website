import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  buildPublishedManifest,
  parseGuideFile,
} from './lib/guide-content.mjs';
import {
  getLegacyGuideSlugs,
  loadGuideSourceRecords,
  validateGuidePublicationState,
  validateGuideSitemap,
  validateManifestMatchesSource,
} from './seo-source-check.mjs';

const root = process.cwd();
const sourceDirectory = path.join(root, 'content/guides/HF-000001');
const siteUrl = 'https://www.pintecl.com';

function publishedRecords() {
  return ['en', 'cn'].map((lang) => parseGuideFile(path.join(sourceDirectory, `${lang}.md`)));
}

function serializedManifest(records) {
  return JSON.parse(JSON.stringify(buildPublishedManifest(records)));
}

function guideUrl(lang, slug) {
  return `${siteUrl}/${lang}/guides/${slug}/`;
}

function sitemapBlock(lang, slug, omittedAlternates = []) {
  const alternate = (hreflang, href) => (
    omittedAlternates.includes(hreflang)
      ? ''
      : `<xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}" />`
  );
  return `<url>
    <loc>${guideUrl(lang, slug)}</loc>
    ${alternate('en', guideUrl('en', slug))}
    ${alternate('zh-CN', guideUrl('cn', slug))}
    ${alternate('x-default', guideUrl('en', slug))}
  </url>`;
}

function sitemapFor(manifest = [], { omitLocalized = [], omitAlternates = {} } = {}) {
  const legacyBlocks = getLegacyGuideSlugs().flatMap((slug) => [
    sitemapBlock('en', slug),
    sitemapBlock('cn', slug),
  ]);
  const generatedSlugs = [...new Set(manifest.map((record) => record.slug))];
  const generatedBlocks = generatedSlugs.flatMap((slug) => ['en', 'cn']
    .filter((lang) => !omitLocalized.includes(`${lang}:${slug}`))
    .map((lang) => sitemapBlock(lang, slug, omitAlternates[`${lang}:${slug}`] || [])));
  return `<urlset>${[...legacyBlocks, ...generatedBlocks].join('\n')}</urlset>`;
}

function assertError(errors, fragment) {
  assert.ok(errors.some((error) => error.includes(fragment)), `expected ${fragment}\n${errors.join('\n')}`);
}

test('allows legacy guide URLs but rejects an unknown sitemap guide URL', () => {
  const errors = [];
  const sitemap = `${sitemapFor()}<url><loc>${guideUrl('en', 'stale-unknown-guide')}</loc></url>`;

  validateGuideSitemap([], errors, sitemap);

  assertError(errors, 'lang=en field=sitemap.loc: unexpected guide URL for slug=stale-unknown-guide');
  assert.equal(errors.filter((error) => error.includes('hot-stamping-foil-buying-guide')).length, 0);
});

test('requires generated localized guide URLs and all localized alternates', () => {
  const manifest = serializedManifest(publishedRecords());
  const slug = manifest[0].slug;
  const missingLocalized = validateGuidePublicationState({
    sourceRecords: publishedRecords(),
    manifest,
    sitemap: sitemapFor(manifest, { omitLocalized: [`cn:${slug}`] }),
  });
  assertError(missingLocalized, 'topic=HF-000001 lang=cn field=sitemap.loc');

  for (const hreflang of ['en', 'zh-CN', 'x-default']) {
    const errors = [];
    validateGuideSitemap(
      manifest,
      errors,
      sitemapFor(manifest, { omitAlternates: { [`en:${slug}`]: [hreflang] } }),
    );
    assertError(errors, `topic=HF-000001 lang=en field=sitemap.hreflang[${hreflang}]`);
  }
});

test('accepts a legacy-only sitemap when there are no generated guides', () => {
  const errors = validateGuidePublicationState({
    sourceRecords: [],
    manifest: [],
    sitemap: sitemapFor(),
  });

  assert.deepEqual(errors, []);
});

test('matches serialized source dates and rejects a stale manifest date', () => {
  const records = publishedRecords();
  const manifest = serializedManifest(records);
  const matchingErrors = [];

  validateManifestMatchesSource(manifest, records, matchingErrors);
  assert.deepEqual(matchingErrors, []);

  manifest[0].dateModified = '2026-07-17T00:00:00.000Z';
  const staleErrors = [];
  validateManifestMatchesSource(manifest, records, staleErrors);
  assertError(staleErrors, 'field=dateModified: generated manifest value is stale');
});

test('allows a reviewed one-sided source directory but rejects a published one', (t) => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'pinte-source-check-'));
  t.after(() => fs.rmSync(temporaryRoot, { recursive: true, force: true }));
  const topicId = 'HF-000101';
  const topicDirectory = path.join(temporaryRoot, topicId);
  const enSource = fs.readFileSync(path.join(sourceDirectory, 'en.md'), 'utf8')
    .replace('topic_id: HF-000001', `topic_id: ${topicId}`);
  fs.mkdirSync(topicDirectory, { recursive: true });
  fs.writeFileSync(path.join(topicDirectory, 'en.md'), enSource.replace('status: published', 'status: reviewed'));

  const reviewed = loadGuideSourceRecords(temporaryRoot);
  assert.deepEqual(reviewed.errors, []);
  assert.deepEqual(validateGuidePublicationState({
    sourceRecords: reviewed.sourceRecords,
    manifest: [],
    sitemap: sitemapFor(),
  }), []);

  fs.writeFileSync(path.join(topicDirectory, 'en.md'), enSource);
  const published = loadGuideSourceRecords(temporaryRoot);
  const publishedErrors = validateGuidePublicationState({
    sourceRecords: published.sourceRecords,
    manifest: [],
    sitemap: sitemapFor(),
  });
  assertError(publishedErrors, 'field=lang: authoring validator rejected record (missing-language-pair)');
});

test('preserves shared required-field and unsafe-source validation failures', () => {
  const records = publishedRecords();
  const missingTitleRecords = records.map((record, index) => (
    index === 0 ? { ...record, title: '' } : record
  ));
  const missingTitleErrors = validateGuidePublicationState({
    sourceRecords: missingTitleRecords,
    manifest: serializedManifest(missingTitleRecords),
    sitemap: sitemapFor(serializedManifest(missingTitleRecords)),
  });
  assertError(missingTitleErrors, 'field=title: authoring validator rejected record (missing-required-field)');

  const unsafeSourceRecords = records.map((record, index) => (
    index === 0
      ? { ...record, sources: [{ ...record.sources[0], url: 'javascript:alert(1)' }, record.sources[1]] }
      : record
  ));
  const unsafeSourceErrors = validateGuidePublicationState({
    sourceRecords: unsafeSourceRecords,
    manifest: serializedManifest(unsafeSourceRecords),
    sitemap: sitemapFor(serializedManifest(unsafeSourceRecords)),
  });
  assertError(unsafeSourceErrors, 'field=sources[0].url: authoring validator rejected record (invalid-source-url)');
});
