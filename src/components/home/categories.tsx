'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/contexts/language-context';
import type { Category } from '@/utils/supabase/types';

interface CategoryGridProps {
  categories: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  const { t } = useLanguage();

  // Default categories if none are provided
  const displayCategories =
    categories.length > 0
      ? categories
      : [
          { name: 'Food & Provisions', count: 0 },
          { name: 'Safety Equipment', count: 0 },
          { name: 'Medical Supplies', count: 0 },
          { name: 'Technical Parts', count: 0 },
        ];

  return (
    <section className="px-6 py-12 md:py-16">
      <div className="mx-auto max-w-7xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center text-2xl font-bold md:text-3xl"
        >
          {t('browse_categories') || 'Browse Categories'}
        </motion.h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {displayCategories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group overflow-hidden rounded-lg bg-white shadow-md transition-all hover:shadow-lg dark:bg-gray-700"
            >
              <Link href={`/catalog?category=${encodeURIComponent(category.name)}`}>
                <div className="relative h-40 w-full overflow-hidden bg-gray-200 dark:bg-gray-600">
                  <Image
                    src={`/images/img-placeholder.webp`}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                    {t(category.name.toLowerCase().replace(/\s+/g, '_')) || category.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                    {category.count} {t('products') || 'products'}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
