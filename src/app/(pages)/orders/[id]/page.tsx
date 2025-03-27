import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';

import OrderDetail from '@/components/orders/order-details';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return {
      title: 'Order Not Found',
    };
  }

  // Fetch order
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', session.user.id)
    .single();

  if (!order) {
    return {
      title: 'Order Not Found',
    };
  }

  return {
    title: `Order #${order.order_number || order.id}`,
    description: `Details for your order placed on ${new Date(order.created_at || order.order_date).toLocaleDateString()}`,
  };
}

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // Fetch order with items
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', session.user.id)
    .single();

  if (error || !order) {
    notFound();
  }

  // Fetch shipping address if available
  let shippingAddress = null;
  if (order.shipping_address_id) {
    const { data: address } = await supabase
      .from('user')
      .select('*')
      .eq('id', order.shipping_address_id)
      .single();

    shippingAddress = address;
  }

  return <OrderDetail order={order} shippingAddress={shippingAddress} />;
}
