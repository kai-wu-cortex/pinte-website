
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ItemDetailView from '../components/ItemDetailView';
import { useLanguage } from '../contexts/LanguageContext';
import { ProductId, CatalogItem } from '../types';

const ProductItem: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { content, ui } = useLanguage();
  const navigate = useNavigate();

  // Find item
  let selectedItem: CatalogItem | undefined;
  for (const catId of Object.keys(content.CATALOG_DATA)) {
      const found = content.CATALOG_DATA[catId as ProductId].find(i => i.id === id);
      if (found) {
          selectedItem = found;
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

  return (
    <ItemDetailView 
      item={selectedItem} 
      onBack={() => navigate(-1)} 
      ui={ui} 
    />
  );
};

export default ProductItem;
