import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { createAuthToken, setAuthCookie, verifyPassword } from '@/lib/auth';
import { checkRateLimit, getClientKey } from '@/lib/rate-limit';
import { loginSchema } from '@/lib/schemas/auth';

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(getClientKey(request), 5);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: 'Demasiados intentos. Probá de nuevo en un minuto.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(rateLimit.resetAt),
        },
      },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'JSON inválido' }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? 'Datos inválidos' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return NextResponse.json({ message: 'Credenciales inválidas' }, { status: 401 });
  }

  const token = await createAuthToken({ sub: user.id, email: user.email, name: user.name });
  const response = NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });

  setAuthCookie(response, token);
  return response;
}
