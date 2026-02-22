
import React from 'react';
import FactoryTour360 from '../components/FactoryTour360';
import { useNavigate } from 'react-router-dom';

const FactoryTour: React.FC = () => {
  const navigate = useNavigate();

  return (
    <FactoryTour360 onClose={() => navigate('/')} />
  );
};

export default FactoryTour;
