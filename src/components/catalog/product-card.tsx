'use client';

import { Product } from '@/utils/supabase/types';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Minus, Plus, ShoppingCart, Star } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useCart } from '@/contexts/cart-context';
import { useLanguage } from '@/contexts/language-context';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { t } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    const favoriteProducts = JSON.parse(localStorage.getItem('favoriteProducts') || '[]');
    setIsFavorite(favoriteProducts.includes(product.id));
  }, [product.id]);

  const handleFavorite = () => {
    const newFavoriteStatus = !isFavorite;
    setIsFavorite(newFavoriteStatus);

    const favoriteProducts = JSON.parse(localStorage.getItem('favoriteProducts') || '[]');

    if (newFavoriteStatus) {
      if (!favoriteProducts.includes(product.id)) {
        favoriteProducts.push(product.id);
      }
    } else {
      const index = favoriteProducts.indexOf(product.id);
      if (index > -1) {
        favoriteProducts.splice(index, 1);
      }
    }

    localStorage.setItem('favoriteProducts', JSON.stringify(favoriteProducts));
  };

  const handleAddToCart = () => {
    setIsAddingToCart(true);
    addItem({
      id: product.id,
      unit: product.unit,
      name: product.name,
      price: product.price,
      image: product.image_url || '',
      quantity,
    });

    setTimeout(() => {
      setQuantity(1);
      setIsAddingToCart(false);
    }, 2000);
  };

  const discount = product.discount;
  const finalPrice = discount > 0 ? (1 - discount / 100) * product.price : product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="group relative h-full overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800 dark:hover:shadow-lg"
    >
      {/* Discount Badge */}
      {discount > 0 && (
        <motion.div
          initial={{ x: 50 }}
          animate={{ x: 0 }}
          className="absolute top-2 right-2 z-10 rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white sm:top-3 sm:right-3 dark:bg-red-500"
        >
          -{discount}%
        </motion.div>
      )}

      {/* Favorite Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="absolute top-2 left-2 z-10 rounded-full bg-white/80 p-1 shadow-sm sm:top-3 sm:left-3 dark:bg-gray-700"
        onClick={handleFavorite}
        aria-label={
          isFavorite
            ? t('remove_from_favorites') || 'Remove from favorites'
            : t('add_to_favorites') || 'Add to favorites'
        }
      >
        <Star
          className={cn(
            'h-4 w-4 transition-colors sm:h-5 sm:w-5',
            isFavorite
              ? 'fill-yellow-500 text-yellow-500 dark:fill-yellow-400 dark:text-yellow-400'
              : 'text-gray-500 dark:text-gray-400'
          )}
        />
      </motion.button>

      {/* Product Image */}
      <div className="p-4 sm:p-6">
        <Link href={`/product/${product.id}`} className="relative block pb-[100%]">
          <Image
            src={product.image_url || '/images/img-placeholder.webp'}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            className="rounded-lg object-contain transition-transform duration-300 group-hover:scale-105"
            priority
          />
        </Link>
      </div>

      {/* Product Details */}
      <div className="p-3 sm:p-4">
        <div className="mb-2">
          <span className="text-xs text-gray-500 sm:text-sm dark:text-gray-300">
            {t(product.category.toLowerCase().replace(/\s+/g, '_')) || product.category}
          </span>
          <Link href={`/product/${product.id}`}>
            <h3 className="line-clamp-2 text-sm font-medium text-gray-900 transition-colors hover:text-blue-600 sm:text-base dark:text-gray-100 dark:hover:text-blue-400">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price Section */}
        <div className="mb-2 flex items-center sm:mb-3">
          <span className="text-base font-bold text-gray-900 sm:text-lg dark:text-gray-100">
            {finalPrice.toFixed(2)}$
          </span>
          {discount > 0 && (
            <span className="ml-1 text-xs text-gray-500 line-through sm:ml-2 sm:text-sm dark:text-gray-300">
              {product.price.toFixed(2)}$
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="mb-3 flex items-center">
          <span
            className={cn(
              'inline-flex items-center text-xs',
              product.stock > 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-gray-400 dark:text-gray-300'
            )}
          >
            <span
              className={cn(
                'mr-1 size-2 rounded-full',
                product.stock > 0
                  ? 'bg-green-600 dark:bg-green-400'
                  : 'bg-gray-400 dark:bg-gray-300'
              )}
            />
            {product.stock > 0 ? t('in_stock') || 'In Stock' : t('out_of_stock') || 'Out of Stock'}
          </span>
        </div>

        {/* Quantity and Add to Cart */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
          <div className="flex items-center rounded-md border dark:border-gray-300">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              disabled={quantity <= 1}
              className="cursor-pointer px-2 py-1 text-gray-600 disabled:opacity-50 dark:text-gray-200"
              aria-label={t('decrease_quantity') || 'Decrease quantity'}
            >
              <Minus className="size-3 sm:size-4" />
            </motion.button>
            <span className="min-w-[20px] px-1 py-1 text-center text-xs sm:min-w-[30px] sm:px-2 sm:text-sm">
              {quantity}
              <span className="mx-1 text-gray-400 sm:mx-2 dark:text-gray-500">{product.unit}</span>
            </span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setQuantity((prev) => prev + 1)}
              disabled={product.stock <= quantity}
              className="cursor-pointer px-2 py-1 text-gray-600 disabled:opacity-50 dark:text-gray-200"
              aria-label={t('increase_quantity') || 'Increase quantity'}
            >
              <Plus className="size-3 sm:size-4" />
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={product.stock <= 0 || isAddingToCart}
            onClick={handleAddToCart}
            className={cn(
              'flex items-center justify-center gap-1 rounded-md py-2 text-sm font-medium text-white transition-colors sm:flex-1 sm:py-2 sm:text-base',
              product.stock > 0
                ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                : 'cursor-not-allowed bg-gray-400'
            )}
          >
            <AnimatePresence mode="wait">
              {isAddingToCart ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center"
                >
                  <Check className="mr-1 size-3 sm:size-4" />
                  {t('added') || 'Added'}
                </motion.div>
              ) : (
                <motion.div
                  key="add"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center"
                >
                  <ShoppingCart className="mr-1 size-3 sm:size-4" />
                  {t('add_to_cart') || 'Add to Cart'}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
