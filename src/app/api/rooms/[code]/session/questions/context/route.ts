import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabaseServer';
import { bad, findRoomByCode, guestIdOf } from '@/lib/waitingServer';
import { QUESTION_STATUS, SESSION_STATUS, roundDeadlineFrom } from '@/lib/session';
import { auditSession, getSessionQuestions, requireSessionOperator, workflowFor } from '@/lib/sessionServer';

/** send_question_context: publish exactly one question, then the agent waits. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  let payload: { guest_id?: unknown; text?: unknown };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return bad('Invalid request body');
  }
  const guestId = guestIdOf(payload.guest_id);
  if (!guestId) return bad('Missing guest identity.');
  const text = typeof payload.text === 'string' ? payload.text.trim() : '';
  if (text.length < 1 || text.length > 2000) return bad('Provide text as non-empty text (max 2000 characters).');

  let room;
  try {
    room = await findRoomByCode(code);
  } catch {
    return bad('Backend is not configured yet.', 503);
  }
  if (!room) return bad('Room not found.', 404);
  if (room.status === SESSION_STATUS.WAITING) return bad('Launch the session before sending questions.', 409);
  if (room.status === SESSION_STATUS.FINALIZATION) return bad('The session is in finalization. Send the room summary.', 409);
  if (room.status === SESSION_STATUS.COMPLETED) return bad('This session is already completed.', 409);

  const operator = await requireSessionOperator(room.id, guestId);
  if (!operator) return bad('Only the room operator can send questions.', 403);

  const supabase = getServiceSupabase();
  const questions = await getSessionQuestions(room.id);
  if (questions.some((q) => q.status === QUESTION_STATUS.ACTIVE)) {
    return bad('A question is already active. Wait for all participants to answer before sending the next one.', 409);
  }
  const queued = questions.find((q) => q.status === QUESTION_STATUS.QUEUED) ?? null;
  const numbers = questions.map((q) => q.number);
  const nextNumber = queued?.number ?? (numbers.length > 0 ? Math.max(...numbers) + 1 : 1);
  if (nextNumber > 1) {
    const previous = questions.find((q) => q.number === nextNumber - 1) ?? null;
    if (previous?.status !== QUESTION_STATUS.CLOSED) {
      return bad(`Question ${String(nextNumber - 1)} is not closed yet.`, 409);
    }
    const { data: analytics } = await supabase
      .from('round_analytics')
      .select('id')
      .eq('question_id', previous.id)
      .maybeSingle();
    if (!analytics) return bad(`Send the summary for question ${String(nextNumber - 1)} first.`, 409);
  }
  // Activate the next queued question (Q2 from the initial pair) before
  // auto-incrementing to a newly generated question.
  const now = new Date();
  const deadline = roundDeadlineFrom(now.getTime());
  if (queued) {
    const { error } = await supabase
      .from('session_questions')
      .update({ text, status: QUESTION_STATUS.ACTIVE, published_at: now.toISOString(), deadline_at: deadline })
      .eq('id', queued.id);
    if (error) return bad('Could not activate the question. Please retry.', 500);
  } else {
    const { error } = await supabase.from('session_questions').insert({
      room_id: room.id,
      number: nextNumber,
      text,
      status: QUESTION_STATUS.ACTIVE,
      published_at: now.toISOString(),
      deadline_at: deadline,
    });
    if (error) return bad('Could not publish the question. Please retry.', 500);
  }
  await supabase.from('rooms').update({ status: SESSION_STATUS.ANSWERING }).eq('id', room.id);
  await auditSession(room.id, 'send_question_context', guestId, { number: nextNumber });
  const { data: analyticsRows } = await supabase.from('round_analytics').select('question_id').eq('room_id', room.id);
  const analyticsIds = new Set((Array.isArray(analyticsRows) ? analyticsRows : []).map((r) => r.question_id as string));
  const { data: suggests } = await supabase.from('question_suggests').select('id').eq('room_id', room.id);
  const fresh = await getSessionQuestions(room.id);
  return NextResponse.json({
    code: room.code,
    number: nextNumber,
    text,
    deadline_at: deadline,
    workflow: workflowFor(SESSION_STATUS.ANSWERING, fresh, analyticsIds, Array.isArray(suggests) ? suggests.length : 0),
  });
}
