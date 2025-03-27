'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';

export default function EmptyCart() {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-6 rounded-full bg-gray-100 p-6 dark:bg-gray-800"
      >
        <ShoppingCart className="h-12 w-12 text-gray-400 dark:text-gray-500" />
      </motion.div>

      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100"
      >
        {t('empty_cart_title') || 'Your cart is empty'}
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-8 max-w-md text-gray-500 dark:text-gray-400"
      >
        {t('empty_cart_message') ||
          "Looks like you haven't added any products to your cart yet. Browse our catalog to find products you'll love."}
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Link href="/catalog">
          <Button className="dark:blue:bg-indigo-600 cursor-pointer bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500">
            {t('browse_products') || 'Browse Products'}
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  );
}
