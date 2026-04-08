'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Filter, ChevronDown, ArrowUpRight } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { FOIL_CATALOG } from '../data/foil_data';
import { FoilItem } from '../types';
import SEOMeta from '../components/SEOMeta';
import { LanguageProvider } from '../contexts/LanguageContext';

type Language = 'en' | 'cn';

const PinteFoils: React.FC = () => {
  return (
    <LanguageProvider>
      <PinteFoilsContent />
    </LanguageProvider>
  );
};

const PinteFoilsContent: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeries, setFilterSeries] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [lang, setLang] = useState<Language>('cn');

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
    url: '/pintefoils',
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
          onClick={() => setLang('cn')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
            lang === 'cn'
              ? `${aurumGradient} text-[#3c2f00]`
              : 'text-[#e2e2e6]/70 hover:text-[#e2e2e6]'
          }`}
        >
          中文
        </button>
        <button
          onClick={() => setLang('en')}
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
            <img
              className="w-full h-full object-cover opacity-40"
              alt="Close-up of molten liquid gold and metallic foil textures"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6616Ng5G4WS39qkBhgrb2vP31ciTN4xvS9O8xBEVH6-e29pTlE8Sb2yzMYshJy81VIgQd4zDSiMma48uOkSUdcyciOENYlrm3w0VlKa59EJColUjWTLqAvmj3FHHb2RaGnLNKIRxeid2__r3X0pf-NsRwZnFiG2gELasQ1x5592p7AQLQjCMSYbHeCBSm0Ef9xIiIZz7A-0hw0Fb_P0707GyMr2hL08jk0DRbgHDWNEuGKcf6b-diuTyUZ0OWWdTft73C1mF2ySDvX"
            />
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
          {/* Decorative Gauge */}
          <div className="absolute bottom-12 right-12 hidden xl:block">
            <div className="bg-[#1e2023]/50 backdrop-blur-md p-8 rounded-[0.125rem] border border-[#44474c]/15">
              <div className="flex items-end gap-4 mb-4">
                <div className="w-1.5 h-16 bg-[#282a2d] rounded-full overflow-hidden">
                  <div className={`w-3/4 ${aurumGradient}`}></div>
                </div>
                <div className="w-1.5 h-24 bg-[#282a2d] rounded-full overflow-hidden">
                  <div className={`w-1/2 ${aurumGradient}`}></div>
                </div>
                <div className="w-1.5 h-32 bg-[#282a2d] rounded-full overflow-hidden">
                  <div className={`w-5/6 ${aurumGradient}`}></div>
                </div>
                <div className="ml-4">
                  <div className="text-[#e9c349] font-[Manrope] font-black text-4xl tracking-tighter">99.8%</div>
                  <div className="text-[#c5c6cd] text-[0.6875rem] uppercase tracking-widest">Coating Purity</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-24 bg-[#111316]">
          <div className="container mx-auto px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-4 order-2 lg:order-1">
                <h2 className="text-3xl font-[Manrope] font-bold tracking-tighter text-[#e2e2e6] mb-6 uppercase">
                  {content[lang].introTitle}
                </h2>
                <div className="space-y-8">
                  <div className="group">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="w-8 h-8 rounded-full bg-[#e9c349]/10 flex items-center justify-center text-[#e9c349] font-bold text-xs">01</span>
                      <h4 className="text-[#e2e2e6] font-[Manrope] font-bold uppercase tracking-tight">{content[lang].step1Title}</h4>
                    </div>
                    <p className="text-[#c5c6cd] text-sm leading-relaxed pl-12">{content[lang].step1Desc}</p>
                  </div>
                  <div className="group">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="w-8 h-8 rounded-full bg-[#e9c349]/10 flex items-center justify-center text-[#e9c349] font-bold text-xs">02</span>
                      <h4 className="text-[#e2e2e6] font-[Manrope] font-bold uppercase tracking-tight">{content[lang].step2Title}</h4>
                    </div>
                    <p className="text-[#c5c6cd] text-sm leading-relaxed pl-12">{content[lang].step2Desc}</p>
                  </div>
                  <div className="group">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="w-8 h-8 rounded-full bg-[#e9c349]/10 flex items-center justify-center text-[#e9c349] font-bold text-xs">03</span>
                      <h4 className="text-[#e2e2e6] font-[Manrope] font-bold uppercase tracking-tight">{content[lang].step3Title}</h4>
                    </div>
                    <p className="text-[#c5c6cd] text-sm leading-relaxed pl-12">{content[lang].step3Desc}</p>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-8 order-1 lg:order-2">
                <div className="relative aspect-video rounded-[0.125rem] overflow-hidden bg-[#0c0e11] border border-[#44474c]/15">
                  <ProductionAnimation />
                  {/* Overlay Info */}
                  <div className="absolute top-6 left-6 z-10">
                    <div className="bg-[#111316]/80 backdrop-blur-md px-4 py-2 rounded-[0.125rem] border border-[#44474c]/20">
                      <div className="text-[#e9c349] text-xs font-[Manrope] font-bold uppercase tracking-widest">
                        3D Process Simulation
                      </div>
                      <div className="text-[#c5c6cd] text-[10px] mt-1">
                        Vacuum Metallization → Coating → Finishing
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
        <Environment preset="city" />
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

  // Create aluminum vapor particles
  const particleCount = 200;
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
        <cylinderGeometry args={[1.2, 1.2, 5, 32]} />
        <meshStandardMaterial color="#2a2c30" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Take-up roller */}
      <mesh ref={rollerRef2} position={[3, 0, -1]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 5, 32]} />
        <meshStandardMaterial color="#2a2c30" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Coating roller */}
      <mesh position={[0, 0.8, 2]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 4.8, 32]} />
        <meshStandardMaterial color="#3a3c40" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Backing roller */}
      <mesh position={[0, -0.8, 2]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 4.8, 32]} />
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

export default PinteFoils;
