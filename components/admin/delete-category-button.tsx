'use client';

import { useState, useTransition } from 'react';

interface DeleteCategoryButtonProps {
  categoryId: string;
  deleteAction: (id: string) => Promise<{ error: string } | void>;
}

export function DeleteCategoryButton({ categoryId, deleteAction }: DeleteCategoryButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteAction(categoryId);
      if (result?.error) {
        setError(result.error);
        setConfirming(false);
      }
    });
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span
          style={{
            fontSize: 11,
            color: '#b91c1c',
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            padding: '6px 12px',
          }}
        >
          {error}
        </span>
        <button
          type="button"
          onClick={() => setError(null)}
          style={{
            fontSize: 10,
            color: 'var(--color-text-light)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Fechar
        </button>
      </div>
    );
  }

  if (confirming) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
          Confirmar exclusão?
        </span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          style={{
            background: '#b91c1c',
            color: '#fff',
            border: 'none',
            padding: '8px 16px',
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: isPending ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-body)',
            opacity: isPending ? 0.6 : 1,
          }}
        >
          {isPending ? 'Excluindo...' : 'Sim, excluir'}
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
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      style={{
        marginLeft: 'auto',
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
      Excluir categoria
    </button>
  );
}
