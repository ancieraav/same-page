import { getServiceSupabase } from './supabaseServer';
import { QUESTION_STATUS, SESSION_STATUS, buildWorkflow, type WorkflowInfo } from './session';

export interface SessionMemberRow {
  guest_id: string;
  name: string;
  is_operator: boolean;
  ready: boolean;
}

export interface SessionQuestionRow {
  id: string;
  number: number;
  text: string;
  status: string;
  published_at: string;
  deadline_at: string | null;
}

export interface SuggestRow {
  id: string;
  number: number;
  text: string;
  created_at: string;
}

export interface SuggestResponseRow {
  suggest_id: string;
  suggest_number: number;
  guest_id: string;
  body: string;
  created_at: string;
}

/** Active (not left) members, oldest first. */
export async function getSessionMembers(roomId: string): Promise<SessionMemberRow[]> {
  const supabase = getServiceSupabase();
  const { data } = await supabase
    .from('room_members')
    .select('guest_id, name, is_operator, ready')
    .eq('room_id', roomId)
    .is('left_at', null)
    .order('joined_at', { ascending: true });
  if (!Array.isArray(data)) return [];
  return data.map((member) => ({
    guest_id: member.guest_id as string,
    name: (member.name as string | null) ?? '',
    is_operator: member.is_operator === true,
    ready: member.ready === true,
  }));
}

export function sessionPlayers(members: SessionMemberRow[]): SessionMemberRow[] {
  return members.filter((member) => !member.is_operator);
}

/** The operator seat, or null when the guest is not the active operator. */
export async function requireSessionOperator(roomId: string, guestId: string): Promise<SessionMemberRow | null> {
  const members = await getSessionMembers(roomId);
  return members.find((member) => member.guest_id === guestId && member.is_operator) ?? null;
}

export type AuditKind =
  | 'start'
  | 'publish_questions'
  | 'close_round'
  | 'publish_analytics'
  | 'publish_next'
  | 'close_session'
  | 'launch_session'
  | 'send_question_context'
  | 'send_question_summary'
  | 'send_suggest_question'
  | 'suggest_response'
  | 'stop_session'
  | 'send_room_summary';

export async function auditSession(
  roomId: string,
  kind: AuditKind,
  actor: string | null,
  detail: Record<string, unknown> = {},
): Promise<void> {
  try {
    await getServiceSupabase()
      .from('session_audit_events')
      .insert({ room_id: roomId, kind, actor_guest_id: actor, detail });
  } catch {
    // Audit must never break the session flow.
  }
}

export async function getSessionQuestions(roomId: string): Promise<SessionQuestionRow[]> {
  const supabase = getServiceSupabase();
  const { data } = await supabase
    .from('session_questions')
    .select('id, number, text, status, published_at, deadline_at')
    .eq('room_id', roomId)
    .order('number', { ascending: true });
  if (!Array.isArray(data)) return [];
  return data.map((row) => ({
    id: row.id as string,
    number: row.number as number,
    text: row.text as string,
    status: row.status as string,
    published_at: row.published_at as string,
    deadline_at: (row.deadline_at as string | null) ?? null,
  }));
}

export async function getSuggests(roomId: string): Promise<SuggestRow[]> {
  const supabase = getServiceSupabase();
  const { data } = await supabase
    .from('question_suggests')
    .select('id, number, text, created_at')
    .eq('room_id', roomId)
    .order('number', { ascending: true });
  if (!Array.isArray(data)) return [];
  return data.map((row) => ({
    id: row.id as string,
    number: row.number as number,
    text: row.text as string,
    created_at: row.created_at as string,
  }));
}

export async function getSuggestResponses(roomId: string): Promise<SuggestResponseRow[]> {
  const supabase = getServiceSupabase();
  const { data } = await supabase
    .from('suggest_responses')
    .select('suggest_id, guest_id, body, created_at, question_suggests!inner(room_id, number)')
    .eq('room_id', roomId);
  if (!Array.isArray(data)) return [];
  return data.map((row) => {
    const joined = row.question_suggests as unknown as { number?: unknown } | { number?: unknown }[] | null;
    const first = Array.isArray(joined) ? joined[0] : joined;
    return {
      suggest_id: row.suggest_id as string,
      suggest_number: typeof first?.number === 'number' ? first.number : 0,
      guest_id: row.guest_id as string,
      body: (row.body as string | null) ?? '',
      created_at: row.created_at as string,
    };
  });
}

export async function getRoomSummary(roomId: string): Promise<{ summary: unknown; created_at: string } | null> {
  const supabase = getServiceSupabase();
  const { data } = await supabase
    .from('room_summaries')
    .select('summary, created_at')
    .eq('room_id', roomId)
    .maybeSingle();
  if (!data) return null;
  return { summary: data.summary as unknown, created_at: data.created_at as string };
}

