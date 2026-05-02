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

export async function saveAddress(
  input: SaveAddressInput
): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Não autorizado.' };

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
      state: input.state.trim(),
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Não autorizado.' };

  // Unset all
  await supabase
    .from('addresses')
    .update({ is_default: false })
    .eq('profile_id', user.id);

  // Set new default
  const { error } = await supabase
    .from('addresses')
    .update({ is_default: true })
    .eq('id', addressId)
    .eq('profile_id', user.id); // ensure ownership

  if (error) return { error: error.message };

  revalidatePath('/checkout');
  return {};
}
