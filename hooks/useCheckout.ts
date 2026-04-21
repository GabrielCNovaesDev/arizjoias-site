'use client';

import { useState } from 'react';
import type { CartItem } from '@/types';

interface CheckoutResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

export function useCheckout() {
  const [loading, setLoading] = useState(false);

  // Prepared for future Stripe / Mercado Pago integration.
  // Replace the body of initiatePayment with the real payment SDK call.
  async function initiatePayment(cartItems: CartItem[]): Promise<CheckoutResult> {
    setLoading(true);
    try {
      console.log('[Checkout] Initiating payment for items:', cartItems);

      // Simulate async payment gateway call
      await new Promise((r) => setTimeout(r, 1200));

      const orderId = `ORD-${Date.now()}`;
      console.log('[Checkout] Order created:', orderId);

      return { success: true, orderId };
    } catch (err) {
      console.error('[Checkout] Payment error:', err);
      return { success: false, error: 'Erro ao processar pagamento. Tente novamente.' };
    } finally {
      setLoading(false);
    }
  }

  return { initiatePayment, loading };
}
