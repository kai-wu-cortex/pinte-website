import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SEOMeta from '../components/SEOMeta';
import {
  Factory, Award, Calendar, MapPin,
  Zap, BookOpen, Users, CheckCircle
} from 'lucide-react';

const About: React.FC = () => {
  const { lang } = useLanguage();

  const pageTitle = lang === 'cn'
    ? '关于我们 - PINTE品特烫金箔 | 25年专业烫金膜制造经验'
    : 'About Us - PINTE Hot Stamping Foils | 25+ Years Manufacturing Experience';

  const pageDesc = lang === 'cn'
    ? 'PINTE品特 2000年成立于东莞，25+年专业烫金箔生产经验，20万平方米厂房，日产60,000米，年投入15%收入研发，通过ISO9001、RoHS、EN71-3、ASTM-F963认证。'
    : 'PINTE was founded in 2000 in Dongguan, China with 25+ years of professional hot stamping foil manufacturing experience. 200,000㎡ factory, 60,000 meters daily production, 15% annual revenue invested in R&D, certified with ISO9001, RoHS, EN71-3, ASTM-F963.';

  const keywords = lang === 'cn'
    ? ['关于我们', 'PINTE品特', '东莞烫金箔厂家', '25年经验', 'ISO9001认证', 'RoHS认证', '烫金箔生产', '中国制造', '长安镇']
    : ['about us', 'PINTE', 'hot stamping foil manufacturer', '25+ years experience', 'ISO9001 certified', 'RoHS compliant', 'Dongguan China', 'manufacturing'];

  const stats = [
    {
      icon: <Calendar size={24} />,
      cn: { label: '成立年份', value: '2000年' },
      en: { label: 'Founded', value: '2000' }
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

  const certifications = [
    { name: 'ISO 9001', desc: { cn: '质量管理体系认证', en: 'Quality Management System Certification' } },
    { name: 'RoHS', desc: { cn: '有害物质限制认证', en: 'Restriction of Hazardous Substances' } },
    { name: 'EN71-3', desc: { cn: '欧盟玩具安全标准', en: 'EU Toy Safety Standard' } },
    { name: 'ASTM-F963', desc: { cn: '美国玩具安全标准', en: 'US Toy Safety Standard' } }
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
              {lang === 'cn' ? '关于我们' : 'About Us'}
            </h1>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              {lang === 'cn'
                ? '25+ 年专注高端烫金箔研发制造，服务全球包装印刷行业'
                : '25+ Years Focused on R&D and Manufacturing of Premium Hot Stamping Foils for Global Packaging & Printing Industry'}
            </p>
          </div>

          {/* Company History */}
          <div className="bg-white rounded-3xl p-8 md:p-12 mb-12 shadow-sm border border-neutral-100">
            <h2 className="text-3xl font-bold text-neutral-900 mb-6">
              {lang === 'cn' ? '公司历史' : 'Company History'}
            </h2>
            <div className="prose prose-lg max-w-none text-neutral-700">
              {lang === 'cn' ? (
                <p>
                  PINTE品特始建于2000年，扎根中国制造业名城东莞长安镇，至今已有超过25年的烫金箔专业生产经验。
                  从初创时的小型加工厂，我们逐步发展成为集研发、生产、销售于一体的综合性烫金箔制造企业，
                  产品远销越南、马来西亚、泰国、印尼、欧美等全球三十多个国家和地区。
                </p>
              ) : (
                <p>
                  PINTE was founded in 2000 in Chang'an Town, Dongguan, the manufacturing hub of South China.
                  With over 25 years of specialized experience in hot stamping foil production, we have grown from
                  a small workshop into a comprehensive manufacturer integrating R&D, production, and sales.
                  Our products are exported to more than 30 countries worldwide including Vietnam, Malaysia, Thailand,
                  Indonesia, Europe, and North America.
                </p>
              )}
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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

          {/* Factory Location */}
          <div className="bg-white rounded-3xl p-8 md:p-12 mb-12 shadow-sm border border-neutral-100">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="md:w-1/3">
                <div className="inline-flex items-center gap-2 text-pinte-blue font-semibold mb-2">
                  <MapPin size={20} />
                  {lang === 'cn' ? '工厂地址' : 'Factory Location'}
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                  {lang === 'cn' ? '东莞市长安镇' : "Dongguan, Guangdong"}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    我们坚持每年将不少于15%的年收入投入到新产品研发和技术创新中，持续开发适应市场需求的新型烫金箔产品。
                    我们拥有完整的配方研发实验室和专业的技术工程师团队，能够根据客户特定需求定制开发专用烫金箔。
                  </p>
                  <p>
                    主要研发方向包括：环保型冷烫箔、数码烫金箔、高性能颜料箔、特殊效果全息烫金箔等。
                  </p>
                </>
              ) : (
                <>
                  <p className="mb-4">
                    We consistently invest no less than 15% of annual revenue into new product development and technological innovation.
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
                  我们的核心管理团队平均拥有超过15年的烫金行业经验，核心管理层来自行业顶尖企业。
                  团队深耕国际市场，熟悉欧美东南亚不同地区市场的质量标准和合规要求，
                  能够为全球客户提供专业的产品建议和优质的售后服务。
                </p>
              ) : (
                <p>
                  Our core management team averages over 15 years of experience in the hot stamping industry,
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
