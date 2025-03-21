'use client';

import { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
}

interface ProductCardProps {
  product: Product;
}

// Aplicar memo para evitar re-renderizados innecesarios
const ProductCard = memo(function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow transition-all hover:border hover:border-blue-500 hover:shadow-md">
      <div className="relative aspect-square">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
      </div>

      <div className="p-4">
        <Link href={`/product/${product.id}`} className="block">
          <h3 className="hover:text-primary line-clamp-2 font-medium transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mt-1 mb-2 text-sm text-gray-500">{product.category}</div>

        <div className="flex items-center justify-between">
          <div className="font-bold">${product.price.toFixed(2)}</div>
          <Link href={`/product/${product.id}`}>
            <Button size="sm" className="cursor-pointer bg-blue-400 text-white hover:bg-blue-500">
              View Product
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
});

export default ProductCard;
