"use client";

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  createCollectionSchema,
  type CreateCollectionFormValues,
  type CreateCollectionOutput,
} from '@/lib/schemas/collections';

type CollectionItem = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date | string;
  _count?: { collectionItems: number };
};

type CollectionManagerProps = {
  initialCollections: CollectionItem[];
};

export function CollectionManager({ initialCollections }: CollectionManagerProps) {
  const router = useRouter();
  const [collections, setCollections] = useState(initialCollections);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loadingCollections, setLoadingCollections] = useState(true);

  const form = useForm<CreateCollectionFormValues, unknown, CreateCollectionOutput>({
    resolver: zodResolver(createCollectionSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    let isMounted = true;

    const loadCollections = async () => {
      setLoadingCollections(true);

      try {
        const response = await fetch('/api/collections', { cache: 'no-store' });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { collections?: CollectionItem[] };

        if (isMounted && payload.collections) {
          setCollections(payload.collections);
        }
      } finally {
        if (isMounted) {
          setLoadingCollections(false);
        }
      }
    };

    loadCollections();

    return () => {
      isMounted = false;
    };
  }, []);

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);

    const response = await fetch('/api/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    const payload = (await response.json()) as { collection?: CollectionItem; message?: string };

    if (!response.ok) {
      setError(payload.message ?? 'No se pudo crear la colección');
      return;
    }

    if (payload.collection) {
      setCollections((current) => [payload.collection as CollectionItem, ...current]);
      form.reset({ name: '', description: '' });
      router.refresh();
    }
  });

  const handleDelete = async (collectionId: string) => {
    setDeletingId(collectionId);
    setError(null);

    const response = await fetch(`/api/collections/${collectionId}`, { method: 'DELETE' });
    const payload = (await response.json()) as { message?: string };

    if (!response.ok) {
      setError(payload.message ?? 'No se pudo eliminar la colección');
      setDeletingId(null);
      return;
    }

    setCollections((current) => current.filter((collection) => collection.id !== collectionId));
    setDeletingId(null);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-3xl p-6">
        <h2 className="text-xl font-semibold text-white">Crear colección</h2>
        <p className="mt-1 text-sm text-white/60">Organizá imágenes por tema, misión o momento histórico.</p>

        <form className="mt-6 grid gap-4 md:grid-cols-[1fr_1.2fr_auto]" onSubmit={onSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" placeholder="Mis imágenes de Marte" {...form.register('name')} />
            {form.formState.errors.name ? <p className="text-sm text-red-300">{form.formState.errors.name.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input id="description" placeholder="Rovers y escenas marcianas" {...form.register('description')} />
            {form.formState.errors.description ? (
              <p className="text-sm text-red-300">{form.formState.errors.description.message}</p>
            ) : null}
          </div>

          <div className="flex items-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Creando...' : 'Crear'}
            </Button>
          </div>
        </form>

        {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loadingCollections ? (
          <div className="glass rounded-3xl p-8 text-sm text-white/55">Cargando colecciones...</div>
        ) : collections.length ? (
          collections.map((collection) => (
            <article key={collection.id} className="glass rounded-3xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{collection.name}</h3>
                  {collection.description ? <p className="mt-1 text-sm text-white/60">{collection.description}</p> : null}
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/60">
                  {collection._count?.collectionItems ?? 0} items
                </span>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.24em] text-white/35">
                  {new Date(collection.createdAt).toLocaleDateString('es-AR')}
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleDelete(collection.id)}
                  disabled={deletingId === collection.id}
                >
                  {deletingId === collection.id ? 'Eliminando...' : 'Eliminar'}
                </Button>
              </div>
            </article>
          ))
        ) : (
          <div className="glass rounded-3xl p-8 text-sm text-white/55">Todavía no tenés colecciones.</div>
        )}
      </div>
    </div>
  );
}
