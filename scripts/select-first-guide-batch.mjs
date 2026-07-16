import fs from 'node:fs';
import path from 'node:path';
import { loadLegacyGuideSlugs } from './lib/guide-slugs.mjs';

const BATCH_ID = '2026-07-p0-01';
const TARGET_COUNT = 50;
const TOPICS_PATH = path.resolve('content/guides/topics.json');
const SELECTION_PATH = path.resolve('reports/guides/first-batch-selection.json');
const LEGACY_GUIDES_PATH = path.resolve('data/geoGuides.ts');

// These quotas are deliberately exact: the batch needs broad commercial coverage
// without letting the large troubleshooting/procurement inventories dominate it.
const CLUSTER_QUOTAS = Object.freeze({
  'cosmetic-packaging': { min: 1, max: 1 },
  'holographic-security': { min: 1, max: 1 },
  'label-printing': { min: 4, max: 4 },
  leather: { min: 3, max: 3 },
  'paper-carton-packaging': { min: 4, max: 4 },
  'parameters-testing': { min: 12, max: 12 },
  plastics: { min: 1, max: 1 },
  'process-comparison': { min: 4, max: 4 },
  'procurement-specifications': { min: 6, max: 6 },
  troubleshooting: { min: 12, max: 12 },
  'wine-gift-packaging': { min: 2, max: 2 },
});

function hasAny(record, terms) {
  const rawHaystack = [
    record.cluster,
    record.intent,
    record.intent_key,
    record.title?.en,
    record.title?.cn,
    record.topic_question?.en,
    record.topic_question?.cn,
    record.difference,
    record.tags,
    record.evidence_needed,
    record.related_products,
  ].flat(Number.POSITIVE_INFINITY).filter(Boolean).join('\n');
  const haystack = rawHaystack.toLowerCase();
  return terms.every((term) => (
    term instanceof RegExp ? (term.test(rawHaystack) || term.test(haystack)) : haystack.includes(String(term).toLowerCase())
  ));
}

function isIntent(intent) {
  return (record) => record.intent === intent;
}

function isCluster(cluster) {
  return (record) => record.cluster === cluster;
}

function hasTag(...tags) {
  return (record) => tags.every((tag) => (record.tags ?? []).includes(tag));
}

function and(...predicates) {
  return (record) => predicates.every((predicate) => predicate(record));
}

function text(...terms) {
  return (record) => hasAny(record, terms);
}

function titleHas(...terms) {
  return (record) => {
    const value = [record.title?.en, record.title?.cn, record.topic_question?.en, record.topic_question?.cn]
      .filter(Boolean)
      .join('\n');
    const lower = value.toLowerCase();
    return terms.every((term) => (
      term instanceof RegExp ? (term.test(value) || term.test(lower)) : lower.includes(String(term).toLowerCase())
    ));
  };
}

function withEvidence(...items) {
  return [
    'Representative production substrate, machine, artwork, and speed sample',
    ...items,
    'Documented pass/fail criteria before publication',
  ];
}

