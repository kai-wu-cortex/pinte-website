
import React from 'react';
import ProductShowcase from '../components/ProductShowcase';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import SEOMeta from '../components/SEOMeta';

const ProductCatalog: React.FC = () => {
  const { content, ui, lang } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="pt-20"> {/* Add padding for fixed header */}
      <SEOMeta
        title={lang === 'cn' ? '产品目录 - PINTE品特烫金箔' : 'Product Catalog - PINTE Hot Stamping Foils'}
        description={lang === 'cn'
          ? 'PINTE品特专业烫金箔产品目录，包括PK粗面烫金箔、PC塑胶烫金箔、PLPY颜料烫金箔等系列产品，满足包装、皮革、塑胶、数码烫金等各种应用需求。'
          : 'Complete product catalog of PINTE hot stamping foils including PK series for rough surfaces, PC series for plastics, PL/PY pigment foils for various packaging, leather, plastic and digital printing applications.'
        }
        keywords={lang === 'cn'
          ? ['产品目录', '烫金箔', 'PK系列', 'PC系列', 'PLPY颜料箔', '包装烫金', '皮革烫金', '塑胶烫金', 'PK粗面烫金箔规格', 'PC塑胶烫金箔定制', 'PLPY颜料箔厂家', '包装印刷专用烫金箔', '皮革烫金膜批发', '塑胶制品烫金箔', '数码烫金用颜料箔', '品特PINTE烫金箔产品目录', '东莞烫金箔全系列产品', '东南亚适用烫金箔型号']
          : ['product catalog', 'hot stamping foil', 'PK series', 'PC series', 'pigment foil', 'packaging', 'leather', 'plastic', 'PK series hot stamping foil for rough surfaces', 'PC series foil for plastic applications', 'PL/PY pigment foil for digital printing', 'hot stamping foil for leather packaging', 'PINTE hot stamping foil full catalog', 'custom hot stamping foil for Southeast Asia markets']
        }
        type="website"
        locale={lang === 'cn' ? 'zh_CN' : 'en_US'}
        canonicalUrl={`/${lang}/products`}
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
