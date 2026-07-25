import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const BATCH_ID = '2026-07-p0-01';
const TODAY = '2026-07-16';
const TOPICS_PATH = path.resolve('content/guides/topics.json');
const SOURCES_PATH = path.resolve('content/guides/source-registry.json');
const CONTENT_ROOT = path.resolve('content/guides');

const LEGACY_RELATED = {
  'cosmetic-packaging': ['cosmetic-packaging-foil-guide', 'hot-stamping-foil-substrate-compatibility-and-compliance'],
  'holographic-security': ['hot-foil-vs-cold-foil-vs-holographic', 'hot-stamping-foil-substrate-compatibility-and-compliance'],
  'label-printing': ['hot-foil-vs-cold-foil-vs-holographic', 'hot-stamping-sampling-checklist'],
  leather: ['hot-stamping-foil-buying-guide', 'hot-stamping-troubleshooting'],
  'paper-carton-packaging': ['paper-box-packaging-hot-stamping-foil-guide', 'hot-stamping-sampling-checklist'],
  'parameters-testing': ['hot-stamping-sampling-checklist', 'hot-stamping-troubleshooting'],
  plastics: ['hot-stamping-foil-substrate-compatibility-and-compliance', 'hot-stamping-troubleshooting'],
  'process-comparison': ['hot-foil-vs-cold-foil-vs-holographic', 'hot-stamping-foil-buying-guide'],
  'procurement-specifications': ['hot-stamping-foil-buying-guide', 'hot-stamping-sampling-checklist'],
  troubleshooting: ['hot-stamping-troubleshooting', 'hot-stamping-sampling-checklist'],
  'wine-gift-packaging': ['paper-box-packaging-hot-stamping-foil-guide', 'hot-stamping-troubleshooting'],
};

const PRODUCT_BY_CLUSTER = {
  leather: ['PK'],
  plastics: ['PC'],
  'holographic-security': ['PLPY'],
  'label-printing': ['DIGITAL'],
  'process-comparison': ['PK'],
  'paper-carton-packaging': ['PK'],
  'wine-gift-packaging': ['PK'],
  'cosmetic-packaging': ['PK'],
  troubleshooting: ['PK'],
  'parameters-testing': ['PK'],
  'procurement-specifications': ['PK'],
};

const PRODUCT_LABELS = {
  PK: { en: 'general hot stamping foil for paper, packaging, and leather trials', cn: '纸张、包装和皮革打样用通用热烫膜' },
  PC: { en: 'plastic hot stamping foil for caps, ABS, PET, PP, PE, and shaped parts', cn: '用于瓶盖、ABS、PET、PP、PE 和异形件的塑胶烫印膜' },
  PLPY: { en: 'holographic and pigment foil for decorative or security packaging effects', cn: '用于装饰和防伪包装效果的镭射/颜料类烫金膜' },
  DIGITAL: { en: 'cold or digital transfer foil for labels and short-run embellishment', cn: '用于标签和短版装饰的冷烫/数码转移膜' },
};

function safeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function titleCase(value) {
  return String(value || '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b[a-z]/g, (char) => char.toUpperCase());
}

function splitTopicTitle(title) {
  const [lead, rest = ''] = String(title || '').split(' - ');
  const parts = rest.split(' / ').map((part) => part.trim()).filter(Boolean);
  const shifted = /^(?:Why .+ Happens on .+|Foil Grade Selection for .+ on .+|.+ Checks for .+ on .+|.+(?:comparison )?for .+ Foil Approval)$/i.test(lead.trim());
  const parsed = {
    lead: lead.trim(),
    substrate: parts[0] || 'the production substrate',
    surface: parts[1] || 'the actual surface treatment',
    process: parts[2] || 'the planned stamping process',
    application: parts[3] || 'the target packaging application',
    issue: parts[4] || lead.trim(),
  };
  if (shifted) {
    parsed.surface = parts[0] || parsed.surface;
    parsed.process = parts[1] || parsed.process;
    parsed.application = parts[2] || parsed.application;
    parsed.issue = parts[3] || parsed.issue;
  }
  const patterns = [
    [/^Why (.+) Happens on (.+)$/i, (match) => ({ issue: match[1], substrate: match[2] })],
    [/^Foil Grade Selection for (.+) on (.+)$/i, (match) => ({ issue: match[1], substrate: match[2] })],
    [/^(.+) Checks for (.+) on (.+)$/i, (match) => ({ issue: match[1], process: match[2], substrate: match[3] })],
    [/^(.+) comparison for (.+) Foil Approval$/i, (match) => ({ issue: `${parts[3] || match[1]} checked by ${parts[4] || match[1]}`, substrate: match[2] })],
    [/^(.+) for (.+) Foil Approval$/i, (match) => ({ issue: `${parts[3] || match[1]} checked by ${parts[4] || match[1]}`, substrate: match[2] })],
    [/^(.+) vs (.+) for (.+)$/i, (match) => ({ issue: `${match[1]} vs ${match[2]}`, substrate: match[3] })],
    [/^What (.+) Means in Foil Stamping$/i, (match) => ({ issue: match[1], substrate: 'foil purchasing and production planning' })],
    [/^(.+) Foil Stamping on (.+)$/i, (match) => ({
      issue: parts[4] || match[1],
      substrate: match[2],
      surface: parts[0] || parsed.surface,
      process: parts[1] || parsed.process,
      application: parts[3] || match[1],
    })],
  ];
  for (const [pattern, mapper] of patterns) {
    const match = lead.trim().match(pattern);
    if (match) Object.assign(parsed, mapper(match));
  }
  return {
    ...parsed,
    lead: lead.trim(),
  };
}

function cnParts(topic, parts) {
  const cn = topic.title?.cn || '';
  const cnRest = cn.includes(' - ') ? cn.split(' - ')[1] : cn;
  const values = cnRest.split(' / ').map((part) => part.trim()).filter(Boolean);
  return {
    lead: cn.split(' - ')[0] || parts.lead,
    substrate: values[0] || parts.substrate,
    surface: values[1] || parts.surface,
    process: values[2] || parts.process,
    application: values[3] || parts.application,
    issue: values[4] || parts.issue,
  };
}

function sourceEntries(topic, sourceRegistry) {
  const byId = new Map(sourceRegistry.map((source) => [source.id, source]));
  const ids = [...new Set([
    ...safeArray(topic.source_keys),
    'univacco-hot-stamping-foil',
    'foilco-d4-grade-guide',
  ])];
  return ids
    .map((id) => byId.get(id))
    .filter(Boolean)
    .slice(0, 4)
    .map((source) => ({
      label: source.publisher,
      title: source.title,
      publisher: source.publisher,
      url: source.url,
      summary: source.claimScope,
    }));
}

function relatedProducts(topic) {
  const products = safeArray(topic.related_products);
  return products.length ? products : PRODUCT_BY_CLUSTER[topic.cluster] || ['PK'];
}

function relatedGuides(topic) {
  const guides = safeArray(topic.related_guides);
  return guides.length ? guides : LEGACY_RELATED[topic.cluster] || ['hot-stamping-foil-buying-guide', 'hot-stamping-sampling-checklist'];
}

function cleanTitle(value) {
  return String(value || '')
    .replace(/\s+-\s+/g, ': ')
    .replace(/\s*\/\s*/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
}

function englishTitle(topic, parts) {
  const surface = parts.surface === 'the actual surface treatment' ? parts.process : parts.surface;
  const suffix = `${surface} / ${parts.process}`.replace(/\s+/g, ' ');
  if (topic.intent === 'troubleshooting') return `${parts.issue}: ${parts.substrate} Troubleshooting for ${suffix}`;
  if (topic.intent === 'testing') return `${parts.issue}: ${parts.substrate} Test Plan for ${suffix} in ${parts.application}`;
  if (topic.intent === 'parameter') return `${parts.issue}: ${parts.process} Window on ${parts.substrate} with ${surface}`;
  if (topic.intent === 'comparison') return `${cleanTitle(parts.lead)} for ${parts.substrate} with ${suffix}`;
  if (topic.intent === 'procurement') return `${parts.issue}: ${parts.substrate} Buying Checklist for ${suffix}`;
  if (topic.intent === 'definition') return `${parts.issue} for ${parts.substrate} in ${parts.application}`;
  return `${parts.issue}: ${parts.substrate} Guide for ${suffix}`;
}

function chineseTitle(topic, parts) {
  const surface = parts.surface === 'the actual surface treatment' ? parts.process : parts.surface;
  const suffix = `${surface} / ${parts.process}`;
  if (topic.intent === 'troubleshooting') return `${parts.issue}：${parts.substrate}在${suffix}下的故障排查`;
  if (topic.intent === 'testing') return `${parts.issue}：${parts.substrate}在${suffix}和${parts.application}下的测试清单`;
  if (topic.intent === 'parameter') return `${parts.issue}：${parts.substrate}与${surface}的${parts.process}窗口`;
  if (topic.intent === 'comparison') return `${parts.lead}：${parts.substrate}与${suffix}工艺对比`;
  if (topic.intent === 'procurement') return `${parts.issue}：${parts.substrate}与${suffix}采购清单`;
  if (topic.intent === 'definition') return `${parts.issue}：${parts.substrate}在${parts.application}中的采购术语`;
  return `${parts.issue}：${parts.substrate}与${suffix}选型指南`;
}

function englishFaqs(topic, parts) {
  return [
    {
      question: `Can this foil choice be confirmed from the material name alone?`,
      answer: `No. ${parts.substrate}, ${parts.surface}, ${parts.process}, artwork detail, and machine speed must be checked together before bulk ordering.`,
    },
    {
      question: `What should a buyer send before asking for a firm recommendation?`,
      answer: `Send the substrate sample, surface treatment, artwork, machine type, expected speed, target finish, and the durability checks required by the final package.`,
    },
    {
      question: `When should the final production setting be locked?`,
      answer: `Final settings should be locked only after sampling on the actual substrate, machine, artwork/design, and speed, with an approved reference sample kept for production comparison.`,
    },
  ];
}

function chineseFaqs(topic, parts) {
  return [
    {
      question: '只看材料名称能不能直接确定烫金膜型号？',
      answer: `不能。需要同时确认${parts.substrate}、${parts.surface}、${parts.process}、图稿细节和生产速度，再决定是否适合批量采购。`,
    },
    {
      question: '采购询价前最好提供哪些信息？',
      answer: '建议提供底材样品、表面处理、图稿、机台类型、预计速度、目标颜色效果，以及成品需要通过的耐磨、附着或耐化学测试。',
    },
    {
      question: '什么时候可以锁定量产参数？',
      answer: '最终设置必须通过实际承印物、机台、图稿/设计和速度条件下的打样确认，并保留确认样作为后续生产比对标准。',
    },
  ];
}

function contextNoteEn(topic, parts) {
  const text = `${parts.substrate} ${parts.surface} ${parts.process} ${parts.application} ${parts.issue}`.toLowerCase();
  if (/polypropylene|\bpp\b/.test(text)) {
    return 'Polypropylene jobs deserve a separate trial because PP is often selected for light, flexible, or molded packaging parts and may need controlled surface treatment before foil adhesion looks stable. Watch for scratch-off behavior after handling, especially on curved caps and label films.';
  }
  if (/polyethylene|\bpe\b/.test(text)) {
    return 'Polyethylene should be treated as its own buying case because PE can flex, deform, and carry lower surface energy than paper stocks. A sample should include the same film or component grade, not only a visually similar plastic.';
  }
  if (/natural leather/.test(text)) {
    return 'Natural leather varies by hide, finish, oil content, and grain. The buyer should test the exact leather lot and logo die because a beautiful mark on one leather panel may not repeat on a waxy, oily, or heavily grained batch.';
  }
  if (/pu synthetic leather/.test(text)) {
    return 'PU leather is usually judged by the behavior of its topcoat. Sampling should watch for heat imprint, whitening, edge lift, and abrasion at wallet or bag contact points rather than only the first transfer impression.';
  }
  if (/pvc synthetic leather|book cover/.test(text)) {
    return 'PVC leather and book-cover materials can respond differently from PU because plasticizer, coating hardness, and emboss texture influence release and long-term adhesion. Keep a fold or rub sample for approval.';
  }
  if (/folding carton|paperboard|coated paper|laminated paper|kraft|textured/.test(text)) {
    return 'Paper and board work should be approved on the final printed, coated, or laminated stack. A white-card trial before varnish or lamination is not enough when the final order uses specialty coating, texture, or large solid metallic areas.';
  }
  if (/label/.test(text)) {
    return 'Label converting adds web tension, liner stability, adhesive layers, varnish, and high-speed registration to the foil decision. Ask for the roll format and process route before choosing between hot, cold, or digital transfer foil.';
  }
  if (/abs|pmma|pvc|plastic|component|cap/.test(text)) {
    return 'Rigid plastic parts require attention to resin, molding release, part geometry, and heat tolerance. A flat plaque sample is useful for screening, but a shaped cap or molded component is needed before production approval.';
  }
  if (/hologram|holographic|security|registered/.test(text)) {
    return 'Holographic and registered effects add pitch, orientation, origination, and placement control to the normal foil decision. Decoration and security functions should be specified separately.';
  }
  return 'Treat this as a job-specific foil decision, not a generic color selection. The approved sample should represent the substrate, process, artwork difficulty, and durability expectation of the final order.';
}

function contextNoteCn(topic, parts) {
  const text = `${parts.substrate} ${parts.surface} ${parts.process} ${parts.application} ${parts.issue}`.toLowerCase();
  if (/polypropylene|\bpp\b/.test(text)) return 'PP 项目要单独打样，因为这种材料常用于轻量、柔性或注塑包装件，表面处理是否稳定会直接影响附着。尤其要观察弧面瓶盖、PP 标签膜在搬运后的刮擦和掉金表现。';
  if (/polyethylene|\bpe\b/.test(text)) return 'PE 不能简单套用纸张或 PP 的结论。PE 可能更柔软、表面能更低，打样必须使用同等级薄膜或同批工件，而不是只找一块外观看起来接近的塑料。';
  if (/natural leather/.test(text)) return '真皮受皮胚、涂饰、油脂和纹路影响很大。采购应使用实际皮料批次和真实 logo 版打样，因为一块皮上效果好，不代表油蜡皮或深纹皮也能稳定复现。';
  if (/pu synthetic leather/.test(text)) return 'PU 皮重点看表面涂层。打样时除了第一下是否转移，还要检查热压痕、发白、边缘翘起，以及钱包、手袋接触位置的耐磨表现。';
  if (/pvc synthetic leather|book cover/.test(text)) return 'PVC 合成革和书封材料要关注增塑剂、涂层硬度和压纹深浅，这些因素会影响离型和长期附着。确认样最好同时保留折痕和摩擦样。';
  if (/folding carton|paperboard|coated paper|laminated paper|kraft|textured/.test(text)) return '纸盒和彩盒必须在最终印刷、覆膜、上光或特种纸表面上确认。只用未上光白卡打样，不能代表带涂层、纹理或大面积实地金属效果的量产订单。';
  if (/label/.test(text)) return '标签加工还涉及卷材张力、底纸稳定性、胶层、上光和高速套准。选热烫、冷烫或数码转移膜之前，应先确认卷材规格和生产路线。';
  if (/abs|pmma|pvc|plastic|component|cap/.test(text)) return '塑料件要同时看树脂、脱模剂残留、工件几何形状和耐热性。平板样可用于初筛，但量产前必须用真实瓶盖或注塑件确认。';
  if (/hologram|holographic|security|registered/.test(text)) return '镭射和定位效果除了普通烫金问题，还要确认节距、方向、制版来源和定位控制。装饰效果与防伪功能应分别定义。';
  return '这个问题应按具体订单判断，而不是只按颜色选膜。确认样需要同时代表底材、工艺、图稿难度和成品耐性要求。';
}

function uniqueWorksheetEn(topic, parts) {
  const tags = safeArray(topic.tags).map(titleCase).join('; ') || 'job-specific foil approval';
  const evidence = safeArray(topic.evidence_needed)
    .map((item) => `- ${item}`)
    .join('\n');
  const sourceNames = safeArray(topic.source_keys)
    .slice(0, 4)
    .map((sourceKey) => titleCase(sourceKey))
    .join(', ');
  return `## Practical application context

${contextNoteEn(topic, parts)}

For a real purchasing decision, this means the buyer should not ask only for a gold, silver, holographic, or pigment color. The request should name ${parts.substrate}, describe ${parts.surface}, identify ${parts.process}, and state whether ${parts.issue.toLowerCase()} is a visual issue, a durability issue, or a machine-setting issue.

## What to check before choosing a foil

Use the same sample structure when comparing foil grades or suppliers:

- Confirm the material stack and surface condition before selecting a grade.
- Test the same artwork detail that will appear on the final package.
- Record machine route, pressure, temperature, dwell time, and production speed.
- Keep one approved visual sample and one durability-tested sample for later comparison.

Useful evidence for this topic includes:

${evidence || '- Production-representative substrate, press route, artwork, speed, and durability testing.'}

## Supplier RFQ checklist

Ask the supplier to answer with a foil family, a test method, and a roll specification. The RFQ should mention ${parts.substrate}, ${parts.surface}, ${parts.process}, and ${parts.issue}; otherwise the answer is probably too generic for production approval. Use working labels such as ${tags} only as selection context, not as a substitute for sample testing.

## Source context

This guide is aligned with practical foil-industry references such as ${sourceNames || 'foil manufacturer grade guides and process notes'}. Those references are useful for process principles, but the final choice still depends on your own substrate, machine, artwork, speed, and retained approval sample.`;
}

function uniqueWorksheetCn(topic, parts) {
  const tags = safeArray(topic.tags).map(titleCase).join('；') || '订单打样确认';
  const evidence = safeArray(topic.evidence_needed)
    .map((item) => `- ${item}`)
    .join('\n');
  const sourceNames = safeArray(topic.source_keys)
    .slice(0, 4)
    .map((sourceKey) => titleCase(sourceKey))
    .join('、');
  return `## 实际应用场景

${contextNoteCn(topic, parts)}

落到采购动作上，询价不能只写金色、银色、镭射或颜料效果，而要写清${parts.substrate}、${parts.surface}、${parts.process}，并说明${parts.issue}属于外观问题、耐性问题还是机台参数问题。

## 选膜前要确认什么

比较膜材或供应商时，应把样品条件统一起来：

- 先确认材料结构和表面状态，再判断适合哪类烫金膜。
- 使用最终包装上真实会出现的图稿细节做测试，不只看空白底材。
- 记录机台路线、压力、温度、停留时间和生产速度。
- 同时保留外观确认样和耐性测试样，供量产和复购时比对。

这个主题建议重点保留以下证据：

${evidence || '- 接近量产条件的底材、机台、图稿、速度和耐性测试记录。'}

## 供应商询价清单

供应商回复应同时给出膜系、测试方法和卷料规格。如果回复没有提到${parts.substrate}、${parts.surface}、${parts.process}和${parts.issue}，说明建议仍然过于笼统。${tags} 这类标签只适合作为选型线索，不能替代真实打样。

## 资料参考方式

本指南参考 ${sourceNames || '膜材厂家等级指南和工艺说明'} 这类行业资料，用来解释工艺原则和常见判断方法。最终选择仍然要回到你的实际底材、机台、图稿、速度和确认样。`;
}

function englishArticle(topic, parts, products, sources) {
  const productCopy = products.map((id) => PRODUCT_LABELS[id]?.en || id).join('; ');
  const tags = safeArray(topic.tags).map(titleCase).join(', ') || 'job-specific approval';
  const firstSource = sources[0]?.publisher || 'the primary technical source';
  const secondSource = sources[1]?.publisher || 'the secondary technical source';
  return `## Direct answer

For ${parts.substrate}, choose hot stamping foil by matching ${parts.surface}, ${parts.process}, and the ${parts.issue.toLowerCase()} requirement. The useful starting point is not a universal color code; it is a sample plan that checks transfer, edge quality, and durability on the finished job. Final settings require sampling on the actual substrate, machine, artwork/design, and speed before bulk production.

## Buyer situation

The buyer question is: ${topic.topic_question?.en || topic.title.en}

This page applies when the project combines:

- Material: ${parts.substrate}
- Surface: ${parts.surface}
- Process: ${parts.process}
- Application: ${parts.application}
- Main concern: ${parts.issue}
- Product direction: ${productCopy}
- Tags for this job: ${tags}

${uniqueWorksheetEn(topic, parts)}

## Approval checklist

Ask the supplier to answer this specific job, not a general foil catalogue request. The quote should state whether the recommended foil is meant for ${parts.substrate}, whether ${parts.surface} needs cleaning or treatment, and how ${parts.process} changes the process window. The sample should include the part of the artwork most likely to show ${parts.issue.toLowerCase()}.

For approval, keep three samples: one visual master, one durability sample, and one retained production reference. Mark each sample with substrate batch, machine, speed, pressure, temperature or cure condition, roll width, and operator note. If a second trial is needed, change only one variable so the result is readable.

## Failure checks for this topic

- If the problem is adhesion, inspect surface energy, coating compatibility, and handling contamination before blaming color.
- If the problem is transfer, compare pressure contact, release behavior, and machine speed on the same artwork.
- If the problem is edge quality, inspect die wear, dwell/contact time, and the smallest text or reverse detail.
- If the problem is durability, use the agreed tape, rub, scratch, fold, or chemical method instead of an informal hand test.
- If repeat orders matter, keep the approved roll label and sample record with purchasing files.

## Source context

${firstSource} supports the process or substrate boundary for this page. ${secondSource} supports the test or comparison context. These references do not replace a production trial on PINTE material and the buyer's actual job.

## FAQ

${englishFaqs(topic, parts).map((faq) => `### ${faq.question}\n\n${faq.answer}`).join('\n\n')}
`;
}

function chineseArticle(topic, parts, products, sources) {
  const productCopy = products.map((id) => PRODUCT_LABELS[id]?.cn || id).join('；');
  const tags = safeArray(topic.tags).map(titleCase).join('，') || '订单确认';
  const firstSource = sources[0]?.publisher || '主要技术资料';
  const secondSource = sources[1]?.publisher || '辅助技术资料';
  return `## 直接结论

用于${parts.substrate}时，烫金膜要按${parts.surface}、${parts.process}和${parts.issue}来确认，不能只看颜色或材料名称。真正有用的采购起点，是一套能验证转移、边缘和耐性的打样方案。最终设置必须通过实际承印物、机台、图稿/设计和速度条件下的打样确认。

## 采购场景

当前问题是：${topic.topic_question?.cn || topic.title.cn}

这篇页面对应的订单条件是：

- 底材或工件：${parts.substrate}
- 表面状态：${parts.surface}
- 烫印路线：${parts.process}
- 应用场景：${parts.application}
- 主要风险：${parts.issue}
- 相关产品方向：${productCopy}
- 本页标签：${tags}

${uniqueWorksheetCn(topic, parts)}

## 验收动作

询价时要求供应商回答这个具体订单，而不是只发通用色卡。回复中应说明推荐膜系是否适合${parts.substrate}，${parts.surface}是否需要清洁或处理，以及${parts.process}会怎样影响温度、压力、速度、固化或接触窗口。打样图稿必须包含最容易暴露${parts.issue}的区域。

建议保留三类样：外观确认样、耐性测试样、量产留样。每张样都要标注底材批次、机台、速度、压力、温度或固化条件、卷料宽幅和操作记录。如果需要第二轮打样，每次只改变一个变量，避免结果无法判断。

## 本页故障检查

- 如果问题集中在附着，先看表面能、涂层相容性和搬运污染。
- 如果问题集中在转移，比较压力接触、离型表现和同一图稿下的速度。
- 如果问题集中在边缘，检查烫版磨损、接触时间、小字和反白细节。
- 如果问题集中在耐性，使用约定的胶带、耐磨、刮擦、折痕或耐化学方法。
- 如果后续要复购，把确认卷标和样张记录放进采购资料。

## 来源说明

${firstSource} 用于支持本页的工艺或底材边界，${secondSource} 用于支持测试或对比背景。这些资料不能代替 PINTE 膜材在客户实际订单上的量产前打样确认。

## 常见问题

${chineseFaqs(topic, parts).map((faq) => `### ${faq.question}\n\n${faq.answer}`).join('\n\n')}
`;
}

function frontmatter(topic, lang, title, description, answer, faqs, sources, products, guides, status) {
  return {
    topic_id: topic.topic_id,
    lang,
    slug: topic.slug,
    status,
    cluster: topic.cluster,
    intent: topic.intent,
    title,
    description,
    primary_keyword: lang === 'en' ? title.toLowerCase() : title,
    secondary_keywords: safeArray(topic.tags).slice(0, 6).map(titleCase),
    related_products: products,
    related_guides: guides,
    author: lang === 'en' ? 'PINTE Technical Team' : 'PINTE 技术团队',
    reviewer: lang === 'en' ? 'PINTE Application Engineer' : 'PINTE 应用工程师',
    date_published: TODAY,
    date_modified: TODAY,
    hero_image: '',
    hero_alt: '',
    answer,
    faqs,
    sources,
  };
}

function writeGuide(topic, sourceRegistry) {
  const partsEn = splitTopicTitle(topic.title?.en);
  const partsCn = cnParts(topic, partsEn);
  const products = relatedProducts(topic);
  const guides = relatedGuides(topic);
  const sources = sourceEntries(topic, sourceRegistry);

  if (sources.length < 2) throw new Error(`${topic.topic_id} has fewer than two usable sources`);
  if (products.length === 0) throw new Error(`${topic.topic_id} has no related product`);
  if (guides.length === 0) throw new Error(`${topic.topic_id} has no related guide`);

  const enTitle = englishTitle(topic, partsEn);
  const cnTitle = chineseTitle(topic, partsCn);
  const enDescription = `A practical guide to choosing, testing, and buying hot stamping foil for ${partsEn.substrate} when the main concern is ${partsEn.issue.toLowerCase()}.`;
  const cnDescription = `面向${partsCn.substrate}烫金膜采购和打样的实用指南，重点处理${partsCn.issue}。`;
  const enAnswer = `For ${partsEn.substrate}, choose foil by substrate stack, surface treatment, process route, artwork detail, and required durability tests. Final settings require sampling on the actual substrate, machine, artwork/design, and speed before bulk production.`;
  const cnAnswer = `用于${partsCn.substrate}时，应按底材结构、表面处理、工艺路线、图稿细节和成品耐性要求选择烫金膜。最终设置必须通过实际承印物、机台、图稿/设计和速度条件下的打样确认。`;
  const status = 'published';

  const directory = path.join(CONTENT_ROOT, topic.topic_id);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(
    path.join(directory, 'en.md'),
    matter.stringify(englishArticle(topic, partsEn, products, sources), frontmatter(topic, 'en', enTitle, enDescription, enAnswer, englishFaqs(topic, partsEn), sources, products, guides, status)),
  );
  fs.writeFileSync(
    path.join(directory, 'cn.md'),
    matter.stringify(chineseArticle(topic, partsCn, products, sources), frontmatter(topic, 'cn', cnTitle, cnDescription, cnAnswer, chineseFaqs(topic, partsCn), sources, products, guides, status)),
  );
  return { products, guides, status };
}

const topics = JSON.parse(fs.readFileSync(TOPICS_PATH, 'utf8'));
const sourceRegistry = JSON.parse(fs.readFileSync(SOURCES_PATH, 'utf8'));
const selected = topics
  .filter((topic) => topic.batch === BATCH_ID)
  .sort((left, right) => (left.batch_position ?? 9999) - (right.batch_position ?? 9999));

if (selected.length !== 50) throw new Error(`expected 50 first-batch topics, got ${selected.length}`);

const selectedIds = new Set(selected.map((topic) => topic.topic_id));
const parityUpdates = new Map();
for (const topic of selected) {
  parityUpdates.set(topic.topic_id, writeGuide(topic, sourceRegistry));
}

const updatedTopics = topics.map((topic) => {
  if (!selectedIds.has(topic.topic_id)) return topic;
  const update = parityUpdates.get(topic.topic_id);
  return {
    ...topic,
    status: update.status,
    related_products: update.products,
    related_guides: update.guides,
  };
});

fs.writeFileSync(TOPICS_PATH, `${JSON.stringify(updatedTopics, null, 2)}\n`);
console.log(`Published ${selected.length} guide topics (${selected.length * 2} localized articles) for ${BATCH_ID}`);
