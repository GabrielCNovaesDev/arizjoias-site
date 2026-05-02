export interface ShippingOption {
  id: number;
  name: string;
  company: string;
  priceCents: number;
  deliveryDays: number;
}

export interface CartItemForShipping {
  weightGrams: number;
  widthCm: number;
  heightCm: number;
  lengthCm: number;
  priceCents: number;
  quantity: number;
}

export async function calculateShipping(
  destinationZipCode: string,
  items: CartItemForShipping[]
): Promise<ShippingOption[]> {
  const token = process.env.MELHOR_ENVIO_TOKEN;
  const originCep = process.env.MELHOR_ENVIO_CEP_ORIGEM;
  const apiUrl = process.env.MELHOR_ENVIO_API_URL;

  if (!token || !originCep || !apiUrl) {
    throw new Error('Melhor Envio não configurado. Verifique as variáveis de ambiente.');
  }

  const cleanedDest = destinationZipCode.replace(/\D/g, '');
  const cleanedOrigin = originCep.replace(/\D/g, '');

  // Aggregate package: sum weights, max dimensions per axis, total length
  const totalWeightKg = items.reduce(
    (sum, i) => sum + (i.weightGrams * i.quantity) / 1000,
    0
  );
  const totalValueCents = items.reduce(
    (sum, i) => sum + i.priceCents * i.quantity,
    0
  );
  const maxWidth = Math.max(...items.map((i) => i.widthCm));
  const maxHeight = Math.max(...items.map((i) => i.heightCm));
  const totalLength = items.reduce((sum, i) => sum + i.lengthCm * i.quantity, 0);

  const payload = {
    from: { postal_code: cleanedOrigin },
    to: { postal_code: cleanedDest },
    package: {
      height: Math.max(2, maxHeight),        // Correios minimum: 2cm
      width: Math.max(11, maxWidth),         // Correios minimum: 11cm
      length: Math.max(16, totalLength),     // Correios minimum: 16cm
      weight: Math.max(0.1, totalWeightKg),  // minimum: 100g
    },
    options: {
      insurance_value: totalValueCents / 100,
      receipt: false,
      own_hand: false,
    },
    services: '1,2,3,4', // 1=PAC, 2=Sedex, 3=PAC Mini, 4=Sedex 10
  };

  const response = await fetch(`${apiUrl}/shipment/calculate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'Ariz Joias contato@arizjoias.com.br',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Melhor Envio: ${response.status} — ${errorText}`);
  }

  const data = await response.json();

  return (data as Record<string, unknown>[])
    .filter((opt) => !opt.error)
    .map((opt) => ({
      id: opt.id as number,
      name: opt.name as string,
      company: (opt.company as { name: string }).name,
      priceCents: Math.round(parseFloat(opt.price as string) * 100),
      deliveryDays: opt.delivery_time as number,
    }));
}
