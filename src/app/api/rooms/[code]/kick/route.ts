import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabaseServer';
import { bad, findRoomByCode, guestIdOf, ipHashOf } from '@/lib/waitingServer';

/**
 * Operator removes a player: frees the seat and bans guest_id + IP hash
 * from rejoining this room.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  let payload: { guest_id?: unknown; target_guest_id?: unknown };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return bad('Invalid request body');
  }

  const guestId = guestIdOf(payload.guest_id);
  const targetId = guestIdOf(payload.target_guest_id);
  if (!guestId || !targetId) return bad('Missing guest identity.');
  if (guestId === targetId) return bad('You cannot remove yourself.');

  let room;
  try {
    room = await findRoomByCode(code);
  } catch {
    return bad('Backend is not configured yet.', 503);
  }
  if (!room) return bad('Room not found.', 404);

  const supabase = getServiceSupabase();
  const { data: requester } = await supabase
    .from('room_members')
    .select('is_operator')
    .eq('room_id', room.id)
    .eq('guest_id', guestId)
    .is('left_at', null)
    .maybeSingle();
  if (!requester || (requester as { is_operator?: unknown }).is_operator !== true) {
    return bad('Only the operator can remove participants.', 403);
  }

  const { data: target } = await supabase
    .from('room_members')
    .select('guest_id, name, is_operator')
    .eq('room_id', room.id)
    .eq('guest_id', targetId)
    .is('left_at', null)
    .maybeSingle();
  if (!target) return bad('Participant is not in this room.', 404);
  if ((target as { is_operator?: unknown }).is_operator === true) {
    return bad('The operator cannot be removed.', 400);
  }

  const targetRow = target as { guest_id: string; name: string };
  await supabase
    .from('room_members')
    .update({ left_at: new Date().toISOString() })
    .eq('room_id', room.id)
    .eq('guest_id', targetId);
  await supabase.from('room_bans').upsert(
    { room_id: room.id, guest_id: targetId, ip_hash: ipHashOf(request) },
    { onConflict: 'room_id,guest_id' }
  );

  return NextResponse.json({ ok: true, removed: targetRow.name });
}
