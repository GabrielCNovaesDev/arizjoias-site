import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ categoria: string }>;
}

// Redirect /catalogo/[categoria] → /catalogo?categoria=[categoria]
export default async function CategoriaPage({ params }: Props) {
  const { categoria } = await params;
  redirect(`/catalogo?categoria=${categoria}`);
}
