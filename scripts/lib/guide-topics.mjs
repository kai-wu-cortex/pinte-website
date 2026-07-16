import fs from 'node:fs';

const SOURCE_REGISTRY = JSON.parse(fs.readFileSync(
  new URL('../../content/guides/source-registry.json', import.meta.url),
  'utf8',
));

const INTENT_DIMENSIONS = Object.freeze({
  definition: ['intent', 'subjectType', 'subjectId'],
  comparison: ['intent', 'leftProcessId', 'rightProcessId', 'substrateId', 'surfaceTreatmentId'],
  'substrate-selection': ['intent', 'processId', 'substrateId', 'surfaceTreatmentId', 'artworkTypeId', 'industryId'],
  troubleshooting: ['intent', 'processId', 'substrateId', 'surfaceTreatmentId', 'defectId', 'testId', 'equipmentId'],
  parameter: ['intent', 'processId', 'substrateId', 'surfaceTreatmentId', 'diagnosticVariableId', 'equipmentId'],
  testing: ['intent', 'processId', 'substrateId', 'surfaceTreatmentId', 'testId', 'defectId'],
  application: ['intent', 'industryId', 'processId', 'substrateId', 'surfaceTreatmentId', 'artworkTypeId'],
  equipment: ['intent', 'equipmentId', 'processId', 'substrateId', 'surfaceTreatmentId', 'artworkTypeId'],
  procurement: ['intent', 'procurementConcernId', 'processId', 'substrateId', 'surfaceTreatmentId', 'regionId'],
  compliance: ['intent', 'processId', 'substrateId', 'surfaceTreatmentId', 'regionId', 'complianceFocus'],
  sustainability: ['intent', 'processId', 'substrateId', 'surfaceTreatmentId', 'sustainabilityFocus'],
  'design-prepress': ['intent', 'artworkTypeId', 'processId', 'substrateId', 'surfaceTreatmentId', 'defectId'],
});

const BUYER_PROXIMITY = Object.freeze({
  procurement: 5,
  compliance: 5,
  troubleshooting: 5,
  testing: 4,
  parameter: 4,
  'substrate-selection': 4,
  equipment: 4,
  application: 3,
  comparison: 3,
  sustainability: 3,
  'design-prepress': 3,
  definition: 1,
});

const SOURCE_TYPE_PRIORITY = Object.freeze({
  standard: 0,
  'trade-association': 1,
  'equipment-manufacturer': 2,
  'manufacturer-technical': 3,
  manufacturer: 4,
  'trade-publication': 5,
  'question-research': 6,
});

const FALLBACK_SOURCE_KEYS = Object.freeze([
  'kurz-hot-stamping',
  'foilco-d4-grade-guide',
  'labels-labeling-hot-foiling-process',
]);

const COMPLIANCE_FOCI = Object.freeze([
  { id: 'test-method-limits', label: 'test-method limits', cn: '测试方法边界' },
  { id: 'application-documentation', label: 'application documentation', cn: '应用资料' },
  { id: 'supplier-declaration-scope', label: 'supplier declaration scope', cn: '供应商声明范围' },
  { id: 'sample-retention', label: 'sample retention records', cn: '留样记录' },
]);

const SUSTAINABILITY_FOCI = Object.freeze([
  { id: 'foil-waste-control', label: 'foil waste control', cn: '烫金膜损耗控制' },
  { id: 'sampling-waste-reduction', label: 'sampling waste reduction', cn: '打样损耗降低' },
  { id: 'repeat-run-change-control', label: 'repeat-run change control', cn: '复单变更控制' },
  { id: 'substrate-recycling-fit', label: 'substrate recycling fit', cn: '底材回收适配' },
  { id: 'durability-before-rework', label: 'durability before rework', cn: '返工前耐久验证' },
]);

function byId(items = []) {
  return new Map(items.map((item) => [item.id, item]));
}

function normalizeToken(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .toLocaleLowerCase('und')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\p{Script=Han}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

function slugify(value) {
  return normalizeToken(value)
    .replace(/\b(?:or|and|for|with|to|the|a|an)\b-/g, '')
    .replace(/-+/g, '-')
    .slice(0, 86)
    .replace(/-+$/g, '');
}

function stableHash(value) {
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36).padStart(7, '0').slice(0, 7);
}

function slugWithIntent(baseSlug, intentKey) {
  const suffix = stableHash(intentKey);
  const base = baseSlug.slice(0, 88).replace(/-+$/g, '');
  return `${base}-${suffix}`;
}

function label(item, fallback = '') {
  return item?.label ?? fallback;
}

function lowerFirst(value) {
  return value ? `${value.slice(0, 1).toLocaleLowerCase('en-US')}${value.slice(1)}` : value;
}

