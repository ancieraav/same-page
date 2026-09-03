import { describe, expect, it } from 'vitest';
import { cleanRoomCode } from '@/lib/clipboard';

describe('cleanRoomCode', () => {
  it('keeps only seven uppercase alphanumeric characters', () => {
    expect(cleanRoomCode('ab-12 cd!345')).toBe('AB12CD3');
  });

  it('returns an empty string for invalid input', () => {
    expect(cleanRoomCode('---')).toBe('');
  });
});
