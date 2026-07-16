import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { getGeneratedGuide } from '../data/guideContent';
import type { GuideLang } from '../data/geoGuides';
import GeoGuide from './GeoGuide';
import LongFormGuide from './LongFormGuide';

const GuideRoute: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { lang } = useLanguage();
  const englishGeneratedGuide = lang === 'vi' ? getGeneratedGuide(slug, 'en') : undefined;
  const generatedLang: GuideLang | undefined = lang === 'en' || lang === 'cn' ? lang : undefined;
  const generatedGuide = generatedLang ? getGeneratedGuide(slug, generatedLang) : undefined;

  if (englishGeneratedGuide) {
    return <Navigate replace to={`/en/guides/${englishGeneratedGuide.slug}/`} />;
  }

  if (generatedGuide && generatedLang) {
    return <LongFormGuide guide={generatedGuide} lang={generatedLang} />;
  }

  return <GeoGuide />;
};

export default GuideRoute;
