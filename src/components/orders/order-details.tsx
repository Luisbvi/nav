'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, Truck, CreditCard, CheckCircle, Clock } from 'lucide-react';
import { Order, ShippingAddress } from '@/types';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';
import OrderItems from './order-items';
import OrderTimeline from './order-timeline';

interface OrderDetailProps {
  order: Order;
  shippingAddress: ShippingAddress;
}

export default function OrderDetail({ order, shippingAddress }: OrderDetailProps) {
  const { t } = useLanguage();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-purple-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 flex items-center"
      >
        <Link href="/orders">
          <Button variant="ghost" size="sm" className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('back_to_orders')}
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl dark:text-gray-100">
          {t('order')} #{order.id}
        </h1>
        <div
          className={`ml-4 rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(order.status)}`}
        >
          {getStatusIcon(order.status)}
          <span className="ml-1 capitalize">{t(order.status)}</span>
        </div>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 p-6 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {t('order_details')}
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('placed_on')} {formatDate(order.order_date)}
              </p>
            </div>

            <OrderItems order={order} />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8"
          >
            <OrderTimeline order={order} />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('order_summary')}
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{t('subtotal')}</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  ${order.total.toFixed(2)}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-900 dark:text-gray-100">{t('total')}</span>
                  <span className="font-bold text-gray-900 dark:text-gray-100">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {shippingAddress && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {t('shipping_address')}
                </h2>
              </div>

              <div className="mt-4 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {shippingAddress.line1}
                </p>
                <p>{shippingAddress.city}</p>
                <p>
                  {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}
                </p>
                <p>{shippingAddress.country}</p>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('payment_information')}
              </h2>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">{t('payment_method')}</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {'Credit Card'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">{t('payment_status')}</span>
                <span className="font-medium text-green-600 dark:text-green-400">{t('paid')}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button variant="outline" asChild>
              <Link href={`/orders/${order.id}/invoice`}>{t('download_invoice')}</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
