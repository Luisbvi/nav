'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';
import ProductCard from '@/components/catalog/product-card';
import type { Product } from '@/utils/supabase/types';

interface FeaturedProductsProps {
  products: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  const { t } = useLanguage();

  return (
    <section className="px-4 py-8 sm:px-6 md:py-12 lg:py-16">
      <div className="mx-auto max-w-7xl">
        {/* Header section */}
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center sm:gap-0 md:mb-8">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold sm:text-2xl md:text-3xl"
          >
            {t('featured_products') || 'Featured Products'}
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/catalog" className="block">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                {t('view_all') || 'View All'}
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Empty state */}
        {products.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-8 text-center md:py-10"
          >
            <p className="text-gray-500 dark:text-gray-400">
              {t('no_products') || 'No products available'}
            </p>
          </motion.div>
        )}

        {/* Products grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6 lg:grid-cols-3 xl:gap-8">
          {products.slice(0, 3).map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                duration: 0.4,
                delay: index * 0.08,
                ease: 'easeOut',
              }}
              className="w-full"
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
