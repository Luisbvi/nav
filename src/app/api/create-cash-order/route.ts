import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { OrderData } from '@/types';

export async function POST(request: Request) {
  try {
    const { items, user, total } = await request.json();

    const supabase = await createClient();

    const orderData: OrderData = {
      user_id: user?.id,
      customer_name: user?.user_metadata?.firstName + ' ' + user?.user_metadata?.lastName || 'IDK',
      email: user?.email,
      created_at: new Date().toISOString(),
      status: 'pending',
      total: total,
      payment_method: 'cash',
      items,
      payment_id: crypto.randomUUID(),
    };

    const { error: orderError } = await supabase.from('orders').insert(orderData).select();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      redirectUrl: `/checkout/success?payment_status=pending&payment_method=cash&order_id=cash`,
    });
  } catch (error) {
    console.error('Error processing cash order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
