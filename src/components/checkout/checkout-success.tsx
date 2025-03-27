'use client';
import { useCart } from '@/contexts/cart-context';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import React, { useEffect } from 'react';
import { CheckCircle, Home, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { useLanguage } from '@/contexts/language-context';

const CheckoutSuccess = () => {
  const { t } = useLanguage();
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    clearCart();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.div
      className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-16 text-center"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item} className="mb-6 rounded-full bg-green-100 p-6 dark:bg-green-900">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 10,
            delay: 0.3,
          }}
        >
          <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
        </motion.div>
      </motion.div>

      <motion.h1
        variants={item}
        className="mb-4 text-3xl font-bold text-gray-900 dark:text-gray-100"
      >
        {t('thank_you_title') || 'Thank You for Your Order!'}
      </motion.h1>

      <motion.p variants={item} className="mb-6 max-w-md text-gray-600 dark:text-gray-300">
        {t('thank_you_message') ||
          'Your payment was successful and your order is being processed. You will receive a confirmation email shortly.'}
      </motion.p>

      {sessionId && (
        <motion.div
          variants={item}
          className="mb-8 overflow-hidden rounded-lg bg-gray-50 px-6 py-4 dark:bg-gray-800"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('order_reference') || 'Order Reference'}
          </p>
          <p className="font-mono text-lg font-medium text-gray-800 dark:text-gray-200">
            {sessionId.substring(0, 12)}...
          </p>
        </motion.div>
      )}

      <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row">
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link href="/">
            <Button
              variant="outline"
              className="flex w-full items-center gap-2 px-6 sm:w-auto dark:border-gray-700 dark:text-gray-300"
            >
              <Home className="h-4 w-4" />
              {t('return_home') || 'Return Home'}
            </Button>
          </Link>
        </motion.div>

        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link href="/catalog">
            <Button className="flex w-full items-center gap-2 bg-blue-600 px-6 text-white hover:bg-blue-700 sm:w-auto dark:bg-blue-500 dark:hover:bg-blue-600">
              <ShoppingBag className="h-4 w-4" />
              {t('continue_shopping') || 'Continue Shopping'}
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="mt-16 text-sm text-gray-400 dark:text-gray-500"
      >
        {t('need_help') || 'Need help with your order?'}{' '}
        <Link href="/#" className="text-blue-600 hover:underline dark:text-blue-400">
          {t('contact_support') || 'Contact Support'}
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default CheckoutSuccess;
