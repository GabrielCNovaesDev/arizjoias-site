import { mpPayment } from '@/lib/mercadopago/client';
import { createAdminClient } from '@/lib/supabase/admin';
import crypto from 'crypto';

// Verify Mercado Pago webhook signature
function verifySignature(request: Request, rawBody: string): boolean {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  if (!secret) return false;

  const signature = request.headers.get('x-signature');
  const requestId = request.headers.get('x-request-id');
  if (!signature || !requestId) return false;

  const parts = signature.split(',');
  const ts = parts.find((p) => p.startsWith('ts='))?.split('=')[1];
  const v1 = parts.find((p) => p.startsWith('v1='))?.split('=')[1];
  if (!ts || !v1) return false;

  const url = new URL(request.url);
  const dataId = url.searchParams.get('data.id');

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(manifest)
    .digest('hex');

  try {
    const v1Buf = Buffer.from(v1);
    const expectedBuf = Buffer.from(expected);
    // timingSafeEqual requires same length buffers
    if (v1Buf.length !== expectedBuf.length) return false;
    return crypto.timingSafeEqual(v1Buf, expectedBuf);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  // Verify signature whenever secret is configured (not just in production)
  if (process.env.MERCADO_PAGO_WEBHOOK_SECRET) {
    if (!verifySignature(request, rawBody)) {
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }
  }

  let data: { type?: string; data?: { id?: string | number } };
  try {
    data = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Only handle payment events
  if (data.type !== 'payment') {
    return Response.json({ received: true });
  }

  const paymentId = data.data?.id;
  if (!paymentId) {
    return Response.json({ error: 'Missing payment id' }, { status: 400 });
  }

  try {
    // Fetch payment details from MP
    const payment = await mpPayment.get({ id: Number(paymentId) });
    const orderId = payment.external_reference;

    if (!orderId) {
      return Response.json({ error: 'Missing external_reference' }, { status: 400 });
    }

    // Use admin client — webhook has no authenticated user
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any;

    // Fetch order with items
    const { data: order } = await supabase
      .from('orders')
      .select('id, status, order_items(product_id, quantity)')
      .eq('id', orderId)
      .single();

    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    if (payment.status === 'approved' && order.status === 'pending_payment') {
      // 1. Update order to paid
      await supabase
        .from('orders')
        .update({
          status: 'paid',
          mp_payment_id: String(paymentId),
          payment_method: payment.payment_method_id ?? null,
          payment_confirmed_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      // 2. Decrement stock for each item
      for (const item of order.order_items as { product_id: string | null; quantity: number }[]) {
        if (item.product_id) {
          await supabase.rpc('decrement_stock', {
            product_id: item.product_id,
            amount: item.quantity,
          });
        }
      }

      // TODO Sprint 5: send confirmation email
    } else if (
      payment.status === 'rejected' ||
      payment.status === 'cancelled'
    ) {
      // Only cancel if still pending — idempotent
      if (order.status === 'pending_payment') {
        await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', orderId);
      }
    }

    return Response.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
