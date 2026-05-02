import { calculateShipping, type CartItemForShipping } from '@/lib/melhor-envio';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { zipCode, items } = body as {
      zipCode?: string;
      items?: CartItemForShipping[];
    };

    if (!zipCode || !items?.length) {
      return Response.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    const cleanedCep = zipCode.replace(/\D/g, '');
    if (cleanedCep.length !== 8) {
      return Response.json({ error: 'CEP inválido' }, { status: 400 });
    }

    const options = await calculateShipping(zipCode, items);
    return Response.json({ options });
  } catch (error) {
    console.error('Shipping calculation error:', error);
    return Response.json(
      { error: 'Erro ao calcular frete. Tente novamente.' },
      { status: 500 }
    );
  }
}
