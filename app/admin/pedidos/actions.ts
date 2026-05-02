'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/actions/auth-guard';
import { createAdminClient } from '@/lib/supabase/admin';

type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

// Valid status transitions
const ALLOWED_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  paid: ['preparing', 'cancelled'],
  preparing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
  refunded: [],
  pending_payment: ['cancelled'],
};

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  trackingCode?: string
): Promise<{ error?: string }> {
  const { error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const supabase = createAdminClient();

  // Fetch current order
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: order } = await (supabase as any)
    .from('orders')
    .select('id, status, order_items(product_id, quantity)')
    .eq('id', orderId)
    .single();

  if (!order) return { error: 'Pedido não encontrado.' };

  const currentStatus = order.status as OrderStatus;
  const allowed = ALLOWED_TRANSITIONS[currentStatus] ?? [];

  if (!allowed.includes(newStatus)) {
    return {
      error: `Transição inválida: ${currentStatus} → ${newStatus}.`,
    };
  }

  // Require tracking code when marking as shipped
  if (newStatus === 'shipped' && !trackingCode?.trim()) {
    return { error: 'Código de rastreio é obrigatório para marcar como enviado.' };
  }

  const updateData: Record<string, unknown> = { status: newStatus };
  if (newStatus === 'shipped' && trackingCode) {
    updateData.tracking_code = trackingCode.trim().toUpperCase();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('orders')
    .update(updateData)
    .eq('id', orderId);

  if (error) return { error: error.message };

  // If cancelling a paid/preparing/shipped order, restore stock
  if (
    newStatus === 'cancelled' &&
    ['paid', 'preparing', 'shipped'].includes(currentStatus)
  ) {
    for (const item of order.order_items as { product_id: string | null; quantity: number }[]) {
      if (item.product_id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).rpc('increment_stock', {
          product_id: item.product_id,
          amount: item.quantity,
        });
      }
    }
  }

  revalidatePath('/admin/pedidos');
  revalidatePath(`/admin/pedidos/${orderId}`);
  revalidatePath(`/pedido/${orderId}`);

  return {};
}
