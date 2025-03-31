import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { CartItem } from '@/types';

export async function POST(request: Request) {
  try {
    const { items, shippingMethod, user, total } = await request.json();

    const supabase = await createClient();

    // Generate a unique order ID
    const orderId = crypto.randomUUID();

    // Create the order with pending status
    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        user_id: user?.id || null,
        customer_name:
          user?.user_metadata?.firstName + ' ' + user?.user_metadata?.lastName || 'Guest Customer',
        email: user?.email || null,
        order_date: new Date().toISOString(),
        status: 'pending',
        total: total,
        shipping_method: shippingMethod,
        payment_method: 'cash',
      })
      .select();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // Save order items
    const orderItems = items.map((item: CartItem) => ({
      order_id: orderId,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

    if (itemsError) {
      console.error('Error saving order items:', itemsError);
      return NextResponse.json({ error: 'Failed to save order items' }, { status: 500 });
    }

    // Save payment details
    const { error: paymentError } = await supabase.from('payment_details').insert({
      order_id: orderId,
      payment_method: 'cash',
      payment_status: 'pending',
      amount: total,
      payment_date: new Date().toISOString(),
    });

    if (paymentError) {
      console.error('Error saving payment details:', paymentError);
      return NextResponse.json({ error: 'Failed to save payment details' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      orderId: orderId,
      redirectUrl: `/checkout/success?payment_status=pending&payment_method=cash&order_id=${orderId}`,
    });
  } catch (error) {
    console.error('Error processing cash order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
