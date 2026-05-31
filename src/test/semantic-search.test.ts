import { describe, it, expect } from 'vitest';

import { interpretNaturalLanguage } from '@/lib/semantic-search';

describe('interpretNaturalLanguage', () => {
  it('extracts rover from natural language query', () => {
    const result = interpretNaturalLanguage('show me photos from perseverance');
    expect(result.interpreted.rover).toBe('perseverance');
  });

  it('extracts camera when mentioned', () => {
    const result = interpretNaturalLanguage('curiosity navcam images');
    expect(result.interpreted.rover).toBe('curiosity');
    expect(result.interpreted.camera).toBe('NAVCAM');
  });

  it('removes English filler words from query', () => {
    const result = interpretNaturalLanguage('show me mars sunsets');
    expect(result.interpreted.query).not.toContain('show');
    expect(result.interpreted.query).not.toContain('me');
  });

  it('returns empty query for empty input', () => {
    const result = interpretNaturalLanguage('');
    expect(result.interpreted.query).toBe('');
    expect(result.originalQuery).toBe('');
  });
});
