import { createClient } from '@/lib/supabase/server';
import { mpPreference } from '@/lib/mercadopago/client';

interface CartItemPayload {
  productId: string;
  name: string;
  slug: string;
  imageUrl: string;
  priceCents: number;
  quantity: number;
}

interface ShippingPayload {
  id: number;
  name: string;
  company: string;
  priceCents: number;
  deliveryDays: number;
}

interface AddressPayload {
  recipientName: string;
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  let body: {
    items?: CartItemPayload[];
    shipping?: ShippingPayload;
    address?: AddressPayload;
  };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Payload inválido.' }, { status: 400 });
  }

  const { items, shipping, address } = body;

  if (!items?.length || !shipping || !address) {
    return Response.json({ error: 'Dados incompletos.' }, { status: 400 });
  }

  // Validate items
  for (const item of items) {
    if (!item.productId || !item.name || item.priceCents <= 0 || item.quantity <= 0) {
      return Response.json({ error: 'Item inválido.' }, { status: 400 });
    }
  }

  const subtotalCents = items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);
  const totalCents = subtotalCents + shipping.priceCents;

  // 1. Create order with pending_payment status
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: order, error: orderError } = await (supabase as any)
    .from('orders')
    .insert({
      profile_id: user.id,
      status: 'pending_payment',
      shipping_recipient_name: address.recipientName,
      shipping_zip_code: address.zipCode.replace(/\D/g, ''),
      shipping_street: address.street,
      shipping_number: address.number,
      shipping_complement: address.complement ?? null,
      shipping_district: address.district,
      shipping_city: address.city,
      shipping_state: address.state,
      shipping_method_name: shipping.name,
      shipping_company: shipping.company,
      shipping_price_cents: shipping.priceCents,
      shipping_delivery_days: shipping.deliveryDays,
      subtotal_cents: subtotalCents,
      total_cents: totalCents,
    })
    .select('id')
    .single();

  if (orderError || !order) {
    console.error('Order creation error:', orderError);
    return Response.json({ error: 'Erro ao criar pedido.' }, { status: 500 });
  }

  // 2. Insert order items
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: itemsError } = await (supabase as any).from('order_items').insert(
    items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.name,
      product_slug: item.slug,
      product_image_url: item.imageUrl || null,
      unit_price_cents: item.priceCents,
      quantity: item.quantity,
      subtotal_cents: item.priceCents * item.quantity,
    }))
  );

  if (itemsError) {
    // Rollback order
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('orders').delete().eq('id', order.id);
    console.error('Order items error:', itemsError);
    return Response.json({ error: 'Erro ao salvar itens do pedido.' }, { status: 500 });
  }

  // 3. Create Mercado Pago preference
  try {
    const preference = await mpPreference.create({
      body: {
        items: items.map((i) => ({
          id: i.productId,
          title: i.name,
          quantity: i.quantity,
          unit_price: i.priceCents / 100,
          currency_id: 'BRL',
          picture_url: i.imageUrl || undefined,
        })),
        shipments: {
          cost: shipping.priceCents / 100,
          mode: 'not_specified',
        },
        payer: { email: user.email },
        external_reference: order.id,
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/pedido/${order.id}`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/pagamento?error=true`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/pedido/${order.id}`,
        },
        auto_return: 'approved',
        notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
        payment_methods: {
          installments: 6,
        },
      },
    });

    // 4. Save preference_id on order
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('orders')
      .update({ mp_preference_id: preference.id })
      .eq('id', order.id);

    return Response.json({
      orderId: order.id,
      preferenceId: preference.id,
      initPoint: preference.init_point,
    });
  } catch (err) {
    console.error('MP preference error:', err);
    // Mark order as cancelled since MP failed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', order.id);
    return Response.json({ error: 'Erro ao criar preferência de pagamento.' }, { status: 500 });
  }
}
