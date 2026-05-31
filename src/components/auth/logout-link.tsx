"use client";

import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/lib/stores/auth';

type LogoutLinkProps = {
  className?: string;
};

export function LogoutLink({ className = '' }: LogoutLinkProps) {
  const router = useRouter();
  const clearUser = useAuthStore((state) => state.clearUser);

  const handleClick = async () => {
    clearUser();
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      Logout
    </button>
  );
}
