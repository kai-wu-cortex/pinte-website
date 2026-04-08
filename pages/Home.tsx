
'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Section, ProductId } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, ChevronLeft, ChevronRight, Play, ArrowUpRight, X,
  Award, Factory, Users, PenTool, Laptop, Target, HeartHandshake, Trophy, Globe,
  Settings, Layers, Box, Palette, Plus, Star, TrendingUp, Lightbulb, Cpu, Crown,
  Scissors, Microscope, Truck, Headphones
} from 'lucide-react';
import SEOMeta from '../components/SEOMeta';

// Lazy load heavy particle component
const TechParticles = React.lazy(() => import('../components/TechParticles'));

// --- Helper Components ---
const NumberTicker = ({ 
  targetValue, 
  label, 
  iconName, 
  suffix = '',
  duration = 2000,
  textClassName = "text-3xl md:text-4xl text-neutral-900" 
}: any) => {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  
  // Basic Icon Map for Ticker
  const ICON_MAP: Record<string, any> = {
    Building2: Factory, 
    TrendingUp, 
    Factory, 
    Lightbulb,
    Award
  };
  const Icon = iconName ? ICON_MAP[iconName] : null;
  const finalNumber = parseInt(targetValue.replace(/,/g, '').replace(/\+/g, '')) || 0;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.5 }
    );
    if (elementRef.current) observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;
    let startTime: number | null = null;
    let animationFrame: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeValue = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeValue * finalNumber));
      if (progress < 1) animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [hasAnimated, finalNumber, duration]);

  return (
    <div ref={elementRef} className="text-center group">
      {Icon && (
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-blue-50 text-pinte-blue rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:bg-pinte-blue group-hover:text-white">
            <Icon size={24} />
          </div>
        </div>
      )}
      <div className={`font-display font-bold mb-2 tracking-tight ${textClassName}`}>
        {count.toLocaleString()}{suffix}
      </div>
      {label && <p className="text-sm font-medium text-neutral-500 uppercase tracking-widest">{label}</p>}
    </div>
  );
};

const MatrixText = ({ targetText, label, icon: Icon }: any) => {
  const [displayText, setDisplayText] = useState('');
  const elementRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*';

  const animate = useCallback(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        targetText.split('').map((char: string, index: number) => {
            if (index < iteration) return targetText[index];
            if (char === ' ' || char === '+') return char;
            return chars[Math.floor(Math.random() * chars.length)];
          }).join('')
      );
      if (iteration >= targetText.length) {
        clearInterval(interval);
        setDisplayText(targetText); 
      }
      iteration += 1 / 3; 
    }, 30);
  }, [targetText]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animate();
        }
      }, { threshold: 0.5 });
    if (elementRef.current) observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [animate, hasAnimated]);

  return (
    <div ref={elementRef} className="text-center group">
      {Icon && (
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-blue-50 text-pinte-blue rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:bg-pinte-blue group-hover:text-white">
            <Icon size={24} />
          </div>
        </div>
      )}
      <div className="font-display font-bold text-3xl md:text-4xl text-neutral-900 mb-2 h-10 tracking-tight">
        {displayText}
      </div>
      <p className="text-sm font-medium text-neutral-500 uppercase tracking-widest">{label}</p>
    </div>
  );
};

const TestimonialCard = ({ name, role, text, stars }: any) => (
  <div className="bg-white p-8 rounded-[2rem] border border-neutral-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex gap-1 mb-6">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={16} className={`${i < stars ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-200'}`} />
      ))}
    </div>
    <p className="text-neutral-600 mb-8 leading-relaxed font-medium">"{text}"</p>
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-neutral-200 overflow-hidden">
        <img
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`}
          alt={name}
          loading="lazy"
          width={48}
          height={48}
        />
      </div>
      <div>
        <h4 className="font-bold text-neutral-900">{name}</h4>
        <p className="text-xs text-neutral-400 uppercase tracking-wide">{role}</p>
      </div>
    </div>
  </div>
);

const FAQItem = ({ q, a }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-neutral-200 py-6 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
      <div className="flex justify-between items-center gap-4">
        <h4 className="font-bold text-lg text-neutral-800">{q}</h4>
        <Plus size={20} className={`text-pinte-blue transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} />
      </div>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-32 mt-4' : 'max-h-0'}`}>
        <p className="text-neutral-500">{a}</p>
      </div>
    </div>
  );
};

