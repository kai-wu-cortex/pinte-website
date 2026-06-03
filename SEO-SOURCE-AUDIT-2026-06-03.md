# PINTE Website SEO/GEO Source Audit - 2026-06-03

## Semrush status

Semrush MCP access is not available under the current Semrush plan, so domain authority, organic keywords, paid search, competitor, traffic, geo distribution, and backlink metrics could not be retrieved from Semrush.

Required Semrush plan pages:
- SEO / SEM / backlink data: https://www.semrush.com/mcp-access
- Traffic / geo analytics data: https://www.semrush.com/analytics/traffic/trends-api

## Current strengths

- The site has language-prefixed routes for Chinese and English: `/cn/...` and `/en/...`.
- `public/robots.txt` allows Googlebot, Bingbot, GPTBot, ClaudeBot, PerplexityBot, Bytespider, CCBot, and other crawlers.
- `public/llms.txt` exists and describes the business, target markets, product categories, facts, and contact details.
- `components/SEOMeta.tsx` provides page title, description, canonical, hreflang, Open Graph, Twitter, geo tags, and Manufacturer JSON-LD.
- Product category pages contain strong B2B technical content and market keywords.
- About, privacy, and terms pages exist.

## Optimization status after source updates

### 1. Static prerendering now outputs a crawlable SEO snapshot

`prerender.ts` now injects a static SEO snapshot into `#root` for generated static routes. The snapshot includes an H1, route description, core product links, solution links, and target market text, so crawlers that do not fully execute JavaScript still receive useful page content.

Remaining recommendation:
- For the strongest SEO/GEO result, eventually replace the snapshot approach with true full-route static rendering.

### 2. Product detail pages now include page-specific SEO metadata

`pages/ProductItem.tsx` now renders `SEOMeta` and Product JSON-LD for individual product pages.

Impact:
- High-intent product pages such as `/en/products/item/premium-gold-foil` now emit product-specific title, description, canonical, hreflang, Open Graph, image, and Product schema from the source component.

### 3. Solution detail pages now include page-specific SEO metadata

`pages/SolutionDetail.tsx` now renders `SEOMeta` and Service JSON-LD.

Impact:
- Important application pages such as cosmetics, wine, pharmaceutical, tobacco, and gift-card packaging now have stronger B2B search and AI extraction signals.

### 4. Sitemap now includes hreflang annotations and broader route coverage

`public/sitemap.xml` has been regenerated from `scripts/generate-sitemap.js`. It now includes `xhtml:link` alternates for English, Chinese, and `x-default`, and expanded coverage for about, privacy, terms, pintefoils, product series, product items, solutions, and blog routes.

Vietnamese note:
- `/vi/...` URLs are intentionally not added until real Vietnamese content exists. This avoids thin or duplicate language pages.

### 5. `llms.txt` now uses direct language canonical URLs

`public/llms.txt` now points to direct `/en/...` and `/cn/...` pages and includes a "Best Pages for AI Citation" section.

Impact:
- ChatGPT, Gemini, Doubao, Perplexity, and other AI retrieval systems get direct canonical pages instead of redirecting root paths.

## Remaining findings

### 1. `index.html` still contains development/CDN artifacts

The HTML includes Tailwind CDN, esm.sh import maps, and two module scripts for `index.tsx`. This is not ideal for production SEO performance.

Recommendation:
- Remove the import map and source TSX script tags from production template.
- Build Tailwind locally.
- Let Vite output the production bundle only.

### 2. Social `sameAs` links appear generic

`sameAs` contains likely placeholder social URLs such as `facebook.com/pinte` and `linkedin.com/company/pinte`.

Recommendation:
- Replace with verified official profiles only.
- If official profiles do not exist, remove `sameAs` until they are created.

### 3. Full static rendering would still be better than SEO snapshots

The new static snapshot is a practical improvement, but the site is still fundamentally a React SPA. Full static rendering would let every page ship exact body content, route-specific schema, images, and internal links before hydration.

Impact:
- Google can execute JavaScript, but indexing is slower and less reliable.
- AI crawlers and generative search systems may extract only partial information.
- GEO visibility for ChatGPT, Gemini, Doubao, Perplexity, and AI search is weaker than it should be.

Recommendation:
- Replace the current template-copy prerender with real route rendering, or migrate brochure/SEO pages to Next.js/Astro/SvelteKit static generation.
- Each generated `/cn/.../index.html` and `/en/.../index.html` should include the final H1, body copy, internal links, canonical, hreflang, schema, and images.

## Priority execution plan

1. Fix the build template: remove CDN/import-map/dev TSX artifacts from production HTML.
2. Replace SEO snapshots with full static rendering when ready.
3. Replace placeholder `sameAs` links with verified official profiles.
4. Decide whether Vietnamese is a real content target. If yes, create real Vietnamese pages; if no, remove exposed `vi` locale.
5. Create country/market pages for Vietnam, Thailand, Malaysia, Indonesia, and Southeast Asia.
6. Submit updated sitemap to Google Search Console, Bing Webmaster Tools, and IndexNow after deployment.
