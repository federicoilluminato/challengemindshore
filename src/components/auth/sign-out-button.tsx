"use client";

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

export function SignOutButton() {
  const router = useRouter();

  const handleClick = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <Button type="button" variant="secondary" onClick={handleClick}>
      Cerrar sesión
    </Button>
  );
}
