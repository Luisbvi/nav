'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { getCategories } from '@/app/(auth)/actions/server-actions';
import { Product } from '@/types';

// Default categories if API fails
const defaultCategories = ['Electronics', 'Clothing', 'Books', 'Food'];

function CatalogContent() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get URL params with defaults
  const currentSearch = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentAvailability = searchParams.get('availability') || 'all';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [isLoading, setIsLoading] = useState(true);

  // Update URL params
  const updateParams = (params: { [key: string]: string }) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    router.push('?' + newParams.toString());
  };

  // Handle search
  const handleSearch = (value: string) => {
    updateParams({ search: value });
  };

  // Handle category filter
  const handleCategoryFilter = (value: string) => {
    updateParams({ category: value });
  };

  // Handle availability filter
  const handleAvailabilityFilter = (value: string) => {
    updateParams({ availability: value });
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        // Apply category filter
        if (currentCategory) {
          query = query.eq('category', currentCategory);
        }

        // Apply availability filter
        if (currentAvailability === 'in-stock') {
          query = query.gt('stock', 0);
        } else if (currentAvailability === 'out-of-stock') {
          query = query.eq('stock', 0);
        }

        const { data: productsData, error: productsError } = await query;

        if (productsError) {
          throw productsError;
        }

        if (productsData) {
          // Apply search filter client-side
          const filteredProducts = currentSearch
            ? productsData.filter(p => 
                p.name.toLowerCase().includes(currentSearch.toLowerCase()) ||
                p.description?.toLowerCase().includes(currentSearch.toLowerCase())
              )
            : productsData;
          
          setProducts(filteredProducts);
        }

        // Fetch categories
        const result = await getCategories();
        const categoryList = result.categories ?? defaultCategories;
        if (categoryList.length > 0) {
          setCategories(categoryList);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setCategories(defaultCategories);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [supabase, currentCategory, currentSearch, currentAvailability]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Product Catalog</h1>

      <div className="mb-8 flex flex-wrap items-center gap-4">
        <div className="relative flex-1">
          <Input
            type="search"
            placeholder="Search products..."
            className="w-full"
            value={currentSearch}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <Select value={currentCategory} onValueChange={handleCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentAvailability} onValueChange={handleAvailabilityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            <SelectItem value="in-stock">In Stock</SelectItem>
            <SelectItem value="out-of-stock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-lg">Loading products...</div>
        </div>
      ) : products.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="group overflow-hidden rounded-lg border bg-white shadow transition-transform hover:scale-105"
            >
              <div className="relative h-[200px] w-full">
                <Image
                  src={product.image_url || '/placeholder.svg?height=200&width=200'}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-contain"
                  priority={products.indexOf(product) < 4}
                />
              </div>
              <div className="p-4">
                <h3 className="mb-2 text-lg font-semibold group-hover:text-primary">
                  {product.name}
                </h3>
                <p className="mb-2 text-sm text-gray-600">
                  {product.description?.substring(0, 100)}
                  {product.description && product.description.length > 100 ? '...' : ''}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">${product.price.toFixed(2)}</span>
                  <span
                    className={`text-sm ${
                      product.stock > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center">
          <div className="text-lg">No products found</div>
        </div>
      )}
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-8">
          <div className="text-lg">Loading catalog...</div>
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
