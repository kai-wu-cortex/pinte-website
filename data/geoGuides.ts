export type GuideLang = 'cn' | 'en';

export interface GeoGuide {
  slug: string;
  priority: number;
  title: Record<GuideLang, string>;
  metaDescription: Record<GuideLang, string>;
  primaryKeyword: Record<GuideLang, string>;
  secondaryKeywords: Record<GuideLang, string[]>;
  audience: Record<GuideLang, string>;
  answer: Record<GuideLang, string>;
  factors: Array<{
    label: Record<GuideLang, string>;
    guidance: Record<GuideLang, string>;
  }>;
  selectionTable?: Array<{
    factor: Record<GuideLang, string>;
    confirm: Record<GuideLang, string>;
    why: Record<GuideLang, string>;
    ask: Record<GuideLang, string>;
  }>;
  processNotes?: Array<{
    title: Record<GuideLang, string>;
    body: Record<GuideLang, string>;
  }>;
  substrateFit: Array<{
    substrate: Record<GuideLang, string>;
    recommendedFoil: string;
    note: Record<GuideLang, string>;
  }>;
  troubleshooting: Array<{
    issue: Record<GuideLang, string>;
    likelyCause: Record<GuideLang, string>;
    action: Record<GuideLang, string>;
  }>;
  samplingChecklist: Record<GuideLang, string[]>;
  faqs: Array<{
    question: Record<GuideLang, string>;
    answer: Record<GuideLang, string>;
  }>;
  researchMatrix?: Array<{
    scenario: Record<GuideLang, string>;
    question: Record<GuideLang, string>;
    intent: Record<GuideLang, string>;
    concern: Record<GuideLang, string>;
    sources: Record<GuideLang, string>;
    pageType: Record<GuideLang, string>;
    conversionScore: number;
    citationScore: number;
    priority: string;
  }>;
  pageRecommendations?: Record<GuideLang, Array<{
    pageType: string;
    questions: string;
  }>>;
  sourceReferences?: Array<{
    label: string;
    title: string;
    url: string;
  }>;
  relatedRoutes: string[];
}

