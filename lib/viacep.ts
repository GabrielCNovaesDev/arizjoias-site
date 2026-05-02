export interface AddressFromCep {
  zipCode: string;
  street: string;
  district: string;
  city: string;
  state: string;
}

export async function fetchAddressByCep(cep: string): Promise<AddressFromCep | null> {
  const cleaned = cep.replace(/\D/g, '');
  if (cleaned.length !== 8) return null;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`, {
      next: { revalidate: 86400 }, // cache de 1 dia
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data.erro) return null;

    return {
      zipCode: cleaned,
      street: data.logradouro || '',
      district: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || '',
    };
  } catch {
    return null;
  }
}
