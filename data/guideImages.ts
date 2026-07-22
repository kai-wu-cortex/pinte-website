import type { GuideLang } from './geoGuides';

export interface GuideImageAsset {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: Record<GuideLang, string>;
  readonly caption: Record<GuideLang, string>;
}

export const GUIDE_IMAGE_ASSETS = {
  selection: {
    src: '/images/guides/hot-stamping-foil-selection-guide-1200x675.webp',
    width: 1200,
    height: 675,
    alt: {
      en: 'Hot stamping foil rolls with paper, plastic, and leather substrate samples for foil selection',
      cn: '烫金膜卷料与纸张、塑料、皮革底材样品，用于烫金膜选型',
    },
    caption: {
      en: 'Foil selection should start from substrate, finish, machine process, and required durability checks.',
      cn: '烫金膜选型应从底材、表面效果、设备工艺和成品耐性测试一起判断。',
    },
  },
  troubleshooting: {
    src: '/images/guides/hot-stamping-foil-troubleshooting-guide-1200x675.webp',
    width: 1200,
    height: 675,
    alt: {
      en: 'Hot stamping foil defect inspection with tape test, rub cloth, magnifier, and stamped packaging samples',
      cn: '烫金膜缺陷检查场景，包含胶带测试、耐磨布、放大镜和烫印包装样品',
    },
    caption: {
      en: 'Defect checks should separate adhesion, transfer, edge definition, registration, and durability causes.',
      cn: '故障排查应把附着、转移、边缘、套准和耐性原因分开判断。',
    },
  },
  sampling: {
    src: '/images/guides/hot-stamping-foil-sampling-checklist-1200x675.webp',
    width: 1200,
    height: 675,
    alt: {
      en: 'Hot stamping foil sampling workflow from substrate card and foil roll to press test and retained sample',
      cn: '烫金膜打样流程，从底材样卡、卷料到烫印测试和留样确认',
    },
    caption: {
      en: 'A useful sample plan records substrate, foil, machine settings, test method, and retained approval sample.',
      cn: '有效打样计划应记录底材、膜材、机台参数、测试方法和确认留样。',
    },
  },
  paperCartonPackaging: {
    src: '/images/guides/inline/hot-stamping-foil-paper-carton-packaging-1200x675.webp',
    width: 1200,
    height: 675,
    alt: {
      en: 'Paper carton packaging samples with gold hot stamping foil details on rigid boxes and folding cartons',
      cn: '纸盒包装样品展示刚性盒与折叠纸盒上的金色烫金膜细节',
    },
    caption: {
      en: 'Paper and carton jobs should verify board surface, die detail, foil release, and post-process durability together.',
      cn: '纸张与纸盒订单应同时验证纸板表面、版纹细节、转移释放和后加工耐性。',
    },
  },
  cosmeticPackaging: {
    src: '/images/guides/inline/hot-stamping-foil-cosmetic-packaging-1200x675.webp',
    width: 1200,
    height: 675,
    alt: {
      en: 'Cosmetic packaging samples with mirror gold, matte gold, and holographic hot stamping foil effects',
      cn: '化妆品包装样品展示镜面金、哑金和镭射烫金膜效果',
    },
    caption: {
      en: 'Cosmetic packaging usually needs tighter control of gloss, fine lines, edge cleanliness, and repeat-batch color stability.',
      cn: '化妆品包装通常需要更严格控制光泽、细线、边缘洁净度和复购批次色差。',
    },
  },
  processComparison: {
    src: '/images/guides/inline/hot-foil-cold-foil-holographic-process-comparison-1200x675.webp',
    width: 1200,
    height: 675,
    alt: {
      en: 'Comparison of flatbed hot stamping, narrow web cold foil transfer, and holographic foil registration processes',
      cn: '平压热烫、窄幅冷烫和镭射定位烫印工艺对比',
    },
    caption: {
      en: 'Process choice changes the adhesive system, machine path, registration risk, and foil grade requirements.',
      cn: '工艺路线会改变胶黏体系、设备路径、套准风险和膜材型号要求。',
    },
  },
  labelColdFoil: {
    src: '/images/guides/inline/narrow-web-cold-foil-label-printing-1200x675.webp',
    width: 1200,
    height: 675,
    alt: {
      en: 'Narrow web cold foil label printing press with metallic foil rolls and roll-fed label stock',
      cn: '窄幅冷烫标签印刷设备，包含金属箔卷和卷筒标签材料',
    },
    caption: {
      en: 'Label and narrow-web cold foil work depends on web tension, UV adhesive, nip pressure, and surface treatment consistency.',
      cn: '标签与窄幅冷烫取决于张力、UV 胶、压合压力和表面处理稳定性。',
    },
  },
  substrateCompatibility: {
    src: '/images/guides/inline/hot-stamping-foil-substrate-compatibility-1200x675.webp',
    width: 1200,
    height: 675,
    alt: {
      en: 'Hot stamping foil compatibility test swatches across paperboard, film, leather, varnished card, and plastic substrates',
      cn: '烫金膜兼容性测试样片，覆盖纸板、薄膜、皮革、上光卡纸和塑料底材',
    },
    caption: {
      en: 'Substrate compatibility should be confirmed with real surface energy, coating, varnish, lamination, and adhesion tests.',
      cn: '底材兼容性应结合真实表面能、涂层、光油、覆膜和附着测试确认。',
    },
  },
  procurementSpecifications: {
    src: '/images/guides/inline/hot-stamping-foil-procurement-specifications-1200x675.webp',
    width: 1200,
    height: 675,
    alt: {
      en: 'Hot stamping foil procurement specification desk with foil rolls, core tubes, gauges, sample cards, and cartons',
      cn: '烫金膜采购规格确认场景，包含膜卷、纸芯、量具、样卡和包装纸箱',
    },
    caption: {
      en: 'Procurement specs should lock roll width, length, core, winding direction, batch traceability, packing, and sample approval records.',
      cn: '采购规格应锁定宽幅、长度、纸芯、收卷方向、批次追溯、包装和确认样记录。',
    },
  },
} as const satisfies Record<string, GuideImageAsset>;

