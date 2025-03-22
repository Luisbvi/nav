import OrdersDashboard from '@/components/dashboard/orders.tsx/OrdersDashboard';
import { createClient } from '@/utils/supabase/server';

export default async function OrdersPage() {
  const supabase = await createClient();

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('order_date', { ascending: false });

  if (error) {
    console.error('Error al obtener las órdenes:', error);
  }

  if (!orders) {
    return <div>No orders found</div>;
  }

  return <OrdersDashboard initialOrders={orders} />;
}
