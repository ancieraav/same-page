// Shared session-core constants + pure helpers (safe for client + server).
//
// 19-function WebMCP surface: infinite context questions (auto-increment),
// blocking waits, suggest every 5 completions, stop -> finalization -> room
// summary -> completed. AI == operator.

/** Fixed round duration in seconds (server clock is authoritative). */
export const ROUND_SECONDS = 180;

/** A suggest question may only be sent on multiples of this many completions. */
export const SUGGEST_EVERY = 5;

export const SESSION_STATUS = {
  WAITING: 'waiting',
  ANSWERING: 'answering',
  ANALYZING: 'analyzing',
  FINALIZATION: 'finalization',
  COMPLETED: 'completed',
} as const;

export type SessionStatus = (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS];

export const QUESTION_STATUS = {
  QUEUED: 'queued',
  ACTIVE: 'active',
  CLOSED: 'closed',
} as const;

export const CONTEXT_KINDS = ['topic', 'information', 'attachment'] as const;
export type ContextKind = (typeof CONTEXT_KINDS)[number];

/** Seconds remaining until an ISO deadline (never negative). */
export function secondsLeft(deadlineIso: string, nowMs = Date.now()): number {
  const deadline = new Date(deadlineIso).getTime();
  if (Number.isNaN(deadline)) return 0;
  return Math.max(0, Math.floor((deadline - nowMs) / 1000));
}

/** ISO deadline ROUND_SECONDS after `nowMs` (server stamps this on publish). */
export function roundDeadlineFrom(nowMs = Date.now()): string {
  return new Date(nowMs + ROUND_SECONDS * 1000).toISOString();
}

/** Validate a string array payload (agent-published lists). Null when invalid. */
export function stringArrayOf(value: unknown, maxItems: number, maxLen: number): string[] | null {
  if (!Array.isArray(value) || value.length > maxItems) return null;
  const items: string[] = [];
  for (const item of value) {
    if (typeof item !== 'string' || item.length > maxLen) return null;
    items.push(item);
  }
  return items;
}

export interface FinalAnswerItem {
  question: number;
  guest_id: string;
  name: string;
  body: string;
  missing: boolean;
}

export interface FinalQuestionItem {
  number: number;
  text: string;
  answers: FinalAnswerItem[];
  analytics: {
    summaries: { guest_id: string; name: string; summary: string }[];
    alignment: number | null;
    agreed: string[];
    disagreed: string[];
  } | null;
}

/** Assemble the final report from stored rows (pure; computed on close/read). */
export function assembleFinalReport(
  room: { code: string; name: string; topic: string },
  items: FinalQuestionItem[],
): Record<string, unknown> {
  const answered = items.filter((item) => item.answers.some((answer) => !answer.missing)).length;
  const alignmentTrend = items.map((item) => item.analytics?.alignment ?? null);
  return {
    room,
    questions_completed: items.length,
    rounds_answered: answered,
    alignment_trend: alignmentTrend,
    rounds: items,
  };
}

export type WorkflowState =
  | 'waiting'
  | 'answering'
  | 'analyzing'
  | 'need_next_question'
  | 'suggest_due'
  | 'finalization'
  | 'completed';

export interface WorkflowInfo {
  state: WorkflowState;
  goal: string;
  next_tool: string;
  args_hint?: Record<string, unknown>;
  completed_count?: number;
}

export interface WorkflowInput {
  status: string;
  activeNumber: number | null;
  pendingSummaryNumber: number | null;
  completedCount: number;
  suggestsSent: number;
}

