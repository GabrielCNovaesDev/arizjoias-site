'use client';

import { useState, useTransition } from 'react';
import { updateOrderStatus } from '@/app/admin/pedidos/actions';

type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

interface OrderActionsProps {
  orderId: string;
  currentStatus: OrderStatus;
}

const NEXT_STATUS: Partial<Record<OrderStatus, { status: OrderStatus; label: string; requiresTracking?: boolean }>> = {
  paid: { status: 'preparing', label: 'Marcar como em separação' },
  preparing: { status: 'shipped', label: 'Marcar como enviado', requiresTracking: true },
  shipped: { status: 'delivered', label: 'Marcar como entregue' },
};

export function OrderActions({ orderId, currentStatus }: OrderActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');

  const nextAction = NEXT_STATUS[currentStatus];
  const canCancel = !['delivered', 'cancelled', 'refunded'].includes(currentStatus);

  function handleAction(newStatus: OrderStatus, tracking?: string) {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, newStatus, tracking);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess('Status atualizado com sucesso.');
        setShowCancelConfirm(false);
        setShowTrackingModal(false);
        setTrackingCode('');
      }
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '10px 14px', fontSize: 12 }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', color: '#15803d', padding: '10px 14px', fontSize: 12 }}>
          {success}
        </div>
      )}

      {/* Next status action */}
      {nextAction && (
        <>
          {nextAction.requiresTracking ? (
            <button
              onClick={() => setShowTrackingModal(true)}
              disabled={isPending}
              className="az-btn az-btn-primary"
              style={{ opacity: isPending ? 0.6 : 1 }}
            >
              {nextAction.label}
            </button>
          ) : (
            <button
              onClick={() => handleAction(nextAction.status)}
              disabled={isPending}
              className="az-btn az-btn-primary"
              style={{ opacity: isPending ? 0.6 : 1 }}
            >
              {isPending ? 'Atualizando...' : nextAction.label}
            </button>
          )}
        </>
      )}

      {/* Cancel */}
      {canCancel && !showCancelConfirm && (
        <button
          onClick={() => setShowCancelConfirm(true)}
          disabled={isPending}
          className="az-btn az-btn-ghost"
          style={{ fontSize: 11, color: '#b91c1c', borderColor: '#fca5a5' }}
        >
          Cancelar pedido
        </button>
      )}

      {showCancelConfirm && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontSize: 12, color: '#b91c1c', margin: 0 }}>
            Tem certeza? Esta ação irá cancelar o pedido
            {['paid', 'preparing', 'shipped'].includes(currentStatus) ? ' e restaurar o estoque dos produtos.' : '.'}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => handleAction('cancelled')}
              disabled={isPending}
              style={{ background: '#b91c1c', color: '#fff', border: 'none', padding: '8px 16px', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-body)', opacity: isPending ? 0.6 : 1 }}
            >
              {isPending ? 'Cancelando...' : 'Confirmar cancelamento'}
            </button>
            <button
              onClick={() => setShowCancelConfirm(false)}
              disabled={isPending}
              className="az-btn az-btn-ghost"
              style={{ fontSize: 11 }}
            >
              Voltar
            </button>
          </div>
        </div>
      )}

      {/* Tracking code modal */}
      {showTrackingModal && (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-primary-dark)', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text)' }}>
            Código de rastreio
          </div>
          <input
            type="text"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
            placeholder="Ex: BR123456789BR"
            style={{
              background: 'var(--color-bg)', border: '1px solid var(--color-primary-dark)',
              padding: '9px 12px', fontSize: 13, fontFamily: 'monospace', letterSpacing: '0.08em',
              color: 'var(--color-text)', textTransform: 'uppercase',
            }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => handleAction('shipped', trackingCode)}
              disabled={isPending || !trackingCode.trim()}
              className="az-btn az-btn-primary"
              style={{ opacity: isPending || !trackingCode.trim() ? 0.6 : 1, fontSize: 11 }}
            >
              {isPending ? 'Salvando...' : 'Confirmar envio'}
            </button>
            <button
              onClick={() => { setShowTrackingModal(false); setTrackingCode(''); }}
              disabled={isPending}
              className="az-btn az-btn-ghost"
              style={{ fontSize: 11 }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