export const GEO_GUIDES: GeoGuide[] = [
  {
    slug: 'hot-stamping-foil-buying-guide',
    priority: 1,
    title: {
      en: 'Hot Stamping Foil Buying Guide: How to Choose Foil for Paper, Plastic, and Leather',
      cn: '烫金膜采购指南：纸张、塑料、皮革底材如何选择',
    },
    metaDescription: {
      en: 'A practical B2B buying guide for choosing hot stamping foil by substrate, application, stamping parameters, sample testing, and supplier risk.',
      cn: '面向包装厂、印刷厂和皮具厂的烫金膜采购指南，按底材、用途、参数、打样测试和供应商风险选择合适烫金箔。',
    },
    primaryKeyword: {
      en: 'hot stamping foil buying guide',
      cn: '烫金膜采购指南',
    },
    secondaryKeywords: {
      en: ['how to choose hot stamping foil', 'hot stamping foil for paper', 'hot stamping foil for plastic', 'leather hot stamping foil'],
      cn: ['烫金膜怎么选', '纸张烫金膜', '塑料烫金膜', '皮革烫金膜'],
    },
    audience: {
      en: 'Packaging converters, print factories, gift box makers, cosmetics packaging buyers, label printers, and leather goods manufacturers.',
      cn: '包装厂、印刷厂、礼盒厂、化妆品包材采购、标签印刷厂和皮具工厂。',
    },
    answer: {
      en: 'Choose hot stamping foil by matching the foil adhesive layer to the substrate first, then validate temperature, pressure, dwell time, release, edge sharpness, and adhesion through sampling. For B2B procurement, do not buy by color alone: confirm substrate, machine type, stamping area, post-treatment, compliance needs, roll width, MOQ, and supplier sample support before bulk ordering.',
      cn: '采购烫金膜时，应先按底材匹配胶层，再通过打样确认温度、压力、停留时间、离型、边缘清晰度和附着力。B2B 采购不要只看颜色，批量下单前必须确认底材、设备类型、烫印面积、后处理要求、环保认证、宽幅、起订量和供应商打样能力。',
    },
    factors: [
      {
        label: { en: 'Substrate match', cn: '底材匹配' },
        guidance: { en: 'Paper, plastic, leather, UV varnish, and textured boards need different adhesive/release behavior.', cn: '纸张、塑料、皮革、UV 光油和纹理纸需要不同的胶层和离型表现。' },
      },
      {
        label: { en: 'Stamping parameters', cn: '烫印参数' },
        guidance: { en: 'Use supplier ranges as a starting point, then tune heat, pressure, speed, and dwell time on the real substrate.', cn: '供应商参数只能作为起点，最终要在真实底材上调试温度、压力、速度和停留时间。' },
      },
      {
        label: { en: 'Procurement risk', cn: '采购风险' },
        guidance: { en: 'Ask for sample rolls, color cards, test reports, width options, and repeat-order stability before bulk purchase.', cn: '批量采购前索取样卷、色卡、测试报告、分切宽幅选项和复购批次稳定性说明。' },
      },
    ],
    substrateFit: [
      { substrate: { en: 'Textured paper / rough board', cn: '粗纹纸 / 粗糙纸板' }, recommendedFoil: 'PK Brown Back Series', note: { en: 'Higher filling and anti-oxidation performance for uneven or heavy-ink surfaces.', cn: '适合不平整和重油墨表面，填充性与抗氧化表现更稳。' } },
      { substrate: { en: 'ABS, PS, PVC, acrylic, cosmetic plastic', cn: 'ABS、PS、PVC、亚克力、化妆品塑胶' }, recommendedFoil: 'PC Plastic/Cold Foils', note: { en: 'Use plastic-grade foil and validate alcohol resistance for cosmetic packaging.', cn: '需使用塑胶专用箔，并验证化妆品包装常见耐酒精要求。' } },
      { substrate: { en: 'Colored card, gift box paper, leatherette', cn: '彩色卡纸、礼盒纸、充皮纸' }, recommendedFoil: 'PL/PY Pigment Foils', note: { en: 'Pigment foil helps when opaque color coverage is more important than metallic shine.', cn: '当高遮盖纯色比金属光泽更重要时，优先考虑颜料箔。' } },
      { substrate: { en: 'UV varnish / digital enhancement layer', cn: 'UV 光油 / 数码增效层' }, recommendedFoil: 'Digital Cold Foil', note: { en: 'Best for short-run, variable, or plate-free enhancement jobs.', cn: '适合短单、可变数据和免制版增效工艺。' } },
    ],
    troubleshooting: [
      { issue: { en: 'Poor adhesion or foil peeling', cn: '附着不牢或掉金' }, likelyCause: { en: 'Wrong adhesive layer, low pressure, insufficient heat, contaminated substrate.', cn: '胶层不匹配、压力不足、温度不够或底材表面污染。' }, action: { en: 'Raise pressure gradually, clean substrate, test plastic/paper-specific foil, and run tape adhesion checks.', cn: '逐步提高压力，清洁底材，测试纸张/塑胶专用箔，并做胶带附着力测试。' } },
      { issue: { en: 'Blurred edge or filling in fine lines', cn: '边缘发糊或细线糊版' }, likelyCause: { en: 'Too much heat, excessive dwell time, soft die, or oversized stamping area.', cn: '温度过高、停留时间过长、版材偏软或大面积烫印压力不均。' }, action: { en: 'Lower temperature, shorten dwell time, check die flatness, and split large solid areas if needed.', cn: '降低温度、缩短停留时间、检查版面平整度，必要时拆分大面积实地。' } },
      { issue: { en: 'Incomplete transfer on rough surfaces', cn: '粗糙表面转移不完整' }, likelyCause: { en: 'Foil cannot fill texture valleys or pressure is uneven.', cn: '箔层无法填满纹理凹位，或压力分布不均。' }, action: { en: 'Use PK rough-surface foil, increase pressure carefully, and confirm pad/die support.', cn: '改用 PK 粗面专用箔，谨慎提高压力，并确认垫版和烫版支撑。' } },
    ],
    samplingChecklist: {
      en: ['Send the actual substrate, ink/lamination details, and stamping artwork.', 'Test 3-5 temperature points and record pressure, dwell time, and machine speed.', 'Check adhesion, rub resistance, edge sharpness, and color consistency after cooling.', 'Confirm roll width, roll length, core size, MOQ, and repeat-order batch tolerance.'],
      cn: ['寄送真实底材、油墨/覆膜信息和烫印图稿。', '测试 3-5 个温度点，并记录压力、停留时间和机器速度。', '冷却后检查附着力、耐摩擦、边缘清晰度和颜色一致性。', '确认宽幅、卷长、卷芯、起订量和复购批次容差。'],
    },
    faqs: [
      { question: { en: 'Can one hot stamping foil work on every substrate?', cn: '一种烫金膜能适配所有底材吗？' }, answer: { en: 'No. A foil that works on coated paper may fail on plastic or textured leather because adhesive and release layers behave differently.', cn: '不能。铜版纸上好用的箔，在塑胶或纹理皮革上可能因胶层和离型差异而失效。' } },
      { question: { en: 'Should I choose foil by color first?', cn: '采购时应该先按颜色选吗？' }, answer: { en: 'Color matters, but substrate and process fit should come first. After the correct series is chosen, select color and finish.', cn: '颜色重要，但应先确认底材和工艺匹配，再选择颜色与表面效果。' } },
      { question: { en: 'What should I send for sampling?', cn: '打样需要提供什么？' }, answer: { en: 'Send real substrate sheets or parts, ink/lamination details, artwork size, machine type, and expected durability tests.', cn: '建议提供真实底材或工件、油墨/覆膜信息、图稿尺寸、设备类型和预期耐性测试。' } },
    ],
    relatedRoutes: ['products/category/PK', 'products/category/PC', 'products/category/PLPY', 'quote'],
  },
  {
    slug: 'paper-box-packaging-hot-stamping-foil-guide',
    priority: 1,
    title: {
      en: 'Hot Stamping Foil Buying Guide for Paper Box Packaging',
      cn: '纸盒彩盒包装烫金膜采购指南',
    },
    metaDescription: {
      en: 'Learn how to choose hot stamping foil for paper boxes, gift boxes, cosmetic packaging, and printed cartons. Compare substrates, foil types, stamping parameters, common problems, and sample testing steps.',
      cn: '了解纸盒、彩盒、礼盒、化妆品盒和印刷纸盒如何选择烫金膜，覆盖底材适配、烫金膜类型、工艺参数、常见问题和打样测试步骤。',
    },
    primaryKeyword: {
      en: 'hot stamping foil for paper box packaging',
      cn: '纸盒包装烫金膜',
    },
    secondaryKeywords: {
      en: ['hot stamping foil for paper boxes', 'foil for folding cartons', 'foil for gift boxes', 'foil for cosmetic boxes', 'printed carton foil stamping'],
      cn: ['纸盒彩盒烫金膜', '礼盒烫金箔', '化妆品盒烫金膜', '印刷纸盒烫金', '纸张烫金箔'],
    },
    audience: {
      en: 'Overseas packaging factories, printing factories, gift box makers, cosmetic packaging converters, and procurement teams buying foil for paper-based packaging.',
      cn: '采购纸盒彩盒、礼盒、化妆品盒和印刷纸盒烫金材料的海外包装厂、印刷厂、礼盒厂、化妆品包材厂和采购团队。',
    },
    answer: {
      en: 'When buying hot stamping foil for paper box packaging, do not choose by gold or silver color alone. Match the foil to the paper surface, printing ink or varnish, lamination, stamping machine, die design, temperature, pressure, dwell time, and final durability requirements. Before bulk ordering, confirm substrate type, foil release behavior, adhesive strength, edge definition, overprintability, roll specification, and sample test results on the actual production paper.',
      cn: '采购纸盒彩盒包装用烫金膜时，不能只按金色或银色下单。应同时匹配纸张表面、印刷油墨或光油、覆膜、烫印设备、烫版设计、温度、压力、停留时间和最终耐性要求。批量下单前，需要在真实生产纸张上确认底材类型、离型表现、附着力、边缘清晰度、可过印性、卷料规格和打样测试结果。',
    },
    factors: [
      {
        label: { en: 'Foil-substrate-process match', cn: '箔材、底材与工艺匹配' },
        guidance: { en: 'Final performance depends on foil, paper, ink, varnish, die, machine condition, and stamping settings working together.', cn: '最终效果取决于烫金膜、纸张、油墨、光油、烫版、设备状态和烫印参数的整体匹配。' },
      },
      {
        label: { en: 'Artwork and release behavior', cn: '图案与离型表现' },
        guidance: { en: 'Fine text needs clean release and sharp edges; large solid blocks need stable coverage, gloss, and adhesion.', cn: '细小文字需要干净离型和清晰边缘，大面积实地需要稳定覆盖、光泽和附着力。' },
      },
      {
        label: { en: 'Test result before price', cn: '测试结果优先于单价' },
        guidance: { en: 'A cheaper foil that causes missing transfer, peeling, downtime, or rework can cost more than a properly matched grade.', cn: '导致转移不全、掉金、停机或返工的低价箔，实际成本可能高于匹配正确的型号。' },
      },
    ],
    selectionTable: [
      {
        factor: { en: 'Paper substrate', cn: '纸张底材' },
        confirm: { en: 'White card, art paper, coated paper, kraft paper, textured paper, laminated paper, or printed paper.', cn: '白卡纸、铜版纸、涂布纸、牛皮纸、特种纸、覆膜纸或已印刷纸。' },
        why: { en: 'Different surfaces have different smoothness, absorbency, and adhesion behavior.', cn: '不同表面的平滑度、吸收性和附着表现不同。' },
        ask: { en: 'Which foil grade do you recommend for this exact paper or laminated surface?', cn: '这个具体纸张或覆膜表面推荐哪个烫金膜型号？' },
      },
      {
        factor: { en: 'Surface treatment', cn: '表面处理' },
        confirm: { en: 'Unprinted paper, ink-printed paper, UV varnish, water-based varnish, matte lamination, or gloss lamination.', cn: '未印刷纸、油墨印刷纸、UV 光油、水性光油、哑膜或亮膜。' },
        why: { en: 'Ink, varnish, and lamination can change foil adhesion and release performance.', cn: '油墨、光油和覆膜会改变烫金膜附着与离型表现。' },
        ask: { en: 'Can this foil stamp on printed, varnished, or OPP-laminated paper?', cn: '这款膜能否烫印在已印刷、上光或 OPP 覆膜纸上？' },
      },
      {
        factor: { en: 'Stamping area', cn: '烫印面积' },
        confirm: { en: 'Fine lines, small text, large solid blocks, borders, or mixed artwork.', cn: '细线、小字、大面积实地、边框或混合图案。' },
        why: { en: 'Fine details need clean release; large areas need stable coverage and gloss.', cn: '精细图案需要干净离型，大面积需要稳定覆盖和光泽。' },
        ask: { en: 'Do you have separate grades for fine-detail and large-area stamping?', cn: '是否有适合精细图案和大面积烫印的不同型号？' },
      },
      {
        factor: { en: 'Machine type', cn: '设备类型' },
        confirm: { en: 'Flatbed, platen, cylinder, rotary, or roll-on hot stamping machine.', cn: '平压、圆压、自动模切烫金、轮转或滚烫设备。' },
        why: { en: 'Machine type affects pressure distribution, speed, and dwell time.', cn: '设备类型影响压力分布、速度和停留时间。' },
        ask: { en: 'What starting temperature, pressure, and dwell time do you recommend?', cn: '建议的起始温度、压力和停留时间是多少？' },
      },
      {
        factor: { en: 'Die material and design', cn: '烫版材料与设计' },
        confirm: { en: 'Magnesium, copper, brass, CNC die, embossing die, or combination die.', cn: '镁版、铜版、黄铜版、CNC 版、凹凸版或组合版。' },
        why: { en: 'Die quality affects edge sharpness and heat transfer.', cn: '烫版质量影响边缘清晰度和热传导。' },
        ask: { en: 'Is this foil suitable for fine logos or foil-plus-embossing work?', cn: '这款膜是否适合精细 Logo 或烫金加凹凸工艺？' },
      },
      {
        factor: { en: 'Foil finish', cn: '烫金膜效果' },
        confirm: { en: 'Metallic gold, silver, rose gold, matte gold, pigment foil, holographic foil, or brushed effect.', cn: '亮金、亮银、玫瑰金、哑金、颜料箔、镭射箔或拉丝效果。' },
        why: { en: 'Different finishes use different coating structures and release behavior.', cn: '不同效果对应不同涂层结构和离型表现。' },
        ask: { en: 'Can you provide a color card and stamped samples on similar paper?', cn: '能否提供色卡和相似纸张上的烫印样？' },
      },
      {
        factor: { en: 'Adhesion and durability', cn: '附着力与耐性' },
        confirm: { en: 'Tape test, rub test, alcohol resistance, scratch resistance, and crease test.', cn: '胶带测试、耐磨测试、耐酒精、耐刮和折线测试。' },
        why: { en: 'Cosmetic boxes, gift boxes, and wine boxes often require handling durability.', cn: '化妆品盒、礼盒和酒盒通常需要更高搬运耐性。' },
        ask: { en: 'What tests should we run before mass production?', cn: '量产前建议做哪些测试？' },
      },
      {
        factor: { en: 'Overprinting or varnishing', cn: '过印或后上光' },
        confirm: { en: 'Whether CMYK, UV varnish, or protective coating will be applied after stamping.', cn: '烫金后是否还要 CMYK 印刷、UV 上光或保护涂层。' },
        why: { en: 'Some packaging designs require printing or coating over foil.', cn: '部分包装设计需要在烫金层上继续印刷或上光。' },
        ask: { en: 'Is this foil overprintable or suitable for post-varnishing?', cn: '这款膜是否可过印或适合后上光？' },
      },
      {
        factor: { en: 'Compliance and sustainability', cn: '合规与环保' },
        confirm: { en: 'Recyclability, PET carrier handling, heavy metal restrictions, and compliance documents.', cn: '可回收性、PET 基膜处理、重金属限制和合规文件。' },
        why: { en: 'Brand owners increasingly ask about packaging sustainability and material safety.', cn: '品牌方越来越关注包装环保和材料安全。' },
        ask: { en: 'Can you provide compliance or sustainability information?', cn: '能否提供合规或环保相关资料？' },
      },
      {
        factor: { en: 'Roll specification', cn: '卷料规格' },
        confirm: { en: 'Width, length, core size, slitting tolerance, and winding quality.', cn: '宽幅、卷长、卷芯、分切公差和收卷质量。' },
        why: { en: 'Wrong roll size can cause waste, wrinkles, or machine feeding issues.', cn: '卷料规格不匹配会造成浪费、起皱或走料问题。' },
        ask: { en: 'Can you slit rolls to our machine width?', cn: '能否按我们的设备宽幅分切？' },
      },
    ],
    processNotes: [
      {
        title: { en: 'What hot stamping foil does on paper boxes', cn: '烫金膜在纸盒包装上的作用' },
        body: { en: 'Hot stamping foil transfers metallic, pigment, holographic, or special decorative effects onto folding cartons, rigid boxes, cosmetic boxes, wine boxes, gift boxes, labels, logos, borders, patterns, and security marks.', cn: '烫金膜可把金属、颜料、镭射或特殊装饰效果转移到折叠纸盒、精品盒、化妆品盒、酒盒、礼盒、标签、Logo、边框、图案和防伪标识上。' },
      },
      {
        title: { en: 'Foil structure and transfer logic', cn: '烫金膜结构与转移逻辑' },
        body: { en: 'A typical foil includes a PET carrier, release layer, color or lacquer layer, metallized aluminum layer, and adhesive layer. Heat and pressure activate the release and adhesive layers so the decorative coating transfers to the paper surface.', cn: '典型烫金膜包含 PET 基膜、离型层、色层或清漆层、真空镀铝层和胶层。烫印时温度和压力激活离型层与胶层，使装饰层转移到纸张表面。' },
      },
      {
        title: { en: 'Temperature, pressure, dwell time, and speed', cn: '温度、压力、停留时间与速度' },
        body: { en: 'Low temperature or short dwell time may cause incomplete transfer; excessive temperature, pressure, or dwell time can dull gloss, blur edges, crush paper, or spread adhesive. Automatic production speed must be balanced with die temperature and pressure.', cn: '温度过低或停留时间过短会导致转移不完整；温度、压力或停留时间过高会造成光泽变暗、边缘发糊、纸面压伤或胶层扩散。自动生产速度必须与版温和压力平衡。' },
      },
      {
        title: { en: 'Hot foil or cold foil for paper packaging', cn: '纸盒包装选热烫还是冷烫' },
        body: { en: 'Hot foil is usually preferred for premium metallic finish, tactile impression, crisp logos, and luxury packaging effects. Cold foil is useful when inline printing speed, CMYK overprinting, no metal die cost, or large production efficiency is more important.', cn: '热烫通常适合高端金属质感、触感、清晰 Logo 和精品包装效果。冷烫更适合联机印刷速度、CMYK 套印、免金属烫版成本或大批量效率更重要的场景。' },
      },
    ],
    substrateFit: [
      { substrate: { en: 'White card / SBS board', cn: '白卡纸 / SBS 纸板' }, recommendedFoil: 'General metallic hot stamping foil for paper packaging', note: { en: 'Usually stable, but ink or varnish can affect adhesion; test logo, small text, and large solid areas.', cn: '通常较稳定，但油墨或光油会影响附着；需测试 Logo、小字和大面积实地。' } },
      { substrate: { en: 'Coated art paper', cn: '铜版纸 / 涂布纸' }, recommendedFoil: 'High-gloss metallic foil with clean release', note: { en: 'Smooth surfaces can show pinholes or pressure marks if settings are wrong; check brightness and edges.', cn: '平滑表面参数不当时易出现针孔或压痕；重点检查亮度和边缘。' } },
      { substrate: { en: 'Uncoated kraft paper', cn: '未涂布牛皮纸' }, recommendedFoil: 'Stronger adhesive grade or rough-paper foil', note: { en: 'Rough fibers can cause incomplete transfer; test pressure and dwell time carefully.', cn: '粗纤维可能导致转移不完整；需谨慎测试压力和停留时间。' } },
      { substrate: { en: 'Textured specialty paper', cn: '纹理特种纸' }, recommendedFoil: 'PK Brown Back Series', note: { en: 'Deep texture can create missing spots; always test the real material, not a flat substitute.', cn: '深纹理可能出现漏烫；必须测试真实材料，不只测平整样纸。' } },
      { substrate: { en: 'UV-printed paper', cn: 'UV 印刷纸' }, recommendedFoil: 'Foil compatible with UV ink or UV varnish surfaces', note: { en: 'Poor surface energy may cause peeling; run tape and rub tests after stamping.', cn: '表面能不合适会掉金；烫后做胶带和耐磨测试。' } },
      { substrate: { en: 'Water-based varnished paper', cn: '水性上光纸' }, recommendedFoil: 'Paper foil with adhesion to coated surfaces', note: { en: 'Varnish formulation may block adhesion; compare varnished and unvarnished samples.', cn: '光油配方可能影响附着；对比上光与未上光样。' } },
      { substrate: { en: 'Matte laminated paper', cn: '哑膜覆膜纸' }, recommendedFoil: 'Foil grade for matte OPP/PET lamination', note: { en: 'Low adhesion can cause peeling or dull effect; run cross-cut tape and rub tests.', cn: '低附着可能导致掉金或光泽发暗；需做百格胶带和耐磨测试。' } },
      { substrate: { en: 'Gloss laminated paper', cn: '亮膜覆膜纸' }, recommendedFoil: 'Foil for glossy OPP or film-laminated paper', note: { en: 'Slippery surface may cause incomplete transfer; test pressure, temperature, and adhesion.', cn: '表面较滑可能转移不完整；需测试压力、温度和附着力。' } },
      { substrate: { en: 'Embossed rigid box paper', cn: '压纹精品盒纸' }, recommendedFoil: 'Foil for embossing or combination stamping', note: { en: 'Cracking or broken lines may appear after embossing, creasing, or folding.', cn: '凹凸、压痕或折叠后可能开裂或断线。' } },
      { substrate: { en: 'Metallic paperboard', cn: '金银卡纸 / 金属纸板' }, recommendedFoil: 'Special foil or pigment foil depending on contrast', note: { en: 'Main risks are low contrast, poor visibility, or surface incompatibility; check color contrast and adhesion.', cn: '主要风险是对比度低、可视性差或表面不兼容；重点检查颜色对比和附着。' } },
    ],
    troubleshooting: [
      { issue: { en: 'Incomplete foil transfer', cn: '转移不完整' }, likelyCause: { en: 'Low temperature, insufficient pressure, short dwell time, wrong foil grade, or rough paper surface.', cn: '温度低、压力不足、停留时间短、型号不匹配或纸面粗糙。' }, action: { en: 'Increase temperature or pressure gradually, test a stronger adhesive foil, and check paper smoothness.', cn: '逐步提高温度或压力，测试更强附着型号，并检查纸面平滑度。' } },
      { issue: { en: 'Foil peels off after stamping', cn: '烫后掉金' }, likelyCause: { en: 'Poor adhesion to ink, varnish, or laminated surface; wrong adhesive layer; surface contamination.', cn: '对油墨、光油或覆膜表面附着差，胶层不匹配或表面污染。' }, action: { en: 'Test on actual printed or varnished paper, run tape tests, and switch to foil for coated or laminated paper.', cn: '在真实印刷或上光纸上测试，做胶带测试，并改用适合涂布或覆膜纸的型号。' } },
      { issue: { en: 'Blurry edges or thickened lines', cn: '边缘发糊或线条变粗' }, likelyCause: { en: 'Temperature, pressure, or dwell time is too high; release behavior is too soft.', cn: '温度、压力或停留时间过高，或离型过软。' }, action: { en: 'Reduce heat or pressure, use cleaner-release foil, and check die sharpness.', cn: '降低温度或压力，改用离型更干净的型号，并检查烫版锐度。' } },
      { issue: { en: 'Pinholes or missing spots in solid areas', cn: '大面积针孔或漏烫' }, likelyCause: { en: 'Uneven pressure, rough paper texture, dirty die, or unstable foil tension.', cn: '压力不均、纸面粗糙、烫版脏污或张力不稳。' }, action: { en: 'Clean the die, balance pressure, and test a large-area foil grade.', cn: '清洁烫版，平衡压力，并测试适合大面积的型号。' } },
      { issue: { en: 'Dull metallic gloss', cn: '金属光泽发暗' }, likelyCause: { en: 'Excessive heat, unsuitable foil finish, rough surface, or overpressure.', cn: '温度过高、效果不匹配、表面粗糙或压力过大。' }, action: { en: 'Reduce temperature, test high-gloss foil, and compare on smoother paper.', cn: '降低温度，测试高光型号，并在更平滑纸面上对比。' } },
      { issue: { en: 'Dirty background or flying foil', cn: '底脏或飞金' }, likelyCause: { en: 'Release layer is too easy, static electricity, excessive heat or pressure.', cn: '离型过松、静电、温度或压力过高。' }, action: { en: 'Reduce temperature, check foil storage, adjust tension, and clean the machine.', cn: '降低温度，检查储存条件，调整张力并清洁设备。' } },
      { issue: { en: 'Color inconsistency', cn: '颜色不一致' }, likelyCause: { en: 'Different foil batches, unstable temperature, or inconsistent substrate color.', cn: '烫金膜批次不同、温度不稳或底材颜色不一致。' }, action: { en: 'Use approved color standards, check batch numbers, and test with instruments when needed.', cn: '使用确认色样，检查批号，必要时用仪器测试。' } },
      { issue: { en: 'Cracking after folding or creasing', cn: '折叠或压痕后开裂' }, likelyCause: { en: 'Foil is too close to crease line, adhesion is weak, or coating is brittle.', cn: '烫印区域太靠近折线、附着弱或涂层偏脆。' }, action: { en: 'Move foil away from crease lines, test after folding, and choose a more flexible grade.', cn: '避开折线位置，折叠后测试，并选择更柔韧的型号。' } },
      { issue: { en: 'Poor overprint or varnish adhesion', cn: '过印或上光附着差' }, likelyCause: { en: 'Foil surface is not designed for overprinting or is incompatible with UV ink/varnish.', cn: '箔表面不适合过印，或与 UV 油墨/光油不兼容。' }, action: { en: 'Use overprintable foil and test ink or varnish adhesion before production.', cn: '使用可过印型号，并在量产前测试油墨或光油附着。' } },
      { issue: { en: 'Registration shift', cn: '套位偏移' }, likelyCause: { en: 'Machine feeding issue, foil tension problem, paper movement, or die setup error.', cn: '设备走纸、箔张力、纸张移动或烫版安装问题。' }, action: { en: 'Check machine registration, foil tension, and sheet feeding stability.', cn: '检查设备套准、箔张力和纸张输送稳定性。' } },
    ],
    samplingChecklist: {
      en: [
        'Send the supplier your exact paper board, printed sheet, varnished sheet, or laminated paper.',
        'Share machine type, die material, stamping speed, starting temperature, pressure range, roll width, and artwork size.',
        'Test at least three artwork types: one fine-detail logo, one small text area, and one large solid foil block.',
        'Run a controlled parameter matrix instead of testing only one temperature and pressure.',
        'Inspect edge sharpness, missing spots, pinholes, gloss, color tone, background cleanliness, and foil waste release.',
        'Run tape pull, cross-cut tape, or rub testing to verify adhesion.',
        'Test folding, creasing, die-cutting, varnishing, packing, and transport simulation after stamping.',
        'Confirm color code, roll width, roll length, core size, slitting tolerance, MOQ, lead time, packing method, and batch consistency policy.',
      ],
      cn: [
        '向供应商提供真实纸板、印刷纸、上光纸或覆膜纸。',
        '说明设备类型、烫版材料、烫印速度、起始温度、压力范围、卷料宽幅和图案尺寸。',
        '至少测试三类图案：精细 Logo、小字和大面积实地。',
        '做受控参数矩阵，不要只测试一个温度和压力点。',
        '检查边缘清晰度、漏点、针孔、光泽、色调、底脏和废箔离型。',
        '用胶带拉力、百格胶带或耐磨测试验证附着力。',
        '烫后测试折叠、压痕、模切、上光、包装和运输模拟。',
        '确认色号、宽幅、卷长、卷芯、分切公差、起订量、交期、包装方式和批次一致性政策。',
      ],
    },
    faqs: [
      { question: { en: 'Is hot stamping foil the same as hot stamping paper or electro-aluminum foil?', cn: '烫金膜、烫金纸和电化铝是同一种产品吗？' }, answer: { en: 'In packaging sourcing, these terms are often used for similar transfer materials. The exact product should be confirmed by structure, application, substrate, and machine process.', cn: '在包装采购语境中，这些词经常指类似的转移材料。实际产品应按结构、用途、底材和设备工艺确认。' } },
      { question: { en: 'What foil is best for paper box packaging?', cn: '纸盒包装用哪种烫金膜最好？' }, answer: { en: 'For standard paper boxes, use metallic hot stamping foil designed for paper or printed paper. For coated, varnished, or laminated paper, choose a grade tested for that exact surface.', cn: '普通纸盒可用纸张或印刷纸专用金属烫金膜；涂布、上光或覆膜纸需选择已在对应表面验证过的型号。' } },
      { question: { en: 'Can one foil work for both fine text and large solid areas?', cn: '一种膜能同时适合细字和大面积实地吗？' }, answer: { en: 'Sometimes, but not always. Fine details need clean release and sharp edges, while large solid areas need stable coverage, gloss, and adhesion. Test both artwork types before bulk ordering.', cn: '有时可以，但不能默认。精细图案需要干净离型和清晰边缘，大面积需要稳定覆盖、光泽和附着。批量前应同时测试两类图案。' } },
      { question: { en: 'Why does foil peel off after stamping?', cn: '为什么纸盒烫金后会掉金？' }, answer: { en: 'Peeling may come from low temperature, insufficient pressure, wrong adhesive layer, incompatible ink or varnish, contaminated paper, or poor surface treatment. Testing on the actual printed or laminated sheet is essential.', cn: '掉金可能来自温度低、压力不足、胶层不匹配、油墨或光油不兼容、纸面污染或表面处理不佳。必须在真实印刷或覆膜纸上测试。' } },
      { question: { en: 'Why does my stamped logo look blurry?', cn: '为什么烫金 Logo 边缘发糊？' }, answer: { en: 'Blurry edges usually come from excessive heat, excessive pressure, long dwell time, soft release behavior, dirty die, or unsuitable foil coating thickness.', cn: '边缘发糊通常来自温度过高、压力过大、停留时间过长、离型偏软、烫版脏污或涂层厚度不适合。' } },
      { question: { en: 'Can hot stamping foil be used on matte laminated paper?', cn: '哑膜覆膜纸可以烫金吗？' }, answer: { en: 'Yes, but it requires a grade suitable for matte OPP, PET, or laminated paper. Matte lamination often has lower adhesion, so tape and rub tests are strongly recommended.', cn: '可以，但需要适合哑面 OPP、PET 或覆膜纸的型号。哑膜附着通常更难，强烈建议做胶带和耐磨测试。' } },
      { question: { en: 'Can I print or varnish over hot stamping foil?', cn: '烫金后还能印刷或上光吗？' }, answer: { en: 'Some foils are designed to be overprinted or over-varnished, but not all. If your design needs CMYK, UV varnish, or protective coating over foil, ask for an overprintable grade and test adhesion.', cn: '部分烫金膜支持过印或后上光，但不是所有型号都可以。如果设计需要在箔层上印刷、UV 或保护涂层，应选择可过印型号并测试附着。' } },
      { question: { en: 'Is hot stamping foil recyclable on paper packaging?', cn: '纸盒上的烫金膜影响回收吗？' }, answer: { en: 'Transfer finishing can be compatible with paper and cardboard recycling when the decorative layer is very thin and the packaging structure is properly designed. Claims should be verified with supplier documentation and local recycling rules.', cn: '当装饰层很薄且包装结构设计合理时，转移装饰可与纸和纸板回收体系兼容。具体声明应依据供应商文件和当地回收规则确认。' } },
      { question: { en: 'What information should I send before asking for a quotation?', cn: '询价前应该提供哪些信息？' }, answer: { en: 'Send substrate type, paper thickness, surface treatment, artwork, stamping area size, machine type, required roll width, roll length, color, finish, order quantity, and target application.', cn: '建议提供底材类型、纸张厚度、表面处理、图稿、烫印面积、设备类型、所需宽幅、卷长、颜色、效果、数量和应用场景。' } },
      { question: { en: 'Should I buy by price or by test result?', cn: '采购应该看价格还是测试结果？' }, answer: { en: 'For paper box packaging, test result is more important than unit price. A cheaper foil that causes missing transfer, peeling, or downtime can cost more than a properly matched foil.', cn: '纸盒包装用烫金膜应优先看测试结果。造成漏烫、掉金或停机的低价膜，实际成本可能高于匹配正确的型号。' } },
    ],
    sourceReferences: [
      { label: 'S1', title: 'KURZ Hot Stamping', url: 'https://www.kurz-graphics.com/en/hot-stamping/' },
      { label: 'S2', title: 'Ginkgo: Hot Stamping Foil Structure', url: 'https://www.ginkgotech.com.tw/en/faq/Ginkgo-faq-01.html' },
      { label: 'S3', title: 'KURZ Hot Stamping Process PDF', url: 'https://www.kurz-automotive.com/fileadmin/user_upload/Plastic-Decoration/6_Newsroom/4_Downloads/KURZ-Hot-Stamping-Process.pdf' },
      { label: 'S4', title: 'Packaging Impressions: Foiled by Foil', url: 'https://www.packagingimpressions.com/article/foiled-foil-14515/' },
      { label: 'S5', title: 'Ginkgo: Common Foil Stamping Problems', url: 'https://www.ginkgotech.com.tw/en/faq/Ginkgo-faq-06.html' },
      { label: 'S6', title: 'Dragon Foils: Common Hot Stamping Problems', url: 'https://www.dragonfoils.com/article/common-problems-encountered-when-using-hot-stamping-foil.html' },
      { label: 'S7', title: 'Ginkgo: Quality Control and Management', url: 'https://www.ginkgotech.com.tw/en/page/quality-control_management.html' },
      { label: 'S8', title: 'KURZ Transfer Finishes and Sustainability Facts', url: 'https://www.kurzusa.com/sustainability/our-transfer-finishes/' },
      { label: 'S9', title: 'ITW Hot Stamping Foil Data Sheet', url: 'https://4.imimg.com/data4/OI/RE/MY-153538/itw-hot-stamping-foil.pdf' },
      { label: 'S10', title: 'INX: Hot and Cold Foil Printing Techniques', url: 'https://www.inxinternational.com/blog/shelf-appeal/mastering-art-foil-printing-complete-guide-hot-and-cold-techniques' },
    ],
    relatedRoutes: ['products/category/PK', 'products/category/PLPY', 'guides/hot-stamping-foil-buying-guide', 'guides/hot-stamping-sampling-checklist', 'quote'],
  },
  {
    slug: 'hot-stamping-troubleshooting',
    priority: 2,
    title: { en: 'Hot Stamping Troubleshooting: Poor Adhesion, Foil Peeling, Blurry Edges, and Broken Lines', cn: '烫金不牢、掉金、糊版、断线的原因与解决方法' },
    metaDescription: { en: 'A troubleshooting guide for hot stamping defects, causes, and practical adjustments for packaging and print factories.', cn: '面向包装印刷厂的烫金故障排查指南，覆盖不牢、掉金、糊版、断线、转移不完整等问题。' },
    primaryKeyword: { en: 'hot stamping troubleshooting', cn: '烫金故障排查' },
    secondaryKeywords: { en: ['foil peeling', 'poor foil adhesion', 'hot stamping blurry edges'], cn: ['烫金不牢', '烫金掉金', '烫金糊版'] },
    audience: { en: 'Production managers, machine operators, QC teams, and packaging buyers troubleshooting foil defects.', cn: '处理烫印缺陷的生产主管、机长、质检人员和包材采购。' },
    answer: { en: 'Most hot stamping defects come from four areas: foil-substrate mismatch, incorrect heat/pressure/dwell time, die or pad problems, and contaminated or unstable substrates. Troubleshoot by changing one variable at a time and recording the result on the real production material.', cn: '大多数烫金缺陷来自四类原因：箔与底材不匹配、温度/压力/停留时间不当、烫版或垫版问题、底材表面污染或批次不稳定。排查时应一次只调整一个变量，并在真实生产底材上记录结果。' },
    factors: [
      { label: { en: 'Adhesion system', cn: '附着体系' }, guidance: { en: 'Use plastic foil for plastic, rough-surface foil for textured board, and pigment foil when color coverage matters.', cn: '塑胶用塑胶箔，粗糙纸用粗面箔，需要高遮盖纯色时用颜料箔。' } },
      { label: { en: 'Heat-pressure balance', cn: '温度压力平衡' }, guidance: { en: 'High heat can blur edges; low heat can cause incomplete transfer. Pressure must be even across the artwork.', cn: '温度过高容易糊边，温度过低会转移不全；压力必须在图案范围内均匀。' } },
      { label: { en: 'Post-stamping tests', cn: '烫后测试' }, guidance: { en: 'Run tape, rub, alcohol, scratch, and aging checks based on the final package use.', cn: '按最终包装用途做胶带、耐磨、耐酒精、耐刮和老化测试。' } },
    ],
    substrateFit: [
      { substrate: { en: 'Rough paper', cn: '粗糙纸' }, recommendedFoil: 'PK Brown Back Series', note: { en: 'Improves filling and transfer on uneven texture.', cn: '改善纹理凹凸处的填充和转移完整度。' } },
      { substrate: { en: 'Cosmetic plastic', cn: '化妆品塑胶' }, recommendedFoil: 'PC Plastic/Cold Foils', note: { en: 'Validate cross-cut and alcohol rubbing tests.', cn: '重点验证百格和耐酒精擦拭。' } },
      { substrate: { en: 'Dark colored paper', cn: '深色纸张' }, recommendedFoil: 'PL/PY Pigment Foils', note: { en: 'Opaque pigment helps avoid show-through.', cn: '高遮盖颜料箔可减少底色透出。' } },
    ],
    troubleshooting: [
      { issue: { en: 'Foil peeling after tape test', cn: '胶带测试后掉金' }, likelyCause: { en: 'Adhesive mismatch or insufficient activation.', cn: '胶层不匹配或胶层未充分激活。' }, action: { en: 'Test a substrate-specific foil and increase heat/pressure in small steps.', cn: '测试底材专用箔，并小幅提高温度或压力。' } },
      { issue: { en: 'Broken fine lines', cn: '细线断线' }, likelyCause: { en: 'Low pressure, rough substrate, or die wear.', cn: '压力不足、底材粗糙或烫版磨损。' }, action: { en: 'Check die condition, use rough-surface foil, and optimize pad support.', cn: '检查版面，改用粗面箔，并优化垫版支撑。' } },
      { issue: { en: 'Large-area mottling', cn: '大面积发花' }, likelyCause: { en: 'Uneven pressure or substrate coating variation.', cn: '压力不均或底材涂层差异。' }, action: { en: 'Level the platen, reduce solid area if possible, and request substrate batch testing.', cn: '校平设备，必要时拆分实地面积，并要求底材批次测试。' } },
    ],
    samplingChecklist: { en: ['Record defect photo, substrate batch, foil batch, die temperature, dwell time, pressure, and machine speed.', 'Change one variable per test.', 'Compare two foil series on the same substrate.', 'Approve only after post-stamping durability checks.'], cn: ['记录缺陷照片、底材批次、箔批次、版温、停留时间、压力和速度。', '每次测试只调整一个变量。', '同一底材对比两个箔系列。', '通过烫后耐性测试后再确认。'] },
    faqs: [
      { question: { en: 'Why does foil peel after stamping?', cn: '为什么烫后会掉金？' }, answer: { en: 'Common causes are wrong foil adhesive, low heat, low pressure, short dwell time, or surface contamination.', cn: '常见原因包括箔胶层不匹配、温度低、压力低、停留时间短或底材表面污染。' } },
      { question: { en: 'Why are edges blurry?', cn: '为什么烫金边缘发糊？' }, answer: { en: 'Edges blur when heat, dwell time, or pressure is too high, or when the die/pad cannot support fine artwork.', cn: '温度、停留时间或压力过高，以及版材/垫版无法支撑精细图案时，容易边缘发糊。' } },
    ],
    relatedRoutes: ['products/category/PK', 'products/category/PC', 'guides/hot-stamping-sampling-checklist', 'quote'],
  },
  {
    slug: 'hot-foil-vs-cold-foil-vs-holographic',
    priority: 3,
    title: { en: 'Hot Foil vs Cold Foil vs Holographic Foil: Which Should You Choose?', cn: '热烫膜、冷烫膜、镭射烫金膜有什么区别？' },
    metaDescription: { en: 'Compare hot foil, cold foil, and holographic foil by process, substrate, cost, speed, visual effect, and best packaging use cases.', cn: '从工艺、底材、成本、速度、视觉效果和包装应用对比热烫膜、冷烫膜和镭射烫金膜。' },
    primaryKeyword: { en: 'hot foil vs cold foil', cn: '热烫膜 冷烫膜 区别' },
    secondaryKeywords: { en: ['holographic hot stamping foil', 'cold foil stamping', 'hot stamping foil comparison'], cn: ['镭射烫金膜', '冷烫箔', '热烫箔对比'] },
    audience: { en: 'Brand packaging teams, converters, and buyers comparing foil processes before production.', cn: '量产前对比烫印工艺的品牌包材团队、加工厂和采购。' },
    answer: { en: 'Choose hot foil when you need strong metallic impact and durable transfer on paper, plastic, or leather. Choose cold foil for high-speed inline printing, variable digital effects, and short runs. Choose holographic foil when the packaging needs rainbow, security, or premium visual effects. Final selection still depends on substrate and sampling.', cn: '需要强金属质感和稳定转移时选热烫膜；需要联机高速印刷、数码增效或短单时选冷烫膜；需要彩虹、防伪或高端视觉效果时选镭射烫金膜。最终仍要按底材和打样结果确认。' },
    factors: [
      { label: { en: 'Process', cn: '工艺' }, guidance: { en: 'Hot foil uses heat and pressure; cold foil uses adhesive/UV curing; holographic foil can be hot or cold depending on construction.', cn: '热烫靠温度和压力，冷烫靠胶水/UV 固化，镭射箔可按结构用于热烫或冷烫。' } },
      { label: { en: 'Best use', cn: '适合用途' }, guidance: { en: 'Luxury boxes often use hot foil; labels and inline printing often use cold foil; security and premium effects use holographic foil.', cn: '高端礼盒彩盒常用热烫，标签和联机印刷常用冷烫，防伪和高端效果常用镭射箔。' } },
      { label: { en: 'Procurement note', cn: '采购注意' }, guidance: { en: 'Ask whether the foil is formulated for your machine type and varnish/adhesive system.', cn: '必须确认箔是否适配你的设备类型和光油/胶水体系。' } },
    ],
    substrateFit: [
      { substrate: { en: 'Rigid gift box paper', cn: '精品礼盒纸' }, recommendedFoil: 'Hot Foil / PK Brown Back', note: { en: 'Strong premium metallic result and good depth.', cn: '金属质感强，适合高端包装。' } },
      { substrate: { en: 'Label stock / inline printing', cn: '标签材料 / 联机印刷' }, recommendedFoil: 'Digital Cold Foil', note: { en: 'Fast for short-run and variable enhancement.', cn: '适合短单和可变增效。' } },
      { substrate: { en: 'Security packaging', cn: '防伪包装' }, recommendedFoil: 'Holographic Foil', note: { en: 'Adds rainbow/security visual recognition.', cn: '增强彩虹、防伪和识别效果。' } },
    ],
    troubleshooting: [
      { issue: { en: 'Cold foil does not transfer evenly', cn: '冷烫转移不均' }, likelyCause: { en: 'Adhesive/UV curing mismatch or low surface wetting.', cn: '胶水/UV 固化不匹配或表面润湿不足。' }, action: { en: 'Test compatible varnish, curing energy, and foil release.', cn: '测试匹配光油、固化能量和箔离型。' } },
      { issue: { en: 'Hot foil cracks on folding', cn: '热烫折线开裂' }, likelyCause: { en: 'Foil too brittle or stamping across crease.', cn: '箔层偏脆或跨折线烫印。' }, action: { en: 'Use fold-resistant foil and test crease direction.', cn: '测试耐折箔并确认折线方向。' } },
    ],
    samplingChecklist: { en: ['Confirm hot stamping, cold foil, or digital enhancement equipment.', 'Send adhesive/varnish details for cold foil tests.', 'Compare metallic, matte, pigment, and holographic finishes on the same substrate.'], cn: ['确认热烫、冷烫或数码增效设备。', '冷烫测试需提供胶水/光油信息。', '在同一底材上对比金属、哑光、颜料和镭射效果。'] },
    faqs: [
      { question: { en: 'Is cold foil cheaper than hot foil?', cn: '冷烫一定比热烫便宜吗？' }, answer: { en: 'Not always. Cold foil can be faster inline, but total cost depends on adhesive, curing, waste, order size, and required finish.', cn: '不一定。冷烫可联机高速生产，但总成本取决于胶水、固化、损耗、订单量和效果要求。' } },
      { question: { en: 'Can holographic foil be used on cosmetic packaging?', cn: '镭射烫金膜适合化妆品包装吗？' }, answer: { en: 'Yes, if the effect matches the brand and the substrate passes adhesion, rub, and alcohol-resistance tests.', cn: '可以，但要符合品牌视觉，并通过附着、耐磨和耐酒精测试。' } },
    ],
    relatedRoutes: ['products/category/DIGITAL', 'products/category/PC', 'products/category/PK', 'quote'],
  },
  {
    slug: 'cosmetic-packaging-foil-guide',
    priority: 4,
    title: { en: 'Cosmetic Packaging Hot Stamping Foil Guide', cn: '化妆品包装烫金膜选型指南' },
    metaDescription: { en: 'How to select foil for lipstick tubes, compacts, skincare packaging, perfume caps, cosmetic boxes, and alcohol-resistant decorative parts.', cn: '针对口红管、粉盒、护肤品包装、香水盖、化妆品盒和耐酒精装饰件的烫金膜选型指南。' },
    primaryKeyword: { en: 'cosmetic packaging hot stamping foil', cn: '化妆品包装烫金膜' },
    secondaryKeywords: { en: ['alcohol resistant foil', 'plastic hot stamping foil', 'foil for lipstick tubes'], cn: ['耐酒精烫金箔', '塑胶烫金膜', '口红管烫金膜'] },
    audience: { en: 'Cosmetics packaging buyers, plastic component factories, decoration suppliers, and brand packaging engineers.', cn: '化妆品包材采购、塑胶件工厂、后加工供应商和品牌包材工程师。' },
    answer: { en: 'For cosmetic packaging, first decide whether the part is plastic, coated paper, glass, or laminated board. Plastic parts usually need PC plastic foil with strong adhesion and alcohol resistance; paper boxes may use PK or pigment foil; premium effects may use holographic or matte metallic foil. Always test alcohol wiping, cross-cut adhesion, rub resistance, and edge sharpness before mass production.', cn: '化妆品包装选烫金膜时，先判断工件是塑胶、纸盒、玻璃还是覆膜纸。塑胶件通常需要 PC 塑胶箔并验证耐酒精；纸盒可选 PK 或颜料箔；高端效果可选镭射或哑光金属箔。量产前必须测试耐酒精擦拭、百格附着、耐磨和边缘清晰度。' },
    factors: [
      { label: { en: 'Alcohol resistance', cn: '耐酒精' }, guidance: { en: 'Perfume, skincare, and makeup packaging may contact alcohol during filling, cleaning, or consumer use.', cn: '香水、护肤和美妆包装在灌装、清洁或使用中可能接触酒精。' } },
      { label: { en: 'Plastic grade adhesion', cn: '塑胶附着' }, guidance: { en: 'ABS, PS, PVC, PMMA, PP, and PE need validated plastic foil and surface energy checks.', cn: 'ABS、PS、PVC、PMMA、PP、PE 需要验证塑胶箔和表面能。' } },
      { label: { en: 'Brand finish', cn: '品牌效果' }, guidance: { en: 'Luxury cosmetics often use mirror gold/silver, matte metallic, holographic, or pigment finishes.', cn: '高端美妆常用镜面金银、哑光金属、镭射或颜料色效果。' } },
    ],
    substrateFit: [
      { substrate: { en: 'Lipstick tube / compact case', cn: '口红管 / 粉盒' }, recommendedFoil: 'PC Plastic/Cold Foils', note: { en: 'Prioritize adhesion, clean slitting, and alcohol resistance.', cn: '重点关注附着、分切洁净度和耐酒精。' } },
      { substrate: { en: 'Cosmetic paper box', cn: '化妆品纸盒' }, recommendedFoil: 'PK Brown Back or PL/PY Pigment', note: { en: 'Use PK for textured board; pigment foil for opaque color blocks.', cn: '纹理纸用 PK，高遮盖纯色块用颜料箔。' } },
      { substrate: { en: 'Premium limited edition packaging', cn: '高端限量包装' }, recommendedFoil: 'Holographic / Matte Metallic Foil', note: { en: 'Test visual consistency and brand color tolerance.', cn: '测试视觉一致性和品牌色容差。' } },
    ],
    troubleshooting: [
      { issue: { en: 'Foil rubs off after alcohol wipe', cn: '酒精擦拭后掉金' }, likelyCause: { en: 'Wrong foil series or plastic surface energy issue.', cn: '箔系列不匹配或塑胶表面能问题。' }, action: { en: 'Use alcohol-resistant PC foil and run cross-cut plus alcohol rubbing tests.', cn: '改用耐酒精 PC 箔，并做百格和酒精擦拭测试。' } },
      { issue: { en: 'Logo edge is not sharp', cn: 'Logo 边缘不清晰' }, likelyCause: { en: 'Heat/pressure/dwell time too high or die detail too fine.', cn: '温度、压力、停留时间过高或烫版细节过细。' }, action: { en: 'Lower heat, shorten dwell time, and verify die quality.', cn: '降低温度、缩短停留时间，并检查烫版质量。' } },
    ],
    samplingChecklist: { en: ['Send the exact plastic resin or paper box material.', 'State alcohol, rub, scratch, and cross-cut test requirements.', 'Confirm logo size, line width, stamping area, and color standard.', 'Approve color under the brand lighting condition if possible.'], cn: ['提供真实塑胶树脂或纸盒材料。', '说明耐酒精、耐磨、耐刮和百格测试要求。', '确认 Logo 尺寸、线宽、烫印面积和颜色标准。', '尽量在品牌指定光源下确认颜色。'] },
    faqs: [
      { question: { en: 'Which foil is best for cosmetic plastic packaging?', cn: '化妆品塑胶包装用哪种烫金箔？' }, answer: { en: 'Start with PC plastic foil, then validate adhesion and alcohol resistance on the actual part.', cn: '建议从 PC 塑胶箔开始，并在真实工件上验证附着和耐酒精。' } },
      { question: { en: 'Can PINTE provide color cards and sample rolls?', cn: 'PINTE 能提供色卡和样卷吗？' }, answer: { en: 'Yes. PINTE can provide color cards, sample rolls, and substrate-based model recommendations.', cn: '可以。PINTE 可提供色卡、样卷和按底材推荐型号服务。' } },
    ],
    relatedRoutes: ['products/category/PC', 'products/category/PK', 'products/item/PC-Alcohol', 'quote'],
  },
  {
    slug: 'hot-stamping-sampling-checklist',
    priority: 5,
    title: { en: 'Hot Stamping Foil Sampling Checklist: 12 Parameters to Confirm Before Bulk Purchase', cn: '烫金膜打样测试清单：采购前必须确认的 12 个参数' },
    metaDescription: { en: 'A procurement checklist for sample testing hot stamping foil before bulk orders: substrate, temperature, pressure, speed, adhesion, durability, width, MOQ, and repeatability.', cn: '烫金膜批量采购前的打样测试清单，覆盖底材、温度、压力、速度、附着力、耐性、宽幅、起订量和复购稳定性。' },
    primaryKeyword: { en: 'hot stamping foil sampling checklist', cn: '烫金膜打样测试清单' },
    secondaryKeywords: { en: ['foil sample testing', 'hot stamping test parameters', 'foil procurement checklist'], cn: ['烫金膜打样', '烫金测试参数', '烫金膜采购清单'] },
    audience: { en: 'Procurement teams and production engineers approving foil before bulk purchasing.', cn: '批量采购前负责确认烫金膜的采购团队和生产工程师。' },
    answer: { en: 'Before buying hot stamping foil in bulk, confirm 12 parameters: substrate, surface treatment, ink/lamination, artwork detail, stamping area, machine type, die material, temperature, pressure, dwell time, durability test, and roll specification. A good supplier should recommend models based on this information and provide sample support before mass production.', cn: '批量采购烫金膜前必须确认 12 个参数：底材、表面处理、油墨/覆膜、图案细节、烫印面积、设备类型、版材、温度、压力、停留时间、耐性测试和卷料规格。合格供应商应能根据这些信息推荐型号，并在量产前提供打样支持。' },
    factors: [
      { label: { en: 'Real substrate', cn: '真实底材' }, guidance: { en: 'Test on the actual production material, not a similar-looking substitute.', cn: '必须在真实生产底材上测试，不能用看起来相似的替代材料。' } },
      { label: { en: 'Recorded parameters', cn: '参数记录' }, guidance: { en: 'Record every heat, pressure, speed, and dwell-time setting so results can be repeated.', cn: '记录每次温度、压力、速度和停留时间，确保结果可复现。' } },
      { label: { en: 'Approval standard', cn: '验收标准' }, guidance: { en: 'Define pass/fail criteria before testing: tape, rub, alcohol, scratch, folding, or aging.', cn: '测试前定义通过标准：胶带、耐磨、耐酒精、耐刮、折线或老化。' } },
    ],
    substrateFit: [
      { substrate: { en: 'Paperboard', cn: '纸板' }, recommendedFoil: 'PK / PLPY / Metallic Foil', note: { en: 'Confirm ink, coating, lamination, and roughness.', cn: '确认油墨、涂层、覆膜和粗糙度。' } },
      { substrate: { en: 'Plastic part', cn: '塑胶件' }, recommendedFoil: 'PC Plastic Foil', note: { en: 'Confirm resin type and surface treatment.', cn: '确认树脂类型和表面处理。' } },
      { substrate: { en: 'Leather / PU / PVC', cn: '真皮 / PU / PVC' }, recommendedFoil: 'PK / Leather-suitable Foil', note: { en: 'Confirm texture depth, softness, and heat tolerance.', cn: '确认纹理深度、软硬度和耐温。' } },
    ],
    troubleshooting: [
      { issue: { en: 'Sample passes but bulk fails', cn: '打样通过但量产失败' }, likelyCause: { en: 'Different substrate batch, unrecorded parameter change, or roll/batch variation.', cn: '底材批次不同、参数未记录或卷料批次差异。' }, action: { en: 'Lock the substrate batch, record settings, and confirm repeat-order tolerance.', cn: '锁定底材批次，记录参数，并确认复购批次容差。' } },
      { issue: { en: 'Supplier cannot recommend a model', cn: '供应商无法推荐型号' }, likelyCause: { en: 'Insufficient technical data or weak application knowledge.', cn: '技术信息不足或应用经验薄弱。' }, action: { en: 'Provide substrate and process details; choose suppliers with application support.', cn: '提供底材和工艺信息，并选择有应用支持的供应商。' } },
    ],
    samplingChecklist: {
      en: ['Substrate name and real samples', 'Ink, coating, lamination, or varnish details', 'Artwork size and minimum line width', 'Stamping machine type', 'Die material and hardness', 'Temperature range', 'Pressure range', 'Dwell time / speed', 'Stamping area percentage', 'Adhesion test method', 'Rub/alcohol/scratch/folding test method', 'Roll width, length, core size, MOQ, and delivery schedule'],
      cn: ['底材名称与真实样品', '油墨、涂层、覆膜或光油信息', '图案尺寸和最小线宽', '烫印设备类型', '版材和硬度', '温度范围', '压力范围', '停留时间/速度', '烫印面积占比', '附着力测试方法', '耐磨/耐酒精/耐刮/耐折测试方法', '宽幅、卷长、卷芯、起订量和交期'],
    },
    faqs: [
      { question: { en: 'Can I approve foil only by color card?', cn: '只看色卡可以确认烫金膜吗？' }, answer: { en: 'No. Color cards help narrow choices, but approval must happen on the real substrate and production process.', cn: '不建议。色卡只能缩小选择范围，最终必须在真实底材和生产工艺上确认。' } },
      { question: { en: 'How many test points should I run?', cn: '打样要测试几个参数点？' }, answer: { en: 'Run at least 3-5 temperature points and adjust pressure/speed one variable at a time.', cn: '建议至少测试 3-5 个温度点，并一次只调整压力或速度中的一个变量。' } },
    ],
    relatedRoutes: ['guides/hot-stamping-foil-buying-guide', 'guides/hot-stamping-troubleshooting', 'quote'],
  },
  {
    slug: 'hot-stamping-foil-buyer-questions',
    priority: 1,
    title: {
      en: '30 Hot Stamping Foil Questions Buyers Ask ChatGPT Before Purchasing',
      cn: '买烫金膜前采购负责人最可能问 ChatGPT 的 30 个问题',
    },
    metaDescription: {
      en: 'A GEO content map for hot stamping foil buyers: 30 procurement questions by intent, concern, source type, page format, conversion value, and AI citation potential.',
      cn: '面向烫金膜采购的 GEO 内容地图：按采购意图、真实顾虑、引用来源、页面类型、转化价值和 AI 引用概率整理 30 个高频问题。',
    },
    primaryKeyword: {
      en: 'hot stamping foil buyer questions',
      cn: '烫金膜采购问题',
    },
    secondaryKeywords: {
      en: ['hot stamping foil procurement', 'hot foil buyer guide', 'foil stamping questions', 'GEO content for hot stamping foil'],
      cn: ['烫金膜采购指南', '烫金纸采购问题', '电化铝采购', '生成式 AI 检索优化'],
    },
    audience: {
      en: 'Packaging factory buyers, print factory buyers, gift box makers, cosmetic packaging buyers, label printers, plastic decoration suppliers, and leather goods factories.',
      cn: '包装厂、印刷厂、礼盒厂、化妆品包材厂、标签印刷厂、塑料件烫印厂和皮具厂采购负责人。',
    },
    answer: {
      en: 'Buyers usually ask ChatGPT about hot stamping foil in five intent groups: procurement, comparison, troubleshooting, parameters, and application scenarios. The highest-converting pages are not generic definitions; they combine substrate, application, defect risk, stamping parameters, sample testing, and supplier questions in an answer-first format that AI search can cite.',
      cn: '采购负责人在 ChatGPT 里问烫金膜，通常集中在五类意图：采购型、对比型、故障解决型、参数型和应用场景型。最有转化价值的页面不是泛泛解释“什么是烫金膜”，而是把底材、用途、故障风险、工艺参数、打样测试和供应商筛选做成答案优先、可引用的采购页面。',
    },
    factors: [
      {
        label: { en: 'Procurement intent', cn: '采购型' },
        guidance: { en: 'Questions about supplier selection, sample testing, MOQ, roll width, delivery, certifications, and repeat-order stability.', cn: '关注供应商选择、打样、起订量、宽幅、交期、认证和复购稳定性。' },
      },
      {
        label: { en: 'Comparison intent', cn: '对比型' },
        guidance: { en: 'Questions comparing hot foil, cold foil, holographic foil, imported foil, domestic foil, and substrate-specific series.', cn: '对比热烫膜、冷烫膜、镭射膜、进口膜、国产膜和不同底材专用系列。' },
      },
      {
        label: { en: 'Troubleshooting and parameter intent', cn: '故障与参数型' },
        guidance: { en: 'Questions about poor adhesion, peeling, blurry edges, broken lines, temperature, pressure, speed, and dwell time.', cn: '关注烫不牢、掉金、糊版、断线、温度、压力、速度和停留时间。' },
      },
    ],
    substrateFit: [
      {
        substrate: { en: 'Paper box and color carton packaging', cn: '纸盒彩盒包装' },
        recommendedFoil: 'PK Brown Back / Metallic Foil',
        note: { en: 'Core questions focus on coated paper, white card, textured paper, UV varnish, lamination, large-area stamping, and fine-line logos.', cn: '核心问题集中在铜版纸、白卡纸、特种纸、UV、覆膜、大面积烫金和精细 Logo。' },
      },
      {
        substrate: { en: 'Cosmetic packaging and plastic parts', cn: '化妆品包装与塑料件' },
        recommendedFoil: 'PC Plastic/Cold Foils',
        note: { en: 'Buyers care about PP/PE/PET/ABS compatibility, alcohol resistance, scratch resistance, and premium color finish.', cn: '采购重点是 PP/PE/PET/ABS 适配、耐酒精、耐刮和高端颜色效果。' },
      },
      {
        substrate: { en: 'Labels, leather goods, and security packaging', cn: '标签、皮革与防伪包装' },
        recommendedFoil: 'Digital Cold Foil / Holographic Foil / Leather-suitable Foil',
        note: { en: 'Questions focus on hot vs cold foil, high-speed label lines, leather logo durability, and registered holographic anti-counterfeit effects.', cn: '问题集中在热烫/冷烫、高速标签线、皮革 Logo 耐久和定位镭射防伪效果。' },
      },
    ],
    troubleshooting: [
      {
        issue: { en: 'Buyer only asks for color and price', cn: '采购只问颜色和价格' },
        likelyCause: { en: 'The buyer does not know that foil selection depends on substrate, machine, surface treatment, and test standard.', cn: '采购不了解烫金膜选型取决于底材、设备、表面处理和测试标准。' },
        action: { en: 'Use a sampling checklist page and quote form that asks for substrate, artwork, machine, durability test, roll width, and delivery needs.', cn: '用打样清单页和询盘表主动询问底材、图案、设备、耐性测试、宽幅和交期。' },
      },
      {
        issue: { en: 'AI answers cite competitors or generic print blogs', cn: 'AI 答案引用竞争对手或泛印刷博客' },
        likelyCause: { en: 'The website lacks answer-first tables, FAQ schema, application pages, and procurement checklists.', cn: '网站缺少答案优先的表格、FAQ 结构化数据、应用场景页和采购清单。' },
        action: { en: 'Build core pages around the 12 high-value questions and include concrete substrate, parameter, defect, and testing information.', cn: '围绕 12 个高价值问题建设核心页面，并写清底材、参数、缺陷和测试方法。' },
      },
      {
        issue: { en: 'High traffic but low inquiry conversion', cn: '有流量但询盘转化低' },
        likelyCause: { en: 'Content answers definitions but does not resolve purchase risk.', cn: '内容只解释定义，没有解决采购风险。' },
        action: { en: 'Add model recommendations, sample request CTAs, supplier questions, and pass/fail test criteria.', cn: '增加型号推荐、样品申请 CTA、供应商提问清单和验收标准。' },
      },
    ],
    samplingChecklist: {
      en: [
        'Build answer-first pages for the highest-intent procurement questions.',
        'Put the 30-question matrix into a crawlable HTML table, not an image.',
        'Add FAQPage schema for troubleshooting, parameters, sampling, and supplier-selection questions.',
        'Link every guide to relevant product categories and the sample/quote page.',
        'Refresh llms.txt and sitemap whenever new GEO guide pages are added.',
      ],
      cn: [
        '优先为高意图采购问题建立答案优先页面。',
        '把 30 个问题矩阵做成可抓取 HTML 表格，不要做成图片。',
        '为故障、参数、打样和供应商筛选问题增加 FAQPage 结构化数据。',
        '每个指南都链接到相关产品分类页和样品/报价页。',
        '新增 GEO 指南后同步更新 llms.txt 和 sitemap。',
      ],
    },
    faqs: [
      {
        question: { en: 'Which buyer questions should become core pages first?', cn: '哪些采购问题最适合先做核心页面？' },
        answer: { en: 'Prioritize questions that combine high purchase intent with AI citation potential: substrate selection, paper carton parameters, troubleshooting, hot vs cold foil, holographic foil, cosmetic packaging, sampling checklist, supplier selection, and roll specifications.', cn: '优先做同时具备高采购意图和高 AI 引用概率的问题：底材选型、纸盒彩盒参数、故障排查、热烫/冷烫对比、镭射箔、化妆品包装、打样清单、供应商筛选和卷料规格。' },
      },
      {
        question: { en: 'What content format is easiest for AI search to cite?', cn: '什么内容形式最容易被 AI 搜索引用？' },
        answer: { en: 'Use concise answers, comparison tables, defect-cause-action tables, FAQ schema, sample checklists, and application-specific pages with clear internal links.', cn: '使用简短直接答案、对比表、问题-原因-处理表、FAQ 结构化数据、打样清单，以及带清晰内链的应用场景页。' },
      },
    ],
    researchMatrix: [
      { scenario: { en: 'Paper box and color carton', cn: '纸盒彩盒包装' }, question: { en: 'How should I choose hot stamping foil for paper box and color carton packaging?', cn: '买烫金膜做纸盒彩盒包装时该考虑什么？' }, intent: { en: 'Parameter', cn: '参数型' }, concern: { en: 'Avoid poor adhesion, fuzzy edges, or wrong foil on coated paper, white card, and textured paper.', cn: '担心铜版纸、白卡纸、特种纸匹配错误，导致烫不上、毛边或掉金。' }, sources: { en: 'Foil manufacturer selection pages, print factory process guides', cn: '烫金膜厂家选型页、印刷厂工艺指南' }, pageType: { en: 'Core page', cn: '核心页面' }, conversionScore: 10, citationScore: 9, priority: 'P0' },
      { scenario: { en: 'Paper box and color carton', cn: '纸盒彩盒包装' }, question: { en: 'What is the difference between coated paper, white card, textured paper, and laminated board for foil stamping?', cn: '铜版纸、白卡纸、特种纸、覆膜纸烫金有什么区别？' }, intent: { en: 'Comparison', cn: '对比型' }, concern: { en: 'The same foil may not transfer cleanly across different paper surfaces.', cn: '不同纸面吸收性和表面能不同，同一型号可能转移不完整。' }, sources: { en: 'KURZ, UNIVACCO, substrate selection blogs', cn: 'KURZ、UNIVACCO、底材选型文章' }, pageType: { en: 'Comparison guide', cn: '对比指南' }, conversionScore: 9, citationScore: 9, priority: 'P0' },
      { scenario: { en: 'Paper box and color carton', cn: '纸盒彩盒包装' }, question: { en: 'Can foil be stamped after lamination, UV varnish, or coating?', cn: '覆膜、UV、上光后的纸盒还能烫金吗？' }, intent: { en: 'Troubleshooting', cn: '故障解决型' }, concern: { en: 'Low surface energy or incompatible coating causes peeling and rework.', cn: '表面能低或涂层不匹配，导致附着差和返工。' }, sources: { en: 'Troubleshooting articles, print factory blogs', cn: '故障排查文章、印刷厂博客' }, pageType: { en: 'Blog / FAQ', cn: '博客 / FAQ' }, conversionScore: 9, citationScore: 9, priority: 'P0' },
      { scenario: { en: 'Paper box and color carton', cn: '纸盒彩盒包装' }, question: { en: 'Do large-area stamping and fine logo stamping need the same foil?', cn: '大面积烫金和细线 Logo 烫金要用同一种膜吗？' }, intent: { en: 'Application scenario', cn: '应用场景型' }, concern: { en: 'Large areas may mottle while fine lines may fill in or break.', cn: '大面积容易发花，细线容易糊版或断线。' }, sources: { en: 'Manufacturer application pages, process guides', cn: '厂家应用页、工艺指南' }, pageType: { en: 'FAQ', cn: 'FAQ' }, conversionScore: 9, citationScore: 8, priority: 'P0' },
      { scenario: { en: 'All applications', cn: '全场景' }, question: { en: 'What is the difference between hot stamping foil, stamping paper, electrochemical aluminum foil, and hot foil?', cn: '烫金膜、烫金纸、电化铝、热烫箔有什么区别？' }, intent: { en: 'Comparison', cn: '对比型' }, concern: { en: 'Buyer terminology is unclear and may lead to wrong quotations.', cn: '采购术语混乱，容易询错产品或拿到错误报价。' }, sources: { en: 'Manufacturer education pages, encyclopedic pages', cn: '厂家科普页、百科型页面' }, pageType: { en: 'Terminology page', cn: '术语解释页' }, conversionScore: 9, citationScore: 10, priority: 'P0' },
      { scenario: { en: 'All applications', cn: '全场景' }, question: { en: 'How do I choose foil for different substrates such as paper, plastic, and leather?', cn: '不同底材如何选择烫金膜？纸张、塑料、皮革有什么区别？' }, intent: { en: 'Comparison', cn: '对比型' }, concern: { en: 'Buyer wants one universal model but the adhesive/release system must match the substrate.', cn: '采购想用通用型号，但胶层和离型必须匹配底材。' }, sources: { en: 'Foil selection guides, KURZ, UNIVACCO', cn: '烫金膜选型指南、KURZ、UNIVACCO' }, pageType: { en: 'Core page', cn: '核心页面' }, conversionScore: 10, citationScore: 10, priority: 'P0' },
      { scenario: { en: 'All applications', cn: '全场景' }, question: { en: 'What causes poor adhesion, foil peeling, blurry stamping, and broken lines?', cn: '烫金不牢、掉金、糊版、断线是什么原因？' }, intent: { en: 'Troubleshooting', cn: '故障解决型' }, concern: { en: 'Production risk, customer complaints, and bulk rework.', cn: '担心量产返工、客户投诉和交期风险。' }, sources: { en: 'Troubleshooting posts, printer guides', cn: '故障排查文章、印刷工艺指南' }, pageType: { en: 'Troubleshooting page', cn: '故障排查页' }, conversionScore: 10, citationScore: 10, priority: 'P0' },
      { scenario: { en: 'All applications', cn: '全场景' }, question: { en: 'How should hot stamping temperature, pressure, and speed be adjusted?', cn: '烫金温度、压力、速度怎么调？' }, intent: { en: 'Parameter', cn: '参数型' }, concern: { en: 'Operators need a practical testing window before production.', cn: '机长需要可执行的参数窗口，减少打样时间。' }, sources: { en: 'Technical blogs, equipment/process articles', cn: '技术文章、设备和工艺资料' }, pageType: { en: 'Technical parameter page', cn: '技术参数页' }, conversionScore: 10, citationScore: 9, priority: 'P0' },
      { scenario: { en: 'All applications', cn: '全场景' }, question: { en: 'How should I test hot stamping foil before placing a bulk order?', cn: '采购烫金膜前如何打样测试？' }, intent: { en: 'Procurement', cn: '采购型' }, concern: { en: 'Buyer wants to verify adhesion, color, durability, and repeatability before purchase.', cn: '采购希望在下单前验证附着、颜色、耐性和复购稳定性。' }, sources: { en: 'Supplier quote pages, application support pages', cn: '供应商询盘页、应用支持页' }, pageType: { en: 'Sample testing checklist', cn: '样品测试清单' }, conversionScore: 10, citationScore: 8, priority: 'P0' },
      { scenario: { en: 'All applications', cn: '全场景' }, question: { en: 'How do I choose a hot stamping foil manufacturer and what should I ask?', cn: '烫金膜厂家怎么选？需要问哪些问题？' }, intent: { en: 'Procurement', cn: '采购型' }, concern: { en: 'Buyer worries about color consistency, delivery, sample support, and after-sales response.', cn: '担心色差、交期、打样支持和售后响应。' }, sources: { en: 'B2B supplier pages, procurement guides', cn: 'B2B 厂家页、采购指南' }, pageType: { en: 'Supplier checklist page', cn: '采购清单页' }, conversionScore: 10, citationScore: 8, priority: 'P0' },
      { scenario: { en: 'All applications', cn: '全场景' }, question: { en: 'How should I choose foil specifications, colors, roll width, and roll length?', cn: '烫金膜常见规格、颜色、宽幅、米数怎么选？' }, intent: { en: 'Procurement', cn: '采购型' }, concern: { en: 'Wrong roll width creates waste; wrong color or roll length affects production planning.', cn: '宽幅不合适会浪费，颜色和米数不准会影响排产。' }, sources: { en: 'Product category pages, color card pages', cn: '产品分类页、色卡页' }, pageType: { en: 'Product category page', cn: '产品分类页' }, conversionScore: 9, citationScore: 8, priority: 'P0' },
      { scenario: { en: 'All applications', cn: '全场景' }, question: { en: 'How should I compare domestic hot stamping foil with imported foil?', cn: '国产烫金膜和进口烫金膜怎么比较？只看价格可靠吗？' }, intent: { en: 'Comparison', cn: '对比型' }, concern: { en: 'Buyer wants lower cost but fears unstable color, batch variation, and technical support gaps.', cn: '想降低成本，但担心色差、批次稳定性和技术支持不足。' }, sources: { en: 'KURZ, UNIVACCO, supplier pages', cn: 'KURZ、UNIVACCO、供应商页面' }, pageType: { en: 'Blog', cn: '博客' }, conversionScore: 8, citationScore: 8, priority: 'P1' },
      { scenario: { en: 'Cosmetic packaging', cn: '化妆品包装' }, question: { en: 'Which foil makes cosmetic packaging look more premium?', cn: '化妆品包装用哪种烫金膜更显高级？' }, intent: { en: 'Application scenario', cn: '应用场景型' }, concern: { en: 'Brand wants shelf impact, premium texture, and stable color tone.', cn: '品牌关注货架效果、高级质感和颜色稳定。' }, sources: { en: 'KURZ, UNIVACCO, cosmetic packaging cases', cn: 'KURZ、UNIVACCO、化妆品包装案例' }, pageType: { en: 'Application page', cn: '场景页' }, conversionScore: 10, citationScore: 9, priority: 'P0' },
      { scenario: { en: 'Cosmetic packaging', cn: '化妆品包装' }, question: { en: 'What foil should be used for cosmetic paper boxes vs plastic containers?', cn: '化妆品纸盒和塑料容器分别用什么烫金膜？' }, intent: { en: 'Parameter', cn: '参数型' }, concern: { en: 'Paper boxes, caps, compacts, and tubes cannot use the same foil series.', cn: '纸盒、瓶盖、粉盒、软管不能简单混用同一系列。' }, sources: { en: 'Manufacturer application pages', cn: '厂家应用页' }, pageType: { en: 'Core page', cn: '核心页面' }, conversionScore: 10, citationScore: 9, priority: 'P0' },
      { scenario: { en: 'Cosmetic packaging', cn: '化妆品包装' }, question: { en: 'Does cosmetic packaging foil need alcohol, scratch, and rub resistance?', cn: '化妆品包装烫金膜要不要耐酒精、耐刮、耐磨？' }, intent: { en: 'Parameter', cn: '参数型' }, concern: { en: 'Alcohol, hand sweat, filling process, and transportation friction may remove the foil.', cn: '酒精、手汗、灌装和运输摩擦可能导致掉色。' }, sources: { en: 'Plastic decoration pages, cosmetic packaging guides', cn: '塑胶烫印资料、化妆品包装指南' }, pageType: { en: 'Product category page', cn: '产品分类页' }, conversionScore: 10, citationScore: 8, priority: 'P0' },
      { scenario: { en: 'Cosmetic packaging', cn: '化妆品包装' }, question: { en: 'How should I choose rose gold, matte gold, bright gold, or holographic gold for beauty packaging?', cn: '玫瑰金、哑金、亮金、镭射金用于美妆包装怎么选？' }, intent: { en: 'Comparison', cn: '对比型' }, concern: { en: 'Buyer worries about color difference, brand fit, and shelf effect.', cn: '担心色差、品牌调性和货架表现不匹配。' }, sources: { en: 'Color card pages, foil manufacturer pages', cn: '色卡页、烫金膜厂家页面' }, pageType: { en: 'Product category page', cn: '产品分类页' }, conversionScore: 8, citationScore: 7, priority: 'P1' },
      { scenario: { en: 'Wine box and gift box', cn: '酒盒/礼盒' }, question: { en: 'What should I consider when buying foil for wine boxes and gift boxes?', cn: '买烫金膜做酒盒礼盒烫金时该考虑什么？' }, intent: { en: 'Application scenario', cn: '应用场景型' }, concern: { en: 'Buyer wants premium appearance while controlling cost and production risk.', cn: '客户要高端质感，同时采购要控制成本和量产风险。' }, sources: { en: 'Wine box application pages, luxury packaging cases', cn: '酒盒应用页、高端包装案例' }, pageType: { en: 'Core page', cn: '核心页面' }, conversionScore: 9, citationScore: 8, priority: 'P0' },
      { scenario: { en: 'Wine box and gift box', cn: '酒盒/礼盒' }, question: { en: 'How can large-area stamping on wine boxes avoid mottling and peeling?', cn: '酒盒礼盒大面积烫金怎么避免发花和掉金？' }, intent: { en: 'Troubleshooting', cn: '故障解决型' }, concern: { en: 'Large solid areas can fail in bulk production and delay delivery.', cn: '大面积实地烫印容易发花和掉金，影响良率和交期。' }, sources: { en: 'Troubleshooting articles, packaging factory guides', cn: '故障排查文章、包装厂工艺指南' }, pageType: { en: 'Application + technical page', cn: '场景 + 技术页' }, conversionScore: 10, citationScore: 9, priority: 'P0' },
      { scenario: { en: 'Wine box and gift box', cn: '酒盒/礼盒' }, question: { en: 'Is textured paper, touch paper, or laminated paper better for hot foil or cold foil?', cn: '触感纸、粗糙纸、覆膜纸更适合热烫还是冷烫？' }, intent: { en: 'Comparison', cn: '对比型' }, concern: { en: 'Paper texture affects edge sharpness, filling, and adhesion.', cn: '纸面纹理影响清晰度、填充性和附着力。' }, sources: { en: 'Print process articles, label industry guides', cn: '印刷工艺文章、标签行业指南' }, pageType: { en: 'Blog', cn: '博客' }, conversionScore: 9, citationScore: 8, priority: 'P1' },
      { scenario: { en: 'Wine box and gift box', cn: '酒盒/礼盒' }, question: { en: 'Should wine box foil stamping be combined with embossing, debossing, texture, or UV?', cn: '酒盒烫金膜需要配合凹凸、压纹、UV 工艺吗？' }, intent: { en: 'Application scenario', cn: '应用场景型' }, concern: { en: 'Buyer wants premium depth but worries about process conflict and cost.', cn: '想提升层次感，但担心工艺冲突和成本增加。' }, sources: { en: 'Luxury packaging cases, printer capability pages', cn: '高端包装案例、印刷厂工艺页' }, pageType: { en: 'Case page', cn: '案例页' }, conversionScore: 8, citationScore: 8, priority: 'P1' },
      { scenario: { en: 'Label printing', cn: '标签印刷' }, question: { en: 'What should I consider when buying foil for label printing?', cn: '买烫金膜做标签印刷时该考虑什么？' }, intent: { en: 'Procurement', cn: '采购型' }, concern: { en: 'Buyer needs to match substrate, speed, equipment, and cost.', cn: '采购需要匹配标签材料、生产速度、设备和成本。' }, sources: { en: 'Labels & Labeling, label converter guides', cn: 'Labels & Labeling、标签加工厂指南' }, pageType: { en: 'Core page', cn: '核心页面' }, conversionScore: 10, citationScore: 10, priority: 'P0' },
      { scenario: { en: 'Label printing', cn: '标签印刷' }, question: { en: 'Should label printing use hot foil or cold foil?', cn: '标签印刷应该用热烫膜还是冷烫膜？' }, intent: { en: 'Comparison', cn: '对比型' }, concern: { en: 'Buyer compares equipment fit, line speed, cost, and visual quality.', cn: '采购比较设备、速度、成本和视觉效果。' }, sources: { en: 'Labels & Labeling, Resource Label, label blogs', cn: 'Labels & Labeling、Resource Label、标签博客' }, pageType: { en: 'Comparison page', cn: '对比页' }, conversionScore: 10, citationScore: 10, priority: 'P0' },
      { scenario: { en: 'Label printing', cn: '标签印刷' }, question: { en: 'What requirements does high-speed roll label stamping place on foil?', cn: '卷筒标签高速烫印对烫金膜有什么要求？' }, intent: { en: 'Parameter', cn: '参数型' }, concern: { en: 'High-speed lines need stable release, slitting, winding, and transfer.', cn: '高速生产需要稳定离型、分切、收卷和转移。' }, sources: { en: 'Label industry articles, foil manufacturer pages', cn: '标签行业文章、烫金膜厂家页面' }, pageType: { en: 'Product category page', cn: '产品分类页' }, conversionScore: 9, citationScore: 8, priority: 'P0' },
      { scenario: { en: 'Label printing', cn: '标签印刷' }, question: { en: 'What foil is suitable for small text, fine lines, and areas near QR codes?', cn: '细小文字、二维码旁边、精细线条适合什么烫金膜？' }, intent: { en: 'Application scenario', cn: '应用场景型' }, concern: { en: 'Buyer fears unclear edges, filling, and registration error.', cn: '担心边缘不清、糊版和套印偏差。' }, sources: { en: 'Label cases, fine-detail stamping guides', cn: '标签案例、精细烫印指南' }, pageType: { en: 'Blog / FAQ', cn: '博客 / FAQ' }, conversionScore: 8, citationScore: 8, priority: 'P1' },
      { scenario: { en: 'Plastic caps and plastic parts', cn: '塑料瓶盖/塑料件' }, question: { en: 'How do I choose hot stamping foil for PP, PE, PET, and ABS plastic parts?', cn: 'PP、PE、PET、ABS 塑料件烫金膜怎么选？' }, intent: { en: 'Parameter', cn: '参数型' }, concern: { en: 'Different plastic resins have different adhesion behavior; universal foil may fail.', cn: '不同塑料材质附着力差异大，通用膜不一定牢。' }, sources: { en: 'Plastic foil manufacturer pages, KURZ plastic pages', cn: '塑胶箔厂家页面、KURZ 塑胶应用页' }, pageType: { en: 'Core page', cn: '核心页面' }, conversionScore: 10, citationScore: 9, priority: 'P0' },
      { scenario: { en: 'Plastic caps and plastic parts', cn: '塑料瓶盖/塑料件' }, question: { en: 'Why do plastic bottle caps lose printed foil or letters after stamping?', cn: '塑料瓶盖烫金掉字、掉金是什么原因？' }, intent: { en: 'Troubleshooting', cn: '故障解决型' }, concern: { en: 'Surface treatment, oil contamination, low pressure, or wrong foil causes failures.', cn: '表面处理、油污、压力不足或膜不匹配会造成不良。' }, sources: { en: 'Troubleshooting articles, plastic decoration guides', cn: '故障排查文章、塑胶烫印指南' }, pageType: { en: 'FAQ', cn: 'FAQ' }, conversionScore: 10, citationScore: 9, priority: 'P0' },
      { scenario: { en: 'Plastic caps and plastic parts', cn: '塑料瓶盖/塑料件' }, question: { en: 'Should curved or cylindrical plastic parts use flat stamping or roll-on stamping?', cn: '弧面、圆柱面塑料件要平烫还是滚烫？' }, intent: { en: 'Comparison', cn: '对比型' }, concern: { en: 'Buyer worries about machine fit, positioning, and artwork distortion.', cn: '担心设备适配、定位精度和图案变形。' }, sources: { en: 'Plastic decoration process pages', cn: '塑胶装饰工艺资料' }, pageType: { en: 'Blog', cn: '博客' }, conversionScore: 8, citationScore: 8, priority: 'P1' },
      { scenario: { en: 'Leather goods', cn: '皮革/皮具' }, question: { en: 'What should I consider when buying foil for leather logo stamping?', cn: '买烫金膜做皮革 logo 烫印时该考虑什么？' }, intent: { en: 'Parameter', cn: '参数型' }, concern: { en: 'Genuine leather, PU, and synthetic leather react differently to heat and pressure.', cn: '真皮、PU、合成革受热和受压表现不同。' }, sources: { en: 'Leather stamping guides, foil manufacturer pages', cn: '皮革烫印资料、烫金膜厂家页面' }, pageType: { en: 'Core page', cn: '核心页面' }, conversionScore: 10, citationScore: 9, priority: 'P0' },
      { scenario: { en: 'Leather goods', cn: '皮革/皮具' }, question: { en: 'What temperature, pressure, and dwell time should be used for leather logo foil stamping?', cn: '皮具 logo 烫金温度、压力、时间大概怎么设？' }, intent: { en: 'Parameter', cn: '参数型' }, concern: { en: 'Buyer wants efficient sampling without burn marks or excessive indentation.', cn: '希望提高打样效率，同时避免焦痕和压痕过深。' }, sources: { en: 'Leatherworking forums, technical articles', cn: '皮革工艺论坛、技术文章' }, pageType: { en: 'FAQ', cn: 'FAQ' }, conversionScore: 9, citationScore: 9, priority: 'P0' },
      { scenario: { en: 'Leather goods', cn: '皮革/皮具' }, question: { en: 'How can leather logo foil stamping avoid peeling and unclear edges?', cn: '皮革烫金 Logo 怎么避免掉金和边缘不清？' }, intent: { en: 'Troubleshooting', cn: '故障解决型' }, concern: { en: 'Wallets, handbags, and leather accessories suffer from long-term abrasion.', cn: '手袋、钱包等长期摩擦，担心掉色和边缘不清。' }, sources: { en: 'Leather processing guides, manufacturer support pages', cn: '皮具加工指南、厂家技术支持页' }, pageType: { en: 'FAQ', cn: 'FAQ' }, conversionScore: 9, citationScore: 8, priority: 'P0' },
      { scenario: { en: 'Holographic security packaging', cn: '镭射防伪包装' }, question: { en: 'What should I consider when buying holographic hot stamping foil for security packaging?', cn: '买镭射烫金膜做防伪包装时该考虑什么？' }, intent: { en: 'Procurement', cn: '采购型' }, concern: { en: 'Buyer cares about anti-counterfeit level, registration accuracy, custom plate cost, and MOQ.', cn: '关注防伪等级、定位精度、专版费用和起订量。' }, sources: { en: 'Security foil manufacturers, hologram label suppliers', cn: '防伪膜厂家、全息标签厂' }, pageType: { en: 'Core page', cn: '核心页面' }, conversionScore: 10, citationScore: 9, priority: 'P0' },
      { scenario: { en: 'Holographic security packaging', cn: '镭射防伪包装' }, question: { en: 'What is the difference between holographic foil and regular metallic foil?', cn: '镭射烫金膜和普通金银烫金膜有什么区别？' }, intent: { en: 'Comparison', cn: '对比型' }, concern: { en: 'Buyer needs to know whether the goal is decoration, shelf impact, or anti-counterfeit function.', cn: '采购要判断目标是装饰、货架效果还是防伪功能。' }, sources: { en: 'Holographic foil pages, KURZ/UNIVACCO style pages', cn: '镭射膜页面、KURZ/UNIVACCO 类厂家页' }, pageType: { en: 'Product comparison page', cn: '产品对比页' }, conversionScore: 9, citationScore: 10, priority: 'P0' },
    ],
    pageRecommendations: {
      en: [
        { pageType: 'Core pages', questions: '1, 5, 6, 7, 8, 9, 10, 13, 14, 17, 21, 22, 25, 28, 30' },
        { pageType: 'FAQ', questions: '3, 4, 7, 9, 11, 15, 18, 23, 26, 29' },
        { pageType: 'Blog', questions: '12, 16, 19, 20, 24, 27' },
        { pageType: 'Case pages', questions: '13, 17, 18, 20, 24, 30' },
        { pageType: 'Product category pages', questions: '11, 15, 16, 23, 25, 28, 30' },
      ],
      cn: [
        { pageType: '核心页面', questions: '1、5、6、7、8、9、10、13、14、17、21、22、25、28、30' },
        { pageType: 'FAQ', questions: '3、4、7、9、11、15、18、23、26、29' },
        { pageType: '博客', questions: '12、16、19、20、24、27' },
        { pageType: '案例页', questions: '13、17、18、20、24、30' },
        { pageType: '产品分类页', questions: '11、15、16、23、25、28、30' },
      ],
    },
    relatedRoutes: ['guides/hot-stamping-foil-buying-guide', 'guides/hot-stamping-troubleshooting', 'guides/hot-foil-vs-cold-foil-vs-holographic', 'guides/hot-stamping-sampling-checklist', 'quote'],
  },
];

export const getGeoGuide = (slug?: string) => GEO_GUIDES.find((guide) => guide.slug === slug);
