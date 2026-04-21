import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { userRepository } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null }, { status: 401 });

  const user = userRepository.findById(session.userId);
  if (!user) return NextResponse.json({ user: null }, { status: 401 });

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, address: user.address },
  });
}
