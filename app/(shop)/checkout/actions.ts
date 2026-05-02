'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface SaveAddressInput {
  recipient_name: string;
  zip_code: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  label?: string;
  is_default: boolean;
}

const VALID_STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];

const MAX_ADDRESSES_PER_USER = 20;

function validateAddress(input: SaveAddressInput): string | null {
  if (!input.recipient_name?.trim()) return 'Nome do destinatário é obrigatório.';
  if (input.recipient_name.length > 120) return 'Nome muito longo.';

  const zip = input.zip_code.replace(/\D/g, '');
  if (zip.length !== 8) return 'CEP inválido.';

  if (!input.street?.trim()) return 'Rua é obrigatória.';
  if (input.street.length > 200) return 'Rua muito longa.';

  if (!input.number?.trim()) return 'Número é obrigatório.';
  if (input.number.length > 20) return 'Número muito longo.';

  if (!input.district?.trim()) return 'Bairro é obrigatório.';
  if (!input.city?.trim()) return 'Cidade é obrigatória.';

  const state = input.state?.trim().toUpperCase();
  if (!VALID_STATES.includes(state)) return 'Estado inválido. Use a sigla (ex: SP).';

  if (input.label && input.label.length > 50) return 'Apelido muito longo.';
  if (input.complement && input.complement.length > 100) return 'Complemento muito longo.';

  return null;
}

export async function saveAddress(
  input: SaveAddressInput
): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Não autorizado.' };

  const validationError = validateAddress(input);
  if (validationError) return { error: validationError };

  // Enforce max addresses per user
  const { count } = await supabase
    .from('addresses')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', user.id);

  if ((count ?? 0) >= MAX_ADDRESSES_PER_USER) {
    return { error: `Limite de ${MAX_ADDRESSES_PER_USER} endereços atingido.` };
  }

  // If setting as default, unset all others first
  if (input.is_default) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('profile_id', user.id);
  }

  const { data, error } = await supabase
    .from('addresses')
    .insert({
      profile_id: user.id,
      recipient_name: input.recipient_name.trim(),
      zip_code: input.zip_code.replace(/\D/g, ''),
      street: input.street.trim(),
      number: input.number.trim(),
      complement: input.complement?.trim() || null,
      district: input.district.trim(),
      city: input.city.trim(),
      state: input.state.trim().toUpperCase(),
      label: input.label?.trim() || null,
      is_default: input.is_default,
    })
    .select('id')
    .single();

  if (error) return { error: error.message };

  revalidatePath('/checkout');
  revalidatePath('/conta/enderecos');

  return { id: data.id };
}

export async function setDefaultAddress(addressId: string): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Não autorizado.' };

  // Verify ownership BEFORE making any changes
  const { data: addr } = await supabase
    .from('addresses')
    .select('id')
    .eq('id', addressId)
    .eq('profile_id', user.id)
    .single();

  if (!addr) return { error: 'Endereço não encontrado.' };

  // Unset all, then set new default
  await supabase
    .from('addresses')
    .update({ is_default: false })
    .eq('profile_id', user.id);

  const { error } = await supabase
    .from('addresses')
    .update({ is_default: true })
    .eq('id', addressId)
    .eq('profile_id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/checkout');
  return {};
}
