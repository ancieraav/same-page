import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabaseServer';
import { bad, findRoomByCode, guestIdOf } from '@/lib/waitingServer';
import { SESSION_STATUS, roomSummaryTemplate, validateRoomSummary } from '@/lib/session';
import { auditSession, requireSessionOperator } from '@/lib/sessionServer';

/** send_room_summary: validated final summary; on success the session completes. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  let payload: { guest_id?: unknown; summary?: unknown };
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
  if (room.status !== SESSION_STATUS.FINALIZATION) {
    return bad('Stop the session before sending the final room summary.', 409);
  }

  const operator = await requireSessionOperator(room.id, guestId);
  if (!operator) return bad('Only the room operator can send the room summary.', 403);

  const checked = validateRoomSummary(payload.summary);
  if (!checked.ok) {
    return NextResponse.json(
      { error: checked.error, expected_template: roomSummaryTemplate() },
      { status: 400 },
    );
  }
  const supabase = getServiceSupabase();
  const { error } = await supabase.from('room_summaries').insert({
    room_id: room.id,
    summary: payload.summary,
    actor_guest_id: guestId,
  });
  if (error) {
    if ((error.code as string | undefined) === '23505') return bad('The room summary already exists.', 409);
    return bad('Could not save the room summary. Please retry.', 500);
  }
  const { error: statusError } = await supabase.from('rooms').update({ status: SESSION_STATUS.COMPLETED }).eq('id', room.id);
  if (statusError) return bad('Could not complete the session. Please retry.', 500);
  await auditSession(room.id, 'send_room_summary', guestId, { code: room.code });
  return NextResponse.json({ code: room.code, saved: true, status: SESSION_STATUS.COMPLETED });
}
