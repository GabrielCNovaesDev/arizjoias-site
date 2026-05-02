'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/stores/cart-store';
import { AddressForm } from '@/components/shop/address-form';
import { ShippingCalculator } from '@/components/shop/shipping-calculator';
import { centsToReais } from '@/lib/utils/currency';
import { setDefaultAddress } from '@/app/(shop)/checkout/actions';
import type { AddressFromCep } from '@/lib/viacep';

interface Address {
  id: string;
  recipient_name: string;
  zip_code: string;
  street: string;
  number: string;
  complement: string | null;
  district: string;
  city: string;
  state: string;
  label: string | null;
  is_default: boolean;
}

interface CheckoutClientProps {
  savedAddresses: Address[];
}

export function CheckoutClient({ savedAddresses }: CheckoutClientProps) {
  const [addresses, setAddresses] = useState<Address[]>(savedAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    savedAddresses.find((a) => a.is_default)?.id ?? savedAddresses[0]?.id ?? null
  );
  const [showNewForm, setShowNewForm] = useState(savedAddresses.length === 0);
  const [shippingAddress, setShippingAddress] = useState<AddressFromCep | null>(null);

  const items = useCartStore((s) => s.items);
  const selectedShipping = useCartStore((s) => s.selectedShipping);
  const getSubtotalCents = useCartStore((s) => s.getSubtotalCents);
  const getTotalCents = useCartStore((s) => s.getTotalCents);

  const canContinue = !!selectedAddressId && !!selectedShipping;

  function handleAddressSaved(id: string) {
    // Reload page to get fresh address list from server
    window.location.reload();
  }

  async function handleSelectAddress(id: string) {
    setSelectedAddressId(id);
    await setDefaultAddress(id);
  }

  const selectedAddr = addresses.find((a) => a.id === selectedAddressId);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 48, alignItems: 'start' }}>
      {/* Left — address + shipping */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--color-primary)', paddingBottom: 20 }}>
          {[
            { n: 1, label: 'Endereço', active: true },
            { n: 2, label: 'Pagamento', active: false },
            { n: 3, label: 'Confirmação', active: false },
          ].map((step, i) => (
            <div key={step.n} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              {i > 0 && (
                <div style={{ width: 32, height: 1, background: 'var(--color-primary-dark)', margin: '0 8px' }} />
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: step.active ? 'var(--color-sage-dark)' : 'var(--color-surface)',
                  border: `1px solid ${step.active ? 'var(--color-sage-dark)' : 'var(--color-primary-dark)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 500,
                  color: step.active ? 'var(--color-bg)' : 'var(--color-text-light)',
                }}>
                  {step.n}
                </div>
                <span style={{
                  fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
                  color: step.active ? 'var(--color-text)' : 'var(--color-text-light)',
                }}>
                  {step.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Saved addresses */}
        {addresses.length > 0 && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300, margin: '0 0 16px' }}>
              Endereço de entrega
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '14px 16px',
                    border: `1px solid ${selectedAddressId === addr.id ? 'var(--color-sage)' : 'var(--color-primary-dark)'}`,
                    background: selectedAddressId === addr.id ? 'var(--color-sage-pale)' : 'var(--color-bg)',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  <input
                    type="radio"
                    name="address"
                    value={addr.id}
                    checked={selectedAddressId === addr.id}
                    onChange={() => handleSelectAddress(addr.id)}
                    style={{ accentColor: 'var(--color-sage-dark)', marginTop: 2, flexShrink: 0 }}
                  />
                  <div>
                    {addr.label && (
                      <div style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-sage-dark)', marginBottom: 4 }}>
                        {addr.label}
                      </div>
                    )}
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)' }}>{addr.recipient_name}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                      {addr.street}, {addr.number}{addr.complement ? `, ${addr.complement}` : ''} — {addr.district}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                      {addr.city} / {addr.state} · {addr.zip_code.replace(/(\d{5})(\d{3})/, '$1-$2')}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {!showNewForm && (
              <button
                type="button"
                onClick={() => setShowNewForm(true)}
                style={{
                  marginTop: 12, background: 'none', border: '1px dashed var(--color-primary-dark)',
                  padding: '10px 20px', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
                  cursor: 'pointer', fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', width: '100%',
                }}
              >
                + Novo endereço
              </button>
            )}
          </div>
        )}

        {/* New address form */}
        {showNewForm && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300, margin: '0 0 16px' }}>
              {addresses.length === 0 ? 'Endereço de entrega' : 'Novo endereço'}
            </h2>
            <AddressForm
              onSaved={handleAddressSaved}
              onCancel={addresses.length > 0 ? () => setShowNewForm(false) : undefined}
            />
          </div>
        )}

        {/* Shipping options — shown after address selected */}
        {selectedAddressId && !showNewForm && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300, margin: '0 0 16px' }}>
              Opções de frete
            </h2>
            <ShippingCalculator
              onAddressResolved={setShippingAddress}
            />
            {!selectedShipping && (
              <p style={{ fontSize: 11, color: 'var(--color-text-light)', marginTop: 8 }}>
                Digite o CEP acima para ver as opções de frete disponíveis.
              </p>
            )}
          </div>
        )}

        {/* Continue button */}
        <div style={{ paddingTop: 8 }}>
          <Link
            href="/checkout/pagamento"
            className="az-btn az-btn-primary"
            style={{
              display: 'inline-flex',
              opacity: canContinue ? 1 : 0.4,
              pointerEvents: canContinue ? 'auto' : 'none',
            }}
            aria-disabled={!canContinue}
            tabIndex={canContinue ? 0 : -1}
          >
            Continuar para pagamento →
          </Link>
          {!canContinue && (
            <p style={{ fontSize: 11, color: 'var(--color-text-light)', marginTop: 8 }}>
              {!selectedAddressId
                ? 'Selecione ou cadastre um endereço de entrega.'
                : 'Selecione uma opção de frete para continuar.'}
            </p>
          )}
        </div>
      </div>

      {/* Right — order summary */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-primary)',
          padding: '24px',
          position: 'sticky',
          top: 100,
        }}
      >
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 300, margin: '0 0 20px' }}>
          Resumo
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {items.map((item) => (
            <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-text-muted)' }}>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>
                {item.name} × {item.quantity}
              </span>
              <span style={{ whiteSpace: 'nowrap' }}>{centsToReais(item.priceCents * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid var(--color-primary)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-text-muted)' }}>
            <span>Subtotal</span>
            <span>{centsToReais(getSubtotalCents())}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-text-muted)' }}>
            <span>Frete</span>
            <span>{selectedShipping ? centsToReais(selectedShipping.priceCents) : '—'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 500, color: 'var(--color-text)', paddingTop: 8, borderTop: '1px solid var(--color-primary)', marginTop: 4 }}>
            <span>Total</span>
            <span style={{ color: 'var(--color-gold)' }}>{centsToReais(getTotalCents())}</span>
          </div>
        </div>

        <Link
          href="/carrinho"
          style={{ display: 'block', textAlign: 'center', marginTop: 16, fontSize: 11, color: 'var(--color-text-light)', letterSpacing: '0.1em' }}
        >
          ← Editar carrinho
        </Link>
      </div>
    </div>
  );
}
