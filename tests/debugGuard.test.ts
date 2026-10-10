import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { assertDebugMode, isDebugMode } from '@/lib/debugGuard';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

describe('debugGuard', () => {
  const originalEnv = process.env['NEXT_PUBLIC_DEBUG_MODE'];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env['NEXT_PUBLIC_DEBUG_MODE'] = originalEnv;
    } else {
      delete process.env['NEXT_PUBLIC_DEBUG_MODE'];
    }
  });

  it('recognizes debug mode when set to "true"', () => {
    process.env['NEXT_PUBLIC_DEBUG_MODE'] = 'true';
    expect(isDebugMode()).toBe(true);
    expect(() => { assertDebugMode(); }).not.toThrow();
  });

  it('rejects debug mode when unset or set to another value', () => {
    process.env['NEXT_PUBLIC_DEBUG_MODE'] = 'false';
    expect(isDebugMode()).toBe(false);
    expect(() => { assertDebugMode(); }).toThrow('NEXT_NOT_FOUND');

    process.env['NEXT_PUBLIC_DEBUG_MODE'] = 'disabled';
    expect(isDebugMode()).toBe(false);
    expect(() => { assertDebugMode(); }).toThrow('NEXT_NOT_FOUND');
  });
});
