'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCart } from '@/contexts/cart-context';
import type { CartItem as CartItemType } from '@/types';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { t } = useLanguage();
  const { updateQuantity, removeItem } = useCart();
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      removeItem(item.id);
    }, 300);
  };

  return (
    <motion.div
      className={`relative flex items-start gap-4 ${isRemoving ? 'opacity-50' : ''}`}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative h-24 w-24 overflow-hidden rounded-md not-dark:shadow">
        <Image
          src={item.image || '/images/img-placeholder.webp'}
          alt={item.name}
          fill
          sizes="96px"
          className="object-contain p-2"
        />
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex justify-between">
          <div>
            <Link href={`/product/${item.id}`}>
              <h3 className="font-medium text-gray-900 hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400">
                {item.name}
              </h3>
            </Link>

            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-200">
              {t('price_format', { price: item.price.toFixed(2) }) || `$${item.price.toFixed(2)}`}
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-pointer text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            onClick={handleRemove}
            aria-label={t('remove_item') || 'Remove item'}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">{t('remove_item') || 'Remove'}</span>
          </Button>
        </div>

        <div className="mt-2 flex items-center">
          <div className="flex w-20 items-center gap-2">
            <Select
              value={item.quantity?.toString()}
              onValueChange={(value) => updateQuantity(item.id, Number.parseInt(value))}
              aria-label={t('select_quantity') || 'Select quantity'}
            >
              <SelectTrigger className="h-8 border-gray-200 dark:border-gray-700">
                <SelectValue placeholder={t('quantity') || 'Quantity'} />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-gray-400 dark:text-gray-500">{item.unit}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
