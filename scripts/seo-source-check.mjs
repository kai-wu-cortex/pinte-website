import fs from 'fs';
import path from 'path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

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
      return locs.includes('https://www.pintecl.com/en/products/item/cold-foil-uv/')
        && !locs.includes('https://www.pintecl.com/en/products/item/cold-foil-uv');
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
    pass: () => /buildSeoSnapshotHtml/.test(read('prerender.ts')) && /<main class="seo-snapshot"/.test(read('prerender.ts')),
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

if (failures > 0) {
  process.exit(1);
}
