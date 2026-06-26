
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ItemDetailView from '../components/ItemDetailView';
import { useLanguage } from '../contexts/LanguageContext';
import { ProductId, CatalogItem } from '../types';
import SEOMeta from '../components/SEOMeta';

const ProductItem: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { content, ui, lang } = useLanguage();
  const navigate = useNavigate();

  // Find item
  let selectedItem: CatalogItem | undefined;
  let selectedSeriesId: ProductId | undefined;
  for (const catId of Object.keys(content.CATALOG_DATA)) {
      const found = content.CATALOG_DATA[catId as ProductId].find(i => i.id === id);
      if (found) {
          selectedItem = found;
          selectedSeriesId = catId as ProductId;
          break;
      }
  }

  if (!selectedItem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Product Not Found</h2>
          <button onClick={() => navigate('/products')} className="mt-4 text-pinte-blue underline">Back to Catalog</button>
        </div>
      </div>
    );
  }

  const description = selectedItem.content || selectedItem.description;
  const selectedSeries = selectedSeriesId ? content.PRODUCT_DATA[selectedSeriesId] : undefined;
  const canonicalUrl = `/${lang}/products/item/${selectedItem.id}`;
  const keywords = [
    selectedItem.name,
    selectedItem.subtitle,
    ...(selectedItem.tags || []),
    'hot stamping foil',
    'PINTE',
    'Dongguan China',
  ].filter(Boolean) as string[];

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: selectedItem.name,
    description,
    image: selectedItem.image,
    brand: {
      '@type': 'Brand',
      name: 'PINTE',
    },
    manufacturer: {
      '@type': 'Organization',
      name: 'Dongguan Best Craftwork Products Co., Ltd.',
      url: 'https://www.pintecl.com',
    },
    category: selectedItem.subtitle || 'Hot Stamping Foil',
    material: selectedItem.tags?.join(', '),
    url: `https://www.pintecl.com${canonicalUrl}`,
    additionalProperty: [
      ...(selectedItem.params || selectedSeries?.params || []).map((param) => ({
        '@type': 'PropertyValue',
        name: param.label,
        value: param.value,
      })),
      ...(selectedItem.temp || selectedSeries?.temp
        ? [
            {
              '@type': 'PropertyValue',
              name: 'Recommended flat stamping temperature',
              value: (selectedItem.temp || selectedSeries?.temp)?.flat,
            },
            {
              '@type': 'PropertyValue',
              name: 'Recommended round stamping temperature',
              value: (selectedItem.temp || selectedSeries?.temp)?.round,
            },
          ]
        : []),
      ...(selectedSeries?.substrates?.length
        ? [{
            '@type': 'PropertyValue',
            name: 'Compatible substrates',
            value: selectedSeries.substrates.join(', '),
          }]
        : []),
      ...((selectedItem.applications || selectedSeries?.applications)?.length
        ? [{
            '@type': 'PropertyValue',
            name: 'Typical applications',
            value: (selectedItem.applications || selectedSeries?.applications || []).join(', '),
          }]
        : []),
      {
        '@type': 'PropertyValue',
        name: 'Sample and quotation policy',
        value: 'Color cards, sample rolls, slitting options, and substrate-based model recommendations are available before bulk orders.',
      },
    ],
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'USD',
      url: `https://www.pintecl.com/${lang}/quote`,
    },
  };

  return (
    <>
      <SEOMeta
        title={`${selectedItem.name} | PINTE Hot Stamping Foil`}
        description={description.slice(0, 155)}
        keywords={keywords}
        image={selectedItem.image}
        url={canonicalUrl}
        locale={lang === 'cn' ? 'zh_CN' : 'en_US'}
        canonicalUrl={canonicalUrl}
      />
      <script type="application/ld+json">
        {JSON.stringify(productSchema)}
      </script>
      <ItemDetailView
        item={selectedItem}
        onBack={() => navigate(-1)}
        ui={ui}
      />
    </>
  );
};

export default ProductItem;
