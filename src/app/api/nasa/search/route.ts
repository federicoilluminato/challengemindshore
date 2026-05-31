import { NextResponse } from 'next/server';

import { checkRateLimit, getClientKey } from '@/lib/rate-limit';
import { searchNasa } from '@/lib/nasa';
import { nasaSearchSchema } from '@/lib/schemas/nasa';

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(getClientKey(request));

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: 'Demasiadas búsquedas. Probá de nuevo en un minuto.' },
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

  const parsed = nasaSearchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? 'Filtros inválidos' }, { status: 400 });
  }

  try {
    const results = await searchNasa(parsed.data);

    return NextResponse.json(
      { results },
      {
        headers: {
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'X-RateLimit-Reset': String(rateLimit.resetAt),
        },
      },
    );
  } catch {
    return NextResponse.json({ message: 'No se pudo consultar NASA en este momento' }, { status: 502 });
  }
}
