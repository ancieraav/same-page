import { describe, expect, it, vi, afterEach } from 'vitest';
import {
  ROUND_SECONDS,
  SUGGEST_EVERY,
  SESSION_STATUS,
  assembleFinalReport,
  buildWorkflow,
  goalsWorkflow,
  roomSummaryTemplate,
  roundDeadlineFrom,
  secondsLeft,
  stringArrayOf,
  validateRoomSummary,
} from '@/lib/session';
import { sessionGet, sessionPost } from '@/lib/sessionClient';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('session helpers', () => {
  it('exposes infinite-session constants', () => {
    expect(SUGGEST_EVERY).toBe(5);
    expect(ROUND_SECONDS).toBe(180);
    expect(SESSION_STATUS.FINALIZATION).toBe('finalization');
  });

  it('computes seconds left from an ISO deadline', () => {
    const now = new Date('2026-01-01T00:00:00Z').getTime();
    expect(secondsLeft(new Date(now + 90_000).toISOString(), now)).toBe(90);
    expect(secondsLeft(new Date(now - 1000).toISOString(), now)).toBe(0);
    expect(secondsLeft('not-a-date', now)).toBe(0);
  });

  it('stamps deadlines ROUND_SECONDS ahead', () => {
    const now = new Date('2026-01-01T00:00:00Z').getTime();
    expect(new Date(roundDeadlineFrom(now)).getTime() - now).toBe(180_000);
  });

  it('validates string arrays', () => {
    expect(stringArrayOf(['a', 'b'], 20, 500)).toEqual(['a', 'b']);
    expect(stringArrayOf([], 20, 500)).toEqual([]);
    expect(stringArrayOf('x', 20, 500)).toBe(null);
    expect(stringArrayOf(['a', 1], 20, 500)).toBe(null);
    expect(stringArrayOf(['a'.repeat(501)], 20, 500)).toBe(null);
    expect(stringArrayOf(['a', 'b', 'c'], 2, 500)).toBe(null);
  });

  it('assembles the final report from rows', () => {    const report = assembleFinalReport(
      { code: 'ABC1234', name: 'Room', topic: 'Topic' },
      [
        {
          number: 1,
          text: 'Q1?',
          answers: [
            { question: 1, guest_id: 'g1', name: 'A', body: 'Yes', missing: false },
            { question: 1, guest_id: 'g2', name: 'B', body: '', missing: true },
          ],
          analytics: { summaries: [], alignment: 80, agreed: ['x'], disagreed: [] },
        },
      ],
    ) as { rounds_answered: number; alignment_trend: (number | null)[]; rounds: unknown[] };
    expect(report.rounds_answered).toBe(1);
    expect(report.alignment_trend).toEqual([80]);
    expect(report.rounds).toHaveLength(1);
  });

  it('builds the workflow state machine', () => {
    expect(buildWorkflow({ status: 'waiting', activeNumber: null, pendingSummaryNumber: null, completedCount: 0, suggestsSent: 0 }).next_tool).toBe('start_session');
    expect(buildWorkflow({ status: 'answering', activeNumber: null, pendingSummaryNumber: null, completedCount: 0, suggestsSent: 0 }).next_tool).toBe('send_question_context');
    expect(buildWorkflow({ status: 'answering', activeNumber: 3, pendingSummaryNumber: null, completedCount: 2, suggestsSent: 0 }).state).toBe('answering');
    expect(buildWorkflow({ status: 'analyzing', activeNumber: null, pendingSummaryNumber: 2, completedCount: 1, suggestsSent: 0 }).next_tool).toBe('send_question_summary');
    expect(buildWorkflow({ status: 'analyzing', activeNumber: null, pendingSummaryNumber: null, completedCount: 5, suggestsSent: 0 }).state).toBe('suggest_due');
    expect(buildWorkflow({ status: 'analyzing', activeNumber: null, pendingSummaryNumber: null, completedCount: 5, suggestsSent: 1 }).next_tool).toBe('send_question_context');
    expect(buildWorkflow({ status: 'analyzing', activeNumber: null, pendingSummaryNumber: null, completedCount: 6, suggestsSent: 1 }).next_tool).toBe('send_question_context');
    expect(buildWorkflow({ status: 'finalization', activeNumber: null, pendingSummaryNumber: null, completedCount: 6, suggestsSent: 1 }).next_tool).toBe('send_room_summary');
    expect(buildWorkflow({ status: 'completed', activeNumber: null, pendingSummaryNumber: null, completedCount: 6, suggestsSent: 1 }).next_tool).toBe('view_room_summary');
  });

  it('describes goals without I/O', () => {
    const goals = goalsWorkflow() as { app: string; ai_responsibilities: string[] };
    expect(goals.app).toContain('Same Page');
    expect(goals.ai_responsibilities.length).toBeGreaterThan(0);
  });

  it('validates the room summary template', () => {
    const valid = {
      room: { code: 'X', name: 'N', topic: 'T' },
      questions_completed: 6,
      rounds_answered: 6,
      alignment_trend: [80, null],
      rounds: [],
      agreements: ['a'],
      disagreements: [],
      open_points: [],
    };
    expect(validateRoomSummary(valid)).toEqual({ ok: true });
    expect(validateRoomSummary(null).ok).toBe(false);
    expect(validateRoomSummary({ ...valid, agreements: 'x' }).ok).toBe(false);
    expect(validateRoomSummary({ ...valid, room: { code: 'X' } }).ok).toBe(false);
    expect(roomSummaryTemplate()['questions_completed']).toBe('integer');
  });
});

describe('sessionClient', () => {
  function mockFetch(status: number, payload: unknown) {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(payload),
    }));
  }

  it('posts and returns the payload', async () => {
    mockFetch(200, { code: 'X', status: 'answering' });
    const result = (await sessionPost('X', 'start', { guest_id: 'g12345678' })) as { code: string };
    expect(result.code).toBe('X');
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      '/api/rooms/X/session/start',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('throws the server message on failure', async () => {
    mockFetch(403, { error: 'Only the room operator can start the session.' });
    await expect(sessionPost('X', 'start', {})).rejects.toThrow('Only the room operator');
  });

  it('falls back to status when the body has no message', async () => {
    mockFetch(500, null);
    await expect(sessionGet('X')).rejects.toThrow('500');
  });
});
