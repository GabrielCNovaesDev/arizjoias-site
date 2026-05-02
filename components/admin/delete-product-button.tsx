'use client';

import { useState, useTransition } from 'react';

interface DeleteProductButtonProps {
  productId: string;
  deleteAction: (id: string) => Promise<{ error: string } | void>;
  duplicateAction: (id: string) => Promise<{ error: string } | void>;
}

export function DeleteProductButton({
  productId,
  deleteAction,
  duplicateAction,
}: DeleteProductButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPendingDelete, startDeleteTransition] = useTransition();
  const [isPendingDuplicate, startDuplicateTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startDeleteTransition(async () => {
      const result = await deleteAction(productId);
      if (result?.error) {
        setError(result.error);
        setConfirming(false);
      }
    });
  }

  function handleDuplicate() {
    setError(null);
    startDuplicateTransition(async () => {
      const result = await duplicateAction(productId);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto', flexWrap: 'wrap' }}>
      {error && (
        <span style={{ fontSize: 11, color: '#b91c1c', background: '#fef2f2', border: '1px solid #fca5a5', padding: '6px 12px' }}>
          {error}
        </span>
      )}

      {/* Duplicate */}
      <button
        type="button"
        onClick={handleDuplicate}
        disabled={isPendingDuplicate}
        style={{
          background: 'none',
          border: '1px solid var(--color-primary-dark)',
          padding: '8px 16px',
          fontSize: 11,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          cursor: isPendingDuplicate ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-body)',
          color: 'var(--color-text-muted)',
          opacity: isPendingDuplicate ? 0.6 : 1,
        }}
      >
        {isPendingDuplicate ? 'Duplicando...' : 'Duplicar'}
      </button>

      {/* Delete */}
      {confirming ? (
        <>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Confirmar exclusão?</span>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPendingDelete}
            style={{
              background: '#b91c1c',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: isPendingDelete ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-body)',
              opacity: isPendingDelete ? 0.6 : 1,
            }}
          >
            {isPendingDelete ? 'Excluindo...' : 'Sim, excluir'}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            style={{
              background: 'none',
              border: '1px solid var(--color-primary-dark)',
              padding: '8px 16px',
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text-muted)',
            }}
          >
            Cancelar
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          style={{
            background: 'none',
            border: '1px solid #fca5a5',
            padding: '8px 16px',
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            color: '#b91c1c',
          }}
        >
          Excluir produto
        </button>
      )}
    </div>
  );
}
