'use client';

import { useState, useRef } from 'react';
import type { AddressFromCep } from '@/lib/viacep';

interface CepInputProps {
  onAddress: (address: AddressFromCep) => void;
  onError?: (msg: string) => void;
  defaultValue?: string;
  label?: string;
  required?: boolean;
  instanceId?: string; // unique suffix for id to avoid duplicate ids on same page
}

export function CepInput({
  onAddress,
  onError,
  defaultValue = '',
  label = 'CEP',
  required = false,
  instanceId = 'default',
}: CepInputProps) {
  const [value, setValue] = useState(defaultValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  function formatCep(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    return digits;
  }

  async function lookup(digits: string) {
    // Cancel any in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/shipping/lookup-cep?cep=${digits}`, {
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg = body.error ?? 'CEP não encontrado.';
        setError(msg);
        onError?.(msg);
        return;
      }

      const address: AddressFromCep = await res.json();
      onAddress(address);
      setError(null);
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      const msg = 'Erro ao buscar CEP. Tente novamente.';
      setError(msg);
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatCep(e.target.value);
    setValue(formatted);

    const digits = formatted.replace(/\D/g, '');
    if (digits.length === 8) {
      lookup(digits);
    } else {
      setError(null);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--color-surface)',
    border: `1px solid ${error ? '#fca5a5' : 'var(--color-primary-dark)'}`,
    padding: '10px 14px',
    fontSize: 13,
    fontFamily: 'var(--font-body)',
    color: 'var(--color-text)',
    outline: 'none',
    letterSpacing: '0.08em',
  };

  const inputId = `cep-input-${instanceId}`;

  return (
    <div>
      <label
        htmlFor={inputId}
        style={{
          display: 'block',
          fontSize: 10,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
          marginBottom: 6,
        }}
      >
        {label}{required && ' *'}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          value={value}
          onChange={handleChange}
          placeholder="00000-000"
          required={required}
          style={inputStyle}
          aria-describedby={error ? `${inputId}-error` : undefined}
          aria-invalid={!!error}
        />
        {loading && (
          <div
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 14,
              height: 14,
              border: '2px solid var(--color-primary-dark)',
              borderTopColor: 'var(--color-sage)',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
            }}
            aria-hidden="true"
          />
        )}
      </div>
      {error && (
      <p
        id={`${inputId}-error`}
        role="alert"
        style={{
          fontSize: 11,
          color: '#b91c1c',
          marginTop: 4,
        }}
      >
          {error}
        </p>
      )}
    </div>
  );
}
