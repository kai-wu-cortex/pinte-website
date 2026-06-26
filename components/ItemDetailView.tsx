
import React, { useState } from 'react';
import { CatalogItem, UILabels } from '../types';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Layers, 
  Thermometer, 
  Zap, 
  Droplet, 
  Box, 
  Star, 
  ShieldCheck,
  Cpu,
  FileText,
  ImageIcon
} from 'lucide-react';
import QuoteRequest from './QuoteRequest';

interface ItemDetailViewProps {
  item: CatalogItem;
  onBack: () => void;
  ui?: UILabels;
}

const ItemDetailView: React.FC<ItemDetailViewProps> = ({ item, onBack, ui }) => {
  const [showQuote, setShowQuote] = useState(false);
  const [activeTab, setActiveTab] = useState<'specs' | 'apps'>('specs');

  const t = ui?.products || {
      backToList: "Back",
      getSample: "Get Quote",
      techSpecs: "Tech Specs",
      tempRec: "Temperature",
      flat: "Flat",
      round: "Rotary",
      applications: "Applications",
      tabs: { specs: "Specs", apps: "Apps" }
  };
  const isCn = t.techSpecs.includes('规格') || t.applications.includes('应用');
  const labels = {
    substrates: isCn ? '适用底材' : 'Compatible Substrates',
    colors: isCn ? '颜色与效果' : 'Colors and Effects',
    processes: isCn ? '适用工艺' : 'Supported Processes',
    qualityTests: isCn ? '质量测试' : 'Quality Tests',
    commercial: isCn ? '起订量与样品政策' : 'MOQ and Sample Policy',
    technicalParams: isCn ? '工艺参数说明' : 'Technical Parameters',
    faq: 'FAQ',
    note: isCn
      ? '参数为建议起始范围，实际温度、压力、速度需结合底材、设备和图案打样确认。'
      : 'Parameters are recommended starting ranges. Actual temperature, pressure, and speed must be confirmed by sampling with the real substrate, machine, and artwork.',
  };

  const renderChips = (items?: string[]) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((value) => (
          <span key={value} className="rounded-full bg-white border border-neutral-200 px-3 py-1.5 text-sm font-semibold text-neutral-700">
            {value}
          </span>
        ))}
      </div>
    );
  };

  if (showQuote) {
      return <QuoteRequest onBack={() => setShowQuote(false)} ui={ui?.quote} />;
  }

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900 animate-in fade-in slide-in-from-bottom-8 duration-500">
      
      {/* Navigation Header */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-[1200px] mx-auto px-6 h-20 flex items-center justify-between">
           <button 
            onClick={onBack}
            className="flex items-center gap-2 text-neutral-600 hover:text-pinte-blue font-medium transition-colors"
            >
             <ArrowLeft size={20} />
             <span>{t.backToList}</span>
           </button>
           <span className="font-bold text-neutral-400 text-sm uppercase tracking-widest hidden md:block">
             Product Detail
           </span>
           <button 
             onClick={() => setShowQuote(true)}
             className="bg-pinte-blue text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-pinte-blue/20 hover:bg-pinte-dark transition-colors"
           >
             {ui?.nav.getQuote || "Get Quote"}
           </button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-12">
        
        {/* Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 items-center">
            {/* Image */}
            <div className="relative aspect-square lg:aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-neutral-200 group">
                <img
                    src={item.image}
                    alt={item.imageAlt || item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="eager"
                    width={800}
                    height={800}
                />
                {item.tags && item.tags.length > 0 && (
                    <div className="absolute top-6 left-6 flex gap-2">
                        {item.tags.map(tag => (
                            <span key={tag} className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-pinte-blue shadow-sm">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Content */}
            <div>
                <p className="text-sm font-bold text-neutral-400 tracking-widest uppercase mb-2">Product Detail</p>
                <h1 className="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-4 leading-tight">
                    {item.name}
                </h1>
                <p className="text-xl text-neutral-500 font-medium mb-8">
                    {item.subtitle || "High Performance Foil Series"}
                </p>
                <div className="prose prose-neutral text-neutral-600 leading-relaxed mb-8">
                    {item.description}
                    {item.content && <p className="mt-4">{item.content}</p>}
                </div>

                {/* Quick Features Grid */}
                {item.features && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        {item.features.slice(0, 4).map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-blue-50 text-pinte-blue shrink-0">
                                    <CheckCircle2 size={18} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">{feature.title}</h4>
                                    <p className="text-xs text-neutral-500">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Tabbed Detail Section */}
        <div className="mb-12">
            <div className="flex justify-center mb-10">
                <div className="bg-neutral-100 p-1.5 rounded-full flex gap-2">
                    <button 
                        onClick={() => setActiveTab('specs')}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'specs' ? 'bg-white text-pinte-blue shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
                    >
                         {t.techSpecs} ({t.tabs.specs})
                    </button>
                    <button 
                        onClick={() => setActiveTab('apps')}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'apps' ? 'bg-white text-pinte-blue shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
                    >
                         {t.applications} ({t.tabs.apps})
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[3rem] border border-neutral-100 shadow-xl shadow-neutral-100/50 p-8 md:p-12">
                {activeTab === 'specs' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* Params Table */}
                            <div>
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Layers className="text-pinte-blue"/> {t.techSpecs}
                                </h3>
                                <div className="space-y-0 divider-y divide-neutral-100">
                                    {item.params?.map((param, i) => (
                                        <div key={i} className="flex justify-between py-4 border-b border-neutral-100 last:border-0">
                                            <span className="text-neutral-500 font-medium">{param.label}</span>
                                            <span className="font-bold text-neutral-900">{param.value}</span>
                                        </div>
                                    ))}
                                    {/* Default param if none */}
                                    {(!item.params || item.params.length === 0) && (
                                        <p className="text-neutral-400 italic">No detailed parameters.</p>
                                    )}
                                </div>
                            </div>

                            {/* Temperature or Extra Info */}
                            <div className="bg-neutral-50 rounded-3xl p-8">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Thermometer className="text-pinte-blue"/> {t.tempRec}
                                </h3>
                                {item.temp ? (
                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex justify-between mb-2 text-sm font-bold text-neutral-700">
                                                <span>{t.flat}</span>
                                                <span>{item.temp.flat}</span>
                                            </div>
                                            <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
                                                <div className="bg-pinte-blue h-full w-3/4"></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between mb-2 text-sm font-bold text-neutral-700">
                                                <span>{t.round}</span>
                                                <span>{item.temp.round}</span>
                                            </div>
                                            <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
                                                <div className="bg-pinte-blue h-full w-4/5"></div>
                                            </div>
                                        </div>
                                        <p className="text-xs text-neutral-400 mt-4 leading-relaxed">
                                            * {labels.note}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-neutral-500">Contact sales for Technical Datasheet (TDS).</p>
                                )}
                            </div>
                        </div>

                        {(item.compatibleSubstrates?.length || item.colors?.length || item.processes?.length || item.qualityTests?.length) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
                            {item.compatibleSubstrates?.length ? (
                              <div className="rounded-3xl bg-neutral-50 p-6">
                                <h3 className="font-bold mb-4 flex items-center gap-2"><Box size={18} className="text-pinte-blue" />{labels.substrates}</h3>
                                {renderChips(item.compatibleSubstrates)}
                              </div>
                            ) : null}
                            {item.colors?.length ? (
                              <div className="rounded-3xl bg-neutral-50 p-6">
                                <h3 className="font-bold mb-4 flex items-center gap-2"><Droplet size={18} className="text-pinte-blue" />{labels.colors}</h3>
                                {renderChips(item.colors)}
                              </div>
                            ) : null}
                            {item.processes?.length ? (
                              <div className="rounded-3xl bg-neutral-50 p-6">
                                <h3 className="font-bold mb-4 flex items-center gap-2"><Zap size={18} className="text-pinte-blue" />{labels.processes}</h3>
                                {renderChips(item.processes)}
                              </div>
                            ) : null}
                            {item.qualityTests?.length ? (
                              <div className="rounded-3xl bg-neutral-50 p-6">
                                <h3 className="font-bold mb-4 flex items-center gap-2"><ShieldCheck size={18} className="text-pinte-blue" />{labels.qualityTests}</h3>
                                {renderChips(item.qualityTests)}
                              </div>
                            ) : null}
                          </div>
                        )}

                        {(item.specifications?.length || item.technicalParameters?.length || item.moq || item.samplePolicy || item.customizationLeadTime) && (
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                            {item.specifications?.length ? (
                              <div className="rounded-3xl border border-neutral-100 p-6">
                                <h3 className="font-bold mb-4 flex items-center gap-2"><FileText size={18} className="text-pinte-blue" />{t.techSpecs}</h3>
                                <div className="space-y-3">
                                  {item.specifications.map((param) => (
                                    <div key={param.label}>
                                      <p className="text-sm font-bold text-neutral-900">{param.label}</p>
                                      <p className="text-sm text-neutral-600">{param.value}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null}
                            {item.technicalParameters?.length ? (
                              <div className="rounded-3xl border border-neutral-100 p-6">
                                <h3 className="font-bold mb-4 flex items-center gap-2"><Cpu size={18} className="text-pinte-blue" />{labels.technicalParams}</h3>
                                <div className="space-y-3">
                                  {item.technicalParameters.map((param) => (
                                    <div key={param.label}>
                                      <p className="text-sm font-bold text-neutral-900">{param.label}</p>
                                      <p className="text-sm text-neutral-600">{param.value}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null}
                            {(item.moq || item.samplePolicy || item.customizationLeadTime) ? (
                              <div className="rounded-3xl border border-neutral-100 p-6">
                                <h3 className="font-bold mb-4 flex items-center gap-2"><Star size={18} className="text-pinte-blue" />{labels.commercial}</h3>
                                <div className="space-y-3 text-sm text-neutral-600">
                                  {item.moq && <p><strong className="text-neutral-900">MOQ:</strong> {item.moq}</p>}
                                  {item.samplePolicy && <p><strong className="text-neutral-900">{isCn ? '样品' : 'Sample'}:</strong> {item.samplePolicy}</p>}
                                  {item.customizationLeadTime && <p><strong className="text-neutral-900">{isCn ? '定制' : 'Customization'}:</strong> {item.customizationLeadTime}</p>}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        )}
                    </div>
                )}

                {activeTab === 'apps' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <h3 className="text-xl font-bold mb-8 text-center">{t.applications}</h3>
                        <div className="flex flex-wrap justify-center gap-4">
                            {item.applications?.map((app, i) => (
                                <div key={i} className="bg-white border border-neutral-200 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-sm hover:border-pinte-blue hover:text-pinte-blue transition-colors cursor-default">
                                    <CheckCircle2 size={20} className="text-green-500" />
                                    <span className="font-bold">{app}</span>
                                </div>
                            ))}
                            {(!item.applications || item.applications.length === 0) && (
                                <p className="text-neutral-400 italic">Suitable for general packaging.</p>
                            )}
                        </div>
                        {item.faqs?.length ? (
                          <div className="mt-10 max-w-4xl mx-auto">
                            <h3 className="text-xl font-bold mb-5 text-center">{labels.faq}</h3>
                            <div className="space-y-3">
                              {item.faqs.map((faq) => (
                                <details key={faq.question} className="rounded-2xl bg-neutral-50 p-5">
                                  <summary className="cursor-pointer list-none font-bold text-neutral-950">{faq.question}</summary>
                                  <p className="mt-3 text-neutral-600 leading-relaxed">{faq.answer}</p>
                                </details>
                              ))}
                            </div>
                          </div>
                        ) : null}
                    </div>
                )}
            </div>
        </div>

        {/* LONG IMAGE / DETAIL SECTION */}
        {item.detailImage && (
            <div className="w-full rounded-[2.5rem] overflow-hidden shadow-lg shadow-blue-50 border border-neutral-100 mt-12 animate-in fade-in slide-in-from-bottom-4">
                <img
                    src={item.detailImage}
                    alt={`${item.name} Technical Details`}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                    width={1200}
                    height={800}
                />
            </div>
        )}

      </div>
    </div>
  );
};

export default ItemDetailView;
