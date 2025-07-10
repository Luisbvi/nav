'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useLanguage } from '@/contexts/language-context';

interface Product {
  id: number;
  image_url: string;
  info: {
    [lang: string]: {
      name: string;
      description?: string;
    };
  };
}

export default function CategoryGrid() {
  const { t, language } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function loadProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('id, image_url, info')
        .eq('category', 'SERVICES');

      if (!error && data) {
        setProducts(data);
      }
    }

    loadProducts();
  }, []);

  return (
    <section className="px-6 py-12 md:py-16">
      <div className="mx-auto max-w-7xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center text-3xl font-bold md:text-5xl"
        >
          {t('browse_services') || 'Browse Services'}
        </motion.h2>

        {/* Scroll horizontal en móvil */}
        <div className="-mx-6 overflow-x-auto px-6 pb-4 md:hidden">
          <div className="flex w-max space-x-4">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="w-64 flex-shrink-0 overflow-hidden rounded-lg bg-white shadow-md transition-all hover:shadow-lg dark:bg-gray-700"
              >
                <Link href={`/product/${product.id}`}>
                  <div className="relative h-40 w-full overflow-hidden bg-gray-200 dark:bg-gray-600">
                    <Image
                      src={product.image_url || '/images/img-placeholder.webp'}
                      alt={product.info[language].name || 'Product Image'}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold dark:text-white">
                      {product.info[language].name}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Grid en desktop */}
        <div className="hidden grid-cols-1 gap-6 sm:grid-cols-2 md:grid lg:grid-cols-4">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="overflow-hidden rounded-lg bg-white shadow-md transition-all hover:shadow-lg dark:bg-gray-700"
            >
              <Link href={`/product/${product.id}`}>
                <div className="relative h-40 w-full overflow-hidden bg-gray-200 dark:bg-gray-600">
                  <Image
                    src={product.image_url || '/images/img-placeholder.webp'}
                    alt={product.info[language].name || 'Product Image'}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold dark:text-white">
                    {product.info[language].name}
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
