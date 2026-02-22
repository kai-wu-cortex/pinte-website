
import React from 'react';
import QuoteRequest from '../components/QuoteRequest';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

const Quote: React.FC = () => {
  const { ui } = useLanguage();
  const navigate = useNavigate();

  return (
    <QuoteRequest onBack={() => navigate(-1)} ui={ui.quote} />
  );
};

export default Quote;
