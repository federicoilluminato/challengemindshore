"use client";

import { useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginSchema, type LoginInput } from '@/lib/schemas/auth';
import { useAuthStore } from '@/lib/stores/auth';

import { AuthCard } from './auth-card';

export function LoginForm() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError(null);

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    const payload = (await response.json()) as { user?: { id: string; email: string; name: string | null }; message?: string };

    if (!response.ok || !payload.user) {
      setServerError(payload.message ?? 'No se pudo iniciar sesión');
      return;
    }

    setUser(payload.user);
    router.push('/dashboard');
    router.refresh();
  });

  return (
    <AuthCard
      title="Ingresar"
      description="Accedé para guardar imágenes, colecciones y tags en tu cuenta."
      footer={
        <>
          ¿No tenés cuenta?{' '}
          <Link href="/register" className="font-medium text-cyan-200 hover:text-cyan-100">
            Registrate
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...form.register('email')} />
          {form.formState.errors.email ? (
            <p className="text-sm text-red-300">{form.formState.errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className="pr-20"
              {...form.register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-medium text-cyan-200 transition hover:bg-white/5 hover:text-cyan-100"
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          {form.formState.errors.password ? (
            <p className="text-sm text-red-300">{form.formState.errors.password.message}</p>
          ) : null}
        </div>

        {serverError ? <p className="text-sm text-red-300">{serverError}</p> : null}

        <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Ingresando...' : 'Ingresar'}
        </Button>
      </form>
    </AuthCard>
  );
}
