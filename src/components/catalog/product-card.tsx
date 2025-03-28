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

  // Effect to load favorite status from localStorage
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

  const discount = 10;
  const finalPrice = discount ? (1 - discount / 100) * product.price : product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="group relative overflow-hidden rounded-lg bg-white not-dark:shadow-md dark:bg-gray-800"
    >
      {/* Discount */}
      {discount && (
        <motion.div
          initial={{ x: 50 }}
          animate={{ x: 0 }}
          className="absolute top-3 right-3 z-10 rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white dark:bg-red-500"
        >
          -{discount}%
        </motion.div>
      )}

      {/* Favorite */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="absolute top-3 left-3 z-10 cursor-pointer rounded-full bg-white/80 p-1.5 not-dark:shadow-sm dark:bg-gray-700"
        onClick={handleFavorite}
        aria-label={
          isFavorite
            ? t('remove_from_favorites') || 'Remove from favorites'
            : t('add_to_favorites') || 'Add to favorites'
        }
      >
        <Star
          className={cn(
            'h-5 w-5 transition-colors',
            isFavorite
              ? 'fill-yellow-500 text-yellow-500 dark:fill-yellow-400 dark:text-yellow-400'
              : 'text-gray-500 dark:text-gray-400'
          )}
        />
      </motion.button>

      {/* Rest of the component remains the same */}
      <div className="p-6">
        {/* Image */}
        <Link href={`/product/${product.id}`} className="relative block pb-[100%]">
          <Image
            src={product.image_url || '/images/img-placeholder.webp'}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 80vw, (max-width: 1200px) 20vw, 10vw"
            className="rounded-lg object-contain transition-transform duration-300 group-hover:scale-105"
            priority
          />
        </Link>
      </div>

      {/* Details */}
      <div className="p-4">
        <div className="mb-2">
          <span className="text-sm text-gray-500 dark:text-gray-300">
            {t(product.category.toLowerCase().replace(/\s+/g, '_')) || product.category}
          </span>
          <Link href={`/product/${product.id}`}>
            <h3 className="line-clamp-2 font-medium text-gray-900 transition-colors hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price */}
        <div className="mb-3 flex items-center">
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {finalPrice.toFixed(2)}$
          </span>
          {discount && (
            <span className="ml-2 text-sm text-gray-500 line-through dark:text-gray-300">
              {product.price.toFixed(2)}$
            </span>
          )}
        </div>

        {/* Stock */}
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
            ></span>
            {product.stock > 0 ? t('in_stock') || 'In Stock' : t('out_of_stock') || 'Out of Stock'}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border dark:border-gray-300">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setQuantity((prev) => prev - 1)}
              disabled={product.stock <= 1}
              className="cursor-pointer px-2 py-1 text-gray-600 disabled:opacity-50 dark:text-gray-200"
              aria-label={t('decrease_quantity') || 'Decrease quantity'}
            >
              <Minus className="size-4" />
            </motion.button>
            <span className="min-w-[30px] px-2 py-1 text-center">{quantity}</span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setQuantity((prev) => prev + 1)}
              disabled={product.stock <= quantity}
              className="cursor-pointer px-2 py-1 text-gray-600 disabled:opacity-50 dark:text-gray-200"
              aria-label={t('increase_quantity') || 'Increase quantity'}
            >
              <Plus className="size-4" />
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={product.stock <= quantity || isAddingToCart}
            onClick={handleAddToCart}
            className={cn(
              'flex flex-1 items-center justify-center gap-1 rounded-md py-2 font-medium text-white transition-colors',
              product.stock > 0
                ? 'cursor-pointer bg-blue-600 hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600'
                : 'cursor-not-allowed bg-gray-400'
            )}
          >
            <AnimatePresence mode="wait">
              {isAddingToCart ? (
                <motion.div
                  key={'loading'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center"
                >
                  <Check className="mr-1 size-4" />
                  {t('added') || 'Added'}
                </motion.div>
              ) : (
                <motion.div
                  key={'add'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center"
                >
                  <ShoppingCart className="mr-1 size-4" />
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