/** Pure state machine behind `view_current_workflow` (no I/O). */
export function buildWorkflow(input: WorkflowInput): WorkflowInfo {
  if (input.status === SESSION_STATUS.WAITING) {
    return { state: 'waiting', goal: 'Start the session.', next_tool: 'start_session', completed_count: 0 };
  }
  if (input.status === SESSION_STATUS.FINALIZATION) {
    return { state: 'finalization', goal: 'Write and send the final room summary.', next_tool: 'send_room_summary', completed_count: input.completedCount };
  }
  if (input.status === SESSION_STATUS.COMPLETED) {
    return { state: 'completed', goal: 'Session is complete. Read the final summary.', next_tool: 'view_room_summary', completed_count: input.completedCount };
  }
  if (input.activeNumber !== null) {
    return {
      state: 'answering',
      goal: `Wait for all participants to answer question ${String(input.activeNumber)}. Do not send a new question yet.`,
      next_tool: 'view_question_context_responses',
      args_hint: { numbers: [input.activeNumber] },
      completed_count: input.completedCount,
    };
  }
  if (input.pendingSummaryNumber !== null) {
    return {
      state: 'analyzing',
      goal: `Send the summary and analysis for completed question ${String(input.pendingSummaryNumber)}.`,
      next_tool: 'send_question_summary',
      args_hint: { number: input.pendingSummaryNumber },
      completed_count: input.completedCount,
    };
  }
  if (input.status === SESSION_STATUS.ANSWERING && input.completedCount === 0) {
    return {
      state: 'answering',
      goal: 'Read the room context and send Q1 with send_question_context, then wait for answers.',
      next_tool: 'send_question_context',
      args_hint: { text: '<question 1>' },
      completed_count: 0,
    };
  }
  const milestones = Math.floor(input.completedCount / SUGGEST_EVERY);
  if (input.completedCount > 0 && input.completedCount % SUGGEST_EVERY === 0 && input.suggestsSent < milestones) {
    return {
      state: 'suggest_due',
      goal: `Ask participants whether they have a suggested question (milestone ${String(input.completedCount)}). Afterwards send the next question.`,
      next_tool: 'send_suggest_question',
      completed_count: input.completedCount,
    };
  }
  return {
    state: 'need_next_question',
    goal: 'Send the next context question (exactly one).',
    next_tool: 'send_question_context',
    completed_count: input.completedCount,
  };
}

/** Static content behind `view_goals_workflow` (no I/O). */
export function goalsWorkflow(): Record<string, unknown> {
  return {
    app: 'Same Page helps participants align their understanding of a room topic.',
    how_session_works: [
      'The agent launches the session, reads topic, information, and attachments as context.',
      'The agent sends context questions one at a time (starting with Q1) and waits until every required participant answers or the 3-minute deadline passes.',
      'The agent sends a summary and analysis for each completed question before sending the next one.',
      'Every 5 completed questions the agent may ask participants whether they have a suggested question.',
      'The agent stops the session at any time, moving it to finalization, then sends the final room summary following the required template.',
    ],
    ai_responsibilities: [
      'Write questions from the room context and prior answers.',
      'Never submit, edit, or invent participant answers.',
      'Summarize each completed round before continuing.',
      'Follow view_current_workflow for the current goal and tool.',
    ],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Required template behind `send_room_summary`. Extra keys are allowed. */
export function roomSummaryTemplate(): Record<string, unknown> {
  return {
    room: { code: 'string', name: 'string', topic: 'string' },
    questions_completed: 'integer',
    rounds_answered: 'integer',
    alignment_trend: '(number|null)[]',
    rounds: '[{number, text, answers[], analytics}]',
    agreements: 'string[]',
    disagreements: 'string[]',
    open_points: 'string[]',
  };
}

/** Strict template check. Returns ok or the reason plus the expected template. */
export function validateRoomSummary(value: unknown): { ok: true } | { ok: false; error: string } {
  if (!isRecord(value)) return { ok: false, error: 'Summary must be an object following the final template.' };
  const room = value['room'];
  if (!isRecord(room) || typeof room['code'] !== 'string' || typeof room['name'] !== 'string' || typeof room['topic'] !== 'string') {
    return { ok: false, error: 'summary.room must be {code, name, topic} as strings.' };
  }
  if (!Number.isInteger(value['questions_completed'])) return { ok: false, error: 'summary.questions_completed must be an integer.' };
  if (!Number.isInteger(value['rounds_answered'])) return { ok: false, error: 'summary.rounds_answered must be an integer.' };
  if (!Array.isArray(value['alignment_trend'])) return { ok: false, error: 'summary.alignment_trend must be an array.' };
  if (!Array.isArray(value['rounds'])) return { ok: false, error: 'summary.rounds must be an array.' };
  for (const key of ['agreements', 'disagreements', 'open_points'] as const) {
    if (stringArrayOf(value[key] ?? [], 50, 1000) === null) return { ok: false, error: `summary.${key} must be a string array (max 50 items, 1000 chars each).` };
  }
  return { ok: true };
}
