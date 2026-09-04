import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabaseServer';
import { bad, findRoomByCode, guestIdOf } from '@/lib/waitingServer';

/** Mark a player ready for the operator; operators do not occupy a player seat. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  let payload: { guest_id?: unknown; ready?: unknown };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return bad('Invalid request body.');
  }
  const guestId = guestIdOf(payload.guest_id);
  if (!guestId || typeof payload.ready !== 'boolean') return bad('Provide guest_id and ready as a boolean.');

  let room;
  try {
    room = await findRoomByCode(code);
  } catch {
    return bad('Backend is not configured yet.', 503);
  }
  if (!room) return bad('Room not found.', 404);
  if (room.status !== 'waiting') return bad('The waiting room is already closed.', 409);

  const supabase = getServiceSupabase();
  const { data: member } = await supabase
    .from('room_members')
    .select('guest_id, is_operator')
    .eq('room_id', room.id)
    .eq('guest_id', guestId)
    .is('left_at', null)
    .maybeSingle();
  if (!member) return bad('You are not in this room.', 403);
  if (member.is_operator === true) return bad('The operator does not need to mark a player seat ready.', 409);

  const { error } = await supabase
    .from('room_members')
    .update({ ready: payload.ready, last_seen_at: new Date().toISOString() })
    .eq('room_id', room.id)
    .eq('guest_id', guestId);
  if (error) return bad('Could not update your ready status.', 500);
  return NextResponse.json({ code: room.code, ready: payload.ready });
}
