"use client";

import { useEffect, useState } from 'react';

import Image from 'next/image';

import type { NasaSearchResult } from '@/lib/nasa';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

type CollectionOption = {
  id: string;
  name: string;
};

type NasaResultCardProps = {
  item: NasaSearchResult;
  collections?: CollectionOption[];
};

export function NasaResultCard({ item, collections = [] }: NasaResultCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState(collections[0]?.id ?? '');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const isLongDescription = item.description.length > 180;

  useEffect(() => {
    if (!selectedCollectionId && collections[0]?.id) {
      setSelectedCollectionId(collections[0].id);
    }
  }, [collections, selectedCollectionId]);

  const handleSave = async () => {
    if (!selectedCollectionId) {
      setSaveState('error');
      setSaveMessage('Elegí una colección primero.');
      return;
    }

    setSaveState('saving');
    setSaveMessage(null);

    const response = await fetch(`/api/collections/${selectedCollectionId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nasaId: item.nasaId,
        title: item.title,
        description: item.description,
        imageUrl: item.imageUrl,
        mediaType: 'image',
        nasaDate: item.date ?? '',
        source: item.source,
      }),
    });

    const payload = (await response.json()) as { message?: string };

    if (!response.ok) {
      setSaveState('error');
      setSaveMessage(payload.message ?? 'No se pudo guardar la imagen');
      return;
    }

    setSaveState('saved');
    setSaveMessage('Guardada en la colección.');
  };

  return (
    <article className="glass flex h-full flex-col overflow-hidden rounded-3xl border border-white/10">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/20">
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-500 hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col space-y-3 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">{item.source === 'mars-rover' ? 'Mars Rover' : 'Image Library'}</p>
            <h3 className="mt-1 text-lg font-semibold text-white">{item.title}</h3>
          </div>
          {item.date ? <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/60">{new Date(item.date).toLocaleDateString('es-AR')}</span> : null}
        </div>

        <div className="min-h-[132px] space-y-3">
          <p className={`text-sm leading-6 text-white/65 ${expanded || !isLongDescription ? '' : 'max-h-24 overflow-hidden'}`}>
            {item.description}
          </p>
          {isLongDescription ? (
            <Button
              type="button"
              variant="ghost"
              className="h-auto p-0 text-xs font-medium text-cyan-200 hover:bg-transparent hover:text-cyan-100"
              onClick={() => setExpanded((current) => !current)}
            >
              {expanded ? 'Leer menos' : 'Leer más'}
            </Button>
          ) : null}
        </div>

        <div className="min-h-[44px] flex flex-wrap gap-2 text-xs text-white/55">
          {item.rover ? <span className="rounded-full bg-white/5 px-2.5 py-1">Rover: {item.rover}</span> : null}
          {item.camera ? <span className="rounded-full bg-white/5 px-2.5 py-1">Camera: {item.camera}</span> : null}
          {item.mission ? <span className="rounded-full bg-white/5 px-2.5 py-1">Mission: {item.mission}</span> : null}
        </div>

        <div className="flex-1" />

        {collections.length ? (
          <div className="mt-auto space-y-3 border-t border-white/10 pt-3">
            <label className="block text-xs uppercase tracking-[0.24em] text-white/40" htmlFor={`collection-${item.id}`}>
              Guardar en colección
            </label>
            <div className="flex gap-2">
              <select
                id={`collection-${item.id}`}
                className="flex h-10 flex-1 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white shadow-sm outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
                value={selectedCollectionId}
                onChange={(event) => setSelectedCollectionId(event.target.value)}
                disabled={saveState === 'saving'}
              >
                <option value="">Elegí una colección</option>
                {collections.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.name}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="outline"
                aria-label="Guardar en la colección"
                className="h-10 w-10 rounded-full px-0"
                onClick={handleSave}
                disabled={saveState === 'saving'}
              >
                {saveState === 'saving' ? (
                  <span className="inline-flex items-center justify-center">
                    <Spinner className="h-4 w-4" />
                  </span>
                ) : (
                  '+'
                )}
              </Button>
            </div>
            {saveMessage ? (
              <p className={`text-sm ${saveState === 'error' ? 'text-red-300' : 'text-emerald-200'}`}>{saveMessage}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
