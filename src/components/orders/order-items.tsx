'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Order, Product } from '@/types';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/cart-context';
import { useLanguage } from '@/contexts/language-context';
import { createClient } from '@/utils/supabase/client';

interface OrderItemsProps {
  order: Order;
}

export default function OrderItems({ order }: OrderItemsProps) {
  const { t } = useLanguage();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [buyingAgain, setBuyingAgain] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchProducts = async () => {
      const supabase = createClient();

      try {
        const uniqueProductIds = [...new Set(order.items?.map((item) => item.id))];
        const { data: productData, error } = await supabase
          .from('products')
          .select('*')
          .in('id', uniqueProductIds);

        if (error) throw error;
        if (productData) setProducts(productData);
      } catch (error) {
        console.error('Error fetching products', error);
      }
    };

    fetchProducts();
  }, [order.items]);

  const handleBuyAgain = (item: Product) => {
    setBuyingAgain((prev) => ({ ...prev, [item.id]: true }));
    addItem({
      id: item.id,
      image: item.image_url || '/images/img-placeholder.webp',
      name: item.info['en'].name,
      price: item.price,
      quantity: order.items?.find((i) => i.id == item.id)?.quantity || 1,
      unit: item.unit,
    });

    setTimeout(() => {
      setBuyingAgain((prev) => ({ ...prev, [item.id]: false }));
    }, 2000);
  };

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {products.map((product) => {
        const price = `${order.payment_method === 'card' ? '$' : 'Bs.'}  ${order.total.toFixed(2)}`;
        return (
          <div key={product.id} className="p-4 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-700">
                <Image
                  src={product.image_url || '/images/img-placeholder.webp'}
                  alt={product.info['en'].name}
                  fill
                  className="object-contain p-2"
                  sizes="128px"
                />
              </div>

              <div className="flex flex-1 flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {product.info['en'].name}
                  </h3>
                  <p className="line-clamp-3 text-sm text-gray-500 dark:text-gray-400">
                    {product.info['en'].description ||
                      t('no_description') ||
                      'No description available for this product.'}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-gray-100">{price}</span>
                </div>
              </div>

              <div className="flex flex-col items-end justify-between">
                <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {price}
                </span>

                <div className="mt-4 flex flex-col gap-2">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link href={`/product/${product.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full cursor-pointer dark:bg-gray-700 dark:hover:bg-gray-600"
                      >
                        {t('view_product') || 'View product'}
                      </Button>
                    </Link>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      size="sm"
                      className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:text-gray-100 dark:hover:bg-blue-600"
                      onClick={() => handleBuyAgain(product)}
                      disabled={buyingAgain[product.id]}
                    >
                      {buyingAgain[product.id]
                        ? t('added_to_cart') || 'Added to cart'
                        : t('buy_again') || 'Buy again'}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
