import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const BATCH_ID = '2026-07-p0-01';
const TODAY = '2026-07-16';
const TOPICS_PATH = path.resolve('content/guides/topics.json');
const SOURCES_PATH = path.resolve('content/guides/source-registry.json');
const CONTENT_ROOT = path.resolve('content/guides');
const PUBLISHED_TOPIC_IDS = new Set([
  'HF-008368',
  'HF-008502',
  'HF-003607',
  'HF-003677',
  'HF-003789',
  'HF-007075',
  'HF-006995',
  'HF-006999',
  'HF-003685',
  'HF-005501',
  'HF-009107',
  'HF-005197',
  'HF-005232',
  'HF-005924',
  'HF-008358',
  'HF-008355',
  'HF-000001',
  'HF-009341',
  'HF-005949',
  'HF-001813',
]);

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
  const parsed = {
    lead: lead.trim(),
    substrate: parts[0] || 'the production substrate',
    surface: parts[1] || 'the actual surface treatment',
    process: parts[2] || 'the planned stamping process',
    application: parts[3] || 'the target packaging application',
    issue: parts[4] || lead.trim(),
  };
  const patterns = [
    [/^Why (.+) Happens on (.+)$/i, (match) => ({ issue: match[1], substrate: match[2] })],
    [/^Foil Grade Selection for (.+) on (.+)$/i, (match) => ({ issue: match[1], substrate: match[2] })],
    [/^(.+) Checks for (.+) on (.+)$/i, (match) => ({ issue: match[1], process: match[2], substrate: match[3] })],
    [/^(.+) comparison for (.+) Foil Approval$/i, (match) => ({ issue: match[1], substrate: match[2] })],
    [/^(.+) for (.+) Foil Approval$/i, (match) => ({ issue: match[1], substrate: match[2] })],
    [/^(.+) vs (.+) for (.+)$/i, (match) => ({ issue: `${match[1]} vs ${match[2]}`, substrate: match[3] })],
    [/^What (.+) Means in Foil Stamping$/i, (match) => ({ issue: match[1], substrate: 'foil purchasing and production planning' })],
    [/^(.+) Foil Stamping on (.+)$/i, (match) => ({ issue: match[1], substrate: match[2], application: match[1] })],
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
  if (topic.intent === 'troubleshooting') return `${parts.issue}: ${parts.substrate} Troubleshooting with ${surface}`;
  if (topic.intent === 'testing') return `${parts.issue}: ${parts.substrate} Test Plan for ${parts.application}`;
  if (topic.intent === 'parameter') return `${parts.issue}: ${parts.process} Window on ${parts.substrate}`;
  if (topic.intent === 'comparison') return `${cleanTitle(parts.lead)} for ${parts.substrate} with ${surface}`;
  if (topic.intent === 'procurement') return `${parts.issue}: ${parts.substrate} Buying Checklist for ${surface}`;
  if (topic.intent === 'definition') return `${parts.issue} for ${parts.substrate}`;
  return `${parts.issue}: ${parts.substrate} Guide for ${surface}`;
}

function chineseTitle(topic, parts) {
  const surface = parts.surface === 'the actual surface treatment' ? parts.process : parts.surface;
  if (topic.intent === 'troubleshooting') return `${parts.issue}：${parts.substrate}与${surface}故障排查`;
  if (topic.intent === 'testing') return `${parts.issue}：${parts.substrate}在${parts.application}中的测试清单`;
  if (topic.intent === 'parameter') return `${parts.issue}：${parts.substrate}的${parts.process}窗口`;
  if (topic.intent === 'comparison') return `${parts.lead}：${parts.substrate}与${surface}工艺对比`;
  if (topic.intent === 'procurement') return `${parts.issue}：${parts.substrate}与${surface}采购清单`;
  if (topic.intent === 'definition') return `${parts.issue}：${parts.substrate}采购术语`;
  return `${parts.issue}：${parts.substrate}与${surface}选型指南`;
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
  const sourceKeys = safeArray(topic.source_keys).join(', ');
  const rfqLine = [
    topic.title?.en,
    topic.topic_question?.en,
    topic.difference,
    `Cluster ${topic.cluster}`,
    `Intent ${topic.intent}`,
    `Batch position ${topic.batch_position}`,
  ].filter(Boolean).join(' ');
  return `## Job-specific notes for this page

${contextNoteEn(topic, parts)}

For this article, keep the approval language tied to these working labels: ${tags}. The source set planned for the page is ${sourceKeys}. In practical purchasing terms, this means the buyer should not ask only for a gold, silver, holographic, or pigment color. The request should name ${parts.substrate}, describe ${parts.surface}, identify ${parts.process}, and state whether ${parts.issue.toLowerCase()} is a visual issue, a durability issue, or a machine-setting issue.

When comparing suppliers, ask each one to quote against the same job card. That job card should include the material stack, roll or sheet size, machine route, color target, artwork difficulty, sampling quantity, packing condition, and repeat-order requirement. This prevents one supplier from quoting a decorative foil for a job that actually needs a durability-focused or registration-focused grade.

## Recommended RFQ wording

Use a specific RFQ line such as: "${rfqLine}".

The supplier should answer that RFQ with a foil family, a test method, and a roll specification. If the reply does not mention ${parts.substrate}, ${parts.surface}, ${parts.process}, and ${parts.issue}, the recommendation is probably too generic for production approval. Ask for the sample note to repeat those same terms so that purchasing, press operators, and quality inspectors are judging the same job.`;
}

