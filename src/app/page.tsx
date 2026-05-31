import { ArrowRight, Sparkles, Telescope } from 'lucide-react';
import Link from 'next/link';

const features = [
  'Búsqueda avanzada de NASA con filtros por fecha, rover, cámara y misión.',
  'Colecciones personalizadas por usuario.',
  'Enriquecimiento con IA para descripciones y contexto.',
  'Timeline interactivo y sistema de tags como diferenciadores.',
];

const roadmap = [
  'Base del proyecto y UI inicial.',
  'PostgreSQL, Prisma y Docker Compose.',
  'JWT propio para registro y login.',
  'NASA API, colecciones, IA, tags y tests.',
];

export default function HomePage() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-16 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" />
            MindShore challenge foundation
          </div>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Explore NASA imagery, curate collections, and enrich everything with AI.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
            This repo is being built as a modular fullstack app with Next.js, PostgreSQL, Prisma,
            JWT auth, and a polished product-oriented UI.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="#roadmap"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow transition-colors hover:bg-primary/90"
            >
              Ver roadmap <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Explorar NASA
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/90"
            >
              Ver features
            </Link>
          </div>
        </div>

        <div className="glass rounded-3xl p-6 shadow-2xl shadow-cyan-950/30">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300">
              <Telescope className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Project status</p>
              <p className="text-sm text-white/50">Phase 3: JWT auth</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {features.map((feature) => (
              <div key={feature} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div id="features" className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {features.map((feature) => (
          <article key={feature} className="glass rounded-3xl p-5 text-sm leading-6 text-white/75">
            {feature}
          </article>
        ))}
      </div>

      <div id="roadmap" className="glass rounded-3xl p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">Implementation roadmap</h2>
            <p className="mt-2 text-sm text-white/60">A phased plan to cover every README requirement.</p>
          </div>
          <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">
            Ready to build
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {roadmap.map((item, index) => (
            <div key={item} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-400/15 text-xs font-semibold text-cyan-200">
                {index + 1}
              </span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
