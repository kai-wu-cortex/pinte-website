
'use client';

import React, { useState, useEffect } from 'react';
import ProductShowcase from '../components/ProductShowcase';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate, useLocation } from 'react-router-dom';
import SEOMeta from '../components/SEOMeta';

const ProductCatalog: React.FC = () => {
  const { content, ui, lang } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Default to range view if URL is /products/foils
  const isFoilsRoute = location.pathname.endsWith('/foils');
  const [viewMode, setViewMode] = useState<'categories' | 'range'>(
    isFoilsRoute ? 'range' : 'categories'
  );

  // SEO config based on route
  const seo = isFoilsRoute ? (
    lang === 'cn'
      ? {
          title: '全部烫金颜色 - PINTE品特烫金箔色卡',
          description: '浏览 PINTE 全部烫金箔颜色，支持按系列和光泽度筛选，可以直观查看各种烫金箔颜色效果，快速选择适合您产品的颜色。',
          keywords: ['烫金颜色', '色卡', '烫金箔颜色', '烫金箔色卡', '颜色选择', '系列筛选', '光泽度筛选', 'PINTE全部颜色', '烫金箔颜色样本', '东莞烫金箔颜色', '定制烫金箔颜色', '东南亚烫金箔供应商'],
        }
      : {
          title: 'Complete Foil Color Range - PINTE Hot Stamping Foils',
          description: 'Browse complete PINTE hot stamping foil color range, filter by series and finish, visualize foil colors and select the perfect color for your product.',
          keywords: ['foil color range', 'foil color swatches', 'hot stamping foil colors', 'filter by series', 'filter by finish', 'complete foil catalog', 'PINTE foil colors', 'hot stamping foil color selection', 'Dongguan China foil manufacturer', 'custom foil colors'],
        }
  ) : (
    lang === 'cn'
      ? {
          title: '产品目录 - PINTE品特烫金箔',
          description: 'PINTE品特专业烫金箔产品目录，包括PK粗面烫金箔、PC塑胶烫金箔、PLPY颜料烫金箔等系列产品，满足包装、皮革、塑胶、数码烫金等各种应用需求。',
          keywords: ['产品目录', '烫金箔', 'PK系列', 'PC系列', 'PLPY颜料箔', '包装烫金', '皮革烫金', '塑胶烫金', 'PK粗面烫金箔规格', 'PC塑胶烫金箔定制', 'PLPY颜料箔厂家', '包装印刷专用烫金箔', '皮革烫金膜批发', '塑胶制品烫金箔', '数码烫金用颜料箔', '品特PINTE烫金箔产品目录', '东莞烫金箔全系列产品', '东南亚适用烫金箔型号'],
        }
      : {
          title: 'Product Catalog - PINTE Hot Stamping Foils',
          description: 'Complete product catalog of PINTE hot stamping foils including PK series for rough surfaces, PC series for plastics, PL/PY pigment foils for various packaging, leather, plastic and digital printing applications.',
          keywords: ['product catalog', 'hot stamping foil', 'PK series', 'PC series', 'pigment foil', 'packaging', 'leather', 'plastic', 'PK series hot stamping foil for rough surfaces', 'PC series foil for plastic applications', 'PL/PY pigment foil for digital printing', 'hot stamping foil for leather packaging', 'PINTE hot stamping foil full catalog', 'custom hot stamping foil for Southeast Asia markets'],
        }
  );

  return (
    <div className="pt-20"> {/* Add padding for fixed header */}
      <SEOMeta
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        type="website"
        locale={lang === 'cn' ? 'zh_CN' : 'en_US'}
        canonicalUrl={isFoilsRoute ? `/${lang}/products/foils` : `/${lang}/products`}
      />
      <ProductShowcase
        onBack={() => navigate(`/${lang}`)}
        products={content.PRODUCT_DATA}
        catalog={content.CATALOG_DATA}
        onItemClick={(id) => navigate(`/${lang}/products/item/${id}`)}
        ui={ui.products}
      />
    </div>
  );
};

export default ProductCatalog;
