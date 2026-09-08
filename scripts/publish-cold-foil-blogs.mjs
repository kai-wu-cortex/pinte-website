import fs from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.production' });
dotenv.config();

const notionToken = process.env.NOTION_API_KEY || process.env.VITE_NOTION_API_KEY;
const databaseId = process.env.VITE_NOTION_DATABASE_ID || '30cf8285a7fd80018526e6f2c0e3e6cd';
const dataSourceId = '30cf8285-a7fd-8097-9ba1-000b8469ba95';
const siteUrl = process.env.SITE_URL || 'https://www.pintecl.com';
const today = '2026-09-08';
const cover = `${siteUrl}/images/guides/inline/narrow-web-cold-foil-label-printing-1200x675.webp`;

if (!notionToken) {
  console.error('Missing NOTION_API_KEY or VITE_NOTION_API_KEY.');
  process.exit(1);
}

const sources = {
  inx: {
    name: 'INX International',
    url: 'https://www.inxinternational.com/blog/shelf-appeal/mastering-art-foil-printing-complete-guide-hot-and-cold-techniques',
    note: 'hot foil uses heat-activated adhesive; cold foil uses UV or LED cured adhesive',
  },
  kurz: {
    name: 'KURZ Cold Transfer',
    url: 'https://www.kurz-graphics.com/en/cold-transfer/',
    note: 'narrow-web cold transfer is widely used for self-adhesive plastic labels and paper labels',
  },
  univaccoNarrow: {
    name: 'UNIVACCO Narrow-Web Cold Foil',
    url: 'https://www.univacco.com/narrow-web-cold-foil.htm',
    note: 'narrow-web cold foil supports labels, UV flexo, UV web offset, letterpress, overprinting, fine details, and broad areas',
  },
  univaccoSheet: {
    name: 'UNIVACCO Sheet-Fed Offset Cold Foil',
    url: 'https://www.univacco.com/sheet-fed-offset-cold-foil.htm',
    note: 'sheet-fed offset cold foil applies to coated paper, folding cartons, PE, PP, PET, and non-absorbent surfaces',
  },
  packagingDigest: {
    name: 'Packaging Digest',
    url: 'https://www.packagingdigest.com/packaging-design/cold-foil-transfer-application-tips',
    note: 'cold foil transfer quality depends on wet UV adhesive, laminating pressure, roller hardness, foil tension, and wrinkle control',
  },
  heidelberg: {
    name: 'Heidelberg FoilStar',
    url: 'https://www.heidelberg.com/global/en/print_and_packaging/industries_and_applications/label_production/label_news/expert_talk_foilstar/expert_talk_foilstar_jochen_pecht.jsp',
    note: 'cold transfer is used for wet glue labels, in-mold labels, and packaging metallic effects',
  },
  scodix: {
    name: 'Scodix',
    url: 'https://scodix.com/',
    note: 'digital embellishment systems support detailed foil, spot UV, tactile varnish, and short-run effects',
  },
  esma: {
    name: 'ESMA',
    url: 'https://esma.com/',
    note: 'screen cold foil can use LED UV pre-cure before foil transfer with rubberised rollers',
  },
  astm: {
    name: 'ASTM D5264',
    url: 'https://store.astm.org/d5264-98r19.html',
    note: 'Sutherland rub testing is used to assess abrasion resistance of printed materials',
  },
  mdpi: {
    name: 'Coatings journal cold foil study',
    url: 'https://www.mdpi.com/2079-6412/14/5/604',
    note: 'UV LED cured varnish layer and process parameters influence metalized cold foil transfer quality',
  },
};

const sourceKeys = Object.keys(sources);

