import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { Order, OrderData } from '@/types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

async function testSupabaseConnection() {
  try {
    const { error } = await supabase.from('orders').select('id').limit(1);
    if (error) {
      console.error('Error connecting to Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Exception connecting to Supabase:', err);
    return false;
  }
}

export async function POST(request: Request) {
  console.log('🔔 Webhook endpoint hit!');

  const supabaseConnected = await testSupabaseConnection();
  console.log('Supabase connection test:', supabaseConnected ? 'SUCCESS' : 'FAILED');

  if (!supabaseConnected) {
    console.error('❌ Cannot process webhook: Supabase connection failed');
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }

  console.log('Environment check:');
  console.log('- STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing');
  console.log(
    '- STRIPE_WEBHOOK_SECRET:',
    process.env.STRIPE_WEBHOOK_SECRET ? `✅ Set (length: ${endpointSecret.length})` : '❌ Missing'
  );
  console.log(
    '- NEXT_PUBLIC_SUPABASE_URL:',
    process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'
  );
  console.log(
    '- SUPABASE_SERVICE_ROLE_KEY:',
    process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing'
  );

  try {
    const rawBody = await request.text();
    console.log('📦 Request body received, length:', rawBody.length);
    console.log('📦 Request body preview:', rawBody.substring(0, 100) + '...');

    const headersList = await headers();
    const signature = headersList.get('stripe-signature');
    console.log('🔑 Signature received:', signature ? '✅ Yes' : '❌ No');

    if (signature) {
      console.log('🔑 Signature preview:', signature.substring(0, 20) + '...');
    }

    if (!signature) {
      console.error('❌ Missing Stripe signature');
      return NextResponse.json({ error: 'Missing stripe signature' }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      console.log('🔐 Attempting to verify event with secret length:', endpointSecret.length);
      event = stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
      console.log('✅ Event verified:', event.id, 'Type:', event.type);
    } catch (err: Error | unknown) {
      if (err instanceof Error) {
        console.error(`❌ Webhook signature verification failed:`, err.message);
        return NextResponse.json(
          { error: `Webhook signature verification failed: ${err.message}` },
          { status: 400 }
        );
      } else {
        console.error(`❌ Webhook signature verification failed:`, err);
        return NextResponse.json(
          { error: `Webhook signature verification failed: ${err}` },
          { status: 400 }
        );
      }
    }

    console.log('🔄 Processing event:', event.type);

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          console.log('💰 Processing checkout session:', session.id);

          console.log('Session details:');
          console.log('- Amount:', session.amount_total);
          console.log('- Customer:', session.customer_details?.email);
          console.log('- Payment Intent:', session.payment_intent);
          console.log('- Metadata:', JSON.stringify(session.metadata || {}));

          await handleSuccessfulPayment(session);
          break;
        }
        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log(
            `💳 PaymentIntent ${paymentIntent.id} for ${paymentIntent.amount} was successful!`
          );
          break;
        }
        default:
          console.log(`⏩ Unhandled event type ${event.type}`);
      }
    } catch (err) {
      console.error('❌ Error processing event:', err);
    }

    console.log('✅ Returning successful response to Stripe');
    return NextResponse.json({ received: true, success: true });
  } catch (err) {
    console.error('❌ Unhandled exception in webhook handler:', err);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  try {
    console.log('📝 Starting to process payment for session:', session.id);

    console.log('🔍 Fetching line items for session:', session.id);
    const lineItemsResponse = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ['data.price.product'],
    });
    const lineItems = lineItemsResponse.data;

    console.log(`📋 Found ${lineItems.length} line items`);

    const customerEmail = session.customer_details!.email;
    console.log('📧 Customer email:', customerEmail || 'Not provided');

    const userId = session.metadata!.userId;
    console.log('👤 User ID from metadata:', userId || 'Not provided');

    console.log('Metadata:', session.metadata);

    const cartItems = session.metadata?.cartItems ? JSON.parse(session.metadata.cartItems) : [];

    console.log('Original item IDs from metadata:', cartItems);

    const items = lineItems.map((i) => {
      const product = i.price?.product as Stripe.Product;
      return {
        id: i.id,
        original_item_id: product.metadata?.item_id,
        name: i.description!,
        quantity: i.quantity!,
      };
    });

    const orderData: OrderData = {
      customer_name: session.customer_details?.name || 'Cliente',
      total: session.amount_total ? session.amount_total / 100 : 0,
      status: 'paid',
      user_id: userId,
      email: customerEmail!,
      payment_id: session.payment_intent as string,
      payment_method: 'card',
      items: items,
      created_at: new Date().toISOString(),
    };

    console.log('💾 Saving order to database:');

    const { data, error } = await supabase.from('orders').insert(orderData).select();

    if (error) {
      console.error('❌ Error saving order to database:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return;
    }

    console.log('✅ Order saved successfully:', data ? data[0]?.id : null);

    if (customerEmail && data && data.length > 0) {
      console.log('📤 Sending confirmation email to:', customerEmail);
      await sendOrderConfirmationEmail(customerEmail, session.id, data[0]);
    } else {
      console.log('⚠️ Skipping email, missing customer email or order data');
    }

    console.log('✅ Payment processing completed for session:', session.id);
  } catch (error) {
    console.error('❌ Error processing successful payment:', error);
    console.error('Full error:', JSON.stringify(error, null, 2));
  }
}

async function sendOrderConfirmationEmail(email: string, orderId: string, orderDetails: Order) {
  try {
    console.log(`📧 Preparing to send confirmation email to ${email} for order ${orderId}`);

    const { data, error } = await supabase.functions.invoke('send-order-confirmation', {
      body: {
        email,
        orderId,
        orderDetails,
      },
    });

    if (error) {
      console.error('❌ Error invoking email function:', error);
      return;
    }

    console.log(`✅ Confirmation email sent to ${email} for order ${orderId}`);
    console.log('Email function response:', data);
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error);
    console.error('Full error:', JSON.stringify(error, null, 2));
  }
}
