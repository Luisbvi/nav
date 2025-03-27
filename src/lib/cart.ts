import type { CartItem } from '@/types';

// Function to parse cart items from cookie
export function getCartItems(cartCookie: string): CartItem[] {
  try {
    return JSON.parse(cartCookie);
  } catch (error) {
    console.error('Error parsing cart cookie:', error);
    return [];
  }
}

// Function to calculate cart total
export function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}