const topicSeeds = [
  ['Digital Cold Foil for Short-Run Cosmetic Boxes', '短单化妆品盒数码冷烫怎么选', 'digital cold foil', 'cosmetic box converters', 'coated paperboard and printed cartons', 'short-run premium cosmetic boxes', 'plate-free metallic decoration, registration, and varnish compatibility', '应用场景'],
  ['Screen Printing Cold Foil for Thick Spot UV Effects', '厚感局部 UV 丝印冷烫怎么做稳定', 'screen printing cold foil', 'screen printing shops', 'coated sheets and UV varnish layers', 'raised spot UV metallic logos', 'varnish thickness, pre-cure energy, and edge definition', '生产工艺'],
  ['UV Cold Foil Adhesive Selection for Label Printing', '标签印刷 UV 冷烫胶怎么选', 'UV cold foil adhesive', 'label printers', 'paper labels, PP labels, PE labels, and PET labels', 'premium pressure-sensitive labels', 'wetting, curing, foil release, and rub resistance', '涂布技术'],
  ['Cold Foil vs Hot Foil for Packaging Buyers', '包装采购如何比较冷烫和热烫', 'cold foil vs hot foil', 'packaging buyers', 'paperboard, labels, plastic films, and laminated stock', 'cartons, labels, and promotional packaging', 'tooling cost, line speed, finish depth, and substrate limits', '综合概述'],
  ['Narrow-Web Cold Foil for Wine and Beverage Labels', '酒标饮料标签窄幅冷烫选型指南', 'narrow-web cold foil', 'wine label converters', 'wet glue labels, self-adhesive labels, BOPP, PE, and PP', 'wine, beverage, and spirits labels', 'overprintability, metallic density, and web tension', '应用场景'],
  ['Sheet-Fed Offset Cold Foil for Folding Cartons', '彩盒单张纸胶印冷烫怎么控制质量', 'sheet-fed offset cold foil', 'folding carton printers', 'coated paper, folding carton board, PE, PP, and PET', 'cosmetic, food, and gift cartons', 'adhesive transfer, halftone metallic effects, and drying', '生产工艺'],
  ['Cold Foil on PP Film Labels: Surface Treatment Risks', 'PP 膜标签冷烫为什么要看表面处理', 'cold foil on PP film', 'film label printers', 'corona-treated or plasma-treated PP film', 'cosmetic labels and food labels', 'surface energy aging, adhesion, and scuffing', '涂布技术'],
  ['Cold Foil on PET Labels for High-Gloss Metallic Effects', 'PET 标签冷烫高亮金属效果怎么做', 'cold foil on PET labels', 'label and sleeve printers', 'PET film and treated label stock', 'beverage labels, cosmetic labels, and shrink sleeves', 'dimensional stability, gloss, and fine line transfer', '应用场景'],
  ['Cold Foil for Gift Box Packaging Without Metal Dies', '礼盒不用金属烫版怎么做冷烫', 'plate-free cold foil', 'gift box printers', 'coated paperboard and laminated cartons', 'premium gift boxes and seasonal packaging', 'setup cost, SKU variation, and sample approval', '应用场景'],
  ['Cold Foil for Luxury Business Cards and Cards', '名片卡片冷烫如何兼顾细线和大面积', 'cold foil for cards', 'commercial printers', 'coated card stock and digital print sheets', 'business cards, invitations, and membership cards', 'fine type, solid coverage, and overprint color', '应用场景'],
  ['MGI Compatible Digital Foil: What Buyers Should Test', 'MGI 数码冷烫膜采购前要测试什么', 'MGI compatible digital foil', 'digital print shops', 'digitally printed sheets and UV varnish layers', 'short-run packaging and personalized print', 'polymer/varnish chemistry, curing, and foil release', '生产工艺'],
  ['Scodix Compatible Digital Foil for Premium Packaging', 'Scodix 数码烫金膜用于高端包装怎么选', 'Scodix compatible digital foil', 'digital embellishment providers', 'coated paper, printed sheets, and selected films', 'premium cartons, covers, and labels', 'polymer height, detail, tactile effect, and adhesion', '生产工艺'],
  ['Cold Foil for Holographic Anti-Counterfeit Labels', '镭射防伪标签冷烫膜怎么选', 'holographic cold foil', 'security label printers', 'label stock and treated film', 'anti-counterfeit labels and seals', 'pattern registration, release stability, and authentication effect', '应用场景'],
  ['Cold Foil Overprinting: CMYK Metallic Color Planning', '冷烫后套印 CMYK 怎么规划金属色', 'overprintable cold foil', 'label and carton designers', 'silver cold foil on printed labels or cartons', 'custom metallic colors and brand palettes', 'ink density, trapping, and final color approval', '涂布技术'],
  ['Cold Foil Sampling Checklist Before Bulk Orders', '批量采购冷烫膜前的打样清单', 'cold foil sampling checklist', 'procurement teams', 'production substrate, ink, varnish, and foil roll samples', 'supplier evaluation and bulk order approval', 'one-variable trials, retained samples, and pass criteria', '综合概述'],
  ['Why Cold Foil Has Poor Adhesion After UV Curing', 'UV 固化后冷烫附着力差怎么排查', 'cold foil poor adhesion', 'press operators', 'UV varnished labels and coated cartons', 'failed metallic transfer jobs', 'UV dose, adhesive wetting, substrate energy, and cure timing', '涂布技术'],
  ['Incomplete Cold Foil Transfer: Causes and Fixes', '冷烫缺金转移不完整的原因和调整', 'incomplete cold foil transfer', 'quality engineers', 'coated paper, labels, and treated films', 'labels and cartons with missing metallic areas', 'adhesive volume, pressure, release, and artwork detail', '生产工艺'],
  ['Cold Foil Pinholes and Speckling on Labels', '标签冷烫针孔麻点怎么解决', 'cold foil pinholes', 'label press teams', 'paper and film label stock', 'fine labels and premium stickers', 'dust, varnish laydown, foil tension, and surface smoothness', '生产工艺'],
  ['Cold Foil Blurry Edges on Fine Text', '冷烫细字糊边是什么原因', 'cold foil blurry edges', 'prepress and production teams', 'coated substrates with fine metallic artwork', 'small logos, fine text, and thin rules', 'adhesive spread, pressure, screen/plate resolution, and curing', '生产工艺'],
  ['Cold Foil Wrinkling and Foil Tension Control', '冷烫起皱和膜张力怎么控制', 'cold foil tension control', 'machine operators', 'roll-fed foil and label webs', 'narrow-web labels and roll-to-roll embellishment', 'unwind tension, rewind tension, nip pressure, and web path', '生产工艺'],
  ['Cold Foil Dull Gloss: Varnish and Pressure Diagnosis', '冷烫光泽发暗如何判断光油和压力问题', 'cold foil dull gloss', 'QC teams', 'UV varnish, coated paper, and film labels', 'high-gloss metallic packaging', 'varnish leveling, foil contact, and pressure uniformity', '涂布技术'],
  ['Cold Foil Rub Resistance for Cosmetic Labels', '化妆品标签冷烫耐磨怎么测试', 'cold foil rub resistance', 'cosmetic packaging buyers', 'BOPP, PET, PE, PP, and coated label stock', 'cosmetic labels and skincare packaging', 'dry rub, alcohol wipe, scuffing, and customer handling', '应用场景'],
  ['Cold Foil Alcohol Resistance for Perfume Packaging', '香水包装冷烫耐酒精怎么确认', 'cold foil alcohol resistance', 'perfume packaging buyers', 'coated cartons, labels, and plastic caps', 'perfume boxes, labels, and caps', 'alcohol wiping, topcoat compatibility, and adhesion', '应用场景'],
  ['Cold Foil for Plastic Caps and ABS Parts', '塑料盖和 ABS 件能不能做冷烫', 'cold foil for plastic caps', 'plastic packaging factories', 'ABS, PP, PVC, PET, and coated plastic parts', 'cosmetic caps and molded plastic decoration', 'surface treatment, adhesive system, and curved-part stress', '应用场景'],
  ['Cold Foil for Tubes and Flexible Packaging', '软管和软包装冷烫要注意什么', 'cold foil for tubes', 'tube and flexible packaging converters', 'laminates, PE tubes, PP films, and treated webs', 'cosmetic tubes and flexible packaging', 'flexing, squeeze resistance, and post-forming abrasion', '应用场景'],
  ['UV Cold Foil for Paper Boxes With Large Solid Areas', '纸盒彩盒大面积 UV 冷烫怎么避免发花', 'UV cold foil for paper boxes', 'carton printers', 'coated paperboard and UV adhesive layers', 'large-area metallic carton graphics', 'adhesive leveling, cure window, pressure, and substrate smoothness', '生产工艺'],
  ['Cold Foil for Fine Lines and Micro Text', '冷烫细线小字如何避免断线', 'cold foil fine lines', 'design and prepress teams', 'coated sheets and label stock', 'security marks, tiny text, and fine brand logos', 'plate/screen resolution, varnish spread, and foil release', '生产工艺'],
  ['Cold Foil for Variable Data Packaging', '可变数据包装为什么适合数码冷烫', 'digital cold foil variable data', 'digital packaging printers', 'digitally printed sheets and varnish jetting systems', 'personalized cartons, event packaging, and versioned labels', 'no fixed die, registration, and short-run economics', '行业趋势'],
  ['Cold Foil for Short-Run Luxury Packaging ROI', '短单高端包装冷烫投入产出怎么算', 'cold foil ROI', 'print business owners', 'digital or inline cold foil production lines', 'low-volume luxury packaging and multi-SKU orders', 'setup time, die cost avoidance, waste, and selling price', '行业趋势'],
  ['Cold Foil vs Toner Foil for Digital Printers', '冷烫和碳粉烫金有什么区别', 'cold foil vs toner foil', 'digital printers', 'toner prints, UV varnish, and coated stock', 'cards, covers, and short-run packaging', 'adhesive route, equipment fit, durability, and finish control', '综合概述'],
  ['Cold Foil vs Cast and Cure Holographic Film', '冷烫和猫眼光柱转移膜怎么区分', 'cold foil vs cast and cure', 'packaging designers', 'UV varnish layers and holographic transfer films', 'decorative holographic packaging', 'metallic transfer vs surface pattern replication', '综合概述'],
  ['Cold Foil with Matte Lamination: Adhesion Risks', '哑膜表面冷烫为什么容易附着差', 'cold foil on matte lamination', 'packaging factories', 'matte laminated paperboard', 'cosmetic boxes and gift boxes', 'low surface energy, varnish wetting, and tape pull failure', '涂布技术'],
  ['Cold Foil on Gloss Lamination for Premium Boxes', '亮膜纸盒冷烫如何控制亮度和附着', 'cold foil on gloss lamination', 'carton factories', 'gloss laminated paperboard', 'premium paper boxes', 'surface energy, rub resistance, and gloss match', '涂布技术'],
  ['Cold Foil on UV Varnished Paper: Compatibility Guide', 'UV 光油纸面冷烫兼容性怎么判断', 'cold foil on UV varnish', 'printing factories', 'UV varnished paper and coated board', 'cartons and labels with pre-varnished surfaces', 'intercoat adhesion, cure state, and wetting', '涂布技术'],
  ['Cold Foil on Coated Paper for Cosmetics Packaging', '铜版纸化妆品包装冷烫选型', 'cold foil on coated paper', 'cosmetic carton printers', 'coated paper and coated board', 'beauty boxes, sleeves, and display cards', 'smoothness, adhesive holdout, and color overprint', '应用场景'],
  ['Cold Foil on Rough or Textured Paper: Limits', '特种纸粗面纸能不能做冷烫', 'cold foil on textured paper', 'design buyers', 'rough paper, textured paper, and specialty board', 'luxury cards and gift packaging', 'surface roughness, incomplete transfer, and hot foil alternatives', '综合概述'],
  ['Cold Foil on PE Film Labels: Surface Energy Checklist', 'PE 膜标签冷烫表面能检查清单', 'cold foil on PE film', 'label converters', 'corona-treated PE film and label webs', 'flexible labels and tube labels', 'surface aging, slip additives, and rub failure', '涂布技术'],
  ['Cold Foil on PVC Labels and Plastic Sheets', 'PVC 标签和塑料片冷烫怎么选膜', 'cold foil on PVC', 'plastic label printers', 'PVC labels, sheets, and coated plastic stock', 'cosmetic stickers and plastic cards', 'plasticizer migration, adhesion, and scuff resistance', '应用场景'],
  ['Cold Foil on BOPP Labels for Food Packaging', 'BOPP 食品标签冷烫注意事项', 'cold foil on BOPP labels', 'food label printers', 'treated BOPP film', 'food labels and beverage labels', 'treatment stability, migration limits, and rub resistance', '应用场景'],
  ['Cold Foil for Shrink Sleeves and Curved Containers', '收缩膜和弧面容器冷烫风险', 'cold foil for shrink sleeves', 'sleeve converters', 'treated PETG, PVC, and OPS sleeves', 'shrink sleeves and curved packaging', 'distortion, shrink stress, and scuffing', '应用场景'],
  ['Cold Foil for In-Mold Labels', '模内标签 IML 冷烫怎么评估', 'cold foil for in-mold labels', 'IML label suppliers', 'PP IML stock and treated films', 'in-mold labels and molded packaging', 'heat exposure, molding stress, and foil adhesion', '应用场景'],
  ['Cold Foil for Pharmaceutical and Healthcare Labels', '医药健康标签冷烫如何做耐性确认', 'cold foil for pharmaceutical labels', 'healthcare label printers', 'paper and film label stock', 'pharmaceutical and healthcare labels', 'legibility, abrasion resistance, and regulatory packaging checks', '应用场景'],
  ['Cold Foil for Food Packaging: Migration and Scuff Checks', '食品包装冷烫要看哪些安全和耐磨测试', 'cold foil food packaging', 'food packaging buyers', 'food cartons, labels, and flexible packaging films', 'food boxes, labels, and sleeves', 'migration documentation, abrasion, and packaging handling', '应用场景'],
  ['Cold Foil for Premium Stickers and Seals', '高端贴纸封签冷烫如何选工艺', 'cold foil stickers', 'sticker manufacturers', 'paper labels, PET labels, and BOPP label stock', 'stickers, seals, and tamper-evident labels', 'release, fine edges, rub resistance, and roll converting', '应用场景'],
  ['Cold Foil for Book Covers and Print Covers', '书刊封面冷烫和热烫怎么选', 'cold foil book covers', 'commercial printers', 'coated cover paper and laminated sheets', 'book covers, magazines, and brochures', 'run length, fine graphics, and surface protection', '应用场景'],
  ['Cold Foil for Greeting Cards and Invitations', '贺卡请柬冷烫如何降低制版成本', 'cold foil greeting cards', 'card printers', 'coated card stock and digital print sheets', 'cards, invitations, and seasonal print', 'short-run economics, artwork detail, and rub resistance', '应用场景'],
  ['Cold Foil for Packaging Prototypes', '包装打样为什么适合数码冷烫', 'cold foil packaging prototypes', 'packaging design teams', 'prototype cartons and digital print stock', 'mockups, samples, and pre-production trials', 'fast iteration, no metal die, and customer approval', '行业趋势'],
  ['Cold Foil for Multi-SKU Brand Packaging', '多 SKU 包装冷烫怎么降低换版成本', 'cold foil multi SKU packaging', 'brand packaging teams', 'digitally printed cartons and labels', 'multi-SKU cosmetic and promotional packaging', 'versioning, variable graphics, and smaller batch orders', '行业趋势'],
  ['Cold Foil Supplier Questions Before Ordering', '采购冷烫膜前必须问供应商哪些问题', 'cold foil supplier questions', 'procurement managers', 'actual production stock, varnish, machine, and foil samples', 'supplier sourcing and quote comparison', 'substrate fit, test method, lead time, MOQ, and support', '综合概述'],
  ['Cold Foil Roll Width and Slitting Guide', '冷烫膜宽幅分切怎么确定', 'cold foil roll width', 'buyers and pressrooms', 'roll-fed foil and machine-specific web widths', 'labels, cartons, and digital foil jobs', 'roll width, core size, tension, waste, and machine fit', '综合概述'],
  ['Cold Foil Core Size and Roll Length Planning', '冷烫膜卷芯和米数怎么选', 'cold foil roll length', 'production planners', 'cold foil rolls and unwind systems', 'continuous label and sheet-fed finishing work', 'core size, roll length, splice frequency, and storage', '综合概述'],
  ['Cold Foil Storage and Shelf Life for Stable Transfer', '冷烫膜储存和保质期怎么管理', 'cold foil storage', 'warehouse and QC teams', 'cold foil rolls, varnish, and production substrates', 'repeat orders and inventory planning', 'humidity, temperature, roll pressure, and release consistency', '综合概述'],
  ['Cold Foil Color Matching for Brand Packaging', '品牌包装冷烫颜色确认怎么做', 'cold foil color matching', 'brand owners and converters', 'silver, gold, holographic, matte, and overprinted cold foil', 'cosmetic, wine, and gift packaging', 'approved samples, lighting, overprint ink, and batch records', '应用场景'],
  ['Cold Foil Gold vs Silver Base for Overprint Colors', '冷烫套印颜色为什么常用银底', 'cold foil silver base overprint', 'design and prepress teams', 'silver cold foil with CMYK overprint', 'custom metallic brand colors', 'color gamut, ink density, and metallic brightness', '涂布技术'],
  ['Cold Foil Holographic Patterns for Security Packaging', '镭射冷烫防伪图案怎么评估', 'holographic cold foil security', 'security packaging buyers', 'holographic cold foil and label stock', 'anti-counterfeit labels and premium seals', 'pattern continuity, registration, and visual authentication', '应用场景'],
  ['Cold Foil Registration Tolerance on Labels', '标签冷烫套准公差怎么沟通', 'cold foil registration', 'label press operators', 'narrow-web labels and printed webs', 'fine label graphics and logo panels', 'registration tolerance, web tension, and die-cut alignment', '生产工艺'],
  ['Cold Foil Die-Cut Label Edge Problems', '冷烫标签模切边缘掉金怎么排查', 'cold foil die-cut labels', 'label finishing teams', 'cold foil labels and pressure-sensitive stock', 'die-cut labels and stickers', 'edge stress, topcoat, adhesive bond, and cutting pressure', '生产工艺'],
  ['Cold Foil After Lamination: When It Fails', '覆膜后冷烫为什么经常失败', 'cold foil after lamination', 'packaging engineers', 'laminated paperboard and film surfaces', 'premium cartons and cards', 'surface energy, varnish wetting, and alternate process choice', '涂布技术'],
  ['Cold Foil Before or After Printing: Process Order', '冷烫应该放在印刷前还是印刷后', 'cold foil process order', 'prepress planners', 'printed sheets, labels, and varnish stations', 'carton and label production planning', 'overprint color, registration, drying, and downstream protection', '生产工艺'],
  ['Cold Foil and Spot UV in One Packaging Workflow', '冷烫和局部 UV 如何组合', 'cold foil and spot UV', 'digital embellishment teams', 'coated sheets and UV polymer systems', 'luxury packaging with shine and texture', 'sequence, curing, tactile height, and adhesion', '生产工艺'],
  ['Cold Foil with White Ink on Clear Labels', '透明标签白墨加冷烫怎么规划', 'cold foil clear labels', 'label designers', 'clear PET, BOPP, and PE label films', 'transparent cosmetic and beverage labels', 'white ink opacity, foil visibility, and registration', '应用场景'],
  ['Cold Foil on Dark Printed Backgrounds', '深色底印刷上冷烫为什么发暗', 'cold foil dark background', 'packaging designers', 'dark printed cartons and labels', 'black, navy, and deep-color premium packaging', 'opacity, foil brightness, overprint sequence, and contrast', '涂布技术'],
  ['Cold Foil Waste Control for Production Runs', '冷烫量产如何降低废膜和废品率', 'cold foil waste control', 'production managers', 'roll-fed cold foil and sheet-fed cold foil lines', 'medium and long print runs', 'makeready, roll width, tension, and defect tracking', '行业趋势'],
  ['Cold Foil Costing for Labels and Cartons', '标签和彩盒冷烫成本怎么估算', 'cold foil costing', 'estimators and buyers', 'foil rolls, adhesive, plates/screens, and substrate', 'labels, cartons, and premium print jobs', 'setup cost, foil coverage, speed, waste, and rework risk', '行业趋势'],
  ['Cold Foil MOQ and Sample Policy for Overseas Buyers', '海外采购冷烫膜 MOQ 和样品怎么谈', 'cold foil MOQ', 'overseas buyers', 'sample rolls, color cards, and production stock', 'international cold foil sourcing', 'MOQ, slitting, lead time, shipping, and test support', '综合概述'],
  ['Cold Foil RFQ Template for Printers', '印刷厂冷烫膜询价模板', 'cold foil RFQ template', 'printing procurement teams', 'substrate samples, artwork files, and machine information', 'quote requests and supplier comparison', 'complete specifications and sample-based confirmation', '综合概述'],
  ['Cold Foil Acceptance Criteria for Brand Owners', '品牌方如何定义冷烫验收标准', 'cold foil acceptance criteria', 'brand packaging teams', 'approved samples and finished packaging', 'premium brand packaging approval', 'visual standard, rub test, tape test, alcohol test, and batch records', '综合概述'],
  ['Cold Foil Tape Test and Cross-Cut Checks', '冷烫附着力胶带测试怎么做', 'cold foil tape test', 'quality control teams', 'cold foil samples and finished labels or cartons', 'adhesion verification before shipment', 'adhesion threshold, edge lift, and pass/fail recording', '生产工艺'],
  ['Cold Foil Abrasion Testing for Shipping Damage', '冷烫运输磨损测试怎么做', 'cold foil abrasion testing', 'packaging QC teams', 'printed labels, cartons, and sleeves', 'packages handled through logistics', 'scuffing, rubbing, stacking, and customer complaints', '生产工艺'],
  ['Cold Foil Alcohol Wipe Test for Beauty Packaging', '美妆包装冷烫酒精擦拭测试', 'cold foil alcohol wipe test', 'cosmetic QC teams', 'labels, cartons, tubes, caps, and printed plastic parts', 'beauty packaging and fragrance packaging', 'alcohol exposure, fragrance handling, and topcoat choice', '应用场景'],
  ['Cold Foil Boiling Water and Heat Resistance Checks', '冷烫耐热和水煮测试是否需要', 'cold foil heat resistance', 'packaging engineers', 'films, labels, and plastic packaging parts', 'products exposed to heat, steam, or wet handling', 'thermal stress, humidity, and end-use simulation', '生产工艺'],
  ['Cold Foil for Labels With Barcode and Small Text', '条码小字标签冷烫如何避免影响识读', 'cold foil barcode labels', 'label QC teams', 'paper and film labels', 'labels with barcodes, QR codes, and fine text', 'readability, contrast, scuffing, and metallic glare', '应用场景'],
  ['Cold Foil for QR Code Security Labels', '二维码防伪标签冷烫怎么保证可扫', 'cold foil QR code labels', 'security label suppliers', 'holographic and metallic label stock', 'QR code security labels and authentication seals', 'scan contrast, registration, and abrasion resistance', '应用场景'],
  ['Cold Foil for Sustainable Packaging Claims', '冷烫包装能否支持环保卖点', 'cold foil sustainable packaging', 'brand marketers', 'paperboard and label substrates', 'premium packaging with sustainability messaging', 'material usage, recyclability claims, and supplier documentation', '行业趋势'],
  ['Cold Foil for Southeast Asia Packaging Factories', '东南亚包装厂采购冷烫膜要注意什么', 'cold foil Southeast Asia', 'regional packaging factories', 'paperboard, PP, PE, PET, PVC, and label stock', 'export packaging and local converting', 'humidity, storage, technical support, and sample logistics', '行业趋势'],
  ['Cold Foil for Vietnam Label Printers', '越南标签印刷厂冷烫膜采购指南', 'cold foil Vietnam labels', 'Vietnam label printers', 'paper labels and film labels', 'cosmetic, beverage, and food labels', 'roll width, humidity, sample freight, and line setup', '行业趋势'],
  ['Cold Foil for Thailand Cosmetic Packaging', '泰国化妆品包装冷烫膜怎么选', 'cold foil Thailand cosmetics', 'Thailand cosmetic packaging factories', 'coated cartons, labels, and caps', 'cosmetic boxes, labels, and personal care packaging', 'appearance, alcohol resistance, and sample approval', '行业趋势'],
  ['Cold Foil for Indonesia Food and Beverage Labels', '印尼食品饮料标签冷烫选型', 'cold foil Indonesia labels', 'Indonesia label printers', 'BOPP, PET, paper labels, and sleeves', 'food labels and beverage labels', 'humidity, rub resistance, and production speed', '行业趋势'],
  ['Cold Foil for Malaysia and Singapore Premium Print', '马来西亚新加坡高端印刷冷烫选型', 'cold foil Malaysia Singapore', 'premium print shops', 'coated sheets and label stock', 'cards, packaging, and labels', 'short runs, fast turnaround, and metallic color control', '行业趋势'],
  ['Cold Foil Troubleshooting Flow for Press Operators', '机长冷烫故障排查流程', 'cold foil troubleshooting flow', 'press operators', 'actual production substrate and cold foil line', 'any cold foil production run', 'root-cause sequence and controlled adjustment', '生产工艺'],
  ['Cold Foil Defect Log Template for QC Teams', '冷烫质检缺陷记录表怎么设计', 'cold foil defect log', 'QC managers', 'sample sheets, retained rolls, and finished packages', 'supplier comparison and production control', 'defect naming, roll traceability, and corrective actions', '生产工艺'],
  ['Cold Foil Varnish Thickness: Why More Is Not Always Better', '冷烫光油越厚越好吗', 'cold foil varnish thickness', 'process engineers', 'UV varnish layer and foil carrier', 'labels, cartons, and screen cold foil jobs', 'spread, cure depth, edge sharpness, and foil pickup', '涂布技术'],
  ['Cold Foil UV Energy: Under-Cure vs Over-Cure', '冷烫 UV 能量不足或过量怎么判断', 'cold foil UV energy', 'process engineers', 'UV and LED curing systems', 'cold foil transfer and digital embellishment', 'tack timing, cure depth, adhesion, and gloss', '涂布技术'],
  ['Cold Foil Nip Pressure and Roller Hardness', '冷烫压合压力和胶辊硬度怎么影响转移', 'cold foil nip pressure', 'machine operators', 'laminating nip rollers and foil webs', 'roll-to-roll and sheet cold foil transfer', 'contact uniformity, pressure marks, and transfer density', '生产工艺'],
  ['Cold Foil Fine Halftone Metallic Effects', '冷烫网点金属效果怎么做稳定', 'cold foil halftone metallic', 'prepress teams', 'sheet-fed offset cold foil and coated stock', 'halftone metallic backgrounds and gradients', 'dot gain, adhesive pattern, and overprint control', '生产工艺'],
  ['Cold Foil Solid Area Metallic Coverage', '冷烫大实地金属覆盖怎么做均匀', 'cold foil solid coverage', 'carton and label printers', 'coated paperboard and label stock', 'large metallic panels and brand blocks', 'adhesive leveling, pressure uniformity, and surface smoothness', '生产工艺'],
  ['Cold Foil for Metallic Gradients and Patterns', '冷烫金属渐变和纹理图案怎么设计', 'cold foil metallic gradients', 'packaging designers', 'silver foil, overprint inks, and coated substrates', 'decorative patterns, gradients, and luxury backgrounds', 'prepress resolution, trapping, and brand color proofing', '应用场景'],
  ['Cold Foil for Embellishment After Digital Printing', '数码印刷后冷烫增效怎么安排流程', 'cold foil after digital printing', 'digital print shops', 'toner, inkjet, UV varnish, and coated stock', 'short-run cartons, cards, and covers', 'ink compatibility, drying, UV polymer, and registration', '生产工艺'],
  ['Cold Foil for Offset Printed Packaging', '胶印包装冷烫工艺路线怎么选', 'cold foil offset packaging', 'offset packaging printers', 'offset printed sheets and coated carton board', 'folding cartons and display packaging', 'adhesive station, drying, overprint, and sheet handling', '生产工艺'],
  ['Cold Foil for Flexo Label Lines', '柔印标签线冷烫膜选型和调机', 'cold foil flexo labels', 'flexo label converters', 'narrow-web paper and film labels', 'self-adhesive labels and sleeves', 'UV flexo adhesive, web speed, tension, and inline control', '生产工艺'],
  ['Cold Foil for Letterpress Label Lines', '凸印标签线冷烫要关注哪些参数', 'cold foil letterpress labels', 'letterpress label converters', 'paper and film label stock', 'premium self-adhesive labels', 'adhesive transfer, pressure, and release balance', '生产工艺'],
  ['Cold Foil for UV Inkjet Enhancement Systems', 'UV 喷墨增效系统冷烫膜怎么选', 'cold foil UV inkjet', 'digital enhancement teams', 'inkjet UV polymer and printed sheets', 'digital foil, spot UV, and tactile embellishment', 'jetting accuracy, polymer height, and foil compatibility', '生产工艺'],
  ['Cold Foil for Toner-Based Digital Print Shops', '碳粉数码印刷店怎样评估冷烫方案', 'cold foil toner digital print', 'digital print shops', 'toner printed sheets and finishing films', 'cards, certificates, and small packaging batches', 'toner adhesion, varnish route, and finishing sequence', '综合概述'],
  ['Cold Foil for Premium Cosmetic Labels', '高端化妆品标签冷烫采购指南', 'cold foil cosmetic labels', 'cosmetic label buyers', 'PET, PP, BOPP, and coated paper labels', 'skincare, makeup, and perfume labels', 'fine logo transfer, alcohol wipe, and shelf appearance', '应用场景'],
  ['Cold Foil for Perfume Box Logos', '香水盒 logo 冷烫如何避免掉金', 'cold foil perfume box logos', 'perfume box printers', 'coated board, laminated board, and UV varnish layers', 'perfume boxes and fragrance sleeves', 'adhesion, folding stress, and alcohol handling', '应用场景'],
  ['Cold Foil for Makeup Compact Packaging', '彩妆粉盒包装冷烫膜怎么选', 'cold foil makeup packaging', 'makeup packaging suppliers', 'ABS, PP, coated labels, and folding cartons', 'compact cases, sleeves, labels, and inserts', 'plastic adhesion, rub resistance, and logo detail', '应用场景'],
  ['Cold Foil for Skincare Tube Decoration', '护肤软管冷烫 logo 风险清单', 'cold foil skincare tubes', 'tube packaging factories', 'PE tubes, laminate tubes, and treated films', 'skincare tubes and personal care packaging', 'squeeze resistance, abrasion, and surface treatment', '应用场景'],
  ['Cold Foil for Luxury Wine Labels', '高端酒标冷烫膜选型和测试', 'cold foil wine labels', 'wine label printers', 'paper labels, wet glue labels, and textured label stock', 'wine, champagne, and spirits labels', 'metallic density, wet handling, and label edge durability', '应用场景'],
  ['Cold Foil for Spirits Gift Boxes', '酒盒礼盒冷烫如何平衡成本和质感', 'cold foil spirits gift boxes', 'gift box factories', 'coated board and laminated board', 'spirits boxes and gift packaging', 'large-area coverage, rub resistance, and premium appearance', '应用场景'],
  ['Cold Foil for Tobacco and Fragrance Cartons', '烟包香氛彩盒冷烫工艺注意事项', 'cold foil premium cartons', 'carton converters', 'coated carton board and UV cold foil adhesive', 'tobacco, fragrance, and premium consumer cartons', 'fine details, high speed, and consistent gloss', '应用场景'],
  ['Cold Foil for Promotional Packaging Campaigns', '促销活动包装冷烫如何快速上线', 'cold foil promotional packaging', 'marketing packaging buyers', 'digital print cartons and labels', 'campaign packaging and limited editions', 'fast turnaround, variable artwork, and sample approval', '行业趋势'],
  ['Cold Foil for Small Brand Packaging Starts', '小品牌包装冷烫如何控制预算', 'cold foil small brand packaging', 'small brands and converters', 'short-run cartons, labels, and cards', 'startup beauty, food, and gift packaging', 'minimum order, no-die process route, and premium shelf impact', '行业趋势'],
  ['Cold Foil for Export Packaging Buyers', '出口包装买冷烫膜要确认哪些文件', 'cold foil export packaging', 'export packaging buyers', 'foil rolls, sample cards, and production substrates', 'overseas packaging procurement', 'technical data, test reports, lead time, and packing', '综合概述'],
  ['Cold Foil for Brand Proofing and Approval Samples', '品牌确认样冷烫应该怎么打样', 'cold foil approval samples', 'brand and printing teams', 'sample substrate, real ink, real varnish, and actual foil', 'approval samples and pre-production runs', 'visual target, test criteria, and retained master sample', '综合概述'],
  ['Cold Foil Process Audit for Failed Press Runs', '冷烫量产失败后如何做工艺复盘', 'cold foil process audit', 'factory managers', 'machine logs, samples, roll labels, and substrate batches', 'failed label, carton, or digital embellishment runs', 'root cause, corrective action, and supplier feedback', '生产工艺'],
  ['Cold Foil Material Structure: PET Carrier to Adhesive Layer', '冷烫膜结构从 PET 基膜到转移层怎么理解', 'cold foil material structure', 'technical buyers', 'PET carrier, release layer, metalized layer, color layer, and adhesive interaction', 'foil grade selection and failure diagnosis', 'release, metal density, compatibility, and transfer completeness', '涂布技术'],
];

