import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CheckoutClient } from '@/components/shop/checkout-client';

export default async function CheckoutPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/checkout');
  }

  // Note: cart is client-side (Zustand), so we can't check it server-side here.
  // The CheckoutClient handles the empty cart case via canContinue logic.

  const { data: addresses } = await supabase
    .from('addresses')
    .select('id, recipient_name, zip_code, street, number, complement, district, city, state, label, is_default')
    .eq('profile_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '80vh', padding: '48px 48px 96px' }}>
      <div style={{ marginBottom: 40 }}>
        <div className="az-eyebrow" style={{ marginBottom: 8 }}>finalizar pedido</div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 44,
            fontWeight: 300,
            margin: 0,
          }}
        >
          Checkout
        </h1>
      </div>

      <CheckoutClient savedAddresses={addresses ?? []} />
    </div>
  );
}
