'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Order } from '@/types';
import { useLanguage } from '@/contexts/language-context';

import OrderSummary from './order-summary';
import OrderItems from './order-items';
import EmptyOrders from './empty-orders';

interface OrderHistoryProps {
  initialOrders: Order[];
}

export default function OrderHistory({ initialOrders }: OrderHistoryProps) {
  const { t } = useLanguage();
  const [orders] = useState<Order[]>(initialOrders);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (orders.length === 0) {
    return <EmptyOrders />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {t('order_history') || 'Order history'}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t('order_history_description') ||
            'Check the status of recent orders, manage returns, and discover similar products.'}
        </p>
      </motion.div>

      <motion.div className="mt-8 space-y-6" variants={container} initial="hidden" animate="show">
        {orders.map((order) => (
          <motion.div
            key={order.id}
            variants={item}
            className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
          >
            <OrderSummary order={order} />
            <OrderItems order={order} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
