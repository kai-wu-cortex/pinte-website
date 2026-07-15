import React, { Suspense } from 'react';
import SEOMeta from '../components/SEOMeta';

const FactoryTour360 = React.lazy(() => import('../components/FactoryTour360'));

const FactoryTourEmbed: React.FC = () => {
  return (
    <>
      <SEOMeta
        title="PINTE 360 Factory Tour Embed"
        description="Embeddable 360 virtual tour of PINTE hot stamping foil factory."
        keywords={['PINTE factory tour', '360 virtual factory tour', 'hot stamping foil factory']}
        type="website"
        canonicalUrl="/embed/factory-tour"
        noIndex
        disableHreflang
      />
      <main className="w-screen h-screen min-h-[520px] bg-black overflow-hidden">
        <Suspense fallback={
          <div className="w-full h-full min-h-[520px] flex items-center justify-center bg-black text-white">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-white/20 border-t-pinte-blue rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white/70 text-sm">Loading 360 Factory Tour...</p>
            </div>
          </div>
        }>
          <FactoryTour360 embedded />
        </Suspense>
      </main>
    </>
  );
};

export default FactoryTourEmbed;
