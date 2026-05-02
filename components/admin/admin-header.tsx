import { createClient } from '@/lib/supabase/server';

export async function AdminHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()
    : { data: null };

  const displayName = profile?.full_name ?? user?.email ?? 'Admin';

  return (
    <header
      style={{
        height: 60,
        background: 'var(--color-bg)',
        borderBottom: '1px solid var(--color-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        flexShrink: 0,
      }}
    >
      <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
        Painel Administrativo
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text)' }}>{displayName}</div>
          <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-text-light)' }}>
            Administradora
          </div>
        </div>

        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            style={{
              background: 'none',
              border: '1px solid var(--color-primary-dark)',
              padding: '7px 16px',
              fontSize: 10,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              transition: 'all 0.2s',
            }}
          >
            Sair
          </button>
        </form>
      </div>
    </header>
  );
}
