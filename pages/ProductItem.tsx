
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ItemDetailView from '../components/ItemDetailView';
import { useLanguage } from '../contexts/LanguageContext';
import { ProductId, CatalogItem } from '../types';
import SEOMeta from '../components/SEOMeta';
import { mergeProductSeoProfile } from '../data/productSeoProfiles';

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

  const enrichedItem = mergeProductSeoProfile(selectedItem, lang === 'cn' ? 'cn' : 'en');
  const description = enrichedItem.content || enrichedItem.description;
  const selectedSeries = selectedSeriesId ? content.PRODUCT_DATA[selectedSeriesId] : undefined;
  const canonicalUrl = `/${lang}/products/item/${enrichedItem.id}`;
  const keywords = [
    enrichedItem.name,
    enrichedItem.subtitle,
    ...(enrichedItem.tags || []),
    ...(enrichedItem.compatibleSubstrates || []),
    ...(enrichedItem.colors || []),
    'hot stamping foil',
    'PINTE',
    'Dongguan China',
  ].filter(Boolean) as string[];

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: enrichedItem.name,
    description,
    image: enrichedItem.image,
    brand: {
      '@type': 'Brand',
      name: 'PINTE',
    },
    manufacturer: {
      '@type': 'Organization',
      name: 'PINTE 品特',
      legalName: 'Dongguan Best Craftwork Products Co., Ltd.',
      url: 'https://www.pintecl.com',
      logo: 'https://www.pintecl.com/logo.svg',
    },
    category: enrichedItem.subtitle || 'Hot Stamping Foil',
    material: enrichedItem.compatibleSubstrates?.join(', ') || enrichedItem.tags?.join(', '),
    url: `https://www.pintecl.com${canonicalUrl}`,
    additionalProperty: [
      ...(enrichedItem.params || selectedSeries?.params || []).map((param) => ({
        '@type': 'PropertyValue',
        name: param.label,
        value: param.value,
      })),
      ...(enrichedItem.temp || selectedSeries?.temp
        ? [
            {
              '@type': 'PropertyValue',
              name: 'Recommended flat stamping temperature',
              value: (enrichedItem.temp || selectedSeries?.temp)?.flat,
            },
            {
              '@type': 'PropertyValue',
              name: 'Recommended round stamping temperature',
              value: (enrichedItem.temp || selectedSeries?.temp)?.round,
            },
          ]
        : []),
      ...(enrichedItem.compatibleSubstrates?.length
        ? [{
            '@type': 'PropertyValue',
            name: 'Compatible substrates',
            value: enrichedItem.compatibleSubstrates.join(', '),
          }]
        : []),
      ...(enrichedItem.colors?.length
        ? [{
            '@type': 'PropertyValue',
            name: 'Colors and effects',
            value: enrichedItem.colors.join(', '),
          }]
        : []),
      ...(enrichedItem.processes?.length
        ? [{
            '@type': 'PropertyValue',
            name: 'Supported processes',
            value: enrichedItem.processes.join(', '),
          }]
        : []),
      ...(enrichedItem.qualityTests?.length
        ? [{
            '@type': 'PropertyValue',
            name: 'Quality tests',
            value: enrichedItem.qualityTests.join(', '),
          }]
        : []),
      ...(enrichedItem.technicalParameters?.length
        ? enrichedItem.technicalParameters.map((param) => ({
            '@type': 'PropertyValue',
            name: param.label,
            value: param.value,
          }))
        : []),
      ...(selectedSeries?.substrates?.length
        ? [{
            '@type': 'PropertyValue',
            name: 'Series substrates',
            value: selectedSeries.substrates.join(', '),
          }]
        : []),
      ...((enrichedItem.applications || selectedSeries?.applications)?.length
        ? [{
            '@type': 'PropertyValue',
            name: 'Typical applications',
            value: (enrichedItem.applications || selectedSeries?.applications || []).join(', '),
          }]
        : []),
      {
        '@type': 'PropertyValue',
        name: 'Sample and quotation policy',
        value: enrichedItem.samplePolicy || 'Color cards, sample rolls, slitting options, and substrate-based model recommendations are available before bulk orders.',
      },
      {
        '@type': 'PropertyValue',
        name: 'MOQ',
        value: enrichedItem.moq || 'MOQ depends on color, finish, roll width, and customization scope.',
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
        title={`${enrichedItem.name} | PINTE Hot Stamping Foil`}
        description={description.slice(0, 155)}
        keywords={keywords}
        image={enrichedItem.image}
        url={canonicalUrl}
        locale={lang === 'cn' ? 'zh_CN' : 'en_US'}
        canonicalUrl={canonicalUrl}
      />
      <script type="application/ld+json">
        {JSON.stringify(productSchema)}
      </script>
      <ItemDetailView
        item={enrichedItem}
        onBack={() => navigate(-1)}
        ui={ui}
      />
    </>
  );
};

export default ProductItem;
