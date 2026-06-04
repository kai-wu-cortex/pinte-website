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
