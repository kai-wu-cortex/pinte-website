
import React from 'react';
import { ArrowLeft, Heart, MessageCircle, MoreHorizontal } from 'lucide-react';
import { CulturePost, UILabels } from '../types';
import { PinteLogo } from './PinteLogo';

interface CompanyCultureProps {
  onBack: () => void;
  posts: CulturePost[];
  ui?: UILabels['about'];
}

const CompanyCulture: React.FC<CompanyCultureProps> = ({ onBack, posts, ui }) => {
  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900 animate-in slide-in-from-right duration-500">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-neutral-100 transition-colors text-neutral-600"
          >
            <ArrowLeft size={24} />
          </button>
          
          <div className="flex items-center gap-2">
             <PinteLogo originalColors className="h-6 w-auto"/>
             <span className="font-bold text-lg">PINTE LIFE</span>
          </div>

          <div className="w-10"></div> {/* Spacer for center alignment */}
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8">
         {/* Introduction */}
         <div className="mb-10 text-center max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-3">{ui?.cultureTitle || "Explore PINTE Culture"}</h1>
            <p className="text-neutral-500 text-sm">Discover our moments and growth beyond work.</p>
         </div>

         {/* Waterfall / Masonry Grid */}
         {/* Using CSS columns for simple masonry layout */}
         <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {posts.map((post) => (
               <div 
                 key={post.id} 
                 className="break-inside-avoid bg-white rounded-2xl overflow-hidden shadow-sm border border-neutral-100 group hover:shadow-lg hover:shadow-neutral-200/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer mb-4"
               >
                  {/* Image */}
                  <div className="relative overflow-hidden">
                     <img 
                        src={post.image} 
                        alt={post.title} 
                        className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700" 
                     />
                     <div className="absolute top-3 right-3 bg-black/20 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                        {post.tags[0] || 'Life'}
                     </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                     <h3 className="font-bold text-neutral-900 text-sm md:text-base leading-snug mb-2 line-clamp-2 group-hover:text-pinte-blue transition-colors">
                        {post.title}
                     </h3>
                     <p className="text-neutral-500 text-xs leading-relaxed line-clamp-2 mb-4">
                        {post.desc}
                     </p>

                     {/* Footer: User & Stats */}
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <img 
                              src={post.avatar} 
                              alt={post.author} 
                              className="w-5 h-5 rounded-full bg-neutral-100 object-cover"
                           />
                           <span className="text-xs text-neutral-400 font-medium truncate max-w-[80px]">
                              {post.author}
                           </span>
                        </div>
                        <div className="flex items-center gap-1 text-neutral-400 group-hover:text-red-500 transition-colors">
                           <Heart size={14} className={post.likes > 200 ? "fill-red-500 text-red-500" : ""} />
                           <span className="text-xs font-bold">{post.likes}</span>
                        </div>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default CompanyCulture;
