import { notFound, redirect } from 'next/navigation';

import { CollectionGallery } from '@/components/collections/collection-gallery';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { NasaSearchResult } from '@/lib/nasa';

type PageProps = {
  params: { collectionId: string };
};

export default async function CollectionDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const { collectionId } = params;

  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, userId: user.id },
    include: {
      collectionItems: {
        orderBy: { createdAt: 'desc' },
        include: {
          nasaImage: {
            include: {
              imageTags: {
                include: {
                  tag: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!collection) {
    notFound();
  }

  const items: NasaSearchResult[] = collection.collectionItems.map((item) => ({
    id: item.nasaImage.id,
    nasaId: item.nasaImage.nasaId,
    title: item.nasaImage.title,
    description:
      item.nasaImage.description ??
      'Sin descripción disponible.',
    imageUrl: item.nasaImage.imageUrl,
    date: item.nasaImage.nasaDate.toISOString(),
    source: 'image-library',
  }));

  const tags = Array.from(
    new Set(
      collection.collectionItems.flatMap((item) => item.nasaImage.imageTags.map((imageTag) => imageTag.tag.name)),
    ),
  ).sort();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="glass rounded-3xl p-8">
        <p className="text-sm uppercase tracking-[0.24em] text-cyan-200/80">Colección</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">{collection.name}</h1>
        {collection.description ? <p className="mt-3 max-w-3xl text-white/65">{collection.description}</p> : null}

        <div className="mt-6 flex flex-wrap gap-2 text-xs text-white/55">
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">{collection.collectionItems.length} items</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">{tags.length} tags</span>
        </div>

        {tags.length ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-xs text-cyan-100">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-8">
        {items.length ? <CollectionGallery items={items} /> : <p className="text-sm text-white/55">Todavía no hay imágenes en esta colección.</p>}
      </div>
    </section>
  );
}
