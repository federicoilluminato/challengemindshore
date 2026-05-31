"use client";

import { useState } from 'react';

import Image from 'next/image';

import type { NasaSearchResult } from '@/lib/nasa';
import { Button } from '@/components/ui/button';

type NasaResultCardProps = {
  item: NasaSearchResult;
};

export function NasaResultCard({ item }: NasaResultCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isLongDescription = item.description.length > 180;

  return (
    <article className="glass overflow-hidden rounded-3xl border border-white/10">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/20">
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-500 hover:scale-[1.03]"
        />
      </div>
      <div className="space-y-3 p-5">
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
      </div>
    </article>
  );
}
