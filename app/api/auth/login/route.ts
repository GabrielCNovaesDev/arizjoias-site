import { NextRequest, NextResponse } from 'next/server';
import { userRepository } from '@/lib/db';
import { signToken, verifyPassword } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Preencha todos os campos' }, { status: 400 });
    }

    const user = userRepository.findByEmail(email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: 'E-mail ou senha incorretos' }, { status: 401 });
    }

    const token = await signToken({ userId: user.id, email: user.email, name: user.name });

    const cookieStore = await cookies();
    cookieStore.set('ariz_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
