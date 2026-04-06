
import React, { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';

// Lazy load heavy 3D component
const FactoryTour360 = React.lazy(() => import('../components/FactoryTour360'));

const FactoryTour: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pinte-blue/20 border-t-pinte-blue rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading 360° Factory Tour...</p>
        </div>
      </div>
    }>
      <FactoryTour360 onClose={() => navigate('/')} />
    </Suspense>
  );
};

export default FactoryTour;
