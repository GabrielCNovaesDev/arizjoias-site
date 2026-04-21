import { NextRequest, NextResponse } from 'next/server';
import { productRepository } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get('category') ?? undefined;
  const material = searchParams.get('material') ?? undefined;
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const search = searchParams.get('search') ?? undefined;
  const featured = searchParams.get('featured') === 'true' ? true : undefined;

  const products = productRepository.filter({ category, material, minPrice, maxPrice, search, featured });

  return NextResponse.json({ products });
}
