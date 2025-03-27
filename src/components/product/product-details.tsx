'use client';
import { Product } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Check, MinusCircle, PlusCircle, ShieldCheck, Truck } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/contexts/cart-context';
import { Separator } from '../ui/separator';
import { useLanguage } from '@/contexts/language-context';

interface ProductDetailsProps {
  product: Product;
}

const ProductDetails = ({ product }: ProductDetailsProps) => {
  const { t } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    setIsAddingToCart(true);

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url || '/images/img-placeholder.webp',
      quantity,
      unit: product.unit,
    });

    setTimeout(() => {
      setIsAddingToCart(false);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{product.name}</h1>

      <div className="mb-4 flex items-center gap-2">
        <Badge variant={'outline'} className="text-sm text-gray-500 dark:text-gray-300">
          {t(product.category.toLowerCase()) || product.category}
        </Badge>
        {product?.stock ? (
          <Badge
            variant={'secondary'}
            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
          >
            {t('in_stock') || 'In stock'}
          </Badge>
        ) : (
          <Badge
            variant={'secondary'}
            className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
          >
            {t('out_of_stock') || 'Out of stock'}
          </Badge>
        )}
      </div>

      <motion.div
        className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        {t('price_format', { price: product.price.toFixed(2) }) || `$${product.price.toFixed(2)}`}
      </motion.div>

      <motion.p
        className="mb-6 text-gray-700 dark:text-gray-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {product.description || t('no_description') || 'No description available for this product.'}
      </motion.p>

      <motion.div
        className="mb-8 flex flex-wrap items-center gap-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="flex items-center gap-3">
          <Button
            className="cursor-pointer"
            variant={'outline'}
            size={'icon'}
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            aria-label={t('decrease_quantity') || 'Decrease quantity'}
          >
            <MinusCircle className="size-4" />
          </Button>
          <span className="mx-4 dark:text-gray-200">
            {quantity}
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {product.unit ? t(product.unit.toLowerCase()) || product.unit : ''}
            </span>
          </span>
          <Button
            className="cursor-pointer"
            variant={'outline'}
            size={'icon'}
            onClick={() => setQuantity(quantity + 1)}
            disabled={quantity >= (product?.stock || 0)}
            aria-label={t('increase_quantity') || 'Increase quantity'}
          >
            <PlusCircle />
          </Button>
        </div>

        <Button
          className="relative cursor-pointer overflow-hidden bg-blue-500 px-8 hover:bg-blue-600 dark:bg-blue-600 dark:text-gray-100 dark:hover:bg-blue-700"
          onClick={handleAddToCart}
          disabled={!product?.stock || isAddingToCart}
        >
          <AnimatePresence mode="wait">
            {isAddingToCart ? (
              <motion.div
                key="added"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center"
              >
                <Check className="mr-2 h-5 w-5" />
                {t('added_to_cart') || 'Added to Cart'}
              </motion.div>
            ) : (
              <motion.div
                key="add"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {t('add_to_cart') || 'Add to Cart'}
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>

      <Separator className="my-6" />

      <motion.div
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <div className="flex items-center gap-3">
          <Truck className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <div>
            <h3 className="font-medium dark:text-gray-200">
              {t('delivery_to_port') || 'Delivery to Port'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('delivery_description') || 'Available for delivery to most major ports'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <div>
            <h3 className="font-medium dark:text-gray-200">
              {t('quality_guarantee') || 'Quality Guarantee'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('quality_description') || 'All products meet maritime standards'}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProductDetails;
