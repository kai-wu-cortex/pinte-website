
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
                    alt={item.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
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
                                            * Note: Actual temperature may vary by machine speed, pressure, and substrate. Testing recommended before mass production.
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-neutral-500">Contact sales for Technical Datasheet (TDS).</p>
                                )}
                            </div>
                        </div>
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
                />
            </div>
        )}

      </div>
    </div>
  );
};

export default ItemDetailView;
