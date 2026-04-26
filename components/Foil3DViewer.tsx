import React, { useState, useEffect } from 'react';
import { X, Pencil, Save, Copy, Check, Maximize2, Loader2, ImageIcon } from 'lucide-react';
import { FoilItem } from '../types';

interface Foil3DViewerProps {
  isOpen: boolean;
  onClose: () => void;
  initialFoil: FoilItem;
  allFoils: FoilItem[];
}

const Foil3DViewer: React.FC<Foil3DViewerProps> = ({ isOpen, onClose, initialFoil, allFoils }) => {
  // State for the currently viewed item
  const [activeFoil, setActiveFoil] = useState<FoilItem>(initialFoil);
  
  // Local Catalog State (To allow CMS editing without database)
  const [localCatalog, setLocalCatalog] = useState<FoilItem[]>(allFoils);

  // CMS Mode State
  const [isCmsMode, setIsCmsMode] = useState(false);
  const [editForm, setEditForm] = useState<{ image: string; previewImage: string; name: string; code: string }>({
    image: '',
    previewImage: '',
    name: '',
    code: ''
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'copied'>('idle');

  // Image Loading States - Changed to track the loaded URL to avoid race conditions
  const [loadedMainImage, setLoadedMainImage] = useState<string | null>(null);
  const [loadedPreviewImage, setLoadedPreviewImage] = useState<string | null>(null);

  // New State for Full Screen Preview
  const [showFullScreenPreview, setShowFullScreenPreview] = useState(false);

  // Sync when prop changes (Modal Open)
  useEffect(() => {
    setActiveFoil(initialFoil);
    setLocalCatalog(allFoils);
  }, [initialFoil, allFoils, isOpen]);

  // Sync Form when active item changes
  useEffect(() => {
    setEditForm({
      image: activeFoil.image || '',
      previewImage: activeFoil.previewImage || '',
      name: activeFoil.name,
      code: activeFoil.code
    });
    setSaveStatus('idle');
    // Note: We don't need to manually reset loading states here anymore.
    // The comparison (loadedMainImage === activeFoil.image) handles the "loading" state naturally during render.
  }, [activeFoil]);

  const handleCmsSave = () => {
    const updatedCatalog = localCatalog.map(item => 
      item.id === activeFoil.id 
        ? { 
            ...item, 
            image: editForm.image, 
            previewImage: editForm.previewImage,
            name: editForm.name, 
            code: editForm.code 
          } 
        : item
    );
    
    setLocalCatalog(updatedCatalog);
    setActiveFoil({ 
        ...activeFoil, 
        image: editForm.image, 
        previewImage: editForm.previewImage,
        name: editForm.name, 
        code: editForm.code 
    });
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleExportData = () => {
    const json = JSON.stringify(localCatalog, null, 2);
    const exportString = `export const FOIL_CATALOG: FoilItem[] = ${json};`;
    
    navigator.clipboard.writeText(exportString).then(() => {
        setSaveStatus('copied');
        setTimeout(() => setSaveStatus('idle'), 2000);
        alert("Data copied to clipboard! Paste it into 'data/foil_data.ts' to persist changes.");
    });
  };

  if (!isOpen) return null;

  // Derived loading states
  const isMainImageLoaded = loadedMainImage === activeFoil.image;
  const isPreviewImageLoaded = loadedPreviewImage === activeFoil.previewImage;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300 font-sans">
      
      {/* Viewer Container */}
      <div className="relative w-full max-w-7xl h-[90vh] bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-neutral-800">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-50 p-2 bg-black/40 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors"
        >
          <X size={24} />
        </button>

        {/* CMS Toggle (Top Left) */}
        <div className="absolute top-6 left-6 z-50 flex gap-2">
            <button
                onClick={() => setIsCmsMode(!isCmsMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-md transition-all ${
                    isCmsMode ? 'bg-pinte-blue text-white' : 'bg-black/40 text-neutral-400 hover:bg-white/10'
                }`}
            >
                <Pencil size={14} />
                {isCmsMode ? 'CMS Mode On' : 'Edit Image'}
            </button>
            {isCmsMode && (
                <button
                    onClick={handleExportData}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest bg-neutral-800 text-green-400 hover:bg-neutral-700 transition-all"
                >
                    {saveStatus === 'copied' ? <Check size={14}/> : <Copy size={14} />}
                    {saveStatus === 'copied' ? 'Copied!' : 'Export Config'}
                </button>
            )}
        </div>

        {/* --- LEFT: VISUAL AREA --- */}
        <div className="relative w-full md:w-3/4 h-full bg-neutral-950 flex items-center justify-center overflow-hidden group">
           
           {/* Background Blur Effect based on color */}
           <div 
             className="absolute inset-0 opacity-20 blur-[100px] pointer-events-none transition-colors duration-700"
             style={{ backgroundColor: activeFoil.hex }}
           ></div>

           {/* MAIN IMAGE DISPLAY */}
           <div className="relative w-[100%] h-[100%] flex items-center justify-center">
               {!isMainImageLoaded && activeFoil.image && (
                   <div className="absolute inset-0 flex items-center justify-center">
                       <Loader2 className="w-12 h-12 text-neutral-700 animate-spin" />
                   </div>
               )}
               
               {activeFoil.image ? (
                   <img 
                     key={activeFoil.image} // Force remount on change
                     src={activeFoil.image} 
                     alt={activeFoil.name}
                     onLoad={() => setLoadedMainImage(activeFoil.image!)}
                     className={`max-w-full max-h-full object-contain drop-shadow-2xl transition-all duration-500 ${isMainImageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                   />
               ) : (
                   /* Fallback Visualization if no image */
                   <div className="relative w-full max-w-md aspect-square bg-neutral-800/50 rounded-[2rem] border-2 border-dashed border-neutral-700 flex flex-col items-center justify-center overflow-hidden animate-in zoom-in-95 group/placeholder hover:bg-neutral-800 transition-colors">
                        <div className="relative z-10 flex flex-col items-center text-neutral-600 group-hover/placeholder:text-neutral-400 transition-colors">
                            <div className="p-6 rounded-full bg-white/5 border border-white/5 mb-4 backdrop-blur-sm group-hover/placeholder:scale-110 transition-transform duration-500">
                                <ImageIcon size={64} strokeWidth={1.5} />
                            </div>
                            <span className="text-sm font-bold uppercase tracking-widest">Image Placeholder</span>
                            <span className="text-[10px] mt-2 opacity-50 font-mono">{activeFoil.code}</span>
                        </div>
                   </div>
               )}
           </div>

           {/* NEW: Stamping Effect Preview (Floating) */}
           <div className="absolute z-20 bg-neutral-800 rounded-2xl shadow-2xl border border-white/10 overflow-hidden group/preview transition-all hover:scale-105
               top-4 right-4 w-20 h-20
               sm:top-24 sm:left-8 sm:w-40 sm:h-40 sm:right-auto
               lg:top-12 lg:right-12 lg:w-[240px] lg:h-[240px]
           ">
               <div 
                   className="absolute inset-0 bg-neutral-900 flex items-center justify-center cursor-pointer"
                   onClick={() => activeFoil.previewImage && setShowFullScreenPreview(true)}
               >
                   {!isPreviewImageLoaded && activeFoil.previewImage && (
                       <div className="absolute inset-0 flex items-center justify-center z-10 bg-neutral-900/50">
                           <Loader2 className="w-6 h-6 text-white/50 animate-spin" />
                       </div>
                   )}

                   {activeFoil.previewImage ? (
                       <img 
                         key={activeFoil.previewImage}
                         src={activeFoil.previewImage} 
                         alt="Effect Preview"
                         onLoad={() => setLoadedPreviewImage(activeFoil.previewImage!)}
                         className={`w-full h-full object-cover transition-all duration-700 ${isPreviewImageLoaded ? 'opacity-90 group-hover/preview:opacity-100 group-hover/preview:scale-110' : 'opacity-0'}`}
                       />
                   ) : (
                       <div className="flex flex-col items-center justify-center text-neutral-600">
                          <ImageIcon size={32} className="mb-2 opacity-50" />
                          <span className="text-[10px] uppercase tracking-widest font-bold text-center px-2">Effect Preview</span>
                       </div>
                   )}
               </div>

               {/* Maximize Button */}
               {activeFoil.previewImage && (
                  <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowFullScreenPreview(true);
                    }}
                    className="absolute bottom-2 right-2 z-30 p-1.5 bg-black/60 hover:bg-pinte-blue text-white rounded-lg opacity-0 group-hover/preview:opacity-100 transition-all duration-300 backdrop-blur-md transform translate-y-2 group-hover/preview:translate-y-0"
                    title="Fullscreen View"
                  >
                     <Maximize2 size={16} />
                  </button>
               )}

               <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                  <p className="text-[8px] md:text-[10px] font-bold text-white/60 uppercase tracking-widest text-center">Stamping Effect</p>
               </div>
           </div>

           {/* Full Screen Preview Modal */}
           {showFullScreenPreview && activeFoil.previewImage && (
              <div 
                className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
                onClick={() => setShowFullScreenPreview(false)}
              >
                  <button 
                    onClick={() => setShowFullScreenPreview(false)}
                    className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"
                  >
                    <X size={24} />
                  </button>
                  <img 
                    src={activeFoil.previewImage} 
                    alt="Full Screen Effect"
                    className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
                    onClick={(e) => e.stopPropagation()}
                  />
              </div>
           )}

           {/* CMS CONTROLS OVERLAY */}
           {isCmsMode && (
               <div className="absolute bottom-10 left-10 right-10 bg-black/80 backdrop-blur-xl p-6 rounded-2xl border border-white/10 animate-in slide-in-from-bottom-10 z-30">
                   <div className="flex flex-col gap-4">
                       <div className="flex flex-col md:flex-row items-end gap-4">
                           <div className="flex-1 space-y-2 w-full">
                               <label className="text-xs font-bold text-neutral-500 uppercase">Image URL</label>
                               <input 
                                  type="text" 
                                  value={editForm.image}
                                  onChange={(e) => setEditForm({...editForm, image: e.target.value})}
                                  placeholder="Main Product Image..."
                                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-pinte-blue transition-colors"
                               />
                           </div>
                           <div className="flex-1 space-y-2 w-full">
                               <label className="text-xs font-bold text-neutral-500 uppercase">Effect Preview URL</label>
                               <input 
                                  type="text" 
                                  value={editForm.previewImage}
                                  onChange={(e) => setEditForm({...editForm, previewImage: e.target.value})}
                                  placeholder="Stamping Effect Image..."
                                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-pinte-blue transition-colors"
                               />
                           </div>
                       </div>
                       
                       <div className="flex flex-col md:flex-row items-end gap-4">
                           <div className="flex-1 space-y-2 w-full">
                               <label className="text-xs font-bold text-neutral-500 uppercase">Product Name</label>
                               <input 
                                  type="text" 
                                  value={editForm.name}
                                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-pinte-blue"
                               />
                           </div>
                           <div className="w-full md:w-1/4 space-y-2">
                               <label className="text-xs font-bold text-neutral-500 uppercase">SKU Code</label>
                               <input 
                                  type="text" 
                                  value={editForm.code}
                                  onChange={(e) => setEditForm({...editForm, code: e.target.value})}
                                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-pinte-blue"
                               />
                           </div>
                           <button 
                              onClick={handleCmsSave}
                              className="bg-pinte-blue text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-pinte-dark transition-colors flex items-center justify-center gap-2 mb-0.5 w-full md:w-auto"
                           >
                              {saveStatus === 'saved' ? <Check size={16}/> : <Save size={16} />}
                              {saveStatus === 'saved' ? 'Saved' : 'Update'}
                           </button>
                       </div>
                   </div>
               </div>
           )}

           {/* QUICK SELECTOR (Bottom Right) */}
           {!isCmsMode && (
               <div className="absolute bottom-8 right-8 z-20 bg-neutral-900/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white/10 max-w-[320px] hidden sm:block">
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
                    In This Series ({activeFoil.series})
                  </p>
                  <div className="grid grid-cols-5 gap-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                     {localCatalog.filter(f => f.series === activeFoil.series).map((item) => (
                       <button
                         key={item.id}
                         onClick={() => setActiveFoil(item)}
                         className={`relative w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${activeFoil.id === item.id ? 'border-pinte-blue scale-110 shadow-lg ring-2 ring-pinte-blue/20' : 'border-transparent hover:border-neutral-600'}`}
                         title={item.name}
                       >
                          {item.image ? (
                              <img src={item.image} className="w-full h-full object-cover" />
                          ) : (
                              <div className="w-full h-full" style={{ backgroundColor: item.hex }} />
                          )}
                       </button>
                     ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/10">
                     <p className="text-sm font-bold text-white">{activeFoil.name}</p>
                     <p className="text-xs text-neutral-500">{activeFoil.code}</p>
                  </div>
               </div>
           )}
           {/* Mobile Quick Selector */}
           {!isCmsMode && (
              <div className="absolute bottom-4 left-4 right-4 z-20 bg-neutral-900/90 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                 <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                     {localCatalog.filter(f => f.series === activeFoil.series).map((item) => (
                       <button
                         key={item.id}
                         onClick={() => setActiveFoil(item)}
                         className={`shrink-0 relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${activeFoil.id === item.id ? 'border-pinte-blue scale-105' : 'border-transparent'}`}
                       >
                          {item.image ? (
                              <img src={item.image} className="w-full h-full object-cover" />
                          ) : (
                              <div className="w-full h-full" style={{ backgroundColor: item.hex }} />
                          )}
                       </button>
                     ))}
                 </div>
                 <div className="text-center mt-2">
                    <p className="text-xs font-bold text-white">{activeFoil.name} <span className="text-neutral-500 font-normal">({activeFoil.code})</span></p>
                 </div>
              </div>
           )}
        </div>

        {/* --- RIGHT: INFO PANEL --- */}
        <div className="hidden md:flex w-1/4 h-full bg-neutral-900 border-l border-neutral-800 flex-col p-8 overflow-y-auto">
           <div className="mb-8">
              <span className="inline-block px-3 py-1 rounded-full bg-pinte-blue/10 text-pinte-blue text-xs font-bold uppercase tracking-widest mb-4 border border-pinte-blue/20">
                 {activeFoil.series} Series
              </span>
              <h1 className="text-3xl font-display font-bold text-white mb-2 leading-tight">
                  {activeFoil.name}
              </h1>
              <p className="text-neutral-500 font-mono text-sm mb-6 pb-6 border-b border-neutral-800">
                  SKU: {activeFoil.code}
              </p>

              <div className="space-y-6">
                 <div>
                    <h3 className="text-neutral-400 text-xs font-bold uppercase tracking-widest mb-2">Finish Type</h3>
                    <p className="text-white font-medium flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-white/50"></span>
                        {activeFoil.finish}
                    </p>
                 </div>
                 <div>
                    <h3 className="text-neutral-400 text-xs font-bold uppercase tracking-widest mb-2">Material Effect</h3>
                    <p className="text-white font-medium flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-white/50"></span>
                        {activeFoil.type}
                    </p>
                 </div>
                 {/*
                 <div>
                    <h3 className="text-neutral-400 text-xs font-bold uppercase tracking-widest mb-2">Color Hex</h3>
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-md border border-white/20" style={{ backgroundColor: activeFoil.hex }}></div>
                        <span className="text-white font-mono text-sm">{activeFoil.hex}</span>
                    </div>
                 </div>
                */}
              </div>
           </div>

           <div className="mt-auto pt-8 border-t border-neutral-800">
              <p className="text-neutral-500 text-xs leading-relaxed mb-6">
                 * Digital representation may vary from actual foil product. Please request a physical sample for accurate color matching.
              </p>
              <button className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2">
                 Request Physical Sample
              </button>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Foil3DViewer;