const COVERAGE_RULES = [
  ['uv-label-adhesion', 'UV label adhesion diagnosis', and(hasTag('poor-adhesion-peeling'), text(/film label|paper label/, /uv|led|cold foil|primer|corona/)), 'Covers UV or treated label adhesion questions from converters.', withEvidence('Adhesion or surface-energy source', 'PINTE product-fit review')],
  ['uv-label-incomplete-transfer', 'UV label incomplete transfer', and(hasTag('incomplete-transfer'), text(/film label|paper label/, /uv|led|cold foil|primer|corona/)), 'Covers missing transfer on UV or digital label jobs.', withEvidence('Transfer-completeness check', 'Process-window sample')],
  ['pp-scratch', 'PP foil scratch or scuff failure', and(hasTag('scratch-scuff-failure'), text(/polypropylene|\\bpp\\b/)), 'Covers low-surface-energy PP durability concerns.', withEvidence('Surface treatment record', 'Rub or scratch acceptance method')],
  ['pe-scratch', 'PE foil scratch or scuff failure', and(hasTag('scratch-scuff-failure'), text(/polyethylene|\\bpe\\b/)), 'Covers low-surface-energy PE durability concerns.', withEvidence('Surface treatment record', 'Rub or scratch acceptance method')],
  ['pp-surface-energy', 'PP surface-energy qualification', and(isIntent('substrate-selection'), titleHas(/polypropylene|\\bpp\\b/, /corona|plasma/)), 'Covers PP wetting and treatment checks before grade choice.', withEvidence('Surface-energy check', 'Treatment age record')],
  ['pe-surface-energy', 'PE surface-energy qualification', and(isIntent('substrate-selection'), titleHas(/polyethylene|\\bpe\\b/, /corona|plasma/)), 'Covers PE treatment checks before sampling.', withEvidence('Surface-energy check', 'Treatment age record')],
  ['natural-leather-logo', 'Natural leather logo hot stamping', and(isCluster('leather'), hasTag('fine-lines-small-type'), titleHas(/natural leather/)), 'Covers leather logo projects and texture-sensitive approval.', withEvidence('Leather lot sample', 'Heat response and adhesion check')],
  ['pu-leather-logo', 'PU synthetic leather logo hot stamping', and(isCluster('leather'), hasTag('fine-lines-small-type'), titleHas(/pu synthetic leather/)), 'Covers PU leather logo projects.', withEvidence('PU topcoat identification', 'Representative logo artwork sample')],
  ['pvc-leather-book-cover', 'PVC synthetic leather or book cover', and(isCluster('leather'), hasTag('fine-lines-small-type'), titleHas(/pvc synthetic leather|book cover/)), 'Covers PVC leather/book-cover selection.', withEvidence('Plasticizer/topcoat note', 'Heat and adhesion sample')],
  ['coated-paper-carton', 'Coated paper carton foil selection', and(isCluster('paper-carton-packaging'), isIntent('substrate-selection'), titleHas(/coated paper|folding carton/)), 'Covers coated paper and carton selection.', withEvidence('Coating and print stack record', 'Transfer completeness check')],
  ['uv-varnished-paper', 'UV varnished paper foil selection', and(isIntent('substrate-selection'), titleHas(/paper|carton|board/), titleHas(/uv varnish|uv coating|uv-led/)), 'Covers UV varnish and coating risk on paper packaging.', withEvidence('Varnish cure state', 'Adhesion and edge inspection')],
  ['laminated-paperboard', 'Laminated paperboard foil selection', and(isIntent('substrate-selection'), titleHas(/laminated paper|paperboard|folding carton|board/, /opp|pet lamination|laminated/)), 'Covers film-laminated paperboard selection.', withEvidence('Film chemistry confirmation', 'Transfer and adhesion sample')],
  ['textured-kraft-paper', 'Textured and kraft paper hot stamping', and(isIntent('substrate-selection'), titleHas(/textured|kraft|rough/, /paper|board/)), 'Covers rough and absorbent paper risks.', withEvidence('Surface roughness comparison', 'Solid-area sample')],
  ['hot-vs-cold-paper', 'Hot foil versus cold foil for paper packaging', and(isIntent('comparison'), text(/hot stamping|hot-foil|hot/, /cold foil|cold-transfer|cold/, /paper|carton|board/)), 'Covers process comparison for cartons.', withEvidence('Process route comparison', 'Artwork and run-length assumptions')],
  ['hot-vs-digital', 'Hot foil versus digital foil', and(isIntent('comparison'), titleHas(/digital|toner|uv varnish/)), 'Covers the available digital embellishment comparison baseline; no exact hot-versus-digital generated topic exists in the current inventory.', withEvidence('Machine availability', 'Order size and artwork detail')],
  ['cold-vs-digital', 'Cold foil versus digital foil', and(isIntent('comparison'), titleHas(/screen-printed|cold|adhesive/, /digital|toner|uv varnish/)), 'Covers cold/digital embellishment comparison.', withEvidence('Adhesive or varnish system note', 'Run-length assumptions')],
  ['foil-emboss-vs-flat', 'Foil embossing versus flat hot stamping', and(isIntent('comparison'), text(/emboss/, /flatbed|platen|hot stamping/)), 'Covers foil+emboss process choice.', withEvidence('Emboss depth and register check', 'Die condition review')],
  ['large-solid-carton', 'Large solid area on cartons', and(hasTag('large-solid-area'), titleHas(/folding carton|rigid gift|paperboard|board/)), 'Covers large-area mottling and coverage risk.', withEvidence('Large solid area sample', 'Pressure distribution check')],
  ['large-solid-wine-gift', 'Wine and gift-box large area stamping', and(isCluster('wine-gift-packaging'), hasTag('large-solid-area')), 'Covers premium gift and wine packaging solids.', withEvidence('Approved master sample', 'Mottling/pinhole inspection')],
  ['pinholes-mottling', 'Mottling and pinholes troubleshooting', and(isCluster('troubleshooting'), text(/mottling|pinholes|uneven solid/)), 'Covers pinhole and uneven transfer diagnosis.', withEvidence('Visual transfer inspection', 'Substrate smoothness and pressure review')],
  ['fine-lines', 'Fine lines and small type', and(text(/fine lines|small type/, /foil|prepress|selection/)), 'Covers fine-detail artwork limits.', withEvidence('Magnified edge inspection', 'Minimum artwork feature review')],
  ['emboss-register', 'Foil emboss registration', and(hasTag('register-shift'), titleHas(/emboss|relief|holographic|hologram|register/)), 'Covers emboss and foil alignment problems.', withEvidence('Registration measurement', 'Die and substrate batch note')],
  ['tape-test', 'Tape adhesion test', and(isIntent('testing'), hasTag('tape-adhesion-job-specific'), hasTag('poor-adhesion-peeling')), 'Covers job-specific tape pull acceptance.', withEvidence('Tape pull method', 'Pass/fail criterion')],
  ['dry-rub-test', 'Dry rub or abrasion test', and(isIntent('testing'), hasTag('dry-rub-abrasion')), 'Covers dry rub durability.', withEvidence('Dry rub method', 'Approved master comparison')],
  ['alcohol-rub-test', 'Alcohol or chemical rub test', hasTag('alcohol-chemical-rub'), 'Covers cosmetic and packaging chemical resistance.', withEvidence('Specified-agent rub method', 'Exposure limit')],
  ['scratch-test', 'Scratch-resistance test', and(isIntent('testing'), hasTag('scratch-scuff-failure')), 'Covers scratch resistance requests.', withEvidence('Scratch method', 'Acceptance threshold')],
  ['fold-crease-test', 'Fold and crease durability', and(hasTag('fold-crease-durability'), titleHas(/laminated paper|paperboard|folding carton|board/)), 'Covers folding carton crease durability.', withEvidence('Fold/crease sample', 'Post-fold adhesion inspection')],
  ['cross-cut-test', 'Cross-cut adhesion classification', and(isIntent('testing'), hasTag('cross-cut-adhesion-agreed')), 'Covers cross-cut style adhesion checks.', withEvidence('Agreed classification', 'Method limitation note')],
  ['temperature-variable', 'Temperature process window', and(isIntent('parameter'), text(/Actual die or roller temperature|lamination temperature/)), 'Covers temperature as a controllable variable.', withEvidence('Temperature record', 'Controlled process-window sample')],
  ['pressure-variable', 'Pressure process window', and(isIntent('parameter'), text(/Applied stamping pressure|Nip pressure/)), 'Covers pressure as a controllable variable.', withEvidence('Pressure record', 'Edge/solid comparison')],
  ['dwell-time-variable', 'Dwell or contact time', and(isIntent('parameter'), text(/Contact or dwell time/)), 'Covers dwell time adjustment.', withEvidence('Dwell-time record', 'Heat-damage check')],
  ['line-speed-variable', 'Line or machine speed', and(isIntent('parameter'), hasTag('line-speed')), 'Covers production speed effects.', withEvidence('Speed ladder', 'Transfer completeness check')],
  ['die-condition-variable', 'Die condition and wear', and(isIntent('parameter'), hasTag('die-condition')), 'Covers die condition and leveling.', withEvidence('Die inspection', 'Edge detail comparison')],
  ['foil-tension-variable', 'Foil tension and feed', text(/foil tension|foil web tension|feed|foil-tension/), 'Covers web tension/feed on rotary jobs.', withEvidence('Tension/feed record', 'Register and flaking check')],
  ['sampling-checklist', 'Representative sampling checklist', and(isIntent('testing'), hasTag('controlled-sampling-ladder')), 'Covers sample approval workflow.', withEvidence('Substrate/machine/artwork/speed record', 'Pass/fail criteria')],
  ['roll-specs', 'Roll width length core specifications', text(/roll-width-length-core|roll width|winding|core/), 'Covers roll specification confirmation.', withEvidence('Width/length/core/winding confirmation', 'Machine fit check')],
  ['moq-quantity', 'MOQ and order quantity', hasTag('moq-order-quantity'), 'Covers MOQ planning.', withEvidence('MOQ and lead-time note', 'Color/grade availability')],
  ['supplier-evaluation', 'Supplier evaluation questions', and(isIntent('procurement'), text(/supplier|declaration|documentation|checklist/)), 'Covers supplier screening.', withEvidence('Source traceability', 'Technical document request')],
  ['lead-time-logistics', 'Lead time and logistics', text(/lead-time-logistics|lead time|logistics/), 'Covers purchasing schedule risk.', withEvidence('Lead-time note', 'Repeat-order tolerance')],
  ['batch-traceability', 'Batch consistency and traceability', and(isIntent('procurement'), text(/batch|traceability|consistency/)), 'Covers repeatability and traceability.', withEvidence('Batch record', 'Repeat-run comparison')],
  ['cosmetic-packaging', 'Cosmetic packaging application', and(isCluster('cosmetic-packaging'), text(/cosmetics|personal care|folding carton|label|plastic/)), 'Covers cosmetics packaging applications.', withEvidence('Packaging substrate matrix', 'Durability test plan')],
  ['wine-gift-packaging', 'Wine and gift packaging application', and(isCluster('wine-gift-packaging'), text(/wine|gift|rigid|board|label/)), 'Covers wine/gift premium packaging.', withEvidence('Premium finish master', 'Large-area and register sample')],
  ['plastic-caps-parts', 'Plastic caps and molded parts', and(isCluster('plastics'), text(/plastic|abs|pvc|pmma|roll-on|parts/)), 'Covers molded plastic part stamping.', withEvidence('Part geometry note', 'Heat tolerance check')],
  ['security-packaging', 'Security and holographic packaging', and(isCluster('holographic-security'), text(/security|brand protection|hologram|registered/)), 'Covers anti-counterfeit packaging selection.', withEvidence('Security scope definition', 'Origination/control documentation')],
];

