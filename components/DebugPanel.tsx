import React, { useState } from 'react';
import { X, Save, RefreshCw, LayoutTemplate, Copy, FileJson } from 'lucide-react';

interface DebugPanelProps {
  data: any;
  onUpdate: (newData: any) => void;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ data, onUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [jsonContent, setJsonContent] = useState('');
  const [activeTab, setActiveTab] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Initialize tabs based on data keys
  const tabs = Object.keys(data);

  const handleOpen = () => {
    setIsOpen(true);
    if (!activeTab && tabs.length > 0) {
      const firstTab = tabs[0];
      setActiveTab(firstTab);
      setJsonContent(JSON.stringify(data[firstTab], null, 2));
    } else if (activeTab) {
       setJsonContent(JSON.stringify(data[activeTab], null, 2));
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setJsonContent(JSON.stringify(data[tab], null, 2));
    setError(null);
  };

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonContent);
      // Construct new full data object
      const newData = {
        ...data,
        [activeTab]: parsed
      };
      onUpdate(newData);
      setError(null);
      alert('Content updated successfully! (In-Memory)');
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleExport = () => {
     try {
        const imports = `import { ProductId, ProductDetail, CatalogItem, SolutionData } from '../types';

// Icons are stored as strings here to allow JSON serialization/editing in the Debug Panel.
// The App component maps these strings to actual Lucide components.

`;
        let fileContent = imports;
        
        // Reconstruct export statements from data
        for (const key of Object.keys(data)) {
             if (key === 'default') continue;
             
             let typeStr = '';
             // Restore TypeScript types for better code quality
             if (key === 'PRODUCT_DATA') typeStr = ': Record<ProductId, ProductDetail>';
             else if (key === 'CATALOG_DATA') typeStr = ': Record<ProductId, CatalogItem[]>';
             else if (key === 'SOLUTIONS_DATA') typeStr = ': Record<string, SolutionData>';
             else if (key === 'SERIES_INFO') typeStr = ': Record<string, { title: string, rollImg: string, features: string[] }>';
             
             fileContent += `export const ${key}${typeStr} = ${JSON.stringify(data[key], null, 2)};\n\n`;
        }

        navigator.clipboard.writeText(fileContent).then(() => {
            alert("Configuration code copied to clipboard!\n\nPlease paste this into 'data/content.ts' to save changes permanently.");
        });
     } catch (e) {
         console.error(e);
         alert("Failed to export. Check console for details.");
     }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={handleOpen}
        className="fixed bottom-4 left-4 z-[100] bg-neutral-900/80 backdrop-blur text-white px-4 py-3 rounded-full font-mono text-xs shadow-lg hover:scale-105 transition-transform flex items-center gap-2 border border-white/10"
      >
        <LayoutTemplate size={14} />
        CMS DEBUG
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-neutral-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-neutral-100 bg-neutral-50">
          <div>
             <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                <RefreshCw size={20} className="text-pinte-blue"/>
                Content Management System (Debug)
             </h2>
             <p className="text-sm text-neutral-500 mt-1">Edit JSON to update content. Use "Export Code" to save permanently.</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-neutral-200 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
           {/* Sidebar */}
           <div className="w-64 bg-neutral-50 border-r border-neutral-100 overflow-y-auto p-3 space-y-1">
              <p className="px-4 py-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">Data Sections</p>
              {tabs.map(tab => (
                 <button
                   key={tab}
                   onClick={() => handleTabChange(tab)}
                   className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-pinte-blue text-white shadow-md' : 'text-neutral-600 hover:bg-neutral-200'}`}
                 >
                   {tab.replace(/_/g, ' ')}
                 </button>
              ))}
           </div>

           {/* Editor */}
           <div className="flex-1 p-0 flex flex-col relative bg-neutral-900">
              {error && (
                <div className="absolute top-4 left-4 right-4 z-10 bg-red-500/90 backdrop-blur text-white p-3 rounded-lg text-sm border border-red-400 shadow-lg">
                  JSON Syntax Error: {error}
                </div>
              )}
              <textarea
                value={jsonContent}
                onChange={(e) => setJsonContent(e.target.value)}
                className="flex-1 w-full font-mono text-sm bg-neutral-900 text-green-400 p-6 focus:outline-none resize-none leading-relaxed"
                spellCheck={false}
              />
           </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-100 bg-white flex justify-between items-center">
           <div className="text-xs text-neutral-400">
              * Changes are local unless exported and saved to source file.
           </div>
           <div className="flex gap-4">
             <button onClick={() => handleTabChange(activeTab)} className="px-6 py-2.5 text-neutral-500 font-bold hover:bg-neutral-50 rounded-lg transition-colors">
               Reset Changes
             </button>
             <button 
                onClick={handleExport}
                className="px-6 py-2.5 bg-neutral-100 text-neutral-900 font-bold rounded-lg hover:bg-neutral-200 transition-colors flex items-center gap-2"
             >
                <Copy size={18} />
                Copy Code for Persistence
             </button>
             <button onClick={handleSave} className="px-8 py-2.5 bg-pinte-blue text-white font-bold rounded-lg hover:bg-pinte-dark transition-colors flex items-center gap-2 shadow-lg shadow-pinte-blue/20">
               <Save size={18} />
               Apply Update
             </button>
           </div>
        </div>

      </div>
    </div>
  );
};