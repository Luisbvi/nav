'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/language-context';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { Input } from '../ui/input';
import { useRouter } from 'next/navigation';

export default function HeroSection() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const router = useRouter();

  return (
    <section className="relative">
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
            <form
              onSubmit={(e) => {
                e.preventDefault();
                router.push(`catalog?search=${search}&page=1`);
              }}
              className="relative flex-1"
            >
              <Search className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400" />
              <Input
                type="search"
                name="search"
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('search_products') || 'Search products...'}
                className="pl-10 dark:bg-gray-700"
                defaultValue={''}
              />
              <button type="submit" className="sr-only">
                {t('search') || 'Search'}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
