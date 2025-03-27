import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import OrderHistory from '@/components/orders/order-history';

export const metadata: Metadata = {
  title: 'Order History',
  description: 'View your past orders and track deliveries',
};

export default async function OrdersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
  }

  return <OrderHistory initialOrders={orders || []} />;
}
