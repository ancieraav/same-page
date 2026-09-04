'use client';

import {
  emptySchema,
  objectSchema,
  readRequiredString,
  type WebMCPTool,
} from '@/lib/webmcp';
import { WAITING_CHAT_MAX, WAITING_EMOJIS } from '@/lib/waiting';
import {
  guard,
  readCaller,
  type SessionToolsBindings,
} from './sessionToolsShared';

interface StateMember {
  guest_id?: unknown;
  name?: unknown;
  is_operator?: unknown;
  ready?: unknown;
  online?: unknown;
}

/** Waiting-room tools shared by every room member. */
export function sessionToolsWaiting(bindings: () => SessionToolsBindings): WebMCPTool[] {
  const call = (): { code: string; guestId: string } => readCaller(bindings());

  async function postEvent(type: 'chat' | 'emoji', value: string): Promise<unknown> {
    const { code, guestId } = call();
    const response = await fetch(`/api/rooms/${encodeURIComponent(code)}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(type === 'chat'
        ? { guest_id: guestId, type, body: value }
        : { guest_id: guestId, type, emoji: value }),
    });
    const payload = (await response.json().catch(() => null)) as { event?: unknown; error?: unknown } | null;
    if (!response.ok) {
      throw new Error(typeof payload?.error === 'string' ? payload.error : `Could not send ${type === 'chat' ? 'the message' : 'the emoji'}.`);
    }
    return payload?.event ?? null;
  }

  return [
    {
      name: 'leave_room',
      description: 'Leave the waiting room and go back to the home page. If the operator leaves, the room is dissolved for everyone.',
      inputSchema: emptySchema(),
      annotations: { readOnlyHint: false },
      execute: async () => {
        const { code, guestId } = call();
        const response = await fetch(`/api/rooms/${encodeURIComponent(code)}/leave`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guest_id: guestId }),
        });
        const payload = (await response.json().catch(() => null)) as { dissolved?: unknown; error?: unknown } | null;
        if (!response.ok) {
          throw new Error(typeof payload?.error === 'string' ? payload.error : 'Could not leave the room.');
        }
        const goHome = bindings().goHome;
        if (!goHome) throw new Error('Could not navigate back to the home page.');
        goHome();
        return JSON.stringify({ left: true, dissolved: payload?.dissolved === true });
      },
    },
    {
      name: 'view_room_code',
      description: 'Read the room code.',
      inputSchema: emptySchema(),
      annotations: { readOnlyHint: true },
      execute: async () => {
        const { code } = call();
        await Promise.resolve();
        return JSON.stringify({ code });
      },
    },
    {
      name: 'view_room_link',
      description: 'Read the invite link for this waiting room.',
      inputSchema: emptySchema(),
      annotations: { readOnlyHint: true },
      execute: async () => {
        const { code } = call();
        await Promise.resolve();
        return JSON.stringify({ invite_url: `${window.location.origin}/join?code=${encodeURIComponent(code)}` });
      },
    },
    {
      name: 'list_participant',
      description: 'List everyone currently in the waiting room (name, role, ready state).',
      inputSchema: emptySchema(),
      annotations: { readOnlyHint: true },
      execute: async () => {
        const { code, guestId } = call();
        const response = await fetch(`/api/rooms/${encodeURIComponent(code)}/state?guest_id=${encodeURIComponent(guestId)}`);
        const payload = (await response.json().catch(() => null)) as { members?: StateMember[]; error?: unknown } | null;
        if (!response.ok || !payload) {
          throw new Error(typeof payload?.error === 'string' ? payload.error : 'Could not list participants.');
        }
        const members = Array.isArray(payload.members) ? payload.members : [];
        return JSON.stringify({
          participants: members.map((member) => ({
            guest_id: typeof member.guest_id === 'string' ? member.guest_id : null,
            name: typeof member.name === 'string' ? member.name : 'Joining…',
            is_operator: member.is_operator === true,
            ready: member.ready === true,
            online: member.online !== false,
          })),
        });
      },
    },
    {
      name: 'send_message',
      description: 'Send one chat message to everyone in the waiting room.',
      inputSchema: objectSchema({
        body: { type: 'string', description: 'Message text.', minLength: 1, maxLength: WAITING_CHAT_MAX },
      }, ['body']),
      annotations: { readOnlyHint: false },
      execute: async (args: unknown) => {
        const body = readRequiredString(args, 'body', 'e.g. {"body": "I am ready."}').trim();
        if (!body) throw new Error('Message cannot be empty.');
        if (body.length > WAITING_CHAT_MAX) throw new Error(`Message must be ${String(WAITING_CHAT_MAX)} characters or fewer.`);
        const event = await postEvent('chat', body);
        return JSON.stringify({ sent: true, event });
      },
    },
    {
      name: 'list_emoji',
      description: 'List the emoji reactions available in the waiting room.',
      inputSchema: emptySchema(),
      annotations: { readOnlyHint: true },
      execute: () => JSON.stringify({ emojis: WAITING_EMOJIS }),
    },
    {
      name: 'send_emoji',
      description: 'Send one available emoji reaction to the waiting room.',
      inputSchema: objectSchema({
        emoji: { type: 'string', description: `One of: ${WAITING_EMOJIS.join(' ')}`, enum: [...WAITING_EMOJIS] },
      }, ['emoji']),
      annotations: { readOnlyHint: false },
      execute: async (args: unknown) => {
        const emoji = readRequiredString(args, 'emoji', `e.g. {"emoji": "${WAITING_EMOJIS[0]}"}`);
        if (!(WAITING_EMOJIS as readonly string[]).includes(emoji)) {
          throw new Error(`Choose one of: ${WAITING_EMOJIS.join(' ')}.`);
        }
        const event = await postEvent('emoji', emoji);
        return JSON.stringify({ sent: true, event });
      },
    },
    {
      name: 'kick_participant',
      description: 'Operator only: remove a player from the waiting room. Unavailable once the session starts.',
      inputSchema: objectSchema({
        target_guest_id: { type: 'string', description: 'Guest ID of the participant to remove (see list_participant).' },
      }, ['target_guest_id']),
      annotations: { readOnlyHint: false },
      execute: async (args: unknown) => {
        const { code, guestId } = guard(bindings());
        const targetId = readRequiredString(args, 'target_guest_id', 'e.g. {"target_guest_id": "<guest-id>"}');
        const response = await fetch(`/api/rooms/${encodeURIComponent(code)}/kick`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guest_id: guestId, target_guest_id: targetId }),
        });
        const payload = (await response.json().catch(() => null)) as { removed?: unknown; error?: unknown } | null;
        if (!response.ok) {
          throw new Error(typeof payload?.error === 'string' ? payload.error : 'Could not remove the participant.');
        }
        return JSON.stringify({ kicked: true, removed: typeof payload?.removed === 'string' ? payload.removed : targetId });
      },
    },
  ];
}
