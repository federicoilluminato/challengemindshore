"use client";

import { useMemo, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
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

  const form = useForm<NasaSearchFormValues, unknown, NasaSearchOutput>({
    resolver: zodResolver(nasaSearchSchema),
    defaultValues,
  });

  const hasResults = useMemo(() => state.results.length > 0, [state.results]);

  const onSubmit = form.handleSubmit(async (values) => {
    setState((current) => ({ ...current, status: 'loading', message: 'Buscando imágenes de NASA...' }));

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

  return (
    <div className="space-y-10">
      <div className="glass rounded-3xl p-8">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/70">NASA Explorer</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Búsqueda avanzada</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">Buscá imágenes del rover y de la librería de NASA con filtros por fecha, rover, cámara y misión.</p>
        </div>

        <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" onSubmit={onSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="query">Texto libre</Label>
            <Input id="query" placeholder="atardeceres en Marte" {...form.register('query')} />
            {form.formState.errors.query ? <p className="text-sm text-red-300">{form.formState.errors.query.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mission">Misión</Label>
            <Input id="mission" placeholder="mars 2020" {...form.register('mission')} />
            {form.formState.errors.mission ? <p className="text-sm text-red-300">{form.formState.errors.mission.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Fecha exacta</Label>
            <Input id="date" type="date" {...form.register('date')} />
            {form.formState.errors.date ? <p className="text-sm text-red-300">{form.formState.errors.date.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rover">Rover</Label>
            <select
              id="rover"
              className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white shadow-sm outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
              {...form.register('rover')}
            >
              <option value="">Sin filtro</option>
              <option value="curiosity">Curiosity</option>
              <option value="opportunity">Opportunity</option>
              <option value="spirit">Spirit</option>
              <option value="perseverance">Perseverance</option>
            </select>
            {form.formState.errors.rover ? <p className="text-sm text-red-300">{form.formState.errors.rover.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="camera">Cámara</Label>
            <Input id="camera" placeholder="FHAZ, RHAZ, NAVCAM..." {...form.register('camera')} />
            {form.formState.errors.camera ? <p className="text-sm text-red-300">{form.formState.errors.camera.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="page">Página</Label>
            <Input id="page" type="number" min={1} max={5} {...form.register('page', { valueAsNumber: true })} />
            {form.formState.errors.page ? <p className="text-sm text-red-300">{form.formState.errors.page.message}</p> : null}
          </div>

          <div className="md:col-span-2 xl:col-span-3">
            <Button type="submit" disabled={form.formState.isSubmitting}>
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
      </div>

      <div className="glass rounded-3xl p-6">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Resultados</h2>
            <p className="text-sm text-white/55">{state.message}</p>
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
              <NasaResultCard key={item.id} item={item} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
