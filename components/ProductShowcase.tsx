
import React, { useState, useMemo, Suspense } from 'react';
import {
  ArrowRight,
  Search,
  ArrowLeft,
  Filter,
  LayoutGrid,
  List,
  ChevronDown,
  Box,
  Sparkles
} from 'lucide-react';
import { PinteLogo } from './PinteLogo';
import { ProductId, ProductDetail, CatalogItem, UILabels, FoilItem } from '../types';
import { FOIL_CATALOG } from '../data/foil_data'; // Import new data

// Lazy load heavy 3D component
const Foil3DViewer = React.lazy(() => import('./Foil3DViewer'));

interface ProductShowcaseProps {
  onBack: () => void;
  products: Record<ProductId, ProductDetail>;
  catalog: Record<ProductId, CatalogItem[]>;
  onItemClick: (id: string) => void;
  ui?: UILabels['products'];
  defaultViewMode?: 'categories' | 'range';
}

// Fallback UI
const defaultUI = {
    discoverTitle: "Product Catalog",
    discoverDesc: "",
    viewCatalog: "",
    series: "SERIES",
    viewDetails: "View Details",
    backToList: "Back",
    getSample: "Sample",
    techSpecs: "",
    tempRec: "",
    substrates: "",
    applications: "Applications",
    needHelp: "",
    contactEng: "",
    tabs: { overview: "Overview", specs: "Specs", apps: "Apps" },
    flat: "",
    round: "",
    viewFoilRange: "View All Foil Colors",
    searchPlaceholder: "Search foils..."
};

