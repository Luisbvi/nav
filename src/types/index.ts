export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  unit: string;
  stock: number;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductResponse {
  success?: boolean;
  error?: string;
  products?: Product[];
  product?: Product;
}

export interface CategoryResponse {
  success?: boolean;
  error?: string;
  categories?: string[];
}

export interface FormData {
  name: string;
  description: string;
  price: number;
  category: string;
  unit: string;
  stock: number;
  status: 'active' | 'inactive' | 'pending' | 'archived';
  image_url?: string;
}