interface GuideImageContext {
  readonly slug?: string;
  readonly cluster?: string;
  readonly intent?: string;
  readonly primaryKeyword?: string;
}

export const resolveGuideImageAsset = ({
  slug = '',
  cluster = '',
  intent = '',
  primaryKeyword = '',
}: GuideImageContext): GuideImageAsset => {
  const haystack = `${slug} ${cluster} ${intent} ${primaryKeyword}`.toLowerCase();

  if (haystack.includes('troubleshooting')
    || haystack.includes('defect')
    || haystack.includes('failure')
    || haystack.includes('peel')
    || haystack.includes('adhesion')
    || haystack.includes('blur')
    || haystack.includes('register')
    || haystack.includes('scratch')
    || haystack.includes('rub')
    || haystack.includes('掉')
    || haystack.includes('故障')
    || haystack.includes('偏移')
    || haystack.includes('不牢')) {
    return GUIDE_IMAGE_ASSETS.troubleshooting;
  }

  if (haystack.includes('sampling')
    || haystack.includes('checklist')
    || haystack.includes('parameter')
    || haystack.includes('temperature')
    || haystack.includes('pressure')
    || haystack.includes('dwell')
    || haystack.includes('speed')
    || haystack.includes('nip')
    || haystack.includes('test')
    || haystack.includes('打样')
    || haystack.includes('测试')
    || haystack.includes('参数')
    || haystack.includes('温度')
    || haystack.includes('压力')) {
    return GUIDE_IMAGE_ASSETS.sampling;
  }

  return GUIDE_IMAGE_ASSETS.selection;
};

export const resolveGuideInlineImageAssets = (context: GuideImageContext): readonly GuideImageAsset[] => {
  const {
    slug = '',
    cluster = '',
    intent = '',
    primaryKeyword = '',
  } = context;
  const haystack = `${slug} ${cluster} ${intent} ${primaryKeyword}`.toLowerCase();

  if (haystack.includes('cosmetic') || haystack.includes('化妆')) {
    return [GUIDE_IMAGE_ASSETS.cosmeticPackaging, GUIDE_IMAGE_ASSETS.substrateCompatibility];
  }

  if (haystack.includes('paper-carton-packaging')
    || haystack.includes('folding-carton')
    || haystack.includes('paper-box')
    || haystack.includes('carton')
    || haystack.includes('paperboard')
    || haystack.includes('paper label')
    || haystack.includes('纸')
    || haystack.includes('纸盒')) {
    return [GUIDE_IMAGE_ASSETS.paperCartonPackaging, GUIDE_IMAGE_ASSETS.substrateCompatibility];
  }

  if (haystack.includes('label')
    || haystack.includes('narrow-web')
    || haystack.includes('cold-foil')
    || haystack.includes('cold foil')
    || haystack.includes('标签')
    || haystack.includes('冷烫')) {
    return [GUIDE_IMAGE_ASSETS.labelColdFoil, GUIDE_IMAGE_ASSETS.processComparison];
  }

  if (haystack.includes('process-comparison')
    || haystack.includes(' vs ')
    || haystack.includes('-vs-')
    || haystack.includes('comparison')
    || haystack.includes('对比')) {
    return [GUIDE_IMAGE_ASSETS.processComparison, GUIDE_IMAGE_ASSETS.paperCartonPackaging];
  }

  if (haystack.includes('procurement')
    || haystack.includes('specification')
    || haystack.includes('lead-time')
    || haystack.includes('moq')
    || haystack.includes('roll-width')
    || haystack.includes('winding')
    || haystack.includes('采购')
    || haystack.includes('规格')
    || haystack.includes('起订')
    || haystack.includes('交期')) {
    return [GUIDE_IMAGE_ASSETS.procurementSpecifications, GUIDE_IMAGE_ASSETS.sampling];
  }

  if (haystack.includes('plastic')
    || haystack.includes('leather')
    || haystack.includes('substrate')
    || haystack.includes('compatibility')
    || haystack.includes('holographic')
    || haystack.includes('security')
    || haystack.includes('塑料')
    || haystack.includes('皮革')
    || haystack.includes('底材')
    || haystack.includes('镭射')
    || haystack.includes('防伪')) {
    return [GUIDE_IMAGE_ASSETS.substrateCompatibility, GUIDE_IMAGE_ASSETS.processComparison];
  }

  if (haystack.includes('troubleshooting')
    || haystack.includes('defect')
    || haystack.includes('failure')
    || haystack.includes('adhesion')
    || haystack.includes('scratch')
    || haystack.includes('rub')
    || haystack.includes('故障')
    || haystack.includes('掉')
    || haystack.includes('不牢')) {
    return [GUIDE_IMAGE_ASSETS.troubleshooting, GUIDE_IMAGE_ASSETS.sampling];
  }

  if (haystack.includes('parameter')
    || haystack.includes('testing')
    || haystack.includes('sampling')
    || haystack.includes('checklist')
    || haystack.includes('temperature')
    || haystack.includes('pressure')
    || haystack.includes('speed')
    || haystack.includes('参数')
    || haystack.includes('测试')
    || haystack.includes('打样')) {
    return [GUIDE_IMAGE_ASSETS.sampling, GUIDE_IMAGE_ASSETS.procurementSpecifications];
  }

  return [GUIDE_IMAGE_ASSETS.paperCartonPackaging, GUIDE_IMAGE_ASSETS.substrateCompatibility];
};
