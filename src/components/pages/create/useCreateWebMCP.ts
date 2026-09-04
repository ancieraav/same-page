'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import {
  assertExactMatch,
  createMultiCallTool,
  emptySchema,
  objectSchema,
  pollExactValue,
  readOptionalString,
  readRequiredString,
  readTargetList,
  registerWebMCPTools,
  summarizeArgs,
  type WebMCPTool,
} from '@/lib/webmcp';

export interface CreateAttachmentSummary {
  id: string;
  name: string;
  size: string;
  ext: string;
}

interface CreateWebMCPBindings {
  getRoomName: () => string;
  setRoomName: (value: string) => void;
  clearRoomName: () => boolean;
  getTopic: () => string;
  setTopic: (value: string) => void;
  clearTopic: () => boolean;
  getNotes: () => string;
  setNotes: (value: string) => void;
  clearNotes: () => boolean;
  getMaxParticipants: () => { value: number; fixed: boolean };
  getAttachments: () => CreateAttachmentSummary[];
  addAttachmentFromUrl: (url: string, filename?: string) => Promise<{ ok: boolean; name?: string; error?: string }>;
  removeAttachments: (targets: string[]) => { removed: string[]; notFound: string[] };
  openAttachmentPicker: () => boolean;
  submitCreateForm: () => { ok: boolean; error?: string };
  cancelCreateForm: () => void;
}

/** Ref sync that commits before paint, so back-to-back tool calls see fresh state. */
const useClientLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** Lets React flush state + ref effects before the agent's next call. */
function nextTick(): Promise<void> {
  return new Promise((resolve) => { window.setTimeout(resolve, 0); });
}

function textTools(
  bindingsRef: React.RefObject<CreateWebMCPBindings>,
  base: string,
  label: string,
  sentence: string,
  example: string,
  get: (b: CreateWebMCPBindings) => string,
  set: (b: CreateWebMCPBindings) => (value: string) => void,
  clear: (b: CreateWebMCPBindings) => () => boolean,
  maxLength: number,
): WebMCPTool[] {
  return [
    {
      name: `modify_${base}_input`,
      description:
        `Fill the ${sentence} field. Spaces are kept exactly as given. Pass "before" to only apply when the current text matches it exactly, and "after" to fail when the result differs.`,
      inputSchema: objectSchema({
        value: { type: 'string', description: `${label} text.`, maxLength },
        before: { type: 'string', description: 'Text currently shown; must match exactly.' },
        after: { type: 'string', description: 'Expected text after the change; must match exactly.' },
      }, ['value']),
      annotations: { readOnlyHint: false },
      execute: async (args: unknown) => {
        const value = readRequiredString(args, 'value', `e.g. {"value": ${example}}`);
        const before = readOptionalString(args, 'before');
        const after = readOptionalString(args, 'after');
        await nextTick();
        assertExactMatch(get(bindingsRef.current), before, 'before', label);
        set(bindingsRef.current)(value);
        const updated = await pollExactValue(() => get(bindingsRef.current), value, label);
        if (after !== undefined && updated !== after) {
          throw new Error(`${label} is "${updated}", which does not exactly match after "${after}".`);
        }
        return value ? `${label} set.` : `${label} cleared.`;
      },
    },
    {
      name: `get_${base}_input`,
      description: `Read the ${sentence} field.`,
      inputSchema: emptySchema(),
      annotations: { readOnlyHint: true },
      execute: async () => {
        await nextTick();
        return JSON.stringify({ value: get(bindingsRef.current) });
      },
    },
    {
      name: `delete_${base}_input`,
      description:
        `Clear the ${sentence} field. Pass "target" to only clear when the current text matches it exactly.`,
      inputSchema: objectSchema({
        target: { type: 'string', description: 'Text that must match exactly before clearing.' },
      }),
      annotations: { readOnlyHint: false },
      execute: async (args: unknown) => {
        const target = readOptionalString(args, 'target', `e.g. {"target": ${example}}`);
        await nextTick();
        assertExactMatch(get(bindingsRef.current), target, 'target', label);
        const had = clear(bindingsRef.current)();
        await pollExactValue(() => get(bindingsRef.current), '', label);
        return had ? `${label} cleared.` : `${label} was already empty.`;
      },
    },
  ];
}

