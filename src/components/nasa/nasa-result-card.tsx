"use client";

import { useEffect, useState } from 'react';

import Image from 'next/image';
import { ChevronDown } from 'lucide-react';

import type { NasaSearchResult } from '@/lib/nasa';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

type CollectionOption = {
  id: string;
  name: string;
};

type AiEnrichment = {
  summary: string;
  facts: string[];
  tags: string[];
};

type NasaResultCardProps = {
  item: NasaSearchResult;
  collections?: CollectionOption[];
  showSavePanel?: boolean;
  showAiPanel?: boolean;
};

export function NasaResultCard({ item, collections = [], showSavePanel = true, showAiPanel = true }: NasaResultCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState(collections[0]?.id ?? '');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [aiState, setAiState] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [aiEnrichment, setAiEnrichment] = useState<AiEnrichment | null>(null);
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
        keywords: item.keywords ?? [],
        center: item.center ?? '',
        photographer: item.photographer ?? '',
        location: item.location ?? '',
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

  const handleEnrich = async () => {
    setAiState('loading');
    setAiMessage(null);

    const response = await fetch('/api/nasa/enrich', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nasaId: item.nasaId,
        title: item.title,
        description: item.description,
        imageUrl: item.imageUrl,
        date: item.date ?? '',
        source: item.source,
        rover: item.rover ?? '',
        camera: item.camera ?? '',
        mission: item.mission ?? '',
        keywords: item.keywords ?? [],
        center: item.center ?? '',
        photographer: item.photographer ?? '',
        location: item.location ?? '',
      }),
    });

    const payload = (await response.json()) as { enrichment?: AiEnrichment; message?: string };

    if (!response.ok || !payload.enrichment) {
      setAiState('error');
      setAiMessage(payload.message ?? 'No se pudo enriquecer la imagen');
      return;
    }

    setAiEnrichment(payload.enrichment);
    setAiState('loaded');
  };

  const handleSaveTags = async () => {
    if (!aiEnrichment?.tags.length) {
      setAiState('error');
      setAiMessage('Primero generá sugerencias de tags.');
      return;
    }

    setAiState('loading');
    setAiMessage(null);

    const response = await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nasaId: item.nasaId,
        title: item.title,
        description: item.description,
        imageUrl: item.imageUrl,
        date: item.date ?? '',
        source: item.source,
        rover: item.rover ?? '',
        camera: item.camera ?? '',
        mission: item.mission ?? '',
        keywords: item.keywords ?? [],
        center: item.center ?? '',
        photographer: item.photographer ?? '',
        location: item.location ?? '',
        tags: aiEnrichment.tags,
      }),
    });

    const payload = (await response.json()) as { tags?: string[]; message?: string };

    if (!response.ok) {
      setAiState('error');
      setAiMessage(payload.message ?? 'No se pudieron guardar los tags');
      return;
    }

    setAiState('loaded');
    setAiMessage(`Tags guardados: ${(payload.tags ?? aiEnrichment.tags).join(', ')}`);
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
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">{item.source === 'mars-rover' ? 'Mars Rover' : 'Image Library'}</p>
            <h3 className="mt-1 text-lg font-semibold text-white">{item.title}</h3>
          </div>
          {item.date ? <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/60">{new Date(item.date).toLocaleDateString('es-AR')}</span> : null}
        </div>

        <div className="space-y-3">
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

        <div className="flex flex-wrap gap-2 text-xs text-white/55">
          {item.rover ? <span className="rounded-full bg-white/5 px-2.5 py-1">Rover: {item.rover}</span> : null}
          {item.camera ? <span className="rounded-full bg-white/5 px-2.5 py-1">Camera: {item.camera}</span> : null}
          {item.mission ? <span className="rounded-full bg-white/5 px-2.5 py-1">Mission: {item.mission}</span> : null}
        </div>

        <div className="mt-auto space-y-3">
          {showAiPanel ? (
            <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">IA + tags</p>
                  <p className="text-sm text-white/65">Generá contexto y sugerencias temáticas.</p>
                </div>
                <Button type="button" variant="outline" className="h-9 px-3" onClick={handleEnrich} disabled={aiState === 'loading'}>
                  {aiState === 'loading' ? (
                    <span className="inline-flex items-center justify-center">
                      <Spinner className="h-4 w-4" />
                    </span>
                  ) : (
                    'IA'
                  )}
                </Button>
              </div>

              {aiEnrichment ? (
                <div className="space-y-3">
                  <p className="text-sm leading-6 text-white/70">{aiEnrichment.summary}</p>
                  {aiEnrichment.facts.length ? (
                    <ul className="space-y-1 text-sm text-white/55">
                      {aiEnrichment.facts.map((fact) => (
                        <li key={fact}>• {fact}</li>
                      ))}
                    </ul>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    {aiEnrichment.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-xs text-cyan-100">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Button type="button" variant="outline" className="h-9 px-3" onClick={handleSaveTags} disabled={aiState === 'loading'}>
                    Guardar tags
                  </Button>
                </div>
              ) : null}

              {aiMessage ? <p className="text-sm text-white/55">{aiMessage}</p> : null}
            </div>
          ) : null}

          {showSavePanel && collections.length ? (
            <div className="space-y-3 border-t border-white/10 pt-3">
              <label className="block text-xs uppercase tracking-[0.24em] text-white/40" htmlFor={`collection-${item.id}`}>
                Guardar en colección
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <select
                    id={`collection-${item.id}`}
                    className="flex h-10 w-full appearance-none rounded-xl border border-white/10 bg-slate-950/35 px-3 py-2 pr-10 text-sm text-white shadow-inner shadow-black/10 outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
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
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  aria-label="Guardar en la colección"
                  className="h-10 w-10 rounded-full border-white/10 bg-white/5 px-0 text-white hover:bg-white/10"
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
      </div>
    </article>
  );
}