function englishList(values) {
  const clean = values.filter(Boolean);
  if (clean.length <= 1) return clean[0] ?? '';
  return `${clean.slice(0, -1).join(', ')} and ${clean.at(-1)}`;
}

function makeIndex(taxonomy) {
  return {
    clusterOrder: new Map((taxonomy.clusters ?? []).map((cluster, index) => [cluster.id, index])),
    clusters: byId(taxonomy.clusters),
    industries: byId(taxonomy.industries),
    substrates: byId(taxonomy.substrates),
    surfaceTreatments: byId(taxonomy.surfaceTreatments),
    processes: byId(taxonomy.processes),
    diagnosticVariables: byId(taxonomy.diagnosticVariables),
    defects: byId(taxonomy.defects),
    tests: byId(taxonomy.tests),
    equipment: byId(taxonomy.equipment),
    artworkTypes: byId(taxonomy.artworkTypes),
    procurementConcerns: byId(taxonomy.procurementConcerns),
    regions: byId(taxonomy.regions),
    productSeries: byId(taxonomy.productSeries),
    compatibilityGroups: byId(taxonomy.compatibilityGroups),
  };
}

function sourceKeysFor(topicKeys, limit = 5) {
  const keySet = new Set(topicKeys.filter(Boolean));
  const matched = SOURCE_REGISTRY
    .filter((source) => (source.supportedTopics ?? []).some((topic) => keySet.has(topic)))
    .sort((left, right) => {
      const priorityDelta = (SOURCE_TYPE_PRIORITY[left.sourceType] ?? 20)
        - (SOURCE_TYPE_PRIORITY[right.sourceType] ?? 20);
      return priorityDelta || left.id.localeCompare(right.id);
    })
    .map((source) => source.id);

  const combined = [...matched, ...FALLBACK_SOURCE_KEYS];
  return [...new Set(combined)].slice(0, limit);
}

function matchingEquipment(index, processId) {
  return [...index.equipment.values()]
    .filter((equipment) => (equipment.processIds ?? []).includes(processId));
}

function matchingIndustries(index, group) {
  return (group.industryIds ?? [])
    .map((industryId) => index.industries.get(industryId))
    .filter(Boolean);
}

function processRequiredVariables(index, processId) {
  return (index.processes.get(processId)?.requiredVariables ?? [])
    .map((variableId) => index.diagnosticVariables.get(variableId))
    .filter(Boolean);
}

function applicableTests(index, group, defectId) {
  const groupTestIds = new Set(group.testIds ?? []);
  return [...index.tests.values()].filter((testMethod) => (
    groupTestIds.has(testMethod.id)
    || (testMethod.applicableDefectIds ?? []).includes(defectId)
  ));
}

function buildCompatibilityTuples(taxonomy, index) {
  const tuples = [];
  for (const group of taxonomy.compatibilityGroups ?? []) {
    for (const substrateId of group.substrateIds ?? []) {
      const substrate = index.substrates.get(substrateId);
      if (!substrate || !(substrate.compatibilityGroupIds ?? []).includes(group.id)) continue;
      for (const surfaceTreatmentId of group.surfaceTreatmentIds ?? []) {
        const surfaceTreatment = index.surfaceTreatments.get(surfaceTreatmentId);
        if (!surfaceTreatment) continue;
        for (const processId of group.processIds ?? []) {
          if (!(substrate.processIds ?? []).includes(processId)) continue;
          if (!(surfaceTreatment.compatibleProcessIds ?? []).includes(processId)) continue;
          tuples.push({
            compatibilityGroupId: group.id,
            group,
            substrateId,
            substrate,
            surfaceTreatmentId,
            surfaceTreatment,
            processId,
            process: index.processes.get(processId),
          });
        }
      }
    }
  }
  return tuples;
}

function makeEvidence(index, tuple, extra = {}) {
  const tests = (extra.testIds ?? tuple.group.testIds ?? [])
    .map((testId) => index.tests.get(testId)?.label)
    .filter(Boolean)
    .slice(0, 3);
  return [
    'Production-representative substrate, machine, artwork, and speed trial',
    ...tests,
    'Supplier grade selection notes and recorded pass/fail criteria',
  ];
}

function scoreCandidate(candidate) {
  const buyer = BUYER_PROXIMITY[candidate.intent] ?? 2;
  const technicalFields = [
    'processId',
    'substrateId',
    'surfaceTreatmentId',
    'defectId',
    'testId',
    'diagnosticVariableId',
    'equipmentId',
    'artworkTypeId',
    'industryId',
    'regionId',
  ].filter((field) => candidate[field]).length;
  const sourceAvailability = Math.min(candidate.sourceKeys.length, 5);
  const productRelevance = Math.min(candidate.relatedProducts.length, 3);
  const overlapRisk = candidate.intent === 'definition' ? 2 : candidate.surfaceTreatmentId ? 0 : 1;
  return (buyer * 100)
    + (technicalFields * 18)
    + (sourceAvailability * 10)
    + (productRelevance * 16)
    - (overlapRisk * 22);
}

