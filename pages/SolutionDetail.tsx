
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowLeft, CheckCircle2, Layers } from 'lucide-react';
import { PinteLogo } from '../components/PinteLogo';

const SolutionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { content, ui } = useLanguage();
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

  return (
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
                    </div>
               </div>
           </div>
       </div>
    </div>
  );
};

export default SolutionDetail;