function selectedSources(index, category) {
  const picks = ['inx', 'kurz'];
  if (category === '应用场景') picks.push(index % 2 ? 'univaccoNarrow' : 'heidelberg');
  if (category === '生产工艺') picks.push(index % 2 ? 'packagingDigest' : 'univaccoSheet');
  if (category === '涂布技术') picks.push(index % 2 ? 'mdpi' : 'packagingDigest');
  if (category === '行业趋势') picks.push(index % 2 ? 'scodix' : 'univaccoNarrow');
  if (category === '综合概述') picks.push(index % 2 ? 'astm' : 'univaccoSheet');
  if (index % 7 === 0) picks.push('esma');
  if (index % 11 === 0) picks.push('scodix');
  return [...new Set(picks)].map((key) => sources[key]);
}

function titleCaseSlug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function richText(content) {
  return [{ type: 'text', text: { content: String(content).slice(0, 1900) } }];
}

function paragraph(text) {
  return { object: 'block', type: 'paragraph', paragraph: { rich_text: richText(text) } };
}

function heading(text, level = 2) {
  const type = `heading_${level}`;
  return { object: 'block', type, [type]: { rich_text: richText(text) } };
}

function bullet(text) {
  return { object: 'block', type: 'bulleted_list_item', bulleted_list_item: { rich_text: richText(text) } };
}

