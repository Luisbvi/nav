import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Inicializar Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Inicializar Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia',
});

export async function processOrder(session: Stripe.Checkout.Session) {
  try {
    // Recuperar los detalles de los items del pedido
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

    // Obtener correo electrónico del cliente
    const customerEmail = session.customer_details?.email;

    // Obtener la información del usuario si está disponible
    const userId = session.metadata?.userId || null;

    // 1. Guardar el pedido principal en la base de datos
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        id: session.id,
        customer_name: session.customer_details?.name || 'Cliente',
        order_date: new Date().toISOString(),
        total: session.amount_total ? session.amount_total / 100 : 0,
        status: 'paid',
        user_id: userId,
        email: customerEmail,
        payment_id: session.payment_intent as string,
        shipping_address: session.shipping_details || null,
        payment_method: session.payment_method_types?.[0] || 'card',
      })
      .select();

    if (orderError) {
      console.error('Error saving order to database:', orderError);
      return;
    }

    // 2. Guardar los items del pedido en la base de datos
    const orderItems = lineItems.data.map((item) => ({
      order_id: session.id,
      product_id: item.price?.product as string,
      product_name: item.description || 'Producto',
      quantity: item.quantity || 1,
      price: item.amount_total ? item.amount_total / 100 : 0,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

    if (itemsError) {
      console.error('Error saving order items to database:', itemsError);
    }

    return orderData?.[0];
  } catch (error) {
    console.error('Error processing order:', error);
    throw error;
  }
}
