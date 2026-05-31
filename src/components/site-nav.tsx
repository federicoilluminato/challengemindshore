"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { LogoutLink } from '@/components/auth/logout-link';

const navItems = [
  { href: '/explore', label: 'Explore' },
  { href: '/register', label: 'Register' },
  { href: '/dashboard', label: 'Dashboard' },
];

type SiteNavProps = {
  isLoggedIn: boolean;
};

export function SiteNav({ isLoggedIn }: SiteNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-4 text-sm text-white/70">
      {navItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={[
              'relative pb-1 transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:bg-cyan-300 after:transition-transform after:duration-300',
              isActive ? 'text-white after:scale-x-100' : 'after:scale-x-0 hover:text-white hover:after:scale-x-100',
            ].join(' ')}
          >
            {item.label}
          </Link>
        );
      })}
      {isLoggedIn ? (
        <LogoutLink
          className="relative pb-1 transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:bg-cyan-300 after:scale-x-0 after:transition-transform after:duration-300 hover:text-white hover:after:scale-x-100"
        />
      ) : (
        <Link href="/login" className="relative pb-1 transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:bg-cyan-300 after:scale-x-0 after:transition-transform after:duration-300 hover:text-white hover:after:scale-x-100">
          Login
        </Link>
      )}
    </nav>
  );
}
