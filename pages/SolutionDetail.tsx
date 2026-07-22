
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowLeft, CheckCircle2, Layers } from 'lucide-react';
import { PinteLogo } from '../components/PinteLogo';
import SEOMeta from '../components/SEOMeta';

const SolutionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { content, ui, lang } = useLanguage();
  const navigate = useNavigate();

  const solution = content.SOLUTIONS_DATA[id || ''];
  
  if (!solution) {
      return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
            <h2 className="text-2xl font-bold">Solution Not Found</h2>
            <button onClick={() => navigate('/')} className="mt-4 text-pinte-blue underline">Back Home</button>
            </div>
        </div>
      );
  }

  const series = content.SERIES_INFO[solution.series] || content.SERIES_INFO['PK'];
  const canonicalUrl = `/${lang}/solutions/${solution.id}`;
  const solutionProfiles: Record<string, {
    seoTitle: string;
    meta: string;
    answer: string;
    substrateRows: Array<{ substrate: string; foil: string; risk: string; test: string }>;
    issueRows: Array<{ issue: string; cause: string; action: string }>;
    sampleCta: string;
  }> = {
    special_paper: lang === 'cn'
      ? {
          seoTitle: '特种纸和粗糙纸烫金膜解决方案｜纸盒、礼盒、酒盒热烫',
          meta: '特种纸、粗糙纸、触感纸和覆膜纸烫金膜选型指南，覆盖底材适配、边缘清晰、大面积转移、附着力、温度压力打样和量产故障排查。',
          answer: '特种纸和粗糙纸烫金膜应优先确认纸张纹理、吸墨性、覆膜或光油类型、烫印面积和细线要求。粗糙表面通常需要离型稳定、胶层适配性强的热烫膜，量产前必须用真实纸张测试温度、压力、停留时间、附着力和大面积均匀度。',
          substrateRows: [
            { substrate: '粗糙纸 / 触感纸', foil: 'PK 咖啡底或易转移热烫膜', risk: '缺金、针孔、压痕、边缘不清', test: '胶带附着、放大检查、大面积均匀度' },
            { substrate: '哑膜 / 亮膜纸盒', foil: '按覆膜类型匹配胶层的金银膜', risk: '掉金、刮花、光泽不均', test: '耐刮、耐磨、附着力和折线测试' },
            { substrate: 'UV 光油纸', foil: '适配 UV 表面的包装烫金膜', risk: '附着不足、局部不转移', test: 'UV 固化状态、胶带测试、边缘清晰度' },
          ],
          issueRows: [
            { issue: '大面积金色发花', cause: '压力不均、纸面纹理深、温度窗口不匹配', action: '提高版面平整度，分段测试温度和压力，换用更适合粗面的膜' },
            { issue: '细线断线或糊边', cause: '离型过重/过轻、版温过高或压力过大', action: '用小面积线稿测试离型，降低温度或压力并检查版材' },
            { issue: '覆膜纸掉金', cause: '膜面滑移、表面能低或胶层不匹配', action: '确认覆膜类型，增加耐刮/附着测试，必要时更换专用型号' },
          ],
          sampleCta: '寄样时请附真实纸张、覆膜/光油信息、图案面积、最小线宽和量产测试标准。',
        }
      : {
          seoTitle: 'Hot Stamping Foil for Specialty Paper, Rough Paper, Gift Boxes and Wine Boxes',
          meta: 'Hot stamping foil selection for specialty paper, rough paper, tactile paper and laminated paper boxes, covering substrate fit, edge sharpness, large-area transfer, adhesion, sampling parameters and troubleshooting.',
          answer: 'For specialty and rough paper, choose hot stamping foil by paper texture, ink absorption, lamination or varnish type, stamping area, and fine-detail requirement. Rough surfaces usually need stable release and a stronger substrate-matched adhesive layer. Confirm temperature, pressure, dwell time, adhesion, and large-area uniformity on the real production paper before bulk orders.',
          substrateRows: [
            { substrate: 'Rough paper / tactile paper', foil: 'PK brown back or easy-release hot foil', risk: 'Missing foil, pinholes, pressure marks, unclear edges', test: 'Tape adhesion, magnified edge check, large-area uniformity' },
            { substrate: 'Matte / gloss laminated board', foil: 'Metallic foil matched to lamination film', risk: 'Peeling, scratching, uneven gloss', test: 'Scratch, rub, adhesion and folding tests' },
            { substrate: 'UV varnished paper', foil: 'Packaging foil for UV-varnished surfaces', risk: 'Poor adhesion, partial transfer', test: 'UV curing check, tape test, edge sharpness' },
          ],
          issueRows: [
            { issue: 'Mottled large-area gold', cause: 'Uneven pressure, deep paper texture, wrong temperature window', action: 'Improve die/bed leveling, test temperature and pressure step by step, switch to rough-paper foil if needed' },
            { issue: 'Broken fine lines or blurred edges', cause: 'Release is too tight/loose, die is too hot, or pressure is too high', action: 'Run fine-line tests, lower heat or pressure, and check die condition' },
            { issue: 'Foil peeling on laminated paper', cause: 'Low surface energy, slip additive, or adhesive mismatch', action: 'Confirm lamination film type, test scratch/adhesion, and select a matched foil grade' },
          ],
          sampleCta: 'When sending samples, include real paper, lamination or varnish details, artwork area, minimum line width, and mass-production test standard.',
        },
    gift_pkg: lang === 'cn'
      ? {
          seoTitle: '酒盒礼盒烫金膜解决方案｜大面积金银烫印和高端包装',
          meta: '酒盒、礼盒、精品盒彩盒烫金膜方案，说明大面积烫金、细线 Logo、覆膜纸、特种纸、压纹纸的选型、故障和打样测试。',
          answer: '酒盒和礼盒烫金膜要同时看视觉效果、底材、烫印面积和量产稳定性。大面积金银效果关注发花、掉金和光泽一致；细线 Logo 关注边缘清晰、断线和套准。建议先用真实纸盒材料做温度、压力、速度和耐磨测试。',
          substrateRows: [
            { substrate: '酒盒特种纸', foil: '高遮盖金银热烫膜 / PK 系列', risk: '大面积发花、纸纹导致缺金', test: '大面积实地、边缘清晰和附着测试' },
            { substrate: '礼盒覆膜纸', foil: '适配哑膜/亮膜胶层的包装膜', risk: '耐刮不足、运输摩擦掉金', test: '耐磨、耐刮、折线和胶带测试' },
            { substrate: '压纹纸 / 深纹纸', foil: '易转移、高填充热烫膜', risk: '凹纹处缺金、压痕明显', test: '纹理填充、压力印和外观一致性' },
          ],
          issueRows: [
            { issue: '酒盒大面积烫金发花', cause: '纸面不平、压力不均或胶层不适合大面积', action: '调整垫版和压力，降低速度，测试更适合大面积的型号' },
            { issue: '礼盒运输后掉金', cause: '表面耐磨不足或覆膜表面附着差', action: '增加耐磨/耐刮测试，确认覆膜类型并更换胶层' },
            { issue: 'Logo 边缘不清', cause: '温度过高、压力过大或版材精度不足', action: '降低温度压力，检查电雕版/铜版并测试细线稿' },
          ],
          sampleCta: '酒盒礼盒打样请提供纸张、覆膜、油墨、压纹信息，以及大面积实地图和细线 Logo 图。',
        }
      : {
          seoTitle: 'Hot Stamping Foil for Wine Boxes, Gift Boxes and Luxury Paper Packaging',
          meta: 'Foil stamping solution for wine boxes, gift boxes and luxury paper packaging, covering large-area metallic stamping, fine logos, laminated paper, specialty paper, embossed paper, sampling and defects.',
          answer: 'For wine boxes and gift boxes, choose foil by visual effect, substrate, stamping area, and production stability. Large metallic areas need uniform gloss, strong adhesion, and low mottling risk. Fine logos need sharp edges, clean release, and accurate registration. Test temperature, pressure, speed, rub resistance, and adhesion on the real box material.',
          substrateRows: [
            { substrate: 'Wine box specialty paper', foil: 'High-coverage metallic hot foil / PK series', risk: 'Mottling, missing transfer from paper texture', test: 'Large solid area, edge sharpness and adhesion' },
            { substrate: 'Laminated gift box board', foil: 'Packaging foil matched to matte/gloss film', risk: 'Scratches and abrasion during shipping', test: 'Rub, scratch, folding and tape tests' },
            { substrate: 'Embossed / deep-texture paper', foil: 'Easy-release, high-filling hot foil', risk: 'Missing foil in recesses, pressure marks', test: 'Texture filling, pressure mark and appearance consistency' },
          ],
          issueRows: [
            { issue: 'Mottled foil on large wine-box areas', cause: 'Uneven surface, pressure imbalance, or adhesive not suited to large solids', action: 'Adjust make-ready and pressure, reduce speed, and test a large-area foil grade' },
            { issue: 'Foil rubs off after shipping', cause: 'Low rub resistance or poor adhesion on laminated surface', action: 'Add rub/scratch tests, confirm film type, and select a matched adhesive layer' },
            { issue: 'Unclear logo edges', cause: 'Excess heat, excess pressure, or low die precision', action: 'Lower heat/pressure, check die quality, and test fine-line artwork' },
          ],
          sampleCta: 'For gift box sampling, send paper, lamination, ink, embossing details, large solid artwork and fine logo artwork.',
        },
    bottles: lang === 'cn'
      ? {
          seoTitle: '瓶盖和化妆品容器塑料烫金膜解决方案｜ABS、PP、PVC、PET',
          meta: '塑料瓶盖、化妆品瓶、ABS/PP/PVC/PET 塑料件烫金膜选型，覆盖耐酒精、百格附着、圆面滚烫、表面处理和掉字故障。',
          answer: '塑料瓶盖和化妆品容器烫金膜必须先确认塑料材质、表面能、注塑脱模剂、弧面形状和耐酒精要求。ABS、PP、PVC、PET 的附着逻辑不同，不能只按颜色选膜。批量前建议测试百格、耐酒精、耐磨、耐刮和热变形。',
          substrateRows: [
            { substrate: 'ABS / PS 化妆品件', foil: 'PC 塑胶专用烫金膜', risk: '掉字、酒精擦拭失败', test: '百格、耐酒精、耐磨和耐刮' },
            { substrate: 'PP / PE 瓶盖', foil: 'PC 膜 + 必要表面处理', risk: '表面能低、附着不牢', test: '电晕/火焰/底涂后附着测试' },
            { substrate: 'PVC / PET 部件', foil: '按树脂和耐性要求匹配型号', risk: '变形、边缘断裂、耐温不足', test: '温度窗口、耐温和转移完整度' },
          ],
          issueRows: [
            { issue: '塑料件烫后掉字', cause: '表面油污、脱模剂、表面能低或膜胶层不匹配', action: '清洁/预处理底材，测试 PC 系列并确认百格标准' },
            { issue: '耐酒精测试掉金', cause: '胶层耐化学性不足或固化/冷却不足', action: '增加酒精擦拭测试，调整工艺并换耐酒精型号' },
            { issue: '圆面图案变形', cause: '滚烫压力、夹具定位或图案展开不匹配', action: '确认夹具和滚轮硬度，按圆面展开重新打样' },
          ],
          sampleCta: '塑料件打样请提供树脂名称、表面处理、脱模/清洁方式、图案位置、曲率和耐性测试标准。',
        }
      : {
          seoTitle: 'Plastic Hot Stamping Foil for Bottle Caps, Cosmetic Containers, ABS, PP, PVC and PET',
          meta: 'Plastic hot stamping foil solution for bottle caps, cosmetic containers, ABS/PP/PVC/PET parts, covering alcohol resistance, cross-cut adhesion, roll-on stamping, surface treatment and peeling defects.',
          answer: 'For plastic bottle caps and cosmetic containers, confirm resin type, surface energy, mold-release contamination, curved shape, and alcohol-resistance requirement first. ABS, PP, PVC, and PET do not share the same adhesion behavior, so foil should not be selected by color alone. Test cross-cut adhesion, alcohol rub, abrasion, scratch resistance, and heat deformation before bulk orders.',
          substrateRows: [
            { substrate: 'ABS / PS cosmetic parts', foil: 'PC plastic hot stamping foil', risk: 'Logo peeling, alcohol-rub failure', test: 'Cross-cut, alcohol, rub and scratch tests' },
            { substrate: 'PP / PE caps', foil: 'PC foil plus surface treatment if needed', risk: 'Low surface energy and poor adhesion', test: 'Adhesion after corona, flame, or primer treatment' },
            { substrate: 'PVC / PET components', foil: 'Grade matched to resin and durability requirement', risk: 'Deformation, edge cracking, low heat tolerance', test: 'Temperature window, heat resistance and transfer completeness' },
          ],
          issueRows: [
            { issue: 'Foil letters peel from plastic', cause: 'Oil, mold release, low surface energy, or wrong adhesive layer', action: 'Clean or pretreat the part, test PC series, and confirm cross-cut standard' },
            { issue: 'Alcohol test removes foil', cause: 'Insufficient chemical resistance or process cooling/curing issue', action: 'Add alcohol wipe tests, adjust parameters, and use an alcohol-resistant grade' },
            { issue: 'Artwork distorts on round parts', cause: 'Roll-on pressure, fixture position, or artwork development mismatch', action: 'Confirm fixture and roller hardness, then resample with round-surface artwork' },
          ],
          sampleCta: 'For plastic sampling, send resin name, surface treatment, mold-release/cleaning method, artwork position, curvature and durability standard.',
        },
    plastic_surface: lang === 'cn'
      ? {
          seoTitle: '塑料表面烫金膜解决方案｜PP、PVC、PET、ABS 塑胶件热烫',
          meta: '塑料表面烫金膜选型和故障排查，覆盖 PP、PVC、PET、ABS、亚克力、耐酒精、耐刮、表面处理和样品测试。',
          answer: '塑料表面烫金应把底材树脂、表面处理、耐性测试和设备类型放在颜色之前确认。PP、PE 低表面能风险高，ABS 和 PS 相对容易但仍需测试耐酒精和耐刮。最终参数必须通过真实部件打样确认。',
          substrateRows: [
            { substrate: 'ABS / PS / 亚克力', foil: 'PC 塑胶热烫膜', risk: '耐酒精和刮擦不达标', test: '百格、酒精擦拭、耐刮、耐磨' },
            { substrate: 'PP / PE', foil: 'PC 膜 + 表面处理', risk: '附着弱、边缘翘起', test: '表面能、底涂/火焰/电晕后附着' },
            { substrate: 'PVC / PET', foil: '按耐温和柔韧性匹配', risk: '热变形、开裂或转移不全', test: '温度窗口、转移完整度、弯折测试' },
          ],
          issueRows: [
            { issue: '烫印不上或转移不全', cause: '温度不足、压力不足或塑料表面能低', action: '做温度阶梯测试，增加压力并确认表面处理' },
            { issue: '边缘翘起', cause: '胶层不匹配或冷却后收缩', action: '测试更强附着型号并延长冷却稳定时间' },
            { issue: '表面烫伤或变形', cause: '温度过高、停留时间太长或塑料耐热低', action: '降低温度和停留时间，改用更适合低温转移的型号' },
          ],
          sampleCta: '请提供塑料材质、表面处理、部件照片、图案文件、机器类型和耐性验收标准。',
        }
      : {
          seoTitle: 'Hot Stamping Foil for Plastic Surfaces: PP, PVC, PET, ABS and Acrylic Parts',
          meta: 'Plastic surface hot stamping foil selection and troubleshooting for PP, PVC, PET, ABS and acrylic parts, covering alcohol resistance, scratch resistance, surface treatment and sampling.',
          answer: 'For plastic surface stamping, confirm resin type, surface treatment, durability tests, and machine type before color. PP and PE carry higher low-surface-energy risk. ABS and PS are usually easier, but alcohol and scratch resistance still need testing. Final parameters must be confirmed on real molded parts.',
          substrateRows: [
            { substrate: 'ABS / PS / acrylic', foil: 'PC plastic hot stamping foil', risk: 'Alcohol and scratch resistance failure', test: 'Cross-cut, alcohol wipe, scratch and rub tests' },
            { substrate: 'PP / PE', foil: 'PC foil plus surface treatment', risk: 'Weak adhesion and edge lifting', test: 'Surface energy and adhesion after primer/flame/corona treatment' },
            { substrate: 'PVC / PET', foil: 'Grade matched to heat and flexibility', risk: 'Heat deformation, cracking or incomplete transfer', test: 'Temperature window, transfer completeness and bending test' },
          ],
          issueRows: [
            { issue: 'Incomplete transfer on plastic', cause: 'Low temperature, low pressure, or low surface energy', action: 'Run a temperature ladder, increase pressure, and confirm surface treatment' },
            { issue: 'Edge lifting', cause: 'Adhesive mismatch or shrinkage after cooling', action: 'Test a stronger adhesion grade and allow stable cooling time' },
            { issue: 'Surface burns or deforms', cause: 'Excess heat, long dwell time, or low heat tolerance', action: 'Lower heat and dwell time or choose a lower-temperature transfer grade' },
          ],
          sampleCta: 'Send plastic material, surface treatment, part photos, artwork file, machine type, and durability acceptance standard.',
        },
  };
  const profile = solutionProfiles[solution.id] || {
    seoTitle: `${solution.title} Hot Stamping Foil Application Solution`,
    meta: solution.description,
    answer: solution.description,
    substrateRows: [
      { substrate: lang === 'cn' ? '真实量产底材' : 'Real production substrate', foil: series.title, risk: lang === 'cn' ? '底材、油墨或表面处理变化会影响附着和转移' : 'Substrate, ink, or surface treatment changes affect adhesion and transfer', test: lang === 'cn' ? '附着、耐磨、耐刮和转移完整度' : 'Adhesion, rub, scratch, and transfer completeness' },
    ],
    issueRows: [
      { issue: lang === 'cn' ? '量产结果与打样不同' : 'Bulk result differs from sample', cause: lang === 'cn' ? '底材批次、设备参数或环境变化' : 'Substrate batch, machine setting, or environment change', action: lang === 'cn' ? '记录参数并用量产底材复测' : 'Record settings and retest with production substrate' },
    ],
    sampleCta: lang === 'cn' ? '请提供真实底材、图案、机器和测试要求。' : 'Send real substrate, artwork, machine, and test requirements.',
  };
  const solutionKeywords = [
    solution.title,
    `${solution.title} hot stamping foil`,
    'hot stamping foil solution',
    'packaging foil supplier',
    'PINTE',
    'Dongguan China',
    ...solution.features,
  ];
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: solution.title,
    description: profile.meta,
    image: solution.img,
    serviceType: 'Hot stamping foil application solution',
    provider: {
      '@type': 'Organization',
      name: 'PINTE 品特',
      url: 'https://www.pintecl.com',
      logo: 'https://www.pintecl.com/logo.svg',
    },
    areaServed: [
      'China',
      'Vietnam',
      'Thailand',
      'Malaysia',
      'Indonesia',
      'Singapore',
      'Europe',
      'North America',
    ],
    url: `https://www.pintecl.com${canonicalUrl}`,
  };

  return (
    <>
    <SEOMeta
      title={`${profile.seoTitle} | PINTE`}
      description={profile.meta.slice(0, 160)}
      keywords={solutionKeywords}
      image={solution.img}
      url={canonicalUrl}
      locale={lang === 'cn' ? 'zh_CN' : 'en_US'}
      canonicalUrl={canonicalUrl}
    />
    <script type="application/ld+json">
      {JSON.stringify(serviceSchema)}
    </script>
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900 animate-in fade-in duration-500">
       <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-100">
         <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
            <button 
             onClick={() => navigate('/')}
             className="flex items-center gap-2 text-neutral-600 hover:text-pinte-blue font-medium transition-colors"
            >
              <ArrowLeft size={20} />
              <span>{ui.solutions.backButton}</span>
            </button>
            <div className="flex items-center gap-2">
                <PinteLogo originalColors className="h-8 w-auto" />
                <span className="font-bold">{solution.title}</span>
            </div>
            <div className="w-20"></div> 
         </div>
       </div>

       <div className="max-w-[1400px] mx-auto px-6 py-12">
           <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
               <div className="lg:w-1/3 shrink-0">
                   <div className="sticky top-28 space-y-8">
                       <div>
                           <p className="text-pinte-blue text-sm font-bold tracking-widest uppercase mb-2">Core Technology</p>
                           <h1 className="text-4xl font-display font-bold text-blue-600 leading-tight">
                               {series.title}
                           </h1>
                       </div>
                       <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm">
                           <ul className="space-y-6">
                               {series.features.map((feature, idx) => (
                                   <li key={idx} className="flex items-center gap-4 group">
                                       <div className="w-6 h-6 rounded-full border-2 border-neutral-200 flex items-center justify-center text-transparent group-hover:border-pinte-blue group-hover:bg-pinte-blue group-hover:text-white transition-all">
                                           <CheckCircle2 size={14} />
                                       </div>
                                       <span className="font-medium text-lg text-neutral-700 group-hover:text-neutral-900 transition-colors">
                                           {feature}
                                       </span>
                                   </li>
                               ))}
                           </ul>
                       </div>
                       <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm relative overflow-hidden group">
                           <p className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
                               <Layers size={18} className="text-pinte-blue"/>
                               <span>Standard Roll产品图样</span>
                           </p>
                           <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                               <img src={series.rollImg} alt="Foil Roll" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
                           </div>
                           <div className="mt-4 text-sm text-neutral-500">
                               <p>60+ Colors Available<br/>超100+色卡可供选择</p>
                               <p className="text-xs opacity-70 mt-1">100% Imported Material, 100% Self-developed Formula<br/>100% 进口原材料，100% 自研配方</p>
                           </div>
                       </div>
                   </div>
               </div>

               <div className="lg:w-2/3">
                    <div className="space-y-12">
                        <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-neutral-200 group">
                            <img src={solution.img} alt={solution.title} className="w-full h-[500px] lg:h-[700px] object-cover"/>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>
                            <div className="absolute bottom-0 left-0 p-8 md:p-12 text-white">
                                <h2 className="text-3xl md:text-5xl font-display font-bold mb-4 leading-tight">{solution.title}</h2>
                                <p className="text-white/80 text-lg max-w-xl leading-relaxed">
                                    {solution.description}
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-8 rounded-3xl border border-neutral-100">
                                <h3 className="font-bold text-xl mb-4">{ui.solutions.appAdvantage}</h3>
                                <p className="text-neutral-600 leading-relaxed mb-4">
                                    Using PINTE exclusive coating technology, we improve efficiency and reduce defect rates significantly. Perfect for both large solid areas and fine lines.<br/>使用PINTE 28+年沉淀下来的涂布技术，我们显著提高效率并降低缺陷率。非常适合大面积实心区域和细线条，以及部分特殊定制的产品。
                                </p>
                                {solution.features && (
                                    <ul className="space-y-2">
                                        {solution.features.map((f, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-neutral-600 font-medium">
                                                <CheckCircle2 size={16} className="text-pinte-blue"/> {f}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div className="bg-pinte-blue text-white p-8 rounded-3xl flex flex-col justify-center items-center text-center">
                                <h3 className="font-bold text-xl mb-2">{ui.solutions.getDatasheet}</h3>
                                <p className="text-white/80 text-sm mb-6">Download the technical datasheet.</p>
                                <a 
                                  href="https://s3plus.meituan.net/opapisdk/op_ticket_1_5677168484_1766806720196_qdqqd_1guxxu.pdf"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-white text-pinte-blue px-6 py-2.5 rounded-full font-bold hover:bg-neutral-100 transition-colors inline-block"
                                >
                                    {ui.solutions.downloadPdf}
                                </a>
                            </div>
                        </div>
                        <section className="bg-white p-8 rounded-3xl border border-neutral-100">
                            <p className="text-sm font-bold tracking-widest uppercase text-pinte-blue mb-3">
                                {lang === 'cn' ? '采购选型建议' : 'Buyer Selection Answer'}
                            </p>
                            <h2 className="text-2xl md:text-3xl font-display font-bold text-neutral-950 mb-4">
                                {lang === 'cn' ? `${solution.title} 怎么选膜` : `How to Choose Foil for ${solution.title}`}
                            </h2>
                            <p className="text-neutral-700 leading-relaxed text-lg">
                                {profile.answer}
                            </p>
                        </section>

                        <section className="bg-white p-8 rounded-3xl border border-neutral-100">
                            <h2 className="text-2xl font-bold text-neutral-950 mb-5">
                                {lang === 'cn' ? '底材适配与测试重点' : 'Substrate Fit and Testing Focus'}
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-[760px] w-full text-sm text-left">
                                    <thead>
                                        <tr className="border-b border-neutral-200 text-neutral-500">
                                            <th className="py-3 pr-4">{lang === 'cn' ? '底材' : 'Substrate'}</th>
                                            <th className="py-3 pr-4">{lang === 'cn' ? '建议膜型' : 'Recommended Foil'}</th>
                                            <th className="py-3 pr-4">{lang === 'cn' ? '主要风险' : 'Main Risk'}</th>
                                            <th className="py-3">{lang === 'cn' ? '测试重点' : 'Testing Focus'}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {profile.substrateRows.map((row) => (
                                            <tr key={`${row.substrate}-${row.foil}`} className="border-b border-neutral-100 align-top">
                                                <td className="py-4 pr-4 font-semibold text-neutral-900">{row.substrate}</td>
                                                <td className="py-4 pr-4 text-neutral-700">{row.foil}</td>
                                                <td className="py-4 pr-4 text-neutral-600">{row.risk}</td>
                                                <td className="py-4 text-neutral-700">{row.test}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className="bg-white p-8 rounded-3xl border border-neutral-100">
                            <h2 className="text-2xl font-bold text-neutral-950 mb-5">
                                {lang === 'cn' ? '常见失败原因和处理方向' : 'Common Failure Causes and Fix Direction'}
                            </h2>
                            <div className="grid gap-4">
                                {profile.issueRows.map((row) => (
                                    <div key={row.issue} className="rounded-2xl bg-neutral-50 p-5">
                                        <h3 className="font-bold text-neutral-950 mb-2">{row.issue}</h3>
                                        <p className="text-sm text-neutral-600 leading-relaxed">
                                            <strong>{lang === 'cn' ? '可能原因：' : 'Likely cause: '}</strong>{row.cause}
                                        </p>
                                        <p className="text-sm text-neutral-700 leading-relaxed mt-2">
                                            <strong>{lang === 'cn' ? '处理方向：' : 'Fix direction: '}</strong>{row.action}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="bg-pinte-blue text-white p-8 rounded-3xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div>
                                <h2 className="text-2xl font-bold mb-3">{lang === 'cn' ? '打样前请提供这些资料' : 'Send These Details Before Sampling'}</h2>
                                <p className="text-white/85 leading-relaxed max-w-2xl">{profile.sampleCta}</p>
                            </div>
                            <button
                              onClick={() => navigate(`/${lang}/quote`)}
                              className="shrink-0 rounded-full bg-white px-6 py-3 font-bold text-pinte-blue hover:bg-neutral-100 transition-colors"
                            >
                                {lang === 'cn' ? '提交样品需求' : 'Request Sample Support'}
                            </button>
                        </section>
                    </div>
               </div>
           </div>
       </div>
    </div>
    </>
  );
};

export default SolutionDetail;
