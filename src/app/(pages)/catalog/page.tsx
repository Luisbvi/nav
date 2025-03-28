'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Category, Product } from '@/utils/supabase/types';
import CatalogClient from '@/components/catalog/catalog-client';

const CatalogPage = () => {
  const supabase = createClient();
  const searchParams = useSearchParams();

  // State for managing catalog data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract search parameters
  const category = searchParams.get('category') || 'All';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'name-asc';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const availability = searchParams.get('availability') || 'In Stock';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = 9;

  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch categories
        const { data: categoriesData, error: categoryError } = await supabase
          .from('products')
          .select('category')
          .order('category');

        if (categoryError) throw categoryError;

        const categoryCounts: Record<string, number> = {};
        categoriesData.forEach((item) => {
          const cat = item.category;
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });

        const categoryList: Category[] = Object.entries(categoryCounts).map(([name, count]) => ({
          name,
          count,
        }));

        // Add 'All' category
        const totalProducts = categoryList.reduce((acc, cat) => acc + cat.count, 0);
        categoryList.unshift({ name: 'All', count: totalProducts });
        setCategories(categoryList);

        // Prepare products query
        let query = supabase.from('products').select('*', { count: 'exact' });

        // Apply filters
        if (category !== 'All') {
          query = query.eq('category', category);
        }

        if (search) {
          query = query.ilike('name', `%${search}%`);
        }

        if (minPrice) {
          query = query.gte('price', Number.parseFloat(minPrice));
        }

        if (maxPrice) {
          query = query.lte('price', Number.parseFloat(maxPrice));
        }

        if (availability === 'In Stock') {
          query = query.gt('stock', 0);
        }

        const getFavorites = () => {
          if (typeof window !== 'undefined') {
            const favorites = localStorage.getItem('favoriteProducts');
            return favorites ? JSON.parse(favorites) : [];
          }
          return [];
        };

        // Apply sorting
        switch (sort) {
          case 'price-low':
            query = query.order('price', { ascending: true });
            break;
          case 'price-high':
            query = query.order('price', { ascending: false });
            break;
          case 'name-asc':
            query = query.order('name', { ascending: true });
            break;
          case 'name-desc':
            query = query.order('name', { ascending: false });
            break;
          case 'favorites':
            const favoriteIds = getFavorites();
            if (favoriteIds.length > 0) {
              query = query.in('id', favoriteIds);
            } else {
              query = query.eq('id', null);
            }
            break;
          default:
            query = query.order('created_at', { ascending: false });
            break;
        }

        // Pagination
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        // Fetch products with count
        const { data, count, error: productError } = await query.range(from, to);

        if (productError) throw productError;

        setProducts(data || []);
        setTotalCount(count || 0);
        setTotalPages(Math.ceil((count || 0) / pageSize));
      } catch (err) {
        console.error('Error fetching catalog data:', err);
        setError('Failed to load catalog');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category, search, sort, minPrice, maxPrice, availability, page]);

  if (error) {
    return <div>{error}</div>;
  }

  const LoadingSkeleton = () => (
    <div className="grid min-h-[300px] w-full place-items-center">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        <p className="text-sm text-gray-600 dark:text-gray-400"></p>
      </div>
    </div>
  );

  if (loading) return <LoadingSkeleton />;

  return (
    <CatalogClient
      initialProducts={products}
      categories={categories}
      totalCount={totalCount}
      totalPages={totalPages}
      currentPage={page}
      currentCategory={category}
      currentSearch={search}
      currentSort={sort}
      currentMinPrice={minPrice}
      currentMaxPrice={maxPrice}
      currentAvailability={availability}
    />
  );
};

export default CatalogPage;
