import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { OrderData } from '@/types';

export async function POST(request: Request) {
  try {
    const { items, shipping_details, user, paymentData, total } = await request.json();

    const supabase = await createClient();

    const orderData: OrderData = {
      customer_name:
        user?.user_metadata?.first_name + ' ' + user?.user_metadata?.last_name || paymentData.name,
      created_at: new Date().toISOString(),
      total: total,
      status: 'pending',
      user_id: user?.id || null,
      email: user?.email || null,
      shipping_address: shipping_details,
      payment_id: paymentData.reference,
      payment_method: 'Pago movil',
      items,
    };

    console.log({ items });

    const { error: orderError } = await supabase.from('orders').insert(orderData).select();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      redirectUrl: `/checkout/success?payment_status=pending&payment_method=pagomovil&order_id=${paymentData.reference}`,
    });
  } catch (error) {
    console.error('Error processing pagomovil order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
