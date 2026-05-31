import { NextResponse } from 'next/server';

import { enrichNasaImage } from '@/lib/enrichment';
import { nasaEnrichmentSchema } from '@/lib/schemas/enrichment';

export async function POST(request: Request) {
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

  return NextResponse.json({ enrichment });
}