function canonicalComparisonValues(candidate) {
  const left = candidate.leftProcessId ?? candidate.leftId;
  const right = candidate.rightProcessId ?? candidate.rightId ?? candidate.comparisonProcessId;
  return [left, right].filter(Boolean).sort();
}

export function normalizeIntentKey(candidate) {
  if (!candidate || typeof candidate !== 'object') throw new TypeError('candidate must be an object');
  const intent = normalizeToken(candidate.intent);
  const fields = INTENT_DIMENSIONS[intent] ?? [
    'intent',
    'processId',
    'substrateId',
    'surfaceTreatmentId',
    'defectId',
    'testId',
    'diagnosticVariableId',
    'equipmentId',
    'artworkTypeId',
    'industryId',
    'procurementConcernId',
    'regionId',
  ];
  const normalized = { ...candidate, intent };
  if (intent === 'comparison') {
    const [leftProcessId, rightProcessId] = canonicalComparisonValues(candidate);
    normalized.leftProcessId = leftProcessId;
    normalized.rightProcessId = rightProcessId;
  }
  return fields
    .map((field) => `${field}:${normalizeToken(normalized[field])}`)
    .filter((part) => !part.endsWith(':'))
    .join('|');
}

function buildCandidate(index, tuple, details) {
  const sourceKeys = sourceKeysFor([
    tuple?.compatibilityGroupId,
    tuple?.processId,
    tuple?.substrateId,
    tuple?.surfaceTreatmentId,
    details.cluster,
    details.defectId,
    details.testId,
    details.diagnosticVariableId,
    details.equipmentId,
    details.artworkTypeId,
    details.procurementConcernId,
    details.industryId,
    details.regionId,
    details.complianceFocus,
    details.sustainabilityFocus,
    ...(details.sourceTopicKeys ?? []),
  ]);
  const candidate = {
    compatibilityGroupId: tuple?.compatibilityGroupId,
    cluster: details.cluster,
    intent: details.intent,
    buyer_stage: details.buyerStage,
    title: details.title,
    slug: details.slug,
    topic_question: details.topicQuestion,
    difference: details.difference,
    evidenceNeeded: details.evidenceNeeded ?? makeEvidence(index, tuple, details),
    sourceKeys,
    relatedProducts: [...new Set(tuple?.group?.productSeriesIds ?? details.relatedProducts ?? [])],
    tags: details.tags ?? [],
    substrateId: tuple?.substrateId,
    surfaceTreatmentId: tuple?.surfaceTreatmentId,
    processId: tuple?.processId,
    ...details.dimensions,
  };
  candidate.intent_key = normalizeIntentKey(candidate);
  candidate.slug = slugWithIntent(candidate.slug, candidate.intent_key);
  candidate.score = scoreCandidate(candidate);
  return candidate;
}

function buildStandaloneCandidate(details) {
  const sourceKeys = sourceKeysFor(details.sourceTopicKeys ?? []);
  const candidate = {
    cluster: details.cluster,
    intent: details.intent,
    buyer_stage: details.buyerStage,
    title: details.title,
    slug: details.slug,
    topic_question: details.topicQuestion,
    difference: details.difference,
    evidenceNeeded: details.evidenceNeeded,
    sourceKeys,
    relatedProducts: details.relatedProducts ?? [],
    tags: details.tags ?? [],
    ...details.dimensions,
  };
  candidate.intent_key = normalizeIntentKey(candidate);
  candidate.slug = slugWithIntent(candidate.slug, candidate.intent_key);
  candidate.score = scoreCandidate(candidate);
  return candidate;
}

