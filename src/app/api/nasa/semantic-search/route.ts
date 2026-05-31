import { NextResponse } from 'next/server';

import { checkRateLimit, getClientKey } from '@/lib/rate-limit';
import { searchNasa } from '@/lib/nasa';
import { interpretNaturalLanguage } from '@/lib/semantic-search';
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

  let body: { query?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'JSON inválido' }, { status: 400 });
  }

  if (!body.query || typeof body.query !== 'string' || body.query.trim().length < 3) {
    return NextResponse.json({ message: 'Escribí una descripción natural de al menos 3 caracteres' }, { status: 400 });
  }

  const { originalQuery, interpreted } = interpretNaturalLanguage(body.query);

  if (!interpreted.query && !interpreted.rover && !interpreted.mission) {
    return NextResponse.json({ message: 'No se pudo interpretar la descripción. Probá con términos más específicos (rovers, misiones, fechas o temas).' }, { status: 400 });
  }

  const parsed = nasaSearchSchema.safeParse(interpreted);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? 'No se pudo interpretar la búsqueda' }, { status: 400 });
  }

  try {
    const results = await searchNasa(parsed.data);

    return NextResponse.json(
      {
        originalQuery,
        interpreted: parsed.data,
        results,
      },
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
