import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="border-b border-white/10 bg-background/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-sm font-semibold tracking-wide text-white">
          MindShore
        </Link>
        <nav className="flex items-center gap-4 text-sm text-white/70">
          <a href="#features" className="transition hover:text-white">
            Features
          </a>
          <a href="#roadmap" className="transition hover:text-white">
            Roadmap
          </a>
        </nav>
      </div>
    </header>
  );
}