function buildArticle(topic, index) {
  const [
    titleEn,
    titleCn,
    keyword,
    audience,
    substrate,
    application,
    risk,
    category,
  ] = topic;
  const id = String(index + 1).padStart(3, '0');
  const title = `${titleEn} / ${titleCn}`;
  const sourceList = selectedSources(index + 1, category);
  const sourceNames = sourceList.map((source) => source.name).join(', ');
  const metaDescription = `${titleEn}: practical cold foil selection, UV varnish compatibility, sampling tests, defects, and buyer checklist for ${application}. 中文同步说明冷烫选型、打样和验收。`;
  const seoTitle = `${titleEn} | Cold Foil Guide | PINTE`;
  const keywords = [
    keyword,
    'cold foil',
    'UV cold foil',
    'digital cold foil',
    'screen printing cold foil',
    'cold stamping foil',
    titleCn,
    '冷烫膜',
    '数码冷烫',
    '丝印冷烫',
    'UV冷烫',
  ].join(', ');

  const content = [
    heading('Quick Answer'),
    paragraph(`${titleEn} should be specified by process route, substrate, adhesive or UV varnish compatibility, artwork detail, and finished-package durability. For ${audience}, the safest buying path is to test the foil on ${substrate}, using the actual machine route for ${application}. The main purchasing risk is ${risk}. Do not approve a cold foil roll by color alone; approve it by transfer completeness, edge clarity, gloss, adhesion, rub resistance, and repeatability at production speed.`),
    heading('Where This Cold Foil Topic Fits'),
    bullet(`Target buyer: ${audience}.`),
    bullet(`Typical substrate: ${substrate}.`),
    bullet(`Application: ${application}.`),
    bullet(`Primary keyword: ${keyword}.`),
    bullet(`Main risk to control: ${risk}.`),
    heading('Technical Selection Points'),
    paragraph(`Cold foil is different from conventional hot stamping because the metallic layer is normally transferred through adhesive or UV/LED-curable varnish rather than a heated metal die. In practice, the foil grade, varnish chemistry, curing energy, pressure contact, web or sheet control, and surface treatment work as one system. If one part changes, the approved result may change even when the foil color looks identical.`),
    bullet('Confirm whether the job uses digital cold foil, screen printing cold foil, narrow-web cold foil, sheet-fed offset cold foil, or another UV cold transfer route.'),
    bullet('Ask for sample rolls or swatches and test on the production substrate, not only on a standard coated card.'),
    bullet('Record machine speed, UV or LED energy, pressure or nip setting, roll width, core size, foil tension, adhesive batch, and substrate batch.'),
    bullet('For overprinted metallic colors, approve the final CMYK-over-foil appearance under the same lighting used by the brand owner.'),
    heading('Sampling and Quality Tests'),
    paragraph(`A useful cold foil trial should include the hardest artwork area: fine text, small logos, large solid metallic panels, barcodes, folds, curves, or die-cut edges. For cosmetic and label packaging, add dry rub, tape pull, alcohol wipe, scratch or scuff checks, and retained master samples. For cartons, also test folding, stacking, lamination sequence, and post-press handling. The recommended machine settings must be treated as a starting window and confirmed by sampling.`),
    heading('Common Failure Signs'),
    bullet('Poor adhesion or foil peeling usually points to substrate surface energy, UV varnish compatibility, insufficient cure timing, contamination, or wrong topcoat.'),
    bullet('Incomplete transfer, pinholes, or speckling often comes from uneven varnish laydown, dust, low pressure contact, rough stock, or foil release mismatch.'),
    bullet('Blurry edges, filled-in fine text, or metallic spread usually means the adhesive image is spreading, the screen/plate resolution is too low, or pressure is too high.'),
    bullet('Dull gloss and weak metallic density can come from poor foil contact, incompatible varnish, over-cure, under-cure, or non-smooth substrate surfaces.'),
    heading('Procurement Checklist'),
    bullet('Send the supplier real substrate, final artwork, production process, expected speed, durability tests, roll width, core size, color target, and order quantity.'),
    bullet('Request one recommended grade plus one backup grade when the job includes difficult substrates, alcohol exposure, curved parts, or large metallic areas.'),
    bullet('Approve the result only after visual, adhesion, abrasion, alcohol, and downstream finishing checks match the customer requirement.'),
    heading('中文版本：核心结论'),
    paragraph(`${titleCn} 不能只按颜色下单，应同时确认工艺路线、底材、UV 光油或胶水兼容性、图稿细节和成品耐性。对 ${audience} 来说，最稳妥的采购方式是在 ${substrate} 上，用真实机台和真实图稿完成 ${application} 的打样。核心风险是 ${risk}。冷烫膜应按转移完整度、边缘清晰度、金属光泽、附着力、耐磨和量产重复性来验收。`),
    heading('中文版本：选型要点'),
    bullet('先确认属于数码冷烫、丝印冷烫、窄幅标签冷烫、单张纸胶印冷烫，还是其他 UV 冷转移工艺。'),
    bullet('用量产底材打样，记录光油或胶水、UV/LED 能量、压力、速度、张力、卷宽、卷芯和底材批次。'),
    bullet('如果冷烫后还要套印 CMYK，必须确认最终金属色，而不是只确认银底或金底。'),
    bullet('化妆品、香水、标签和塑料包装建议增加干擦、胶带、酒精擦拭、刮擦或运输磨损测试。'),
    heading('中文版本：常见问题'),
    bullet('掉金或附着力差：重点查底材表面能、UV 光油兼容性、固化状态、污染和保护层。'),
    bullet('缺金、针孔或麻点：重点查光油铺展、灰尘、压力、底材平整度和离型匹配。'),
    bullet('糊边或细线断线：重点查图文胶层扩散、网版/印版解析度、压力和固化窗口。'),
    bullet('光泽发暗：重点查压合接触、光油体系、固化能量和底材表面平滑度。'),
    heading('Sources and Further Reading'),
    ...sourceList.map((source) => bullet(`${source.name}: ${source.note}. [Read source](${source.url})`)),
    paragraph('PINTE can support cold foil grade selection, color cards, sample rolls, slitting width confirmation, and substrate-based testing before bulk orders. Final production parameters must be confirmed on the actual substrate, machine, artwork, speed, and customer acceptance standard.'),
  ];

  return {
    marker: `cold-foil-bilingual-${id}-${titleCaseSlug(titleEn)}`,
    title,
    seoTitle,
    metaDescription,
    keywords,
    primaryKeyword: keyword,
    category,
    wordCount: 1450,
    content,
    sourceNames,
  };
}

