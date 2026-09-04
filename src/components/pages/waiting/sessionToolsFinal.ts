'use client';

import {
  emptySchema,
  objectSchema,
  readRequiredString,
  type WebMCPTool,
} from '@/lib/webmcp';
import {
  guard,
  readIntList,
  readOptionalBool,
  readSnapshot,
  readStringListFilter,
  postSession,
  type SessionToolsBindings,
} from './sessionToolsShared';

/** Tools 14-19: suggest send/view/responses, stop, room summary send/view. */
export function sessionToolsFinal(bindings: () => SessionToolsBindings): WebMCPTool[] {
  async function act(path: string, body: Record<string, unknown>): Promise<string> {
    const { code, guestId } = guard(bindings());
    return postSession(code, path, { ...body, guest_id: guestId });
  }

  return [
    {
      name: 'send_suggest_question',
      description: 'Ask participants whether they have a suggested question. Only on multiples of 5 completed questions; a rejection returns the workflow.',
      inputSchema: objectSchema({
        text: { type: 'string', description: 'Suggest question text.', minLength: 1, maxLength: 2000 },
      }, ['text']),
      annotations: { readOnlyHint: false },
      execute: async (args: unknown) => act('suggest', {
        text: readRequiredString(args, 'text', 'e.g. {"text": "Any suggested follow-up?"}'),
      }),
    },
    {
      name: 'view_question_suggest',
      description: 'Read suggest questions (latest, one, several, or all). Questions only, no responses.',
      inputSchema: objectSchema({
        numbers: { type: 'array', description: 'Suggest numbers. Omit for all.', items: { type: 'integer', minimum: 1 } },
        latest: { type: 'boolean', description: 'Only the latest suggest.' },
      }),
      annotations: { readOnlyHint: true },
      execute: async (args: unknown) => {
        const { code, guestId } = guard(bindings());
        const numbers = readIntList(args, 'numbers');
        const latest = readOptionalBool(args, 'latest');
        const snapshot = await readSnapshot(code, guestId);
        let suggests = Array.isArray(snapshot.suggests) ? snapshot.suggests : [];
        if (numbers) suggests = suggests.filter((s) => typeof s.number === 'number' && numbers.includes(s.number));
        if (latest && suggests.length > 0) {
          const last = suggests[suggests.length - 1];
          suggests = last ? [last] : [];
        }
        return JSON.stringify({ suggests });
      },
    },
    {
      name: 'view_question_suggest_responses',
      description: 'Read participant responses to suggest questions (latest, one, several, or all).',
      inputSchema: objectSchema({
        numbers: { type: 'array', description: 'Suggest numbers. Omit for all.', items: { type: 'integer', minimum: 1 } },
        guest_ids: { type: 'array', description: 'Participant ids. Omit for all.', items: { type: 'string' } },
        latest: { type: 'boolean', description: 'Only the latest suggest.' },
      }),
      annotations: { readOnlyHint: true },
      execute: async (args: unknown) => {
        const { code, guestId } = guard(bindings());
        const numbers = readIntList(args, 'numbers');
        const guestIds = readStringListFilter(args, 'guest_ids');
        const latest = readOptionalBool(args, 'latest');
        const snapshot = await readSnapshot(code, guestId);
        let suggests = Array.isArray(snapshot.suggests) ? snapshot.suggests : [];
        if (numbers) suggests = suggests.filter((s) => typeof s.number === 'number' && numbers.includes(s.number));
        if (latest && suggests.length > 0) {
          const last = suggests[suggests.length - 1];
          suggests = last ? [last] : [];
        }
        const wanted = new Set(suggests.map((s) => s.number));
        const responses = (Array.isArray(snapshot.suggest_responses) ? snapshot.suggest_responses : []).filter((r) => {
          if (typeof r.suggest_number !== 'number' || !wanted.has(r.suggest_number)) return false;
          if (guestIds && (typeof r.guest_id !== 'string' || !guestIds.includes(r.guest_id))) return false;
          return true;
        });
        return JSON.stringify({ suggests, responses });
      },
    },
    {
      name: 'stop_session',
      description: 'Stop the session at any question and move it to finalization.',
      inputSchema: emptySchema(),
      annotations: { readOnlyHint: false },
      execute: async () => act('stop', {}),
    },
    {
      name: 'send_room_summary',
      description: 'Send the final room summary following the required template. A wrong format is rejected with the correct template; a valid one completes the session.',
      inputSchema: objectSchema({
        summary: { type: 'object', description: 'Final summary following the template.' },
      }, ['summary']),
      annotations: { readOnlyHint: false },
      execute: async (args: unknown) => {
        if (typeof args !== 'object' || args === null || !('summary' in args)) {
          throw new Error('Provide "summary" as an object. Ask view_current_workflow in finalization for the goal.');
        }
        const summary = (args as Record<string, unknown>)['summary'];
        return act('room-summary', { summary: summary ?? {} });
      },
    },
    {
      name: 'view_room_summary',
      description: 'Read the final room summary. Reports when it is not created yet.',
      inputSchema: emptySchema(),
      annotations: { readOnlyHint: true },
      execute: async () => {
        const { code, guestId } = guard(bindings());
        const snapshot = await readSnapshot(code, guestId);
        const summary = snapshot.room_summary ?? { available: false };
        return JSON.stringify({ room_summary: summary });
      },
    },
  ];
}
