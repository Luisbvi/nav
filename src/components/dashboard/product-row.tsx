import { Product } from '@/types';
import Image from 'next/image';

interface ProductRowProps {
  product: Product;
}

export const ProductRow = ({ product }: ProductRowProps) => {
  return (
    <tr key={product.id}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="relative h-10 w-10 flex-shrink-0">
            <Image
              src={product.image_url || '/images/img-placeholder.webp'}
              alt={product.name}
              fill
              className="rounded-md object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{product.name}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">{product.category}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">${product.price.toFixed(2)}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${
          product.stock > 50
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>{product.stock}</span>
      </td>
    </tr>
  );
};
