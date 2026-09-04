'use client';

import {
  emptySchema,
  objectSchema,
  readRequiredString,
  type WebMCPTool,
} from '@/lib/webmcp';
import { goalsWorkflow } from '@/lib/session';
import {
  guard,
  readRoomContext,
  readSnapshot,
  readStringListFilter,
  postSession,
  waitForQuestionClose,
  type SessionToolsBindings,
} from './sessionToolsShared';

/** Core tools: start, initial questions, goals, workflow, context, and question publishing. */
export function sessionToolsCore(bindings: () => SessionToolsBindings): WebMCPTool[] {
  async function act(path: string, body: Record<string, unknown>): Promise<string> {
    const { code, guestId } = guard(bindings());
    return postSession(code, path, { ...body, guest_id: guestId });
  }

  return [
    {
      name: 'start_session',
      description: 'Start the session (waiting to answering). Requires exactly 2 ready players. Afterwards send Q1 with send_question_context.',
      inputSchema: emptySchema(),
      annotations: { readOnlyHint: false },
      execute: async () => act('start', {}),
    },
    {
      name: 'view_goals_workflow',
      description: 'Read the Same Page goals, how the session works, and the AI agent role.',
      inputSchema: emptySchema(),
      annotations: { readOnlyHint: true },
      execute: async () => {
        guard(bindings());
        await Promise.resolve();
        return JSON.stringify(goalsWorkflow());
      },
    },
    {
      name: 'view_current_workflow',
      description: 'Read the current session state, the present goal, and which function to call.',
      inputSchema: emptySchema(),
      annotations: { readOnlyHint: true },
      execute: async () => {
        const { code, guestId } = guard(bindings());
        const snapshot = await readSnapshot(code, guestId);
        return JSON.stringify({ workflow: snapshot.workflow ?? null, completed_count: snapshot.completed_count ?? 0 });
      },
    },
    {
      name: 'list_context',
      description: 'List available contexts (id, name, kind) without opening contents.',
      inputSchema: emptySchema(),
      annotations: { readOnlyHint: true },
      execute: async () => {
        const { code, guestId } = guard(bindings());
        const context = await readRoomContext(code, guestId);
        return JSON.stringify({ contexts: Array.isArray(context.contexts) ? context.contexts : [] });
      },
    },
    {
      name: 'view_context',
      description: 'Read context contents. Omit filters to read everything. PDF/DOCX/SVG include extracted text; PNG/JPG include signed content_url for visual reading.',
      inputSchema: objectSchema({
        ids: { type: 'array', description: 'Context ids from list_context.', items: { type: 'string' } },
        kinds: { type: 'array', description: 'topic, information, attachment.', items: { type: 'string' } },
      }),
      annotations: { readOnlyHint: true },
      execute: async (args: unknown) => {
        const { code, guestId } = guard(bindings());
        const ids = readStringListFilter(args, 'ids');
        const kinds = readStringListFilter(args, 'kinds');
        const context = await readRoomContext(code, guestId);
        const keep = (id: string, kind: string) =>
          (!ids || ids.includes(id)) && (!kinds || kinds.includes(kind));
        const attachments = Array.isArray(context.attachments) ? context.attachments : [];
        return JSON.stringify({
          room: context.room ?? null,
          topic: keep('topic', 'topic') ? context.room?.topic ?? null : undefined,
          information: keep('information', 'information') ? context.room?.information ?? null : undefined,
          attachments: attachments.filter((a) => keep(typeof a.id === 'string' ? a.id : '', 'attachment')),
        });
      },
    },
    {
      name: 'send_question_context',
      description: 'Send exactly one context question, then wait until every required participant answers or the deadline passes.',
      inputSchema: objectSchema({
        text: { type: 'string', description: 'Question text.', minLength: 1, maxLength: 2000 },
      }, ['text']),
      annotations: { readOnlyHint: false },
      execute: async (args: unknown, options) => {
        const { code, guestId } = guard(bindings());
        const text = readRequiredString(args, 'text', 'e.g. {"text": "What matters most?"}');
        const sent = JSON.parse(await postSession(code, 'questions/context', { guest_id: guestId, text })) as { number?: unknown };
        const number = typeof sent.number === 'number' ? sent.number : 0;
        const wait = await waitForQuestionClose(code, guestId, number, options);
        const snapshot = await readSnapshot(code, guestId);
        return JSON.stringify({ number, timed_out: wait.timedOut, workflow: snapshot.workflow ?? null });
      },
    },
    {
      name: 'list_question_context',
      description: 'List context questions (number, status) without opening their text.',
      inputSchema: emptySchema(),
      annotations: { readOnlyHint: true },
      execute: async () => {
        const { code, guestId } = guard(bindings());
        const snapshot = await readSnapshot(code, guestId);
        const questions = Array.isArray(snapshot.questions) ? snapshot.questions : [];
        return JSON.stringify({
          questions: questions.map((q) => ({ number: q.number ?? null, status: q.status ?? null, has_summary: q.has_analytics === true })),
        });
      },
    },
  ];
}
