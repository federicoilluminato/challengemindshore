import { NextResponse } from 'next/server';

import { enrichNasaImage } from '@/lib/enrichment';
import { checkRateLimit, getClientKey } from '@/lib/rate-limit';
import { nasaEnrichmentSchema } from '@/lib/schemas/enrichment';

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(getClientKey(request), 10);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: 'Demasiadas solicitudes. Probá de nuevo en un minuto.' },
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

  const parsed = nasaEnrichmentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? 'Datos inválidos' }, { status: 400 });
  }

  const enrichment = await enrichNasaImage(parsed.data);

  return NextResponse.json(
    { enrichment },
    {
      headers: {
        'X-RateLimit-Remaining': String(rateLimit.remaining),
        'X-RateLimit-Reset': String(rateLimit.resetAt),
      },
    },
  );
}
