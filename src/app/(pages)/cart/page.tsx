import type { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';

import CartContent from '@/components/cart/cart-content';

export const metadata: Metadata = {
  title: 'Shopping Cart',
  description: 'View and manage your shopping cart',
};

export default async function CartPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <CartContent user={user} />;
}
