import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabaseServer';
import { bad, findRoomByCode } from '@/lib/waitingServer';

/** Public room lookup for join-code validation. */
export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  let room;
  try {
    room = await findRoomByCode(code);
  } catch {
    return bad('Backend is not configured yet.', 503);
  }
  if (!room) return bad('Room not found.', 404);

  const supabase = getServiceSupabase();
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
