import Link from 'next/link';
import { cookies } from 'next/headers';

import { SiteNav } from '@/components/site-nav';

export function SiteHeader() {
  const isLoggedIn = Boolean(cookies().get('mindshore-auth-token')?.value);

  return (
    <header className="border-b border-white/10 bg-background/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-sm font-semibold tracking-wide text-white">
          MindShore
        </Link>
        <SiteNav isLoggedIn={isLoggedIn} />
      </div>
    </header>
  );
}
