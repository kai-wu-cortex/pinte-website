
import React from 'react';
import { PinteLogo } from './PinteLogo';
import { useLanguage } from '../contexts/LanguageContext';
import { Section } from '../types';
import { Globe, Mail, Building2, Phone, Facebook } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Footer: React.FC = () => {
  const { ui, lang } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (sectionId: string) => {
    // Get current language from path
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const currentLang = pathSegments[0] || lang;
    // If we are navigating to a section on the home page
    if (!location.pathname.includes(`/${currentLang}/`) && location.pathname !== `/${currentLang}`) {
        navigate(`/${currentLang}`, { state: { scrollTo: sectionId } });
    } else {
        const element = document.getElementById(sectionId);
        if (element) {
            const y = element.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    }
  };

  const footerQrContacts = [
    {
      name: lang === 'cn' ? '吴经理' : 'Manager Wu',
      detail: '+86-13192267509',
      channel: lang === 'cn' ? '微信' : 'WeChat',
      src: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://u.wechat.com/MHPZfF2HCiCARXbjSIeIcBY?s=2&color=1e40af',
      alt: lang === 'cn' ? '吴经理微信二维码' : 'Manager Wu WeChat QR code',
      width: 128,
      height: 128,
    },
    {
      name: lang === 'cn' ? '胡经理' : 'Manager Hu',
      detail: '+86-13316693097',
      channel: lang === 'cn' ? '微信' : 'WeChat',
      src: '/images/contact/wechat-hu-manager.jpg',
      alt: lang === 'cn' ? '胡经理微信二维码' : 'Manager Hu WeChat QR code',
      width: 160,
      height: 231,
    },
    {
      name: 'Windy',
      detail: lang === 'cn' ? '广东 东莞' : 'Dongguan, Guangdong',
      channel: lang === 'cn' ? '微信' : 'WeChat',
      src: '/images/contact/wechat-windy.png',
      alt: lang === 'cn' ? 'Windy 微信二维码' : 'Windy WeChat QR code',
      width: 820,
      height: 1219,
    },
    {
      name: 'Joan',
      detail: lang === 'cn' ? '广东 东莞' : 'Dongguan, Guangdong',
      channel: lang === 'cn' ? '微信' : 'WeChat',
      src: '/images/contact/wechat-joan.png',
      alt: lang === 'cn' ? 'Joan 微信二维码' : 'Joan WeChat QR code',
      width: 630,
      height: 804,
    },
    {
      name: 'Windy Zhang',
      detail: lang === 'cn' ? '外贸业务' : 'International Sales',
      channel: 'WhatsApp',
      src: '/images/contact/whatsapp-windy-zhang.png',
      alt: lang === 'cn' ? 'Windy Zhang 外贸业务 WhatsApp 二维码' : 'Windy Zhang international sales WhatsApp QR code',
      width: 220,
      height: 222,
    },
    {
      name: 'Joan',
      detail: lang === 'cn' ? '外贸业务' : 'International Sales',
      channel: 'WhatsApp',
      src: '/images/contact/whatsapp-joan.png',
      alt: lang === 'cn' ? 'Joan 外贸业务 WhatsApp 二维码' : 'Joan international sales WhatsApp QR code',
      width: 220,
      height: 251,
    },
  ];

  return (
    <footer id="contact" className="bg-white pt-24 pb-12 px-6 border-t border-neutral-100">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand & Copyright */}
          <div>
            <div className="flex items-center gap-2 mb-6">
                <PinteLogo originalColors className="h-8 w-auto" />
                <span className="font-display font-bold text-2xl tracking-tight">PINTE</span>
            </div>
            <p className="text-neutral-500 leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: ui.footer.desc }} />
            <div className="flex gap-4">
                <a href="https://www.facebook.com/profile.php?id=61569812755745" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-pinte-blue hover:text-white transition-colors cursor-pointer"><Facebook size={18}/></a>
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-pinte-blue hover:text-white transition-colors cursor-pointer"><Globe size={18}/></div>
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-pinte-blue hover:text-white transition-colors cursor-pointer"><Mail size={18}/></div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-neutral-900">{ui.footer.quickLinks}</h4>
            <ul className="space-y-4 text-neutral-600 font-medium">
                <li><button onClick={() => handleNavClick(Section.HOME)} className="hover:text-pinte-blue transition-colors text-left">{ui.nav.home}</button></li>
                <li><Link to={`/${lang}/products`} className="hover:text-pinte-blue transition-colors">{ui.nav.products}</Link></li>
                <li><button onClick={() => handleNavClick(Section.SOLUTIONS)} className="hover:text-pinte-blue transition-colors text-left">{ui.nav.solutions}</button></li>
                <li><Link to={`/${lang}/about`} className="hover:text-pinte-blue transition-colors">{ui.nav.about}</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-neutral-900">{ui.footer.contactUs}</h4>
            <ul className="space-y-4 text-neutral-600">
                <li className="flex items-start gap-3">
                  <Building2 className="shrink-0 mt-1 text-pinte-blue" size={18}/>
                  <div>
                    <div className="font-medium text-neutral-800">
                      {lang === 'cn' ? '东莞市佰仕特工艺制品有限公司' : 'Dongguan Best Craftwork Products Co., Ltd.'}
                    </div>
                    <div className="text-sm mt-1">
                      {lang === 'cn' ? '广东省东莞市长安镇' : 'Chang\'an Town, Dongguan City, Guangdong Province, China'}
                    </div>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="shrink-0 text-pinte-blue" size={18}/>
                  <div>
                    <span className="text-sm text-neutral-500">{lang === 'cn' ? '邮箱' : 'Email'}</span><br/>
                    <a href="mailto:sales9@bestglitter.com" className="hover:text-pinte-blue font-medium text-neutral-800">sales9@bestglitter.com</a>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="shrink-0 text-pinte-blue" size={18}/>
                  <div>
                    <span className="text-sm text-neutral-500">{lang === 'cn' ? '电话 / 微信' : 'Phone / WeChat'}</span><br/>
                    <div className="font-medium text-neutral-800 space-y-1">
                      <span>{lang === 'cn' ? '吴经理' : 'Manager Wu'}</span>
                      <br />
                      <a href="tel:+8613192267509" className="hover:text-pinte-blue block">+86-13192267509</a>
                      <span>{lang === 'cn' ? '胡经理' : 'Manager Hu'}</span>
                      <br />
                      <a href="tel:+8613316693097" className="hover:text-pinte-blue">+86-13316693097</a>
                    </div>
                  </div>
                </li>
            </ul>
          </div>

        </div>

        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-5">
            <div>
              <h4 className="font-bold text-lg text-neutral-900">
                {lang === 'cn' ? '微信 / WhatsApp 联系方式' : 'WeChat / WhatsApp Contacts'}
              </h4>
              <p className="text-sm text-neutral-500 mt-1">
                {lang === 'cn' ? '扫码添加对应业务联系人' : 'Scan to contact the right sales representative'}
              </p>
            </div>
            <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider">{ui.footer.scan}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {footerQrContacts.map((contact) => (
              <div key={`${contact.channel}-${contact.name}-${contact.detail}`} className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm text-center">
                <div className="h-44 flex items-center justify-center">
                  <img
                    src={contact.src}
                    alt={contact.alt}
                    className="max-h-44 w-full object-contain rounded-xl"
                    loading="lazy"
                    width={contact.width}
                    height={contact.height}
                  />
                </div>
                <p className="text-sm text-neutral-800 font-semibold mt-3">{contact.name}</p>
                <p className="text-xs text-neutral-500 mt-1">{contact.detail}</p>
                <p className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider mt-1">{contact.channel}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-neutral-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-neutral-400 text-sm">{ui.footer.rights}</p>
            <div className="flex gap-8 text-sm font-medium text-neutral-500">
              <Link to={`/${lang}/privacy`} className="hover:text-pinte-blue transition-colors">{ui.footer.privacy}</Link>
              <Link to={`/${lang}/terms`} className="hover:text-pinte-blue transition-colors">{ui.footer.terms}</Link>
              <a href="#" className="hover:text-pinte-blue transition-colors">{ui.footer.sitemap}</a>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
