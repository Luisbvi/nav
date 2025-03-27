'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { Filter, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useFilterContext } from './filter-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { createPortal } from 'react-dom';
import { Category } from '@/utils/supabase/types';
import { Input } from '../ui/input';
import { useLanguage } from '@/contexts/language-context';

interface FilterSidebarProps {
  categories: Category[];
  currentCategory: string;
  minPriceInput: string;
  setMinPriceInput: (value: string) => void;
  maxPriceInput: string;
  setMaxPriceInput: (value: string) => void;
  currentAvailability: string;
  handleCategoryChange: (value: string) => void;
  handleAvailabilityChange: (value: string) => void;
  handlePriceFilter: () => void;
}

const FilterSideBar = ({
  categories,
  currentCategory,
  minPriceInput,
  setMinPriceInput,
  maxPriceInput,
  setMaxPriceInput,
  currentAvailability,
  handleCategoryChange,
  handleAvailabilityChange,
  handlePriceFilter,
}: FilterSidebarProps) => {
  const { t } = useLanguage();
  const { showFilters, setShowFilters, setIsCatalogPage } = useFilterContext();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isMobile = isMounted && window.innerWidth < 768;
  const desktopFiltersRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setShowFilters(!isMobile);
  }, [isMobile, setShowFilters]);

  useEffect(() => {
    setIsCatalogPage(true);
    return () => {
      setIsCatalogPage(false);
    };
  }, [setIsCatalogPage]);

  useEffect(() => {
    desktopFiltersRef.current = document.getElementById('desktop-filters-container');
  }, []);

  // Contenido de los filtros
  const filterContent = (
    <div className="w-full rounded-lg bg-white p-4 shadow md:w-64 dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-medium">
          <Filter className="h-5 w-5" />
          {t('filters') || 'Filters'}
        </h2>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowFilters(false)}
            aria-label={t('close_filters') || 'Close filters'}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Category */}
        <div>
          <h3 className="mb-2 text-sm font-medium">{t('category') || 'Category'}</h3>
          <Select defaultValue={currentCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full" value={currentCategory}>
              <SelectValue placeholder={t('select_category') || 'Select category'} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.name} value={cat.name}>
                  {t(cat.name.toLowerCase().replace(/\s+/g, '_')) || cat.name} ({cat.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Price Range */}
        <div>
          <h3 className="mb-2 text-sm font-medium">{t('price_range') || 'Price Range'}</h3>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder={t('min') || 'Min'}
              min={0}
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
            />
            <Input
              type="number"
              placeholder={t('max') || 'Max'}
              min={0}
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
            />
          </div>
        </div>

        {/* Availability */}
        <div>
          <h3 className="mb-2 text-sm font-medium">{t('availability') || 'Availability'}</h3>
          <Select defaultValue={currentAvailability} onValueChange={handleAvailabilityChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('availability') || 'Availability'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="In Stock">{t('in_stock') || 'In Stock'}</SelectItem>
              <SelectItem value="Out of Stock">{t('out_of_stock') || 'Out of Stock'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button
        className="mt-2 w-full cursor-pointer bg-blue-600 text-white hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
        onClick={handlePriceFilter}
      >
        {t('apply_filters') || 'Apply Filters'}
      </Button>
    </div>
  );

  const itemVariants = {
    open: {
      opacity: 1,
      height: 'auto',
      transition: { duration: 0.3, ease: 'easeInOut', when: 'beforeChildren' },
    },
    close: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.3, ease: 'easeInOut', when: 'afterChildren' },
    },
  };

  return (
    <>
      {/* Boton */}
      <div className="mb-4 flex items-center justify-between md:hidden">
        <h1 className="text-2xl font-bold">{t('product_catalog') || 'Product Catalog'}</h1>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          aria-label={
            showFilters ? t('hide_filters') || 'Hide filters' : t('show_filters') || 'Show filters'
          }
          className="cursor-pointer bg-blue-600 text-white hover:bg-blue-500 hover:text-white dark:bg-blue-500 dark:text-white dark:hover:bg-blue-600 dark:hover:text-white"
        >
          {showFilters ? <X className="size-5" /> : <Filter className="size-5" />}
        </Button>
      </div>

      <AnimatePresence>
        {showFilters && isMobile && (
          <motion.div
            initial={isMobile ? 'close' : 'open'}
            animate="open"
            exit="close"
            variants={itemVariants}
            className="overflow-hidden"
          >
            {filterContent}
          </motion.div>
        )}
      </AnimatePresence>

      {!isMobile &&
        desktopFiltersRef.current &&
        showFilters &&
        createPortal(<div className="mb-6">{filterContent}</div>, desktopFiltersRef.current)}
    </>
  );
};

export default FilterSideBar;
