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
        title: `${product.name} - 粗面烫金箔 | PINTE品特`,
        description: 'PK咖啡底系列专为粗糙不平整表面设计的烫金箔，特别适合粗纹纸、压纹皮革、特种纸等难烫材料，特有抗氧化涂层保证重油墨纸张烫后光泽不发黑。东莞品特专业生产，供应东南亚市场。',
        keywords: ['PK咖啡底', 'PK系列', '粗面烫金箔', '粗糙表面烫金', '重油墨烫金', '抗氧化烫金箔', '粗纹纸烫金', '压纹皮革烫金', '特种纸烫金', 'PK咖啡底烫金箔厂家', '东莞PK烫金箔', '东南亚粗面烫金箔供应商', '难烫材料专用烫金箔'],
      },
      en: {
        title: `${product.name} - Rough Surface Foil | PINTE`,
        description: 'PK Brown Back series hot stamping foil designed for rough and uneven surfaces, specially for rough paper, embossed leather, specialty paper. Special anti-oxidation coating maintains gloss on heavy ink paper. Professional manufacturer from Dongguan China, supplying Southeast Asia market.',
        keywords: ['PK brown back foil', 'PK series', 'rough surface foil', 'heavy ink oxidation resistant', 'rough paper stamping', 'embossed leather stamping', 'specialty paper foil', 'PK brown back foil manufacturer', 'Dongguan China', 'rough surface hot stamping foil supplier for Southeast Asia'],
      },
    },
    PC: {
      cn: {
        title: `${product.name} - 化妆品包材专用 | PINTE品特`,
        description: 'PC系列专为塑胶材质设计，支持ABS、PS、PVC、亚克力等多种塑胶，优异耐酒精性能，完美通过百格测试，是化妆品包材烫金的最佳选择。',
        keywords: ['PC系列', 'PC塑胶烫金箔', '塑胶烫金', '化妆品包材烫金', 'ABS烫金箔', 'PS烫金', 'PVC烫金', '亚克力烫金', '耐酒精烫金箔', '塑胶烫金箔厂家', '东莞PC烫金箔', '化妆品包装烫金箔供应', '东南亚塑胶烫金箔'],
      },
      en: {
        title: `${product.name} - Plastic Foil | PINTE`,
        description: 'PC series hot stamping foil specially engineered for plastic materials, supports ABS, PS, PVC, acrylic and other plastics. Excellent alcohol resistance, passes cross-cut test perfectly, ideal for cosmetic packaging hot stamping.',
        keywords: ['PC series', 'plastic hot stamping foil', 'cosmetic packaging foil', 'ABS stamping foil', 'PS stamping', 'PVC stamping', 'acrylic stamping', 'alcohol resistant foil', 'plastic foil manufacturer Dongguan China', 'hot stamping foil for plastic packaging Southeast Asia'],
      },
    },
    PLPY: {
      cn: {
        title: `${product.name} - 高遮盖力纯正色彩 | PINTE品特`,
        description: 'PL/PY颜料箔是以颜料为原料的非镀铝产品，解决印刷油墨遮盖力不足问题，色彩饱满呈现纯正色彩，适合各种纸质基材和礼品包装。',
        keywords: ['PL/PY颜料箔', '颜料烫金箔', '非镀铝烫金箔', '高遮盖力烫金', '色彩纯正烫金箔', '铜版纸颜料箔', '白卡纸烫金', '礼品盒颜料箔', '日期打码颜料箔', '东莞颜料箔生产厂家', '高档包装颜料烫金箔', '东南亚颜料箔供应商'],
      },
      en: {
        title: `${product.name} - High Coverage Pure Color | PINTE`,
        description: 'PL/PY pigment foils are non-aluminized products using pigment as raw material, solves insufficient ink coverage problem, provides full and pure colors, suitable for various paper substrates and gift packaging.',
        keywords: ['PL/PY pigment foil', 'pigment hot stamping foil', 'non-aluminized foil', 'high coverage foil', 'pure color foil', 'pigment foil for gift box', 'date coding foil', 'pigment foil manufacturer Dongguan China', 'premium packaging pigment foil supplier'],
      },
    },
    DIGITAL: {
      cn: {
        title: `${product.name} - 无需制版个性化烫金 | PINTE品特`,
        description: '数码冷烫系列无需制版，直接在UV光油或数码墨层上进行固化转移，适合个性化定制与小批量生产，适配MGI、Scodix等数码增效设备。',
        keywords: ['数码冷烫', '冷烫箔', '数码烫金', '无需制版烫金', '个性化烫金', '小批量烫金', '数码增效烫金', 'MGI冷烫', 'Scodix烫金', 'UV冷烫箔', '东莞数码冷烫箔厂家', '东南亚数码烫金供应商'],
      },
      en: {
        title: `${product.name} - Plate-Free Personalization | PINTE`,
        description: 'Digital cold foil series requires no plate making, direct curing transfer on UV varnish or digital toner layers, ideal for personalization and short-run production, compatible with MGI, Scodix and other digital enhancement equipment.',
        keywords: ['digital cold foil', 'cold foil stamping', 'digital hot stamping', 'plate-free foil', 'personalized packaging foil', 'short-run foil', 'digital enhancement foil', 'MGI compatible foil', 'Scodix compatible foil', 'UV curable cold foil', 'digital foil manufacturer China'],
      },
    },
    GLITTER: {
      cn: {
        title: `${product.name} - 耐高温耐溶剂高品质闪粉 | PINTE品特`,
        description: '品特25年生产经验金葱粉，六角形切片，耐高温耐溶剂，光泽持久不褪色，规格齐全从1/4英寸到1/500英寸，适合圣诞饰品、美甲、丝网印刷等应用。',
        keywords: ['金葱粉', '闪粉', '六角形金葱粉', '耐高温金葱粉', '耐溶剂金葱粉', '高品质闪粉', '美甲金葱粉', '圣诞饰品金葱粉', '丝网印刷金葱粉', '东莞金葱粉厂家', '25年生产经验金葱粉'],
      },
      en: {
        title: `${product.name} - Premium Heat Solvent Resistant Glitter | PINTE`,
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
              <img src={product.heroImage} alt={product.name} className="w-full h-full object-cover rounded-3xl shadow-soft" />
           </div>
        </div>

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
