import { redirect } from 'next/navigation';

import { CollectionManager } from '@/components/collections/collection-manager';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
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

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="glass rounded-3xl p-8">
        <p className="text-sm uppercase tracking-[0.24em] text-cyan-200/80">Dashboard</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Bienvenido, {user.name ?? 'explorador'}</h1>
        <p className="mt-3 text-white/65">Email: {user.email}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <SignOutButton />
        </div>
      </div>

      <div className="mt-8">
        <CollectionManager initialCollections={collections} />
      </div>
    </section>
  );
}
