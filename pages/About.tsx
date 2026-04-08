import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SEOMeta from '../components/SEOMeta';
import {
  Factory, Award, Calendar, MapPin,
  Zap, BookOpen, Users, CheckCircle, Sparkles
} from 'lucide-react';

const About: React.FC = () => {
  const { lang } = useLanguage();

  const pageTitle = lang === 'cn'
    ? '关于品特 - PINTE烫金箔 | 东莞佰仕特旗下高端烫金箔品牌'
    : 'About PINTE - Premium Hot Stamping Foil Brand from Dongguan BEST';

  const pageDesc = lang === 'cn'
    ? 'PINTE品特是东莞佰仕特工艺制品有限公司旗下高端烫金箔品牌，母公司1998年成立，200000㎡自有工厂，15%年收入研发投入，通过ISO9001、RoHS、EN71-3、ASTM-F963认证。'
    : 'PINTE is the premium hot stamping foil brand of Dongguan BEST Craftwork Co., Ltd. Parent company founded in 1998, 200,000㎡ factory, 15% annual revenue in R&D, certified with ISO9001, RoHS, EN71-3, ASTM-F963.';

  const keywords = lang === 'cn'
    ? ['关于品特', 'PINTE', '品特', '东莞佰仕特', '烫金箔厂家', '1998年成立', '20万平方米厂房', 'ISO9001认证', 'RoHS认证', 'EN71-3', 'ASTM-F963', '烫金箔生产', '金葱粉', '高端烫金膜', '长安镇', '源头工厂', '定制烫金箔']
    : ['about PINTE', 'PINTE', 'hot stamping foil manufacturer', 'Dongguan BEST', 'founded 1998', '200000 m² factory', 'ISO9001 certified', 'RoHS compliant', 'EN71-3', 'ASTM-F963', 'hot stamping foil production', 'glitter powder', 'premium hot stamping foil', 'Dongguan China', 'manufacturer', 'custom foil'];

  const stats = [
    {
      icon: <Calendar size={24} />,
      cn: { label: '母公司成立', value: '1998年' },
      en: { label: 'Parent Founded', value: '1998' }
    },
    {
      icon: <Factory size={24} />,
      cn: { label: '烫金事业部', value: '2020年' },
      en: { label: 'PINTE Founded', value: '2020' }
    },
    {
      icon: <Factory size={24} />,
      cn: { label: '厂房面积', value: '200,000㎡' },
      en: { label: 'Factory Area', value: '200,000 m²' }
    },
    {
      icon: <Zap size={24} />,
      cn: { label: '日产能', value: '60,000 米' },
      en: { label: 'Daily Capacity', value: '60,000 meters' }
    },
    {
      icon: <BookOpen size={24} />,
      cn: { label: '研发投入', value: '15% 年收入' },
      en: { label: 'R&D Investment', value: '15% revenue' }
    }
  ];

  const coreValues = [
    {
      key: '全',
      icon: <Sparkles size={24} />,
      cn: {
        title: '全 — 做品类齐全的领导者',
        desc: '品种全、颜色全、库存全，覆盖PK粗面、PC塑胶、PL/PY颜料箔、数码冷烫全系列'
      },
      en: {
        title: 'Complete — Full Range Leader',
        desc: 'Complete product range, full colors, full inventory — covers PK rough surfaces, PC plastics, PL/PY pigment foils, digital cold foils'
      }
    },
    {
      key: '专',
      icon: <Users size={24} />,
      cn: {
        title: '专 — 做专业生产的践行者',
        desc: '生产专业、研发专注、行业专攻，二十多年涂布经验积累，可定制特殊规格配方'
      },
      en: {
        title: 'Professional — Expert Manufacturing',
        desc: 'Professional production, focused R&D, industry expertise — 20+ years coating experience, custom specifications available'
      }
    },
    {
      key: '快',
      icon: <Zap size={24} />,
      cn: {
        title: '快 — 做快速高效的先行者',
        desc: '效率快、发货快、响应快，大量现货支持快速交付，24小时回复报价'
      },
      en: {
        title: 'Fast — Quick Response',
        desc: 'Fast efficiency, fast delivery, fast response — large inventory enables quick delivery, quote within 24 hours'
      }
    },
    {
      key: '精',
      icon: <Award size={24} />,
      cn: {
        title: '精 — 做色准精确的攻坚者',
        desc: '色彩精确、尺寸精细、工艺精湛，精准温控保障离型稳定、色泽均匀'
      },
      en: {
        title: 'Precise — Color Accuracy',
        desc: 'Precise color, precise dimensions, exquisite craftsmanship — tight temperature control ensures stable release and consistent color'
      }
    },
    {
      key: '优',
      icon: <CheckCircle size={24} />,
      cn: {
        title: '优 — 做品质优异的贯彻者',
        desc: '品质优、服务优、价格优，从原材料到成品全流程质检，合格率99%+'
      },
      en: {
        title: 'Premium — Superior Quality',
        desc: 'Premium quality, premium service, competitive pricing — full quality control from raw material to finished product, >99% pass rate'
      }
    }
  ];

  const certifications = [
    { name: 'ISO 9001', desc: { cn: '质量管理体系认证', en: 'Quality Management System Certification' } },
    { name: 'RoHS', desc: { cn: '有害物质限制认证', en: 'Restriction of Hazardous Substances' } },
    { name: 'EN71-3', desc: { cn: '欧盟玩具安全标准', en: 'EU Toy Safety Standard' } },
    { name: 'ASTM-F963', desc: { cn: '美国玩具安全标准', en: 'US Toy Safety Standard' } },
    { name: 'SGS', desc: { cn: '第三方权威检测', en: 'Third-party Testing' } },
    { name: 'BSCI', desc: { cn: '商业社会标准认证', en: 'Business Social Compliance Initiative' } }
  ];

  return (
    <>
      <SEOMeta
        title={pageTitle}
        description={pageDesc}
        keywords={keywords}
        type="website"
        geoRegion="CN"
        geoPlacename="Dongguan, Guangdong"
        geoPosition="22.7860 113.8860"
        locale={lang === 'cn' ? 'zh_CN' : 'en_US'}
        canonicalUrl={`/${lang}/about`}
      />

      <main className="pt-24 pb-20 bg-neutral-50 min-h-screen">
        <div className="max-w-[1200px] mx-auto px-6">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-neutral-900 mb-6">
              {lang === 'cn' ? '关于品特' : 'About PINTE'}
            </h1>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              {lang === 'cn'
                ? '东莞佰仕特旗下高端烫金箔品牌 · 二十余年涂布经验 · 服务全球客户'
                : 'Premium Hot Stamping Foil Brand from Dongguan BEST · 20+ Years Coating Experience · Serving Global Customers'}
            </p>
          </div>

          {/* Company History */}
          <div className="bg-white rounded-3xl p-8 md:p-12 mb-12 shadow-sm border border-neutral-100">
            <h2 className="text-3xl font-bold text-neutral-900 mb-6">
              {lang === 'cn' ? '公司历史' : 'Company History'}
            </h2>
            <div className="prose prose-lg max-w-none text-neutral-700">
              {lang === 'cn' ? (
                <>
                  <p>
                    我们的母公司<strong>东莞佰仕特工艺制品有限公司</strong>始建于<strong>1998年</strong>，扎根中国制造业名城东莞长安镇，从金葱粉行业起步，
                    至今已有超过二十五年历史，是业内知名的金葱粉标杆企业，长期服务于欧美各大知名客户。
                  </p>
                  <p className="mt-4">
                    凭借二十多年积累的精密涂布技术优势，我们在<strong>2020年</strong>延伸产业链，成立烫金事业部，
                    推出高端烫金箔品牌 <strong>「品特 PINTE」</strong>，专注于高端烫金箔的研发与生产。
                  </p>
                  <p className="mt-4">
                    今天，品特已经发展成为集研发、生产、销售于一体的综合性烫金箔制造企业，
                    产品远销越南、马来西亚、泰国、印尼、欧美等全球三十多个国家和地区，
                    涵盖包装印刷、服装皮革、塑料制品、美妆化妆品、汽车装饰等多个行业。
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Our parent company <strong>Dongguan BEST Craftwork Co., Ltd.</strong> was founded in <strong>1998</strong> in Chang'an Town, Dongguan,
                    the manufacturing hub of South China. Starting as a glitter powder manufacturer,
                    we've grown into an industry benchmark with over 25 years of experience,
                    serving major international brands across Europe and North America for decades.
                  </p>
                  <p className="mt-4">
                    With accumulated expertise in precision coating, we established the <strong>PINTE Hot Stamping Foil Division in 2020</strong>,
                    launching our high-end hot stamping foil brand <strong>PINTE</strong> focusing on R&D and manufacturing of premium products.
                  </p>
                  <p className="mt-4">
                    Today, PINTE has grown into a comprehensive hot stamping foil manufacturer integrating R&D, production and sales.
                    Our products are exported to more than 30 countries worldwide including Vietnam, Malaysia, Thailand, Indonesia, Europe and North America,
                    serving industries such as packaging & printing, apparel & leather, plastics, cosmetics, automotive decoration and more.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 text-center shadow-sm border border-neutral-100"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-pinte-blue/10 text-pinte-blue rounded-xl mb-4">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-neutral-900 mb-1">
                  {lang === 'cn' ? stat.cn.value : stat.en.value}
                </div>
                <div className="text-sm text-neutral-500">
                  {lang === 'cn' ? stat.cn.label : stat.en.label}
                </div>
              </div>
            ))}
          </div>

          {/* Core Values */}
          <div className="bg-white rounded-3xl p-8 md:p-12 mb-12 shadow-sm border border-neutral-100">
            <h2 className="text-3xl font-bold text-neutral-900 mb-8">
              {lang === 'cn' ? '核心优势：全专快精优' : 'Core Strengths: Complete, Professional, Fast, Precise, Premium'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {coreValues.map((item) => (
                <div key={item.key} className="flex items-start gap-4 p-5 bg-neutral-50 rounded-xl">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-pinte-blue/10 text-pinte-blue rounded-lg flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-bold text-neutral-900 text-lg mb-1">
                      {lang === 'cn' ? item.cn.title : item.en.title}
                    </div>
                    <p className="text-sm text-neutral-600">
                      {lang === 'cn' ? item.cn.desc : item.en.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Factory Location */}
          <div className="bg-white rounded-3xl p-8 md:p-12 mb-12 shadow-sm border border-neutral-100">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="md:w-1/3">
                <div className="inline-flex items-center gap-2 text-pinte-blue font-semibold mb-2">
                  <MapPin size={20} />
                  {lang === 'cn' ? '工厂地址' : 'Factory Location'}
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                  {lang === 'cn' ? '东莞市长安镇' : "Chang'an Town, Dongguan"}
                </h3>
                <p className="text-neutral-600">
                  {lang === 'cn'
                    ? '位于珠三角制造业核心区域，交通便利，物流发达，便捷服务全球客户'
                    : 'Located in the manufacturing heart of the Pearl River Delta with convenient logistics to serve customers worldwide'}
                </p>
              </div>
              <div className="md:w-2/3 bg-neutral-100 rounded-xl h-48 flex items-center justify-center">
                <p className="text-neutral-500">
                  {lang === 'cn' ? '工厂地图' : 'Factory Map'}
                </p>
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-white rounded-3xl p-8 md:p-12 mb-12 shadow-sm border border-neutral-100">
            <div className="flex items-center gap-2 mb-6">
              <Award size={24} className="text-pinte-blue" />
              <h2 className="text-3xl font-bold text-neutral-900">
                {lang === 'cn' ? '质量认证' : 'Quality Certifications'}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {certifications.map((cert, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-neutral-50 rounded-xl">
                  <CheckCircle size={20} className="text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-neutral-900">{cert.name}</div>
                    <div className="text-sm text-neutral-600">
                      {lang === 'cn' ? cert.desc.cn : cert.desc.en}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* R&D Investment */}
          <div className="bg-white rounded-3xl p-8 md:p-12 mb-12 shadow-sm border border-neutral-100">
            <h2 className="text-3xl font-bold text-neutral-900 mb-6">
              {lang === 'cn' ? '研发创新' : 'Research & Development'}
            </h2>
            <div className="text-neutral-700">
              {lang === 'cn' ? (
                <>
                  <p className="mb-4">
                    我们坚持每年将<strong>不少于15%的年收入</strong>投入到新产品研发和技术创新中，持续开发适应市场需求的新型烫金箔产品。
                    我们拥有完整的配方研发实验室和专业的技术工程师团队，能够根据客户特定需求定制开发专用烫金箔。
                  </p>
                  <p>
                    主要研发方向包括：环保型冷烫箔、数码烫金箔、高性能颜料箔、特殊效果全息烫金箔等。
                  </p>
                </>
              ) : (
                <>
                  <p className="mb-4">
                    We consistently invest <strong>no less than 15% of annual revenue</strong> into new product development and technological innovation.
                    We maintain a fully-equipped R&D laboratory with a team of experienced engineers capable of developing
                    customized hot stamping foil solutions to meet specific customer requirements.
                  </p>
                  <p>
                    Our key R&D focuses include: eco-friendly cold foil, digital printing foil, high-performance pigment foil,
                    special effect holographic foil, and more.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="bg-white rounded-3xl p-8 md:p-12 mb-12 shadow-sm border border-neutral-100">
            <h2 className="text-3xl font-bold text-neutral-900 mb-6">
              {lang === 'cn' ? '愿景使命' : 'Vision & Mission'}
            </h2>
            <div className="text-neutral-700">
              {lang === 'cn' ? (
                <>
                  <p className="mb-4">
                    <strong>愿景：</strong>成为全球烫金膜领域的卓越引领者。
                  </p>
                  <p className="mb-4">
                    <strong>使命：</strong>将高端、高质、易用的烫金膜带给每一位追求品质与创新的行业伙伴，让他们的产品焕发独特光彩。
                  </p>
                  <p>
                    <strong>经营理念：</strong>我们始终秉承「<strong>彼此成就、合作共赢</strong>」，用专业工艺为您的产品赋能，期待与您携手开拓全球市场！
                  </p>
                </>
              ) : (
                <>
                  <p className="mb-4">
                    <strong>Vision:</strong> To be a trusted global leader in the hot stamping foil industry.
                  </p>
                  <p className="mb-4">
                    <strong>Mission:</strong> To bring premium, high-quality, easy-to-use hot stamping foils to every industry partner who pursues quality and innovation,
                    enabling your products to shine with unique brilliance.
                  </p>
                  <p>
                    <strong>Philosophy:</strong> We have always adhered to <strong>"Mutual Success, Win-Win Cooperation"</strong>.
                    We empower your products with professional craftsmanship and look forward to joining hands with you to explore the global market!
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Management Team */}
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-neutral-100">
            <div className="flex items-center gap-2 mb-6">
              <Users size={24} className="text-pinte-blue" />
              <h2 className="text-3xl font-bold text-neutral-900">
                {lang === 'cn' ? '管理团队' : 'Management Team'}
              </h2>
            </div>
            <div className="text-neutral-700">
              {lang === 'cn' ? (
                <p>
                  我们的核心管理团队平均拥有超过十五年的行业经验，核心管理层来自行业顶尖企业。
                  团队深耕国际市场，熟悉欧美东南亚不同地区市场的质量标准和合规要求，
                  能够为全球客户提供专业的产品建议和优质的售后服务。
                </p>
              ) : (
                <p>
                  Our core management team averages over 15 years of experience in the industry,
                  with senior executives coming from leading companies in the sector. Our team has extensive experience
                  serving international markets and understands the quality standards and regulatory requirements
                  across Europe, North America, and Southeast Asia, enabling us to provide professional product
                  recommendations and excellent after-sales service to customers worldwide.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default About;
