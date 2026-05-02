'use client';

import { useState, useTransition } from 'react';
import { CepInput } from '@/components/shop/cep-input';
import { saveAddress, type SaveAddressInput } from '@/app/(shop)/checkout/actions';
import type { AddressFromCep } from '@/lib/viacep';

interface AddressFormProps {
  onSaved: (id: string, address: {
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
  }) => void;
  onCancel?: () => void;
}

export function AddressForm({ onSaved, onCancel }: AddressFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<SaveAddressInput>>({ is_default: false });

  function set(field: keyof SaveAddressInput, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleAddress(address: AddressFromCep) {
    setForm((prev) => ({
      ...prev,
      zip_code: address.zipCode,
      street: address.street,
      district: address.district,
      city: address.city,
      state: address.state,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const required: (keyof SaveAddressInput)[] = [
      'recipient_name', 'zip_code', 'street', 'number', 'district', 'city', 'state',
    ];
    for (const field of required) {
      if (!form[field]) {
        setError('Preencha todos os campos obrigatórios.');
        return;
      }
    }

    startTransition(async () => {
      const input = form as SaveAddressInput;
      const result = await saveAddress(input);
      if ('error' in result) {
        setError(result.error);
      } else {
        onSaved(result.id, {
          id: result.id,
          recipient_name: input.recipient_name,
          zip_code: input.zip_code.replace(/\D/g, ''),
          street: input.street,
          number: input.number,
          complement: input.complement ?? null,
          district: input.district,
          city: input.city,
          state: input.state,
          label: input.label ?? null,
          is_default: input.is_default,
        });
      }
    });
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-primary-dark)',
    padding: '10px 14px',
    fontSize: 13,
    fontFamily: 'var(--font-body)',
    color: 'var(--color-text)',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 10,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: 'var(--color-text-muted)',
    marginBottom: 5,
  };

  const field = (label: string, key: keyof SaveAddressInput, opts?: {
    placeholder?: string;
    required?: boolean;
    style?: React.CSSProperties;
  }) => (
    <div>
      <label style={labelStyle}>{label}{opts?.required !== false && ' *'}</label>
      <input
        type="text"
        value={(form[key] as string) ?? ''}
        onChange={(e) => set(key, e.target.value)}
        placeholder={opts?.placeholder}
        style={{ ...inputStyle, ...opts?.style }}
        required={opts?.required !== false}
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '10px 14px', fontSize: 12 }}>
          {error}
        </div>
      )}

      {field('Nome do destinatário', 'recipient_name', { placeholder: 'Nome completo' })}
      {field('Apelido do endereço', 'label', { placeholder: 'Ex: Casa, Trabalho', required: false })}

      <CepInput
        onAddress={handleAddress}
        defaultValue={form.zip_code ?? ''}
        required
        instanceId="address-form"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 12 }}>
        {field('Rua / Logradouro', 'street', { placeholder: 'Rua das Flores' })}
        {field('Número', 'number', { placeholder: '123' })}
      </div>

      {field('Complemento', 'complement', { placeholder: 'Apto, bloco...', required: false })}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {field('Bairro', 'district')}
        {field('Cidade', 'city')}
      </div>

      {field('Estado', 'state', { placeholder: 'SP', style: { width: 80 } })}

      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
        <input
          type="checkbox"
          checked={!!form.is_default}
          onChange={(e) => set('is_default', e.target.checked)}
          style={{ width: 15, height: 15, accentColor: 'var(--color-sage-dark)' }}
        />
        Salvar como endereço padrão
      </label>

      <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
        <button
          type="submit"
          disabled={isPending}
          className="az-btn az-btn-primary"
          style={{ opacity: isPending ? 0.6 : 1 }}
        >
          {isPending ? 'Salvando...' : 'Salvar endereço'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="az-btn az-btn-ghost">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
