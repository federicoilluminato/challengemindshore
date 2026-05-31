import { describe, expect, it } from 'vitest';

import { cn } from '@/lib/utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });

  it('handles conflicting classes', () => {
    expect(cn('px-4', 'px-6')).toBe('px-6');
  });

  it('filters falsy values', () => {
    expect(cn('text-white', false, null, undefined, 0 ? 'hidden' : '')).toBe('text-white');
  });
});