// The inventory originally scored all non-troubleshooting/procurement clusters
// below P0. These IDs are the smallest set needed to satisfy the documented
// coverage rules and fixed cluster quotas. Promotion is editorial, deterministic,
// and retained on the inventory record for auditability.
const REQUIRED_TOPIC_IDS = Object.freeze([
  'HF-008368', 'HF-008365', 'HF-008502', 'HF-008469',
  'HF-002934', 'HF-002862', 'HF-003607', 'HF-003615', 'HF-003623',
  'HF-003677', 'HF-003078', 'HF-003805', 'HF-003789',
  'HF-007075', 'HF-006995', 'HF-006996', 'HF-006999',
  'HF-003685', 'HF-009344', 'HF-008366', 'HF-002649',
  'HF-008380', 'HF-005501', 'HF-005494', 'HF-009107',
  'HF-005513', 'HF-009064', 'HF-005493', 'HF-005197', 'HF-005085',
  'HF-005233', 'HF-005084', 'HF-005232', 'HF-005924', 'HF-005487',
  'HF-008358', 'HF-008355', 'HF-007509', 'HF-008353',
  'HF-007510', 'HF-000001', 'HF-009341', 'HF-005949', 'HF-001813',
  // Six quota slots are intentionally separate from coverage selection.
  'HF-005495', 'HF-007747', 'HF-008369', 'HF-008361', 'HF-008391', 'HF-008363',
]);

