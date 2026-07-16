import fs from 'node:fs';

export const GENERATED_GUIDE_LEGACY_SLUG_MIGRATIONS = Object.freeze([]);

export function extractLegacyGuideSlugs(source) {
  if (typeof source !== 'string') throw new TypeError('GEO_GUIDES source must be a string');
  const declaration = source.indexOf('export const GEO_GUIDES');
  if (declaration === -1) throw new Error('could not find GEO_GUIDES in data/geoGuides.ts');

  const slugs = [...source.slice(declaration).matchAll(/^\s{4}slug:\s*'([a-z0-9]+(?:-[a-z0-9]+)*)',\s*$/gm)]
    .map((match) => match[1]);
  if (slugs.length === 0) throw new Error('could not find GEO_GUIDES slugs in data/geoGuides.ts');
  return [...new Set(slugs)].sort();
}

export function loadLegacyGuideSlugs(filePath) {
  return extractLegacyGuideSlugs(fs.readFileSync(filePath, 'utf8'));
}

export function isLegacySlugMigrationAllowed(
  slug,
  allowlist = GENERATED_GUIDE_LEGACY_SLUG_MIGRATIONS,
) {
  return allowlist.includes(slug);
}
