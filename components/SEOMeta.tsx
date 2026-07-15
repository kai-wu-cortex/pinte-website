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
  canonicalUrl?: string;
  includeOrganizationSchema?: boolean;
  noIndex?: boolean;
  disableHreflang?: boolean;
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
  canonicalUrl,
  includeOrganizationSchema = false,
  noIndex = false,
  disableHreflang = false
}) => {
  const siteName = 'PINTE';
  const siteUrl = 'https://www.pintecl.com';
  const pagePath = url || canonicalUrl || '';
  const fullUrl = pagePath ? `${siteUrl}${pagePath}` : siteUrl;
  const fullImage = image ? (image.startsWith('http') ? image : `${siteUrl}${image}`) : `${siteUrl}/og-image.jpg`;
  const fullTitle = title;

  // Supported languages for hreflang implementation
  // URL format: /en/path  /cn/path
  const supportedLanguages = [
    { lang: 'en', hreflang: 'en', name: 'English', isDefault: false },
    { lang: 'cn', hreflang: 'zh-CN', name: 'Chinese', isDefault: false },
    { lang: '', hreflang: 'x-default', name: 'Default', isDefault: true }
  ];

  // Generate hreflang tags - match our URL structure: /lang/path
  const generateHreflangTags = () => {
    return supportedLanguages.map(langInfo => {
      let alternateUrl: string;
      if (langInfo.isDefault) {
        // x-default points to the English global page instead of the root Chinese redirect.
        if (!canonicalUrl) {
          alternateUrl = `${siteUrl}/en`;
        } else {
          const pathParts = canonicalUrl.split('/');
          const pathWithoutLang = pathParts.slice(2).join('/');
          alternateUrl = `${siteUrl}/en${pathWithoutLang ? `/${pathWithoutLang}` : ''}`;
        }
      } else if (!canonicalUrl) {
        // No canonicalUrl means this is the homepage for the current language
        alternateUrl = `${siteUrl}/${langInfo.lang}`;
      } else {
        // canonicalUrl is already /currentLang/path, extract the path part after language
        const pathParts = canonicalUrl.split('/');
        const pathWithoutLang = pathParts.slice(2).join('/');
        alternateUrl = `${siteUrl}/${langInfo.lang}${pathWithoutLang ? `/${pathWithoutLang}` : ''}`;
      }

      return (
        <link
          key={langInfo.hreflang}
          rel="alternate"
          hrefLang={langInfo.hreflang}
          href={alternateUrl}
        />
      );
    });
  };

  return (
    <>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}

      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={`${siteUrl}${canonicalUrl}`} />}

      {/* Hreflang Tags - International SEO */}
      {!disableHreflang && generateHreflangTags()}

      {/* Open Graph - Facebook & LinkedIn */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />

      {/* Open Graph locale alternates */}
      {locale === 'en_US' ? (
        <meta property="og:locale:alternate" content="zh_CN" />
      ) : (
        <meta property="og:locale:alternate" content="en_US" />
      )}
      
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

      {/* JSON-LD Structured Data - Manufacturer */}
      {includeOrganizationSchema && (
        <script type="application/ld+json">
          {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Manufacturer",
          "name": "PINTE (品特)",
          "alternateName": "Dongguan Best Craftwork Products Co., Ltd.",
          "url": "https://www.pintecl.com",
          "logo": "https://www.pintecl.com/logo.png",
          "description": "High-end hot stamping foil manufacturer specializing in hot stamping foil, cold foil, digital foil, pigment foil, holographic foil, metallic foil for packaging, leather, plastic, digital printing applications. Serving Vietnam, Southeast Asia, Thailand, Malaysia, Indonesia, Singapore, United States, United Kingdom, Europe.",
          "foundingDate": "2000",
          "foundingLocation": "Dongguan, Guangdong, China",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Dongguan",
            "addressRegion": "Guangdong",
            "addressCountry": "CN",
            "streetAddress": "Chang'an Town"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+86-13192267509",
            "contactType": "customer service",
            "availableLanguage": ["English", "Chinese"],
            "email": "sales@bestglitter.com"
          },
          "areaServed": [
            { "@type": "Country", "name": "Vietnam" },
            { "@type": "Country", "name": "Thailand" },
            { "@type": "Country", "name": "Malaysia" },
            { "@type": "Country", "name": "Indonesia" },
            { "@type": "Country", "name": "Singapore" },
            { "@type": "Country", "name": "United States" },
            { "@type": "Country", "name": "United Kingdom" },
            { "@type": "Country", "name": "Germany" }
          ],
          "product": [
            { "@type": "Product", "name": "Hot Stamping Foil" },
            { "@type": "Product", "name": "Cold Foil" },
            { "@type": "Product", "name": "Digital Foil" },
            { "@type": "Product", "name": "Pigment Foil" },
            { "@type": "Product", "name": "Holographic Foil" }
          ],
          "keywords": "hot stamping foil, cold foil, digital foil, pigment foil, holographic foil, metallic foil, Vietnam, Southeast Asia, packaging, leather, plastic, digital printing",
          "makesOffer": {
            "@type": "OfferCatalog",
            "name": "PINTE Product Catalog",
            "itemListElement": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Product",
                  "name": "PK Brown Back Series",
                  "description": "Hot stamping foil for rough surfaces with excellent coverage and stampability"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Product",
                  "name": "PC Plastic/Cold Foils",
                  "description": "Specialized foils for plastic materials with excellent alcohol resistance"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Product",
                  "name": "PL/PY Pigment Foils",
                  "description": "Non-aluminized pigment-based foils with pure, full colors"
                }
              }
            ]
          }
          })}
        </script>
      )}
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
  const siteUrl = 'https://www.pintecl.com';
  
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
    "url": "https://www.pintecl.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.pintecl.com/blog?search={search_term_string}"
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
    "url": "https://www.pintecl.com",
    "logo": "https://www.pintecl.com/logo.png",
    "description": "Premium hot stamping foil manufacturer",
    "sameAs": [
      "https://facebook.com/pinte",
      "https://twitter.com/pinte",
      "https://linkedin.com/company/pinte",
      "https://instagram.com/pinte"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+86-13192267509",
      "contactType": "customer service",
      "availableLanguage": ["English", "Chinese"]
    }
  };
};

export default SEOMeta;