function uniqueWorksheetCn(topic, parts) {
  const tags = safeArray(topic.tags).map(titleCase).join('；') || '订单打样确认';
  const sourceKeys = safeArray(topic.source_keys).join('、');
  const rfqLine = [
    topic.title?.cn,
    topic.topic_question?.cn,
    topic.difference,
    `主题集群 ${topic.cluster}`,
    `意图 ${topic.intent}`,
    `批次位置 ${topic.batch_position}`,
  ].filter(Boolean).join(' ');
  return `## 本页订单备注

${contextNoteCn(topic, parts)}

本页写作和打样应围绕这些标签展开：${tags}。本页计划参考的资料组包括：${sourceKeys}。落到采购动作上，询价不能只写金色、银色、镭射或颜料效果，而要写清${parts.substrate}、${parts.surface}、${parts.process}，并说明${parts.issue}属于外观问题、耐性问题还是机台参数问题。

比较供应商时，建议让每一家按照同一张订单卡报价。订单卡至少包括材料结构、卷料或片材尺寸、机台路线、颜色目标、图稿难度、打样数量、包装运输条件和复购要求。这样可以避免一个供应商按普通装饰膜报价，而实际订单却需要耐性型或套准型膜材。

## 建议询价写法

可以把询价写成更具体的一句话：“${rfqLine}”。

供应商回复时，应同时给出膜系、测试方法和卷料规格。如果回复没有提到${parts.substrate}、${parts.surface}、${parts.process}和${parts.issue}，说明建议仍然过于笼统。样品说明也应重复这些条件，让采购、机长和质检人员用同一套订单语言判断。`;
}

