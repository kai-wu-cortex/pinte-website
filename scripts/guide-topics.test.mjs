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
  const inventory = selectInventory(generateCandidates(taxonomy), 10000);
  const summary = summarizeInventory(inventory);
  assert.equal(summary.duplicateSlugs, 0);
  assert.equal(summary.duplicateIntentKeys, 0);
  assert.equal(new Set(inventory.map((item) => item.title.en)).size, 10000);
  assert.equal(new Set(inventory.map((item) => item.title.cn)).size, 10000);
  assert.equal(new Set(inventory.map((item) => item.topic_question.en)).size, 10000);
  assert.equal(new Set(inventory.map((item) => item.topic_question.cn)).size, 10000);
});

test('keeps inventory balanced across buyer intents', () => {
  const summary = summarizeInventory(selectInventory(generateCandidates(taxonomy), 10000));
  for (const intent of [
    'application',
    'comparison',
    'compliance',
    'definition',
    'design-prepress',
    'equipment',
    'parameter',
    'procurement',
    'substrate-selection',
    'sustainability',
    'testing',
    'troubleshooting',
  ]) {
    assert.ok(summary.intents[intent] >= 25, `${intent} should have meaningful coverage`);
  }
});

test('uses Chinese-facing labels for Chinese topic titles and questions', () => {
  const inventory = selectInventory(generateCandidates(taxonomy), 10000);
  assert.ok(inventory.every((item) => /\p{Script=Han}/u.test(item.title.cn)));
  assert.ok(inventory.every((item) => /\p{Script=Han}/u.test(item.topic_question.cn)));
  assert.ok(inventory.every((item) => !/(?:Coated glass|Fine lines|Wine, spirits|Commercial print|Checklist|Foil Stamping)/i.test(`${item.title.cn} ${item.topic_question.cn}`)));
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
