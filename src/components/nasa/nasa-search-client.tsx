"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarDays, ChevronDown, MessageSquareText, Search, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { nasaSearchSchema, type NasaSearchFormValues, type NasaSearchOutput } from '@/lib/schemas/nasa';
import type { NasaSearchResult } from '@/lib/nasa';

import { NasaResultCard } from './nasa-result-card';

type SearchState =
  | { status: 'idle'; results: NasaSearchResult[]; message: string }
  | { status: 'loading'; results: NasaSearchResult[]; message: string }
  | { status: 'error'; results: NasaSearchResult[]; message: string }
  | { status: 'success'; results: NasaSearchResult[]; message: string };

type CollectionOption = {
  id: string;
  name: string;
};

type SemanticResponse = {
  originalQuery: string;
  interpreted?: NasaSearchOutput;
  results?: NasaSearchResult[];
  message?: string;
};

type SearchMode = 'filters' | 'semantic';

const defaultValues: NasaSearchFormValues = {
  query: '',
  mission: '',
  rover: undefined,
  camera: '',
  date: '',
  page: 1,
};

export function NasaSearchClient() {
  const [state, setState] = useState<SearchState>({
    status: 'idle',
    results: [],
    message: 'Buscá imágenes usando filtros por fecha, rover, cámara y misión.',
  });
  const [collections, setCollections] = useState<CollectionOption[]>([]);
  const [collectionsLoaded, setCollectionsLoaded] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>('filters');
  const [semanticQuery, setSemanticQuery] = useState('');
  const [semanticInterpreted, setSemanticInterpreted] = useState<string | null>(null);

  const form = useForm<NasaSearchFormValues, unknown, NasaSearchOutput>({
    resolver: zodResolver(nasaSearchSchema),
    defaultValues,
  });

  const hasResults = useMemo(() => state.results.length > 0, [state.results]);

  useEffect(() => {
    let isMounted = true;

    const loadCollections = async () => {
      try {
        const response = await fetch('/api/collections');

        if (!response.ok) {
          if (isMounted) {
            setCollections([]);
            setCollectionsLoaded(true);
          }
          return;
        }

        const payload = (await response.json()) as { collections?: Array<{ id: string; name: string }> };

        if (isMounted) {
          setCollections(payload.collections ?? []);
          setCollectionsLoaded(true);
        }
      } catch {
        if (isMounted) {
          setCollections([]);
          setCollectionsLoaded(true);
        }
      }
    };

    loadCollections();

    return () => {
      isMounted = false;
    };
  }, []);

  const onSubmit = form.handleSubmit(async (values) => {
    setState((current) => ({ ...current, status: 'loading', message: 'Buscando imágenes de NASA...' }));
    setSemanticInterpreted(null);

    const response = await fetch('/api/nasa/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    const payload = (await response.json()) as { results?: NasaSearchResult[]; message?: string };

    if (!response.ok) {
      setState({
        status: 'error',
        results: [],
        message: payload.message ?? 'No se pudo completar la búsqueda',
      });
      return;
    }

    setState({
      status: 'success',
      results: payload.results ?? [],
      message: payload.results?.length ? `Se encontraron ${payload.results.length} imágenes.` : 'No se encontraron resultados.',
    });
  });

  const onSemanticSubmit = useCallback(async () => {
    if (!semanticQuery.trim() || semanticQuery.trim().length < 3) return;

    setState((current) => ({ ...current, status: 'loading', message: 'Interpretando descripción y buscando en NASA...' }));
    setSemanticInterpreted(null);

    const response = await fetch('/api/nasa/semantic-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: semanticQuery.trim() }),
    });

    const payload = (await response.json()) as SemanticResponse;

    if (!response.ok) {
      setState({
        status: 'error',
        results: [],
        message: payload.message ?? 'No se pudo completar la búsqueda',
      });
      return;
    }

    if (payload.interpreted) {
      const parts: string[] = [];
      if (payload.interpreted.query) parts.push(`texto: "${payload.interpreted.query}"`);
      if (payload.interpreted.rover) parts.push(`rover: ${payload.interpreted.rover}`);
      if (payload.interpreted.camera) parts.push(`cámara: ${payload.interpreted.camera}`);
      if (payload.interpreted.mission) parts.push(`misión: ${payload.interpreted.mission}`);
      if (payload.interpreted.date) parts.push(`fecha: ${payload.interpreted.date}`);
      setSemanticInterpreted(parts.join(' · '));
    }

    setState({
      status: 'success',
      results: payload.results ?? [],
      message: payload.results?.length ? `Se encontraron ${payload.results.length} imágenes.` : 'No se encontraron resultados.',
    });
  }, [semanticQuery]);

  return (
    <div className="space-y-10">
      <div className="glass rounded-3xl border border-white/10 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.24)]">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/70">NASA Explorer</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Búsqueda avanzada</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">Buscá imágenes con filtros tradicionales o describí lo que querés ver en lenguaje natural.</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100">
            <Sparkles className="h-3.5 w-3.5" />
            Exploración
          </span>
        </div>

        <div className="mb-6 flex gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1">
          <button
            type="button"
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${searchMode === 'filters' ? 'bg-cyan-400/15 text-cyan-200 shadow-sm' : 'text-white/50 hover:text-white/80'}`}
            onClick={() => setSearchMode('filters')}
          >
            <Search className="h-4 w-4" />
            Filtros
          </button>
          <button
            type="button"
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${searchMode === 'semantic' ? 'bg-cyan-400/15 text-cyan-200 shadow-sm' : 'text-white/50 hover:text-white/80'}`}
            onClick={() => setSearchMode('semantic')}
          >
            <MessageSquareText className="h-4 w-4" />
            Descripción natural
          </button>
        </div>

        {searchMode === 'filters' ? (
          <form className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:grid-cols-2 xl:grid-cols-10" onSubmit={onSubmit} noValidate>
            <div className="space-y-2 md:col-span-2 xl:col-span-10">
              <Label htmlFor="query" className="text-white/80">
                Texto libre
              </Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                <Input id="query" placeholder="atardeceres en Marte" className="h-11 border-white/10 bg-slate-950/35 pl-9 text-white placeholder:text-white/30 focus-visible:border-cyan-400/50 focus-visible:ring-cyan-400/20 [&:-webkit-autofill]:[box-shadow:0_0_0_30px_#0f172a_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]" {...form.register('query')} />
              </div>
              {form.formState.errors.query ? <p className="text-sm text-red-300">{form.formState.errors.query.message}</p> : null}
            </div>

            <div className="space-y-2 xl:col-span-2">
              <Label htmlFor="mission" className="text-white/80">
                Misión
              </Label>
              <Input id="mission" placeholder="mars 2020" className="h-11 border-white/10 bg-slate-950/35 text-white placeholder:text-white/30 focus-visible:border-cyan-400/50 focus-visible:ring-cyan-400/20" {...form.register('mission')} />
              {form.formState.errors.mission ? <p className="text-sm text-red-300">{form.formState.errors.mission.message}</p> : null}
            </div>

            <div className="space-y-2 xl:col-span-2">
              <Label htmlFor="date" className="text-white/80">
                Fecha exacta
              </Label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                <Input id="date" type="date" className="h-11 border-white/10 bg-slate-950/35 pl-9 text-white placeholder:text-white/30 focus-visible:border-cyan-400/50 focus-visible:ring-cyan-400/20 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&:-webkit-autofill]:[box-shadow:0_0_0_30px_#0f172a_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]" {...form.register('date')} />
              </div>
              {form.formState.errors.date ? <p className="text-sm text-red-300">{form.formState.errors.date.message}</p> : null}
            </div>

            <div className="space-y-2 xl:col-span-2">
              <Label htmlFor="rover" className="text-white/80">
                Rover
              </Label>
              <div className="relative">
                <select
                  id="rover"
                  className="flex h-11 w-full appearance-none rounded-xl border border-white/10 bg-slate-950/35 px-3 py-2 pr-10 text-sm text-white shadow-inner shadow-black/10 outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                  {...form.register('rover')}
                >
                  <option value="">Sin filtro</option>
                  <option value="curiosity">Curiosity</option>
                  <option value="opportunity">Opportunity</option>
                  <option value="spirit">Spirit</option>
                  <option value="perseverance">Perseverance</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              </div>
              {form.formState.errors.rover ? <p className="text-sm text-red-300">{form.formState.errors.rover.message}</p> : null}
            </div>

            <div className="space-y-2 xl:col-span-2">
              <Label htmlFor="camera" className="text-white/80">
                Cámara
              </Label>
              <Input id="camera" placeholder="FHAZ, RHAZ, NAVCAM..." className="h-11 border-white/10 bg-slate-950/35 text-white placeholder:text-white/30 focus-visible:border-cyan-400/50 focus-visible:ring-cyan-400/20" {...form.register('camera')} />
              {form.formState.errors.camera ? <p className="text-sm text-red-300">{form.formState.errors.camera.message}</p> : null}
            </div>

            <div className="space-y-2 xl:col-span-2">
              <Label htmlFor="page" className="text-white/80">
                Página
              </Label>
              <Input
                id="page"
                type="number"
                min={1}
                max={5}
                placeholder="1"
                className="h-11 border-white/10 bg-slate-950/35 text-white placeholder:text-white/30 focus-visible:border-cyan-400/50 focus-visible:ring-cyan-400/20"
                {...form.register('page', { valueAsNumber: true })}
              />
              {form.formState.errors.page ? <p className="text-sm text-red-300">{form.formState.errors.page.message}</p> : null}
            </div>

            <div className="flex justify-center md:col-span-2 xl:col-span-10">
              <Button type="submit" className="h-11 w-56 bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 text-slate-950 shadow-lg shadow-cyan-500/20 hover:from-cyan-300 hover:via-sky-300 hover:to-indigo-300" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner className="h-4 w-4" />
                    Buscando...
                  </span>
                ) : (
                  'Buscar en NASA'
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="space-y-2">
              <Label htmlFor="semantic-query" className="text-white/80">
                Describí lo que querés ver
              </Label>
              <textarea
                id="semantic-query"
                rows={3}
                placeholder="mostrame atardeceres en Marte del rover Perseverance con cámara Mastcam"
                className="w-full rounded-xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 resize-none"
                value={semanticQuery}
                onChange={(e) => setSemanticQuery(e.target.value)}
              />
              <p className="text-xs text-white/40">Ej: &quot;fotos de cráteres en Marte del rover Curiosity&quot; o &quot;sunset en Pathfinder 2005&quot;</p>
            </div>
            <div className="mt-4 flex justify-center">
              <Button
                type="button"
                className="h-11 w-56 bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 text-slate-950 shadow-lg shadow-fuchsia-500/20 hover:from-purple-300 hover:via-fuchsia-300 hover:to-pink-300"
                onClick={onSemanticSubmit}
                disabled={state.status === 'loading'}
              >
                {state.status === 'loading' ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner className="h-4 w-4" />
                    Buscando...
                  </span>
                ) : (
                  'Buscar por descripción'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="glass rounded-3xl p-6">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Resultados</h2>
            <p className="text-sm text-white/55">{state.message}</p>
            {semanticInterpreted ? <p className="mt-1 text-xs text-fuchsia-300/70">Interpretado: {semanticInterpreted}</p> : null}
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">{state.status}</span>
        </div>

        {state.status === 'idle' ? (
          <div className="grid place-items-center py-16 text-center text-white/55">
            <p>No hay búsquedas todavía.</p>
          </div>
        ) : null}

        {state.status === 'loading' ? (
          <div className="grid place-items-center py-16 text-center text-white/55">
            <div className="flex flex-col items-center gap-4">
              <Spinner className="h-7 w-7" />
              <p>Buscando imágenes...</p>
            </div>
          </div>
        ) : null}

        {state.status === 'error' ? (
          <div className="grid place-items-center py-16 text-center text-red-200">
            <p>{state.message}</p>
          </div>
        ) : null}

        {state.status === 'success' && !hasResults ? (
          <div className="grid place-items-center py-16 text-center text-white/55">
            <p>No se encontraron imágenes para esos filtros.</p>
          </div>
        ) : null}

        {hasResults ? (
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {state.results.map((item) => (
              <NasaResultCard key={item.id} item={item} collections={collectionsLoaded ? collections : []} />
            ))}
          </div>
        ) : null}

      </div>
    </div>
  );
}
