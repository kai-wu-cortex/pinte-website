import fs from 'node:fs';

const SOURCE_REGISTRY = JSON.parse(fs.readFileSync(
  new URL('../../content/guides/source-registry.json', import.meta.url),
  'utf8',
));

const INTENT_DIMENSIONS = Object.freeze({
  definition: ['intent', 'subjectType', 'subjectId'],
  comparison: ['intent', 'leftProcessId', 'rightProcessId', 'substrateId', 'surfaceTreatmentId'],
  'substrate-selection': ['intent', 'processId', 'substrateId', 'surfaceTreatmentId', 'artworkTypeId', 'industryId'],
  troubleshooting: ['intent', 'processId', 'substrateId', 'surfaceTreatmentId', 'defectId'],
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

const CN_LABELS = Object.freeze({
  'commercial-print-finishing': '商业印后加工',
  'folding-carton-packaging': '折叠纸盒和彩盒包装',
  'cosmetics-personal-care': '化妆品和个人护理包装',
  'wine-spirits-gifts': '酒类和礼盒包装',
  'labels-narrow-web': '标签和窄幅印刷',
  'consumer-plastic-products': '消费品塑料件',
  'leather-goods-bookbinding': '皮具和书封装帧',
  'security-brand-protection': '防伪和品牌保护',
  'paper-coated': '铜版纸',
  'paper-uncoated': '未涂布纸',
  'paper-textured-specialty': '纹理特种纸',
  'paper-kraft': '牛皮纸或纸板',
  'board-folding-carton': '折叠纸盒纸板',
  'board-rigid-gift': '精品礼盒裱纸或纸板',
  'paperboard-laminated': '覆膜纸板',
  'label-paper-facestock': '纸质标签面材',
  'label-film-facestock': '薄膜标签面材',
  'plastic-abs': 'ABS 塑料',
  'plastic-polystyrene': 'PS 塑料',
  'plastic-pvc-rigid': '硬质 PVC',
  'plastic-pmma': 'PMMA 亚克力',
  'plastic-pet-film': 'PET 或 PETG 薄膜/部件',
  'plastic-polypropylene': 'PP 聚丙烯',
  'plastic-polyethylene': 'PE 聚乙烯',
  'leather-natural': '天然皮革',
  'leather-pu-synthetic': 'PU 合成革',
  'leather-pvc-synthetic': 'PVC 合成革或书封',
  'glass-container': '涂层玻璃容器',
  'surface-as-supplied': '原始未涂布表面',
  'printed-conventional-ink': '普通油墨印刷层',
  'printed-uv-ink': 'UV 或 LED-UV 油墨层',
  'varnish-water-based': '水性光油',
  'varnish-uv': 'UV 光油或涂层',
  'lamination-opp-or-pet': 'OPP 或 PET 覆膜',
  'soft-touch-coating-or-film': '触感膜或触感涂层',
  'anti-scratch-coating-or-film': '耐刮膜或耐刮涂层',
  primer: '底涂或增附着涂层',
  'corona-or-plasma': '电晕或等离子处理',
  'digital-toner-layer': '数码碳粉或电子油墨接收层',
  'printed-cold-foil-adhesive': '印刷冷烫胶层',
  'hot-stamping-flatbed': '平压平热烫',
  'hot-stamping-round-flat': '圆压平热烫',
  'hot-stamping-rotary': '轮转热烫',
  'hot-stamping-roll-on': '异形件滚烫',
  'hot-stamping-embossing': '烫金压凸',
  'cold-foil-narrow-web': '窄幅冷烫',
  'cold-foil-sheetfed-offset': '单张纸胶印冷烫',
  'screen-printed-uv-cold-transfer': '丝印 UV 胶冷转印',
  'digital-toner-transfer': '数码碳粉烫金',
  'digital-uv-varnish-transfer': '数码 UV 光油烫金',
  'registered-hologram-transfer': '定位镭射转印',
  'substrate-construction': '底材结构',
  'surface-treatment': '表面处理或涂层',
  'surface-cleanliness': '表面污染或脱模剂',
  'substrate-smoothness': '表面粗糙度和平滑度',
  'substrate-compressibility': '底材压缩性',
  'substrate-batch': '底材批次差异',
  'ink-coating-cure': '油墨或涂层固化状态',
  'surface-energy': '表面能和润湿状态',
  'foil-grade': '烫金膜型号和胶层/离型配方',
  'foil-batch': '烫金膜批次或卷料差异',
  'release-characteristic': '烫金膜离型特性',
  temperature: '实际版温或辊温',
  pressure: '烫印压力',
  'dwell-time': '接触时间',
  'line-speed': '机器或走料速度',
  'nip-pressure': '压辊压力',
  'foil-tension': '膜带张力和走膜',
  'die-condition': '烫版状态',
  'equipment-alignment': '设备对位和平整度',
  'register-control': '套准控制',
  'artwork-feature-size': '最小线条文字和间隙',
  'stamping-area': '烫印面积',
  'part-geometry': '部件曲面和几何形状',
  'adhesive-system': '冷转印胶水体系',
  'adhesive-coat-weight': '胶水或光油涂布量',
  'uv-dose': 'UV 或 LED-UV 固化能量',
  'toner-system': '碳粉或电子油墨体系',
  'varnish-system': '数码光油体系',
  'varnish-height': '数码光油高度',
  'lamination-temperature': '覆膜转印温度',
  pitch: '镭射图案间距',
  'security-origination': '防伪图案制版和管控',
  'ambient-conditions': '环境温湿度',
  'test-method': '约定测试方法和判定标准',
  'incomplete-transfer': '缺金或转移不完整',
  'poor-adhesion-peeling': '附着不牢或掉金',
  'blurred-or-filled-detail': '糊边、糊版或细节丢失',
  'overtransfer-halo': '飞金、毛边或图案外转移',
  'mottling-pinholes': '发花、针孔或大面积不均',
  'foil-flaking-dusting': '掉粉、碎金或边缘碎屑',
  'scratch-scuff-failure': '刮擦或耐磨失败',
  'alcohol-chemical-failure': '酒精或化学擦拭失败',
  'register-shift': '套准偏移或镭射定位偏差',
  'color-gloss-variation': '颜色、光泽或光学效果差异',
  'substrate-heat-damage': '底材热损伤、变形或压痕过深',
  'cold-foil-spread-or-voids': '冷烫扩点、空洞或金属密度不足',
  'controlled-sampling-ladder': '工艺窗口打样',
  'visual-transfer-completeness': '转移完整度目视检查',
  'edge-definition-magnified': '边缘和细节放大检查',
  'tape-adhesion-job-specific': '项目约定胶带测试',
  'cross-cut-adhesion-agreed': '约定百格分级',
  'dry-rub-abrasion': '干擦或耐磨对比',
  'alcohol-chemical-rub': '酒精或指定介质擦拭',
  'scratch-resistance-agreed': '约定耐刮测试',
  'fold-crease-durability': '折痕或压线耐久',
  'registration-measurement': '套准和图案间距测量',
  'color-gloss-master-comparison': '颜色光泽对照样比对',
  'surface-energy-check': '表面能或润湿检查',
  'repeat-run-stability': '复单和批次稳定性检查',
  'manual-platen-press': '手动平压烫金机',
  'automatic-flatbed-press': '自动平压平烫金机',
  'round-flat-cylinder-press': '圆压平烫金机',
  'rotary-web-hot-foil-unit': '轮转热烫单元',
  'roll-on-parts-stamper': '异形件滚烫机',
  'sheetfed-offset-cold-foil-module': '单张纸胶印冷烫模块',
  'narrow-web-cold-foil-module': '窄幅柔印或凸印冷烫模块',
  'screen-printing-cold-foil-line': '丝印 UV 冷烫线',
  'digital-toner-foiling-system': '数码碳粉烫金系统',
  'digital-uv-embellishment-system': '数码 UV 增效系统',
  'registered-hologram-press': '定位镭射烫金机',
  'fine-lines-small-type': '细线和小文字',
  'large-solid-area': '大面积实地',
  'reverse-knockout': '反白或镂空细节',
  'halftone-gradient': '网点或渐变',
  'foil-and-emboss-relief': '烫金加压凸',
  'variable-data-personalization': '可变数据或个性化',
  'registered-single-image-hologram': '定位单枚镭射图案',
  'continuous-holographic-pattern': '连续镭射纹理',
  'substrate-grade-selection': '底材适配选型',
  'representative-sampling': '生产代表性打样',
  'durability-acceptance': '耐久测试和判定标准',
  'roll-width-length-core': '宽幅、长度、绕向和卷芯',
  'color-finish-master': '颜色、效果和确认样',
  'batch-consistency-traceability': '批次一致性和追溯',
  'moq-order-quantity': '起订量和采购数量',
  'lead-time-logistics': '交期和物流',
  'machine-process-compatibility': '机器和工艺适配',
  'compliance-documentation': '应用合规文件',
  'security-origination-control': '防伪制版、所有权和权限',
  'repeat-order-change-control': '复单公差和变更控制',
  global: '全球',
  china: '中国',
  'southeast-asia': '东南亚',
  europe: '欧洲',
  'north-america': '北美',
  'latin-america': '拉美',
  'middle-east-africa': '中东和非洲',
  PK: 'PK 棕背纸盒彩盒系列',
  PC: 'PC 塑料和冷烫系列',
  PLPY: 'PL/PY 颜料箔系列',
  DIGITAL: '数码和冷烫系列',
  'standard-paper-hot': '标准纸张盒彩热烫',
  'textured-paper-hot': '纹理纸和困难纸张热烫',
  'laminated-paper-hot': '覆膜纸板热烫',
  'paper-label-hot': '纸质标签热烫',
  'film-label-hot': '薄膜标签热烫',
  'rigid-plastic-hot': '硬质塑料件热烫',
  'low-surface-energy-plastic-hot': 'PP/PE 低表面能塑料热烫',
  'leather-hot': '天然和合成皮革热烫',
  'pigment-paper-hot': '纸张纸板颜料箔热烫',
  'coated-paper-cold': '涂布纸和彩盒冷烫',
  'label-cold-transfer': '纸质和薄膜标签冷烫',
  'digital-toner-enhancement': '数码碳粉增效烫金',
  'digital-uv-enhancement': '数码或丝印 UV 增效烫金',
  'decorative-holographic-transfer': '装饰性连续镭射转印',
  'registered-security-hologram': '定位防伪镭射转印',
  'coated-glass-specialty-hot': '涂层玻璃特殊热烫',
});

function cnLabel(item, fallback = '') {
  if (!item) return fallback;
  return item.cn ?? item.labelCn ?? CN_LABELS[item.id] ?? fallback ?? item.label ?? item.id;
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
  return [...index.tests.values()].filter((testMethod) => {
    const supportsDefect = defectId
      ? (testMethod.applicableDefectIds ?? []).includes(defectId)
      : true;
    return supportsDefect && (!defectId || groupTestIds.size === 0 || groupTestIds.has(testMethod.id));
  });
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

function dimensionItem(index, field, value) {
  if (!value) return null;
  const maps = {
    industryId: index.industries,
    artworkTypeId: index.artworkTypes,
    defectId: index.defects,
    testId: index.tests,
    diagnosticVariableId: index.diagnosticVariables,
    equipmentId: index.equipment,
    procurementConcernId: index.procurementConcerns,
    regionId: index.regions,
    leftProcessId: index.processes,
    rightProcessId: index.processes,
  };
  const mapped = maps[field]?.get(value);
  if (mapped) return mapped;
  const compliance = COMPLIANCE_FOCI.find((item) => item.id === value);
  if (compliance) return { id: compliance.id, label: compliance.label, cn: compliance.cn };
  const sustainability = SUSTAINABILITY_FOCI.find((item) => item.id === value);
  if (sustainability) return { id: sustainability.id, label: sustainability.label, cn: sustainability.cn };
  return { id: value, label: value };
}

function uniqueContextItems(items) {
  const seen = new Set();
  const result = [];
  for (const item of items.filter(Boolean)) {
    const key = item.id ?? item.label;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

function titleContext(index, tuple, dimensions = {}) {
  if (!tuple) return { en: '', cn: '' };
  const items = uniqueContextItems([
    tuple.surfaceTreatment,
    tuple.process,
    tuple.group,
    ...[
      'industryId',
      'artworkTypeId',
      'defectId',
      'testId',
      'diagnosticVariableId',
      'equipmentId',
      'procurementConcernId',
      'regionId',
      'complianceFocus',
      'sustainabilityFocus',
    ].map((field) => dimensionItem(index, field, dimensions[field])),
  ]);
  return {
    en: items.map((item) => label(item)).join(' / '),
    cn: items.map((item) => cnLabel(item, label(item))).join(' / '),
  };
}

function withTitleContext(title, context) {
  if (!context.en && !context.cn) return title;
  return {
    en: context.en ? `${title.en} - ${context.en}` : title.en,
    cn: context.cn ? `${title.cn}（${context.cn}）` : title.cn,
  };
}

function withQuestionContext(question, context) {
  if (!context.en && !context.cn) return question;
  const enQuestion = context.en
    ? `${question.en.replace(/\?$/, '')} under ${context.en}?`
    : question.en;
  const cnQuestion = context.cn
    ? `${question.cn.replace(/[？?]$/, '')}（适用条件：${context.cn}）？`
    : question.cn;
  return { en: enQuestion, cn: cnQuestion };
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
  const dimensions = details.dimensions ?? {};
  const context = titleContext(index, tuple, dimensions);
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
    title: withTitleContext(details.title, context),
    slug: details.slug,
    topic_question: withQuestionContext(details.topicQuestion, context),
    difference: details.difference,
    evidenceNeeded: details.evidenceNeeded ?? makeEvidence(index, tuple, details),
    sourceKeys,
    relatedProducts: [...new Set(tuple?.group?.productSeriesIds ?? details.relatedProducts ?? [])],
    tags: details.tags ?? [],
    substrateId: tuple?.substrateId,
    surfaceTreatmentId: tuple?.surfaceTreatmentId,
    processId: tuple?.processId,
    ...dimensions,
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
        cn: `${cnLabel(subject.item, subjectName)}在烫金中的含义`,
      },
      slug: slugify(`what ${subjectName} means foil stamping`),
      topicQuestion: {
        en: `What does ${lowerFirst(subjectName)} mean for a foil stamping project?`,
        cn: `${cnLabel(subject.item, subjectName)}对烫金项目意味着什么？`,
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
          cn: `${cnLabel(tuple.substrate, substrateName)}选择${cnLabel(left, label(left))}还是${cnLabel(right, label(right))}`,
        },
        slug: slugify(`${label(left)} vs ${label(right)} ${substrateName}`),
        topicQuestion: {
          en: `Should ${substrateName} use ${lowerFirst(label(left))} or ${lowerFirst(label(right))}?`,
          cn: `${cnLabel(tuple.substrate, substrateName)}应选择${cnLabel(left, label(left))}还是${cnLabel(right, label(right))}？`,
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
            cn: `${cnLabel(tuple.substrate, substrateName)}${cnLabel(artwork, artwork.label)}烫金膜选型`,
          },
          slug: slugify(`foil grade selection ${artwork.label} ${substrateName} ${label(tuple.surfaceTreatment)}`),
          topicQuestion: {
            en: `Which foil selection checks matter for ${lowerFirst(artwork.label)} on ${lowerFirst(substrateName)}?`,
            cn: `${cnLabel(tuple.substrate, substrateName)}${cnLabel(artwork, artwork.label)}选膜时要确认哪些条件？`,
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
    for (const defect of taxonomy.defects ?? []) {
      const testMethods = applicableTests(index, tuple.group, defect.id).slice(0, 3);
      if (testMethods.length === 0) continue;
      const substrateName = label(tuple.substrate);
      const evidenceLabels = testMethods.map((testMethod) => testMethod.label);
      candidates.push(buildCandidate(index, tuple, {
        cluster: 'troubleshooting',
        intent: 'troubleshooting',
        buyerStage: 'problem-solving',
        title: {
          en: `Why ${defect.label} Happens on ${substrateName}`,
          cn: `${cnLabel(tuple.substrate, substrateName)}出现${cnLabel(defect, defect.label)}的原因`,
        },
        slug: slugify(`why ${defect.label} happens ${substrateName} ${label(tuple.process)} ${label(tuple.surfaceTreatment)}`),
        topicQuestion: {
          en: `How should a converter diagnose ${lowerFirst(defect.label)} on ${lowerFirst(substrateName)}?`,
          cn: `${cnLabel(tuple.substrate, substrateName)}出现${cnLabel(defect, defect.label)}时应如何排查？`,
        },
        difference: `Diagnoses ${defect.label} for a defined substrate, surface, and process instead of splitting the same user problem by test method.`,
        evidenceNeeded: [
          'Production-representative substrate, machine, artwork, and speed trial',
          ...evidenceLabels,
          'Supplier grade selection notes and recorded pass/fail criteria',
        ],
        dimensions: {
          defectId: defect.id,
        },
        sourceTopicKeys: [defect.id, ...testMethods.map((testMethod) => testMethod.id)],
        tags: ['troubleshooting', defect.id, ...testMethods.map((testMethod) => testMethod.id)],
      }));
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
            cn: `${cnLabel(tuple.substrate, substrateName)}${cnLabel(tuple.process, label(tuple.process))}的${cnLabel(variable, variable.label)}检查`,
          },
          slug: slugify(`${variable.label} checks ${label(tuple.process)} ${substrateName} ${label(tuple.surfaceTreatment)} ${equipment?.label ?? ''}`),
          topicQuestion: {
            en: `How should ${lowerFirst(variable.label)} be checked before approving ${lowerFirst(substrateName)}?`,
            cn: `${cnLabel(tuple.substrate, substrateName)}打样前如何检查${cnLabel(variable, variable.label)}？`,
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
            cn: `${cnLabel(tuple.substrate, substrateName)}烫金确认中的${cnLabel(testMethod, testMethod.label)}`,
          },
          slug: slugify(`${testMethod.label} ${substrateName} foil approval ${defect?.label ?? ''} ${label(tuple.surfaceTreatment)}`),
          topicQuestion: {
            en: `When is ${lowerFirst(testMethod.label)} useful for ${lowerFirst(substrateName)} foil approval?`,
            cn: `${cnLabel(tuple.substrate, substrateName)}烫金确认何时使用${cnLabel(testMethod, testMethod.label)}？`,
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
            cn: `${cnLabel(industry, industry.label)}${cnLabel(tuple.substrate, substrateName)}烫金应用`,
          },
          slug: slugify(`${industry.label} foil stamping ${substrateName} ${artwork.label} ${label(tuple.surfaceTreatment)}`),
          topicQuestion: {
            en: `What should ${lowerFirst(industry.label)} confirm before foil stamping ${lowerFirst(substrateName)}?`,
            cn: `${cnLabel(industry, industry.label)}在${cnLabel(tuple.substrate, substrateName)}烫金前要确认什么？`,
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
            cn: `${cnLabel(equipment, equipment.label)}用于${cnLabel(tuple.substrate, substrateName)}烫金的适配`,
          },
          slug: slugify(`${equipment.label} fit ${substrateName} foil work ${artwork.label} ${label(tuple.surfaceTreatment)}`),
          topicQuestion: {
            en: `Is ${lowerFirst(equipment.label)} suitable for ${lowerFirst(substrateName)} with ${lowerFirst(artwork.label)}?`,
            cn: `${cnLabel(equipment, equipment.label)}是否适合${cnLabel(tuple.substrate, substrateName)}${cnLabel(artwork, artwork.label)}？`,
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
            cn: `${cnLabel(tuple.substrate, substrateName)}烫金膜${cnLabel(concern, concern.label)}清单`,
          },
          slug: slugify(`${concern.label} checklist ${substrateName} foil ${label(tuple.process)} ${label(tuple.surfaceTreatment)} ${region.label}`),
          topicQuestion: {
            en: `What should buyers ask about ${lowerFirst(concern.label)} for ${lowerFirst(substrateName)} foil?`,
            cn: `采购${cnLabel(tuple.substrate, substrateName)}烫金膜时如何确认${cnLabel(concern, concern.label)}？`,
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
            cn: `${cnLabel(tuple.substrate, substrateName)}烫金项目的${focus.cn}`,
          },
          slug: slugify(`${focus.label} ${substrateName} foil projects ${label(tuple.process)} ${label(tuple.surfaceTreatment)} ${region.label}`),
          topicQuestion: {
            en: `Which ${focus.label} should be confirmed for ${lowerFirst(substrateName)} foil projects?`,
            cn: `${cnLabel(tuple.substrate, substrateName)}烫金项目需要确认哪些${focus.cn}？`,
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
          cn: `${cnLabel(tuple.substrate, substrateName)}烫金确认中的${focus.cn}`,
        },
        slug: slugify(`${focus.label} ${substrateName} foil approval ${label(tuple.process)} ${label(tuple.surfaceTreatment)}`),
        topicQuestion: {
          en: `How can ${lowerFirst(focus.label)} be handled while approving ${lowerFirst(substrateName)} foil?`,
          cn: `${cnLabel(tuple.substrate, substrateName)}烫金确认时如何处理${focus.cn}？`,
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
            cn: `${cnLabel(tuple.substrate, substrateName)}${cnLabel(artwork, artwork.label)}烫金印前规则`,
          },
          slug: slugify(`prepress rules ${artwork.label} ${substrateName} ${defect.label} ${label(tuple.process)} ${label(tuple.surfaceTreatment)}`),
          topicQuestion: {
            en: `How should ${lowerFirst(artwork.label)} be prepared to reduce ${lowerFirst(defect.label)} on ${lowerFirst(substrateName)}?`,
            cn: `${cnLabel(tuple.substrate, substrateName)}${cnLabel(artwork, artwork.label)}如何做印前准备以减少${cnLabel(defect, defect.label)}？`,
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
  const record = {
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
  if (record.related_products.length === 0) {
    record.informational_only_reason = 'No confirmed PINTE product-series mapping is available yet; keep this as a qualification or buyer-education topic until evidence supports a product recommendation.';
  }
  return record;
}

function groupBy(values, keyFn) {
  const groups = new Map();
  for (const value of values) {
    const key = keyFn(value);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(value);
  }
  return groups;
}

function takeBalancedByIntent(candidates, targetCount, selectedKeys) {
  const buckets = groupBy(candidates, (candidate) => candidate.intent);
  const orderedIntents = [...buckets.keys()].sort((left, right) => {
    const leftBest = buckets.get(left)?.[0]?.score ?? 0;
    const rightBest = buckets.get(right)?.[0]?.score ?? 0;
    return rightBest - leftBest || left.localeCompare(right);
  });
  const indexes = new Map(orderedIntents.map((intent) => [intent, 0]));
  const selected = [];
  let madeProgress = true;

  while (selected.length < targetCount && madeProgress) {
    madeProgress = false;
    for (const intent of orderedIntents) {
      if (selected.length >= targetCount) break;
      const bucket = buckets.get(intent) ?? [];
      let index = indexes.get(intent) ?? 0;
      while (index < bucket.length && selectedKeys.has(bucket[index].intent_key)) index += 1;
      indexes.set(intent, index + 1);
      const candidate = bucket[index];
      if (!candidate) continue;
      selected.push(candidate);
      selectedKeys.add(candidate.intent_key);
      madeProgress = true;
    }
  }

  return selected;
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
    selected.push(...takeBalancedByIntent(
      sorted.filter((item) => item.cluster === cluster),
      quota,
      selectedKeys,
    ));
  }

  const missingIntentCandidates = [...new Set(sorted.map((candidate) => candidate.intent))]
    .sort()
    .filter((intent) => !selected.some((candidate) => candidate.intent === intent))
    .map((intent) => sorted.find((item) => item.intent === intent && !selectedKeys.has(item.intent_key)))
    .filter(Boolean);
  for (const candidate of missingIntentCandidates) {
    if (selected.length >= count) break;
    selected.push(candidate);
    selectedKeys.add(candidate.intent_key);
  }

  selected.push(...takeBalancedByIntent(sorted, count - selected.length, selectedKeys));

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
