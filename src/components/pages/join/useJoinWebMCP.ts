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
  registerWebMCPTools,
  type WebMCPTool,
} from '@/lib/webmcp';

interface JoinWebMCPBindings {
  getDisplayName: () => string;
  setDisplayName: (value: string) => void;
  clearDisplayName: () => boolean;
  hasPhoto: () => boolean;
  setPhotoFromUrl: (url: string) => Promise<{ ok: boolean; name?: string; error?: string }>;
  clearPhoto: () => boolean;
  openPhotoPicker: () => boolean;
  requestEnter: () => Promise<{ ok: boolean; error?: string; code?: string }>;
  cancelJoin: () => void;
}

/** Ref sync that commits before paint, so back-to-back tool calls see fresh state. */
const useClientLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** Lets React flush state + ref effects before the agent's next call. */
function nextTick(): Promise<void> {
  return new Promise((resolve) => { window.setTimeout(resolve, 0); });
}

/** WebMCP tools for `/join`: person photo + name + waiting-room buttons. */
export function useJoinWebMCP(bindings: JoinWebMCPBindings) {
  const bindingsRef = useRef(bindings);
  useClientLayoutEffect(() => {
    bindingsRef.current = bindings;
  });

  useEffect(() => {
    const controller = new AbortController();
    const tools: WebMCPTool[] = [
      {
        name: 'modify_person-photo_input',
        description:
          'Set the profile photo by downloading an image from an http(s) URL. Fails on bad links, CORS blocks, non-images, or files over 25 MB.',
        inputSchema: objectSchema({
          url: { type: 'string', description: 'Direct http(s) link to an image.', minLength: 8, maxLength: 2000 },
        }, ['url']),
        annotations: { readOnlyHint: false },
        execute: async (args: unknown) => {
          const url = readRequiredString(args, 'url', 'e.g. {"url": "https://example.com/photo.jpg"}').trim();
          if (!url) throw new Error('Provide an image URL.');
          const result = await bindingsRef.current.setPhotoFromUrl(url);
          if (!result.ok) throw new Error(result.error ?? 'Could not set the photo.');
          await pollExactValue(() => bindingsRef.current.hasPhoto() ? 'set' : 'empty', 'set', 'Profile photo');
          return `Photo set from URL ("${result.name ?? 'image'}").`;
        },
      },
      {
        name: 'get_person-photo_input',
        description: 'Check whether a profile photo is currently set.',
        inputSchema: emptySchema(),
        annotations: { readOnlyHint: true },
        execute: async () => {
          await nextTick();
          return JSON.stringify({ hasPhoto: bindingsRef.current.hasPhoto() });
        },
      },
      {
        name: 'delete_person-photo_input',
        description: 'Remove the currently set profile photo, if any.',
        inputSchema: emptySchema(),
        annotations: { readOnlyHint: false },
        execute: async () => {
          const had = bindingsRef.current.clearPhoto();
          await pollExactValue(() => bindingsRef.current.hasPhoto() ? 'set' : 'empty', 'empty', 'Profile photo');
          return had ? 'Photo removed.' : 'No photo was set.';
        },
      },
      {
        name: 'open_person-photo_input',
        description: 'Open the file picker so the user can choose a profile photo from this computer.',
        inputSchema: emptySchema(),
        annotations: { readOnlyHint: false },
        execute: () => {
          const opened = bindingsRef.current.openPhotoPicker();
          if (!opened) throw new Error('File picker is not available right now.');
          return 'File picker opened. Ask the user to choose a photo.';
        },
      },
      {
        name: 'modify_person-name_input',
        description:
          'Change the display name. Spaces are kept exactly as given. Pass "before" to only apply when the current name matches it exactly, and "after" to fail when the result differs.',
        inputSchema: objectSchema({
          value: { type: 'string', description: 'Display name, e.g. "Alex Morgan".', maxLength: 60 },
          before: { type: 'string', description: 'Name currently shown; must match exactly.' },
          after: { type: 'string', description: 'Expected name after the change; must match exactly.' },
        }, ['value']),
        annotations: { readOnlyHint: false },
        execute: async (args: unknown) => {
          const value = readRequiredString(args, 'value', 'e.g. {"value": "Alex Morgan"}');
          const before = readOptionalString(args, 'before');
          const after = readOptionalString(args, 'after');
          await nextTick();
          assertExactMatch(bindingsRef.current.getDisplayName(), before, 'before', 'Display name');
          bindingsRef.current.setDisplayName(value);
          const updated = await pollExactValue(() => bindingsRef.current.getDisplayName(), value, 'Display name');
          if (after !== undefined && updated !== after) {
            throw new Error(`Display name is "${updated}", which does not exactly match after "${after}".`);
          }
          return value ? `Display name set to "${value}".` : 'Display name cleared.';
        },
      },
      {
        name: 'get_person-name_input',
        description: 'Read the current display name.',
        inputSchema: emptySchema(),
        annotations: { readOnlyHint: true },
        execute: async () => {
          await nextTick();
          return JSON.stringify({ displayName: bindingsRef.current.getDisplayName() });
        },
      },
      {
        name: 'delete_person-name_input',
        description:
          'Clear the display name field. Pass "target" to only clear when the current name matches it exactly.',
        inputSchema: objectSchema({
          target: { type: 'string', description: 'Name that must match exactly before clearing.' },
        }),
        annotations: { readOnlyHint: false },
        execute: async (args: unknown) => {
          const target = readOptionalString(args, 'target', 'e.g. {"target": "Alex Morgan"}');
          await nextTick();
          const current = bindingsRef.current.getDisplayName();
          assertExactMatch(current, target, 'target', 'Display name');
          const had = bindingsRef.current.clearDisplayName();
          await pollExactValue(() => bindingsRef.current.getDisplayName(), '', 'Display name');
          return had ? 'Display name cleared.' : 'Display name was already empty.';
        },
      },
      {
        name: 'press_join-waiting_button',
        description:
          'Press the Enter Waiting Room button. Fails when the display name or room code is missing. Set the name first with modify_person-name_input.',
        inputSchema: emptySchema(),
        annotations: { readOnlyHint: false },
        execute: async () => {
          await nextTick();
          const result = await bindingsRef.current.requestEnter();
          if (!result.ok) throw new Error(result.error ?? 'Could not enter. Set a display name first.');
          return `Entering waiting room for code ${result.code ?? ''}. Navigating to /waiting.`;
        },
      },
      {
        name: 'press_cancel-waiting_button',
        description: 'Cancel joining and go back to the home page (/) to enter a different code.',
        inputSchema: emptySchema(),
        annotations: { readOnlyHint: false },
        execute: () => {
          bindingsRef.current.cancelJoin();
          return 'Cancelled. Navigating to the home page (/).';
        },
      },
    ];
    const executors = new Map(tools.map((tool) => [tool.name, tool.execute]));
    tools.push(createMultiCallTool(() => executors));
    void registerWebMCPTools(tools, controller.signal);
    return () => { controller.abort(); };
  }, []);
}
