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

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  unit?: string;
  stock?: number;
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

export interface OrderItem {
  id: string;
  description: string;
  quantity: number;
  amount_total: number;
  price: {
    id: string;
    currency: string;
    unit_amount: number;
    product: string;
  };
  currency: string;
  amount_subtotal: number;
  amount_discount: number;
  amount_tax: number;
}

export interface Order {
  id: string;
  user_id: string;
  order_number?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  total: number;
  subtotal?: number;
  tax?: number;
  shipping_cost?: number;
  created_at?: string;
  order_date: string;
  processing_date?: string;
  shipped_date?: string;
  delivered_date?: string;
  shipping_address_id?: string;
  shipping_method?: string;
  payment_method?: string;
  items?: OrderItem[];
}

export interface ShippingAddress {
  city?: string;
  country?: string;
  line1?: string;
  line2?: string;
  postal_code?: string;
  state?: string;
}
