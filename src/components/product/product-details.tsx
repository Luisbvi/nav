'use client';
import { Product } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Check, MinusCircle, PlusCircle, ShieldCheck, Truck, X } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/contexts/cart-context';
import { Separator } from '../ui/separator';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';

interface ProductDetailsProps {
  product: Product;
}

const ProductDetails = ({ product }: ProductDetailsProps) => {
  const { t, language } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addItem } = useCart();
  const [showContactPopup, setShowContactPopup] = useState(false);

  const handleAddToCart = (confirmed: boolean = false) => {
    if (product.price === 0 && !confirmed) {
      setShowContactPopup(true);
      return;
    }

    setIsAddingToCart(true);
    addItem({
      id: product.id,
      name: product.info[language]?.name,
      price: product.price,
      image: product.image_url || '/images/img-placeholder.webp',
      quantity,
      unit: product.unit,
    });

    setTimeout(() => {
      setIsAddingToCart(false);
      setShowContactPopup(false);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
        {product.info[language].name}
      </h1>

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
        {product.price > 0
          ? t('price_format', { price: product.price.toFixed(2) }) + '$' ||
            `$${product.price.toFixed(2)}`
          : t('contact_for_price') || 'Contact for price'}
      </motion.div>

      <motion.p
        className="mb-6 text-gray-700 dark:text-gray-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {product.info[language].description ||
          t('no_description') ||
          'No description available for this product.'}
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
            {quantity + ' '}
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
          onClick={() => handleAddToCart()}
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

      <AnimatePresence>
        {showContactPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
            >
              <button
                onClick={() => setShowContactPopup(false)}
                className="absolute top-4 right-4 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
              <div className="text-center">
                <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                  {t('contact_popup_title') || 'We will contact you soon'}
                </h3>
                <p className="mb-6 text-gray-600 dark:text-gray-300">
                  {t('contact_popup_message') ||
                    'Our team will contact you shortly via email to provide more information about this product.'}
                </p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={isAddingToCart}
                  onClick={() => handleAddToCart(true)}
                  className={cn(
                    'flex w-full items-center justify-center gap-1 rounded-md py-2 text-sm font-medium text-white transition-colors sm:text-base',
                    'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
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
                        {t('understand') || 'I understand'}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProductDetails;