function buildDefinitionCandidates(taxonomy) {
  const candidates = [];
  const subjects = [
    ...(taxonomy.processes ?? []).map((item) => ({ type: 'process', cluster: 'fundamentals-terminology', item })),
    ...(taxonomy.diagnosticVariables ?? []).map((item) => ({ type: 'variable', cluster: 'parameters-testing', item })),
    ...(taxonomy.defects ?? []).map((item) => ({ type: 'defect', cluster: 'troubleshooting', item })),
    ...(taxonomy.tests ?? []).map((item) => ({ type: 'test', cluster: 'parameters-testing', item })),
    ...(taxonomy.equipment ?? []).map((item) => ({ type: 'equipment', cluster: 'parameters-testing', item })),
    ...(taxonomy.artworkTypes ?? []).map((item) => ({ type: 'artwork', cluster: 'fundamentals-terminology', item })),
    ...(taxonomy.procurementConcerns ?? []).map((item) => ({ type: 'procurement', cluster: 'procurement-specifications', item })),
    ...(taxonomy.compatibilityGroups ?? []).map((item) => ({ type: 'compatibility-group', cluster: item.clusterIds?.[0] ?? 'fundamentals-terminology', item })),
  ];
  for (const subject of subjects) {
    const subjectName = label(subject.item);
    candidates.push(buildStandaloneCandidate({
      cluster: subject.cluster,
      intent: 'definition',
      buyerStage: subject.type === 'procurement' ? 'supplier-shortlist' : 'research',
      title: {
        en: `What ${subjectName} Means in Foil Stamping`,
        cn: `${subjectName}在烫金中的含义`,
      },
      slug: slugify(`what ${subjectName} means foil stamping`),
      topicQuestion: {
        en: `What does ${lowerFirst(subjectName)} mean for a foil stamping project?`,
        cn: `${subjectName}对烫金项目意味着什么？`,
      },
      difference: `Defines ${subjectName} as a planning term and links it to sampling, process limits, and buyer decisions.`,
      evidenceNeeded: ['Taxonomy definition', 'Supplier sampling notes', 'Related process or test source'],
      sourceTopicKeys: [subject.item.id, subject.cluster, 'fundamentals-terminology'],
      dimensions: {
        subjectType: subject.type,
        subjectId: subject.item.id,
      },
      tags: [subject.type, subject.item.id],
    }));
  }
  return candidates;
}

function buildComparisonCandidates(taxonomy, index, tuples) {
  const candidates = [];
  for (const tuple of tuples) {
    const compatibleProcesses = (tuple.group.processIds ?? [])
      .filter((processId) => processId !== tuple.processId)
      .filter((processId) => (tuple.substrate.processIds ?? []).includes(processId))
      .filter((processId) => (tuple.surfaceTreatment.compatibleProcessIds ?? []).includes(processId))
      .map((processId) => index.processes.get(processId))
      .filter(Boolean);
    for (const comparisonProcess of compatibleProcesses) {
      const [leftProcessId, rightProcessId] = [tuple.processId, comparisonProcess.id].sort();
      if (tuple.processId !== leftProcessId) continue;
      const left = index.processes.get(leftProcessId);
      const right = index.processes.get(rightProcessId);
      const substrateName = label(tuple.substrate);
      candidates.push(buildCandidate(index, tuple, {
        cluster: 'process-comparison',
        intent: 'comparison',
        buyerStage: 'process-selection',
        title: {
          en: `${label(left)} vs ${label(right)} for ${substrateName}`,
          cn: `${substrateName}选择${label(left)}还是${label(right)}`,
        },
        slug: slugify(`${label(left)} vs ${label(right)} ${substrateName}`),
        topicQuestion: {
          en: `Should ${substrateName} use ${lowerFirst(label(left))} or ${lowerFirst(label(right))}?`,
          cn: `${substrateName}应选择${label(left)}还是${label(right)}？`,
        },
        difference: `Compares two compatible processes for the same ${substrateName} and surface condition instead of describing foil transfer in general.`,
        dimensions: { leftProcessId, rightProcessId },
        sourceTopicKeys: [rightProcessId, 'process-comparison'],
        tags: ['comparison', leftProcessId, rightProcessId, tuple.substrateId],
      }));
    }
  }
  return candidates;
}

function buildSubstrateSelectionCandidates(taxonomy, index, tuples) {
  const candidates = [];
  const artworkTypes = taxonomy.artworkTypes ?? [];
  for (const tuple of tuples) {
    for (const artwork of artworkTypes) {
      for (const industry of matchingIndustries(index, tuple.group)) {
        const substrateName = label(tuple.substrate);
        candidates.push(buildCandidate(index, tuple, {
          cluster: tuple.group.clusterIds?.[0] ?? 'paper-carton-packaging',
          intent: 'substrate-selection',
          buyerStage: 'grade-selection',
          title: {
            en: `Foil Grade Selection for ${artwork.label} on ${substrateName}`,
            cn: `${substrateName}${artwork.label}烫金膜选型`,
          },
          slug: slugify(`foil grade selection ${artwork.label} ${substrateName} ${label(tuple.surfaceTreatment)}`),
          topicQuestion: {
            en: `Which foil selection checks matter for ${lowerFirst(artwork.label)} on ${lowerFirst(substrateName)}?`,
            cn: `${substrateName}${artwork.label}选膜时要确认哪些条件？`,
          },
          difference: `Narrows grade selection to ${artwork.label}, ${substrateName}, ${label(tuple.surfaceTreatment)}, and ${label(tuple.process)}.`,
          dimensions: {
            artworkTypeId: artwork.id,
            industryId: industry.id,
          },
          sourceTopicKeys: [artwork.id, industry.id, 'substrate-grade-selection'],
          tags: ['selection', artwork.id, industry.id, tuple.compatibilityGroupId],
        }));
      }
    }
  }
  return candidates;
}

