import { createClient } from '@/lib/supabase/server';
import { mpPreference } from '@/lib/mercadopago/client';

type PaymentMethod = 'pix' | 'credit_card' | 'boleto';

const PAYMENT_METHOD_EXCLUSIONS: Record<PaymentMethod, string[]> = {
  pix: ['credit_card', 'debit_card', 'ticket'],
  credit_card: ['pix', 'debit_card', 'ticket'],
  boleto: ['pix', 'credit_card', 'debit_card'],
};

interface CartItemPayload {
  productId: string;
  quantity: number;
}

interface ShippingPayload {
  id: number;
  name: string;
  company: string;
  priceCents: number;
  deliveryDays: number;
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
    addressId?: string;
    paymentMethod?: PaymentMethod;
  };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Payload inválido.' }, { status: 400 });
  }

  const { items, shipping, addressId, paymentMethod = 'pix' } = body;

  if (!items?.length || !shipping || !addressId) {
    return Response.json({ error: 'Dados incompletos.' }, { status: 400 });
  }

  // Validate items structure
  for (const item of items) {
    if (!item.productId || !Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > 100) {
      return Response.json({ error: 'Item inválido.' }, { status: 400 });
    }
  }

  // 1. Validate address belongs to user
  const { data: address } = await supabase
    .from('addresses')
    .select('id, recipient_name, zip_code, street, number, complement, district, city, state')
    .eq('id', addressId)
    .eq('profile_id', user.id)
    .single();

  if (!address) {
    return Response.json({ error: 'Endereço não encontrado.' }, { status: 400 });
  }

  // 2. Validate products: fetch real prices and stock from DB
  const productIds = items.map((i) => i.productId);
  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug, price_cents, promotional_price_cents, stock, product_images(url, display_order)')
    .in('id', productIds)
    .eq('is_active', true);

  if (!products || products.length !== productIds.length) {
    return Response.json({ error: 'Um ou mais produtos não estão disponíveis.' }, { status: 400 });
  }

  // Check stock and build validated items
  const validatedItems: {
    productId: string;
    name: string;
    slug: string;
    imageUrl: string;
    priceCents: number;
    quantity: number;
  }[] = [];

  for (const cartItem of items) {
    const product = products.find((p) => p.id === cartItem.productId);
    if (!product) {
      return Response.json({ error: 'Produto não encontrado.' }, { status: 400 });
    }
    if (product.stock < cartItem.quantity) {
      return Response.json(
        { error: `Estoque insuficiente para "${product.name}". Disponível: ${product.stock}.` },
        { status: 400 }
      );
    }

    // Use real price from DB — never trust client
    const priceCents = product.promotional_price_cents ?? product.price_cents;
    const sortedImages = [...(product.product_images ?? [])].sort(
      (a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order
    );

    validatedItems.push({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      imageUrl: (sortedImages[0] as { url: string } | undefined)?.url ?? '',
      priceCents,
      quantity: cartItem.quantity,
    });
  }

  // Validate shipping
  if (shipping.priceCents < 0 || shipping.priceCents > 100_000_00) {
    return Response.json({ error: 'Frete inválido.' }, { status: 400 });
  }

  const subtotalCents = validatedItems.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);
  const totalCents = subtotalCents + shipping.priceCents;

  // 3. Create order with pending_payment status
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: order, error: orderError } = await (supabase as any)
    .from('orders')
    .insert({
      profile_id: user.id,
      status: 'pending_payment',
      shipping_recipient_name: address.recipient_name,
      shipping_zip_code: address.zip_code,
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

  // 4. Insert order items
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: itemsError } = await (supabase as any).from('order_items').insert(
    validatedItems.map((item) => ({
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('orders').delete().eq('id', order.id);
    console.error('Order items error:', itemsError);
    return Response.json({ error: 'Erro ao salvar itens do pedido.' }, { status: 500 });
  }

  // 5. Create Mercado Pago preference
  try {
    const excludedTypes = PAYMENT_METHOD_EXCLUSIONS[paymentMethod] ?? [];

    const preference = await mpPreference.create({
      body: {
        items: validatedItems.map((i) => ({
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
          excluded_payment_types: excludedTypes.map((id) => ({ id })),
        },
      },
    });

    if (!preference.init_point) {
      throw new Error('Mercado Pago não retornou URL de pagamento.');
    }

    // 6. Save preference_id on order
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', order.id);
    return Response.json({ error: 'Erro ao criar preferência de pagamento.' }, { status: 500 });
  }
}
