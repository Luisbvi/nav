'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { Order } from '@/types';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

interface OrderSummaryProps {
  order: Order;
}

export default function OrderSummary({ order }: OrderSummaryProps) {
  const { t } = useLanguage();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  console.log(order.payment_method);

  return (
    <div className="border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {t('order_number') || 'Order number'}
          </div>
          <div className="w-24 items-center truncate font-medium text-gray-900 dark:text-gray-100">
            #{order.id}
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {t('date_placed') || 'Date placed'}
          </div>
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {formatDate(order.created_at!)}
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {t('total_amount') || 'Total amount'}
          </div>
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {`${order.payment_method === 'card' ? '$' : 'Bs.'}  ${order.total.toFixed(2)}`}
          </div>
        </div>

        <div className="flex gap-2">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link href={`/orders/${order.id}`}>
              <Button
                className="cursor-pointer dark:bg-gray-700 dark:hover:bg-gray-600"
                variant="outline"
                size="sm"
              >
                {t('view_order') || 'View Order'}
              </Button>
            </Link>
          </motion.div>
        </div>

        <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-400">
          <span className="">{t(order.status.toLowerCase()) || order.status}</span>
        </div>
      </div>
    </div>
  );
}
