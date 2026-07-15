import path from 'node:path';
import { loadGuidePairs, validateGuideRecords } from './lib/guide-content.mjs';

const root = path.resolve('content/guides');
const records = await loadGuidePairs(root);
const result = validateGuideRecords(records);

console.log(`Validated ${records.length} localized guide records: ${result.errors.length} errors, ${result.warnings.length} warnings.`);

if (result.errors.length) {
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
