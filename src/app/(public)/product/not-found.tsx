'use client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useLanguage } from '@/contexts/language-context';

const NotFound = () => {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-4 text-6xl font-bold text-gray-900 dark:text-gray-100">404</h1>
      <h2 className="mb-6 text-2xl font-semibold text-gray-700 dark:text-gray-300">
        {t('product_not_found') || 'Product Not Found'}
      </h2>
      <p className="mb-8 max-w-md text-gray-600 dark:text-gray-400">
        {t('product_not_found_message') ||
          'The product you are looking for might have been removed, had its name changed, or is temporarily unavailable.'}
      </p>
      <Button className="bg-blue-500">
        <Link href="/catalog">{t('return_to_catalog') || 'Return to Catalog'}</Link>
      </Button>
    </div>
  );
};

export default NotFound;