function buildTroubleshootingCandidates(taxonomy, index, tuples) {
  const candidates = [];
  for (const tuple of tuples) {
    const equipmentOptions = matchingEquipment(index, tuple.processId).slice(0, 2);
    for (const defect of taxonomy.defects ?? []) {
      for (const testMethod of applicableTests(index, tuple.group, defect.id).slice(0, 3)) {
        for (const equipment of equipmentOptions.length ? equipmentOptions : [undefined]) {
          const substrateName = label(tuple.substrate);
          candidates.push(buildCandidate(index, tuple, {
            cluster: 'troubleshooting',
            intent: 'troubleshooting',
            buyerStage: 'problem-solving',
            title: {
              en: `Why ${defect.label} Happens on ${substrateName}`,
              cn: `${substrateName}出现${defect.label}的原因`,
            },
            slug: slugify(`why ${defect.label} happens ${substrateName} ${label(tuple.process)} ${label(tuple.surfaceTreatment)} ${equipment?.label ?? ''}`),
            topicQuestion: {
              en: `How should a converter diagnose ${lowerFirst(defect.label)} on ${lowerFirst(substrateName)}?`,
              cn: `${substrateName}出现${defect.label}时应如何排查？`,
            },
            difference: `Diagnoses ${defect.label} for a defined substrate, surface, process, and verification method rather than listing generic defects.`,
            dimensions: {
              defectId: defect.id,
              testId: testMethod.id,
              equipmentId: equipment?.id,
            },
            sourceTopicKeys: [defect.id, testMethod.id, equipment?.id],
            tags: ['troubleshooting', defect.id, testMethod.id, equipment?.id].filter(Boolean),
          }));
        }
      }
    }
  }
  return candidates;
}

function buildParameterCandidates(taxonomy, index, tuples) {
  const candidates = [];
  for (const tuple of tuples) {
    const variables = processRequiredVariables(index, tuple.processId);
    const equipmentOptions = matchingEquipment(index, tuple.processId).slice(0, 2);
    for (const variable of variables) {
      for (const equipment of equipmentOptions.length ? equipmentOptions : [undefined]) {
        const substrateName = label(tuple.substrate);
        candidates.push(buildCandidate(index, tuple, {
          cluster: 'parameters-testing',
          intent: 'parameter',
          buyerStage: 'sample-approval',
          title: {
            en: `${variable.label} Checks for ${label(tuple.process)} on ${substrateName}`,
            cn: `${substrateName}${label(tuple.process)}的${variable.label}检查`,
          },
          slug: slugify(`${variable.label} checks ${label(tuple.process)} ${substrateName} ${label(tuple.surfaceTreatment)} ${equipment?.label ?? ''}`),
          topicQuestion: {
            en: `How should ${lowerFirst(variable.label)} be checked before approving ${lowerFirst(substrateName)}?`,
            cn: `${substrateName}打样前如何检查${variable.label}？`,
          },
          difference: `Focuses on one controllable variable inside a compatible substrate-process tuple and avoids unverified universal settings.`,
          dimensions: {
            diagnosticVariableId: variable.id,
            equipmentId: equipment?.id,
          },
          sourceTopicKeys: [variable.id, equipment?.id, 'controlled-sampling-ladder'],
          tags: ['parameter', variable.id, equipment?.id].filter(Boolean),
        }));
      }
    }
  }
  return candidates;
}

function buildTestingCandidates(taxonomy, index, tuples) {
  const candidates = [];
  for (const tuple of tuples) {
    for (const testMethod of applicableTests(index, tuple.group).slice(0, 6)) {
      const defects = (testMethod.applicableDefectIds ?? [])
        .map((defectId) => index.defects.get(defectId))
        .filter(Boolean);
      for (const defect of defects.length ? defects : [undefined]) {
        const substrateName = label(tuple.substrate);
        candidates.push(buildCandidate(index, tuple, {
          cluster: 'parameters-testing',
          intent: 'testing',
          buyerStage: 'acceptance-testing',
          title: {
            en: `${testMethod.label} for ${substrateName} Foil Approval`,
            cn: `${substrateName}烫金确认中的${testMethod.label}`,
          },
          slug: slugify(`${testMethod.label} ${substrateName} foil approval ${defect?.label ?? ''} ${label(tuple.surfaceTreatment)}`),
          topicQuestion: {
            en: `When is ${lowerFirst(testMethod.label)} useful for ${lowerFirst(substrateName)} foil approval?`,
            cn: `${substrateName}烫金确认何时使用${testMethod.label}？`,
          },
          difference: `Connects one acceptance method to the exact substrate, surface, process, and failure symptom it can check.`,
          dimensions: {
            testId: testMethod.id,
            defectId: defect?.id,
          },
          sourceTopicKeys: [testMethod.id, defect?.id],
          tags: ['testing', testMethod.id, defect?.id].filter(Boolean),
        }));
      }
    }
  }
  return candidates;
}

