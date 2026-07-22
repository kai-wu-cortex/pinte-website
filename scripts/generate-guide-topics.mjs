import fs from 'node:fs';
import path from 'node:path';
import taxonomy from '../content/guides/taxonomy.json' with { type: 'json' };
import {
  generateCandidates,
  selectInventory,
  summarizeInventory,
} from './lib/guide-topics.mjs';

const TARGET_COUNT = 10000;
const TOPICS_PATH = path.resolve('content/guides/topics.json');
const SUMMARY_PATH = path.resolve('reports/guides/topic-inventory-summary.json');
const FORBIDDEN_PUBLIC_TERMS = /(?:\b(?:SEO|GEO|ChatGPT|Perplexity|Google[\s\p{Pd}_/]+AI|AI[\s\p{Pd}_/]+search(?:[\s\p{Pd}_/]+optimization)?)\b|采购搜索工具|采购内容可见度|AI\s*搜索|AI\s*引用|AI\s*检索|生成式\s*AI|生成式搜索)/iu;

function countBy(values) {
  const counts = new Map();
  for (const value of values) {
    const key = value || 'unspecified';
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Object.fromEntries([...counts.entries()].sort(([left], [right]) => left.localeCompare(right)));
}

function classifyPriority(record) {
  if (record.score >= 600) return 'P0';
  if (record.score >= 540) return 'P1';
  return 'P2';
}

function publicText(record) {
  return [
    record.slug,
    record.title?.en,
    record.title?.cn,
    record.topic_question?.en,
    record.topic_question?.cn,
    record.difference,
    record.evidence_needed,
    record.tags,
  ].flat(Number.POSITIVE_INFINITY).filter(Boolean).join('\n');
}

function duplicateCount(values) {
  const seen = new Set();
  let duplicates = 0;
  for (const value of values) {
    if (seen.has(value)) duplicates += 1;
    seen.add(value);
  }
  return duplicates;
}

function addInventoryPriority(records) {
  return records.map((record) => ({
    ...record,
    related_guides: record.related_guides ?? [],
    priority: classifyPriority(record),
  }));
}

function buildSummary(records, candidateByIntentKey) {
  const base = summarizeInventory(records);
  const candidates = records.map((record) => candidateByIntentKey.get(record.intent_key));
  const productValues = records.flatMap((record) => (
    record.related_products.length ? record.related_products : ['informational-only']
  ));

  return {
    targetCount: TARGET_COUNT,
    total: records.length,
    counts: {
      cluster: base.clusters,
      intent: base.intents,
      substrate: countBy(candidates.map((candidate) => candidate?.substrateId)),
      industry: countBy(candidates.map((candidate) => candidate?.industryId)),
      priority: countBy(records.map((record) => record.priority)),
      relatedProduct: countBy(productValues),
    },
    duplicates: {
      slugs: base.duplicateSlugs,
      intentKeys: base.duplicateIntentKeys,
      topicIds: duplicateCount(records.map((record) => record.topic_id)),
    },
    forbiddenTerms: {
      publicRecords: records.filter((record) => FORBIDDEN_PUBLIC_TERMS.test(publicText(record))).length,
    },
  };
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

const candidates = generateCandidates(taxonomy);
const candidateByIntentKey = new Map(candidates.map((candidate) => [candidate.intent_key, candidate]));
const inventory = addInventoryPriority(selectInventory(candidates, TARGET_COUNT));
const summary = buildSummary(inventory, candidateByIntentKey);

if (inventory.length !== TARGET_COUNT) {
  throw new Error(`expected ${TARGET_COUNT} records, generated ${inventory.length}`);
}
if (summary.duplicates.slugs !== 0) {
  throw new Error(`expected zero duplicate slugs, found ${summary.duplicates.slugs}`);
}
if (summary.duplicates.intentKeys !== 0) {
  throw new Error(`expected zero duplicate intent keys, found ${summary.duplicates.intentKeys}`);
}
if (summary.forbiddenTerms.publicRecords !== 0) {
  throw new Error(`expected zero public forbidden-term records, found ${summary.forbiddenTerms.publicRecords}`);
}

writeJson(TOPICS_PATH, inventory);
writeJson(SUMMARY_PATH, summary);

console.log(`Generated ${inventory.length} draft guide topics at ${TOPICS_PATH}`);
console.log(`Wrote inventory summary at ${SUMMARY_PATH}`);
