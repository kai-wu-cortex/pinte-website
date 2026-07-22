'use client';

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { ProductId } from '../types';
import { ArrowLeft, Layers, Thermometer, CheckCircle2, Star, Box, Palette, HelpCircle, ChevronRight } from 'lucide-react';
import SEOMeta from '../components/SEOMeta';
import QuoteRequest from '../components/QuoteRequest';

const ProductCategory: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { content, ui, lang } = useLanguage();
  const navigate = useNavigate();
  const [detailTab, setDetailTab] = useState<'overview' | 'specs' | 'apps' | 'faq'>('overview');
  const [showQuote, setShowQuote] = useState(false);

  // Validate ID and get product
  const product = content.PRODUCT_DATA[id as ProductId];

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Product Category Not Found</h2>
          <button onClick={() => navigate(`/${lang}/products`)} className="mt-4 text-pinte-blue underline">Back to Catalog</button>
        </div>
      </div>
    );
  }

  if (showQuote) {
     return <QuoteRequest onBack={() => setShowQuote(false)} ui={ui.quote} />;
  }

  // SEO config based on product category id
  const seoConfig: Record<string, {
    cn: { title: string; description: string; keywords: string[] };
    en: { title: string; description: string; keywords: string[] };
  }> = {
    PK: {
      cn: {
        title: `${product.name} | 粗面纸/皮革/酒盒礼盒 Hot Stamping Foil 烫金膜 | PINTE品特`,
        description: 'PK咖啡底系列专为粗糙不平整表面设计的烫金箔，特别适合粗纹纸、压纹皮革、特种纸等难烫材料，特有抗氧化涂层保证重油墨纸张烫后光泽不发黑。东莞品特专业生产，供应东南亚市场。',
        keywords: ['PK咖啡底', 'PK系列', '粗面烫金箔', '粗糙表面烫金', '重油墨烫金', '抗氧化烫金箔', '粗纹纸烫金', '压纹皮革烫金', '特种纸烫金', 'PK咖啡底烫金箔厂家', '东莞PK烫金箔', '东南亚粗面烫金箔供应商', '难烫材料专用烫金箔'],
      },
      en: {
        title: `${product.name} | Hot Stamping Foil for Rough Paper, Leather, Wine & Gift Boxes | PINTE`,
        description: 'PK Brown Back series hot stamping foil designed for rough and uneven surfaces, specially for rough paper, embossed leather, specialty paper. Special anti-oxidation coating maintains gloss on heavy ink paper. Professional manufacturer from Dongguan China, supplying Southeast Asia market.',
        keywords: ['PK brown back foil', 'PK series', 'rough surface foil', 'heavy ink oxidation resistant', 'rough paper stamping', 'embossed leather stamping', 'specialty paper foil', 'PK brown back foil manufacturer', 'Dongguan China', 'rough surface hot stamping foil supplier for Southeast Asia'],
      },
    },
    PC: {
      cn: {
        title: `${product.name} | 塑料件/ABS/PP/PVC/化妆品包装 Hot Stamping Foil 烫金膜 | PINTE品特`,
        description: 'PC系列专为塑胶材质设计，支持ABS、PS、PVC、亚克力等多种塑胶，优异耐酒精性能，完美通过百格测试，是化妆品包材烫金的最佳选择。',
        keywords: ['PC系列', 'PC塑胶烫金箔', '塑胶烫金', '化妆品包材烫金', 'ABS烫金箔', 'PS烫金', 'PVC烫金', '亚克力烫金', '耐酒精烫金箔', '塑胶烫金箔厂家', '东莞PC烫金箔', '化妆品包装烫金箔供应', '东南亚塑胶烫金箔'],
      },
      en: {
        title: `${product.name} | Plastic Hot Stamping Foil for ABS, PP, PVC & Cosmetic Packaging | PINTE`,
        description: 'PC series hot stamping foil specially engineered for plastic materials, supports ABS, PS, PVC, acrylic and other plastics. Excellent alcohol resistance, passes cross-cut test perfectly, ideal for cosmetic packaging hot stamping.',
        keywords: ['PC series', 'plastic hot stamping foil', 'cosmetic packaging foil', 'ABS stamping foil', 'PS stamping', 'PVC stamping', 'acrylic stamping', 'alcohol resistant foil', 'plastic foil manufacturer Dongguan China', 'hot stamping foil for plastic packaging Southeast Asia'],
      },
    },
    PLPY: {
      cn: {
        title: `${product.name} | 纸盒礼盒/标签/高遮盖 Pigment Hot Stamping Foil 颜料箔 | PINTE品特`,
        description: 'PL/PY颜料箔是以颜料为原料的非镀铝产品，解决印刷油墨遮盖力不足问题，色彩饱满呈现纯正色彩，适合各种纸质基材和礼品包装。',
        keywords: ['PL/PY颜料箔', '颜料烫金箔', '非镀铝烫金箔', '高遮盖力烫金', '色彩纯正烫金箔', '铜版纸颜料箔', '白卡纸烫金', '礼品盒颜料箔', '日期打码颜料箔', '东莞颜料箔生产厂家', '高档包装颜料烫金箔', '东南亚颜料箔供应商'],
      },
      en: {
        title: `${product.name} | Pigment Hot Stamping Foil for Paper Gift Boxes, Tags & Opaque Color | PINTE`,
        description: 'PL/PY pigment foils are non-aluminized products using pigment as raw material, solves insufficient ink coverage problem, provides full and pure colors, suitable for various paper substrates and gift packaging.',
        keywords: ['PL/PY pigment foil', 'pigment hot stamping foil', 'non-aluminized foil', 'high coverage foil', 'pure color foil', 'pigment foil for gift box', 'date coding foil', 'pigment foil manufacturer Dongguan China', 'premium packaging pigment foil supplier'],
      },
    },
    DIGITAL: {
      cn: {
        title: `${product.name} | 标签/短单/数码增效 Digital Cold Foil 冷烫膜 | PINTE品特`,
        description: '数码冷烫系列无需制版，直接在UV光油或数码墨层上进行固化转移，适合个性化定制与小批量生产，适配MGI、Scodix等数码增效设备。',
        keywords: ['数码冷烫', '冷烫箔', '数码烫金', '无需制版烫金', '个性化烫金', '小批量烫金', '数码增效烫金', 'MGI冷烫', 'Scodix烫金', 'UV冷烫箔', '东莞数码冷烫箔厂家', '东南亚数码烫金供应商'],
      },
      en: {
        title: `${product.name} | Digital Cold Foil for Labels, MGI, Scodix & Short-Run Packaging | PINTE`,
        description: 'Digital cold foil series requires no plate making, direct curing transfer on UV varnish or digital toner layers, ideal for personalization and short-run production, compatible with MGI, Scodix and other digital enhancement equipment.',
        keywords: ['digital cold foil', 'cold foil stamping', 'digital hot stamping', 'plate-free foil', 'personalized packaging foil', 'short-run foil', 'digital enhancement foil', 'MGI compatible foil', 'Scodix compatible foil', 'UV curable cold foil', 'digital foil manufacturer China'],
      },
    },
    GLITTER: {
      cn: {
        title: `${product.name} | 美甲/圣诞饰品/丝印 Glitter Powder 金葱粉 | PINTE品特`,
        description: '品特25年生产经验金葱粉，六角形切片，耐高温耐溶剂，光泽持久不褪色，规格齐全从1/4英寸到1/500英寸，适合圣诞饰品、美甲、丝网印刷等应用。',
        keywords: ['金葱粉', '闪粉', '六角形金葱粉', '耐高温金葱粉', '耐溶剂金葱粉', '高品质闪粉', '美甲金葱粉', '圣诞饰品金葱粉', '丝网印刷金葱粉', '东莞金葱粉厂家', '25年生产经验金葱粉'],
      },
      en: {
        title: `${product.name} | Premium Glitter Powder for Nail Art, Decoration & Screen Printing | PINTE`,
        description: 'PINTE premium glitter powder with 25 years production experience, hexagonal cut, heat and solvent resistant, long-lasting shine no fading. Full range of sizes from 1/4" to 1/500", suitable for Christmas decorations, nail art, screen printing and more.',
        keywords: ['premium glitter powder', 'hexagonal glitter', 'heat resistant glitter', 'solvent resistant glitter', 'glitter for nail art', 'glitter for Christmas decorations', 'glitter for screen printing', 'glitter manufacturer Dongguan China', '25 years experience glitter supplier'],
      },
    },
  };

  const currentSeo = seoConfig[id] || {
    cn: { title: product.name, description: product.description, keywords: [product.name] },
    en: { title: product.name, description: product.description, keywords: [product.name] },
  };

  const seo = lang === 'cn' ? currentSeo.cn : currentSeo.en;
  const structureLayersByCategory: Record<string, Array<{ name: string; desc: string }>> = {
    PK: lang === 'cn'
      ? [
          { name: 'PET 基膜', desc: '支撑涂布、分切和烫印过程。' },
          { name: '离型层', desc: '控制粗面纸、压纹纸和皮革上的转移完整度。' },
          { name: '金属/色层', desc: '提供金、银、哑光和镭射等视觉效果。' },
          { name: '抗氧化保护层', desc: '减少重油墨和深色底材上的发黑风险。' },
          { name: '胶层', desc: '增强粗糙底材、充皮纸和皮革表面的附着。' },
        ]
      : [
          { name: 'PET carrier', desc: 'Supports coating, slitting, and stamping stability.' },
          { name: 'Release layer', desc: 'Controls complete transfer on rough paper, embossed board, and leather.' },
          { name: 'Metallic / color layer', desc: 'Creates gold, silver, matte, and holographic effects.' },
          { name: 'Anti-oxidation layer', desc: 'Reduces darkening risk on heavy ink and dark substrates.' },
          { name: 'Adhesive layer', desc: 'Improves bonding on rough paper, leatherette paper, and leather.' },
        ],
    PC: lang === 'cn'
      ? [
          { name: 'PET 基膜', desc: '保证塑胶件高速烫印和分切稳定。' },
          { name: '离型层', desc: '帮助细 Logo、瓶盖和化妆品部件清晰转移。' },
          { name: '金属/镭射层', desc: '形成镜面金属、镭射或刷纹装饰效果。' },
          { name: '塑胶专用胶层', desc: '匹配 ABS、PP、PVC、PET、PMMA 等塑料表面。' },
          { name: '耐性测试重点', desc: '建议验证百格、耐磨、耐酒精和耐刮。' },
        ]
      : [
          { name: 'PET carrier', desc: 'Keeps slitting and high-speed plastic stamping stable.' },
          { name: 'Release layer', desc: 'Supports clean transfer for fine logos, caps, and cosmetic components.' },
          { name: 'Metallic / holographic layer', desc: 'Creates mirror metallic, holographic, or brushed decoration.' },
          { name: 'Plastic adhesive layer', desc: 'Matches ABS, PP, PVC, PET, PMMA, and related plastic surfaces.' },
          { name: 'Testing focus', desc: 'Cross-cut, rub, alcohol, and scratch tests should be confirmed.' },
        ],
    PLPY: lang === 'cn'
      ? [
          { name: 'PET 基膜', desc: '适配常规热烫设备和卷料分切。' },
          { name: '离型层', desc: '帮助纯色图案稳定转移。' },
          { name: '颜料色层', desc: '不依赖镀铝反射，提供高遮盖纯色。' },
          { name: '光泽/哑光表面', desc: 'PL 偏亮面，PY 偏哑面。' },
          { name: '胶层', desc: '适配纸张、卡纸、标签和部分皮革底材。' },
        ]
      : [
          { name: 'PET carrier', desc: 'Fits standard hot stamping and roll slitting.' },
          { name: 'Release layer', desc: 'Supports stable transfer for opaque color artwork.' },
          { name: 'Pigment color layer', desc: 'Uses pigment color instead of metallic reflection for high coverage.' },
          { name: 'Gloss / matte surface', desc: 'PL is glossy; PY is matte.' },
          { name: 'Adhesive layer', desc: 'Fits paper, board, labels, and selected leather substrates.' },
        ],
    DIGITAL: lang === 'cn'
      ? [
          { name: 'PET 基膜', desc: '适合数码增效设备的卷料运行。' },
          { name: '离型层', desc: '配合 UV 光油或数码胶层转移。' },
          { name: '金属/镭射层', desc: '用于标签、短单和可变金属效果。' },
          { name: '冷烫转移层', desc: '需与 UV/LED 固化体系匹配。' },
          { name: '测试重点', desc: '确认胶水、固化能量、线速和套准。' },
        ]
      : [
          { name: 'PET carrier', desc: 'Runs on digital embellishment and cold foil equipment.' },
          { name: 'Release layer', desc: 'Transfers with UV varnish or digital adhesive layers.' },
          { name: 'Metallic / holographic layer', desc: 'Creates label, short-run, and variable metallic effects.' },
          { name: 'Cold foil transfer layer', desc: 'Must match the UV/LED curing system.' },
          { name: 'Testing focus', desc: 'Confirm adhesive, curing energy, line speed, and registration.' },
        ],
    GLITTER: lang === 'cn'
      ? [
          { name: 'PET 原膜', desc: '作为金葱粉基础材料。' },
          { name: '颜色/镀层', desc: '形成金属、镭射或彩色闪光效果。' },
          { name: '保护涂层', desc: '提升耐温、耐溶剂和色彩稳定性。' },
          { name: '精密切片', desc: '可切六角、条形等规格。' },
          { name: '筛分包装', desc: '按粒径和用途分类供应。' },
        ]
      : [
          { name: 'PET base film', desc: 'Base material for glitter production.' },
          { name: 'Color / metallized layer', desc: 'Creates metallic, holographic, or colored sparkle.' },
          { name: 'Protective coating', desc: 'Improves heat, solvent, and color stability.' },
          { name: 'Precision cutting', desc: 'Supports hexagonal, strip, and custom particle shapes.' },
          { name: 'Screening and packing', desc: 'Sorted by particle size and application.' },
        ],
  };
  const structureLayers = structureLayersByCategory[id] || structureLayersByCategory.PK;
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    alternateName: seo.keywords.slice(0, 6),
    description: seo.description,
    image: product.heroImage,
    brand: {
      '@type': 'Brand',
      name: 'PINTE',
    },
    manufacturer: {
      '@type': 'Organization',
      name: 'PINTE 品特',
      legalName: 'Dongguan Best Craftwork Products Co., Ltd.',
      url: 'https://www.pintecl.com',
      logo: 'https://www.pintecl.com/logo.svg',
    },
    category: product.subtitle,
    material: product.substrates.join(', '),
    additionalProperty: [
      ...product.params.map((param) => ({
        '@type': 'PropertyValue',
        name: param.label,
        value: param.value,
      })),
      {
        '@type': 'PropertyValue',
        name: lang === 'cn' ? '适用底材' : 'Compatible substrates',
        value: product.substrates.join(', '),
      },
      {
        '@type': 'PropertyValue',
        name: lang === 'cn' ? '应用场景' : 'Applications',
        value: product.applications.join(', '),
      },
      {
        '@type': 'PropertyValue',
        name: lang === 'cn' ? '颜色/效果' : 'Colors and effects',
        value: product.colors.join(', '),
      },
    ],
  };
  const categoryFaqs = [
    {
      q: lang === 'cn' ? '这款烫金箔适合什么材质？' : 'What materials is this hot stamping foil suitable for?',
      a: lang === 'cn'
        ? `${product.name} 适合 ${product.substrates.join('、')} 等底材。批量采购前建议提供真实底材做温度、压力和附着力测试。`
        : `${product.name} is suitable for ${product.substrates.join(', ')}. Before bulk purchase, test temperature, pressure, and adhesion on the real substrate.`,
    },
    {
      q: lang === 'cn' ? '可以提供定制颜色吗？' : 'Do you offer custom colors?',
      a: lang === 'cn'
        ? '可以。PINTE 支持 Pantone 专色、宽幅、卷长和样卷测试，具体起订量按规格确认。'
        : 'Yes. PINTE supports Pantone matching, custom width, custom roll length, and sample roll testing. MOQ depends on the specification.',
    },
    {
      q: lang === 'cn' ? '推荐烫印温度是多少？' : 'What stamping temperature is recommended?',
      a: lang === 'cn'
        ? `平面烫印参考 ${product.temp.flat}，圆面/曲面烫印参考 ${product.temp.round}。实际参数需结合底材、设备和图案面积打样确认。`
        : `Flat stamping reference: ${product.temp.flat}; round or curved stamping reference: ${product.temp.round}. Final parameters should be confirmed by sampling with the substrate, machine, and artwork area.`,
    },
  ];
  const procurementProfiles: Record<string, {
    process: string;
    machineType: string;
    testWindow: string;
    qualityTests: string;
    moqPolicy: string;
    sampleNote: string;
  }> = {
    PC: lang === 'cn'
      ? {
          process: '塑料件热烫、圆面滚烫、局部 Logo 转印，必要时配合底涂、火焰或电晕处理。',
          machineType: '平烫机、滚烫机、瓶盖/化妆品包材自动烫印设备。',
          testWindow: `可从平面 ${product.temp.flat}、圆面 ${product.temp.round} 做起点测试；最终温度、压力、速度和停留时间需用真实 ABS、PP、PVC、PET 或亚克力部件打样确认。`,
          qualityTests: '百格附着、耐酒精擦拭、耐磨、耐刮、耐温、转移完整度。',
          moqPolicy: '可提供色卡、样卷、分切规格和按塑料底材推荐型号；起订量、卷长和定制周期按颜色、宽幅和订单需求确认。',
          sampleNote: '塑胶件请提供树脂类型、表面处理、油污清洁方式、图案面积和耐性测试标准。',
        }
      : {
          process: 'Plastic hot stamping, roll-on stamping, local logo transfer, with primer, flame, or corona treatment if required.',
          machineType: 'Flat hot stamping machines, roll-on stamping machines, automatic cap and cosmetic component decorators.',
          testWindow: `Start testing around ${product.temp.flat} for flat parts and ${product.temp.round} for round parts; final temperature, pressure, speed, and dwell time must be confirmed on real ABS, PP, PVC, PET, or acrylic components.`,
          qualityTests: 'Cross-cut adhesion, alcohol rub, abrasion, scratch, heat resistance, and transfer completeness.',
          moqPolicy: 'Color cards, sample rolls, slitting specifications, and substrate-based model recommendations are available. MOQ, roll length, and custom lead time depend on color, width, and order requirement.',
          sampleNote: 'For plastic parts, send resin type, surface treatment, cleaning method, artwork area, and required durability tests.',
        },
    DIGITAL: lang === 'cn'
      ? {
          process: '冷烫、数码冷烫、UV/LED 固化转印、短单和可变数据金属效果。',
          machineType: 'MGI、Scodix、数码增效设备、标签冷烫线和 UV 胶水系统。',
          testWindow: '重点确认 UV 胶水、固化能量、线速、套准和离型状态；冷烫参数需按设备、胶水和标签材料打样确认。',
          qualityTests: '转移完整度、套准、耐磨、耐刮、胶水固化、收卷稳定和后加工兼容性。',
          moqPolicy: '可提供样卷、宽幅分切、金银/镭射/特殊效果匹配；起订量和交期按宽幅、效果和设备测试要求确认。',
          sampleNote: '请提供设备型号、UV 胶水品牌、标签材料、线速范围、图案面积和是否需要覆膜或上光。',
        }
      : {
          process: 'Cold foil transfer, digital cold foil, UV/LED curing transfer, short-run and variable metallic decoration.',
          machineType: 'MGI, Scodix, digital embellishment equipment, label cold foil lines, and UV adhesive systems.',
          testWindow: 'Confirm UV adhesive, curing energy, line speed, registration, and release behavior. Cold foil settings must be sampled with the machine, adhesive, and label stock.',
          qualityTests: 'Transfer completeness, registration, rub, scratch, adhesive curing, rewinding stability, and post-process compatibility.',
          moqPolicy: 'Sample rolls, slitting widths, metallic/holographic/special finishes, and equipment-based matching are available. MOQ and lead time depend on width, effect, and testing requirement.',
          sampleNote: 'Send machine model, UV adhesive brand, label material, line speed range, artwork area, and whether lamination or varnish is required.',
        },
    default: lang === 'cn'
      ? {
          process: '热烫、局部转印、金属色/颜料色效果和按底材匹配的烫印工艺。',
          machineType: '平烫机、圆压圆/滚烫设备、标签线和包装后道烫印设备。',
          testWindow: `参考温度为平面 ${product.temp.flat}、圆面 ${product.temp.round}；实际参数需按底材、设备、图案面积和版材打样确认。`,
          qualityTests: '附着力、耐磨、耐酒精、耐刮、耐温、耐折和转移完整度。',
          moqPolicy: '支持色卡、样卷、分切规格和定制颜色；起订量、卷长、宽幅和交期按订单确认。',
          sampleNote: '请提供真实底材、表面处理、印刷/覆膜信息、图案面积和验收测试标准。',
        }
      : {
          process: 'Hot stamping, local transfer, metallic/pigment effects, and substrate-matched foil stamping processes.',
          machineType: 'Flat stamping machines, rotary/roll-on equipment, label lines, and packaging finishing machines.',
          testWindow: `Reference settings are ${product.temp.flat} for flat stamping and ${product.temp.round} for round stamping; final settings must be confirmed by sampling with substrate, machine, artwork area, and die.`,
          qualityTests: 'Adhesion, rub, alcohol, scratch, heat, folding, and transfer completeness.',
          moqPolicy: 'Color cards, sample rolls, slitting specifications, and custom colors are supported. MOQ, roll length, width, and lead time are confirmed by order.',
          sampleNote: 'Send real substrate, surface treatment, printing/lamination details, artwork area, and acceptance test standard.',
        },
  };
  const procurementProfile = procurementProfiles[id] || procurementProfiles.default;
  const categoryFaqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: categoryFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  // Helper for icons (needs to match map used in main app roughly or just use basic ones)
  const ICON_MAP: Record<string, any> = { Layers, Star, CheckCircle2, Box, Palette };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900 animate-in fade-in duration-500">
      <SEOMeta
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        type="website"
        locale={lang === 'cn' ? 'zh_CN' : 'en_US'}
        canonicalUrl={`/${lang}/products/category/${id}`}
      />
      <script type="application/ld+json">
        {JSON.stringify(categoryFaqSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(productSchema)}
      </script>
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 flex flex-col sm:h-20 sm:flex-row items-center justify-between gap-3">
           <button
            onClick={() => navigate(`/${lang}/products`)}
            className="flex items-center gap-2 text-neutral-600 hover:text-pinte-blue font-medium transition-colors self-start sm:self-center"
           >
             <ArrowLeft size={20} />
             <span>{ui.products.backToList}</span>
           </button>
           <h2 className="text-lg font-bold hidden md:block">{product.name}</h2>
           <div className="flex gap-2 overflow-x-auto pb-1 w-full sm:w-auto no-scrollbar">
             {(['overview', 'specs', 'apps', 'faq'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDetailTab(tab)}
                  className={`px-3 sm:px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    detailTab === tab
                      ? 'bg-pinte-blue text-white shadow-md'
                      : 'text-neutral-500 hover:bg-neutral-100'
                  }`}
                >
                  {ui.products.tabs[tab as keyof typeof ui.products.tabs] || (tab === 'faq' ? 'FAQ' : tab)}
                </button>
             ))}
           </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-neutral-100 mb-12 flex flex-col md:flex-row gap-12 items-center">
           <div className="flex-1">
              <span className="text-pinte-blue font-bold tracking-wider text-sm uppercase mb-4 block">{product.subtitle}</span>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-6">{product.name}</h1>
              <p className="text-lg text-neutral-600 leading-relaxed mb-8">{product.description}</p>
              <div className="flex gap-4">
                 <button
                    onClick={() => setShowQuote(true)}
                    className="bg-pinte-blue text-white px-8 py-3 rounded-full font-bold hover:bg-pinte-dark transition-colors shadow-lg shadow-pinte-blue/30"
                 >
                   {ui.products.getSample}
                 </button>
              </div>
           </div>
           <div className="flex-1 w-full h-[400px]">
              <img src={product.heroImage} alt={`${seo.title} product roll and stamping effect`} className="w-full h-full object-cover rounded-3xl shadow-soft" />
           </div>
        </div>

        <section className="bg-white rounded-[2rem] border border-neutral-100 shadow-sm p-6 md:p-8 mb-12">
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-[0.24em] text-pinte-blue">
              {lang === 'cn' ? '采购选型信息' : 'Buyer Selection Information'}
            </span>
            <h2 className="mt-3 text-2xl md:text-3xl font-display font-bold text-neutral-900">
              {lang === 'cn'
                ? `${product.name}：结构、规格、用途与特性`
                : `${product.name}: Structure, Specifications, Applications, and Features`}
            </h2>
            <p className="mt-3 text-neutral-600 leading-relaxed">
              {lang === 'cn'
                ? `${product.name} 适用于 ${product.substrates.join('、')}，常见应用包括 ${product.applications.join('、')}。批量采购前建议用真实底材确认温度、压力、速度、附着力和转移完整度。`
                : `${product.name} is suitable for ${product.substrates.join(', ')} and commonly used in ${product.applications.join(', ')}. Before bulk orders, confirm temperature, pressure, speed, adhesion, and transfer completeness on the actual substrate.`}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">{lang === 'cn' ? '产品特性' : 'Product Features'}</h3>
              <ul className="space-y-3">
                {product.features.map((feature, i) => (
                  <li key={i} className="flex gap-3 text-neutral-700">
                    <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
                    <span><strong>{feature.title}:</strong> {feature.desc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">{lang === 'cn' ? '产品用途' : 'Product Applications'}</h3>
              <div className="flex flex-wrap gap-3">
                {product.applications.map((app, i) => (
                  <span key={i} className="rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm font-medium text-neutral-700">
                    {app}
                  </span>
                ))}
              </div>
              <h3 className="text-xl font-bold mt-8 mb-4">{lang === 'cn' ? '适用底材' : 'Compatible Substrates'}</h3>
              <div className="flex flex-wrap gap-3">
                {product.substrates.map((sub, i) => (
                  <span key={i} className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-pinte-blue">
                    {sub}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">{lang === 'cn' ? '产品结构' : 'Product Structure'}</h3>
              <div className="rounded-2xl border border-neutral-100 overflow-hidden">
                {structureLayers.map((layer, i) => (
                  <div key={layer.name} className={`p-4 ${i % 2 === 0 ? 'bg-neutral-50' : 'bg-white'} border-b border-neutral-100 last:border-b-0`}>
                    <div className="flex items-start gap-3">
                      <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-pinte-blue text-xs font-bold text-white">
                        {i + 1}
                      </span>
                      <div>
                        <div className="font-bold text-neutral-900">{layer.name}</div>
                        <div className="text-sm text-neutral-600 leading-relaxed">{layer.desc}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">{lang === 'cn' ? '产品规格表' : 'Product Specification Table'}</h3>
              <div className="overflow-hidden rounded-2xl border border-neutral-100">
                <table className="w-full text-sm">
                  <tbody>
                    {product.params.map((param) => (
                      <tr key={param.label} className="border-b border-neutral-100 last:border-b-0">
                        <th className="w-1/3 bg-neutral-50 px-4 py-3 text-left font-semibold text-neutral-600">{param.label}</th>
                        <td className="px-4 py-3 font-medium text-neutral-900">{param.value}</td>
                      </tr>
                    ))}
                    <tr className="border-b border-neutral-100">
                      <th className="bg-neutral-50 px-4 py-3 text-left font-semibold text-neutral-600">{lang === 'cn' ? '颜色/效果' : 'Colors / Effects'}</th>
                      <td className="px-4 py-3 font-medium text-neutral-900">{product.colors.join(', ')}</td>
                    </tr>
                    <tr>
                      <th className="bg-neutral-50 px-4 py-3 text-left font-semibold text-neutral-600">{lang === 'cn' ? '建议测试' : 'Recommended Tests'}</th>
                      <td className="px-4 py-3 font-medium text-neutral-900">
                        {procurementProfile.qualityTests}
                      </td>
                    </tr>
                    <tr className="border-t border-neutral-100">
                      <th className="bg-neutral-50 px-4 py-3 text-left font-semibold text-neutral-600">{lang === 'cn' ? '适用工艺' : 'Suitable Process'}</th>
                      <td className="px-4 py-3 font-medium text-neutral-900">{procurementProfile.process}</td>
                    </tr>
                    <tr className="border-t border-neutral-100">
                      <th className="bg-neutral-50 px-4 py-3 text-left font-semibold text-neutral-600">{lang === 'cn' ? '机器类型' : 'Machine Type'}</th>
                      <td className="px-4 py-3 font-medium text-neutral-900">{procurementProfile.machineType}</td>
                    </tr>
                    <tr className="border-t border-neutral-100">
                      <th className="bg-neutral-50 px-4 py-3 text-left font-semibold text-neutral-600">{lang === 'cn' ? '建议打样参数' : 'Sampling Parameters'}</th>
                      <td className="px-4 py-3 font-medium text-neutral-900">{procurementProfile.testWindow}</td>
                    </tr>
                    <tr className="border-t border-neutral-100">
                      <th className="bg-neutral-50 px-4 py-3 text-left font-semibold text-neutral-600">{lang === 'cn' ? 'MOQ / 样品政策' : 'MOQ / Sample Policy'}</th>
                      <td className="px-4 py-3 font-medium text-neutral-900">{procurementProfile.moqPolicy}</td>
                    </tr>
                    <tr className="border-t border-neutral-100">
                      <th className="bg-neutral-50 px-4 py-3 text-left font-semibold text-neutral-600">{lang === 'cn' ? '询价资料' : 'Quote Information'}</th>
                      <td className="px-4 py-3 font-medium text-neutral-900">{procurementProfile.sampleNote}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {detailTab === 'overview' && (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4">
              {product.features.map((feature, i) => {
                 const IconComponent = ICON_MAP[feature.icon] || Star;
                 return (
                   <div key={i} className="bg-white p-8 rounded-[2rem] border border-neutral-100 shadow-sm hover:shadow-md transition-all">
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-pinte-blue mb-6">
                         <IconComponent size={24} />
                      </div>
                      <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                      <p className="text-neutral-500 leading-relaxed">{feature.desc}</p>
                   </div>
                 );
              })}
           </div>
        )}

        {detailTab === 'specs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4">
             <div className="bg-white p-8 rounded-[2rem] border border-neutral-100">
               <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Layers size={20} className="text-pinte-blue"/> {ui.products.techSpecs}</h3>
               <div className="space-y-4">
                 {product.params.map((p, i) => (
                   <div key={i} className="flex justify-between border-b border-neutral-100 pb-2 last:border-0">
                     <span className="text-neutral-500">{p.label}</span>
                     <span className="font-semibold text-neutral-900">{p.value}</span>
                   </div>
                 ))}
               </div>
             </div>
             <div className="bg-white p-8 rounded-[2rem] border border-neutral-100">
               <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Thermometer size={20} className="text-pinte-blue"/> {ui.products.tempRec}</h3>
               <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-neutral-500">{ui.products.flat}</span>
                      <span className="font-bold text-pinte-blue">{product.temp.flat}</span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div className="h-full bg-pinte-blue rounded-full w-2/3"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-neutral-500">{ui.products.round}</span>
                      <span className="font-bold text-pinte-blue">{product.temp.round}</span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div className="h-full bg-pinte-blue rounded-full w-3/4"></div>
                    </div>
                  </div>
               </div>
             </div>
          </div>
        )}

        {detailTab === 'apps' && (
           <div className="animate-in slide-in-from-bottom-4">
             <div className="bg-white p-8 rounded-[2rem] border border-neutral-100 mb-8">
                <h3 className="text-xl font-bold mb-6">{ui.products.substrates}</h3>
                <div className="flex flex-wrap gap-3">
                  {product.substrates.map((sub, i) => (
                    <span key={i} className="bg-neutral-50 text-neutral-700 px-4 py-2 rounded-full text-sm font-medium border border-neutral-100">
                      {sub}
                    </span>
                  ))}
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[2rem] border border-neutral-100">
                   <h3 className="text-xl font-bold mb-6">{ui.products.applications}</h3>
                   <ul className="space-y-3">
                      {product.applications.map((app, i) => (
                        <li key={i} className="flex items-center gap-3 text-neutral-600">
                          <CheckCircle2 size={16} className="text-green-500" />
                          {app}
                        </li>
                      ))}
                   </ul>
                </div>
                <div className="bg-pinte-blue text-white p-8 rounded-[2rem] flex flex-col justify-center items-center text-center">
                   <h3 className="text-2xl font-bold mb-4">{ui.products.needHelp}</h3>
                   <p className="mb-6 opacity-90">Our technical team is ready to solve your stamping problems.</p>
                   <button
                     onClick={() => setShowQuote(true)}
                     className="bg-white text-pinte-blue px-6 py-2 rounded-full font-bold hover:bg-neutral-100 transition-colors"
                   >
                     {ui.products.contactEng}
                   </button>
                </div>
             </div>
           </div>
        )}

        {detailTab === 'faq' && (
           <div className="animate-in slide-in-from-bottom-4">
             <div className="bg-white p-8 rounded-[2rem] border border-neutral-100">
               <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                 <HelpCircle size={20} className="text-pinte-blue" />
                 {lang === 'cn' ? '常见问题' : 'Frequently Asked Questions'}
               </h3>
               <div className="space-y-6">
                 <details className="group open">
                   <summary className="cursor-pointer list-none flex justify-between items-center font-semibold text-lg text-neutral-900">
                     <span>{lang === 'cn' ? '这款烫金箔适合什么材质？' : 'What materials is this hot stamping foil suitable for?'}</span>
                     <ChevronRight size={18} className="text-neutral-400 group-open:rotate-90 transition-transform" />
                   </summary>
                   <div className="mt-3 text-neutral-600 leading-relaxed">
                     {lang === 'cn'
                       ? (id === 'PK'
                         ? 'PK咖啡底系列专为粗糙不平整表面设计，特别适合粗纹纸、压纹皮革、特种纸等难烫材料。对于重油墨纸张，特有抗氧化涂层能保证烫后光泽不发黑。'
                         : id === 'PC'
                           ? 'PC系列专为塑胶材质设计，支持ABS、PS、PVC、亚克力等多种塑胶，优异的耐酒精性能，完美适配化妆品包材。'
                           : id === 'PLPY'
                             ? '颜料箔适合各种纸质基材，包括铜版纸、白卡纸、艺术纸、皮革等，不依赖镀铝层，能呈现纯正饱满的色彩。'
                             : '数码冷烫箔适合印刷后冷烫工艺，适配大多数数码印刷机，能在多种涂层纸上获得稳定烫印效果。'
                       )
                       : (id === 'PK'
                         ? 'PK Brown Back series is specially designed for rough and uneven surfaces, perfect for rough paper, embossed leather, specialty paper and other difficult-to-stamp materials. For heavy ink paper, the special anti-oxidation coating ensures the gloss does not turn black after stamping.'
                         : id === 'PC'
                           ? 'PC series is designed for plastic materials, supports ABS, PS, PVC, acrylic and other plastics. Excellent alcohol resistance perfectly matches cosmetic packaging materials.'
                           : id === 'PLPY'
                             ? 'Pigment foil is suitable for various paper substrates including coated paper, ivory board, art paper, leather, etc. It does not rely on an aluminum layer and can present pure and full colors.'
                             : 'Digital cold foil is suitable for post-printing cold stamping processes, compatible with most digital printing machines, and can achieve stable stamping effects on various coated papers.'
                       )
                     }
                   </div>
                 </details>

                 <details className="group">
                   <summary className="cursor-pointer list-none flex justify-between items-center font-semibold text-lg text-neutral-900">
                     <span>{lang === 'cn' ? '可以提供定制颜色吗？' : 'Do you offer custom colors?'}</span>
                     <ChevronRight size={18} className="text-neutral-400 group-open:rotate-90 transition-transform" />
                   </summary>
                   <div className="mt-3 text-neutral-600 leading-relaxed">
                     {lang === 'cn'
                       ? '是的，我们提供Pantone专色定制服务。最小起订量根据规格不同，请联系我们的销售团队获取详细报价和交期。'
                       : 'Yes, we provide Pantone custom color service. MOQ varies according to specifications. Please contact our sales team for detailed quotation and delivery time.'
                     }
                   </div>
                 </details>

                 <details className="group">
                   <summary className="cursor-pointer list-none flex justify-between items-center font-semibold text-lg text-neutral-900">
                     <span>{lang === 'cn' ? '最小起订量是多少？' : 'What is your minimum order quantity?'}</span>
                     <ChevronRight size={18} className="text-neutral-400 group-open:rotate-90 transition-transform" />
                   </summary>
                   <div className="mt-3 text-neutral-600 leading-relaxed">
                     {lang === 'cn'
                       ? '标准规格最小起订量是一卷（0.64m × 120m）。对于定制颜色和特殊规格，MOQ会根据实际情况调整，请咨询我们。'
                       : 'The minimum order quantity for standard specifications is one roll (0.64m × 120m). For custom colors and special specifications, MOQ will be adjusted according to the actual situation, please consult us.'
                     }
                   </div>
                 </details>

                 <details className="group">
                   <summary className="cursor-pointer list-none flex justify-between items-center font-semibold text-lg text-neutral-900">
                     <span>{lang === 'cn' ? '可以提供样品吗？' : 'Do you provide samples?'}</span>
                     <ChevronRight size={18} className="text-neutral-400 group-open:rotate-90 transition-transform" />
                   </summary>
                   <div className="mt-3 text-neutral-600 leading-relaxed">
                     {lang === 'cn'
                       ? '是的，我们提供小样品免费测试，您只需要支付运费。样品可以满足您打样测试烫印效果的需求。点击"获取样品"按钮即可申请。'
                       : 'Yes, we provide free small samples for testing, you only need to pay for shipping. Samples can meet your needs for testing the stamping effect. Click the "Request Sample" button to apply.'
                     }
                   </div>
                 </details>

                 <details className="group">
                   <summary className="cursor-pointer list-none flex justify-between items-center font-semibold text-lg text-neutral-900">
                     <span>{lang === 'cn' ? '交货期需要多久？' : 'What is your delivery lead time?'}</span>
                     <ChevronRight size={18} className="text-neutral-400 group-open:rotate-90 transition-transform" />
                   </summary>
                   <div className="mt-3 text-neutral-600 leading-relaxed">
                     {lang === 'cn'
                       ? '标准现货通常3-7天内发货。定制产品根据数量和规格不同，一般需要7-15天。急单可以协商优先安排生产。'
                       : 'Standard stock usually ships within 3-7 days. Custom products usually take 7-15 days depending on quantity and specifications. Rush orders can be prioritized upon negotiation.'
                     }
                   </div>
                 </details>
               </div>
             </div>
             <div className="mt-8 bg-pinte-blue/5 p-8 rounded-[2rem] border border-pinte-blue/20 text-center">
               <p className="text-lg text-neutral-800 mb-4">
                 {lang === 'cn'
                   ? '还有其他问题？我们的技术团队随时为您解答'
                   : 'Have more questions? Our technical team is ready to answer you'
                 }
               </p>
               <button
                 onClick={() => setShowQuote(true)}
                 className="bg-pinte-blue text-white px-8 py-3 rounded-full font-bold hover:bg-pinte-dark transition-colors shadow-lg shadow-pinte-blue/20"
               >
                 {lang === 'cn' ? '联系我们' : 'Contact Us'}
               </button>
             </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default ProductCategory;