const REQUIRED_TOPIC_ID_SET = new Set(REQUIRED_TOPIC_IDS);

function normalizedTopicSlug(slug) {
  return slug.replace(/-[a-z0-9]{7}$/, '');
}

function legacyOverlap(record, legacySlugs) {
  const normalizedSlug = normalizedTopicSlug(record.slug);
  const directMatches = legacySlugs.filter((legacySlug) => (
    normalizedSlug === legacySlug
    || normalizedSlug.startsWith(`${legacySlug}-`)
    || legacySlug.startsWith(`${normalizedSlug}-`)
  ));
  const narrowerDifference = typeof record.difference === 'string'
    && /^(Narrows|Compares|Diagnoses|Connects|Focuses|Defines|Frames|Turns)\b/.test(record.difference);

  if (directMatches.length > 0 && !narrowerDifference) {
    return {
      decision: 'rejected',
      matchingLegacySlugs: directMatches,
      rationale: 'Direct legacy slug duplicate without a documented narrower difference.',
    };
  }
  if (directMatches.length > 0) {
    return {
      decision: 'allowed-narrower',
      matchingLegacySlugs: directMatches,
      rationale: `Direct legacy slug overlap is allowed because the inventory documents this narrower difference: ${record.difference}`,
    };
  }
  return {
    decision: 'no-direct-overlap',
    matchingLegacySlugs: [],
    rationale: 'No direct legacy slug duplicate after removing the generated topic suffix.',
  };
}

