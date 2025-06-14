import { queryOrder } from 'binance-pay';
import { createClient } from '@/utils/supabase/server';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prepayId, orderId } = req.body;

    if (!prepayId || !orderId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Consultar el estado del pedido en Binance Pay
    const paymentQuery = await queryOrder({
      prepayId: prepayId,
      APIKEY: process.env.BINANCE_PAY_API_KEY!,
      SECRETKEY: process.env.BINANCE_PAY_SECRET_KEY!,
    });

    if (paymentQuery.status !== 'SUCCESS') {
      return res.status(400).json({
        error: 'Failed to query Binance Pay order',
        details: paymentQuery,
      });
    }

    const orderStatus = paymentQuery.data.status;

    // Actualizar el estado del pedido en la base de datos
    const supabase = await createClient();

    let newStatus = 'pending';
    if (orderStatus === 'PAID') {
      newStatus = 'completed';
    } else if (
      orderStatus === 'CANCELLED' ||
      orderStatus === 'ERROR' ||
      orderStatus === 'EXPIRED'
    ) {
      newStatus = 'failed';
    }

    if (newStatus !== 'pending') {
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          payment_status: orderStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Error updating order status:', updateError);
      }
    }

    return res.status(200).json({
      status: paymentQuery.status,
      orderStatus: orderStatus,
      data: paymentQuery.data,
    });
  } catch (error: unknown) {
    console.error('Error checking Binance Pay payment:', error);

    if (error instanceof Error) {
      return res.status(500).json({
        error: 'Internal server error',
        details: error.message,
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      details: 'An unexpected error occurred',
    });
  }
}
