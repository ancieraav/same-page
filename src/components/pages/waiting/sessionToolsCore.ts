'use client';

import {
  emptySchema,
  objectSchema,
  readOptionalInt,
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
      execute: async () => act('status', { status: 'answering' }),
    },
    {
      name: 'view_goals_workflow',
      description: 'Read the fixed goal milestones (target questions, suggested questions on multiples of 5, wrap-up criteria).',
      inputSchema: emptySchema(),
      annotations: { readOnlyHint: true },
      execute: async () => {
        await Promise.resolve();
        return JSON.stringify(goalsWorkflow());
      },
    },
    {
      name: 'view_current_workflow',
      description: 'Read the single next recommended action based on current state (start, publish Q, wait, summarize, suggest, stop).',
      inputSchema: emptySchema(),
      annotations: { readOnlyHint: true },
      execute: async () => {
        const { code, guestId } = guard(bindings());
        const snapshot = await readSnapshot(code, guestId);
        return JSON.stringify({ workflow: snapshot.workflow ?? null });
      },
    },
    {
      name: 'list_context',
      description: 'List context ids and kinds (topic, information, attachment with file type/pages) without heavy payloads.',
      inputSchema: emptySchema(),
      annotations: { readOnlyHint: true },
      execute: async () => {
        const { code, guestId } = guard(bindings());
        const context = await readRoomContext(code, guestId);
        const attachments = Array.isArray(context.attachments) ? context.attachments : [];
        return JSON.stringify({
          room: context.room ? { name: context.room.name, topic: context.room.topic } : null,
          items: [
            { id: 'topic', kind: 'topic', title: 'Room Topic' },
            { id: 'information', kind: 'information', title: 'Room Information' },
            ...attachments.map((a) => ({
              id: typeof a.id === 'string' ? a.id : '',
              kind: 'attachment',
              title: typeof a.name === 'string' ? a.name : 'attachment',
              file_type: typeof a.file_type === 'string' ? a.file_type : '',
              page_count: typeof a.page_count === 'number' ? a.page_count : null,
            })),
          ],
        });
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
      description: 'Send exactly one context question, then wait until every required participant answers or timeout_seconds passes (default 60s, max 180s). Set timeout_seconds=0 to return immediately after publishing.',
      inputSchema: objectSchema({
        text: { type: 'string', description: 'Question text.', minLength: 1, maxLength: 2000 },
        timeout_seconds: {
          type: 'integer',
          description: 'Maximum seconds to wait for answers (default 60, max 180). Set 0 to return immediately after publishing.',
          minimum: 0,
          maximum: 180,
        },
      }, ['text']),
      annotations: { readOnlyHint: false },
      execute: async (args: unknown, options) => {
        const { code, guestId } = guard(bindings());
        const text = readRequiredString(args, 'text', 'e.g. {"text": "What matters most?"}');
        const timeoutSeconds = readOptionalInt(args, 'timeout_seconds');
        const sent = JSON.parse(await postSession(code, 'questions/context', { guest_id: guestId, text })) as { number?: unknown };
        const number = typeof sent.number === 'number' ? sent.number : 0;
        const wait = await waitForQuestionClose(code, guestId, number, {
          ...(options.signal ? { signal: options.signal } : {}),
          ...(timeoutSeconds !== undefined ? { timeoutSeconds } : {}),
        });
        const snapshot = await readSnapshot(code, guestId);
        return JSON.stringify({
          number,
          timed_out: wait.timedOut,
          status: wait.closed ? 'closed' : 'active',
          ...(wait.timedOut ? { message: 'Question is active. Waiting for participant responses. Check with view_question_context_responses.' } : {}),
          workflow: snapshot.workflow ?? null,
        });
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
