import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

// In test mode we use the same token (test credentials start with APP_USR-)
// In production, swap for live credentials via env vars
export const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
  options: { timeout: 5000 },
});

export const mpPreference = new Preference(mpClient);
export const mpPayment = new Payment(mpClient);
