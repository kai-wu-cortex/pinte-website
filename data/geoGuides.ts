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
];

export const getGeoGuide = (slug?: string) => GEO_GUIDES.find((guide) => guide.slug === slug);

