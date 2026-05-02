import { notFound } from 'next/navigation';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OrderPageClient } from '@/components/shop/order-page-client';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PedidoPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/pedido/${id}`);
  }

  // Verify the order exists and belongs to this user (RLS enforces this)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: order } = await (supabase as any)
    .from('orders')
    .select('id')
    .eq('id', id)
    .single();

  if (!order) notFound();

  return <OrderPageClient orderId={id} />;
}
