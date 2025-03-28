export type Availability = 'all' | 'in-stock';
export type SortOption = 'featured' | 'price-low' | 'price-high' | 'name-asc';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  unit?: string;
  stock: number;
  description?: string;
  image_url?: string;
  created_at: Date;
  updated_at: Date;
  discount: number;
}

export interface Category {
  name: string;
  count: number;
}

export interface SearchParams {
  category?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: SortOption;
  page?: string;
  availability?: Availability;
}
