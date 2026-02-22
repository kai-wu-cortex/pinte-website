/**
 * SEO Meta 组件
 * 为每个页面注入SEO/SEM/GEO优化标签
 */

import React from 'react';

interface SEOMetaProps {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  geoRegion?: string;
  geoPlacename?: string;
  geoPosition?: string;
  locale?: string;
  alternateLocale?: string;
  canonicalUrl?: string;
}

const SEOMeta: React.FC<SEOMetaProps> = ({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  publishedTime,
  author,
  section,
  tags = [],
  geoRegion,
  geoPlacename,
  geoPosition,
  locale = 'en_US',
  alternateLocale,
  canonicalUrl
}) => {
  const siteName = 'PINTE';
  const siteUrl = 'https://pinte.com';
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const fullImage = image ? (image.startsWith('http') ? image : `${siteUrl}${image}`) : `${siteUrl}/og-image.jpg`;
  const fullTitle = `${title} | ${siteName}`;

  return (
    <>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph - Facebook & LinkedIn */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      {alternateLocale && <meta property="og:locale:alternate" content={alternateLocale} />}
      
      {/* Article specific OG tags */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      {type === 'article' && section && (
        <meta property="article:section" content={section} />
      )}
      {type === 'article' && tags.map((tag, index) => (
        <meta key={index} property="article:tag" content={tag} />
      ))}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      {/* GEO Meta Tags - 本地SEO优化 */}
      {geoRegion && <meta name="geo.region" content={geoRegion} />}
      {geoPlacename && <meta name="geo.placename" content={geoPlacename} />}
      {geoPosition && <meta name="geo.position" content={geoPosition} />}
      
      {/* Business Info */}
      <meta name="author" content={author || siteName} />
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      
      {/* Language Tags */}
      <html lang={locale.split('_')[0]} />
    </>
  );
};

/**
 * 生成JSON-LD结构化数据
 */
export const generateArticleSchema = (article: {
  title: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  url: string;
  category?: string[];
  tags?: string[];
  geo?: {
    region?: string;
    language?: string;
    locality?: string;
  };
}) => {
  const siteUrl = 'https://pinte.com';
  
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description,
    "image": article.image ? (article.image.startsWith('http') ? article.image : `${siteUrl}${article.image}`) : `${siteUrl}/og-image.jpg`,
    "datePublished": article.datePublished,
    "dateModified": article.dateModified || article.datePublished,
    "author": {
      "@type": "Organization",
      "name": article.author || "PINTE"
    },
    "publisher": {
      "@type": "Organization",
      "name": "PINTE",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${siteUrl}${article.url}`
    },
    "articleSection": article.category?.[0] || 'Blog',
    "keywords": article.tags?.join(', '),
    "inLanguage": article.geo?.language || 'en-US',
    "spatial": article.geo?.region ? {
      "@type": "Place",
      "name": article.geo.region
    } : undefined,
    "audience": article.geo?.region ? {
      "@type": "Audience",
      "name": article.geo.region
    } : undefined
  };
};

/**
 * 生成BreadcrumbList结构化数据
 */
export const generateBreadcrumbSchema = (items: { name: string; url: string }[]) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
};

/**
 * 生成Website结构化数据（用于站内搜索）
 */
export const generateWebsiteSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "PINTE",
    "url": "https://pinte.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://pinte.com/blog?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };
};

/**
 * 生成Organization结构化数据
 */
export const generateOrganizationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "PINTE",
    "url": "https://pinte.com",
    "logo": "https://pinte.com/logo.png",
    "description": "Premium hot stamping foil manufacturer",
    "sameAs": [
      "https://facebook.com/pinte",
      "https://twitter.com/pinte",
      "https://linkedin.com/company/pinte",
      "https://instagram.com/pinte"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+86-XXX-XXXXXXX",
      "contactType": "customer service",
      "availableLanguage": ["English", "Chinese"]
    }
  };
};

export default SEOMeta;
