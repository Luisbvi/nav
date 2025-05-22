'use client';

import { createClient } from '@/utils/supabase/client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import NotFound from '../not-found';
import Breadcrumb from '@/components/product/breadcrumb';
import ProductGallery from '@/components/product/product-gallery';
import ProductDetails from '@/components/product/product-details';
import ProductTab from '@/components/product/product-tab';
import { Product } from '@/types';
import { useLanguage } from '@/contexts/language-context';

const ProductPage = () => {
  const { language } = useLanguage();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const supabase = createClient();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Use params.id instead of searchParams
        const productId = params.id;

        if (!productId) {
          throw new Error('No product ID provided');
        }

        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (error) throw error;

        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  // Loading state
  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  // Error or not found state
  if (error || !product) {
    return <NotFound />;
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Catalog', href: '/catalog' },
    {
      label: product.info[language].name.toUpperCase(),
      href: `/product/${product.id}`,
      current: true,
    },
  ];

  const specifications = [
    { name: 'Category', value: product.category },
    { name: 'Stock', value: `${product.stock} units` },
    { name: 'Unit', value: product.unit || 'N/A' },
    { name: 'ID', value: product.id },
  ];

  return (
    <div className="flex flex-col">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="mt-8 grid gap-10 md:grid-cols-2">
          <ProductGallery
            imageUrl={product.image_url || '/images/img-placeholder.webp'}
            productName={product.info[language].name}
          />
          <ProductDetails product={product} />
        </div>

        <div className="mt-16">
          <ProductTab product={product} specifications={specifications} />
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            If you need more information about this product, please contact us.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
