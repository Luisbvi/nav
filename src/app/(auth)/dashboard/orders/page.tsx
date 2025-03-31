import OrdersDashboard from '@/components/dashboard/orders.tsx/orders-dashboard';
import { User } from '@/types';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

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
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener las órdenes:', error);
  }

  if (!orders) {
    return <div>No orders found</div>;
  }

  return <OrdersDashboard user={user.user_metadata as User} initialOrders={orders} />;
}