// --- Main Home Component ---
const Home: React.FC = () => {
  const { content, ui, lang } = useLanguage();
  const navigate = useNavigate();
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const autoSlideRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoSlide = () => {
    if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    autoSlideRef.current = setInterval(() => {
      setHeroImageIndex((prev) => (prev + 1) % content.HERO_SLIDES.length);
    }, 6000);
  };

  useEffect(() => {
    startAutoSlide();
    return () => { if (autoSlideRef.current) clearInterval(autoSlideRef.current); };
  }, [content]); // Depend on content length which is stable

  const changeHeroImage = (direction: 'next' | 'prev') => {
    startAutoSlide();
    if (direction === 'next') {
      setHeroImageIndex((prev) => (prev + 1) % content.HERO_SLIDES.length);
    } else {
      setHeroImageIndex((prev) => (prev - 1 + content.HERO_SLIDES.length) % content.HERO_SLIDES.length);
    }
  };

  const handleHeroButtonClick = (slideId: number) => {
      if (slideId === 1) navigate('/products');
      else if (slideId === 2) navigate('/tour');
      else if (slideId === 3) {
          const element = document.getElementById(Section.CONTACT);
          if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
  };

  const ADVANTAGE_ICONS: Record<string, any> = { Cpu, Crown, Users, HeartHandshake };
  const SERVICE_ICONS: Record<string, any> = { Palette, Scissors, Microscope, Truck, Headphones, Settings };

  return (
    <main className="min-h-screen">
      {/* === HERO SECTION === */}
      <section id="home" className="relative h-screen min-h-[700px] flex items-center overflow-hidden">
         <div className="absolute inset-0 z-0">
            {content.HERO_SLIDES.map((slide, index) => (
              <div key={slide.id} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === heroImageIndex ? 'opacity-100' : 'opacity-0'}`}>
                <img
                  src={slide.image}
                  className="w-full h-full object-cover"
                  alt={slide.subtitle}
                  loading={index === 0 ? "eager" : "lazy"}
                  width={1920}
                  height={1080}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
              </div>
            ))}
         </div>
         <div className="absolute inset-0 z-20 flex justify-between items-center px-4 pointer-events-none">
            <button onClick={() => changeHeroImage('prev')} className="pointer-events-auto bg-white/10 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all"><ChevronLeft size={32} /></button>
            <button onClick={() => changeHeroImage('next')} className="pointer-events-auto bg-white/10 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all"><ChevronRight size={32} /></button>
         </div>
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
            {content.HERO_SLIDES.map((_, index) => (
              <button key={index} onClick={() => { startAutoSlide(); setHeroImageIndex(index); }} className={`w-2.5 h-2.5 rounded-full transition-all ${index === heroImageIndex ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/60'}`} />
            ))}
         </div>
         <div className="max-w-[1200px] mx-auto px-6 w-full relative z-10 pt-20">
            <div className="max-w-2xl text-white">
                {content.HERO_SLIDES.map((slide, index) => (
                    index === heroImageIndex && (
                        <div key={slide.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                           <p className="text-white/80 font-bold tracking-widest text-sm uppercase mb-4 animate-in fade-in duration-1000 delay-100">{slide.subtitle}</p>
                           <h1 className="font-display font-bold text-5xl md:text-7xl lg:text-8xl leading-[1.1] mb-8 tracking-tight animate-in fade-in slide-in-from-left-4 duration-700 delay-200" dangerouslySetInnerHTML={{ __html: slide.title }} />
                           <p className="text-lg text-white/90 mb-10 max-w-lg leading-relaxed font-light animate-in fade-in duration-700 delay-300">{slide.description}</p>
                           <button onClick={() => handleHeroButtonClick(slide.id)} className="bg-white text-neutral-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-all flex items-center gap-3 w-fit group animate-in fade-in duration-700 delay-500">
                              {slide.buttonText} 
                              <div className="w-8 h-8 rounded-full bg-pinte-blue text-white flex items-center justify-center group-hover:translate-x-1 transition-transform"><ArrowRight size={16}/></div>
                           </button>
                        </div>
                    )
                ))}
            </div>
         </div>
         <div className="absolute bottom-12 right-6 md:right-12 z-20 hidden md:block animate-in slide-in-from-right-8 duration-1000">
            <div onClick={() => setShowVideoModal(true)} className="bg-white/10 backdrop-blur-md p-4 rounded-[2rem] border border-white/20 w-[300px] group cursor-pointer hover:bg-white/20 transition-all shadow-lg">
               <div className="h-32 rounded-3xl overflow-hidden mb-4 relative">
                  <video src="https://pintepic-1300269931.cos.ap-singapore.myqcloud.com/%E9%98%BF%E9%87%8C%E5%B7%B4%E5%B7%B4%E5%B7%A5%E5%8E%82%E4%BB%8B%E7%BB%8D.mp4" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" autoPlay muted loop playsInline />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
                     <div className="w-10 h-10 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/40"><Play size={16} fill="currentColor" /></div>
                  </div>
                  <div className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-sm"><ArrowUpRight size={14} className="text-neutral-900"/></div>
               </div>
               <div className="flex justify-between items-end px-2">
                  <div>
                     <p className="text-white/60 text-xs uppercase tracking-wider mb-1">{ui.hero.onlineTour}</p>
                     <p className="text-white font-bold text-lg">{ui.hero.productionLine}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all"><ArrowRight size={16}/></div>
               </div>
            </div>
         </div>
         {showVideoModal && (
            <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
              <div className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                 <button onClick={() => setShowVideoModal(false)} className="absolute top-6 right-6 z-20 w-12 h-12 bg-black/50 hover:bg-black/80 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-colors border border-white/10"><X size={24} /></button>
                 <video src="https://pintepic-1300269931.cos.ap-singapore.myqcloud.com/%E9%98%BF%E9%87%8C%E5%B7%B4%E5%B7%B4%E5%B7%A5%E5%8E%82%E4%BB%8B%E7%BB%8D.mp4" className="w-full h-full object-contain" controls autoPlay />
              </div>
              <div className="absolute inset-0 -z-10 cursor-pointer" onClick={() => setShowVideoModal(false)}></div>
            </div>
         )}
      </section>

      {/* === COMPANY STRENGTH === */}
      <section className="py-16 bg-white border-b border-neutral-100">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-4">
            {content.COMPANY_STATS.map((stat, i) => (
                <NumberTicker key={i} targetValue={stat.targetValue} suffix={stat.suffix} label={stat.label} iconName={stat.icon} />
            ))}
            <MatrixText targetText="ISO/SGS/BSCI" label="Certifications" icon={Award} />
          </div>
        </div>
      </section>

      {/* === SOLUTIONS === */}
      <section id="solutions" className="py-24 px-6 bg-neutral-50">
        <div className="max-w-[1200px] mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-4 animate-in slide-in-from-bottom-4 duration-700">{ui.solutions.title}</h2>
          <p className="text-neutral-500 text-lg mb-16 animate-in slide-in-from-bottom-4 duration-700 delay-100">{ui.solutions.subtitle}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center group animate-in slide-in-from-bottom-8 duration-700 delay-200">
              <div className="w-24 h-24 bg-pinte-blue rounded-[2rem] flex items-center justify-center text-white mb-8 shadow-xl shadow-blue-200 transform group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300"><Users size={40} /></div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">{ui.solutions.cards.distributor.title}</h3>
              <p className="text-neutral-500 leading-relaxed max-w-xs">{ui.solutions.cards.distributor.desc}</p>
            </div>
            <div className="flex flex-col items-center group animate-in slide-in-from-bottom-8 duration-700 delay-300">
              <div className="w-24 h-24 bg-pinte-blue rounded-[2rem] flex items-center justify-center text-white mb-8 shadow-xl shadow-blue-200 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"><PenTool size={40} /></div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">{ui.solutions.cards.designer.title}</h3>
              <p className="text-neutral-500 leading-relaxed max-w-xs">{ui.solutions.cards.designer.desc}</p>
            </div>
            <div className="flex flex-col items-center group animate-in slide-in-from-bottom-8 duration-700 delay-400">
              <div className="w-24 h-24 bg-pinte-blue rounded-[2rem] flex items-center justify-center text-white mb-8 shadow-xl shadow-blue-200 transform group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300"><Laptop size={40} /></div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">{ui.solutions.cards.ecommerce.title}</h3>
              <p className="text-neutral-500 leading-relaxed max-w-xs">{ui.solutions.cards.ecommerce.desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* === ABOUT US === */}
      <section id="about" className="relative bg-neutral-50 pb-24">
        <div className="w-full h-[100vh] min-h-[600px] relative z-0">
           <div className="absolute inset-0 overflow-hidden">
             <img src="https://pintepic-1300269931.cos.ap-singapore.myqcloud.com/%E7%94%BB%E6%9D%BF%201.png" className="w-full h-full object-cover" alt="Company Panorama" style={{ objectPosition: 'center' }} />
             <div className="absolute inset-0 bg-black/20"></div>
           </div>
           <div className="absolute top-16 left-8 md:left-24 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg z-10">
              <p className="font-bold text-neutral-900 flex items-center gap-2"><Factory size={18} className="text-pinte-blue"/>{ui.about.factoryLabel}</p>
           </div>
        </div>
        <div className="relative z-10 -mt-40 px-6">
           <div className="max-w-[1200px] mx-auto bg-white rounded-[3rem] shadow-2xl shadow-neutral-900/10 p-12 md:p-20 flex flex-col lg:flex-row gap-16 lg:items-start">
              <div className="lg:w-1/2 flex flex-col justify-between">
                <div>
                  <span className="text-pinte-blue font-bold tracking-widest text-sm uppercase mb-4 block">{ui.about.profileTitle}</span>
                  <h2 className="text-4xl lg:text-5xl font-display font-bold text-neutral-900 leading-[1.2] mb-6" dangerouslySetInnerHTML={{ __html: ui.about.vision }} />
                  <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-100 mb-8">
                     <p className="text-neutral-700 leading-relaxed font-medium">
                        {lang === 'zh' 
                           ? '品特的愿景是成为全球烫金膜领域的卓越引领者。使命是将高端，高质，易用的烫金膜带给每一位追求品质与创新的行业伙伴，让他们的产品焕发独特光彩。'
                           : 'PINTE\'s vision is to become a global leader in the field of hot stamping foils. Our mission is to bring high-end, high-quality, and easy-to-use foils to every partner pursuing quality and innovation.'
                        }
                     </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    {content.COMPANY_ADVANTAGES.map((item, i) => {
                       const Icon = ADVANTAGE_ICONS[item.icon] || Cpu;
                       return (
                       <div key={i} className="group p-4 rounded-2xl bg-white border border-neutral-100 hover:border-pinte-blue/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default">
                          <div className="w-12 h-12 bg-pinte-blue text-white rounded-xl flex items-center justify-center mb-4 shadow-md shadow-pinte-blue/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300"><Icon size={24} /></div>
                          <h4 className="font-bold text-lg text-neutral-900 mb-1 group-hover:text-pinte-blue transition-colors">{item.title}</h4>
                          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-3">{item.en}</p>
                          <p className="text-xs text-neutral-500 leading-relaxed text-justify opacity-80 group-hover:opacity-100 transition-opacity">{item.desc}</p>
                       </div>
                    )})}
                  </div>
                </div>
              </div>
              <div className="lg:w-1/2 lg:pl-12 border-l border-neutral-100">
                <div className="flex items-baseline gap-3 mb-8">
                    <NumberTicker targetValue="28+" suffix="+" duration={2500} textClassName="text-7xl lg:text-8xl text-pinte-blue leading-none" />
                    <div className="flex flex-col"><span className="text-xl font-bold text-neutral-900">YEARS</span><span className="text-neutral-400 text-sm">{ui.about.yearsExp}</span></div>
                </div>
                <div className="text-s text-neutral-500 leading-relaxed text-justify opacity-80 group-hover:opacity-100 transition-opacity" dangerouslySetInnerHTML={{__html: ui.about.history}} />
              </div>
           </div>
        </div>
      </section>

      {/* === PRODUCTS === */}
      <section id="products" className="py-24 px-6 bg-white">
         <div className="max-w-[1200px] mx-auto">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 items-end">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-neutral-900 leading-[1.1]" dangerouslySetInnerHTML={{ __html: ui.products.discoverTitle }} />
                <div className="lg:pl-12 flex flex-col items-start gap-8">
                   <p className="text-neutral-500 text-lg leading-relaxed">{ui.products.discoverDesc}</p>
                   <Link to={`/${lang}/products`} className="group flex items-center gap-2 text-pinte-blue font-bold text-sm tracking-widest uppercase border-b-2 border-pinte-blue/20 pb-1 hover:border-pinte-blue transition-all">
                     {ui.products.viewCatalog} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                   </Link>
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(['PK', 'PC', 'PLPY'] as ProductId[]).map((id) => {
                    const product = content.PRODUCT_DATA[id];
                    const Icon = id === 'PK' ? Layers : id === 'PC' ? Box : Palette;
                    return (
                      <Link key={id} to={`/${lang}/products/category/${id}`} className="group cursor-pointer relative h-[350px] md:h-[500px] overflow-hidden rounded-[2.5rem] shadow-lg hover:shadow-2xl transition-all duration-500">
                         <div className="absolute inset-0">
                           <img
                             src={product.heroImage}
                             className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                             alt={product.name}
                             loading="lazy"
                             width={800}
                             height={800}
                           />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 opacity-60 group-hover:opacity-75 transition-opacity duration-500"></div>
                         </div>
                         <div className="relative z-10 h-full flex flex-col justify-between p-8">
                            <div className="flex justify-between items-start">
                               <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-sm group-hover:bg-white group-hover:text-neutral-900 transition-colors duration-300"><Icon size={24} /></div>
                               <div className="px-4 py-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-xs font-bold text-white tracking-widest uppercase">{id} {ui.products.series}</div>
                            </div>
                            <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                               <p className="text-white/70 text-sm font-medium mb-2 uppercase tracking-wide">{product.subtitle}</p>
                               <h3 className="text-4xl font-display font-bold text-white mb-4 leading-none">{product.name.split(' ')[0]} <span className="text-xl opacity-60 font-normal ml-2">{ui.products.series}</span></h3>
                               <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
                                 <div className="overflow-hidden">
                                   <p className="text-white/80 text-sm leading-relaxed mb-6 line-clamp-3">{product.description}</p>
                                   <div className="flex items-center gap-3 text-white font-bold text-sm group/btn">
                                      <span>{ui.products.viewDetails}</span>
                                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover/btn:bg-white group-hover/btn:text-black transition-colors"><ArrowRight size={14} /></div>
                                   </div>
                                 </div>
                               </div>
                            </div>
                         </div>
                      </Link>
                    );
                })}
             </div>
          </div>
       </section>

      {/* === SERVICES === */}
      <section className="bg-[#1e40af] text-white py-24 px-6 relative overflow-hidden">
        <Suspense fallback={null}>
          <TechParticles />
        </Suspense>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500 rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="max-w-[1200px] mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-20 gap-10">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                 <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                 <span className="text-orange-400 font-bold tracking-widest text-sm uppercase">Our Services</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-display font-bold mb-8 leading-tight" dangerouslySetInnerHTML={{ __html: ui.services.title }} />
              <p className="text-white/80 text-lg leading-relaxed max-w-xl">{ui.services.subtitle}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
             {content.SERVICE_GRID.map((item, i) => {
               const Icon = SERVICE_ICONS[item.icon] || Settings;
               return (
               <div key={i} className="group bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 cursor-pointer relative overflow-hidden backdrop-blur-sm">
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowRight className="text-white/60" size={20} /></div>
                  <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 bg-white/5"><Icon size={32} className="text-white" /></div>
                  <h3 className="text-2xl font-bold mb-1">{item.title}</h3>
                  <p className="text-white/50 text-xs uppercase tracking-wider mb-4">{item.en}</p>
                  <p className="text-white/70 leading-relaxed text-sm">{item.desc}</p>
               </div>
             )})}
          </div>
          {/* Dashboard */}
          <div className="bg-white text-neutral-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-blue-900/20 relative z-10">
             <div className="flex items-center justify-between mb-10 border-b border-neutral-100 pb-6">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                   <h3 className="font-display font-bold text-2xl">{ui.services.dashboard}</h3>
                </div>
                <span className="text-neutral-400 text-sm hidden md:block">{ui.services.updated}: {new Date().toLocaleDateString()}</span>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {content.DASHBOARD_STATS.map((item, i) => (
                   <div key={i} className="flex gap-6 items-start">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0">
                         <img src={item.img} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700 p-4 bg-blue/10 rounded-xl" alt={item.label} />
                      </div>
                      <div>
                         <p className="text-neutral-500 text-sm font-medium mb-1">{item.label}</p>
                         <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold font-display text-neutral-900">{item.value}</span>
                            <span className="text-xs text-neutral-400 font-medium">{item.unit}</span>
                         </div>
                         <div className="h-1 bg-neutral-100 rounded-full mt-3 overflow-hidden w-full">
                            <div className="h-full bg-pinte-blue w-2/3 rounded-full"></div>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </div>
      </section>

      {/* === CULTURE PREVIEW === */}
      <section className="py-24 px-6 bg-neutral-50">
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
             <div>
                <h2 className="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-6 leading-tight">
                   {lang === 'zh' ? <>选择品特<br/>用专业打造人人认可的产品</> : <>Choose PINTE<br/>Professional Quality for Everyone</>}
                </h2>
                <p className="text-neutral-500 text-lg mb-12">{lang === 'zh' ? "二十余年深耕烫金领域，我们不仅提供材料，更传递价值。" : "Over 20 years in the foil industry, delivering not just material, but value."}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12">
                   {/* Vision, Values, Achievements, Partners */}
                   {[{icon: Target, title: ui.about.visionTitle, label: "Our Vision", desc: lang === 'zh' ? '成为全球烫金膜领域的卓越引领者。' : 'To be the global leader in hot stamping foils.'},
                     {icon: HeartHandshake, title: ui.about.valuesTitle, label: "Core Values", desc: lang === 'zh' ? '彼此成就，合作共赢。' : 'Mutual achievement, win-win cooperation.'},
                     {icon: Trophy, title: ui.about.achievementsTitle, label: "Our Achievements", desc: lang === 'zh' ? '拥有 20,000㎡ 现代化生产基地。' : '20,000㎡ modern production base.'},
                     {icon: Globe, title: ui.about.partnersTitle, label: "Global Partners", desc: lang === 'zh' ? '与多家国际知名企业建立合作。' : 'Long-term strategic partnerships.'}
                   ].map((item, i) => (
                      <div key={i} className="flex flex-col gap-4 group">
                          <div className="w-14 h-14 bg-white rounded-2xl border border-neutral-100 flex items-center justify-center text-pinte-blue shadow-sm group-hover:scale-110 group-hover:bg-pinte-blue group-hover:text-white transition-all duration-300">
                             <item.icon size={28} />
                          </div>
                          <div>
                             <h4 className="text-xl font-bold text-neutral-900 mb-1">{item.title}</h4>
                             <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">{item.label}</p>
                             <p className="text-neutral-600 leading-relaxed text-sm">{item.desc}</p>
                          </div>
                      </div>
                   ))}
                </div>
             </div>
             <div className="relative h-full min-h-[500px]">
                <div className="aspect-[4/5] rounded-[3rem] overflow-hidden sticky top-32 shadow-2xl shadow-neutral-200">
                   <img
                     src="https://s3plus.meituan.net/opapisdk/op_ticket_1_5677168484_1765950617863_qdqqd_jqs18c.JPG"
                     className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                     alt="Green Future"
                     loading="lazy"
                     width={800}
                     height={1000}
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-10 text-white">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-6 border border-white/20"><Trophy size={32} className="text-white" /></div>
                      <h3 className="text-3xl font-bold mb-2">{ui.about.cultureTitle}</h3>
                      <p className="opacity-80 leading-relaxed">{ui.about.cultureDesc}</p>
                      <Link to={`/${lang}/culture`} className="mt-8 bg-white text-neutral-900 px-8 py-3 rounded-full text-sm font-bold w-fit hover:bg-blue-50 transition-colors flex items-center gap-2">
                         {ui.about.readMore} <ArrowRight size={16}/>
                      </Link>
                   </div>
                </div>
             </div>
          </div>
       </section>

       {/* === TESTIMONIALS === */}
       <section className="py-24 px-6 bg-white">
          <div className="max-w-[1200px] mx-auto">
              <div className="mb-16">
                <h2 className="text-4xl font-display font-bold text-neutral-900 mb-4">{ui.testimonials.title}</h2>
                <p className="text-neutral-500 max-w-xl">{ui.testimonials.subtitle}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <TestimonialCard name="James Oliver" role="Packaging Designer" text="PINTE Energy Solar is the most professional company I've ever worked with. The foil quality is consistent." stars={5} />
                <TestimonialCard name="Jenny Wilson" role="Procurement Manager" text="An absolute treat to work with. Top notch craftsmanship and professionalism." stars={5} />
                <TestimonialCard name="Liam Nelson" role="Brand Director" text="Very easy. The metallic effects are stunning and the cold foil application was seamless." stars={4} />
              </div>
          </div>
       </section>

       {/* === NOTICES === */}
       <section className="py-24 px-6 bg-white">
          <div className="max-w-[1200px] mx-auto">
             <div className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6 border-b-2 border-neutral-900 pb-6">
                <div>
                   <span className="text-neutral-500 font-bold tracking-widest text-xs uppercase mb-2 block">{ui.notes.subtitle}</span>
                   <h2 className="text-3xl md:text-5xl font-display font-bold text-neutral-900 leading-none uppercase" dangerouslySetInnerHTML={{ __html: ui.notes.title }} />
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-neutral-200">
                {content.NOTICES.map((note) => (
                   <div key={note.id} className="relative p-8 border-r border-b border-neutral-200 group hover:bg-neutral-50 transition-colors">
                      <div className="flex justify-between items-start mb-6">
                         <span className="font-display font-bold text-4xl text-neutral-200 group-hover:text-pinte-blue transition-colors duration-300">{note.id}</span>
                         <div className="w-2 h-2 bg-neutral-200 rounded-full group-hover:bg-pinte-blue transition-colors"></div>
                      </div>
                      <h3 className="font-bold text-lg text-neutral-900 mb-3 uppercase tracking-tight">{note.title}</h3>
                      <p className="text-sm text-neutral-500 leading-relaxed text-justify font-medium">{note.text}</p>
                   </div>
                ))}
             </div>
          </div>
       </section>

       {/* === FAQ === */}
       <section className="py-24 px-6 bg-neutral-50">
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-16">
             <div>
                <h2 className="text-4xl font-display font-bold text-neutral-900 mb-6">{ui.faq.title}</h2>
                <p className="text-neutral-500 mb-8">{ui.faq.subtitle}</p>
                <Link to={`/${lang}/quote`} className="bg-pinte-blue text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-pinte-dark transition-colors inline-block">{ui.faq.contactBtn}</Link>
             </div>
             <div className="lg:col-span-2 space-y-4">
                {content.FAQ_ITEMS.map((faq, i) => (
                    <FAQItem key={i} q={faq.q} a={faq.a} />
                ))}
             </div>
          </div>
       </section>
      <SEOMeta
        title={lang === 'cn' ? '品特PINTE - 高端烫金膜制造专家｜中国东莞烫金膜制造商，拥有多年涂布，定制化生产经验' : 'PINTE - Premium Hot Stamping Foil Manufacturer | Dongguan China, Years of Coating Experience, Custom Production'}
        description={lang === 'cn'
          ? '主营烫金箔、烫金膜、冷烫箔、电化铝、颜料箔、全息烫金箔，拥有多年涂布经验，专业定制化生产，供应越南、东南亚、马来西亚、泰国、印尼等全球市场。'
          : 'PINTE is a leading manufacturer of high-end hot stamping foils based in Dongguan China with years of coating experience and custom production capabilities. We supply hot stamping foil, cold foil, digital foil, pigment foil, holographic foil to Vietnam, Southeast Asia, Malaysia, Thailand, Indonesia and global markets.'
        }
        keywords={lang === 'cn'
          ? ['烫金箔', '烫金膜', '电化铝', '冷烫箔', '颜料箔', '全息烫金箔', '烫金', '包装印刷', '东莞', '中国', '东南亚', '越南', '东莞烫金膜', '塑胶烫金膜', '颜料箔', '化妆品烫印箔', '化妆品烫金', '纸张烫印', '纸张烫金加工', '东莞高端烫金箔生产厂家', '中国冷烫箔供应商', '东南亚烫金膜批发', '越南电化铝定制', '全息烫金箔厂家直销', '颜料箔生产厂家', '包装印刷用烫金箔', '塑胶皮革烫金膜', '数码冷烫', '数码冷烫烫金膜', '丝印冷烫', '丝印冷烫烫金膜', '数码印刷烫金箔', '出口东南亚烫金箔', '品特PINTE烫金箔', '烫金膜涂布', '定制化烫金箔']
          : ['hot stamping foil', 'cold foil', 'digital foil', 'pigment foil', 'holographic foil', 'metallic foil', 'packaging', 'leather', 'plastic', 'digital printing', 'Southeast Asia', 'Vietnam', 'China', 'manufacturer', 'high-end hot stamping foil manufacturer in Dongguan China', 'cold foil supplier for Southeast Asia', 'holographic hot stamping foil wholesale', 'pigment foil for packaging printing', 'custom metallic foil for leather', 'digital printing foil for plastic', 'hot stamping foil export to Vietnam', 'PINTE hot stamping foil factory', 'hot stamping foil coating', 'custom hot stamping foil']
        }
        type="website"
        geoRegion="CN"
        geoPlacename="Dongguan, Guangdong"
        geoPosition="22.7860 113.8860"
        locale={lang === 'cn' ? 'zh_CN' : 'en_US'}
        canonicalUrl={`/${lang}`}
      />
    </main>
  );
};

export default Home;
