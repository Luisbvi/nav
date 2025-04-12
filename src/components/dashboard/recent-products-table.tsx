'use client';

import { Product } from '@/types';
import { ProductRow } from './product-row';
import { useSearchParams } from 'next/navigation';

interface RecentProductsTableProps {
  products: Product[];
}

export default function RecentProductsTable({ products }: RecentProductsTableProps) {
  const params = useSearchParams();
  const searchQuery = params.get('query');

  const filteredProducts = searchQuery
    ? products.filter((product) => product.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : products;

  return (
    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800 dark:shadow-gray-700">
      <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Recent Products</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <TableHeader>Product</TableHeader>
              <TableHeader>Category</TableHeader>
              <TableHeader>Price</TableHeader>
              <TableHeader>Stock</TableHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
            {filteredProducts.slice(0, 5).map((product) => (
              <ProductRow key={product.id} product={product} />
            ))}
          </tbody>
        </table>
      </div>
      {filteredProducts.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">No products found</p>
        </div>
      )}
    </div>
  );
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <th
      scope="col"
      className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
    >
      {children}
    </th>
  );
}
