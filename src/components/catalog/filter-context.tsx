'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface FilterContextType {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  isCatalogPage: boolean;
  setIsCatalogPage: (isCatalog: boolean) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [showFilters, setShowFilters] = useState(false);
  const [isCatalogPage, setIsCatalogPage] = useState(false);

  return (
    <FilterContext.Provider
      value={{
        showFilters,
        setShowFilters,
        isCatalogPage,
        setIsCatalogPage,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilterContext() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilterContext must be used within a FilterProvider');
  }
  return context;
}
