"use client";

import { useState } from 'react';

import Image from 'next/image';

import { zodResolver } from '@hookform/resolvers/zod';
import { Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import type { NasaSearchResult } from '@/lib/nasa';

const timelineSearchSchema = z.object({
  query: z.string().min(2, 'Mínimo 2 caracteres').max(120).optional().or(z.literal('')),
  date: z.string().optional().or(z.literal('')),
});

type TimelineSearchValues = z.infer<typeof timelineSearchSchema>;

function formatDisplayDate(raw: string) {
  try {
    const d = new Date(raw);
    return d.toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return raw;
  }
}

export function NasaTimeline() {
  const [results, setResults] = useState<NasaSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Buscá imágenes para generar una línea de tiempo.');

  const form = useForm<TimelineSearchValues>({
    resolver: zodResolver(timelineSearchSchema),
    defaultValues: { query: '', date: '' },
  });

  const sorted = [...results]
    .filter((item) => item.date)
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());

  const onSubmit = form.handleSubmit(async (values) => {
    setLoading(true);
    setMessage('Buscando...');

    try {
      const response = await fetch('/api/nasa/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, page: 1 }),
      });

      const payload = (await response.json()) as { results?: NasaSearchResult[]; message?: string };

      if (!response.ok) {
        setMessage(payload.message ?? 'Error en la búsqueda');
        setResults([]);
        return;
      }

      const items = payload.results ?? [];

      if (!items.length) {
        setMessage('No se encontraron resultados.');
        setResults([]);
        return;
      }

      const withDates = items.filter((item) => item.date);
      setResults(items);
      setMessage(
        withDates.length
          ? `Se encontraron ${withDates.length} imágenes con fecha para la línea de tiempo.`
          : 'Resultados encontrados, pero ninguno tiene fecha asociada.',
      );
    } catch {
      setMessage('Error al buscar imágenes.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="space-y-10">
      <div className="glass rounded-3xl border border-white/10 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.24)]">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/70">Línea de tiempo</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Timeline interactivo</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">Buscá imágenes y ordenalas cronológicamente para explorar la historia de la exploración espacial.</p>
        </div>

        <form
          className="flex flex-wrap items-end gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5"
          onSubmit={onSubmit}
          noValidate
        >
          <div className="min-w-0 flex-1 space-y-2">
            <Label htmlFor="tl-query" className="text-white/80">
              Buscar
            </Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              <Input
                id="tl-query"
                placeholder="Marte, Saturno, Apollo..."
                className="h-11 border-white/10 bg-slate-950/35 pl-9 text-white placeholder:text-white/30 focus-visible:border-cyan-400/50 focus-visible:ring-cyan-400/20 [&:-webkit-autofill]:[box-shadow:0_0_0_30px_#0f172a_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                {...form.register('query')}
              />
            </div>
          </div>
          <div className="w-48 space-y-2">
            <Label htmlFor="tl-date" className="text-white/80">
              Desde fecha
            </Label>
            <Input
              id="tl-date"
              type="date"
              className="h-11 border-white/10 bg-slate-950/35 text-white focus-visible:border-cyan-400/50 focus-visible:ring-cyan-400/20 [&:-webkit-autofill]:[box-shadow:0_0_0_30px_#0f172a_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
              {...form.register('date')}
            />
          </div>
          <Button type="submit" className="h-11 w-32 bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 text-slate-950 shadow-lg shadow-cyan-500/20 hover:from-cyan-300 hover:via-sky-300 hover:to-indigo-300" disabled={loading}>
            {loading ? <Spinner className="h-4 w-4" /> : 'Buscar'}
          </Button>
        </form>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-white/55">{message}</p>

        {sorted.length ? (
          <div className="relative pl-8 before:absolute before:left-[11px] before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-gradient-to-b before:from-cyan-400/60 before:to-indigo-400/60">
            {sorted.map((item) => (
              <div key={item.id} className="relative mb-10 last:mb-0">
                <div className="absolute -left-[27px] top-6 h-3 w-3 rounded-full border-2 border-cyan-400 bg-slate-950" />

                <div className="glass overflow-hidden rounded-2xl border border-white/10">
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative aspect-[4/3] w-full sm:w-48 sm:shrink-0 sm:self-start">
                      <Image src={item.imageUrl} alt={item.title} fill className="object-cover" sizes="192px" />
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-4 pl-0 sm:pl-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">
                            {item.source === 'mars-rover' ? 'Mars Rover' : 'NASA Library'}
                          </p>
                          <h3 className="mt-1 text-lg font-semibold text-white">{item.title}</h3>
                        </div>
                        {item.date ? (
                          <span className="shrink-0 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100">
                            {formatDisplayDate(item.date)}
                          </span>
                        ) : null}
                      </div>
                      <p className="line-clamp-2 text-sm leading-6 text-white/65">{item.description}</p>
                      <div className="flex flex-wrap gap-2 text-xs text-white/55">
                        {item.rover ? <span className="rounded-full bg-white/5 px-2.5 py-1">Rover: {item.rover}</span> : null}
                        {item.camera ? <span className="rounded-full bg-white/5 px-2.5 py-1">Camera: {item.camera}</span> : null}
                        {item.mission ? <span className="rounded-full bg-white/5 px-2.5 py-1">Misión: {item.mission}</span> : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
