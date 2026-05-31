import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { createCollectionSchema } from '@/lib/schemas/collections';

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  const collections = await prisma.collection.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { collectionItems: true },
      },
      collectionItems: {
        orderBy: { createdAt: 'desc' },
        include: {
          nasaImage: true,
        },
      },
    },
  });

  return NextResponse.json({ collections });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'JSON inválido' }, { status: 400 });
  }

  const parsed = createCollectionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? 'Datos inválidos' }, { status: 400 });
  }

  const collection = await prisma.collection.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description || undefined,
      userId: user.id,
    },
    include: {
      _count: {
        select: { collectionItems: true },
      },
      collectionItems: {
        orderBy: { createdAt: 'desc' },
        include: {
          nasaImage: true,
        },
      },
    },
  });

  revalidatePath('/dashboard');

  return NextResponse.json({ collection }, { status: 201 });
}