function buildApplicationCandidates(taxonomy, index, tuples) {
  const candidates = [];
  for (const tuple of tuples) {
    for (const industry of matchingIndustries(index, tuple.group)) {
      for (const artwork of (taxonomy.artworkTypes ?? []).slice(0, 6)) {
        const cluster = industry.clusterIds?.find((clusterId) => tuple.group.clusterIds?.includes(clusterId))
          ?? tuple.group.clusterIds?.[0]
          ?? 'paper-carton-packaging';
        const substrateName = label(tuple.substrate);
        candidates.push(buildCandidate(index, tuple, {
          cluster,
          intent: 'application',
          buyerStage: 'application-planning',
          title: {
            en: `${industry.label} Foil Stamping on ${substrateName}`,
            cn: `${industry.label}${substrateName}烫金应用`,
          },
          slug: slugify(`${industry.label} foil stamping ${substrateName} ${artwork.label} ${label(tuple.surfaceTreatment)}`),
          topicQuestion: {
            en: `What should ${lowerFirst(industry.label)} confirm before foil stamping ${lowerFirst(substrateName)}?`,
            cn: `${industry.label}在${substrateName}烫金前要确认什么？`,
          },
          difference: `Frames the topic around a real buying application, artwork style, substrate, and process route.`,
          dimensions: {
            industryId: industry.id,
            artworkTypeId: artwork.id,
          },
          sourceTopicKeys: [industry.id, artwork.id],
          tags: ['application', industry.id, artwork.id],
        }));
      }
    }
  }
  return candidates;
}

function buildEquipmentCandidates(taxonomy, index, tuples) {
  const candidates = [];
  for (const tuple of tuples) {
    for (const equipment of matchingEquipment(index, tuple.processId)) {
      for (const artwork of (taxonomy.artworkTypes ?? []).slice(0, 5)) {
        const substrateName = label(tuple.substrate);
        candidates.push(buildCandidate(index, tuple, {
          cluster: 'parameters-testing',
          intent: 'equipment',
          buyerStage: 'machine-fit',
          title: {
            en: `${equipment.label} Fit for ${substrateName} Foil Work`,
            cn: `${equipment.label}用于${substrateName}烫金的适配`,
          },
          slug: slugify(`${equipment.label} fit ${substrateName} foil work ${artwork.label} ${label(tuple.surfaceTreatment)}`),
          topicQuestion: {
            en: `Is ${lowerFirst(equipment.label)} suitable for ${lowerFirst(substrateName)} with ${lowerFirst(artwork.label)}?`,
            cn: `${equipment.label}是否适合${substrateName}${artwork.label}？`,
          },
          difference: `Checks machine fit against the process, substrate, surface, and artwork instead of treating equipment as interchangeable.`,
          dimensions: {
            equipmentId: equipment.id,
            artworkTypeId: artwork.id,
          },
          sourceTopicKeys: [equipment.id, 'machine-process-compatibility', artwork.id],
          tags: ['equipment', equipment.id, artwork.id],
        }));
      }
    }
  }
  return candidates;
}

function buildProcurementCandidates(taxonomy, index, tuples) {
  const candidates = [];
  for (const tuple of tuples) {
    for (const concern of taxonomy.procurementConcerns ?? []) {
      for (const region of taxonomy.regions ?? []) {
        const substrateName = label(tuple.substrate);
        candidates.push(buildCandidate(index, tuple, {
          cluster: 'procurement-specifications',
          intent: 'procurement',
          buyerStage: 'supplier-shortlist',
          title: {
            en: `${concern.label} Checklist for ${substrateName} Foil`,
            cn: `${substrateName}烫金膜${concern.label}清单`,
          },
          slug: slugify(`${concern.label} checklist ${substrateName} foil ${label(tuple.process)} ${label(tuple.surfaceTreatment)} ${region.label}`),
          topicQuestion: {
            en: `What should buyers ask about ${lowerFirst(concern.label)} for ${lowerFirst(substrateName)} foil?`,
            cn: `采购${substrateName}烫金膜时如何确认${concern.label}？`,
          },
          difference: `Turns a procurement concern into a concrete supplier checklist for one substrate, process, surface condition, and region context.`,
          dimensions: {
            procurementConcernId: concern.id,
            regionId: region.id,
          },
          sourceTopicKeys: [concern.id, region.id],
          tags: ['procurement', concern.id, region.id],
        }));
      }
    }
  }
  return candidates;
}

