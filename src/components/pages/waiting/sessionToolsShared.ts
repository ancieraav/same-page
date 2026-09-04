'use client';

import { sessionContextGet, sessionGet, sessionPost } from '@/lib/sessionClient';

export interface SessionToolsBindings {
  getCode: () => string;
  getGuestId: () => string;
  isOperator: () => boolean;
  /** Latest known room status ('waiting' before live data loads). */
  getStatus?: () => string;
}

export interface SnapshotQuestion {
  number?: unknown;
  text?: unknown;
  status?: unknown;
  deadline_at?: unknown;
  has_analytics?: unknown;
}

export interface SnapshotAnswer {
  question?: unknown;
  guest_id?: unknown;
  name?: unknown;
  body?: unknown;
  missing?: unknown;
}

export interface SnapshotAnalytics {
  question?: unknown;
  summaries?: unknown;
  alignment?: unknown;
  agreed?: unknown;
  disagreed?: unknown;
  hidden_mismatches?: unknown;
  assumptions?: unknown;
  flags?: unknown;
  confidence?: unknown;
}

export interface SessionSnapshot {
  room?: { status?: unknown };
  current?: { number?: unknown } | null;
  questions?: SnapshotQuestion[];
  answers?: SnapshotAnswer[];
  analytics?: SnapshotAnalytics[];
  workflow?: unknown;
  completed_count?: unknown;
  suggests?: { number?: unknown; text?: unknown; created_at?: unknown }[];
  suggest_responses?: { suggest_number?: unknown; guest_id?: unknown; name?: unknown; body?: unknown }[];
  room_summary?: { available?: unknown; summary?: unknown };
  [key: string]: unknown;
}

export interface RoomContextPayload {
  room?: { topic?: unknown; information?: unknown };
  attachments?: { id?: unknown; name?: unknown }[] & Record<string, unknown>[];
  contexts?: { id?: unknown; name?: unknown; kind?: unknown }[];
  [key: string]: unknown;
}

export function guard(bindings: SessionToolsBindings): { code: string; guestId: string } {
  if (!bindings.isOperator()) throw new Error('Only the room operator can use this tool.');
  return readCaller(bindings);
}

/** Code + identity without the operator gate (waiting-room tools for everyone). */
export function readCaller(bindings: SessionToolsBindings): { code: string; guestId: string } {
  const code = bindings.getCode();
  if (!code) throw new Error('Missing room code.');
  return { code, guestId: bindings.getGuestId() };
}

export async function readSnapshot(code: string, guestId: string): Promise<SessionSnapshot> {
  return (await sessionGet(code, guestId)) as SessionSnapshot;
}

export async function readRoomContext(code: string, guestId: string): Promise<RoomContextPayload> {
  return (await sessionContextGet(code, guestId)) as RoomContextPayload;
}

export async function postSession(code: string, path: string, body: Record<string, unknown>): Promise<string> {
  return JSON.stringify(await sessionPost(code, path, body));
}

/** Optional integer array filter (numbers). Null = no filter. */
export function readIntList(args: unknown, field: string): number[] | null {
  if (typeof args !== 'object' || args === null || !(field in args)) return null;
  const value = (args as Record<string, unknown>)[field];
  if (value === undefined || value === null) return null;
  const list = Array.isArray(value) ? value : [value];
  const out: number[] = [];
  for (const item of list) {
    if (typeof item !== 'number' || !Number.isInteger(item)) {
      throw new Error(`"${field}" must be an integer or an array of integers.`);
    }
    out.push(item);
  }
  return out.length > 0 ? [...new Set(out)] : null;
}

/** Optional string array filter (ids, guest_ids, kinds). Null = no filter. */
export function readStringListFilter(args: unknown, field: string): string[] | null {
  if (typeof args !== 'object' || args === null || !(field in args)) return null;
  const value = (args as Record<string, unknown>)[field];
  if (value === undefined || value === null) return null;
  const list = typeof value === 'string' ? [value] : value;
  if (!Array.isArray(list)) throw new Error(`"${field}" must be a string or an array of strings.`);
  const out = [...new Set(list.filter((i): i is string => typeof i === 'string' && i.length > 0))];
  return out.length > 0 ? out : null;
}

export function readOptionalBool(args: unknown, field: string): boolean {
  if (typeof args !== 'object' || args === null || !(field in args)) return false;
  return (args as Record<string, unknown>)[field] === true;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => { setTimeout(resolve, ms); });
}

/**
 * Blocking wait: poll the session until a question leaves `active`
 * (server lazy-closes on read when all answered or past deadline).
 * Returns closed=false on timeout instead of throwing, so the agent can
 * resume later with view_question_context_responses.
 */
export async function waitForQuestionClose(
  code: string,
  guestId: string,
  number: number,
  options?: { signal?: AbortSignal },
): Promise<{ closed: boolean; timedOut: boolean }> {
  const started = Date.now();
  let maxWaitMs = 210_000;
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (options?.signal?.aborted) throw new Error('Wait aborted. Resume with view_question_context_responses.');
    const snapshot = await readSnapshot(code, guestId);
    const questions = Array.isArray(snapshot.questions) ? snapshot.questions : [];
    const target = questions.find((q) => q.number === number) ?? null;
    if (target?.status !== 'active') return { closed: true, timedOut: false };
    if (attempt === 0 && typeof target.deadline_at === 'string') {
      const left = new Date(target.deadline_at).getTime() - started;
      if (!Number.isNaN(left)) maxWaitMs = Math.min(240_000, Math.max(15_000, left + 30_000));
    }
    if (Date.now() - started > maxWaitMs) return { closed: false, timedOut: true };
    await sleep(2000);
  }
  return { closed: false, timedOut: true };
}
