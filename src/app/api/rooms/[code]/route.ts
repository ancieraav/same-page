import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabaseServer';
import { bad, findRoomByCode, guestIdOf, ipHashOf } from '@/lib/waitingServer';

/** Public room lookup for join-code validation. */
export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  let room;
  try {
    room = await findRoomByCode(code);
  } catch {
    return bad('Backend is not configured yet.', 503);
  }
  if (!room) return bad('Room not found.', 404);

  const supabase = getServiceSupabase();
  const guestId = guestIdOf(new URL(request.url).searchParams.get('guest_id'));
  if (guestId) {
    const banClauses = [`guest_id.eq.${guestId}`];
    const ipHash = ipHashOf(request);
    if (ipHash) banClauses.push(`ip_hash.eq.${ipHash}`);
    const { data: ban } = await supabase
      .from('room_bans')
      .select('id')
      .eq('room_id', room.id)
      .or(banClauses.join(','))
      .maybeSingle();
    if (ban) {
      return bad('You have been removed from this room and cannot rejoin.', 403);
    }
  }
  const { data: active } = await supabase
    .from('room_members')
    .select('is_operator')
    .eq('room_id', room.id)
    .is('left_at', null);
  const playerCount = (Array.isArray(active) ? active : []).filter(
    (member) => (member as { is_operator?: unknown }).is_operator !== true
  ).length;

  return NextResponse.json({
    code: room.code,
    name: room.name,
    topic: room.topic,
    status: room.status,
    memberCount: playerCount,
    isFull: playerCount >= 2,
  });
}
