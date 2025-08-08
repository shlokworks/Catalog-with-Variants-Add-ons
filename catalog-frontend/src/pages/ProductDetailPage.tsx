// src/pages/ProductDetailPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

type Variant = {
  id: number;
  size?: string | null;
  color?: string | null;
  price: number;
  stock: number;
  sku: string;
};

type AddOn = {
  id: number;
  name: string;
  price: number;
};

type Product = {
  id: number;
  name: string;
  description: string;
  images: string[];
  productType: { name: string };
  variants: Variant[];
  addons: AddOn[];
};

const ProductDetailPage: React.FC = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // fetch product
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get<Product>(`http://localhost:5001/api/products/${id}`);
        setProduct(res.data);
        if (res.data.variants.length) {
          setSelectedVariantId(res.data.variants[0].id);
        }
      } catch {
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const selectedVariant = useMemo(
    () => product?.variants.find(v => v.id === selectedVariantId) ?? null,
    [product, selectedVariantId]
  );

  const toggleAddon = (addonId: number) => {
    setSelectedAddons(prev =>
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  const totalPrice = useMemo(() => {
    const base = selectedVariant?.price ?? 0;
    const addonsTotal =
      product?.addons
        .filter(a => selectedAddons.includes(a.id))
        .reduce((sum, a) => sum + a.price, 0) ?? 0;
    return base + addonsTotal;
  }, [product, selectedVariant, selectedAddons]);

  if (loading) {
    return <div className="text-center py-10 text-gray-600">Loading...</div>;
  }
  if (error || !product) {
    return (
      <div className="text-red-500 text-center py-10">
        {error || 'Product not found'}
      </div>
    );
  }

  // Local image mapping like in CatalogPage
  const localSrc = () => {
    const name = product.name.toLowerCase();
    if (name.includes('burger')) return '/burger.jpg';
    if (name.includes('pizza')) return '/pizza.jpg';
    if (name.includes('t-shirt') || name.includes('shirt')) return '/tshirt.jpg';
    if (name.includes('jeans')) return '/denims.jpg';
    if (name.includes('earbud')) return '/earbuds.jpg';
    if (name.includes('iphone')) return '/iphone.jpg';
    return product.images?.[0] || '/vite.svg';
  };

  const isFood = product.productType?.name?.toLowerCase() === 'food';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <Link
          to="/"
          className="text-indigo-600 hover:underline text-sm mb-4 inline-block"
        >
          ← Back to Catalog
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Image container */}
          <div className="w-full h-80 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            <img
              src={localSrc()}
              alt={product.name}
              className="max-h-full max-w-full object-contain"
              loading="lazy"
            />
          </div>

          {/* Details */}
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
            <p className="text-gray-600 mb-4">{product.description}</p>

            {/* Variants */}
            <div className="mb-4">
              <label className="block font-medium text-gray-700 mb-1">
                Choose Variant
              </label>
              <div className="space-y-2">
                {product.variants.map(variant => (
                  <label
                    key={variant.id}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="variant"
                      value={variant.id}
                      checked={selectedVariantId === variant.id}
                      onChange={() => setSelectedVariantId(variant.id)}
                    />
                    <span>
                      {variant.size || '—'}
                      {variant.color ? ` · ${variant.color}` : ''} — ₹
                      {variant.price.toFixed(2)}
                    </span>
                  </label>
                ))}
              </div>
              {selectedVariant && (
                <p className="mt-2 text-sm text-gray-500">
                  SKU: <span className="font-medium">{selectedVariant.sku}</span> · Stock:{' '}
                  <span className="font-medium">{selectedVariant.stock}</span>
                </p>
              )}
            </div>

            {/* Add-ons */}
            {isFood && product.addons.length > 0 && (
              <div className="mb-4">
                <label className="block font-medium text-gray-700 mb-1">
                  Add-ons
                </label>
                <div className="space-y-2">
                  {product.addons.map(addon => (
                    <label
                      key={addon.id}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAddons.includes(addon.id)}
                        onChange={() => toggleAddon(addon.id)}
                      />
                      <span>
                        {addon.name} — ₹{addon.price.toFixed(2)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="mt-6 text-lg font-semibold text-indigo-700">
              Total Price: ₹{totalPrice.toFixed(2)}
            </div>

            <button
              className="mt-4 bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition"
              disabled={!selectedVariant}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;