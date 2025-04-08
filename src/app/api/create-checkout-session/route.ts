// Código de creación de sesión de checkout
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { User } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia',
});

interface ShippingOption {
  name: string;
  price: number;
  estimatedDelivery: string;
}

type ShippingMethodType = 'free' | 'express' | 'overnight';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const shippingOptions: Record<ShippingMethodType, ShippingOption> = {
  free: {
    name: 'Standard',
    price: 0,
    estimatedDelivery: '5-7 business days',
  },
  express: {
    name: 'Express',
    price: 9.99,
    estimatedDelivery: '2-3 business days',
  },
  overnight: {
    name: 'Overnight',
    price: 19.99,
    estimatedDelivery: 'Next business day',
  },
};

export async function POST(request: Request) {
  try {
    const {
      items,
      shippingMethod = 'free',
      user,
    }: { items: CartItem[]; shippingMethod: string; user: User | null } = await request.json();

    const shipping = shippingOptions[shippingMethod as ShippingMethodType];

    const lineItems = items.map((item: CartItem) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: [item.image],
          metadata: {
            item_id: item.id,
          },
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/cart`,
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: Math.round(shipping.price * 100),
              currency: 'usd',
            },
            display_name: shipping.name,
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: parseInt(shipping.estimatedDelivery.split('-')[0]) || 1,
              },
              maximum: {
                unit: 'business_day',
                value: parseInt(shipping.estimatedDelivery.split('-')[1]) || 7,
              },
            },
          },
        },
      ],
      customer_email: user?.email,
      metadata: {
        userId: user?.id || null,
        cartItems: JSON.stringify(
          items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          }))
        ),
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