const ProductShowcase: React.FC<ProductShowcaseProps> = ({ onBack, products, catalog, onItemClick, ui = defaultUI, defaultViewMode = 'categories' }) => {
  const [viewMode, setViewMode] = useState<'categories' | 'range'>(defaultViewMode);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Range View States
  const [selectedSeries, setSelectedSeries] = useState<string>('All');
  const [selectedFinish, setSelectedFinish] = useState<string>('All');
  
  // 3D Viewer State
  const [is3DOpen, setIs3DOpen] = useState(false);
  const [selectedFoil, setSelectedFoil] = useState<FoilItem>(FOIL_CATALOG[0]);

  // Filter Logic for Range View
  const filteredFoils = useMemo(() => {
    return FOIL_CATALOG.filter(foil => {
      const matchSeries = selectedSeries === 'All' || foil.series === selectedSeries;
      const matchFinish = selectedFinish === 'All' || foil.finish === selectedFinish;
      const matchSearch = foil.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          foil.code.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSeries && matchFinish && matchSearch;
    });
  }, [selectedSeries, selectedFinish, searchQuery]);

  // Unique Options for Filters
  const seriesOptions = ['All', ...Array.from(new Set(FOIL_CATALOG.map(f => f.series)))];
  const finishOptions = ['All', ...Array.from(new Set(FOIL_CATALOG.map(f => f.finish)))];

  const handleFoilClick = (foil: FoilItem) => {
      setSelectedFoil(foil);
      setIs3DOpen(true);
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans animate-in fade-in duration-500">
       
       {/* 3D Viewer Overlay */}
       <Foil3DViewer 
          isOpen={is3DOpen} 
          onClose={() => setIs3DOpen(false)}
          initialFoil={selectedFoil}
          allFoils={FOIL_CATALOG}
       />

       {/* Sticky Header */}
       <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-100 transition-all">
         <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
            <button 
             onClick={viewMode === 'range' ? () => setViewMode('categories') : onBack}
             className="flex items-center gap-2 text-neutral-500 hover:text-pinte-blue font-medium transition-colors"
            >
              <ArrowLeft size={20} />
              <span>{viewMode === 'range' ? ui.backToList : 'Back to Home'}</span>
            </button>
            
            <div className="flex items-center gap-2">
                <PinteLogo originalColors className="h-6 w-auto" />
                <span className="font-display font-bold text-lg tracking-tight">
                    {viewMode === 'range' ? 'FOIL RANGE' : 'PINTE CATALOG'}
                </span>
            </div>

            <div className="flex items-center gap-4">
                {viewMode === 'range' ? (
                    <div className="relative group">
                        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-pinte-blue transition-colors"/>
                        <input 
                           type="text" 
                           placeholder={ui.searchPlaceholder || "Search..."}
                           className="bg-neutral-100 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pinte-blue/20 transition-all w-32 focus:w-64"
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                ) : (
                    <button 
                        onClick={() => setViewMode('range')}
                        className="bg-neutral-900 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-pinte-blue transition-colors flex items-center gap-2"
                    >
                        <LayoutGrid size={16} />
                        {ui.viewFoilRange || "View All Colors"}
                    </button>
                )}
            </div>
         </div>
         
         {/* Filters Bar (Only in Range Mode) */}
         {viewMode === 'range' && (
             <div className="border-t border-neutral-100 bg-white/50 backdrop-blur-sm animate-in slide-in-from-top-2">
                 <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center gap-6 overflow-x-auto no-scrollbar">
                     <Filter size={16} className="text-neutral-400" />
                     
                     <div className="flex items-center gap-2">
                         <span className="text-xs font-bold text-neutral-500 uppercase">Series:</span>
                         {seriesOptions.map(opt => (
                             <button
                                key={opt}
                                onClick={() => setSelectedSeries(opt)}
                                className={`text-sm px-3 py-1 rounded-full transition-colors ${selectedSeries === opt ? 'bg-pinte-blue text-white' : 'hover:bg-neutral-100 text-neutral-600'}`}
                             >
                                 {opt}
                             </button>
                         ))}
                     </div>

                     <div className="w-px h-6 bg-neutral-200"></div>

                     <div className="flex items-center gap-2">
                         <span className="text-xs font-bold text-neutral-500 uppercase">Finish:</span>
                         {finishOptions.map(opt => (
                             <button
                                key={opt}
                                onClick={() => setSelectedFinish(opt)}
                                className={`text-sm px-3 py-1 rounded-full transition-colors ${selectedFinish === opt ? 'bg-pinte-blue text-white' : 'hover:bg-neutral-100 text-neutral-600'}`}
                             >
                                 {opt}
                             </button>
                         ))}
                     </div>
                 </div>
             </div>
         )}
       </div>

       {/* === MODE 1: CATEGORY LIST (Original) === */}
       {viewMode === 'categories' && (
           <div className="max-w-[1400px] mx-auto px-6 py-20 space-y-32">
              <div className="text-center mb-16">
                 <h1 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter text-neutral-900 mb-6">
                    {ui.discoverTitle.replace(/<br\/>/g, ' ')}
                 </h1>
                 <button 
                    onClick={() => setViewMode('range')}
                    className="inline-flex items-center gap-2 border-b-2 border-neutral-900 pb-1 text-lg font-bold hover:text-pinte-blue hover:border-pinte-blue transition-colors"
                 >
                    {ui.viewFoilRange || "View All Product Colors"} <ArrowRight size={20} />
                 </button>
              </div>

              {(Object.values(products) as ProductDetail[]).map((product) => {
                const items = catalog[product.id] || [];
                return (
                  <div key={product.id} className="flex flex-col lg:flex-row gap-12 xl:gap-24 group/section relative">
                     {/* Left Sidebar - Sticky */}
                     <div className="lg:w-1/4 shrink-0 flex flex-col justify-start items-start gap-8 lg:sticky lg:top-32 h-fit">
                        <div className="space-y-6">
                          <h2 className="text-3xl font-bold font-display leading-tight text-neutral-900">
                              {product.name}
                          </h2>
                          <p className="text-neutral-500 leading-relaxed text-sm max-w-xs">
                              {product.description}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {product.substrates.slice(0, 5).map((sub, i) => (
                                <span key={i} className="px-3 py-1.5 rounded-md bg-neutral-100 text-neutral-500 text-xs font-medium uppercase tracking-wide">
                                    {sub}
                                </span>
                            ))}
                        </div>
                     </div>
                     
                     {/* Right Grid - Enhanced Cards */}
                     <div className="lg:w-3/4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {items.length > 0 ? (
                          items.map((item) => (
                            <div 
                                key={item.id} 
                                className="bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:shadow-2xl hover:shadow-neutral-200/50 transition-all duration-300 group/card flex flex-col h-full cursor-pointer hover:-translate-y-1"
                                onClick={() => onItemClick(item.id)}
                            >
                                {/* Image Section */}
                                <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover mix-blend-multiply group-hover/card:scale-105 transition-transform duration-700"
                                        loading="lazy"
                                        width={400}
                                        height={300}
                                    />
                                    {item.tags && item.tags.length > 0 && (
                                      <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5 backdrop-blur-sm z-10">
                                          <Sparkles size={10} className="text-yellow-200" />
                                          {item.tags[0]}
                                      </div>
                                    )}
                                </div>

                                {/* Body Section */}
                                <div className="p-6 flex flex-col flex-1">
                                    
                                    {/* Title & Subtitle */}
                                    <div className="mb-4">
                                        <h3 className="font-bold text-xl text-neutral-900 leading-tight mb-1 group-hover/card:text-pinte-blue transition-colors">
                                            {item.name}
                                        </h3>
                                        <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider truncate">
                                            {item.subtitle}
                                        </p>
                                    </div>

                                    {/* Applications Highlight */}
                                    {item.applications && item.applications.length > 0 && (
                                        <div className="mb-5 bg-neutral-50 rounded-xl p-3 border border-neutral-100">
                                             <p className="text-[10px] font-bold text-pinte-blue uppercase tracking-widest mb-2 flex items-center gap-1">
                                                {ui.applications}
                                             </p>
                                             <div className="flex flex-wrap gap-1.5">
                                                 {item.applications.slice(0, 3).map((app, i) => (
                                                     <span key={i} className="px-2 py-1 rounded-md bg-white border border-neutral-100 text-neutral-600 text-[10px] font-bold shadow-sm">
                                                         {app}
                                                     </span>
                                                 ))}
                                                 {item.applications.length > 3 && (
                                                    <span className="px-2 py-1 rounded-md bg-white border border-neutral-100 text-neutral-400 text-[10px] font-bold shadow-sm">+</span>
                                                 )}
                                             </div>
                                        </div>
                                    )}

                                    {/* Description */}
                                    <p className="text-sm text-neutral-500 line-clamp-2 mb-6 leading-relaxed flex-1">
                                        {item.description}
                                    </p>
                                    
                                    {/* Footer */}
                                    <div className="mt-auto pt-4 border-t border-neutral-100 flex justify-between items-center">
                                         <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 group-hover/card:text-pinte-blue transition-colors">{ui.viewDetails}</span>
                                         <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center group-hover/card:bg-pinte-blue group-hover/card:text-white transition-all duration-300">
                                            <ArrowRight size={14} />
                                         </div>
                                    </div>
                                </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-full py-12 text-center text-neutral-400 italic">
                            No specific products listed yet.
                          </div>
                        )}
                     </div>
                  </div>
                );
              })}
           </div>
       )}

       {/* === MODE 2: FOIL RANGE (Swatch Grid) === */}
       {viewMode === 'range' && (
           <div className="max-w-[1600px] mx-auto px-6 py-12">
               <div className="flex justify-between items-end mb-8">
                   <div>
                       <h2 className="text-3xl font-display font-bold">Foil Selection</h2>
                       <p className="text-neutral-500 text-sm mt-2">
                           We found {filteredFoils.length} foils matching your criteria.
                       </p>
                   </div>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                   {filteredFoils.map(foil => (
                       <div 
                          key={foil.id} 
                          onClick={() => handleFoilClick(foil)}
                          className="group cursor-pointer flex flex-col items-center"
                       >
                           {/* Swatch Square */}
                           <div className="relative w-full aspect-square rounded-[2rem] mb-4 shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 bg-neutral-100 overflow-hidden border-[6px] border-white ring-1 ring-neutral-200/50">
                               
                               {/* Image or Color Fallback */}
                               {foil.image ? (
                                   <img
                                      src={foil.image}
                                      alt={foil.name}
                                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                      loading="lazy"
                                      width={300}
                                      height={300}
                                   />
                               ) : (
                                   <div 
                                      className="w-full h-full"
                                      style={{ backgroundColor: foil.hex }}
                                   ></div>
                               )}

                               {/* CSS Shine Effect (Only for non-image items to keep images clean) */}
                               {!foil.image && (
                                   <>
                                     <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/40 pointer-events-none"></div>
                                   </>
                               )}
                               
                               {/* 3D Icon on Hover */}
                               <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/10 backdrop-blur-[1px]">
                                   <div className="bg-white/90 backdrop-blur p-3 rounded-full text-pinte-blue shadow-sm transform scale-50 group-hover:scale-100 transition-transform">
                                       <Box size={24} />
                                   </div>
                               </div>
                           </div>

                           {/* Info */}
                           <div className="text-center">
                               <h3 className="font-bold text-neutral-900 group-hover:text-pinte-blue transition-colors">
                                   {foil.name}
                               </h3>
                               <p className="text-xs text-neutral-400 font-mono mt-1">{foil.code}</p>
                               <div className="mt-2 flex justify-center gap-2">
                                   <span className="text-[10px] bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded">
                                       {foil.series}
                                   </span>
                                   <span className="text-[10px] bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded">
                                       {foil.finish}
                                   </span>
                               </div>
                           </div>
                       </div>
                   ))}
               </div>
               
               {filteredFoils.length === 0 && (
                   <div className="py-20 text-center">
                       <p className="text-neutral-400">No foils found matching filters.</p>
                       <button 
                          onClick={() => {setSelectedSeries('All'); setSelectedFinish('All'); setSearchQuery('');}}
                          className="mt-4 text-pinte-blue font-bold text-sm underline"
                       >
                           Clear Filters
                       </button>
                   </div>
               )}
           </div>
       )}

       {/* Footer */}
       <div className="border-t border-neutral-100 py-12 text-center text-neutral-400 text-sm mt-auto">
          <p>© 2026 PINTE Catalog. Colors are digital simulations and may vary.</p>
       </div>
    </div>
  );
};

export default ProductShowcase;
