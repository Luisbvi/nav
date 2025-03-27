import { createClient } from '@/utils/supabase/server';
import React from 'react';
import NotFound from '../not-found';
import Breadcrumb from '@/components/product/breadcrumb';
import ProductGallery from '@/components/product/product-gallery';
import ProductDetails from '@/components/product/product-details';
import ProductTab from '@/components/product/product-tab';

interface pageProps {
  params: {
    id: string;
  };
}

const ProductPage = async ({ params }: pageProps) => {
  const supabase = await createClient();
  const searchParams = await params;
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', searchParams.id)
    .single();

  if (error || !product) return <NotFound />;

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Catalog', href: '/catalog' },
    { label: product.name, href: `/product/${product.id}`, current: true },
  ];

  const specifications = [
    { name: 'Category', value: product.category },
    { name: 'Stock', value: `${product.stock} units` },
    { name: 'Unit', value: product.unit || 'N/A' },
    { name: 'ID', value: product.id },
  ];

  return (
    <div className="flex flex-col">
      <div className="container mx-auto flex-1 px-4 py-8"></div>
      <Breadcrumb items={breadcrumbItems} />

      <div className="grid gap-10 md:grid-cols-2">
        <ProductGallery imageUrl={product.image_url} productName={product.name} />
        <ProductDetails product={product} />
      </div>

      <div className="mt-16">
        <ProductTab product={product} specifications={specifications}></ProductTab>
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          If you need more information in this product, please contact us.
        </p>
      </div>
    </div>
  );
};

export default ProductPage;
