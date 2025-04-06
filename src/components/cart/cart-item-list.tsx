'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/contexts/language-context';
import CartItem from './cart-item';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/cart-context';
import type { CartItem as CartItemType } from '@/types';

interface CartItemListProps {
  items: CartItemType[];
}

export default function CartItemList({ items }: CartItemListProps) {
  const { t } = useLanguage();
  const { clearCart } = useCart();

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="rounded-lg bg-white shadow dark:bg-gray-800"
    >
      <div className="p-6">
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <CartItem item={item} />
              {index < items.length - 1 && <Separator className="my-4 dark:bg-gray-700" />}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="grid grid-cols-1 border-t border-gray-100 p-4 sm:grid-cols-2 dark:border-gray-700">
        <div className="sm:pr-2">
          <Link href="/catalog" className="block w-full">
            <Button
              variant="outline"
              className="w-full cursor-pointer dark:border-gray-600 dark:text-gray-300"
            >
              {t('continue_shopping') || 'Continue Shopping'}
            </Button>
          </Link>
        </div>
        <div className="sm:pl-2">
          <Button
            variant="ghost"
            className="w-full cursor-pointer text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
            onClick={clearCart}
          >
            {t('clear_cart') || 'Clear Cart'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
