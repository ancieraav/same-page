import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabaseServer';
import { WAITING_CHAT_MAX, WAITING_EMOJIS } from '@/lib/waiting';
import { bad, findRoomByCode, guestIdOf } from '@/lib/waitingServer';

/** Persist a waiting-room chat message or emoji reaction. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  let payload: { guest_id?: unknown; type?: unknown; body?: unknown; emoji?: unknown };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return bad('Invalid request body');
  }

  const guestId = guestIdOf(payload.guest_id);
  if (!guestId) return bad('Missing guest identity.');
  if (payload.type !== 'chat' && payload.type !== 'emoji') return bad('Invalid event type.');

  let room;
  try {
    room = await findRoomByCode(code);
  } catch {
    return bad('Backend is not configured yet.', 503);
  }
  if (!room) return bad('Room not found.', 404);

  const supabase = getServiceSupabase();
  const { data: member } = await supabase
    .from('room_members')
    .select('guest_id')
    .eq('room_id', room.id)
    .eq('guest_id', guestId)
    .is('left_at', null)
    .maybeSingle();
  if (!member) return bad('You are not in this room.', 403);

  if (payload.type === 'chat') {
    const body = typeof payload.body === 'string' ? payload.body.trim() : '';
    if (!body) return bad('Message cannot be empty.');
    if (body.length > WAITING_CHAT_MAX) return bad(`Message must be ${String(WAITING_CHAT_MAX)} characters or fewer.`);
    const { data, error }: { data: { id: string; guest_id: string; body: string; created_at: string } | null; error: unknown } = await supabase
      .from('waiting_messages')
      .insert({ room_id: room.id, guest_id: guestId, body })
      .select('id, guest_id, body, created_at')
      .single();
    if (error || !data) return bad('Could not send the message.', 500);
    return NextResponse.json({
      event: { id: data.id, guest_id: data.guest_id, body: data.body, at: data.created_at },
    });
  }

  const emoji = typeof payload.emoji === 'string' ? payload.emoji : '';
  if (!(WAITING_EMOJIS as readonly string[]).includes(emoji)) return bad('Invalid emoji.');
  const { data, error }: { data: { id: string; guest_id: string; emoji: string; created_at: string } | null; error: unknown } = await supabase
    .from('waiting_reactions')
    .insert({ room_id: room.id, guest_id: guestId, emoji })
    .select('id, guest_id, emoji, created_at')
    .single();
  if (error || !data) return bad('Could not send the reaction.', 500);
  return NextResponse.json({
    event: { id: data.id, guest_id: data.guest_id, emoji: data.emoji, at: data.created_at },
  });
}
