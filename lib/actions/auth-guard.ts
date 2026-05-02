import { createClient } from '@/lib/supabase/server';

/**
 * Verifica se o usuário autenticado tem role 'admin'.
 * Use no início de toda Server Action administrativa.
 * Retorna { error } se não autorizado, ou { supabase } se ok.
 */
export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Não autorizado.' as const, supabase: null };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { error: 'Acesso negado.' as const, supabase: null };
  }

  return { error: null, supabase };
}
