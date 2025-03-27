import { Product } from '@/utils/supabase/types';
import { Suspense } from 'react';
import { Button } from '../ui/button';
import { motion } from 'framer-motion';
import ProductCard from './product-card';
import ProductCardSkeleton from './product-card-skeleton';
import { useLanguage } from '@/contexts/language-context';

interface ProductGridProps {
  products: Product[];
  totalCount: number;
  clearFilters: () => void;
}

const ProductGrid = ({ products, totalCount, clearFilters }: ProductGridProps) => {
  const { t } = useLanguage();

  return (
    <>
      <div className="mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-300">
          {t('showing_products', {
            count: products.length,
            total: totalCount,
          }) || `Showing ${products.length} of ${totalCount} products`}
        </p>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {products.map((product) => (
            <Suspense key={product.id} fallback={<ProductCardSkeleton />}>
              <ProductCard product={product} />
            </Suspense>
          ))}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-10 text-center">
          <h3 className="mb-2 text-lg font-medium">
            {t('no_products_found') || 'No products found'}
          </h3>
          <p className="mb-4 text-gray-500 dark:text-gray-300">
            {t('try_changing_search') || 'Try changing your search or filter criteria'}
          </p>
          <Button
            className="bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-400"
            onClick={clearFilters}
          >
            {t('clear_filters') || 'Clear Filters'}
          </Button>
        </motion.div>
      )}
    </>
  );
};

export default ProductGrid;
