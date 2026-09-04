'use client';

import {
  assertExactMatch,
  emptySchema,
  objectSchema,
  pollExactValue,
  readOptionalString,
  readRequiredString,
  type WebMCPTool,
} from '@/lib/webmcp';
import { readCaller, readSnapshot, type SessionToolsBindings } from './sessionToolsShared';

function nextTick(): Promise<void> {
  return new Promise((resolve) => { window.setTimeout(resolve, 0); });
}

async function activeAnswerContext(bindings: () => SessionToolsBindings) {
  const currentBindings = bindings();
  const { code, guestId } = readCaller(currentBindings);
  const snapshot = await readSnapshot(code, guestId);
  const question = typeof snapshot.current?.number === 'number' ? snapshot.current.number : null;
  const deadlineAt = typeof snapshot.current?.deadline_at === 'string' ? snapshot.current.deadline_at : null;
  if (question === null || !deadlineAt) {
    const phase = typeof snapshot.room?.status === 'string' ? snapshot.room.status : 'waiting';
    throw new Error(`Answer tools are gated until an active question is available. Current phase: ${phase}.`);
  }
  if (!currentBindings.getAnswerDraft || !currentBindings.setAnswerDraft || !currentBindings.submitAnswer) {
    throw new Error('Answer tools become active in the participant question view.');
  }
  return { bindings: currentBindings, question };
}

/** Participant-only answer controls, registered from waiting through completion. */
export function sessionToolsAnswers(bindings: () => SessionToolsBindings): WebMCPTool[] {
  return [
    {
      name: 'modify_answer',
      description: 'Change the personal response draft for the active question. Pass before and after for exact-match safeguards.',
      inputSchema: objectSchema({
        value: { type: 'string', description: 'Answer draft text.', maxLength: 5000 },
        before: { type: 'string', description: 'Current draft text that must match exactly.' },
        after: { type: 'string', description: 'Expected draft text after the change.' },
      }, ['value']),
      annotations: { readOnlyHint: false },
      execute: async (args: unknown) => {
        const value = readRequiredString(args, 'value', 'e.g. {"value": "My perspective is…"}');
        const before = readOptionalString(args, 'before');
        const after = readOptionalString(args, 'after');
        if (value.length > 5000) throw new Error('Answer must be 5000 characters or fewer.');
        const { bindings: currentBindings, question } = await activeAnswerContext(bindings);
        await nextTick();
        const current = currentBindings.getAnswerDraft?.() ?? '';
        assertExactMatch(current, before, 'before', 'Answer draft');
        currentBindings.setAnswerDraft?.(value);
        const updated = await pollExactValue(() => currentBindings.getAnswerDraft?.() ?? '', value, 'Answer draft');
        if (after !== undefined && updated !== after) {
          throw new Error(`Answer draft is "${updated}", which does not exactly match after "${after}".`);
        }
        return `Answer draft updated for question ${String(question)}.`;
      },
    },
    {
      name: 'press_submit_button',
      description: 'Press Submit Response for the active question and save the personal answer.',
      inputSchema: emptySchema(),
      annotations: { readOnlyHint: false },
      execute: async () => {
        const { bindings: currentBindings, question } = await activeAnswerContext(bindings);
        const saved = await currentBindings.submitAnswer?.();
        if (!saved) throw new Error('Could not submit the answer.');
        return `Answer saved for question ${String(question)}.`;
      },
    },
  ];
}
