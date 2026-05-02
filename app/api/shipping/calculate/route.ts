import { calculateShipping, type CartItemForShipping } from '@/lib/melhor-envio';

const MAX_ITEMS = 50;
const MAX_QUANTITY = 100;
const MAX_WEIGHT_GRAMS = 30000; // 30kg
const MAX_DIMENSION_CM = 200;
const MAX_PRICE_CENTS = 100_000_00; // R$ 100.000

// Simple in-memory rate limiter: max 10 requests per IP per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  if (entry.count >= 10) return false;

  entry.count++;
  return true;
}

function validateItem(item: unknown): item is CartItemForShipping {
  if (!item || typeof item !== 'object') return false;
  const i = item as Record<string, unknown>;
  return (
    typeof i.weightGrams === 'number' && i.weightGrams >= 0 && i.weightGrams <= MAX_WEIGHT_GRAMS &&
    typeof i.widthCm === 'number' && i.widthCm >= 0 && i.widthCm <= MAX_DIMENSION_CM &&
    typeof i.heightCm === 'number' && i.heightCm >= 0 && i.heightCm <= MAX_DIMENSION_CM &&
    typeof i.lengthCm === 'number' && i.lengthCm >= 0 && i.lengthCm <= MAX_DIMENSION_CM &&
    typeof i.priceCents === 'number' && i.priceCents > 0 && i.priceCents <= MAX_PRICE_CENTS &&
    typeof i.quantity === 'number' && i.quantity > 0 && i.quantity <= MAX_QUANTITY &&
    Number.isInteger(i.quantity)
  );
}

export async function POST(request: Request) {
  // Rate limiting by IP
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  if (!checkRateLimit(ip)) {
    return Response.json(
      { error: 'Muitas requisições. Tente novamente em alguns instantes.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { zipCode, items } = body as { zipCode?: unknown; items?: unknown };

    if (typeof zipCode !== 'string' || !zipCode) {
      return Response.json({ error: 'CEP inválido.' }, { status: 400 });
    }

    const cleanedCep = zipCode.replace(/\D/g, '');
    if (cleanedCep.length !== 8) {
      return Response.json({ error: 'CEP deve ter 8 dígitos.' }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return Response.json({ error: 'Carrinho vazio.' }, { status: 400 });
    }

    if (items.length > MAX_ITEMS) {
      return Response.json({ error: 'Número de itens excede o limite.' }, { status: 400 });
    }

    if (!items.every(validateItem)) {
      return Response.json({ error: 'Dados de itens inválidos.' }, { status: 400 });
    }

    const options = await calculateShipping(cleanedCep, items);
    return Response.json({ options });
  } catch (error) {
    console.error('Shipping calculation error:', error);
    return Response.json(
      { error: 'Erro ao calcular frete. Tente novamente.' },
      { status: 500 }
    );
  }
}
