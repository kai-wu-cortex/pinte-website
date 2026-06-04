import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildSopArtifacts, loadSitemapUrls } from './seo-geo-sop.mjs';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pinte-seo-sop-'));
const sitemapPath = path.join(tmpDir, 'sitemap.xml');

fs.writeFileSync(
  sitemapPath,
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://www.pintecl.com/en/products/category/PC/</loc></url>
  <url><loc>https://www.pintecl.com/en/solutions/pkg_bags/</loc></url>
  <url><loc>https://www.pintecl.com/en/blog/hot-stamping-foil-guide/</loc></url>
</urlset>`,
);

const urls = loadSitemapUrls(sitemapPath);
assert.deepEqual(urls, [
  'https://www.pintecl.com/en/products/category/PC/',
  'https://www.pintecl.com/en/solutions/pkg_bags/',
  'https://www.pintecl.com/en/blog/hot-stamping-foil-guide/',
]);

const artifacts = buildSopArtifacts({
  runDate: '2026-06-03',
  sitemapUrls: urls,
  config: {
    brand: 'PINTE',
    defaultLocale: 'en',
    markets: ['Vietnam', 'Thailand'],
    productKeywords: ['hot stamping foil', 'cold foil'],
    geoKeywords: ['Vietnam hot stamping foil supplier'],
    pages: [
      {
        url: 'https://www.pintecl.com/en/products/category/PC/',
        owner: 'Product',
        primaryKeyword: 'plastic hot stamping foil',
        secondaryKeywords: ['cosmetic packaging foil'],
        geoTargets: ['Vietnam'],
      },
    ],
  },
});

assert.equal(artifacts.length, 6);
assert.ok(artifacts.some((artifact) => artifact.filename === '00-sop-checklist.md'));
assert.ok(artifacts.some((artifact) => artifact.filename === '01-keyword-map.csv'));
assert.ok(artifacts.some((artifact) => artifact.filename === '02-page-briefs.md'));
assert.ok(artifacts.some((artifact) => artifact.filename === '03-gsc-bing-log.csv'));
assert.ok(artifacts.some((artifact) => artifact.filename === '04-submit-and-verify.md'));
assert.ok(artifacts.some((artifact) => artifact.filename === '05-sitemap-coverage.csv'));

const checklist = artifacts.find((artifact) => artifact.filename === '00-sop-checklist.md')?.content || '';
assert.match(checklist, /Monthly SEO\/GEO SOP/);
assert.match(checklist, /Google Search Console/);
assert.match(checklist, /Bing Webmaster Tools/);

const keywordMap = artifacts.find((artifact) => artifact.filename === '01-keyword-map.csv')?.content || '';
assert.match(keywordMap, /plastic hot stamping foil/);
assert.match(keywordMap, /Vietnam/);
assert.match(keywordMap, /hot-stamping-foil-guide/);
assert.match(keywordMap, /needs_keyword_mapping/);

const briefs = artifacts.find((artifact) => artifact.filename === '02-page-briefs.md')?.content || '';
assert.match(briefs, /Where to place keywords/);
assert.match(briefs, /Product schema/);

const coverage = artifacts.find((artifact) => artifact.filename === '05-sitemap-coverage.csv')?.content || '';
assert.match(coverage, /https:\/\/www\.pintecl\.com\/en\/products\/category\/PC\//);
assert.match(coverage, /https:\/\/www\.pintecl\.com\/en\/solutions\/pkg_bags\//);
assert.match(coverage, /https:\/\/www\.pintecl\.com\/en\/blog\/hot-stamping-foil-guide\//);
assert.match(coverage, /configured/);
assert.match(coverage, /needs_keyword_mapping/);
