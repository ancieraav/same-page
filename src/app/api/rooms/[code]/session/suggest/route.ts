import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabaseServer';
import { bad, findRoomByCode, guestIdOf } from '@/lib/waitingServer';
import { QUESTION_STATUS, SESSION_STATUS, SUGGEST_EVERY } from '@/lib/session';
import { auditSession, getSessionQuestions, requireSessionOperator, workflowFor } from '@/lib/sessionServer';

/**
 * send_suggest_question: ask participants whether they have a suggested
 * question. Only on multiples of SUGGEST_EVERY completed questions.
 * A rejection returns the current workflow.
 */
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

  let room;
  try {
    room = await findRoomByCode(code);
  } catch {
    return bad('Backend is not configured yet.', 503);
  }
  if (!room) return bad('Room not found.', 404);
  if (room.status === SESSION_STATUS.WAITING) return bad('Launch the session first.', 409);
  if (room.status === SESSION_STATUS.FINALIZATION) return bad('The session is in finalization.', 409);
  if (room.status === SESSION_STATUS.COMPLETED) return bad('This session is already completed.', 409);

  const operator = await requireSessionOperator(room.id, guestId);
  if (!operator) return bad('Only the room operator can send suggest questions.', 403);

  const supabase = getServiceSupabase();
  const questions = await getSessionQuestions(room.id);
  const { data: analyticsRows } = await supabase.from('round_analytics').select('question_id').eq('room_id', room.id);
  const analyticsIds = new Set((Array.isArray(analyticsRows) ? analyticsRows : []).map((r) => r.question_id as string));
  const completed = questions.filter((q) => q.status === QUESTION_STATUS.CLOSED && analyticsIds.has(q.id)).length;
  const { data: existing } = await supabase.from('question_suggests').select('id').eq('room_id', room.id);
  const suggestsSent = Array.isArray(existing) ? existing.length : 0;
  const workflow = workflowFor(room.status, questions, analyticsIds, suggestsSent);
  if (completed === 0 || completed % SUGGEST_EVERY !== 0) {
    return NextResponse.json(
      { error: `Suggest questions are only allowed on multiples of ${String(SUGGEST_EVERY)} completed questions (now ${String(completed)}).`, workflow },
      { status: 409 },
    );
  }
  if (text.length < 1 || text.length > 2000) return bad('Provide text as non-empty text (max 2000 characters).');

  const { data: numbers } = await supabase.from('question_suggests').select('number').eq('room_id', room.id);
  const used = Array.isArray(numbers) ? numbers.map((r) => r.number as number) : [];
  const nextNumber = used.length > 0 ? Math.max(...used) + 1 : 1;
  const { error } = await supabase.from('question_suggests').insert({
    room_id: room.id,
    number: nextNumber,
    text,
    actor_guest_id: guestId,
  });
  if (error) return bad('Could not send the suggest question. Please retry.', 500);
  await auditSession(room.id, 'send_suggest_question', guestId, { number: nextNumber });
  return NextResponse.json({ code: room.code, suggest_number: nextNumber, text });
}
