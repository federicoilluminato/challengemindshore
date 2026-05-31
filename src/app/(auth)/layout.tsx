import type { ReactNode } from 'react';

export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <section className="mx-auto flex min-h-[calc(100vh-140px)] max-w-6xl items-center px-4 py-16 sm:px-6 lg:px-8">{children}</section>;
}
