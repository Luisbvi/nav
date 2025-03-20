import OrdersDashboard from '@/components/dashboard/orders.tsx/OrdersDashboard';
import { createClient } from '@/utils/supabase/client';

export default async function OrdersPage() {
  const supabase = createClient();

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('order_date', { ascending: false });

  if (error) {
    console.error('Error al obtener las órdenes:', error);
  }

  return <OrdersDashboard initialOrders={orders || []} />;
}
