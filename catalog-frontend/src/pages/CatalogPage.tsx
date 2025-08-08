// src/pages/CatalogPage.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface Product {
  id: number;
  name: string;
  description: string;
  images: string[];
  productType: { name: string };
}

type ProductType = { id: number; name: string };

const CatalogPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [types, setTypes] = useState<ProductType[]>([]);
  const [activeType, setActiveType] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get<Product[]>('http://localhost:5001/api/products');
        setProducts(res.data);
      } catch {
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // fetch product types (for filter bar)
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get<ProductType[]>('http://localhost:5001/api/products/types');
        setTypes(res.data);
      } catch {
        // silently ignore; filter bar just won't show extra types
      }
    })();
  }, []);

  // group products by type
  const grouped = products.reduce((acc: Record<string, Product[]>, p) => {
    const type = p.productType?.name ?? 'Other';
    (acc[type] ||= []).push(p);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-600 text-lg animate-pulse">
        Loading products...
      </div>
    );
  }
  if (error) {
    return <div className="text-red-500 text-center py-10">{error}</div>;
  }

  // Map product name -> local image in /public (fallback to first image/url if present)
  const localSrc = (p: Product) => {
    const name = p.name.toLowerCase();
    if (name.includes('burger')) return '/burger.jpg';
    if (name.includes('pizza')) return '/pizza.jpg';
    if (name.includes('t-shirt') || name.includes('shirt')) return '/tshirt.jpg';
    if (name.includes('jeans')) return '/denims.jpg';
    if (name.includes('earbud')) return '/earbuds.jpg';
    if (name.includes('iphone')) return '/iphone.jpg';
    return p.images?.[0] || '/vite.svg';
  };

  // derive which groups to show based on activeType
  const visibleTypes = Object.keys(grouped).filter(
    (t) => activeType === 'All' || t === activeType
  );

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-6 text-center text-gray-900">
          Explore Printfuse Catalog
        </h1>

        {/* Type filter bar */}
        <div className="mb-8 flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => setActiveType('All')}
            className={`px-4 py-2 rounded-full border ${
              activeType === 'All'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          {types.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveType(t.name)}
              className={`px-4 py-2 rounded-full border ${
                activeType === t.name
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* Product sections */}
        {visibleTypes.map((type) => (
          <section key={type} className="mb-14">
            <h2 className="text-2xl font-semibold text-indigo-700 mb-6 border-b pb-2">
              {type}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
              {grouped[type].map((product) => (
                <article
                  key={product.id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-4 flex flex-col h-full hover:-translate-y-0.5"
                >
                  {/* Image area with fixed height and object-contain so full image is visible */}
                  <div className="w-full h-72 bg-gray-100 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
                    <img
                      src={localSrc(product)}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain"
                      loading="lazy"
                    />
                  </div>

                  <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
                  <p className="text-sm text-gray-600 mt-1 flex-grow">
                    {product.description}
                  </p>

                  <Link
                    to={`/product/${product.id}`}
                    className="mt-4 inline-block text-center bg-indigo-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                  >
                    View Details
                  </Link>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default CatalogPage;