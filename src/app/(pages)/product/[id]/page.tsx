'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MinusCircle, PlusCircle, ShieldCheck, Truck } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Product } from '@/types';
import { useCart } from '@/contexts/cart-context';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const supabase = createClient();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Product not found');

        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [params.id, supabase]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Product not found</div>
      </div>
    );
  }

  // Mock specifications if not available in the database
  const specifications = [
    { name: 'Category', value: product.category },
    { name: 'Stock', value: `${product.stock} units` },
    { name: 'Unit', value: product.unit || 'N/A' },
    { name: 'ID', value: product.id },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <div className="container mx-auto flex-1 px-4 py-8">
        <div className="mb-8 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <span>/</span>
          <Link href="/catalog" className="hover:text-primary">
            Catalog
          </Link>
          <span>/</span>
          <span className="font-medium text-gray-700">{product.name}</span>
        </div>

        <div className="grid gap-10 md:grid-cols-2">
          <div className="rounded-md bg-white p-4 shadow">
            <div className="relative aspect-square overflow-hidden rounded">
              <Image
                src={product.image_url || '/placeholder.svg?height=400&width=400'}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain"
              />
            </div>
          </div>

          <div>
            <h1 className="mb-2 text-3xl font-bold">{product.name}</h1>
            <div className="mb-4 text-sm text-gray-500">
              Category:{' '}
              <Link
                href={`/catalog?category=${encodeURIComponent(product.category)}`}
                className="text-primary hover:underline"
              >
                {product.category}
              </Link>
            </div>

            <div className="mb-6 text-2xl font-bold">${product.price.toFixed(2)}</div>

            <p className="mb-6 text-gray-700">
              {product.description || 'No description available for this product.'}
            </p>

            <div className="mb-6 flex items-center gap-2 text-green-600">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-sm font-medium">
                {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
              </span>
            </div>

            <div className="mb-8 flex items-center gap-4">
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <MinusCircle className="h-4 w-4" />
                </Button>
                <span className="mx-4">
                  {quantity} <span className="text-sm text-gray-500">{product.unit}</span>
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={quantity >= (product?.stock || 0)}
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>

              <Link href="/cart">
                <Button
                  className="bg-blue-500 px-8 hover:bg-blue-600"
                  onClick={() => {
                    if (product) {
                      addItem({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image_url || '/images/img-placeholder.webp',
                        quantity,
                        unit: product.unit,
                      });
                    }
                  }}
                  disabled={!product?.stock}
                >
                  Add to Cart
                </Button>
              </Link>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-gray-500" />
                <div>
                  <h3 className="font-medium">Delivery to Port</h3>
                  <p className="text-sm text-gray-500">
                    Available for delivery to most major ports
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-gray-500" />
                <div>
                  <h3 className="font-medium">Quality Guarantee</h3>
                  <p className="text-sm text-gray-500">All products meet maritime standards</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <Tabs defaultValue="details">
            <TabsList className="mb-6">
              <TabsTrigger className="cursor-pointer" value="details">
                Product Details
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="specs">
                Specifications
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="shipping">
                Shipping Information
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="rounded-md bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-bold">Product Details</h2>
              <p className="mb-4">
                {product.description || 'No detailed description available for this product.'}
              </p>
              <p>
                This product is ideal for maritime vessels requiring high-quality supplies during
                long journeys. All our products are sourced from trusted suppliers and meet
                international maritime standards.
              </p>
            </TabsContent>

            <TabsContent value="specs" className="rounded-md bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-bold">Technical Specifications</h2>
              <div className="grid grid-cols-2 gap-4">
                {specifications.map((spec, index) => (
                  <div key={index} className="border-b pb-2">
                    <span className="font-medium">{spec.name}: </span>
                    <span className="text-gray-600">{spec.value}</span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="shipping" className="rounded-md bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-bold">Shipping Information</h2>
              <p className="mb-4">
                We deliver to most major ports worldwide. Shipping times vary depending on your
                vessel&apos;s location and port of call.
              </p>
              <h3 className="mb-2 font-medium">Delivery Options:</h3>
              <ul className="mb-4 list-disc space-y-1 pl-5">
                <li>Port Pickup: Available at no additional cost</li>
                <li>Direct to Vessel: Additional fees may apply</li>
                <li>Express Delivery: Available for urgent orders</li>
              </ul>
              <p>Contact our logistics team for specific delivery arrangements and schedules.</p>
            </TabsContent>
          </Tabs>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            If you&apos;re interested in this product, please contact us for more information.
          </p>
        </div>
      </div>
    </div>
  );
}
