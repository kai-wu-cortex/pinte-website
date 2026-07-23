/**
 * Prerender i18n dictionary
 * 双语小词典:供 snapshot-builder 拼接 section title / FAQ label / breadcrumb label 等使用。
 * 每个 key 对应一段标准化文案,避免在 builder 里到处写 `lang === 'cn' ? ... : ...`。
 */
const dict = {
    // Breadcrumb labels
    home: { en: 'Home', cn: '首页' },
    about: { en: 'About PINTE', cn: '关于品特' },
    products: { en: 'Products', cn: '产品中心' },
    productCategories: { en: 'Product Series', cn: '产品系列' },
    productItems: { en: 'Product Items', cn: '产品型号' },
    solutions: { en: 'Solutions', cn: '解决方案' },
    blog: { en: 'Blog', cn: '博客' },
    quote: { en: 'Get a Quote', cn: '获取报价' },
    tour: { en: 'Factory Tour', cn: '工厂参观' },
    culture: { en: 'Culture', cn: '企业文化' },
    privacy: { en: 'Privacy Policy', cn: '隐私政策' },
    terms: { en: 'Terms of Service', cn: '服务条款' },
    pintefoils: { en: 'PINTE Foils', cn: 'PINTE 烫金膜' },
    foilColors: { en: 'Foil Color Range', cn: '烫金箔色卡' },
    seoSop: { en: 'SEO / GEO SOP', cn: 'SEO / GEO 工作台' },
    // Section headings
    industryChallenges: { en: 'Industry Challenges We Solve', cn: '行业痛点与解决方案' },
    industryChallengesLead: {
        en: 'Print converters and packaging plants often run into the following issues with mainstream foils. PINTE was engineered to fix them.',
        cn: '印刷加工厂与包装厂在生产中常常遇到以下问题,品特针对每一个痛点都给出了对应方案。',
    },
    specifications: { en: 'Specifications', cn: '规格参数' },
    applications: { en: 'Typical Applications', cn: '典型应用' },
    features: { en: 'Key Features', cn: '核心特性' },
    faq: { en: 'Frequently Asked Questions', cn: '常见问答' },
    related: { en: 'Related Products & Solutions', cn: '相关产品与方案' },
    servedMarkets: { en: 'Served Markets', cn: '服务市场' },
    substrates: { en: 'Compatible Substrates', cn: '兼容基材' },
    colors: { en: 'Standard Colors', cn: '标准色' },
    temperature: { en: 'Recommended Stamping Temperature', cn: '推荐烫印温度' },
    flatTemp: { en: 'Flat Stamping', cn: '平面烫印' },
    roundTemp: { en: 'Round Stamping', cn: '圆面烫印' },
    // Common Q/A scaffolding
    qPainHow: { en: 'How does PINTE solve this?', cn: 'PINTE 如何解决?' },
    qWhatIs: { en: 'What is it?', cn: '它是什么?' },
    qWhereUsed: { en: 'Where is it typically used?', cn: '通常用在哪里?' },
    qOEM: { en: 'Does PINTE offer OEM / custom colors?', cn: 'PINTE 是否提供 OEM 或专色定制?' },
    aOEM: {
        en: 'Yes — PINTE supports OEM/ODM with custom color matching (Pantone), custom widths and roll lengths, and small-batch trials before mass production. Contact sales for sample requests.',
        cn: '支持 — 品特提供 OEM/ODM 服务,可按 Pantone 专色定制、自定义宽幅与卷长,量产前可申请小批量打样。请联系销售索取样品。',
    },
    qLeadTime: { en: 'What is the standard lead time?', cn: '常规交期是多久?' },
    aLeadTime: {
        en: 'Standard colors ship from stock in 3–7 days. Custom colors and bulk OEM orders typically take 15–25 days after sample approval.',
        cn: '常规色现货 3-7 天发货;定制色和大批量 OEM 单在打样确认后通常 15-25 天交付。',
    },
    qMarkets: { en: 'Which markets does PINTE serve?', cn: '品特主要服务哪些市场?' },
    // Article / blog scaffolding
    publishedOn: { en: 'Published on', cn: '发布于' },
    readMore: { en: 'Read more', cn: '阅读全文' },
    relatedArticles: { en: 'Related Articles', cn: '相关文章' },
    blogIntro: {
        en: 'The PINTE blog covers hot stamping foil techniques, packaging case studies, troubleshooting guides for converters across Southeast Asia and global markets.',
        cn: '品特博客聚焦烫金箔工艺、包装案例分享、印刷常见问题排查,为东南亚及全球客户提供深度内容。',
    },
    // Quote page
    quoteIntro: {
        en: 'Request a quotation for hot stamping foil, cold foil, pigment foil or glitter powder. PINTE replies to inquiries within one working day and ships free samples globally.',
        cn: '在线索取烫金箔、冷烫箔、颜料箔或金葱粉报价。品特承诺一个工作日内回复询盘,免费样品全球寄送。',
    },
    quoteContact: { en: 'Direct contact', cn: '直接联系方式' },
    // Tour
    tourIntro: {
        en: 'Take a virtual tour of PINTE\'s Dongguan facility: 20,000+ m² production base, ISO9001-certified coating lines, in-house R&D lab.',
        cn: '欢迎线上参观品特东莞工厂:20,000+ ㎡ 生产基地、ISO9001 认证的涂布生产线、自有研发实验室。',
    },
    // About / culture
    aboutLead: {
        en: 'PINTE is a Dongguan-based hot stamping foil manufacturer founded in 1999 with 25+ years of coating expertise, serving converters in Vietnam, Thailand, Malaysia, Indonesia and beyond.',
        cn: '品特(PINTE)是位于中国东莞的烫金箔制造商,创立于 1999 年,拥有 25 年以上涂布经验,长期服务越南、泰国、马来西亚、印度尼西亚等全球客户。',
    },
    // Common
    servedMarketsLead: {
        en: 'PINTE primarily serves',
        cn: '品特主要服务以下市场:',
    },
    partOfSeries: { en: 'Part of the {series} series', cn: '隶属于 {series} 系列' },
    viewSeries: { en: 'View {series} series', cn: '查看 {series} 系列' },
    viewItem: { en: 'View product detail', cn: '查看产品详情' },
    viewSolution: { en: 'View solution', cn: '查看解决方案' },
    // Privacy / Terms snippets
    privacyLead: {
        en: 'PINTE respects your privacy. This policy describes what information we collect when you browse pintecl.com, how we use it, and the rights you have over your data.',
        cn: '品特尊重您的隐私。本政策说明您访问 pintecl.com 时我们收集哪些信息、如何使用,以及您对个人数据享有的权利。',
    },
    termsLead: {
        en: 'These Terms of Service govern your use of pintecl.com, including product information, sample requests, quotation flow, and the limitations of liability that apply.',
        cn: '本服务条款约束您对 pintecl.com 的使用,涵盖产品信息、样品申请、报价流程以及相关责任限制等内容。',
    },
};
export function t(key, lang, vars) {
    let raw = dict[key][lang];
    if (vars) {
        for (const [k, v] of Object.entries(vars)) {
            raw = raw.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
        }
    }
    return raw;
}
export function htmlLangAttr(lang) {
    return lang === 'cn' ? 'zh-CN' : 'en';
}
