import { NextRequest, NextResponse } from 'next/server';
import { userRepository } from '@/lib/db';
import { signToken, hashPassword } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Preencha todos os campos' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'A senha deve ter ao menos 6 caracteres' }, { status: 400 });
    }

    const existing = userRepository.findByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'Este e-mail já está em uso' }, { status: 409 });
    }

    const user = userRepository.create({
      id: `u_${Date.now()}`,
      name,
      email,
      passwordHash: hashPassword(password),
      favorites: [],
      createdAt: new Date(),
    });

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
      message: 'Conta criada com sucesso',
    });
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
