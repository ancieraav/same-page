import { describe, expect, test } from 'vitest';
import { generateRoomCode, isValidRoomCode, normalizeRoomCode } from '@/lib/roomCode';

describe('room codes', () => {
  test('generates a 7-char code from the friendly alphabet', () => {
    for (let index = 0; index < 50; index += 1) {
      const code = generateRoomCode();
      expect(code).toHaveLength(7);
      expect(isValidRoomCode(code)).toBe(true);
    }
  });

  test('avoids ambiguous characters', () => {
    for (let index = 0; index < 200; index += 1) {
      expect(generateRoomCode()).not.toMatch(/[01IL]/);
    }
  });

  test('normalizes user input', () => {
    expect(normalizeRoomCode(' ab-12 ')).toBe('AB12');
    expect(isValidRoomCode('ABCKQ72')).toBe(true);
    expect(isValidRoomCode('ABCKQ')).toBe(false);
  });
});
