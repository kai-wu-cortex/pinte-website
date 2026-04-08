
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { PinteLogo } from './PinteLogo';
import { useLanguage } from '../contexts/LanguageContext';
import { Section, SolutionData, ProductDetail } from '../types';
import {
  Menu, X, ChevronDown, ArrowRight, Languages,
  Users, PenTool, Laptop
} from 'lucide-react';

const NavBar: React.FC = () => {
  const { lang, toggleLanguage, content, ui } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileItem, setExpandedMobileItem] = useState<string | null>(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle navigation logic
  const handleNavClick = (itemId: string) => {
    // Get current language from path
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const currentLang = pathSegments[0] || lang;
    if (itemId === 'onlinetour') {
      navigate(`/${currentLang}/tour`);
      setMobileMenuOpen(false);
      return;
    }
    // 'about' is now a separate page, not a homepage section
    if (itemId === 'about') {
      navigate(`/${currentLang}/about`);
      setMobileMenuOpen(false);
      return;
    }

    // Check if it's a section on the home page
    const isHomeSection = Object.values(Section).includes(itemId as Section);

    if (isHomeSection) {
      if (!location.pathname.includes(`/${currentLang}/`) && location.pathname !== `/${currentLang}`) {
        navigate(`/${currentLang}`, { state: { scrollTo: itemId } });
      } else {
        const element = document.getElementById(itemId);
        if (element) {
            // Offset for fixed header
            const y = element.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }
    } else {
      // It's a page route (like 'products') - keep current language prefix
      navigate(`/${currentLang}/${itemId}`);
    }
    setMobileMenuOpen(false);
  };

  // Check for scroll state passed from other pages
  useEffect(() => {
    if (location.pathname === '/' && location.state && (location.state as any).scrollTo) {
      const sectionId = (location.state as any).scrollTo;
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
             const y = element.getBoundingClientRect().top + window.scrollY - 100;
             window.scrollTo({ top: y, behavior: 'smooth' });
        }
        // Clear state
        window.history.replaceState({}, document.title);
      }, 100);
    }
  }, [location]);

  // Navbar transparency logic:
  // If not on Home page, always show solid/scrolled style
  // Home is now at /en or /cn, not just /
  const isHomePage = location.pathname === '/' || location.pathname === '/en' || location.pathname === '/cn' || location.pathname === '/vi';
  const effectiveScrolled = scrolled || !isHomePage;

  return (
    <>
      <nav className={`
        fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 w-[95%] max-w-[1200px]
        rounded-full px-2 py-2 flex justify-between items-center
        border
        ${effectiveScrolled 
          ? 'bg-white/90 backdrop-blur-xl shadow-lg border-white/50' 
          : 'bg-white/5 backdrop-blur-[2px] shadow-soft border-white/20' 
        }
      `}>
         <div className="flex items-center gap-2 pl-6 cursor-pointer" onClick={() => navigate('/')}>
            <PinteLogo 
              originalColors={effectiveScrolled} 
              className={`h-8 w-auto transition-colors duration-300 ${effectiveScrolled ? '' : 'text-white'}`} 
            />
            <span className={`font-display font-bold text-xl tracking-tight transition-colors ${effectiveScrolled ? 'text-neutral-900' : 'text-white'}`}>PINTE</span>
         </div>
         
         {/* Navigation Items with Dropdowns */}
         <div className="hidden lg:flex items-center gap-1 h-full">
            {content.NAV_MENU_ITEMS.map((item) => (
               <div key={item.id} className="relative group h-full flex items-center px-1">
                  <button 
                      onClick={() => handleNavClick(item.id)}
                      className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all flex items-center
                        ${effectiveScrolled 
                          ? 'text-neutral-700 hover:bg-neutral-100 hover:text-pinte-blue' 
                          : 'text-white hover:bg-white/20'
                        }
                      `}
                  >
                      {item.label}
                      {item.hasDropdown && (
                        <ChevronDown size={14} className="ml-1 inline-block group-hover:rotate-180 transition-transform duration-300"/>
                      )}
                  </button>
                  
                  {/* === SOLUTIONS DROPDOWN === */}
                  {item.id === 'solutions' && (
                     <div className="absolute top-full left-1/2 -translate-x-1/2 pt-6 w-[700px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50 cursor-default">
                        <div className="bg-white rounded-2xl shadow-xl border border-neutral-100 p-4 relative">
                             <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-l border-t border-neutral-100"></div>
                             <div className="grid grid-cols-2 gap-3">
                                {Object.values(content.SOLUTIONS_DATA).map((sol: SolutionData) => (
                                   <Link
                                      key={sol.id}
                                      to={`/solutions/${sol.id}`}
                                      className="group/sol flex items-start gap-4 p-3 hover:bg-neutral-50 rounded-xl cursor-pointer transition-colors"
                                   >
                                      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-neutral-100">
                                        <img
                                          src={sol.img}
                                          alt={sol.title}
                                          className="w-full h-full object-cover group-hover/sol:scale-110 transition-transform duration-500"
                                          loading="lazy"
                                          width={64}
                                          height={64}
                                        />
                                      </div>
                                      <div className="py-1">
                                         <div className="font-bold text-neutral-900 text-sm group-hover/sol:text-pinte-blue transition-colors line-clamp-1">{sol.title}</div>
                                         <div className="text-xs text-neutral-400 mt-1 uppercase tracking-wider">{sol.series} Series</div>
                                      </div>
                                   </Link>
                                ))}
                             </div>
                        </div>
                     </div>
                  )}

                  {/* === PRODUCTS DROPDOWN === */}
                  {item.id === 'products' && (
                     <div className="absolute top-full left-1/2 -translate-x-1/2 pt-6 w-[550px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50 cursor-default">
                        <div className="bg-white rounded-2xl shadow-xl border border-neutral-100 p-4 relative">
                             <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-l border-t border-neutral-100"></div>
                             <div className="grid grid-cols-2 gap-3">
                                {Object.values(content.PRODUCT_DATA).map((product: ProductDetail) => (
                                   <Link
                                      key={product.id}
                                      to={`/products/category/${product.id}`}
                                      className="flex items-center gap-3 p-2.5 hover:bg-neutral-50 rounded-xl cursor-pointer group/item transition-colors"
                                   >
                                      <img
                                        src={product.heroImage}
                                        className="w-12 h-12 rounded-lg object-cover shadow-sm group-hover/item:scale-105 transition-transform"
                                        alt={product.name}
                                        loading="lazy"
                                        width={48}
                                        height={48}
                                      />
                                      <div className="overflow-hidden">
                                         <div className="font-bold text-neutral-900 text-sm group-hover/item:text-pinte-blue transition-colors truncate">{product.name}</div>
                                         <div className="text-xs text-neutral-400 truncate uppercase tracking-wider">{product.subtitle}</div>
                                      </div>
                                   </Link>
                                ))}
                             </div>
                             <div className="mt-4 pt-3 border-t border-neutral-100 text-center">
                                <Link to={`/${lang}/products`} className="text-xs font-bold text-pinte-blue hover:text-pinte-dark uppercase tracking-widest flex items-center justify-center gap-1">
                                   {ui.nav.viewAllProducts} <ArrowRight size={12}/>
                                </Link>
                             </div>
                        </div>
                     </div>
                  )}
               </div>
            ))}
         </div>

         <div className="pr-2 flex items-center gap-3">
             <button
               onClick={toggleLanguage}
               className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold transition-all border
                 ${effectiveScrolled 
                   ? 'bg-neutral-100 text-neutral-700 border-neutral-200 hover:bg-neutral-200' 
                   : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                 }
               `}
             >
                <Languages size={14} />
                <span>{lang === 'en' ? 'EN' : '中'}</span>
             </button>

             <Link
               to={`/${lang}/quote`}
               className="hidden md:flex bg-pinte-blue text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-pinte-dark transition-colors items-center gap-2 shadow-lg shadow-pinte-blue/20"
             >
                {ui.nav.getQuote}
             </Link>

             {/* Mobile Menu Button */}
             <button 
                className="lg:hidden p-2 rounded-full hover:bg-white/10 transition-colors"
                onClick={() => setMobileMenuOpen(true)}
             >
                <Menu size={24} className={effectiveScrolled ? 'text-neutral-900' : 'text-white'} />
             </button>
         </div>
      </nav>

      {/* === MOBILE MENU === */}
      <div className={`fixed inset-0 z-[60] bg-white transition-transform duration-300 ease-in-out flex flex-col ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
           <div className="px-6 h-20 flex items-center justify-between border-b border-neutral-100 shrink-0">
              <div className="flex items-center gap-2">
                 <PinteLogo originalColors className="h-8 w-auto" />
                 <span className="font-display font-bold text-xl tracking-tight text-neutral-900">PINTE</span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 -mr-2 text-neutral-500 hover:bg-neutral-100 rounded-full transition-colors"
              >
                 <X size={24} />
              </button>
           </div>

           <div className="flex-1 overflow-y-auto py-8 px-6 flex flex-col">
              {content.NAV_MENU_ITEMS.map((item) => {
                 const hasSubMenu = item.hasDropdown;
                 const isExpanded = expandedMobileItem === item.id;
                 
                 return (
                 <div key={item.id} className="border-b border-neutral-100 last:border-0">
                    <button
                        onClick={() => {
                           if (hasSubMenu) {
                               setExpandedMobileItem(isExpanded ? null : item.id);
                           } else {
                               handleNavClick(item.id);
                           }
                        }}
                        className="w-full flex items-center justify-between py-4 text-left"
                    >
                        <span className={`text-xl font-bold transition-colors ${isExpanded ? 'text-pinte-blue' : 'text-neutral-900'}`}>{item.label}</span>
                        {hasSubMenu && (
                            <ChevronDown size={20} className={`text-neutral-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-pinte-blue' : ''}`} />
                        )}
                    </button>
                    
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[800px] opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
                        {item.id === 'solutions' && (
                             <div className="flex flex-col gap-2 pl-4 bg-neutral-50/50 rounded-xl p-2">
                                {Object.values(content.SOLUTIONS_DATA).map((sol: SolutionData) => (
                                   <Link
                                      key={sol.id}
                                      to={`/solutions/${sol.id}`}
                                      onClick={() => setMobileMenuOpen(false)}
                                      className="text-left py-2 px-2 text-neutral-600 font-medium hover:text-pinte-blue hover:bg-white rounded-lg transition-all text-sm flex items-center gap-3"
                                   >
                                      <img src={sol.img} alt={sol.title} className="w-8 h-8 rounded object-cover" />
                                      {sol.title}
                                   </Link>
                                ))}
                             </div>
                        )}
                        {item.id === 'products' && (
                             <div className="flex flex-col gap-2 pl-4 bg-neutral-50/50 rounded-xl p-2">
                                {Object.values(content.PRODUCT_DATA).map((prod: ProductDetail) => (
                                   <Link
                                      key={prod.id}
                                      to={`/products/category/${prod.id}`}
                                      onClick={() => setMobileMenuOpen(false)}
                                      className="text-left py-2 px-2 text-neutral-600 font-medium hover:text-pinte-blue hover:bg-white rounded-lg transition-all text-sm flex items-center gap-3"
                                   >
                                      <img src={prod.heroImage} alt={prod.name} className="w-8 h-8 rounded object-cover" />
                                      {prod.name}
                                   </Link>
                                ))}
                                <Link
                                   to={`/${lang}/products`}
                                   onClick={() => setMobileMenuOpen(false)}
                                   className="text-left py-2 px-2 text-pinte-blue font-bold text-sm mt-2 flex items-center gap-2"
                                >
                                   {ui.nav.viewAllProducts} <ArrowRight size={14}/>
                                </Link>
                             </div>
                        )}
                    </div>
                 </div>
              )})}
              
              <div className="mt-8 space-y-4">
                 <Link
                    to={`/${lang}/quote`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full bg-pinte-blue text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-pinte-blue/20 flex justify-center"
                 >
                    {ui.nav.getQuote}
                 </Link>
                 
                 <button
                   onClick={() => { toggleLanguage(); }}
                   className="w-full bg-neutral-100 text-neutral-900 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
                 >
                    <Languages size={20} />
                    <span>{lang === 'en' ? 'Switch to 中文' : 'Switch to English'}</span>
                 </button>
              </div>
           </div>
      </div>
    </>
  );
};

export default NavBar;
