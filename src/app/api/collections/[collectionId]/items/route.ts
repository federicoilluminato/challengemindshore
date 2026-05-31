import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { saveCollectionImageSchema } from '@/lib/schemas/collections';

type Params = {
  params: { collectionId: string };
};

export async function POST(request: Request, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  const { collectionId } = params;

  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, userId: user.id },
    select: { id: true },
  });

  if (!collection) {
    return NextResponse.json({ message: 'Colección no encontrada' }, { status: 404 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'JSON inválido' }, { status: 400 });
  }

  const parsed = saveCollectionImageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? 'Datos inválidos' }, { status: 400 });
  }

  const nasaImage = await prisma.nasaImage.upsert({
    where: { nasaId: parsed.data.nasaId },
    update: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      imageUrl: parsed.data.imageUrl,
      mediaType: parsed.data.mediaType,
      nasaDate: parsed.data.nasaDate ? new Date(parsed.data.nasaDate) : new Date(),
    },
    create: {
      nasaId: parsed.data.nasaId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      imageUrl: parsed.data.imageUrl,
      mediaType: parsed.data.mediaType,
      nasaDate: parsed.data.nasaDate ? new Date(parsed.data.nasaDate) : new Date(),
    },
  });

  await prisma.collectionItem.upsert({
    where: {
      collectionId_nasaImageId: {
        collectionId,
        nasaImageId: nasaImage.id,
      },
    },
    update: {},
    create: {
      collectionId,
      nasaImageId: nasaImage.id,
    },
  });

  revalidatePath('/dashboard');

  return NextResponse.json({ ok: true }, { status: 201 });
}
