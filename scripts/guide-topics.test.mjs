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
      testId: 'tape-adhesion-job-specific',
      equipmentId: 'manual-platen-press',
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
      testId: 'cross-cut-adhesion-agreed',
      equipmentId: 'automatic-flatbed-press',
      regionId: 'global',
    }),
  );
});

test('keeps troubleshooting evidence tests defect-applicable', () => {
  const inventory = selectInventory(generateCandidates(taxonomy), 10000);
  const testByLabel = new Map(taxonomy.tests.map((item) => [item.label, item]));
  const troubleshooting = inventory.filter((item) => item.intent === 'troubleshooting');
  assert.ok(troubleshooting.length >= 25);

  const seenProblemKeys = new Set();
  for (const item of troubleshooting) {
    const problemKey = item.intent_key;
    assert.ok(!seenProblemKeys.has(problemKey), `duplicate troubleshooting problem: ${problemKey}`);
    seenProblemKeys.add(problemKey);
    const defectId = item.tags.find((tag) => taxonomy.defects.some((defect) => defect.id === tag));
    for (const evidence of item.evidence_needed) {
      const testMethod = testByLabel.get(evidence);
      if (!testMethod) continue;
      assert.ok(
        (testMethod.applicableDefectIds ?? []).includes(defectId),
        `${testMethod.id} should apply to ${defectId}`,
      );
    }
  }
});
