'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Filter, ChevronDown, ArrowUpRight } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { FOIL_CATALOG } from '../data/foil_data';
import { FoilItem } from '../types';
import SEOMeta from '../components/SEOMeta';
import { LanguageProvider, useLanguage } from '../contexts/LanguageContext';

import { HotStampingSimulator } from '../components/HotStampingSimulator/App';
import { Language } from '../components/HotStampingSimulator/types';

const PinteFoils: React.FC = () => {
  return (
    <LanguageProvider>
      <PinteFoilsContent />
    </LanguageProvider>
  );
};

const PinteFoilsContent: React.FC = () => {
  const { lang, setLanguage } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeries, setFilterSeries] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Content translations - Enriched for SEO
  const content = {
    en: {
      badge: 'Industrial Excellence Since 2000',
      titleLine1: 'PRECISION',
      titleLine2: 'HOT STAMPING',
      titleLine3: 'FOIL TECHNOLOGY',
      subtitle: 'PINTE is a leading manufacturer of premium hot stamping foils based in Dongguan, China. We produce high-quality metallic foil, pigment foil, holographic foil, cold foil, and specialty foils for packaging, cosmetics, leather, plastic, textiles and industrial applications. Discover our complete collection.',
      explore: 'Browse Full Catalog',
      specs: 'Technical Specifications',
      introTitle: 'The Science of Metallic Coating',
      step1Title: 'Vacuum Metallization',
      step1Desc: 'At 10^-4 mbar vacuum pressure, aluminum is vaporized and evenly deposited onto high-grade polyester film creating the metallic reflective layer that gives hot stamping foil its signature brilliance.',
      step2Title: 'Multi-Layer Coating',
      step2Desc: 'Precision coating applies release layer, color layer, and adhesive layer in sequence. High-speed rollers maintain ±0.5°C temperature control for uniform coating quality.',
      step3Title: 'Quality Inspection',
      step3Desc: 'Automated optical inspection scans every inch of the foil web checking for color consistency, thickness uniformity, and surface quality to ensure every roll meets ISO 9001 standards.',
      statsVarieties: 'Varieties',
      statsSeries: 'Series',
      statsCertified: 'ISO 9001',
      statsExport: 'Global Export',
      catalogTitle: 'Complete Hot Stamping Foil Color Catalog',
      catalogDesc: 'Browse our entire collection of hot stamping foil colors. Filter by series and finish to find the perfect metallic, matte, pigment, or holographic foil for your application.',
      searchPlaceholder: 'Search by foil name, code, or type...',
      allTypes: 'All Foil Types',
      allSeries: 'All Series',
      showingResults: 'Showing {count} of {total} hot stamping foils',
      noResults: 'No foils match your search criteria',
      ctaTitle: 'Need Custom Hot Stamping Foil Supplies?',
      ctaText: 'Contact PINTE today for a free quote and sample request. We supply high-quality hot stamping foils to packaging converters, printers, and manufacturers worldwide including Vietnam, Thailand, Malaysia, Indonesia, Singapore.',
      getQuote: 'Get Free Quote & Samples',
      specsTitle: 'Precision Manufacturing Specifications',
    },
    cn: {
      badge: '源自2000 行业卓越品质',
      titleLine1: '专业',
      titleLine2: '烫金箔',
      titleLine3: '制造商',
      subtitle: 'PINTE品特位于中国东莞，是领先的烫金箔生产厂家。专业生产金属烫金箔、颜料烫金箔、镭射全息烫金箔、冷烫箔和特种烫金箔，广泛应用于包装、化妆品、皮革、塑胶、纺织品等行业。浏览我们全系列烫金箔颜色产品。',
      explore: '浏览完整色卡',
      specs: '技术规格',
      introTitle: '烫金箔生产工艺',
      step1Title: '真空镀铝',
      step1Desc: '在 10^-4 毫巴高真空环境下，将铝气化成分子均匀沉积到高品质聚酯薄膜上，形成烫金箔特有的金属反光层，赋予烫金箔卓越光泽。',
      step2Title: '多层涂布',
      step2Desc: '依次涂布离型层、色层、胶粘层，高速精密辊筒控制 ±0.5℃ 温度，保证每一层涂布均匀一致。',
      step3Title: '光学检测',
      step3Desc: '精准温控确保离型层均匀活化，保证烫印顺畅不粘版；自动光学检测系统全程扫描，检查颜色一致性、厚度均匀性和表面质量，确保每一卷都符合 ISO 9001 质量标准。',
      statsVarieties: '种颜色',
      statsSeries: '个系列',
      statsCertified: 'ISO 认证',
      statsExport: '出口全球',
      catalogTitle: '完整烫金箔颜色目录',
      catalogDesc: 'PINTE品特提供全系列烫金箔颜色，包括金属色、哑光、颜料色、镭射全息等多种类型，可按系列和光泽筛选，帮您找到完美匹配的烫金箔。',
      searchPlaceholder: '按烫金箔名称、编号或类型搜索...',
      allTypes: '所有类型',
      allSeries: '所有系列',
      showingResults: '显示 {count} / 共 {total} 种烫金箔',
      noResults: '没有找到符合条件的烫金箔',
      ctaTitle: '需要定制烫金箔供应？',
      ctaText: '立即联系PINTE品特获取免费报价和样品。我们为包装印刷厂、 converter 制造商提供高品质烫金箔，产品远销越南、泰国、马来西亚、印尼、新加坡等东南亚地区。',
      getQuote: '获取报价和样品',
      specsTitle: '精密制造工艺规格',
    }
  };

  // SEO data - Optimized for search engines
  const seo = {
    title: lang === 'cn'
      ? 'PINTE品特烫金箔完整颜色目录 - 专业烫金箔生产厂家 | Dongguan China'
      : 'Complete Hot Stamping Foil Color Catalog - PINTE Professional Manufacturer | Dongguan China',
    description: lang === 'cn'
      ? 'PINTE品特位于东莞，专业生产各种烫金箔，包括金属烫金箔、颜料烫金箔、镭射全息烫金箔、冷烫箔。浏览完整烫金箔颜色目录，适用于包装、化妆品、皮革、塑胶、纺织品等行业。产品出口越南、泰国、马来西亚、印尼、新加坡等东南亚地区。'
      : 'PINTE is a leading professional hot stamping foil manufacturer based in Dongguan, China. Browse complete catalog of metallic foil, pigment foil, holographic foil, cold foil. Serving packaging, cosmetics, leather, textile industries exporting to Vietnam, Thailand, Malaysia, Indonesia, Singapore.',
    image: 'https://www.pintecl.com/og-image-pintefoils.jpg',
    url: `/${lang}/pintefoils`,
  };

  // Get unique types and series for filters
  const types = useMemo(() => {
    const uniqueTypes = new Set(FOIL_CATALOG.map(f => f.type));
    return Array.from(uniqueTypes);
  }, []);

  const series = useMemo(() => {
    const uniqueSeries = new Set(FOIL_CATALOG.map(f => f.series));
    return Array.from(uniqueSeries);
  }, []);

  // Filter foils based on search and filters
  const filteredFoils = useMemo(() => {
    return FOIL_CATALOG.filter(foil => {
      const matchesSearch =
        foil.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        foil.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        foil.type.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'all' || foil.type === filterType;
      const matchesSeries = filterSeries === 'all' || foil.series === filterSeries;

      return matchesSearch && matchesType && matchesSeries;
    });
  }, [searchTerm, filterType, filterSeries]);

  // Smooth scroll to catalog
  const scrollToCatalog = () => {
    const element = document.getElementById('catalog');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  // aurum gradient class
  const aurumGradient = 'bg-gradient-to-br from-[#e9c349] to-[#9f7f00]';

  return (
    <div className="min-h-screen bg-[#111316] text-[#e2e2e6] font-sans selection:bg-[#e9c349]/30">
      <SEOMeta
        title={seo.title}
        description={seo.description}
        image={seo.image}
        url={seo.url}
        type="website"
      />

      {/* Language Switcher */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-[#111316]/80 backdrop-blur-[24px] border border-[#44474c]/50 rounded-full p-1">
        <button
          onClick={() => setLanguage('cn')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
            lang === 'cn'
              ? `${aurumGradient} text-[#3c2f00]`
              : 'text-[#e2e2e6]/70 hover:text-[#e2e2e6]'
          }`}
        >
          中文
        </button>
        <button
          onClick={() => setLanguage('en')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
            lang === 'en'
              ? `${aurumGradient} text-[#3c2f00]`
              : 'text-[#e2e2e6]/70 hover:text-[#e2e2e6]'
          }`}
        >
          EN
        </button>
      </div>

      {/* Logo */}
      <div className="fixed top-6 left-6 z-50">
        <div className="text-[#e9c349] text-2xl font-black tracking-tighter font-[Manrope]">PINTE</div>
      </div>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center pt-24 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <ASCIIArtBackground />
            <div className="absolute inset-0 bg-gradient-to-r from-[#111316] via-[#111316]/80 to-transparent"></div>
          </div>
          <div className="container mx-auto px-12 relative z-10">
            <div className="max-w-4xl">
              <div className="inline-block py-1 px-3 bg-[#221a00] border-l-4 border-[#e9c349] mb-8">
                <span className="text-[#e9c349] text-[0.6875rem] uppercase tracking-[0.2em] font-semibold">
                  {content[lang].badge}
                </span>
              </div>
              <h1 className="text-[3.5rem] md:text-[5rem] font-[Manrope] font-extrabold tracking-tighter leading-[0.9] text-[#e2e2e6] mb-8">
                {content[lang].titleLine1} <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#e9c349] to-[#9f7f00]">{content[lang].titleLine2}</span><br />
                {content[lang].titleLine3}
              </h1>
              <p className="text-lg text-[#c5c6cd] max-w-xl mb-12 leading-relaxed">
                {content[lang].subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <button
                  onClick={scrollToCatalog}
                  className={`${aurumGradient} text-[#3c2f00] font-[Manrope] tracking-tighter uppercase text-sm font-bold px-10 py-5 rounded-[0.125rem] flex items-center group hover:scale-[1.02] active:scale-[0.98] transition-transform`}
                >
                  {content[lang].explore}
                  <ArrowUpRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={scrollToCatalog}
                  className="border-2 border-[#44474c] text-[#e2e2e6] font-[Manrope] tracking-tighter uppercase text-sm font-bold px-10 py-5 rounded-[0.125rem] hover:bg-[#282a2d] transition-colors"
                >
                  {content[lang].specs}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Company About Section - SEO enriched */}
        <section className="py-24 bg-[#111316]">
          <div className="container mx-auto px-12">
            <div className="text-center mb-12">
              <div className="inline-block py-1 px-3 bg-[#221a00] border-l-4 border-[#e9c349] mb-4">
                <span className="text-[#e9c349] text-[0.6875rem] uppercase tracking-[0.2em] font-semibold">
                  {lang === 'en' ? 'About Dongguan BEST' : '关于东莞佰仕特'}
                </span>
              </div>
              <h2 className="text-4xl font-[Manrope] font-extrabold tracking-tighter text-[#e2e2e6] uppercase mb-4">
                {lang === 'en'
                  ? 'Professional Hot Stamping Foil Manufacturer in Dongguan China'
                  : '中国东莞专业烫金箔生产厂家'
                }
              </h2>
              <p className="text-[#c5c6cd] max-w-3xl mx-auto text-lg leading-relaxed">
                {lang === 'en'
                  ? 'Dongguan BEST Craftwork Products Co., Ltd. founded in 1998, originally a leading glitter powder manufacturer serving European and American major clients, expanded to hot stamping foil industry in 2020 with the premium brand PINTE. With over 25 years of coating manufacturing experience, we deliver high-quality hot stamping foils to global clients.'
                  : '东莞佰仕特工艺制品有限公司创立于1998年，原是服务欧美知名品牌的金葱粉行业领军企业，2020年拓展烫金箔产业，推出高端品牌「品特PINTE」。凭借25年涂层制造经验，我们为全球客户提供高品质烫金箔产品。'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              {/* English/Chinese Company Intro */}
              {lang === 'en' ? (
                <div className="space-y-8 text-[#c5c6cd]">
                  <div>
                    <h3 className="text-2xl font-[Manrope] font-bold text-[#e2e2e6] mb-4 uppercase">Company Story</h3>
                    <p className="leading-relaxed mb-4">
                      Dear global partners, welcome to Dongguan BEST Craft Products Co., Ltd. — a professional manufacturing base for both glitter powder and hot stamping foil.
                    </p>
                    <p className="leading-relaxed mb-4">
                      Since our establishment in 1998, we have rooted ourselves in the glitter powder industry and grown into a benchmark enterprise with the most comprehensive product range and leading technologies in the sector. From art printing to architectural decoration, from Christmas crafts to nail beauty, our glitter powder, sequins, glitter paper and other products have long served major well-known clients in Europe and America, backed by international certifications such as ISO9001 and SGS. Our 200,000㎡ self-owned workshop and fully automated production lines ensure stable supply and superior quality.
                    </p>
                    <p className="leading-relaxed">
                      In 2020, we expanded our technical strengths to establish the Hot Stamping Division and launched the high-end brand "PINTE", covering a full range of hot stamping foils including PK series for rough surfaces, PC series for plastics, and PL/PY pigment foils. Leveraging our core capabilities of <strong className="text-[#e9c349]">"Comprehensiveness, Professionalism, Efficiency, Precision, and Excellence"</strong>: we offer multi-color and multi-size customization to suit all fields such as packaging, apparel, and vehicles; precise temperature control and patented technologies guarantee stable color and reliable release; efficient response and full-process quality control make cooperation worry-free. So far, we have helped numerous brands enhance their product grades through hot stamping technology, winning trust from global clients.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-2xl font-[Manrope] font-bold text-[#e2e2e6] mb-4 uppercase">Core Values</h3>
                    <p className="leading-relaxed">
                      From the dazzling embellishment of glitter powder to the high-end texture of hot stamping foil, BEST has always adhered to the philosophy of <strong className="text-[#e9c349]">"Mutual Achievement, Win-Win Cooperation"</strong>, empowering your products with professional craftsmanship. Contact us now for exclusive solutions, and we look forward to joining hands with you to explore the global market!
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="bg-[#1a1c1f] p-6 rounded-[0.125rem] border border-[#44474c]/20">
                      <h4 className="text-[#e9c349] font-[Manrope] font-bold mb-3 uppercase">Full Range</h4>
                      <p className="text-sm text-[#c5c6cd]">Complete product range covering PK rough surface, PC plastic, pigment foils</p>
                    </div>
                    <div className="bg-[#1a1c1f] p-6 rounded-[0.125rem] border border-[#44474c]/20">
                      <h4 className="text-[#e9c349] font-[Manrope] font-bold mb-3 uppercase">Professional R&D</h4>
                      <p className="text-sm text-[#c5c6cd]">Continuous innovation in coating technology with patented processes</p>
                    </div>
                    <div className="bg-[#1a1c1f] p-6 rounded-[0.125rem] border border-[#44474c]/20">
                      <h4 className="text-[#e9c349] font-[Manrope] font-bold mb-3 uppercase">Precision Manufacturing</h4>
                      <p className="text-sm text-[#c5c6cd]">±0.5°C precise temperature control ensures consistent color accuracy</p>
                    </div>
                    <div className="bg-[#1a1c1f] p-6 rounded-[0.125rem] border border-[#44474c]/20">
                      <h4 className="text-[#e9c349] font-[Manrope] font-bold mb-3 uppercase">Global Export</h4>
                      <p className="text-sm text-[#c5c6cd]">Serving packaging, cosmetics, leather, plastic industries in Southeast Asia, Europe, Americas</p>
                    </div>
                  </div>
                  <div className="bg-[#e9c349]/10 border border-[#e9c349]/20 p-6 rounded-[0.125rem] mt-8">
                    <h4 className="text-[#e9c349] font-[Manrope] font-bold mb-2 uppercase">🎯 {lang === 'en' ? 'Certifications' : '资质认证'}</h4>
                    <p className="text-sm text-[#c5c6cd]">
                      ISO 9001 Quality System • BSCI • SGS • MSDS • REACH • RoHS Compliant
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 text-[#c5c6cd]">
                  <div>
                    <h3 className="text-2xl font-[Manrope] font-bold text-[#e2e2e6] mb-4 uppercase">公司简介</h3>
                    <p className="leading-relaxed mb-4">
                      各位全球伙伴，欢迎走进东莞佰仕特工艺制品有限公司 —— 这里是金葱粉与烫金膜两大产品的专业制造基地。
                    </p>
                    <p className="leading-relaxed mb-4">
                      自 1998 年成立以来，我们以金葱粉为起点深耕葱粉领域，如今已成为行业内品类最全、技术领先的标杆企业。从美术印刷到建筑装饰，从圣诞工艺到美甲美妆，我们的金葱粉、亮片、金葱纸张等产品，凭借 ISO9001、SGS 等国际认证的品质，长期服务于欧美各大知名客户，200000㎡ 自有车间与全自动化生产线，确保稳定供应与卓越质感。
                    </p>
                    <p className="leading-relaxed">
                      2020 年，我们延伸工艺优势成立烫金事业部，推出高端品牌 <span className="text-[#e9c349] font-bold">「品特 PINTE」</span>，覆盖咖啡底、PC 底、颜料箔等全系列烫金膜。依托 <span className="text-[#e9c349] font-bold">「全、专、快、精、优」</span> 核心能力：多色多尺寸定制适配包装、服装、车辆等全领域，精准温控与专利技术保障色彩稳定、离型可靠，高效响应与全流程品控让合作更省心。目前已助力众多品牌通过烫金工艺提升产品档次，赢得全球客户信赖。
                    </p>
                  </div>
                  <div>
                    <h3 className="text-2xl font-[Manrope] font-bold text-[#e2e2e6] mb-4 uppercase">企业理念</h3>
                    <p className="leading-relaxed">
                      从金葱粉的绚烂点缀到烫金膜的高端质感，佰仕特始终以 <span className="text-[#e9c349] font-bold">「彼此成就、合作共赢」</span> 为理念，用专业工艺为您的产品赋能。即刻咨询，获取专属解决方案，期待与您携手开拓全球市场！
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="bg-[#1a1c1f] p-6 rounded-[0.125rem] border border-[#44474c]/20">
                      <h4 className="text-[#e9c349] font-[Manrope] font-bold mb-3 uppercase">品类齐全</h4>
                      <p className="text-sm text-[#c5c6cd]">覆盖PK粗面、PC塑胶、颜料箔等全系列烫金箔</p>
                    </div>
                    <div className="bg-[#1a1c1f] p-6 rounded-[0.125rem] border border-[#44474c]/20">
                      <h4 className="text-[#e9c349] font-[Manrope] font-bold mb-3 uppercase">专业研发</h4>
                      <p className="text-sm text-[#c5c6cd]">持续工艺创新，多项专利技术保障</p>
                    </div>
                    <div className="bg-[#1a1c1f] p-6 rounded-[0.125rem] border border-[#44474c]/20">
                      <h4 className="text-[#e9c349] font-[Manrope] font-bold mb-3 uppercase">精准温控</h4>
                      <p className="text-sm text-[#c5c6cd]">±0.5℃ 温度精度控制，保证色彩一致</p>
                    </div>
                    <div className="bg-[#1a1c1f] p-6 rounded-[0.125rem] border border-[#44474c]/20">
                      <h4 className="text-[#e9c349] font-[Manrope] font-bold mb-3 uppercase">出口全球</h4>
                      <p className="text-sm text-[#c5c6cd]">产品远销越南、泰国、马来西亚、印尼、新加坡等东南亚地区</p>
                    </div>
                  </div>
                  <div className="bg-[#e9c349]/10 border border-[#e9c349]/20 p-6 rounded-[0.125rem] mt-8">
                    <h4 className="text-[#e9c349] font-[Manrope] font-bold mb-2 uppercase">🎯 资质认证</h4>
                    <p className="text-sm text-[#c5c6cd]">
                      ISO 9001 质量体系 • BSCI • SGS • MSDS • REACH • 符合 RoHS 环保要求
                    </p>
                  </div>
                </div>
              )}

              {/* Core Competencies Grid */}
              <div className="bg-[#1a1c1f] p-8 rounded-[0.125rem] border border-[#44474c]/20 sticky top-24">
                <h3 className="text-2xl font-[Manrope] font-bold text-[#e2e2e6] mb-6 uppercase">
                  {lang === 'en' ? 'Our Core Advantages' : '核心优势'}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#e9c349]/10 flex items-center justify-center text-[#e9c349] font-bold text-xs">✦</span>
                    <div>
                      <h4 className="text-[#e2e2e6] font-[Manrope] font-bold uppercase mb-1">{lang === 'en' ? 'Full Product Range' : '品类齐全'}</h4>
                      <p className="text-sm text-[#c5c6cd]">{lang === 'en' ? 'PK for rough surfaces, PC for plastics, pigment foils, holographic foils, cold foils — complete selection' : 'PK粗面烫金箔、PC塑胶烫金箔、颜料烫金箔、镭射全息烫金箔、冷烫箔 — 全系列覆盖'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#e9c349]/10 flex items-center justify-center text-[#e9c349] font-bold text-xs">✦</span>
                    <div>
                      <h4 className="text-[#e2e2e6] font-[Manrope] font-bold uppercase mb-1">{lang === 'en' ? '25+ Years Experience' : '25年行业经验'}</h4>
                      <p className="text-sm text-[#c5c6cd]">{lang === 'en' ? 'Since 1998 in coating industry, professional expertise from glitter to hot stamping' : '1998年进入涂层行业，从金葱粉到烫金箔，专业经验沉淀'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#e9c349]/10 flex items-center justify-center text-[#e9c349] font-bold text-xs">✦</span>
                    <div>
                      <h4 className="text-[#e2e2e6] font-[Manrope] font-bold uppercase mb-1">{lang === 'en' ? 'Custom Sizes & Colors' : '多色多尺寸定制'}</h4>
                      <p className="text-sm text-[#c5c6cd]">{lang === 'en' ? 'Accept custom specifications for special application requirements' : '接受特殊规格定制，满足不同应用领域需求'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#e9c349]/10 flex items-center justify-center text-[#e9c349] font-bold text-xs">✦</span>
                    <div>
                      <h4 className="text-[#e2e2e6] font-[Manrope] font-bold uppercase mb-1">{lang === 'en' ? 'Precision Temperature Control' : '精准温度控制'}</h4>
                      <p className="text-sm text-[#c5c6cd]">{lang === 'en' ? '±0.5°C accuracy ensures consistent color batch after batch' : '±0.5℃ 精度管控，保证每一批次颜色一致'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#e9c349]/10 flex items-center justify-center text-[#e9c349] font-bold text-xs">✦</span>
                    <div>
                      <h4 className="text-[#e2e2e6] font-[Manrope] font-bold uppercase mb-1">{lang === 'en' ? 'Export to Southeast Asia' : '东南亚主要供应商'}</h4>
                      <p className="text-sm text-[#c5c6cd]">{lang === 'en' ? 'Reliable supply to Vietnam, Thailand, Malaysia, Indonesia, Singapore' : '稳定供应越南、泰国、马来西亚、印尼、新加坡，本地仓备货'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#e9c349]/10 flex items-center justify-center text-[#e9c349] font-bold text-xs">✦</span>
                    <div>
                      <h4 className="text-[#e2e2e6] font-[Manrope] font-bold uppercase mb-1">{lang === 'en' ? 'International Certifications' : '国际认证齐全'}</h4>
                      <p className="text-sm text-[#c5c6cd]">{lang === 'en' ? 'ISO 9001, SGS, REACH, RoHS compliant for global markets' : 'ISO 9001、SGS、REACH、RoHS认证，符合出口要求'}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-[#44474c]/30">
                  <div className="text-center">
                    <p className="text-[#e9c349] font-[Manrope] font-bold uppercase mb-2">
                      {lang === 'en' ? 'Request Free Sample & Quote' : '索取免费样品  获取报价'}
                    </p>
                    <a
                      href={`/${lang}/quote`}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-br from-[#e9c349] to-[#9f7f00] text-[#3c2f00] font-[Manrope] font-semibold rounded-[0.125rem] hover:scale-[1.02] transition-transform"
                    >
                      {lang === 'en' ? 'Contact Us Now' : '立即联系'}
                      <ArrowUpRight className="ml-2 w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Coating Process Simulator - Integrated from open source project */}
        <section className="py-24 bg-[#0c0e11]">
          <div className="container mx-auto px-12">
            <div className="text-center mb-12">
              <div className="inline-block py-1 px-3 bg-[#221a00] border-l-4 border-[#e9c349] mb-4">
                <span className="text-[#e9c349] text-[0.6875rem] uppercase tracking-[0.2em] font-semibold">
                  {lang === 'en' ? 'Interactive Demo' : '交互式模拟器'}
                </span>
              </div>
              <h2 className="text-4xl font-[Manrope] font-extrabold tracking-tighter text-[#e2e2e6] uppercase mb-4">
                {lang === 'en' ? 'Interactive Coating Process Simulator' : '交互式涂布工艺模拟器'}
              </h2>
              <p className="text-[#c5c6cd] max-w-3xl mx-auto">
                {lang === 'en'
                  ? 'Explore our precision coating process with this interactive production simulator. Adjust machine parameters in real-time and see how they affect coating quality, film thickness, and defect formation.'
                  : '通过这个交互式生产模拟器探索我们的精密涂布工艺。实时调整机器参数，观察它们对涂布质量、膜厚和缺陷形成的影响。'
                }
              </p>
            </div>

            {/* Full Interactive Simulator */}
            <div className="relative">
              <HotStampingSimulator language={lang} />
            </div>

            <div className="mt-8 text-center text-[#c5c6cd] text-sm">
              <p>
                {lang === 'en'
                  ? 'Tip: Use mouse to rotate, zoom and pan the 3D view. Click on any process step in the header to jump directly to that station.'
                  : '提示：使用鼠标旋转、缩放和平移 3D 视图。点击顶部的任何工序步骤可直接跳转到该工位。'
                }
              </p>
            </div>
          </div>
        </section>

        {/* Complete Foil Catalog - RETAINED the full functionality */}
        <section id="catalog" className="py-24 bg-[#1a1c1f]">
          <div className="container mx-auto px-12">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div className="max-w-xl">
                <h2 className="text-4xl font-[Manrope] font-extrabold tracking-tighter text-[#e2e2e6] uppercase mb-4">
                  {content[lang].catalogTitle}
                </h2>
                <p className="text-[#c5c6cd]">{content[lang].catalogDesc}</p>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="mb-12 space-y-4">
              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c5c6cd] w-5 h-5" />
                <input
                  type="text"
                  placeholder={content[lang].searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-[0.125rem] bg-[#0c0e11] border-b-2 border-[#44474c] focus:ring-2 focus:ring-[#e9c349] focus:border-transparent outline-none transition-all text-[#e2e2e6]"
                />
              </div>

              {/* Mobile Filter Toggle */}
              <div className="md:hidden text-center">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-[#44474c] rounded-[0.125rem] text-[#c5c6cd] hover:bg-[#1e2023]"
                >
                  <Filter className="w-4 h-4" />
                  {lang === 'en' ? 'Filters' : '筛选'}
                  <ChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Filters */}
              {(isFilterOpen || window.innerWidth >= 768) && (
                <div className="flex flex-wrap gap-4 justify-center">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 border border-[#44474c] rounded-[0.125rem] bg-[#111316] text-[#e2e2e6] focus:ring-2 focus:ring-[#e9c349] outline-none min-w-[140px]"
                  >
                    <option value="all">{content[lang].allTypes}</option>
                    {types.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>

                  <select
                    value={filterSeries}
                    onChange={(e) => setFilterSeries(e.target.value)}
                    className="px-4 py-2 border border-[#44474c] rounded-[0.125rem] bg-[#111316] text-[#e2e2e6] focus:ring-2 focus:ring-[#e9c349] outline-none min-w-[140px]"
                  >
                    <option value="all">{content[lang].allSeries}</option>
                    {series.map(s => (
                      <option key={s} value={s}>{s} {lang === 'en' ? 'Series' : '系列'}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Results Count */}
              <div className="text-center text-[#c5c6cd] text-sm">
                {content[lang].showingResults.replace('{count}', filteredFoils.length.toString()).replace('{total}', FOIL_CATALOG.length.toString())}
              </div>
            </div>

            {/* Product Grid - KEEPING the original foil card design */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredFoils.map((foil) => (
                <FoilCard key={foil.id} foil={foil} lang={lang} />
              ))}
            </div>

            {filteredFoils.length === 0 && (
              <div className="text-center py-20">
                <p className="text-[#c5c6cd] text-lg">{content[lang].noResults}</p>
              </div>
            )}
          </div>
        </section>

        {/* Technical Specifications Section - SEO enriched */}
        <section className="py-24 bg-[#111316] relative overflow-hidden">
          <div className="container mx-auto px-12">
            <h2 className="sr-only">{content[lang].specsTitle}</h2>
            <div className="flex flex-col lg:flex-row gap-24">
              <div className="lg:w-1/3">
                <h2 className="text-5xl font-[Manrope] font-extrabold text-[#e9c349] mb-8 leading-none">
                  0.012<span className="text-[#c5c6cd] text-2xl ml-2">μm</span>
                </h2>
                <h3 className="text-[#e2e2e6] font-[Manrope] font-bold uppercase tracking-widest text-sm mb-4">
                  {lang === 'en' ? 'Coating Precision Tolerance' : '涂层精度公差'}
                </h3>
                <p className="text-[#c5c6cd] leading-relaxed">
                  {lang === 'en'
                    ? 'Our vacuum metallization process achieves nanometer precision coating tolerance, ensuring zero deviation across 2,000-meter master rolls of hot stamping foil.'
                    : '我们的真空镀铝工艺达到纳米级涂层精度公差，在 2000 米原卷上保证零偏差。'
                  }
                </p>
              </div>
              <div className="lg:w-2/3 lg:mt-32">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
                  <div>
                    <div className="h-px w-12 bg-[#e9c349] mb-6"></div>
                    <h4 className="text-[#e2e2e6] font-[Manrope] font-bold uppercase mb-2">
                      {lang === 'en' ? 'Heat Resistance' : '耐热性'}
                    </h4>
                    <p className="text-[#c5c6cd] text-sm">
                      {lang === 'en'
                        ? 'Stable performance up to 240°C for demanding high-speed rotary hot stamping applications.'
                        : '耐高温可达 240°C，满足高速轮转烫金应用要求。'
                      }
                    </p>
                  </div>
                  <div>
                    <div className="h-px w-12 bg-[#e9c349] mb-6"></div>
                    <h4 className="text-[#e2e2e6] font-[Manrope] font-bold uppercase mb-2">
                      {lang === 'en' ? 'PET Carrier Thickness' : 'PET 基材厚度'}
                    </h4>
                    <p className="text-[#c5c6cd] text-sm">
                      {lang === 'en'
                        ? 'Balanced PET film carriers from 12μm to 19μm available for optimized tension control during manufacturing.'
                        : '提供 12μm 至 19μm PET 薄膜基材，优化生产过程张力控制。'
                      }
                    </p>
                  </div>
                  <div>
                    <div className="h-px w-12 bg-[#e9c349] mb-6"></div>
                    <h4 className="text-[#e2e2e6] font-[Manrope] font-bold uppercase mb-2">
                      {lang === 'en' ? 'Surface Tension' : '表面张力'}
                    </h4>
                    <p className="text-[#c5c6cd] text-sm">
                      {lang === 'en'
                        ? 'Dyne level optimized for UV lacquers, OPP films, and porous paper substrates.'
                        : '表面张力经过优化，适用于 UV 油墨、OPP 薄膜和多孔纸张。'
                      }
                    </p>
                  </div>
                  <div>
                    <div className="h-px w-12 bg-[#e9c349] mb-6"></div>
                    <h4 className="text-[#e2e2e6] font-[Manrope] font-bold uppercase mb-2">
                      {lang === 'en' ? 'Color Consistency' : '颜色一致性'}
                    </h4>
                    <p className="text-[#c5c6cd] text-sm">
                      {lang === 'en'
                        ? 'Delta E < 0.5 color accuracy maintained across entire production run for consistent branding.'
                        : 'Delta E < 0.5 颜色精度，整卷保持一致色彩，保证品牌印刷一致性。'
                      }
                    </p>
                  </div>
                  <div>
                    <div className="h-px w-12 bg-[#e9c349] mb-6"></div>
                    <h4 className="text-[#e2e2e6] font-[Manrope] font-bold uppercase mb-2">
                      {lang === 'en' ? 'Roll Length' : '卷长规格'}
                    </h4>
                    <p className="text-[#c5c6cd] text-sm">
                      {lang === 'en'
                        ? 'Standard master rolls up to 2000 meters available for efficient production planning.'
                        : '标准原卷长达 2000 米，便于高效生产计划。'
                      }
                    </p>
                  </div>
                  <div>
                    <div className="h-px w-12 bg-[#e9c349] mb-6"></div>
                    <h4 className="text-[#e2e2e6] font-[Manrope] font-bold uppercase mb-2">
                      {lang === 'en' ? 'Core Diameter' : '纸芯内径'}
                    </h4>
                    <p className="text-[#c5c6cd] text-sm">
                      {lang === 'en'
                        ? 'Standard 3\" and 7\" paper cores fit most automatic hot stamping machines.'
                        : '标准 3英寸 和 7英寸 纸芯，适配大部分自动烫金机。'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-[#111316]">
          <div className="container mx-auto px-12 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-[Manrope] font-light mb-6 text-[#e2e2e6]">{content[lang].ctaTitle}</h2>
              <p className="text-xl text-[#c5c6cd] mb-10">{content[lang].ctaText}</p>
              <a
                href={`/${lang}/quote`}
                className={`inline-flex items-center px-8 py-4 ${aurumGradient} text-[#3c2f00] font-semibold rounded-[0.125rem] transition-all duration-300 transform hover:scale-105`}
              >
                {content[lang].getQuote}
                <ArrowUpRight className="ml-2 w-5 h-5" />
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#37393d]/15 bg-[#111316]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-12 py-16 max-w-7xl mx-auto">
          <div className="space-y-6">
            <div className="font-[Manrope] font-bold text-[#e9c349] text-2xl">PINTE</div>
            <p className="text-[#c5c6cd] text-[0.6875rem] uppercase tracking-widest max-w-xs">
              Pioneering industrial hot stamping foil technology with the prestige of artisanal craftsmanship.
            </p>
            <div className="text-[#c5c6cd] text-[0.6875rem] uppercase tracking-widest">
              © {new Date().getFullYear()} PINTE. ALL RIGHTS RESERVED.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Foil Card Component - Full color display by default, no click link
const FoilCard: React.FC<{ foil: FoilItem; lang: Language }> = ({ foil, lang }) => {
  return (
    <div
      className="group block bg-[#111316] border border-[#44474c]/20 rounded-[0.125rem] overflow-hidden hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)] transition-all duration-300 group-hover:-translate-y-2 group-hover:border-[#e9c349]/40"
    >
      {/* Color Preview Image - Full color by default */}
      <div className="aspect-square relative overflow-hidden bg-[#1a1c1f]">
        {foil.previewImage ? (
          <img
            src={foil.previewImage}
            alt={`${foil.name} preview`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-100"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{ backgroundColor: foil.hex }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111316] via-transparent to-transparent"></div>
      </div>

      {/* Info */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-lg font-semibold text-[#e2e2e6] group-hover:text-[#e9c349] transition-colors">
              {foil.code}
            </h3>
            <p className="text-[#c5c6cd]">{foil.name}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <span className="px-2 py-1 bg-[#1a1c1f] text-[#c5c6cd] rounded text-xs font-medium">
            {foil.type}
          </span>
          <span className="px-2 py-1 bg-[#e9c349]/10 text-[#e9c349] rounded text-xs font-medium">
            {foil.series} {lang === 'en' ? 'Series' : '系列'}
          </span>
          <span className="px-2 py-1 bg-[#e9c349]/10 text-[#a68724] rounded text-xs font-medium">
            {foil.finish}
          </span>
        </div>
      </div>
    </div>
  );
};

// 3D Production Process Animation
// Simulates vacuum metallization and coating process
const ProductionAnimation = () => {
  const [envLoaded, setEnvLoaded] = React.useState(true);

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [8, 5, 8], fov: 45 }}
        className="bg-[#0c0e11]"
      >
        <color attach="background" args={['#0c0e11']} />
        <fog attach="fog" args={['#0c0e11', 10, 30]} />

        {/* Ambient light */}
        <ambientLight intensity={0.5} />
        {/* Main spotlight */}
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        {/* Accent light from gold */}
        <pointLight position={[-10, -10, -10]} color="#e9c349" intensity={0.5} />

        <ProductionScene />

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />
        <Environment
          preset="city"
          background={false}
          onSuccess={() => setEnvLoaded(true)}
          onError={() => {
            setEnvLoaded(false);
            console.warn('Environment loading failed, using fallback lighting');
          }}
        />
        {/* Fallback lights when HDR environment fails to load */}
        {!envLoaded && (
          <>
            <directionalLight position={[5, 5, 5]} intensity={0.8} />
            <directionalLight position={[-5, 3, -5]} intensity={0.4} />
            <hemisphereLight args={['#e9c349', '#111316']} intensity={0.3} />
          </>
        )}
      </Canvas>
    </div>
  );
};

const ProductionScene = () => {
  // Main rollers
  const rollerRef1 = useRef<THREE.Mesh>(null);
  const rollerRef2 = useRef<THREE.Mesh>(null);
  const foilRef = useRef<THREE.Mesh>(null);

  // Animated particles for aluminum vapor deposition
  const particlesRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    // Rotate rollers continuously
    if (rollerRef1.current) rollerRef1.current.rotation.x = time * 0.5;
    if (rollerRef2.current) rollerRef2.current.rotation.x = time * 0.5;
    // Move foil forward slowly
    if (foilRef.current) foilRef.current.position.z = -time * 0.5;
    // Animate particles moving towards foil
    if (particlesRef.current) {
      particlesRef.current.position.z = -time * 0.5;
    }
  });

  // Create aluminum vapor particles - reduced count for memory optimization
  const particleCount = 100;
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 2] = Math.random() * 8 - 2;
    }
    return positions;
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* Vacuum chamber enclosure */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[12, 6, 8]} />
        <meshBasicMaterial color="#0a0c0e" wireframe={true} transparent opacity={0.3} />
      </mesh>

      {/* Feed roller */}
      <mesh ref={rollerRef1} position={[-3, 0, -1]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 5, 16]} />
        <meshStandardMaterial color="#2a2c30" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Take-up roller */}
      <mesh ref={rollerRef2} position={[3, 0, -1]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 5, 16]} />
        <meshStandardMaterial color="#2a2c30" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Coating roller */}
      <mesh position={[0, 0.8, 2]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 4.8, 16]} />
        <meshStandardMaterial color="#3a3c40" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Backing roller */}
      <mesh position={[0, -0.8, 2]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 4.8, 16]} />
        <meshStandardMaterial color="#3a3c40" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* PET film / foil moving through process */}
      <mesh ref={foilRef} position={[0, 0, 0]} rotation={[Math.PI * 0.5, 0, 0]}>
        <planeGeometry args={[5, 4.5]} />
        <meshPhysicalMaterial
          color="#d4af37"
          metalness={0.9}
          roughness={0.1}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Aluminum vapor particles (simulating deposition) */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={particlesPosition}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color="#e9c349"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Process stage labels (as 3D text placeholder) */}
      <group position={[-5, 2.5, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshBasicMaterial color="#e9c349" />
        </mesh>
      </group>
    </group>
  );
};

// Liquid Fluid Art Background - Dynamic flowing metallic colors, mouse interactive
const ASCIIArtBackground = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const pointerRef = React.useRef({ x: 0.5, y: 0.5, vx: 0, vy: 0 });

  // HSL to RGB conversion helper
  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * 6 * (2/3 - t);
    return p;
  };

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas
    const resize = () => {
      if (!containerRef.current || !canvas) return;
      canvas.width = containerRef.current.offsetWidth;
      canvas.height = containerRef.current.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Handle interaction - mouse/touch anywhere on page
    // Background is pointer-events-none, so listen globally
    const handleMove = (clientX: number, clientY: number) => {
      if (!containerRef.current || !canvas) return;
      const rect = containerRef.current.getBoundingClientRect();
      const nx = (clientX - rect.left) / rect.width;
      const ny = (clientY - rect.top) / rect.height;
      // Only respond if mouse is inside the hero section
      if (nx >= 0 && nx <= 1 && ny >= 0 && ny <= 1) {
        pointerRef.current.vx += (nx - pointerRef.current.x) * 0.08;
        pointerRef.current.vy += (ny - pointerRef.current.y) * 0.08;
      }
    };

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    // Listen globally on document - works even with overlaying divs
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove, { passive: true });


    // Fluid flow field function
    const noise = (x: number, y: number, time: number): number => {
      return (Math.sin(x * 3 + time) * Math.cos(y * 2 - time) + Math.sin(x * y * 0.5 + time * 0.5)) * 0.5;
    };

    // Draw metaball-like fluid with multiple circular blobs
    const drawFluid = (width: number, height: number, time: number) => {
      const image = ctx.createImageData(width, height);
      const data = image.data;

      const { x: px, y: py } = pointerRef.current;

      // Number of blobs depends on size, but keep performance good
      const cellSize = 4; // larger cell size = fewer pixels to compute = better memory/performance
      const w = Math.floor(width / cellSize);
      const h = Math.floor(height / cellSize);

      for (let yCell = 0; yCell < h; yCell++) {
        for (let xCell = 0; xCell < w; xCell++) {
          const nx = xCell / w;
          const ny = yCell / h;

          // Multiple flowing metaballs that move over time
          let field = 0;

          // User-interacted main blob
          const dx1 = nx - px;
          const dy1 = ny - py;
          field += 0.3 / (dx1 * dx1 + dy1 * dy1);

          // Orbiting blobs with periodic motion
          const cx1 = 0.2 + 0.15 * Math.sin(time * 0.5);
          const cy1 = 0.3 + 0.15 * Math.cos(time * 0.7);
          const dx2 = nx - cx1;
          const dy2 = ny - cy1;
          field += 0.15 / (dx2 * dx2 + dy2 * dy2);

          const cx2 = 0.8 - 0.2 * Math.sin(time * 0.3);
          const cy2 = 0.7 + 0.1 * Math.cos(time * 0.6);
          const dx3 = nx - cx2;
          const dy3 = ny - cy2;
          field += 0.12 / (dx3 * dx3 + dy3 * dy3);

          const cx3 = 0.5 + 0.3 * Math.sin(time * 0.8);
          const cy3 = 0.2 + 0.2 * Math.cos(time * 0.4);
          const dx4 = nx - cx3;
          const dy4 = ny - cy3;
          field += 0.1 / (dx4 * dx4 + dy4 * dy4);

          const cx4 = 0.15 + 0.2 * Math.cos(time * 0.9);
          const cy4 = 0.8 - 0.25 * Math.sin(time * 0.5);
          const dx5 = nx - cx4;
          const dy5 = ny - cy4;
          field += 0.08 / (dx5 * dx5 + dy5 * dy5);

          // Add flow noise
          const n = noise(nx * 8, ny * 8, time * 0.5);
          field += n * 0.05;

          // Threshold for liquid
          if (field > 0.6) {
            // Metallic gold/copper gradient based on field value and position - lower saturation
            const hue = 30 + (field - 0.6) * 40 + nx * 15 + px * 10;
            const sat = 35 + field * 25; // Lowered saturation
            const light = 35 + (field - 0.6) * 30 + (1 - ny) * 15;

            // Convert HSL to RGB (simplified)
            const h = hue / 360;
            const s = sat / 100;
            const l = light / 100;

            let r, g, b;
            if (s === 0) {
              r = g = b = l;
            } else {
              const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
              const p = 2 * l - q;
              r = Math.round(255 * hue2rgb(p, q, h + 1/3));
              g = Math.round(255 * hue2rgb(p, q, h));
              b = Math.round(255 * hue2rgb(p, q, h - 1/3));
            }

            for (let cy = 0; cy < cellSize && yCell * cellSize + cy < height; cy++) {
              for (let cx = 0; cx < cellSize && xCell * cellSize + cx < width; cx++) {
                const idx = ((yCell * cellSize + cy) * width + (xCell * cellSize + cx)) * 4;
                data[idx] = r;
                data[idx + 1] = g;
                data[idx + 2] = b;
                data[idx + 3] = 255;
              }
            }
          }
        }
      }

      ctx.putImageData(image, 0, 0);
    };

    // Add momentum friction
    const updatePhysics = () => {
      pointerRef.current.vx *= 0.95;
      pointerRef.current.vy *= 0.95;
      pointerRef.current.x += pointerRef.current.vx;
      pointerRef.current.y += pointerRef.current.vy;
      // Bound keep within 0-1
      pointerRef.current.x = Math.max(0, Math.min(1, pointerRef.current.x));
      pointerRef.current.y = Math.max(0, Math.min(1, pointerRef.current.y));
    };

    // Animation loop
    const animate = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      updatePhysics();
      const time = Date.now() * 0.001;

      drawFluid(width, height, time);

      // Add soft golden glow centered on mouse
      const gradient = ctx.createRadialGradient(
        width * pointerRef.current.x, height * pointerRef.current.y, 0,
        width * pointerRef.current.x, height * pointerRef.current.y, Math.max(width, height) * 0.6
      );
      gradient.addColorStop(0, 'rgba(233, 195, 73, 0.15)');
      gradient.addColorStop(1, 'rgba(233, 195, 73, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full absolute inset-0 overflow-hidden pointer-events-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full opacity-40 blur-[50px]"
      />
    </div>
  );
};

export default PinteFoils;
