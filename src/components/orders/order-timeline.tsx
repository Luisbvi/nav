'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Package, Truck, CreditCard } from 'lucide-react';
import type { Order } from '@/types';
import { useLanguage } from '@/contexts/language-context';

interface OrderTimelineProps {
  order: Order;
}

export default function OrderTimeline({ order }: OrderTimelineProps) {
  const { t } = useLanguage();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Define timeline steps based on order status
  const steps = [
    {
      id: 'ordered',
      title: t('order_placed'),
      description: t('order_received'),
      date: order.order_date,
      icon: <CreditCard className="h-6 w-6" />,
      completed: true,
    },
    {
      id: 'processing',
      title: t('processing'),
      description: t('preparing_order'),
      date: order.processing_date,
      icon: <Package className="h-6 w-6" />,
      completed: ['processing', 'shipped', 'delivered', 'completed'].includes(order.status),
    },
    {
      id: 'shipped',
      title: t('shipped'),
      description: t('order_shipped'),
      date: order.shipped_date,
      icon: <Truck className="h-6 w-6" />,
      completed: ['shipped', 'delivered', 'completed'].includes(order.status),
    },
    {
      id: 'delivered',
      title: t('delivered'),
      description: t('order_delivered'),
      date: order.delivered_date,
      icon: <CheckCircle className="h-6 w-6" />,
      completed: ['delivered', 'completed'].includes(order.status),
    },
  ];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
        {t('order_timeline')}
      </h2>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute top-0 left-6 h-full w-0.5 bg-gray-200 dark:bg-gray-700"></div>

        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative mb-8 pl-14 last:mb-0"
          >
            {/* Icon */}
            <div
              className={`absolute left-0 flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                step.completed
                  ? 'border-indigo-600 bg-indigo-100 text-indigo-600 dark:border-indigo-400 dark:bg-indigo-900/30 dark:text-indigo-400'
                  : 'border-gray-300 bg-white text-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-500'
              }`}
            >
              {step.icon}
            </div>

            {/* Content */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{step.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{step.description}</p>
              {step.date && (
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  {formatDate(step.date)}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
