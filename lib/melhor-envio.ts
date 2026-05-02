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
  // For an aggregated package, use max dimensions across all items
  const maxWidth = Math.max(...items.map((i) => i.widthCm));
  const maxHeight = Math.max(...items.map((i) => i.heightCm));
  const maxLength = Math.max(...items.map((i) => i.lengthCm));

  const payload = {
    from: { postal_code: cleanedOrigin },
    to: { postal_code: cleanedDest },
    package: {
      height: Math.max(2, maxHeight),        // Correios minimum: 2cm
      width: Math.max(11, maxWidth),         // Correios minimum: 11cm
      length: Math.max(16, maxLength),       // Correios minimum: 16cm
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
    .map((opt) => {
      const rawPrice = parseFloat(opt.price as string);
      const priceCents = isNaN(rawPrice) ? 0 : Math.round(rawPrice * 100);
      const deliveryDays = typeof opt.delivery_time === 'number' ? opt.delivery_time : 0;
      return {
        id: opt.id as number,
        name: String(opt.name ?? ''),
        company: String((opt.company as { name: string } | null)?.name ?? ''),
        priceCents,
        deliveryDays,
      };
    })
    .filter((opt) => opt.priceCents > 0); // Remove options with invalid price
}