function promoteRequiredTopics(topics) {
  const foundIds = new Set(topics.map((topic) => topic.topic_id));
  for (const topicId of REQUIRED_TOPIC_IDS) {
    if (!foundIds.has(topicId)) throw new Error(`required first-batch topic ${topicId} is missing from the inventory`);
  }

  return topics.map((topic) => {
    if (!REQUIRED_TOPIC_ID_SET.has(topic.topic_id) || topic.priority === 'P0') return topic;
    return {
      ...topic,
      priority: 'P0',
      priority_promotion: {
        batch: BATCH_ID,
        from: topic.priority,
        rationale: 'Promoted for required first-batch coverage and its explicit cluster quota; the original inventory contains no native P0 topics in this cluster.',
      },
    };
  });
}

function quotaCounts(records) {
  return records.reduce((counts, record) => {
    counts.set(record.cluster, (counts.get(record.cluster) ?? 0) + 1);
    return counts;
  }, new Map());
}

function assertQuotas(records) {
  const counts = quotaCounts(records);
  for (const [cluster, quota] of Object.entries(CLUSTER_QUOTAS)) {
    const count = counts.get(cluster) ?? 0;
    if (count < quota.min || count > quota.max) {
      throw new Error(`cluster quota failed for ${cluster}: expected ${quota.min}-${quota.max}, got ${count}`);
    }
  }
  for (const cluster of counts.keys()) {
    if (!CLUSTER_QUOTAS[cluster]) throw new Error(`selected topic has no cluster quota: ${cluster}`);
  }
}

