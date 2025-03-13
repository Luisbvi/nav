import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

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

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden hover:border hover:border-blue-500 hover:shadow-md transition-all">
      <div className="relative aspect-square">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>

      <div className="p-4">
        <Link href={`/product/${product.id}`} className="block">
          <h3 className="font-medium hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <div className="text-sm text-gray-500 mt-1 mb-2">
          {product.category}
        </div>

        <div className="flex items-center justify-between">
          <div className="font-bold">${product.price.toFixed(2)}</div>
          <Button
            size="sm"
            className=" bg-blue-400 text-white hover:bg-blue-500 cursor-pointer"
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
