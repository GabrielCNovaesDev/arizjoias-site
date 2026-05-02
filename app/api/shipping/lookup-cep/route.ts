import { fetchAddressByCep } from '@/lib/viacep';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cep = searchParams.get('cep');

  if (!cep) {
    return Response.json({ error: 'CEP obrigatório' }, { status: 400 });
  }

  const address = await fetchAddressByCep(cep);
  if (!address) {
    return Response.json({ error: 'CEP não encontrado' }, { status: 404 });
  }

  return Response.json(address);
}
