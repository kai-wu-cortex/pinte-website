
import React from 'react';
import { PinteLogo } from './PinteLogo';
import { useLanguage } from '../contexts/LanguageContext';
import { Section } from '../types';
import { Globe, Mail, Building2, Phone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Footer: React.FC = () => {
  const { ui } = useLanguage();
  const navigate = useNavigate();

  const handleNavClick = (sectionId: string) => {
    // If we are navigating to a section on the home page
    if (location.pathname !== '/') {
        navigate('/', { state: { scrollTo: sectionId } });
    } else {
        const element = document.getElementById(sectionId);
        if (element) {
            const y = element.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    }
  };

  return (
    <footer id="contact" className="bg-white pt-24 pb-12 px-6 border-t border-neutral-100">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand & Copyright */}
          <div>
            <div className="flex items-center gap-2 mb-6">
                <PinteLogo originalColors className="h-8 w-auto" />
                <span className="font-display font-bold text-2xl tracking-tight">PINTE</span>
            </div>
            <p className="text-neutral-500 leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: ui.footer.desc }} />
            <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-pinte-blue hover:text-white transition-colors cursor-pointer"><Globe size={18}/></div>
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-pinte-blue hover:text-white transition-colors cursor-pointer"><Mail size={18}/></div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-neutral-900">{ui.footer.quickLinks}</h4>
            <ul className="space-y-4 text-neutral-600 font-medium">
                <li><button onClick={() => handleNavClick(Section.HOME)} className="hover:text-pinte-blue transition-colors text-left">{ui.nav.home}</button></li>
                <li><Link to="/products" className="hover:text-pinte-blue transition-colors">{ui.nav.products}</Link></li>
                <li><button onClick={() => handleNavClick(Section.SOLUTIONS)} className="hover:text-pinte-blue transition-colors text-left">{ui.nav.solutions}</button></li>
                <li><button onClick={() => handleNavClick(Section.ABOUT)} className="hover:text-pinte-blue transition-colors text-left">{ui.nav.about}</button></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-neutral-900">{ui.footer.contactUs}</h4>
            <ul className="space-y-4 text-neutral-600">
                <li className="flex items-start gap-3">
                  <Building2 className="shrink-0 mt-1 text-pinte-blue" size={18}/>
                  <span>Dongguan Best Craftwork Products Co., Ltd. <br/>Chang'an Town, Dongguan City, China</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="shrink-0 text-pinte-blue" size={18}/>
                  <a href="mailto:sales@bestglitter.com" className="hover:text-pinte-blue">sales9@bestglitter.com</a>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="shrink-0 text-pinte-blue" size={18}/>
                  <a href="tel:+8613192267509" className="hover:text-pinte-blue">+86-13192267509</a>
                </li>
            </ul>
          </div>

          {/* WeChat QR Code */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-neutral-900">{ui.footer.wechat}</h4>
            <div className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm inline-block">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://u.wechat.com/MHPZfF2HCiCARXbjSIeIcBY?s=2&color=1e40af" 
                  alt="WeChat QR Code" 
                  className="w-32 h-32 mb-3"
                />
                <p className="text-center text-xs text-neutral-400 font-medium uppercase tracking-wider">{ui.footer.scan}</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-neutral-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-neutral-400 text-sm">{ui.footer.rights}</p>
            <div className="flex gap-8 text-sm font-medium text-neutral-500">
              <a href="#" className="hover:text-pinte-blue transition-colors">{ui.footer.privacy}</a>
              <a href="#" className="hover:text-pinte-blue transition-colors">{ui.footer.terms}</a>
              <a href="#" className="hover:text-pinte-blue transition-colors">{ui.footer.sitemap}</a>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
