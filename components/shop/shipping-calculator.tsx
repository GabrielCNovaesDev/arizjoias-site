'use client';

import { useState, useRef, useEffect } from 'react';
import { CepInput } from '@/components/shop/cep-input';
import { useCartStore, type ShippingOption } from '@/stores/cart-store';
import { centsToReais } from '@/lib/utils/currency';
import type { AddressFromCep } from '@/lib/viacep';

interface ShippingCalculatorProps {
  onAddressResolved?: (address: AddressFromCep) => void;
  defaultCep?: string;
  instanceId?: string; // unique id for CepInput label/input when multiple on page
}

export function ShippingCalculator({
  onAddressResolved,
  defaultCep = '',
  instanceId = 'shipping',
}: ShippingCalculatorProps) {
  const [options, setOptions] = useState<ShippingOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvedCep, setResolvedCep] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const items = useCartStore((s) => s.items);
  const selectedShipping = useCartStore((s) => s.selectedShipping);
  const setShipping = useCartStore((s) => s.setShipping);

  // Auto-calculate when defaultCep is provided (e.g. from saved address)
  useEffect(() => {
    const digits = defaultCep.replace(/\D/g, '');
    if (digits.length === 8) {
      fetchShipping(digits);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultCep]);

  async function handleAddress(address: AddressFromCep) {
    setResolvedCep(address.zipCode);
    onAddressResolved?.(address);
    await fetchShipping(address.zipCode);
  }

  async function fetchShipping(zipCode: string) {
    // Cancel any in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);
    setOptions([]);
    setShipping(null);

    try {
      const res = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zipCode,
          items: items.map((i) => ({
            weightGrams: i.weightGrams,
            widthCm: i.widthCm,
            heightCm: i.heightCm,
            lengthCm: i.lengthCm,
            priceCents: i.priceCents,
            quantity: i.quantity,
          })),
        }),
        signal: abortRef.current.signal,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Erro ao calcular frete.');
        return;
      }

      if (!data.options?.length) {
        setError('Nenhuma opção de frete disponível para esse CEP.');
        return;
      }

      setOptions(data.options);
      setResolvedCep(zipCode);
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <CepInput
        onAddress={handleAddress}
        onError={(msg) => setError(msg)}
        defaultValue={defaultCep}
        label="CEP de entrega"
        instanceId={instanceId}
      />

      {loading && (
        <div style={{ fontSize: 12, color: 'var(--color-text-light)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 12, height: 12,
              border: '2px solid var(--color-primary-dark)',
              borderTopColor: 'var(--color-sage)',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
              flexShrink: 0,
            }}
          />
          Calculando opções de frete...
        </div>
      )}

      {error && !loading && (
        <p style={{ fontSize: 11, color: '#b91c1c', margin: 0 }}>{error}</p>
      )}

      {options.length > 0 && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
            Opções para {resolvedCep?.replace(/(\d{5})(\d{3})/, '$1-$2')}
          </div>
          {options.map((opt) => (
            <label
              key={opt.id}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px',
                border: `1px solid ${selectedShipping?.id === opt.id ? 'var(--color-sage)' : 'var(--color-primary-dark)'}`,
                background: selectedShipping?.id === opt.id ? 'var(--color-sage-pale)' : 'var(--color-bg)',
                cursor: 'pointer', transition: 'all 0.15s', gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="radio"
                  name={`shipping-${instanceId}`}
                  value={opt.id}
                  checked={selectedShipping?.id === opt.id}
                  onChange={() => setShipping(opt)}
                  style={{ accentColor: 'var(--color-sage-dark)', width: 14, height: 14 }}
                />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text)' }}>{opt.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-light)', marginTop: 2 }}>
                    {opt.company} · {opt.deliveryDays} {opt.deliveryDays === 1 ? 'dia útil' : 'dias úteis'}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-gold)', whiteSpace: 'nowrap' }}>
                {centsToReais(opt.priceCents)}
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
