
import React, { Suspense } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import SEOMeta from '../components/SEOMeta';

// Lazy load heavy 3D component
const FactoryTour360 = React.lazy(() => import('../components/FactoryTour360'));

const FactoryTour: React.FC = () => {
  const { lang } = useLanguage();
  const navigate = useNavigate();

  return (
    <>
      <SEOMeta
        title={lang === 'cn' ? '工厂在线参观 - PINTE烫金箔' : 'Factory Virtual Tour - PINTE Hot Stamping Foils'}
        description={lang === 'cn'
          ? '线上参观 PINTE 东莞烫金箔生产工厂，了解我们的生产流程和质检标准。'
          : 'Take a virtual tour of our PINTE hot stamping foil manufacturing factory in Dongguan China, learn about our production process and quality standards.'
        }
        keywords={lang === 'cn'
          ? ['工厂参观', '线上参观', '烫金箔生产', 'PINTE工厂', '东莞', '东莞烫金箔工厂线上参观', '品特PINTE烫金箔生产流程', '烫金箔质检标准', '数字化烫金膜生产线', '东南亚客户工厂考察', '烫金箔工厂实地参观预约', '电化铝生产车间参观']
          : ['factory tour', 'virtual tour', 'hot stamping foil production', 'manufacturing', 'Dongguan', 'virtual tour of PINTE hot stamping foil factory in Dongguan', 'hot stamping foil production process', 'quality control standards for hot stamping foil', 'digital hot stamping foil production line', 'factory inspection for Southeast Asia clients', 'book a hot stamping foil factory visit']
        }
        type="website"
        locale={lang === 'cn' ? 'zh_CN' : 'en_US'}
        canonicalUrl={`/${lang}/tour`}
      />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-pinte-blue/20 border-t-pinte-blue rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading 360° Factory Tour...</p>
          </div>
        </div>
      }>
        <FactoryTour360 onClose={() => navigate(`/${lang}`)} />
      </Suspense>
    </>
  );
};

export default FactoryTour;
