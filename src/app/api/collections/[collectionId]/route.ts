import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

type Params = {
  params: { collectionId: string };
};

export async function DELETE(_: Request, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  const { collectionId } = params;

  try {
    const collection = await prisma.collection.findFirst({
      where: { id: collectionId, userId: user.id },
      select: { id: true },
    });

    if (!collection) {
      return NextResponse.json({ message: 'Colección no encontrada' }, { status: 404 });
    }

    await prisma.collection.delete({ where: { id: collectionId } });

    revalidatePath('/dashboard');

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: 'Error al eliminar la colección' }, { status: 500 });
  }
}
