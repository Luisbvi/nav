import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Vibration feedback for mobile
export const handleMenuItemClick = (setActive: (value: boolean) => void) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(50); // 50ms vibration
  }
  setActive(false);
};
