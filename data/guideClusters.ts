import type { GuideLang } from './geoGuides';

export const GUIDE_CLUSTER_IDS = [
  'fundamentals-terminology',
  'paper-carton-packaging',
  'cosmetic-packaging',
  'wine-gift-packaging',
  'label-printing',
  'plastics',
  'leather',
  'holographic-security',
  'process-comparison',
  'troubleshooting',
  'parameters-testing',
  'procurement-specifications',
] as const;

export type GuideClusterId = (typeof GUIDE_CLUSTER_IDS)[number];

export interface GuideCluster {
  readonly id: GuideClusterId;
  readonly order: number;
  readonly label: Record<GuideLang, string>;
  readonly description: Record<GuideLang, string>;
}

export const GUIDE_CLUSTERS: readonly GuideCluster[] = [
  {
    id: 'fundamentals-terminology',
    order: 1,
    label: { en: 'Fundamentals and Terminology', cn: '基础知识与术语' },
    description: {
      en: 'Understand foil construction, common names, material layers, and selection basics.',
      cn: '了解烫金膜结构、常用名称、材料层次和基础选型方法。',
    },
  },
  {
    id: 'paper-carton-packaging',
    order: 2,
    label: { en: 'Paper and Carton Packaging', cn: '纸张与纸盒包装' },
    description: {
      en: 'Choose foil for coated paper, folding cartons, printed boxes, and textured board.',
      cn: '选择适用于铜版纸、折叠纸盒、印刷彩盒和纹理纸板的烫金膜。',
    },
  },
  {
    id: 'cosmetic-packaging',
    order: 3,
    label: { en: 'Cosmetic Packaging', cn: '化妆品包装' },
    description: {
      en: 'Plan decorative finishes for cosmetic cartons, containers, closures, and coated parts.',
      cn: '规划化妆品纸盒、容器、瓶盖和涂层部件的装饰效果。',
    },
  },
  {
    id: 'wine-gift-packaging',
    order: 4,
    label: { en: 'Wine and Gift Packaging', cn: '酒类与礼品包装' },
    description: {
      en: 'Specify finishes for wine labels, presentation boxes, premium cartons, and gift packaging.',
      cn: '为酒标、展示盒、高档纸盒和礼品包装确定合适的装饰效果。',
    },
  },
  {
    id: 'label-printing',
    order: 5,
    label: { en: 'Label Printing', cn: '标签印刷' },
    description: {
      en: 'Match foil and process settings to label facestocks, coatings, varnishes, and artwork.',
      cn: '根据标签面材、涂层、光油和图稿匹配烫金膜与工艺设置。',
    },
  },
  {
    id: 'plastics',
    order: 6,
    label: { en: 'Plastics', cn: '塑料制品' },
    description: {
      en: 'Select and test foil for molded parts, rigid plastics, films, and coated plastic surfaces.',
      cn: '为注塑件、硬质塑料、薄膜和涂层塑料表面选择并测试烫金膜。',
    },
  },
  {
    id: 'leather',
    order: 7,
    label: { en: 'Leather', cn: '皮革制品' },
    description: {
      en: 'Evaluate transfer, detail, and durability on natural leather, synthetic leather, and leatherette.',
      cn: '评估天然皮革、合成革和充皮纸上的转移、细节与耐用性。',
    },
  },
  {
    id: 'holographic-security',
    order: 8,
    label: { en: 'Holographic and Security Effects', cn: '镭射与防伪效果' },
    description: {
      en: 'Compare holographic patterns, optical effects, registration needs, and security applications.',
      cn: '比较镭射图案、光学效果、套准要求和防伪应用。',
    },
  },
  {
    id: 'process-comparison',
    order: 9,
    label: { en: 'Process Comparisons', cn: '工艺对比' },
    description: {
      en: 'Compare hot foil, cold foil, and other transfer methods by equipment, finish, and production needs.',
      cn: '根据设备、效果和生产需求比较热烫、冷烫及其他转移工艺。',
    },
  },
  {
    id: 'troubleshooting',
    order: 10,
    label: { en: 'Troubleshooting', cn: '故障排查' },
    description: {
      en: 'Diagnose adhesion, peeling, incomplete transfer, blurred detail, and production variation.',
      cn: '排查附着不牢、掉金、转移不完整、细节发糊和生产波动。',
    },
  },
  {
    id: 'parameters-testing',
    order: 11,
    label: { en: 'Parameters and Testing', cn: '工艺参数与测试' },
    description: {
      en: 'Set sampling ranges and evaluate temperature, pressure, dwell, adhesion, and durability.',
      cn: '设置打样范围并评估温度、压力、停留时间、附着力和耐用性。',
    },
  },
  {
    id: 'procurement-specifications',
    order: 12,
    label: { en: 'Procurement and Specifications', cn: '采购与规格' },
    description: {
      en: 'Prepare enquiries, compare suppliers, and confirm roll, sample, quality, and delivery requirements.',
      cn: '准备询价、比较供应商，并确认卷料、样品、质量和交付要求。',
    },
  },
];

export const LEGACY_GUIDE_CLUSTERS: Readonly<Record<string, GuideClusterId>> = {
  'hot-stamping-foil-buying-guide': 'procurement-specifications',
  'paper-box-packaging-hot-stamping-foil-guide': 'paper-carton-packaging',
  'hot-stamping-troubleshooting': 'troubleshooting',
  'hot-foil-vs-cold-foil-vs-holographic': 'process-comparison',
  'cosmetic-packaging-foil-guide': 'cosmetic-packaging',
  'hot-stamping-foil-structure-selection-guide': 'fundamentals-terminology',
  'cosmetic-packaging-hot-stamping-troubleshooting': 'cosmetic-packaging',
  'hot-foil-vs-cold-foil-cosmetic-packaging': 'process-comparison',
  'hot-stamping-foil-substrate-compatibility-and-compliance': 'parameters-testing',
  'hot-stamping-sampling-checklist': 'parameters-testing',
  'hot-stamping-foil-community-qa-citation-guide': 'procurement-specifications',
  'hot-stamping-foil-buyer-questions': 'procurement-specifications',
  'hot-stamping-transfer-foil-product-introduction': 'fundamentals-terminology',
};

const clusterIdSet = new Set<string>(GUIDE_CLUSTER_IDS);
const GENERAL_CLUSTER_ID: GuideClusterId = 'fundamentals-terminology';

export const resolveGuideClusterId = (cluster: string | undefined): GuideClusterId => {
  if (!cluster || cluster === 'general') return GENERAL_CLUSTER_ID;
  return clusterIdSet.has(cluster) ? cluster as GuideClusterId : GENERAL_CLUSTER_ID;
};
