# Platform Remediation B Report

## Scope

- `pages/GuideRoute.tsx`
- `pages/LongFormGuide.tsx`

## Remediation

- Redirected `/vi/guides/<generated-slug>/` to the matching English generated guide with React Router `Navigate` and `replace`; legacy Vietnamese guide behavior remains unchanged when no English generated record exists.
- Made generated runtime guide identity consistently trailing-slash based for the canonical URL, `Article.mainEntityOfPage`, breadcrumb paths and schema URLs, guide links, related guide links, product links, and the quote CTA.
- Added customer-facing `Related products` and `Related guides` navigation before the CTA. Product names are localized from the existing catalog; related guide titles resolve against published generated records first and legacy guides second. Invalid related references are omitted rather than creating broken internal links.
- Preserved the existing reference layout while filtering source hrefs to `http:` and `https:` URLs; external references retain `target="_blank"` and `rel="noopener noreferrer"`.

## Verification

- `npx tsc --noEmit --pretty false` was run with Node 24.13.1. It reports six pre-existing errors in `components/HotStampingSimulator/*`, `contexts/LanguageContext.tsx`, and `pages/PinteFoils.tsx`; neither owned guide page appears in the diagnostics.
- A focused TypeScript compiler check reported `0` diagnostics for `pages/GuideRoute.tsx` and `pages/LongFormGuide.tsx`.
- Focused source assertions passed for the Vietnamese redirect, canonical/meta/schema identity, trailing-slash catalog and quote links, semantic related-product and related-guide navigation, and source URL filtering.
- Browser checks against `http://127.0.0.1:4173` confirmed:
  - `/en/guides/hot-stamping-foil-label-sampling/` renders related sections, canonical/article identity `https://www.pintecl.com/en/guides/hot-stamping-foil-label-sampling/`, and trailing-slash product, guide, and quote links.
  - `/cn/guides/hot-stamping-foil-label-sampling/` renders localized related headings and commands with matching trailing-slash links.
  - `/vi/guides/hot-stamping-foil-label-sampling/` replaces the URL with `/en/guides/hot-stamping-foil-label-sampling/` and does not render the legacy not-found page.
- Browser console output contained only the existing Tailwind CDN development warning.
- `npm run build` completed successfully in 3m 1s and generated both localized runtime guide routes. During unrelated blog prerendering, the existing writer logged a recoverable `ENOENT` for `/dist/en/blog/33bf8285a7fd8143a05fe8eab81da8c1/index.html`; the process continued and exited `0`.
- `git diff --check` passed before the report was added.

## Source URL Follow-Up

- Replaced the runtime reference filter in `pages/LongFormGuide.tsx` with the same invariant used by `scripts/lib/guide-content.mjs`: a source URL must be a parseable absolute `https:` URL with a hostname and no username or password.
- The runtime filter now rejects `http:`, credentialed URLs, relative URLs, `javascript:`, `data:`, malformed HTTPS values, and non-URL text before rendering a reference link.
- Focused source assertion passed all eight cases: one valid HTTPS URL plus the seven rejected forms above.
- Browser check at `http://127.0.0.1:4173/en/guides/hot-stamping-foil-label-sampling/` rendered two reference links; both had `https:` protocol, non-empty hostnames, and empty username/password fields. No browser console errors were recorded.
