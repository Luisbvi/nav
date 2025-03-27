'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';
import { Search } from 'lucide-react';

export default function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative md:py-24">
      <div className="mx-auto max-w-4xl text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 text-3xl font-bold md:text-5xl"
        >
          {t('hero_title') || 'Maritime Supplies Delivered to Your Port'}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-10 text-lg md:text-xl"
        >
          {t('hero_subtitle') || 'Find everything your vessel needs in one place'}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mx-auto max-w-md"
        >
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="search"
              className="block w-full rounded-lg border border-gray-300 bg-white p-4 pl-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              placeholder={t('search_products') || 'Search for products...'}
            />
            <Link href="/#">
              <Button className="absolute right-2.5 bottom-2.5 cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none dark:bg-blue-500 dark:hover:bg-blue-600">
                {t('search') || 'Search'}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
