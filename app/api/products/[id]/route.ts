import { NextRequest, NextResponse } from 'next/server';
import { productRepository } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = productRepository.findById(id);
  if (!product) return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
  return NextResponse.json({ product });
}
