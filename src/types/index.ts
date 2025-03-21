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

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  vessel_name: string;
  shipping_company: string;
  role: string;
  preferred_language: string;
  status: string;
  email: string;
  email_confirmed_at: string | null;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login: string | null;
}
