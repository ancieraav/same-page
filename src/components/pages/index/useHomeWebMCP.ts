'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { cleanRoomCode } from '@/lib/clipboard';
import {
  assertExactMatch,
  createMultiCallTool,
  emptySchema,
  objectSchema,
  pollExactValue,
  readOptionalString,
  readRequiredString,
  registerWebMCPTools,
  type WebMCPTool,
} from '@/lib/webmcp';

interface HomeWebMCPBindings {
  getCodeString: () => string;
  applyCode: (raw: string) => string;
  clearCode: () => void;
  requestJoin: () => { ok: boolean; code: string; error?: string };
}

/** Ref sync that commits before paint, so back-to-back tool calls see fresh state. */
const useClientLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** Lets React flush state + ref effects before the agent's next call. */
function nextTick(): Promise<void> {
  return new Promise((resolve) => { window.setTimeout(resolve, 0); });
}

/** WebMCP tools for `/`: room code boxes + Join/Create buttons. */
export function useHomeWebMCP(bindings: HomeWebMCPBindings) {
  const router = useRouter();
  const bindingsRef = useRef(bindings);
  const routerRef = useRef(router);
  useClientLayoutEffect(() => {
    bindingsRef.current = bindings;
    routerRef.current = router;
  });

  useEffect(() => {
    const controller = new AbortController();
    const tools: WebMCPTool[] = [
      {
        name: 'modify_join_input',
        description:
          'Fill the 7 room code boxes. Only letters and numbers are kept (uppercased); spaces and symbols are dropped. Pass "before" to only apply when the shown code matches it exactly, and "after" to fail when the result differs.',
        inputSchema: objectSchema({
          value: { type: 'string', description: 'Room code text, e.g. "KQ7XD2P".', minLength: 1, maxLength: 24 },
          before: { type: 'string', description: 'Code currently shown; must match exactly.' },
          after: { type: 'string', description: 'Expected code after the change; must match exactly.' },
        }, ['value']),
        annotations: { readOnlyHint: false },
        execute: async (args: unknown) => {
          const value = readRequiredString(args, 'value', 'e.g. {"value": "KQ7XD2P"}');
          const before = readOptionalString(args, 'before');
          const after = readOptionalString(args, 'after');
          await nextTick();
          assertExactMatch(bindingsRef.current.getCodeString(), before, 'before', 'Join input');
          const applied = bindingsRef.current.applyCode(value);
          if (!applied) throw new Error('No valid characters. Provide letters or numbers.');
          const shown = await pollExactValue(() => bindingsRef.current.getCodeString(), applied, 'Join input');
          if (after !== undefined && shown !== after) {
            throw new Error(`Join input shows "${shown}", which does not exactly match after "${after}".`);
          }
          return `Join input now shows "${shown}" (${String(shown.length)}/7).`;
        },
      },
      {
        name: 'get_join_input',
        description: 'Read the room code boxes: joined code, length, and completeness.',
        inputSchema: emptySchema(),
        annotations: { readOnlyHint: true },
        execute: async () => {
          await nextTick();
          const code = bindingsRef.current.getCodeString();
          return JSON.stringify({ code, length: code.length, complete: code.length === 7 });
        },
      },
      {
        name: 'delete_join_input',
        description:
          'Clear the room code boxes. Pass "target" to only clear when the shown code matches it exactly.',
        inputSchema: objectSchema({
          target: { type: 'string', description: 'Code that must match exactly before clearing.' },
        }),
        annotations: { readOnlyHint: false },
        execute: async (args: unknown) => {
          const target = readOptionalString(args, 'target', 'e.g. {"target": "AB12"}');
          await nextTick();
          const current = bindingsRef.current.getCodeString();
          assertExactMatch(current, target, 'target', 'Join input');
          if (!current) return 'Join input was already empty.';
          bindingsRef.current.clearCode();
          await pollExactValue(() => bindingsRef.current.getCodeString(), '', 'Join input');
          return 'Join input cleared.';
        },
      },
      {
        name: 'press_join_button',
        description:
          'Press the Join Room button. Fails when the code is not 7 characters. Set the code first with modify_join_input.',
        inputSchema: emptySchema(),
        annotations: { readOnlyHint: false },
        execute: async () => {
          await nextTick();
          const pending = cleanRoomCode(bindingsRef.current.getCodeString());
          if (pending.length !== 7) {
            throw new Error(`Room code "${pending}" is incomplete (${String(pending.length)}/7).`);
          }
          const result = bindingsRef.current.requestJoin();
          if (!result.ok) throw new Error(result.error ?? 'Could not join.');
          return `Joining room ${result.code}. Navigating to /join?code=${result.code}.`;
        },
      },
      {
        name: 'press_create_button',
        description: 'Press the Create button. Navigates to the create-room form (/create).',
        inputSchema: emptySchema(),
        annotations: { readOnlyHint: false },
        execute: () => {
          routerRef.current.push('/create');
          return 'Navigating to /create.';
        },
      },
    ];
    const executors = new Map(tools.map((tool) => [tool.name, tool.execute]));
    tools.push(createMultiCallTool(() => executors));
    void registerWebMCPTools(tools, controller.signal);
    return () => { controller.abort(); };
  }, []);
}
