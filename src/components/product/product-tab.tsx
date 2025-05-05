'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/language-context';

interface ProductTabsProps {
  product: Product;
  specifications: { name: string; value: string }[];
}

export default function ProductTabs({ product, specifications }: ProductTabsProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('details');

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <Tabs defaultValue="details" onValueChange={setActiveTab}>
        <TabsList className="mb-6 w-full justify-start bg-transparent sm:w-auto dark:bg-transparent">
          <TabsTrigger
            value="details"
            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary dark:data-[state=active]:bg-primary/20 cursor-pointer"
          >
            {t('product_details') || 'Product Details'}
          </TabsTrigger>
          <TabsTrigger
            value="specs"
            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary dark:data-[state=active]:bg-primary/20 cursor-pointer"
          >
            {t('specifications') || 'Specifications'}
          </TabsTrigger>
          <TabsTrigger
            value="shipping"
            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary dark:data-[state=active]:bg-primary/20 cursor-pointer"
          >
            {t('shipping_info') || 'Shipping Information'}
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TabsContent
              value="details"
              className="rounded-md bg-white p-6 shadow dark:bg-gray-800"
            >
              <h2 className="mb-4 text-xl font-bold dark:text-gray-100">
                {t('product_details') || 'Product Details'}
              </h2>
              <p className="mb-4 dark:text-gray-300">
                {product.info['en'].description ||
                  t('no_detailed_description') ||
                  'No detailed description available for this product.'}
              </p>
              <p className="dark:text-gray-300">
                {t('product_ideal_description') ||
                  'This product is ideal for maritime vessels requiring high-quality supplies during long journeys. All our products are sourced from trusted suppliers and meet international maritime standards.'}
              </p>
            </TabsContent>

            <TabsContent value="specs" className="rounded-md bg-white p-6 shadow dark:bg-gray-800">
              <h2 className="mb-4 text-xl font-bold dark:text-gray-100">
                {t('technical_specs') || 'Technical Specifications'}
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {specifications.map((spec, index) => (
                  <motion.div
                    key={index}
                    className="border-b pb-2 dark:border-gray-700"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <span className="font-medium dark:text-gray-200">{spec.name}: </span>
                    <span className="text-gray-600 dark:text-gray-400">{spec.value}</span>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent
              value="shipping"
              className="rounded-md bg-white p-6 shadow dark:bg-gray-800"
            >
              <h2 className="mb-4 text-xl font-bold dark:text-gray-100">
                {t('shipping_info') || 'Shipping Information'}
              </h2>
              <p className="mb-4 dark:text-gray-300">
                {t('shipping_description') ||
                  "We deliver to most major ports worldwide. Shipping times vary depending on your vessel's location and port of call."}
              </p>
              <h3 className="mb-2 font-medium dark:text-gray-200">
                {t('delivery_options') || 'Delivery Options:'}
              </h3>
              <ul className="mb-4 list-disc space-y-1 pl-5 dark:text-gray-300">
                <li>{t('port_pickup') || 'Port Pickup: Available at no additional cost'}</li>
                <li>{t('direct_to_vessel') || 'Direct to Vessel: Additional fees may apply'}</li>
                <li>{t('express_delivery') || 'Express Delivery: Available for urgent orders'}</li>
              </ul>
              <p className="dark:text-gray-300">
                {t('contact_logistics') ||
                  'Contact our logistics team for specific delivery arrangements and schedules.'}
              </p>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </motion.div>
  );
}
