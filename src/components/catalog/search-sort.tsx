'use client';

import { Search, SortDesc } from 'lucide-react';
import { FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/language-context';

interface SearchSortProps {
  currentSearch: string;
  currentSort: string;
  handleSearch: (value: string) => void;
  handleSortChange: (value: string) => void;
}

const SearchSort = ({
  currentSearch,
  currentSort,
  handleSearch,
  handleSortChange,
}: SearchSortProps) => {
  const { t } = useLanguage();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchValue = formData.get('search')?.toString() || '';
    handleSearch(searchValue);
  };

  return (
    <div className="mb-6 rounded-lg bg-white p-4 not-dark:shadow-sm dark:bg-gray-800">
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <form onSubmit={onSubmit} className="relative flex-1">
          <Search className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400" />
          <Input
            type="search"
            name="search"
            placeholder={t('search_products') || 'Search products...'}
            className="pl-10 dark:bg-gray-700"
            defaultValue={currentSearch}
          />
          <button type="submit" className="sr-only">
            {t('search') || 'Search'}
          </button>
        </form>

        <div className="flex items-center gap-2">
          <SortDesc className="h-4 w-4" />
          <Select defaultValue={currentSort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px] cursor-pointer dark:bg-gray-700 dark:hover:bg-gray-700">
              <SelectValue placeholder={t('sort_by') || 'Sort by'} />
            </SelectTrigger>
            <SelectContent className="cursor-pointer dark:bg-gray-700 dark:focus:bg-gray-600">
              <SelectItem className="cursor-pointer dark:focus:bg-gray-600" value="name-asc">
                {t('name_a_to_z') || 'Name: A to Z'}
              </SelectItem>
              <SelectItem className="cursor-pointer dark:focus:bg-gray-600" value="name-desc">
                {t('name_z_to_a') || 'Name: Z to A'}
              </SelectItem>
              <SelectItem className="cursor-pointer dark:focus:bg-gray-600" value="favorites">
                {t('favorites') || 'Favorites'}
              </SelectItem>
              <SelectItem className="cursor-pointer dark:focus:bg-gray-600" value="price-high">
                {t('price_high_to_low') || 'Price: High to Low'}
              </SelectItem>
              <SelectItem className="cursor-pointer dark:focus:bg-gray-600" value="price-low">
                {t('price_low_to_high') || 'Price: Low to High'}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default SearchSort;
