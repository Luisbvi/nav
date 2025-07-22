export interface Product {
  id: string;
  category: string;
  price: number;
  unit?: string;
  stock: number;
  image_url?: string;
  created_at: Date;
  updated_at: Date;
  discount: number;
  info: {
    [lang: string]: {
      name: string;
      description: string;
    };
  };
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

export interface LanguageInfo {
  name: string;
  description?: string;
}

export interface FormData {
  price: number;
  category: string;
  unit: string;
  stock: number;
  discount?: number;
  info: Record<string, LanguageInfo>;
}

export type Role = 'user' | 'admin' | 'customer';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  vessel_name: string;
  shipping_company: string;
  role: Role;
  preferred_language: string;
  status: string;
  email: string;
  email_confirmed_at: string | null;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  avatar_url?: string;
}

export interface OrderItem {
  id: string;
  description: string;
  quantity: number;
}

export type OrderStatus =
  | 'paid'
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total: number;
  subtotal?: number;
  tax?: number;
  shipping_cost?: number;
  created_at: string;
  processing_date?: string;
  shipped_date?: string;
  delivered_date?: string;
  shipping_address_id?: string;
  shipping_method?: string;
  completed_date?: string;
  payment_method?: PaymentMethod;
  items?: OrderItem[];
  cancelled_date?: string;
  payment_confirmation_date?: string;
}

export interface ShippingAddress {
  city?: string;
  country?: string;
  line1?: string;
  line2?: string;
  postal_code?: string;
  state?: string;
}

export type PaymentMethod = 'card' | 'cash' | 'Pago movil' | 'Binance';

export interface OrderData {
  id?: number;
  customer_name: string;
  total: number;
  status: OrderStatus;
  user_id: string;
  email: string;
  payment_id: string;
  shipping_address?: string;
  items: {
    id: string;
    name: string;
    quantity: number;
  }[];
  created_at?: string;
  shipped_date?: string;
  delivered_date?: string;
  payment_method: PaymentMethod;
}
