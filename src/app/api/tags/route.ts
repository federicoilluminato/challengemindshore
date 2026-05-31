import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { saveTagsSchema } from '@/lib/schemas/enrichment';

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'JSON inválido' }, { status: 400 });
  }

  const parsed = saveTagsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? 'Datos inválidos' }, { status: 400 });
  }

  const nasaImage = await prisma.nasaImage.upsert({
    where: { nasaId: parsed.data.nasaId },
    update: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      imageUrl: parsed.data.imageUrl,
      mediaType: 'image',
      nasaDate: parsed.data.date ? new Date(parsed.data.date) : new Date(),
    },
    create: {
      nasaId: parsed.data.nasaId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      imageUrl: parsed.data.imageUrl,
      mediaType: 'image',
      nasaDate: parsed.data.date ? new Date(parsed.data.date) : new Date(),
    },
  });

  const savedTags: string[] = [];

  for (const tagName of parsed.data.tags) {
    const tag = await prisma.tag.upsert({
      where: { name: tagName.toLowerCase() },
      update: {},
      create: { name: tagName.toLowerCase() },
    });

    await prisma.imageTag.upsert({
      where: {
        nasaImageId_tagId: {
          nasaImageId: nasaImage.id,
          tagId: tag.id,
        },
      },
      update: {},
      create: {
        nasaImageId: nasaImage.id,
        tagId: tag.id,
      },
    });

    savedTags.push(tag.name);
  }

  return NextResponse.json({ ok: true, tags: savedTags });
}