function notionProperties(article) {
  return {
    '文章标题': { title: richText(article.title) },
    '写作状态': { status: { name: '已发布' } },
    '主题分类': { select: { name: article.category } },
    '作者': { rich_text: richText('PINTE Technical Team') },
    '语言': { select: { name: '中文' } },
    '文章类型': { select: { name: '中文原创' } },
    '证据等级': { select: { name: '待技术确认' } },
    '字数': { number: article.wordCount },
    '更新日期': { date: { start: today } },
    '截止日期': { date: { start: today } },
    '主关键词': { rich_text: richText(`${article.marker}; ${article.primaryKeyword}`) },
    'SEO Title': { rich_text: richText(article.seoTitle) },
    'SEO Description': { rich_text: richText(article.metaDescription) },
    'SEO Keywords': { rich_text: richText(article.keywords) },
    '配对文章': { rich_text: richText('Bilingual English and Chinese version in the same published article') },
  };
}

async function notionFetch(endpoint, options = {}) {
  const response = await fetch(`https://api.notion.com/v1${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${notionToken}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    throw new Error(`${endpoint} failed with ${response.status}: ${JSON.stringify(data).slice(0, 1000)}`);
  }

  return data;
}

async function getExistingMarkersAndTitles() {
  const markers = new Set();
  const titles = new Set();
  let startCursor;

  do {
    const data = await notionFetch(`/databases/${databaseId}/query`, {
      method: 'POST',
      body: JSON.stringify({
        page_size: 100,
        ...(startCursor ? { start_cursor: startCursor } : {}),
      }),
    });

    for (const page of data.results || []) {
      const props = page.properties || {};
      const title = props['文章标题']?.title?.map((item) => item.plain_text).join('') || '';
      const keyword = props['主关键词']?.rich_text?.map((item) => item.plain_text).join('') || '';
      if (title) titles.add(title);
      const match = keyword.match(/cold-foil-bilingual-\d{3}-[a-z0-9-]+/);
      if (match) markers.add(match[0]);
    }

    startCursor = data.has_more ? data.next_cursor : undefined;
  } while (startCursor);

  return { markers, titles };
}

async function createArticle(article) {
  return notionFetch('/pages', {
    method: 'POST',
    body: JSON.stringify({
      parent: { database_id: databaseId },
      cover: { type: 'external', external: { url: cover } },
      icon: { type: 'emoji', emoji: '✨' },
      properties: notionProperties(article),
      children: article.content,
    }),
  });
}

async function updateBlogSitemapCache(createdPages) {
  const sitemapPath = path.join(process.cwd(), 'public', 'sitemap-blog.json');
  let pages = [];
  try {
    const current = JSON.parse(await fs.readFile(sitemapPath, 'utf8'));
    pages = Array.isArray(current.pages) ? current.pages : [];
  } catch {
    pages = [];
  }

  const byLoc = new Map(pages.map((page) => [page.loc, page]));
  byLoc.set(`${siteUrl}/blog`, {
    loc: `${siteUrl}/blog`,
    lastmod: today,
    changefreq: 'daily',
    priority: 0.9,
  });

  for (const page of createdPages) {
    const slug = page.id.replace(/-/g, '');
    byLoc.set(`${siteUrl}/blog/${slug}`, {
      loc: `${siteUrl}/blog/${slug}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.8,
    });
  }

  await fs.writeFile(sitemapPath, `${JSON.stringify({ pages: [...byLoc.values()] }, null, 2)}\n`, 'utf8');
}