/** WebMCP tools for `/create`: every form field + button. */
export function useCreateWebMCP(bindings: CreateWebMCPBindings) {
  const bindingsRef = useRef(bindings);
  useClientLayoutEffect(() => {
    bindingsRef.current = bindings;
  });

  useEffect(() => {
    const controller = new AbortController();
    const tools: WebMCPTool[] = [
      ...textTools(bindingsRef, 'room-name', 'Room name', 'room name', '"Design Sync"',
        (b) => b.getRoomName(), (b) => b.setRoomName, (b) => b.clearRoomName, 120),
      ...textTools(bindingsRef, 'topic', 'Topic', 'topic', '"Sprint Retro"',
        (b) => b.getTopic(), (b) => b.setTopic, (b) => b.clearTopic, 200),
      ...textTools(bindingsRef, 'information', 'Additional information', 'additional information', '"Bring mockups"',
        (b) => b.getNotes(), (b) => b.setNotes, (b) => b.clearNotes, 2000),
      {
        name: 'modify_attachment_input',
        description:
          'Download one supported file from an http(s) URL and attach it for the agent context (PDF, DOCX, PNG, SVG, or JPG; max 25 MB, max 20 files).',
        inputSchema: objectSchema({
          url: { type: 'string', description: 'Direct http(s) link to the file.', minLength: 8, maxLength: 2000 },
          filename: { type: 'string', description: 'Optional file name override, e.g. "brief.pdf".', maxLength: 120 },
        }, ['url']),
        annotations: { readOnlyHint: false },
        execute: async (args: unknown) => {
          const url = readRequiredString(args, 'url', 'e.g. {"url": "https://example.com/brief.pdf"}').trim();
          const filename = readOptionalString(args, 'filename', 'e.g. {"filename": "brief.pdf"}')?.trim();
          if (!url) throw new Error('Provide a file URL.');
          const result = await bindingsRef.current.addAttachmentFromUrl(url, filename ?? undefined);
          if (!result.ok) throw new Error(result.error ?? 'Could not attach the file.');
          await nextTick();
          return `Attached "${result.name ?? 'file'}" from URL.`;
        },
      },
      {
        name: 'get_attachment_input',
        description: 'List the current attachments: ID, file name, format, and size. Only PDF, DOCX, PNG, SVG, and JPG are accepted.',
        inputSchema: emptySchema(),
        annotations: { readOnlyHint: true },
        execute: async () => {
          await nextTick();
          const attachments = bindingsRef.current.getAttachments();
          return JSON.stringify({ count: attachments.length, attachments });
        },
      },
      {
        name: 'delete_attachment_input',
        description:
          'Remove attachments by ID or file name (exact match, case-sensitive). Pass one value or an array of values.',
        inputSchema: objectSchema({
          target: {
            description: 'Attachment ID or file name, or an array of them.',
            oneOf: [
              { type: 'string', minLength: 1 },
              { type: 'array', items: { type: 'string', minLength: 1 }, minItems: 1, maxItems: 20 },
            ],
          },
        }, ['target']),
        annotations: { readOnlyHint: false },
        execute: async (args: unknown) => {
          const targets = readTargetList(args, 'target');
          if (!targets) {
            throw new Error(`Provide "target" as an attachment ID or file name, or an array of them, e.g. {"target": "brief.pdf"}. Received: ${summarizeArgs(args)}.`);
          }
          const { removed, notFound } = bindingsRef.current.removeAttachments(targets);
          if (removed.length === 0) throw new Error(`Nothing matched: ${notFound.join(', ')}.`);
          await nextTick();
          const suffix = notFound.length > 0 ? ` Not found: ${notFound.join(', ')}.` : '';
          const noun = removed.length === 1 ? 'attachment' : 'attachments';
          return `Removed ${String(removed.length)} ${noun}: ${removed.join(', ')}.${suffix}`;
        },
      },
      {
        name: 'open_attachment_input',
        description: 'Open the file picker so the user can choose attachment files from this computer.',
        inputSchema: emptySchema(),
        annotations: { readOnlyHint: false },
        execute: () => {
          const opened = bindingsRef.current.openAttachmentPicker();
          if (!opened) throw new Error('File picker is not available right now.');
          return 'File picker opened. Ask the user to choose files.';
        },
      },
      {
        name: 'get_max-participant_input',
        description: 'Read the fixed participant capacity (1-on-1 session).',
        inputSchema: emptySchema(),
        annotations: { readOnlyHint: true },
        execute: async () => {
          await nextTick();
          return JSON.stringify(bindingsRef.current.getMaxParticipants());
        },
      },
      {
        name: 'press_cancel-room_button',
        description: 'Press Cancel and go back to the home page (/).',
        inputSchema: emptySchema(),
        annotations: { readOnlyHint: false },
        execute: () => {
          bindingsRef.current.cancelCreateForm();
          return 'Cancelled. Navigating to the home page (/).';
        },
      },
      {
        name: 'press_create-room_button',
        description: 'Press Create & Launch Room. Requires a room name. On success the host continues to /join?code=...&as=host.',
        inputSchema: emptySchema(),
        annotations: { readOnlyHint: false },
        execute: async () => {
          await nextTick();
          const result = bindingsRef.current.submitCreateForm();
          if (!result.ok) throw new Error(result.error ?? 'Could not create the room. Check the room name.');
          return 'Creating room. Continuing to host profile (/join?code=...&as=host).';
        },
      },
    ];
    const executors = new Map(tools.map((tool) => [tool.name, tool.execute]));
    tools.push(createMultiCallTool(() => executors));
    void registerWebMCPTools(tools, controller.signal);
    return () => { controller.abort(); };
  }, []);
}