function selectTopics(topics, legacySlugs) {
  const byId = new Map(topics.map((topic) => [topic.topic_id, topic]));
  const selected = [];
  const selectedIds = new Set();

  for (const rule of COVERAGE_RULES) {
    const topicId = REQUIRED_TOPIC_IDS[selected.length];
    const match = byId.get(topicId);
    if (!match || !rule[2](match)) {
      throw new Error(`required topic ${topicId} does not satisfy coverage rule ${rule[0]} (${rule[1]})`);
    }
    if (match.priority !== 'P0') throw new Error(`coverage topic ${topicId} is not P0 after promotion`);
    const overlap = legacyOverlap(match, legacySlugs);
    if (overlap.decision === 'rejected') throw new Error(`coverage topic ${topicId} duplicates a legacy guide`);
    selected.push({ ...match, selectionRule: rule[0], selectionReason: rule[3], requiredEvidence: rule[4], legacyOverlapCheck: overlap });
    selectedIds.add(match.topic_id);
  }

  // The remaining records are selected because a quota has capacity, rather than
  // because the coverage-rule list happens to be 50 entries long.
  for (const topicId of REQUIRED_TOPIC_IDS.slice(COVERAGE_RULES.length)) {
    const match = byId.get(topicId);
    if (!match || match.priority !== 'P0') throw new Error(`quota-fill topic ${topicId} is not P0 after promotion`);
    const quota = CLUSTER_QUOTAS[match.cluster];
    if (!quota || (quotaCounts(selected).get(match.cluster) ?? 0) >= quota.max) {
      throw new Error(`quota-fill topic ${topicId} exceeds the ${match.cluster} quota`);
    }
    const overlap = legacyOverlap(match, legacySlugs);
    if (overlap.decision === 'rejected') throw new Error(`quota-fill topic ${topicId} duplicates a legacy guide`);
    selected.push({
      ...match,
      selectionRule: `cluster-quota-${match.cluster}`,
      selectionReason: `Fills the remaining ${match.cluster} quota after required coverage selection.`,
      requiredEvidence: withEvidence('Source verification from registered source keys', 'Internal product-fit review'),
      legacyOverlapCheck: overlap,
    });
    selectedIds.add(match.topic_id);
  }

  if (selected.length !== TARGET_COUNT || selectedIds.size !== TARGET_COUNT) {
    throw new Error(`expected ${TARGET_COUNT} unique selected topics, got ${selected.length}`);
  }
  assertQuotas(selected);
  return selected.map((record, index) => ({ ...record, batchPosition: index + 1 }));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

const topics = JSON.parse(fs.readFileSync(TOPICS_PATH, 'utf8'));
const legacySlugs = loadLegacyGuideSlugs(LEGACY_GUIDES_PATH);
const promotedTopics = promoteRequiredTopics(topics);
const selected = selectTopics(promotedTopics, legacySlugs);
const selectedById = new Map(selected.map((record) => [record.topic_id, record]));
const updatedTopics = promotedTopics.map((topic) => {
  const selectedRecord = selectedById.get(topic.topic_id);
  if (!selectedRecord) {
    if (topic.batch === BATCH_ID) {
      const clean = { ...topic };
      delete clean.batch;
      delete clean.batch_priority;
      delete clean.batch_position;
      delete clean.selection_rule;
      return clean;
    }
    return topic;
  }
  if (topic.batch && topic.batch !== BATCH_ID) {
    throw new Error(`selected topic ${topic.topic_id} already belongs to future batch ${topic.batch}`);
  }
  return {
    ...topic,
    batch: BATCH_ID,
    batch_priority: 'P0',
    batch_position: selectedRecord.batchPosition,
    selection_rule: selectedRecord.selectionRule,
  };
});

const report = selected.map((record) => ({
  topic_id: record.topic_id,
  slug: record.slug,
  batch: BATCH_ID,
  batchPosition: record.batchPosition,
  originalPriority: record.priority,
  priority: record.priority,
  batchPriority: 'P0',
  priorityPromotion: record.priority_promotion,
  clusterQuota: CLUSTER_QUOTAS[record.cluster],
  cluster: record.cluster,
  intent: record.intent,
  title: record.title,
  topicQuestion: record.topic_question,
  selectionRule: record.selectionRule,
  selectionReason: record.selectionReason,
  legacyOverlapCheck: record.legacyOverlapCheck,
  requiredEvidence: record.requiredEvidence,
  sourceKeys: record.source_keys ?? record.sourceKeys ?? [],
  relatedProducts: record.related_products ?? [],
  relatedGuides: record.related_guides ?? [],
  difference: record.difference,
  informationalOnlyReason: record.informational_only_reason,
}));

if (new Set(report.map((record) => record.topic_id)).size !== TARGET_COUNT) {
  throw new Error('selected topics contain duplicate topic IDs');
}
if (report.filter((record) => record.sourceKeys.length === 0).length > 0) {
  throw new Error('selected topics must include source keys');
}
if (report.filter((record) => record.relatedProducts.length === 0 && !record.informationalOnlyReason).length > 0) {
  throw new Error('selected topics require related products or an informational-only reason');
}

writeJson(TOPICS_PATH, updatedTopics);
writeJson(SELECTION_PATH, report);

console.log(`Selected ${report.length} topics for ${BATCH_ID}`);
console.log(`Wrote ${SELECTION_PATH}`);