function buildComplianceCandidates(taxonomy, index, tuples) {
  const candidates = [];
  for (const tuple of tuples) {
    for (const region of taxonomy.regions ?? []) {
      for (const focus of COMPLIANCE_FOCI) {
        const substrateName = label(tuple.substrate);
        candidates.push(buildCandidate(index, tuple, {
          cluster: 'procurement-specifications',
          intent: 'compliance',
          buyerStage: 'technical-document-review',
          title: {
            en: `${focus.label} for ${substrateName} Foil Projects`,
            cn: `${substrateName}烫金项目的${focus.cn}`,
          },
          slug: slugify(`${focus.label} ${substrateName} foil projects ${label(tuple.process)} ${label(tuple.surfaceTreatment)} ${region.label}`),
          topicQuestion: {
            en: `Which ${focus.label} should be confirmed for ${lowerFirst(substrateName)} foil projects?`,
            cn: `${substrateName}烫金项目需要确认哪些${focus.cn}？`,
          },
          difference: `Keeps documentation claims limited to the application, region context, and test method instead of implying universal certification.`,
          dimensions: {
            regionId: region.id,
            complianceFocus: focus.id,
          },
          sourceTopicKeys: ['compliance-documentation', 'test-method', focus.id, region.id],
          tags: ['compliance', focus.id, region.id],
        }));
      }
    }
  }
  return candidates;
}

function buildSustainabilityCandidates(taxonomy, index, tuples) {
  const candidates = [];
  for (const tuple of tuples) {
    for (const focus of SUSTAINABILITY_FOCI) {
      const substrateName = label(tuple.substrate);
      candidates.push(buildCandidate(index, tuple, {
        cluster: tuple.group.clusterIds?.includes('holographic-security')
          ? 'holographic-security'
          : 'procurement-specifications',
        intent: 'sustainability',
        buyerStage: 'sample-approval',
        title: {
          en: `${focus.label} in ${substrateName} Foil Approval`,
          cn: `${substrateName}烫金确认中的${focus.cn}`,
        },
        slug: slugify(`${focus.label} ${substrateName} foil approval ${label(tuple.process)} ${label(tuple.surfaceTreatment)}`),
        topicQuestion: {
          en: `How can ${lowerFirst(focus.label)} be handled while approving ${lowerFirst(substrateName)} foil?`,
          cn: `${substrateName}烫金确认时如何处理${focus.cn}？`,
        },
        difference: `Connects waste or reuse planning to an approval workflow for one substrate, process, and surface condition.`,
        dimensions: {
          sustainabilityFocus: focus.id,
        },
        sourceTopicKeys: ['representative-sampling', 'repeat-order-change-control', focus.id],
        tags: ['sustainability', focus.id],
      }));
    }
  }
  return candidates;
}

function buildDesignPrepressCandidates(taxonomy, index, tuples) {
  const candidates = [];
  for (const tuple of tuples) {
    for (const artwork of taxonomy.artworkTypes ?? []) {
      const defects = (taxonomy.defects ?? [])
        .filter((defect) => ['blurred-or-filled-detail', 'overtransfer-halo', 'mottling-pinholes', 'register-shift', 'cold-foil-spread-or-voids'].includes(defect.id));
      for (const defect of defects) {
        const substrateName = label(tuple.substrate);
        candidates.push(buildCandidate(index, tuple, {
          cluster: tuple.group.clusterIds?.includes('holographic-security')
            ? 'holographic-security'
            : 'fundamentals-terminology',
          intent: 'design-prepress',
          buyerStage: 'artwork-preflight',
          title: {
            en: `Prepress Rules for ${artwork.label} on ${substrateName}`,
            cn: `${substrateName}${artwork.label}烫金印前规则`,
          },
          slug: slugify(`prepress rules ${artwork.label} ${substrateName} ${defect.label} ${label(tuple.process)} ${label(tuple.surfaceTreatment)}`),
          topicQuestion: {
            en: `How should ${lowerFirst(artwork.label)} be prepared to reduce ${lowerFirst(defect.label)} on ${lowerFirst(substrateName)}?`,
            cn: `${substrateName}${artwork.label}如何做印前准备以减少${defect.label}？`,
          },
          difference: `Ties artwork preparation to a likely defect, substrate, process, and surface condition before sampling starts.`,
          dimensions: {
            artworkTypeId: artwork.id,
            defectId: defect.id,
          },
          sourceTopicKeys: [artwork.id, defect.id, 'fine-lines-small-type'],
          tags: ['design-prepress', artwork.id, defect.id],
        }));
      }
    }
  }
  return candidates;
}

