'use client';

import {
  emptySchema,
  objectSchema,
  readOptionalInt,
  readOptionalString,
  readRequiredInt,
  type WebMCPTool,
} from '@/lib/webmcp';
import { questionSummaryTemplate } from '@/lib/session';
import {
  guard,
  readIntList,
  readOptionalBool,
  readSnapshot,
  readStringListFilter,
  postSession,
  sleep,
  waitForQuestionClose,
  type SessionToolsBindings,
} from './sessionToolsShared';

/** Tools 8-13: question view/list, responses view/list, summary send/list/view. */
export function sessionToolsRounds(bindings: () => SessionToolsBindings): WebMCPTool[] {
  async function act(path: string, body: Record<string, unknown>): Promise<string> {
    const { code, guestId } = guard(bindings());
    return postSession(code, path, { ...body, guest_id: guestId });
  }

  return [
    {
      name: 'view_question_context',
      description: 'Read the full text of questions (latest, one, several, or all).',
      inputSchema: objectSchema({
        numbers: { type: 'array', description: 'Question numbers. Omit for all.', items: { type: 'integer', minimum: 1 } },
        latest: { type: 'boolean', description: 'Only the latest question.' },
      }),
      annotations: { readOnlyHint: true },
      execute: async (args: unknown) => {
        const { code, guestId } = guard(bindings());
        const numbers = readIntList(args, 'numbers');
        const latest = readOptionalBool(args, 'latest');
        const snapshot = await readSnapshot(code, guestId);
        let questions = Array.isArray(snapshot.questions) ? snapshot.questions : [];
        if (numbers) questions = questions.filter((q) => typeof q.number === 'number' && numbers.includes(q.number));
        if (latest && questions.length > 0) {
          const last = questions[questions.length - 1];
          questions = last ? [last] : [];
        }
        return JSON.stringify({ questions });
      },
    },
    {
      name: 'list_question_context_responses',
      description: 'List which participants answered per question without opening answer bodies. Omit number to list all questions.',
      inputSchema: objectSchema({
        number: { type: 'integer', description: 'Question number. Omit for all.', minimum: 1 },
      }),
      annotations: { readOnlyHint: true },
      execute: async (args: unknown) => {
        const { code, guestId } = guard(bindings());
        const raw = typeof args === 'object' && args !== null && 'number' in args ? (args as Record<string, unknown>)['number'] : undefined;
        const number = raw === undefined ? null : readRequiredInt(args, 'number', 'e.g. {"number": 1}');
        const snapshot = await readSnapshot(code, guestId);
        const answers = Array.isArray(snapshot.answers) ? snapshot.answers : [];
        const byQuestion = new Map<number, { total: number; guest_ids: string[] }>();
        for (const a of answers) {
          if (typeof a.question !== 'number') continue;
          if (number !== null && a.question !== number) continue;
          const entry = byQuestion.get(a.question) ?? { total: 0, guest_ids: [] };
          entry.total += 1;
          if (typeof a.guest_id === 'string') entry.guest_ids.push(a.guest_id);
          byQuestion.set(a.question, entry);
        }
        return JSON.stringify({
          responses: [...byQuestion.entries()].map(([question, entry]) => ({ question, ...entry })),
        });
      },
    },
    {
      name: 'view_question_context_responses',
      description: 'Read participant responses (active, one, several, or all questions; one, several, or all participants). Resumes waiting for the active question when it is still open unless timeout_seconds=0.',
      inputSchema: objectSchema({
        numbers: { type: 'array', description: 'Question numbers. Omit for all.', items: { type: 'integer', minimum: 1 } },
        guest_ids: { type: 'array', description: 'Participant ids. Omit for all.', items: { type: 'string' } },
        active_only: { type: 'boolean', description: 'Only the active question.' },
        timeout_seconds: {
          type: 'integer',
          description: 'Maximum seconds to wait for active question (default 60, max 180). Set 0 to return immediately without waiting.',
          minimum: 0,
          maximum: 180,
        },
      }),
      annotations: { readOnlyHint: true },
      execute: async (args: unknown, options) => {
        const { code, guestId } = guard(bindings());
        const numbers = readIntList(args, 'numbers');
        const guestIds = readStringListFilter(args, 'guest_ids');
        const activeOnly = readOptionalBool(args, 'active_only');
        const timeoutSeconds = readOptionalInt(args, 'timeout_seconds');
        let snapshot = await readSnapshot(code, guestId);
        const questions = Array.isArray(snapshot.questions) ? snapshot.questions : [];
        const active = questions.find((q) => q.status === 'active' && typeof q.number === 'number') as { number: number } | undefined;
        let waited = false;
        const wantsActive = active && (!numbers || numbers.includes(active.number)) && (activeOnly || true);
        if (wantsActive) {
          const wait = await waitForQuestionClose(code, guestId, active.number, {
            ...(options.signal ? { signal: options.signal } : {}),
            ...(timeoutSeconds !== undefined ? { timeoutSeconds } : {}),
          });
          waited = !wait.timedOut;
          snapshot = await readSnapshot(code, guestId);
        }
        const answers = Array.isArray(snapshot.answers) ? snapshot.answers : [];
        const filtered = answers.filter((a) => {
          if (typeof a.question !== 'number') return false;
          if (activeOnly && a.question !== active?.number) return false;
          if (numbers && !numbers.includes(a.question)) return false;
          if (guestIds && (typeof a.guest_id !== 'string' || !guestIds.includes(a.guest_id))) return false;
          return true;
        });
        return JSON.stringify(waited
          ? { responses: filtered, waited, workflow: snapshot.workflow ?? null }
          : { responses: filtered, waited });
      },
    },
    {
      name: 'send_question_summary',
      description: `Send the summary and analysis for one completed question. Required template: ${JSON.stringify(questionSummaryTemplate())}`,
      inputSchema: objectSchema({
        number: { type: 'integer', description: 'Completed question number.', minimum: 1 },
        summaries: {
          type: 'array',
          description: 'One {guest_id, summary} per player.',
          items: {
            type: 'object',
            properties: {
              guest_id: { type: 'string', description: 'Player guest ID.' },
              summary: { type: 'string', description: 'Summary for that player.', maxLength: 2000 },
            },
            required: ['guest_id', 'summary'],
            additionalProperties: false,
          },
          minItems: 1,
          maxItems: 10,
        },
        alignment: { type: ['integer', 'null'], description: 'Overall alignment 0-100, or null.' },
        agreed: { type: 'array', items: { type: 'string' } },
        disagreed: { type: 'array', items: { type: 'string' } },
        hidden_mismatches: { type: 'array', items: { type: 'string' } },
        assumptions: { type: 'array', items: { type: 'string' } },
        flags: { type: 'array', items: { type: 'string' } },
        confidence: { type: 'string', maxLength: 1000 },
        timeout_seconds: {
          type: 'integer',
          description: 'Seconds to wait for participant review window (default 30, max 120). Set 0 to return workflow immediately without waiting.',
          minimum: 0,
          maximum: 120,
        },
      }, ['number', 'summaries']),
      annotations: { readOnlyHint: false },
      execute: async (args: unknown) => {
        const { code, guestId } = guard(bindings());
        const record = (typeof args === 'object' && args !== null ? args : {}) as Record<string, unknown>;
        const timeoutSeconds = readOptionalInt(args, 'timeout_seconds');
        await act('analytics', {
          number: readRequiredInt(args, 'number', 'e.g. {"number": 1}'),
          summaries: record['summaries'] ?? [],
          alignment: record['alignment'] ?? null,
          agreed: record['agreed'] ?? [],
          disagreed: record['disagreed'] ?? [],
          hidden_mismatches: record['hidden_mismatches'] ?? [],
          assumptions: record['assumptions'] ?? [],
          flags: record['flags'] ?? [],
          confidence: readOptionalString(args, 'confidence') ?? '',
        });
        // Participants have a 30-second review window before summary closes.
        // Wait up to timeout_seconds (default 30s) before returning workflow.
        const waitMs = timeoutSeconds === undefined
          ? 30_000
          : Math.max(0, Math.min(120, timeoutSeconds)) * 1000;
        if (waitMs > 0) {
          await sleep(waitMs);
        }
        const snapshot = await readSnapshot(code, guestId);
        return JSON.stringify({
          workflow: snapshot.workflow ?? null,
          completed_count: snapshot.completed_count ?? 0,
        });
      },
    },
    {
      name: 'list_question_summary',
      description: 'List summary availability per question without opening contents.',
      inputSchema: emptySchema(),
      annotations: { readOnlyHint: true },
      execute: async () => {
        const { code, guestId } = guard(bindings());
        const snapshot = await readSnapshot(code, guestId);
        const questions = Array.isArray(snapshot.questions) ? snapshot.questions : [];
        const analytics = Array.isArray(snapshot.analytics) ? snapshot.analytics : [];
        const byQuestion = new Map(analytics.map((a) => [a.question, a]));
        return JSON.stringify({
          summaries: questions.map((q) => ({
            number: q.number ?? null,
            has_summary: byQuestion.has(q.number),
            alignment: typeof (byQuestion.get(q.number)?.alignment) === 'number' ? byQuestion.get(q.number)?.alignment : null,
          })),
        });
      },
    },
    {
      name: 'view_question_summary',
      description: 'Read summaries (one, several, or all; overall or for one participant). Waits for active review window by default; returns immediately when timeout_seconds=0 or when querying history.',
      inputSchema: objectSchema({
        numbers: { type: 'array', description: 'Question numbers. Omit for all.', items: { type: 'integer', minimum: 1 } },
        guest_id: { type: 'string', description: 'One participant id. Omit for overall.' },
        timeout_seconds: {
          type: 'integer',
          description: 'Maximum seconds to wait for active review window (default 30, max 120). Set 0 to return immediately without waiting.',
          minimum: 0,
          maximum: 120,
        },
      }),
      annotations: { readOnlyHint: true },
      execute: async (args: unknown) => {
        const { code, guestId: operatorId } = guard(bindings());
        const numbers = readIntList(args, 'numbers');
        const guestFilter = readStringListFilter(args, 'guest_id');
        const participantId = guestFilter?.[0] ?? null;
        const timeoutSeconds = readOptionalInt(args, 'timeout_seconds');
        let snapshot = await readSnapshot(code, operatorId);
        const hasHistoryOrParticipantFilter = numbers !== null || participantId !== null;

        // Default: wait for the remaining time of the review window up to timeout_seconds.
        // If history or participant filter is provided, or timeout_seconds=0, return immediately.
        if (!hasHistoryOrParticipantFilter && timeoutSeconds !== 0) {
          const analyticsList = Array.isArray(snapshot.analytics) ? snapshot.analytics : [];
          const latest = analyticsList.at(-1) as { closes_at?: unknown } | undefined;
          if (latest && typeof latest.closes_at === 'string') {
            const leftMs = Math.max(0, new Date(latest.closes_at).getTime() - Date.now());
            const maxWaitMs = typeof timeoutSeconds === 'number' ? timeoutSeconds * 1000 : leftMs;
            const sleepMs = Math.min(leftMs, maxWaitMs);
            if (sleepMs > 0) {
              await sleep(sleepMs);
              snapshot = await readSnapshot(code, operatorId);
            }
          }
        }

        const analytics = Array.isArray(snapshot.analytics) ? snapshot.analytics : [];
        const filtered = analytics
          .filter((a) => (numbers && typeof a.question === 'number' ? numbers.includes(a.question) : true))
          .map((a) => {
            const summaries = Array.isArray(a.summaries) ? a.summaries : [];
            return {
              ...a,
              summaries: participantId ? summaries.filter((s) => (s as { guest_id?: unknown }).guest_id === participantId) : summaries,
            };
          });
        return JSON.stringify({ summaries: filtered, workflow: snapshot.workflow ?? null });
      },
    },
  ];
}
