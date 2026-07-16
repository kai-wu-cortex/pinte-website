import path from 'node:path';
import { loadGuidePairs, loadGuideTopicRegistry, validateGuideRecords } from './lib/guide-content.mjs';
import { loadLegacyGuideSlugs } from './lib/guide-slugs.mjs';

const root = path.resolve('content/guides');
const registry = loadGuideTopicRegistry(path.join(root, 'topics.json'));
const legacySlugs = loadLegacyGuideSlugs(path.resolve('data/geoGuides.ts'));
const records = await loadGuidePairs(root);
const result = validateGuideRecords(records, { registry, legacySlugs });

console.log(`Validated ${records.length} localized guide records: ${result.errors.length} errors, ${result.warnings.length} warnings.`);

if (result.errors.length) {
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
