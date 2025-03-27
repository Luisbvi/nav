'use client';

import FilterSideBar from './filter-sidebar';
import { Product, Category } from '@/utils/supabase/types';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import SearchSort from './search-sort';
import ProductGrid from './product-grid';
import Pagination from './pagination';
import { useLanguage } from '@/contexts/language-context';

interface CatalogClientProps {
  initialProducts: Product[];
  categories: Category[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  currentCategory: string;
  currentSearch: string;
  currentSort: string;
  currentMinPrice: string;
  currentMaxPrice: string;
  currentAvailability: string;
}

const CatalogClient = ({
  initialProducts,
  categories,
  totalCount,
  totalPages,
  currentPage,
  currentCategory,
  currentSearch,
  currentSort,
  currentMinPrice,
  currentMaxPrice,
  currentAvailability,
}: CatalogClientProps) => {
  const { t } = useLanguage();
  const router = useRouter();
  const [minPriceInput, setMinPriceInput] = useState(currentMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(currentMaxPrice);

  useEffect(() => {
    setMinPriceInput(currentMinPrice);
    setMaxPriceInput(currentMaxPrice);
  }, [currentMinPrice, currentMaxPrice]);

  const updateSearchParams = (params: Record<string, string>) => {
    const searchParams = new URLSearchParams();

    if (currentCategory !== 'All' && !params.hasOwnProperty('category')) {
      searchParams.set('category', currentCategory);
    }

    if (currentSearch && !params.hasOwnProperty('search')) {
      searchParams.set('search', currentSearch);
    }

    if (currentSort !== 'featured' && !params.hasOwnProperty('sort')) {
      searchParams.set('sort', currentSort);
    }

    if (currentMinPrice && !params.hasOwnProperty('minPrice')) {
      searchParams.set('minPrice', currentMinPrice);
    }

    if (currentMaxPrice && !params.hasOwnProperty('maxPrice')) {
      searchParams.set('maxPrice', currentMaxPrice);
    }

    if (currentAvailability !== 'In Stock' && !params.hasOwnProperty('availability')) {
      searchParams.set('availability', currentAvailability);
    }

    if (currentPage > 1 && !params.hasOwnProperty('page')) {
      searchParams.set('page', currentPage.toString());
    }

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        searchParams.set(key, value);
      } else {
        searchParams.delete(key);
      }
    });

    router.push(`catalog?${searchParams.toString()}`);
  };

  const handleCategoryChange = (value: string) => {
    updateSearchParams({
      category: value === 'All' ? '' : value,
      page: '1',
      minPrice: '',
      maxPrice: '',
      availability: 'In Stock',
    });
  };

  const handleAvailabilityChange = (value: string) => {
    updateSearchParams({
      availability: value,
      page: '1',
    });
  };

  const handlePriceFilter = () => {
    updateSearchParams({
      minPrice: minPriceInput,
      maxPrice: maxPriceInput,
      page: '1',
    });
  };

  const handleSearch = (value: string) => {
    updateSearchParams({
      search: value,
      page: '1',
    });
  };

  const handleSortChange = (value: string) => {
    updateSearchParams({
      sort: value,
    });
  };

  const handlePageChange = (value: number) => {
    updateSearchParams({
      page: value.toString(),
    });
  };

  const clearFilters = () => {
    router.push('/catalog');
  };

  return (
    <div className="flex-1">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <FilterSideBar
          categories={categories}
          currentCategory={currentCategory}
          minPriceInput={minPriceInput}
          setMinPriceInput={setMinPriceInput}
          maxPriceInput={maxPriceInput}
          setMaxPriceInput={setMaxPriceInput}
          currentAvailability={currentAvailability}
          handleCategoryChange={handleCategoryChange}
          handleAvailabilityChange={handleAvailabilityChange}
          handlePriceFilter={handlePriceFilter}
        />
      </div>
      <h1 className="mb-6 hidden text-3xl font-bold md:block">
        {t('product_catalog') || 'Product Catalog'}
      </h1>

      <SearchSort
        currentSearch={currentSearch}
        handleSearch={handleSearch}
        currentSort={currentSort}
        handleSortChange={handleSortChange}
      />

      <ProductGrid products={initialProducts} totalCount={totalCount} clearFilters={clearFilters} />

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default CatalogClient;
