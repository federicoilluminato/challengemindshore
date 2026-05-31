"use client";

import { useRouter } from 'next/navigation';

type LogoutLinkProps = {
  className?: string;
};

export function LogoutLink({ className = '' }: LogoutLinkProps) {
  const router = useRouter();

  const handleClick = async () => {
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