/** Closed questions that already have analytics (the "completed" count). */
export function completedCount(questions: SessionQuestionRow[], analyticsQuestionIds: Set<string>): number {
  return questions.filter((q) => q.status === QUESTION_STATUS.CLOSED && analyticsQuestionIds.has(q.id)).length;
}

/** Smallest closed question number still missing analytics, or null. */
export function pendingSummaryNumber(questions: SessionQuestionRow[], analyticsQuestionIds: Set<string>): number | null {
  const pending = questions
    .filter((q) => q.status === QUESTION_STATUS.CLOSED && !analyticsQuestionIds.has(q.id))
    .map((q) => q.number);
  return pending.length > 0 ? Math.min(...pending) : null;
}

export function workflowFor(
  status: string,
  questions: SessionQuestionRow[],
  analyticsQuestionIds: Set<string>,
  suggestsSent: number,
): WorkflowInfo {
  const active = questions.find((q) => q.status === QUESTION_STATUS.ACTIVE) ?? null;
  return buildWorkflow({
    status,
    activeNumber: active?.number ?? null,
    pendingSummaryNumber: pendingSummaryNumber(questions, analyticsQuestionIds),
    completedCount: completedCount(questions, analyticsQuestionIds),
    suggestsSent,
  });
}

/**
 * Server-authoritative round close (lazy): when the active round has all
 * player answers or its deadline passed (server clock), mark missing answers,
 * close the question, and move the room to analyzing. Safe to call on every
 * session read — idempotent (no active question means nothing to do).
 */
export async function maybeCloseRound(roomId: string, now: Date = new Date()): Promise<{ closed: number | null }> {
  const supabase = getServiceSupabase();
  const questions = await getSessionQuestions(roomId);
  const active = questions.find((question) => question.status === QUESTION_STATUS.ACTIVE) ?? null;
  if (!active) return { closed: null };

  const players = sessionPlayers(await getSessionMembers(roomId));
  if (players.length === 0) return { closed: null };

  const { data: answers } = await supabase
    .from('session_answers')
    .select('guest_id, missing')
    .eq('question_id', active.id);
  const submitted = new Set(
    (Array.isArray(answers) ? answers : [])
      .filter((answer) => (answer.missing as boolean | undefined) !== true)
      .map((answer) => answer.guest_id as string),
  );

  const deadline = active.deadline_at ? new Date(active.deadline_at).getTime() : Number.NaN;
  const allAnswered = players.every((player) => submitted.has(player.guest_id));
  const pastDeadline = !Number.isNaN(deadline) && now.getTime() > deadline;
  if (!allAnswered && !pastDeadline) return { closed: null };

  for (const player of players) {
    if (submitted.has(player.guest_id)) continue;
    const { error } = await supabase.from('session_answers').insert({
      question_id: active.id,
      room_id: roomId,
      guest_id: player.guest_id,
      body: '',
      missing: true,
    });
    // 23505: a concurrent closer already marked this seat — safe to ignore.
    if (error && error.code !== '23505') return { closed: null };
  }
  await supabase.from('session_questions').update({ status: QUESTION_STATUS.CLOSED }).eq('id', active.id);
  await supabase.from('rooms').update({ status: SESSION_STATUS.ANALYZING }).eq('id', roomId);
  await auditSession(roomId, 'close_round', null, { question: active.number, allAnswered, pastDeadline });
  return { closed: active.number };
}

/**
 * Unconditional close for `stop_session`: mark non-respondents missing and
 * close the active question regardless of deadline. No analytics required.
 */
export async function forceCloseActiveQuestion(roomId: string): Promise<{ closed: number | null }> {
  const supabase = getServiceSupabase();
  const questions = await getSessionQuestions(roomId);
  const active = questions.find((question) => question.status === QUESTION_STATUS.ACTIVE) ?? null;
  if (!active) return { closed: null };
  const players = sessionPlayers(await getSessionMembers(roomId));
  const { data: answers } = await supabase
    .from('session_answers')
    .select('guest_id, missing')
    .eq('question_id', active.id);
  const submitted = new Set(
    (Array.isArray(answers) ? answers : [])
      .filter((answer) => (answer.missing as boolean | undefined) !== true)
      .map((answer) => answer.guest_id as string),
  );
  for (const player of players) {
    if (submitted.has(player.guest_id)) continue;
    const { error } = await supabase.from('session_answers').insert({
      question_id: active.id,
      room_id: roomId,
      guest_id: player.guest_id,
      body: '',
      missing: true,
    });
    if (error && error.code !== '23505') return { closed: null };
  }
  await supabase.from('session_questions').update({ status: QUESTION_STATUS.CLOSED }).eq('id', active.id);
  await auditSession(roomId, 'stop_session', null, { question: active.number, forced: true });
  return { closed: active.number };
}
