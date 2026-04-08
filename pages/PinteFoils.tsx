'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, ChevronDown, ArrowUpRight } from 'lucide-react';
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

  // Content translations
  const content = {
    en: {
      badge: 'Industrial Excellence Since 2000',
      titleLine1: 'PRECISION',
      titleLine2: 'COATING',
      titleLine3: 'TECHNOLOGY',
      subtitle: 'Discover our complete collection of high-performance hot stamping foils. Engineered for precision, brilliance, and durability in every application.',
      explore: 'Explore Collection',
      specs: 'Technical Specs',
      introTitle: 'The Alchemy of Precision',
      step1Title: 'Molecular Deposition',
      step1Desc: 'Vacuum metallization processes that bond vaporized aluminum to high-grade polyester carriers at 10^-4 mbar.',
      step2Title: 'Thermal Activation',
      step2Desc: 'High-speed precision rollers maintain ±0.5°C thermal stability to ensure uniform release layer activation.',
      step3Title: 'Quality Assurance',
      step3Desc: 'Automated optical inspection systems scan every micron of the foil web for spectral consistency.',
      statsVarieties: 'Varieties',
      statsSeries: 'Series',
      statsCertified: 'ISO Certified',
      statsExport: 'Global Export',
      catalogTitle: 'Complete Foil Catalog',
      catalogDesc: 'Explore our full range of hot stamping foil products. Click on any foil to request more information.',
      searchPlaceholder: 'Search by name, code, or type...',
      allTypes: 'All Types',
      allSeries: 'All Series',
      showingResults: 'Showing {count} of {total} products',
      noResults: 'No foils match your search criteria.',
      ctaTitle: 'Ready to Get Started?',
      ctaText: 'Contact us today for a quote or request samples. We\'d love to help you find the perfect foil for your project.',
      getQuote: 'Request a Free Quote',
      specsTitle: 'Precision Engineering Specifications',
    },
    cn: {
      badge: '源自2000 行业卓越品质',
      titleLine1: '精密',
      titleLine2: '烫金',
      titleLine3: '技术',
      subtitle: '探索我们全系列高性能烫金箔，为每一种应用提供精确的烫印效果、卓越的金属光泽和出色的附着力。',
      explore: '浏览产品目录',
      specs: '技术规格',
      introTitle: '精密工艺的炼金术',
      step1Title: '分子沉积',
      step1Desc: '真空金属化工艺，在 10^-4 毫巴环境下将汽化铝分子沉积到高品质聚酯薄膜上。',
      step2Title: '热激活稳定',
      step2Desc: '高速精密辊筒保持 ±0.5℃ 热稳定性，确保离型层均匀激活。',
      step3Title: '质量检测',
      step3Desc: '自动光学检测系统扫描每微米箔材，确保光谱一致性。',
      statsVarieties: '款产品',
      statsSeries: '个系列',
      statsCertified: 'ISO 认证',
      statsExport: '全球出口',
      catalogTitle: '完整烫金箔目录',
      catalogDesc: '浏览我们全系列烫金箔产品，点击任意产品查看详情并询价。',
      searchPlaceholder: '按名称、编号或类型搜索...',
      allTypes: '所有类型',
      allSeries: '所有系列',
      showingResults: '显示 {count} / 共 {total} 个产品',
      noResults: '没有找到符合条件的产品',
      ctaTitle: '准备好开始了吗？',
      ctaText: '立即联系我们获取报价或索取样品，我们很乐意为您的项目找到完美的烫金解决方案。',
      getQuote: '免费获取报价',
      specsTitle: '精密工程规格参数',
    }
  };

  // SEO data
  const seo = {
    title: lang === 'cn'
      ? 'PINTEFoils 品特烫金箔 - 专业烫金箔产品目录 | 优质品质'
      : 'PINTE Foils - Professional Hot Stamping Foil Catalog | Premium Quality',
    description: lang === 'cn'
      ? '浏览PINTE全系列优质烫金箔。金属、哑光、颜料、镭射箔，适用于包装、化妆品、皮革和工业应用。'
      : 'Browse PINTE\'s complete catalog of premium hot stamping foils. Metallic, matte, pigment, holographic foils for packaging, cosmetics, leather, and industrial applications.',
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
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0c0e11]">
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                      <div className="absolute top-0 left-0 w-full h-full" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, #37393d 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
                    </div>
                    <div className="relative z-10 flex flex-col items-center text-center px-12">
                      <div className="material-symbols-outlined text-6xl text-[#e9c349]/40 mb-6">precision_manufacturing</div>
                      <h3 className="text-xl font-[Manrope] font-bold text-[#e2e2e6] tracking-widest uppercase mb-4">Production Process</h3>
                      <p className="text-[#c5c6cd] max-w-md text-sm mb-8">
                        PINTE 烫金箔通过严格的生产工艺流程，从分子沉积到最终质量检测，保证每一卷产品都达到最高品质标准。
                      </p>
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

        {/* Technical Specifications Section */}
        <section className="py-24 bg-[#111316] relative overflow-hidden">
          <div className="container mx-auto px-12">
            <h2 className="sr-only">{content[lang].specsTitle}</h2>
            <div className="flex flex-col lg:flex-row gap-24">
              <div className="lg:w-1/3">
                <h2 className="text-5xl font-[Manrope] font-extrabold text-[#e9c349] mb-8 leading-none">
                  0.012<span className="text-[#c5c6cd] text-2xl ml-2">μm</span>
                </h2>
                <h3 className="text-[#e2e2e6] font-[Manrope] font-bold uppercase tracking-widest text-sm mb-4">
                  Precision Tolerance
                </h3>
                <p className="text-[#c5c6cd] leading-relaxed">
                  Our coating heads are calibrated to nanometer precision, ensuring zero deviation across 2,000-meter master rolls.
                </p>
              </div>
              <div className="lg:w-2/3 lg:mt-32">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
                  <div>
                    <div className="h-px w-12 bg-[#e9c349] mb-6"></div>
                    <h4 className="text-[#e2e2e6] font-[Manrope] font-bold uppercase mb-2">Heat Resistance</h4>
                    <p className="text-[#c5c6cd] text-sm">Stable performance up to 240°C for demanding high-speed rotational applications.</p>
                  </div>
                  <div>
                    <div className="h-px w-12 bg-[#e9c349] mb-6"></div>
                    <h4 className="text-[#e2e2e6] font-[Manrope] font-bold uppercase mb-2">Carrier Gauge</h4>
                    <p className="text-[#c5c6cd] text-sm">Balanced PET carriers from 12μm to 19μm for optimized tension control.</p>
                  </div>
                  <div>
                    <div className="h-px w-12 bg-[#e9c349] mb-6"></div>
                    <h4 className="text-[#e2e2e6] font-[Manrope] font-bold uppercase mb-2">Surface Tension</h4>
                    <p className="text-[#c5c6cd] text-sm">Dyne levels optimized for UV-lacquers, OPP films, and porous papers.</p>
                  </div>
                  <div>
                    <div className="h-px w-12 bg-[#e9c349] mb-6"></div>
                    <h4 className="text-[#e2e2e6] font-[Manrope] font-bold uppercase mb-2">Spectral Fidelity</h4>
                    <p className="text-[#c5c6cd] text-sm">Delta E &lt; 0.5 color consistency maintained throughout production cycles.</p>
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

export default PinteFoils;