function dedupeCandidates(candidates) {
  const byIntent = new Map();
  for (const candidate of candidates) {
    const existing = byIntent.get(candidate.intent_key);
    if (!existing
      || candidate.score > existing.score
      || (candidate.score === existing.score && candidate.slug < existing.slug)) {
      byIntent.set(candidate.intent_key, candidate);
    }
  }
  return [...byIntent.values()].sort((left, right) => (
    right.score - left.score
    || left.intent_key.localeCompare(right.intent_key)
    || left.title.en.localeCompare(right.title.en)
  ));
}

export function generateCandidates(taxonomy) {
  const index = makeIndex(taxonomy);
  const tuples = buildCompatibilityTuples(taxonomy, index);
  const candidates = [
    ...buildDefinitionCandidates(taxonomy, index, tuples),
    ...buildComparisonCandidates(taxonomy, index, tuples),
    ...buildSubstrateSelectionCandidates(taxonomy, index, tuples),
    ...buildTroubleshootingCandidates(taxonomy, index, tuples),
    ...buildParameterCandidates(taxonomy, index, tuples),
    ...buildTestingCandidates(taxonomy, index, tuples),
    ...buildApplicationCandidates(taxonomy, index, tuples),
    ...buildEquipmentCandidates(taxonomy, index, tuples),
    ...buildProcurementCandidates(taxonomy, index, tuples),
    ...buildComplianceCandidates(taxonomy, index, tuples),
    ...buildSustainabilityCandidates(taxonomy, index, tuples),
    ...buildDesignPrepressCandidates(taxonomy, index, tuples),
  ];
  return dedupeCandidates(candidates);
}

function topicId(index) {
  return `HF-${String(index + 1).padStart(6, '0')}`;
}

function toRecord(candidate, index) {
  return {
    topic_id: topicId(index),
    slug: candidate.slug,
    status: 'draft',
    cluster: candidate.cluster,
    intent: candidate.intent,
    intent_key: candidate.intent_key,
    buyer_stage: candidate.buyer_stage,
    title: candidate.title,
    topic_question: candidate.topic_question,
    related_products: candidate.relatedProducts,
    source_keys: candidate.sourceKeys,
    sourceKeys: candidate.sourceKeys,
    difference: candidate.difference,
    evidence_needed: candidate.evidenceNeeded,
    evidenceNeeded: candidate.evidenceNeeded,
    tags: candidate.tags,
    score: candidate.score,
  };
}

export function selectInventory(candidates, count) {
  if (!Number.isInteger(count) || count < 0) throw new TypeError('count must be a non-negative integer');
  const sorted = dedupeCandidates(candidates);
  if (sorted.length < count) {
    throw new Error(`cannot select ${count} unique topics from ${sorted.length} candidates`);
  }

  const clusterOrder = [...new Set(sorted.map((candidate) => candidate.cluster))].sort();
  const quota = clusterOrder.length === 0 ? 0 : Math.floor(count / clusterOrder.length);
  const selected = [];
  const selectedKeys = new Set();

  for (const cluster of clusterOrder) {
    for (const candidate of sorted.filter((item) => item.cluster === cluster).slice(0, quota)) {
      selected.push(candidate);
      selectedKeys.add(candidate.intent_key);
    }
  }

  const selectedIntents = new Set(selected.map((candidate) => candidate.intent));
  for (const intent of [...new Set(sorted.map((candidate) => candidate.intent))].sort()) {
    if (selected.length >= count) break;
    if (selectedIntents.has(intent)) continue;
    const candidate = sorted.find((item) => item.intent === intent && !selectedKeys.has(item.intent_key));
    if (!candidate) continue;
    selected.push(candidate);
    selectedKeys.add(candidate.intent_key);
    selectedIntents.add(candidate.intent);
  }

  for (const candidate of sorted) {
    if (selected.length >= count) break;
    if (selectedKeys.has(candidate.intent_key)) continue;
    selected.push(candidate);
    selectedKeys.add(candidate.intent_key);
  }

  return selected
    .sort((left, right) => (
      left.cluster.localeCompare(right.cluster)
      || right.score - left.score
      || left.intent_key.localeCompare(right.intent_key)
      || left.title.en.localeCompare(right.title.en)
    ))
    .map(toRecord);
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

export function summarizeInventory(records) {
  const clusters = new Map();
  const intents = new Map();
  for (const record of records) {
    clusters.set(record.cluster, (clusters.get(record.cluster) ?? 0) + 1);
    intents.set(record.intent, (intents.get(record.intent) ?? 0) + 1);
  }
  return {
    total: records.length,
    duplicateSlugs: duplicateCount(records.map((record) => record.slug)),
    duplicateIntentKeys: duplicateCount(records.map((record) => record.intent_key)),
    clusters: Object.fromEntries([...clusters.entries()].sort()),
    intents: Object.fromEntries([...intents.entries()].sort()),
  };
}
