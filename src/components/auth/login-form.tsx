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

import { AuthCard } from './auth-card';

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

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

    const payload = (await response.json()) as { message?: string };

    if (!response.ok) {
      setServerError(payload.message ?? 'No se pudo iniciar sesión');
      return;
    }

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
          <Input id="password" type="password" autoComplete="current-password" {...form.register('password')} />
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
