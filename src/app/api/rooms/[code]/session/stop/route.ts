import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabaseServer';
import { bad, findRoomByCode, guestIdOf } from '@/lib/waitingServer';
import { SESSION_STATUS } from '@/lib/session';
import { auditSession, forceCloseActiveQuestion, getSessionQuestions, requireSessionOperator, workflowFor } from '@/lib/sessionServer';

/** stop_session: halt at any point and move the room to finalization. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  let payload: { guest_id?: unknown };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return bad('Invalid request body');
  }
  const guestId = guestIdOf(payload.guest_id);
  if (!guestId) return bad('Missing guest identity.');

  let room;
  try {
    room = await findRoomByCode(code);
  } catch {
    return bad('Backend is not configured yet.', 503);
  }
  if (!room) return bad('Room not found.', 404);
  if (room.status === SESSION_STATUS.COMPLETED) return bad('This session is already completed.', 409);

  const operator = await requireSessionOperator(room.id, guestId);
  if (!operator) return bad('Only the room operator can stop the session.', 403);

  const supabase = getServiceSupabase();
  if (room.status !== SESSION_STATUS.FINALIZATION) {
    const closed = await forceCloseActiveQuestion(room.id);
    if (closed.closed === null) {
      const check = await getSessionQuestions(room.id);
      if (check.some((q) => q.status === 'active')) return bad('Could not close the active question. Please retry.', 500);
    }
    const { error } = await supabase.from('rooms').update({ status: SESSION_STATUS.FINALIZATION }).eq('id', room.id);
    if (error) return bad('Could not stop the session. Please retry.', 500);
    await auditSession(room.id, 'stop_session', guestId, { code: room.code });
  }
  const questions = await getSessionQuestions(room.id);
  const { data: analyticsRows } = await supabase.from('round_analytics').select('question_id').eq('room_id', room.id);
  const analyticsIds = new Set((Array.isArray(analyticsRows) ? analyticsRows : []).map((r) => r.question_id as string));
  const { data: suggests } = await supabase.from('question_suggests').select('id').eq('room_id', room.id);
  return NextResponse.json({
    code: room.code,
    stopped: true,
    status: SESSION_STATUS.FINALIZATION,
    workflow: workflowFor(SESSION_STATUS.FINALIZATION, questions, analyticsIds, Array.isArray(suggests) ? suggests.length : 0),
  });
}
