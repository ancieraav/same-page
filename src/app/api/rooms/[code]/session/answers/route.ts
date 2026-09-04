import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabaseServer';
import { bad, findRoomByCode, guestIdOf } from '@/lib/waitingServer';
import { QUESTION_STATUS, SESSION_STATUS } from '@/lib/session';
import { getSessionMembers, getSessionQuestions, maybeCloseRound, sessionPlayers } from '@/lib/sessionServer';

/** Player submits (or updates) their own answer while the round is open. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  let payload: { guest_id?: unknown; number?: unknown; body?: unknown };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return bad('Invalid request body');
  }
  const guestId = guestIdOf(payload.guest_id);
  if (!guestId) return bad('Missing guest identity.');
  const number = typeof payload.number === 'number' ? payload.number : Number.NaN;
  const body = typeof payload.body === 'string' ? payload.body : '';
  if (!Number.isInteger(number)) return bad('Provide number as an integer.');
  if (!body.trim() || body.length > 5000) return bad('Provide body as non-empty text (max 5000 characters).');

  let room;
  try {
    room = await findRoomByCode(code);
  } catch {
    return bad('Backend is not configured yet.', 503);
  }
  if (!room) return bad('Room not found.', 404);
  if (room.status === SESSION_STATUS.COMPLETED || room.status === SESSION_STATUS.WAITING) {
    return bad('This room is not accepting answers right now.', 409);
  }

  const members = await getSessionMembers(room.id);
  const player = sessionPlayers(members).find((member) => member.guest_id === guestId);
  if (!player) return bad('Only players can submit answers.', 403);

  const questions = await getSessionQuestions(room.id);
  const question = questions.find((item) => item.number === number && item.status === QUESTION_STATUS.ACTIVE) ?? null;
  if (!question) return bad(`Question ${String(number)} is not open for answers.`, 409);
  if (question.deadline_at && Date.now() > new Date(question.deadline_at).getTime()) {
    await maybeCloseRound(room.id);
    return bad('The round is closed.', 409);
  }

  const supabase = getServiceSupabase();
  const { data: existing } = await supabase
    .from('session_answers')
    .select('id, missing')
    .eq('question_id', question.id)
    .eq('guest_id', guestId)
    .maybeSingle();
  if (existing) {
    if ((existing.missing as boolean | undefined) === true) return bad('The round is closed.', 409);
    const { error } = await supabase
      .from('session_answers')
      .update({ body, updated_at: new Date().toISOString() })
      .eq('id', existing.id as string);
    if (error) return bad('Could not save the answer. Please retry.', 500);
  } else {
    const { error } = await supabase.from('session_answers').insert({
      question_id: question.id,
      room_id: room.id,
      guest_id: guestId,
      body,
      missing: false,
    });
    if (error) return bad('Could not save the answer. Please retry.', 500);
  }

  const closed = await maybeCloseRound(room.id);
  return NextResponse.json({ code: room.code, submitted: number, round_closed: closed.closed !== null });
}