function englishArticle(topic, parts, products, sources) {
  const productCopy = products.map((id) => PRODUCT_LABELS[id]?.en || id).join('; ');
  const tagCopy = safeArray(topic.tags).map(titleCase).join(', ');
  return `## Direct answer

For ${parts.substrate}, evaluate hot stamping foil by the real surface stack, the transfer process, the artwork detail, and the durability test expected after packaging. In this case the key context is ${parts.surface}, ${parts.process}, and ${parts.application}. A suitable foil should transfer cleanly, keep the edges readable, and stay attached after the agreed test method. Final settings require sampling on the actual substrate, machine, artwork/design, and speed before bulk production.

## Where this topic applies

This guide is written for buyers and production teams working with ${parts.application}. The specific buying question is ${topic.topic_question?.en || topic.title.en}. It is most relevant when the job involves ${parts.issue.toLowerCase()} and when the supplier must recommend a foil starting point rather than a generic catalogue item.

The working assumptions are:

- Substrate or component: ${parts.substrate}
- Surface condition: ${parts.surface}
- Stamping route: ${parts.process}
- Application: ${parts.application}
- Main risk: ${parts.issue}
- Related product family: ${productCopy}

${uniqueWorksheetEn(topic, parts)}

## Buying decision points

1. **Confirm the substrate stack.** The same material name can behave differently after coating, lamination, ink, varnish, corona treatment, primer, or handling contamination. Ask the supplier to recommend a foil for the complete stack, not only for the base material.
2. **Match the release and adhesive behavior to the process.** ${parts.process} may need a different release window from flatbed hot stamping, rotary hot stamping, cold transfer, or digital transfer. A foil that works on one process should not be assumed to work on another.
3. **Separate visual approval from durability approval.** A sample can look bright and still fail tape pull, dry rub, scratch, alcohol rub, or fold checks. Decide the acceptance method before ordering rolls.
4. **Check artwork difficulty.** Large solids, fine lines, small type, registered holographic effects, and reverse detail create different risks. The test artwork should include the hardest area of the real design.
5. **Ask for production fit.** Roll width, winding direction, core size, machine path, and slitting tolerance affect waste and uptime as much as the foil grade itself.

## Practical selection matrix

| Factor | What to confirm | Why it matters for this job |
| --- | --- | --- |
| Surface | ${parts.surface} | Adhesion and release behavior depend on the final printable or decorated surface. |
| Process | ${parts.process} | Temperature, pressure, dwell, adhesive cure, or nip condition changes the transfer window. |
| Artwork | ${parts.issue} | The hardest detail determines whether the sample is representative. |
| Durability | Tape, rub, scratch, fold, or chemical exposure as required | Passing appearance alone is not enough for packaging that will be handled, shipped, or filled. |
| Roll specification | Width, length, core, winding, splice policy, and slitting range | A correct grade can still cause waste if the roll format does not fit the machine. |

## Troubleshooting logic

| Symptom | Likely area to check | Sampling action |
| --- | --- | --- |
| Poor adhesion or peeling | Surface energy, coating compatibility, contamination, wrong foil grade | Clean the sample area, compare an approved substrate, and test one alternative foil family. |
| Incomplete transfer | Contact, pressure balance, adhesive activation, release mismatch | Run a small process window and inspect transfer completeness under the same artwork. |
| Blurred edges or filled detail | Die condition, dwell time, artwork gap, foil release | Use the smallest text and reverse detail from the real design as the acceptance target. |
| Mottling, pinholes, or dull gloss | Surface smoothness, pressure distribution, roll handling | Compare a solid patch, a fine-detail patch, and the approved master sample. |
| Scratch or rub failure | Topcoat, cure, foil surface, handling route | Use the agreed rub or scratch method instead of a casual finger test. |

## Sampling workflow

Start with a small controlled trial. Record the foil batch, roll width, machine, die or plate, substrate batch, surface treatment, speed, pressure setting, temperature or curing condition, and artwork area used for approval. Change one variable at a time. For ${parts.substrate}, keep one sample focused on ${parts.issue.toLowerCase()} and another sample focused on the most common production area.

Before bulk ordering, ask for a written sample note that includes the recommended foil family, suitable substrates, roll specification, storage notes, and the limits of the recommendation. Final settings require sampling on the actual substrate, machine, artwork/design, and speed; published supplier ranges should be treated as starting points, not as universal production settings.

## What to ask the supplier

- Which foil family is recommended for ${parts.substrate} with ${parts.surface}?
- Has the grade been used on a similar ${parts.process} route?
- What roll width, length, core, and winding direction should be ordered?
- Which durability checks are realistic for ${parts.application}?
- What sample size, color card, lead time, and MOQ apply before bulk purchase?
- What information should be kept with the approved sample for repeat orders?

## Source context

The sources below support process boundaries, substrate awareness, and test-method selection. They do not replace a production trial on PINTE material and the buyer's actual job. ${sources.map((source) => `${source.publisher} is useful for ${source.summary}`).join(' ')}

## FAQ

${englishFaqs(topic, parts).map((faq) => `### ${faq.question}\n\n${faq.answer}`).join('\n\n')}
`;
}

function chineseArticle(topic, parts, products, sources) {
  const productCopy = products.map((id) => PRODUCT_LABELS[id]?.cn || id).join('；');
  return `## 直接结论

用于${parts.substrate}的烫金膜，不能只按颜色或材料名称采购，应该同时看实际表面结构、转移工艺、图稿难度和成品耐性要求。本页对应的关键条件是：${parts.surface}、${parts.process}、${parts.application}。合适的膜应能稳定转移、边缘清楚，并在约定测试后保持附着。最终设置必须通过实际承印物、机台、图稿/设计和速度条件下的打样确认。

## 适用场景

这篇文章面向包装厂、印刷厂、标签厂、皮具厂和采购负责人。当前采购问题是：${topic.topic_question?.cn || topic.title.cn}。如果订单中存在${parts.issue}，供应商就不应该只给一个通用报价，而应结合底材、表面处理和设备路线推荐打样起点。

建议先确认这些信息：

- 底材或工件：${parts.substrate}
- 表面状态：${parts.surface}
- 烫印路线：${parts.process}
- 应用场景：${parts.application}
- 主要风险：${parts.issue}
- 相关产品方向：${productCopy}

${uniqueWorksheetCn(topic, parts)}

## 采购判断重点

1. **确认完整表面结构。** 同一种材料经过覆膜、上光、UV 油墨、底涂、电晕、等离子处理或搬运污染后，附着和转移表现都可能变化。
2. **让膜材匹配工艺。** ${parts.process}与平压热烫、圆压热烫、冷烫或数码转移的窗口不同，不能默认同一个型号全部通用。
3. **把外观和耐性分开验收。** 样张有金属光泽，不代表能通过胶带、干摩擦、刮擦、酒精擦拭或折痕测试。
4. **用真实图稿验证。** 大面积实地、细线、小字、定位镭射和反白细节的风险不同，打样图稿必须包含最难的区域。
5. **同步确认卷料规格。** 宽幅、米数、卷芯、收卷方向和分切公差会影响损耗和上机效率。

## 选型检查表

| 项目 | 需要确认 | 对本订单的影响 |
| --- | --- | --- |
| 表面 | ${parts.surface} | 影响胶层附着、离型和边缘清晰度。 |
| 工艺 | ${parts.process} | 温度、压力、停留时间、胶黏剂固化或压辊条件会改变转移窗口。 |
| 图稿 | ${parts.issue} | 最难的图稿区域决定样张是否有代表性。 |
| 耐性 | 按订单选择胶带、耐磨、刮擦、折痕或耐化学测试 | 只看外观容易漏掉后续运输、灌装和使用风险。 |
| 卷料 | 宽幅、长度、卷芯、收卷方向、接头和分切范围 | 型号正确但卷料不匹配，也会造成浪费和停机。 |

## 常见故障判断

| 现象 | 优先检查 | 打样动作 |
| --- | --- | --- |
| 烫不牢或掉金 | 表面能、涂层相容性、污染、膜材系列 | 清洁样品区域，对比确认底材，并测试一个替代膜系。 |
| 转移不完整 | 接触、压力平衡、胶层激活、离型匹配 | 做小范围工艺窗口，并用同一图稿检查转移完整度。 |
| 边缘糊或细节填满 | 烫印版状态、停留时间、图稿间距、离型速度 | 用真实设计里的小字和反白细节做验收目标。 |
| 发花、针孔或光泽发暗 | 表面平整度、压力分布、卷料保存 | 同时比较实地区、细节区和确认样。 |
| 耐刮或耐磨不足 | 表面涂层、固化状态、膜面、搬运路线 | 使用约定测试方法，不用手指随意摩擦代替验收。 |

## 打样流程

先做小批量受控打样。记录膜材批次、宽幅、机台、烫版或压辊、底材批次、表面处理、速度、压力、温度或固化条件，以及用于验收的图稿区域。每次只改变一个变量。对于${parts.substrate}，建议一组样张重点观察${parts.issue}，另一组样张观察最常见的量产区域。

批量采购前，要求供应商提供样品说明，写清推荐膜系、适用底材、卷料规格、储存注意事项和推荐范围的限制。最终设置必须通过实际承印物、机台、图稿/设计和速度条件下的打样确认；公开资料中的参数只能作为起点，不能当作所有订单的固定量产参数。

## 询价时要问什么

- ${parts.substrate}配合${parts.surface}时，推荐哪个膜系？
- 该膜系是否适合${parts.process}？
- 应订购什么宽幅、米数、卷芯和收卷方向？
- ${parts.application}需要做哪些耐性测试？
- 打样卷、色卡、交期和起订量如何安排？
- 复购时需要保留哪些确认样和参数记录？

## 来源说明

下列资料用于支持工艺边界、底材意识和测试方法选择，但不能代替 PINTE 膜材在客户实际订单上的打样确认。${sources.map((source) => `${source.publisher} 的资料可用于理解：${source.summary}`).join('')}

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
  const status = PUBLISHED_TOPIC_IDS.has(topic.topic_id) ? 'published' : 'draft';

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
console.log(`Wrote ${selected.length} guide topics for ${BATCH_ID}; published ${PUBLISHED_TOPIC_IDS.size} topics (${PUBLISHED_TOPIC_IDS.size * 2} localized articles)`);