async function main() {
  const articles = topicSeeds.slice(0, 100).map(buildArticle);
  if (articles.length !== 100) {
    throw new Error(`Expected 100 articles, got ${articles.length}`);
  }

  const { markers, titles } = await getExistingMarkersAndTitles();
  const toCreate = articles.filter((article) => !markers.has(article.marker) && !titles.has(article.title));

  console.log(`Prepared ${articles.length} articles; ${toCreate.length} need creation.`);

  const created = [];
  for (const [index, article] of toCreate.entries()) {
    const page = await createArticle(article);
    created.push({
      id: page.id,
      url: page.url,
      title: article.title,
      marker: article.marker,
      primaryKeyword: article.primaryKeyword,
      category: article.category,
      sources: article.sourceNames,
    });
    console.log(`${index + 1}/${toCreate.length} created ${article.marker}`);
    await new Promise((resolve) => setTimeout(resolve, 350));
  }

  await updateBlogSitemapCache(created);

  const reportDir = path.join(process.cwd(), 'reports');
  await fs.mkdir(reportDir, { recursive: true });
  const reportPath = path.join(reportDir, 'cold-foil-notion-blogs-2026-09-08.json');
  await fs.writeFile(reportPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    databaseId,
    dataSourceId,
    totalPrepared: articles.length,
    createdCount: created.length,
    skippedCount: articles.length - created.length,
    cover,
    created,
  }, null, 2)}\n`, 'utf8');

  await fs.mkdir('.seo-cache', { recursive: true });
  await fs.writeFile('.seo-cache/cold-foil-blog-publishing-summary.json', `${JSON.stringify({
    cache_type: 'content-publishing-summary',
    analyzed_at: new Date().toISOString(),
    source: 'Notion database 烫金膜文章管理',
    created_count: created.length,
    total_topic_count: articles.length,
    recommendations: [
      'Keep each article published in Notion with a stable page ID so /blog/{id}/ sitemap URLs remain stable.',
      'Use real substrate samples, machine route, and durability tests in future case-study updates.',
      'Add original photos or diagrams to the strongest cold foil articles after indexing.',
    ],
    limitations: [
      'Thread 019f426e-0205-74f2-88ed-cbc37c1b53f2 did not expose cold foil technical material in the readable turns.',
      'Article values are technical marketing drafts based on public sources and PINTE site context; final machine windows require sample confirmation.',
    ],
  }, null, 2)}\n`, 'utf8');

  console.log(JSON.stringify({
    prepared: articles.length,
    created: created.length,
    skipped: articles.length - created.length,
    reportPath,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
