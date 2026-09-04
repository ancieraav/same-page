import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabaseServer';
import { bad, findRoomByCode, guestIdOf } from '@/lib/waitingServer';

/** Leave the waiting room (frees your seat for someone else). */
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
  const { data: leaver } = await supabase
    .from('room_members')
    .select('is_operator')
    .eq('room_id', room.id)
    .eq('guest_id', guestId)
    .is('left_at', null)
    .maybeSingle();
  // Operator leaving dissolves the room for everyone (cascades to members);
  // participants see the state go 404 and get redirected with a toast.
  if (leaver && (leaver as { is_operator?: unknown }).is_operator === true) {
    const { error } = await supabase.from('rooms').delete().eq('id', room.id);
    if (!error) return NextResponse.json({ ok: true, dissolved: true });
  }
  await supabase
    .from('room_members')
    .update({ left_at: new Date().toISOString() })
    .eq('room_id', room.id)
    .eq('guest_id', guestId);
  return NextResponse.json({ ok: true, dissolved: false });
}
