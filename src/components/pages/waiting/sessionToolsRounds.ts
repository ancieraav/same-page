'use client';

import {
  emptySchema,
  objectSchema,
  readOptionalString,
  readRequiredInt,
  type WebMCPTool,
} from '@/lib/webmcp';
import {
  guard,
  readIntList,
  readOptionalBool,
  readSnapshot,
  readStringListFilter,
  postSession,
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
      description: 'Read context questions (active, one, several, or all). Questions only, no responses.',
      inputSchema: objectSchema({
        numbers: { type: 'array', description: 'Question numbers. Omit for all.', items: { type: 'integer', minimum: 1 } },
        active_only: { type: 'boolean', description: 'Only the active question.' },
      }),
      annotations: { readOnlyHint: true },
      execute: async (args: unknown) => {
        const { code, guestId } = guard(bindings());
        const numbers = readIntList(args, 'numbers');
        const activeOnly = readOptionalBool(args, 'active_only');
        const snapshot = await readSnapshot(code, guestId);
        const questions = Array.isArray(snapshot.questions) ? snapshot.questions : [];
        const filtered = questions.filter((q) => {
          if (typeof q.number !== 'number') return false;
          if (activeOnly && q.status !== 'active') return false;
          if (numbers && !numbers.includes(q.number)) return false;
          return true;
        });
        return JSON.stringify({
          questions: filtered.map((q) => ({ number: q.number, text: q.text ?? null, status: q.status ?? null })),
        });
      },
    },
    {
      name: 'list_question_context_responses',
      description: 'List who submitted per question (guest, submitted, missing) without opening answer bodies.',
      inputSchema: objectSchema({
        number: { type: 'integer', description: 'Question number. Omit to list all questions.', minimum: 1 },
      }),
      annotations: { readOnlyHint: true },
      execute: async (args: unknown) => {
        const { code, guestId } = guard(bindings());
        const raw = typeof args === 'object' && args !== null && 'number' in args
          ? (args as Record<string, unknown>)['number']
          : undefined;
        const number = raw === undefined ? null : readRequiredInt(args, 'number', 'e.g. {"number": 1}');
        const snapshot = await readSnapshot(code, guestId);
        const answers = Array.isArray(snapshot.answers) ? snapshot.answers : [];
        const scoped = number === null ? answers : answers.filter((a) => a.question === number);
        const byQuestion = new Map<number, { submitted: string[]; missing: string[] }>();
        for (const a of scoped) {
          if (typeof a.question !== 'number') continue;
          const entry = byQuestion.get(a.question) ?? { submitted: [], missing: [] };
          if (typeof a.guest_id === 'string') (a.missing === true ? entry.missing : entry.submitted).push(a.guest_id);
          byQuestion.set(a.question, entry);
        }
        return JSON.stringify({
          responses: [...byQuestion.entries()].map(([question, entry]) => ({ question, ...entry })),
        });
      },
    },
    {
      name: 'view_question_context_responses',
      description: 'Read participant responses (active, one, several, or all questions; one, several, or all participants). Resumes waiting for the active question when it is still open.',
      inputSchema: objectSchema({
        numbers: { type: 'array', description: 'Question numbers. Omit for all.', items: { type: 'integer', minimum: 1 } },
        guest_ids: { type: 'array', description: 'Participant ids. Omit for all.', items: { type: 'string' } },
        active_only: { type: 'boolean', description: 'Only the active question.' },
      }),
      annotations: { readOnlyHint: true },
      execute: async (args: unknown, options) => {
        const { code, guestId } = guard(bindings());
        const numbers = readIntList(args, 'numbers');
        const guestIds = readStringListFilter(args, 'guest_ids');
        const activeOnly = readOptionalBool(args, 'active_only');
        let snapshot = await readSnapshot(code, guestId);
        const questions = Array.isArray(snapshot.questions) ? snapshot.questions : [];
        const active = questions.find((q) => q.status === 'active' && typeof q.number === 'number') as { number: number } | undefined;
        let waited = false;
        const wantsActive = active && (!numbers || numbers.includes(active.number)) && (activeOnly || true);
        if (wantsActive) {
          const wait = await waitForQuestionClose(code, guestId, active.number, options);
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
      description: 'Send the summary and analysis for one completed question.',
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
      }, ['number', 'summaries']),
      annotations: { readOnlyHint: false },
      execute: async (args: unknown) => {
        const record = (typeof args === 'object' && args !== null ? args : {}) as Record<string, unknown>;
        return act('analytics', {
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
      description: 'Read summaries (one, several, or all; overall or for one participant).',
      inputSchema: objectSchema({
        numbers: { type: 'array', description: 'Question numbers. Omit for all.', items: { type: 'integer', minimum: 1 } },
        guest_id: { type: 'string', description: 'One participant id. Omit for overall.' },
      }),
      annotations: { readOnlyHint: true },
      execute: async (args: unknown) => {
        const { code, guestId: operatorId } = guard(bindings());
        const numbers = readIntList(args, 'numbers');
        const guestFilter = readStringListFilter(args, 'guest_id');
        const participantId = guestFilter?.[0] ?? null;
        const snapshot = await readSnapshot(code, operatorId);
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
