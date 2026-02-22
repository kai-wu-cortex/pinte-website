
import React from 'react';
import CompanyCulture from '../components/CompanyCulture';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

const Culture: React.FC = () => {
  const { content, ui } = useLanguage();
  const navigate = useNavigate();

  return (
    <CompanyCulture 
      onBack={() => navigate(-1)} 
      posts={content.CULTURE_POSTS} 
      ui={ui.about} 
    />
  );
};

export default Culture;
