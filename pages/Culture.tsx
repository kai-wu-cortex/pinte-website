
import React from 'react';
import CompanyCulture from '../components/CompanyCulture';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import SEOMeta from '../components/SEOMeta';

const Culture: React.FC = () => {
  const { content, ui, lang } = useLanguage();
  const navigate = useNavigate();

  return (
    <>
      <SEOMeta
        title={lang === 'cn' ? '关于我们 - PINTE品特烫金箔' : 'About Us - PINTE Hot Stamping Foils'}
        description={lang === 'cn'
          ? 'PINTE品特是一家拥有25年烫金箔生产经验的专业厂家，位于中国东莞，专注高端烫金箔研发生产，服务全球客户。'
          : 'PINTE is a professional manufacturer with 25 years of experience in hot stamping foil production located in Dongguan China, focusing on R&D and manufacturing of high-end hot stamping foils, serving customers worldwide.'
        }
        keywords={lang === 'cn'
          ? ['关于我们', 'PINTE', '品特', '东莞', '烫金箔厂家', '企业介绍', '25年经验', '东莞25年烫金箔生产厂家', '品特PINTE企业实力', '高端烫金箔研发生产厂家', '全球烫金箔定制服务商', '东莞烫金箔工厂实力', '品特PINTE厂家资质', '出口东南亚烫金箔厂家']
          : ['about us', 'PINTE', 'manufacturer', '25 years experience', 'Dongguan China', 'hot stamping foil', '25 years hot stamping foil manufacturing experience in Dongguan', 'PINTE high-end hot stamping foil R&D', 'professional hot stamping foil supplier worldwide', 'PINTE factory certification', 'Dongguan hot stamping foil exporter']
        }
        type="website"
        locale={lang === 'cn' ? 'zh_CN' : 'en_US'}
        canonicalUrl={`/${lang}/culture`}
      />
      <div className="pt-20">
        <CompanyCulture
          onBack={() => navigate(-1)}
          posts={content.CULTURE_POSTS}
          ui={ui.about}
        />
      </div>
    </>
  );
};

export default Culture;
