"use client";

import type { ReactNode } from 'react';

import Link from 'next/link';

type AuthCardProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <div className="glass mx-auto w-full max-w-md rounded-3xl p-8 shadow-2xl shadow-cyan-950/20">
      <div className="mb-8 space-y-2 text-center">
        <Link href="/" className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
          MindShore
        </Link>
        <h1 className="text-3xl font-semibold text-white">{title}</h1>
        <p className="text-sm leading-6 text-white/60">{description}</p>
      </div>
      {children}
      <div className="mt-6 text-center text-sm text-white/55">{footer}</div>
    </div>
  );
}
