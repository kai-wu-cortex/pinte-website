import test from 'node:test';
import assert from 'node:assert/strict';
import taxonomy from '../content/guides/taxonomy.json' with { type: 'json' };
import {
  generateCandidates,
  normalizeIntentKey,
  selectInventory,
  summarizeInventory,
} from './lib/guide-topics.mjs';

test('selects exactly 10000 unique draft topics', () => {
  const inventory = selectInventory(generateCandidates(taxonomy), 10000);
  assert.equal(inventory.length, 10000);
  assert.equal(new Set(inventory.map((item) => item.topic_id)).size, 10000);
  assert.equal(new Set(inventory.map((item) => item.intent_key)).size, 10000);
  assert.ok(inventory.every((item) => item.status === 'draft'));
});

test('covers all twelve clusters without internal strategy words', () => {
  const inventory = selectInventory(generateCandidates(taxonomy), 10000);
  assert.equal(new Set(inventory.map((item) => item.cluster)).size, 12);
  assert.ok(inventory.every((item) => !/\b(?:SEO|GEO|ChatGPT|Perplexity|AI search)\b/i.test(`${item.title.en} ${item.title.cn}`)));
});

test('summary reports no duplicate slug or intent key', () => {
  const summary = summarizeInventory(selectInventory(generateCandidates(taxonomy), 10000));
  assert.equal(summary.duplicateSlugs, 0);
  assert.equal(summary.duplicateIntentKeys, 0);
});

test('normalizes intent at the search-question level', () => {
  assert.equal(
    normalizeIntentKey({
      intent: 'troubleshooting',
      processId: 'hot-stamping-flatbed',
      substrateId: 'paper-coated',
      surfaceTreatmentId: 'printed-uv-ink',
      defectId: 'poor-adhesion-peeling',
      regionId: 'global',
    }),
    normalizeIntentKey({
      intent: 'troubleshooting',
      processId: 'hot-stamping-flatbed',
      substrateId: 'paper-coated',
      surfaceTreatmentId: 'printed-uv-ink',
      defectId: 'poor-adhesion-peeling',
      artworkTypeId: 'fine-lines-small-type',
      procurementConcernId: 'representative-sampling',
      regionId: 'global',
    }),
  );
});
