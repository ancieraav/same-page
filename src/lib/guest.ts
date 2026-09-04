'use client';

import { readStored, writeStored } from '@/lib/storage';

const GUEST_KEY = 'samepage_guest_id';
const TAB_GUEST_KEY = 'samepage_tab_guest_id';

function newGuestId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `guest-${String(Date.now())}-${String(Math.floor(Math.random() * 1e9))}`;
}

/**
 * Stable per-browser guest identity (no account needed).
 * A tab-scoped override (sessionStorage) wins when present so one browser
 * can simulate two seats via `?seat=new` (demo/testing only).
 */
export function getGuestId(): string {
  if (typeof window !== 'undefined') {
    try {
      const tab = window.sessionStorage.getItem(TAB_GUEST_KEY);
      if (tab) return tab;
    } catch {
      // Storage is optional; fall through to the browser identity.
    }
  }
  const existing = readStored<string | null>(GUEST_KEY, null);
  if (existing) return existing;
  const created = newGuestId();
  writeStored(GUEST_KEY, created);
  return created;
}

/** Mint a tab-scoped guest identity (used with `?seat=new`). */
export function mintTabGuestId(): string {
  const created = newGuestId();
  try {
    window.sessionStorage.setItem(TAB_GUEST_KEY, created);
  } catch {
    // Storage is optional for this prototype.
  }
  return created;
}
