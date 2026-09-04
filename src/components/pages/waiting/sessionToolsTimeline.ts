'use client';

import { durationLabel, secondsElapsed, secondsLeft } from '@/lib/session';
import { emptySchema, type WebMCPTool } from '@/lib/webmcp';
import { readCaller, readSnapshot, type SessionToolsBindings } from './sessionToolsShared';

/** Shared timeline tools. They stay registered from waiting through completion. */
export function sessionToolsTimeline(bindings: () => SessionToolsBindings): WebMCPTool[] {
  return [
    {
      name: 'view_timer',
      description: 'Read the total room duration from waiting-room entry through completion.',
      inputSchema: emptySchema(),
      annotations: { readOnlyHint: true },
      execute: async () => {
        const { code, guestId } = readCaller(bindings());
        const snapshot = await readSnapshot(code, guestId);
        const room = snapshot.room ?? {};
        const startedAt = typeof room.timer_started_at === 'string' ? room.timer_started_at : null;
        const endedAt = typeof room.timer_ended_at === 'string' ? room.timer_ended_at : null;
        const elapsed = secondsElapsed(startedAt, endedAt);
        return JSON.stringify({
          status: typeof room.status === 'string' ? room.status : 'waiting',
          started_at: startedAt,
          ended_at: endedAt,
          elapsed_seconds: elapsed,
          elapsed: durationLabel(elapsed),
          running: endedAt === null,
        });
      },
    },
    {
      name: 'view_deadline',
      description: 'Read the active question deadline and remaining time. The tool is visible throughout the room and becomes active when a question is open.',
      inputSchema: emptySchema(),
      annotations: { readOnlyHint: true },
      execute: async () => {
        const { code, guestId } = readCaller(bindings());
        const snapshot = await readSnapshot(code, guestId);
        const current = snapshot.current ?? null;
        const deadlineAt = typeof current?.deadline_at === 'string' ? current.deadline_at : null;
        const question = typeof current?.number === 'number' ? current.number : null;
        if (!deadlineAt || question === null) {
          const phase = typeof snapshot.room?.status === 'string' ? snapshot.room.status : 'waiting';
          throw new Error(`view_deadline is gated until an active question is available. Current phase: ${phase}.`);
        }
        const seconds = secondsLeft(deadlineAt);
        return JSON.stringify({
          question,
          deadline_at: deadlineAt,
          seconds_left: seconds,
          remaining: durationLabel(seconds),
        });
      },
    },
  ];
}
