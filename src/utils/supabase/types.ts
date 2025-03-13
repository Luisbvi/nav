export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  unit?: string;
  stock: number;
  description?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  name: string;
  count: number;
}
