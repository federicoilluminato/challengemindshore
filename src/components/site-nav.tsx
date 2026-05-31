"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { LogoutLink } from '@/components/auth/logout-link';

const leftItems = [
  { href: '/explore', label: 'Explore' },
  { href: '/timeline', label: 'Timeline' },
  { href: '/dashboard', label: 'Dashboard' },
];

const rightItems = [
  { href: '/register', label: 'Register' },
];

type SiteNavProps = {
  isLoggedIn: boolean;
};

export function SiteNav({ isLoggedIn }: SiteNavProps) {
  const pathname = usePathname();

  function linkClass(isActive: boolean) {
    return [
      'relative pb-1 transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:bg-cyan-300 after:transition-transform after:duration-300',
      isActive ? 'text-white after:scale-x-100' : 'after:scale-x-0 hover:text-white hover:after:scale-x-100',
    ].join(' ');
  }

  return (
    <nav className="flex w-full items-center justify-between text-sm text-white/70">
      <div className="flex items-center gap-4">
        {leftItems.map((item) => (
          <Link key={item.href} href={item.href} aria-current={pathname === item.href ? 'page' : undefined} className={linkClass(pathname === item.href)}>
            {item.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-4">
        {rightItems.map((item) => (
          <Link key={item.href} href={item.href} aria-current={pathname === item.href ? 'page' : undefined} className={linkClass(pathname === item.href)}>
            {item.label}
          </Link>
        ))}
        {isLoggedIn ? (
          <LogoutLink className="relative pb-1 transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:bg-cyan-300 after:scale-x-0 after:transition-transform after:duration-300 hover:text-white hover:after:scale-x-100" />
        ) : (
          <Link href="/login" className={linkClass(pathname === '/login')}>
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
