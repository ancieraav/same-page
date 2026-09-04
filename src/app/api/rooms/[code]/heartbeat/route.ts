import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabaseServer';
import { bad, findRoomByCode, guestIdOf } from '@/lib/waitingServer';

/** Heartbeat — marks you online in the waiting room. */
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

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from('room_members')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('room_id', room.id)
    .eq('guest_id', guestId)
    .is('left_at', null)
    .select('guest_id')
    .maybeSingle();
  if (error || !data) return bad('You are not in this room.', 404);
  return NextResponse.json({ ok: true });
}
