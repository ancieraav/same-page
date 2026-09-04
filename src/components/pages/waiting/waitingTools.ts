'use client';

import {
  emptySchema,
  objectSchema,
  readRequiredString,
  type WebMCPTool,
} from '@/lib/webmcp';
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

/** Waiting-room tools: leave, room code, participants, kick. No session I/O. */
export function sessionToolsWaiting(bindings: () => SessionToolsBindings): WebMCPTool[] {
  const call = (): { code: string; guestId: string } => readCaller(bindings());

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
        window.location.assign('/');
        return JSON.stringify({ left: true, dissolved: payload?.dissolved === true });
      },
    },
    {
      name: 'view_room_code',
      description: 'Read the room code and the invite link to share with participants.',
      inputSchema: emptySchema(),
      annotations: { readOnlyHint: true },
      execute: async () => {
        const { code } = call();
        await Promise.resolve();
        return JSON.stringify({
          code,
          invite_url: `${window.location.origin}/join?code=${encodeURIComponent(code)}`,
        });
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
