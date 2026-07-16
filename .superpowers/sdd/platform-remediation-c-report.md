# Platform Remediation C

## Scope

- Updated `prerender/snapshot-builder.ts` only for runtime behavior.
- Left concurrent changes in `pages/GuideRoute.tsx`, `pages/LongFormGuide.tsx`, and `scripts/guide-content.test.mjs` untouched.

## Remediation

- Generated guide Article and BreadcrumbList identifiers now use the same trailing-slash canonical URLs as the prerender head and sitemap.
- Generated guide lookup uses a prebuilt `lang:slug` index. Per-language generated summaries and a merged legacy/generated catalog support detail lookup, breadcrumbs, and the guide index without per-route scans.
- Generated snapshots now render customer-facing related product and guide sections. They use valid localized catalog entries, retain legacy-guide fallback, and escape labels and href values through the existing HTML link helper.
- Existing body sanitization, FAQ JSON-LD, and legacy guide rendering remain in place.

## Verification

```sh
/Users/kyle/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node \
  ./node_modules/typescript/bin/tsc --skipLibCheck -p tsconfig.prerender.json
```

Passed focused compiled-snapshot assertions for English and Chinese generated guides:

- Article and BreadcrumbList identifiers equal the trailing-slash canonical URL.
- Related product and legacy related-guide links render with language-prefixed trailing-slash paths.
- The guide catalog includes both generated and legacy guides.
