
import React from 'react';
import QuoteRequest from '../components/QuoteRequest';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import SEOMeta from '../components/SEOMeta';

const Quote: React.FC = () => {
  const { ui, lang } = useLanguage();
  const navigate = useNavigate();

  return (
    <>
      <SEOMeta
        title={lang === 'cn' ? '在线询价 - PINTE烫金箔' : 'Get a Quote - PINTE Hot Stamping Foils'}
        description={lang === 'cn'
          ? '欢迎在线询价咨询烫金箔产品，我们专业销售团队会尽快回复您的需求。'
          : 'Request a quote for hot stamping foil products online, our professional sales team will reply to your inquiry as soon as possible.'
        }
        keywords={lang === 'cn'
          ? ['在线询价', '报价咨询', '烫金箔询价', '联系我们', '烫金箔定制报价', '冷烫箔批发询价', '东南亚烫金膜出口报价', '东莞烫金箔厂家报价', '品特PINTE烫金箔在线报价', '全息烫金箔询价', '颜料箔批量采购报价', '烫金箔样品申请']
          : ['get quote', 'request quotation', 'contact us', 'hot stamping foil', 'custom hot stamping foil quote', 'cold foil wholesale price inquiry', 'hot stamping foil export quote to Southeast Asia', 'PINTE hot stamping foil online quote', 'holographic foil price request', 'pigment foil bulk order quotation', 'hot stamping foil sample application']
        }
        type="website"
        locale={lang === 'cn' ? 'zh_CN' : 'en_US'}
        canonicalUrl={`/${lang}/quote`}
      />
      <div className="pt-20">
        <QuoteRequest onBack={() => navigate(-1)} ui={ui.quote} />
      </div>
    </>
  );
};

export default Quote;
