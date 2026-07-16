import fs from 'node:fs';
import path from 'node:path';
import {
  loadGuidePairs,
  loadGuideTopicRegistry,
  renderPublishedManifest,
  validateGuideRecords,
} from './lib/guide-content.mjs';
import { loadLegacyGuideSlugs } from './lib/guide-slugs.mjs';

function parseArguments(args) {
  let check = false;
  let output = 'data/generatedGuides.ts';
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--check') {
      check = true;
    } else if (argument === '--output') {
      output = args[index + 1];
      if (!output) throw new Error('--output requires a file path');
      index += 1;
    } else {
      throw new Error(`unknown argument: ${argument}`);
    }
  }
  return { check, output: path.resolve(output) };
}

const root = path.resolve('content/guides');
const registry = loadGuideTopicRegistry(path.join(root, 'topics.json'));
const legacySlugs = loadLegacyGuideSlugs(path.resolve('data/geoGuides.ts'));
const { check, output } = parseArguments(process.argv.slice(2));
const records = await loadGuidePairs(root);
const result = validateGuideRecords(records, { registry, legacySlugs });

if (result.errors.length) {
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}

const expected = renderPublishedManifest(records);
if (check) {
  const actual = fs.existsSync(output) ? fs.readFileSync(output, 'utf8') : null;
  if (actual !== expected) {
    console.error(`Guide manifest is out of date: ${output}`);
    process.exit(1);
  }
  console.log(`Verified ${records.length} localized guide source records against ${output}.`);
} else {
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, expected);
  console.log(`Generated ${records.length} localized guide source records at ${output}.`);
}
