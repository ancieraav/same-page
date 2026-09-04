import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabaseServer';
import { WAITING_NAME_MAX, WAITING_ROOM_SIZE } from '@/lib/waiting';
import { bad, findRoomByCode, guestIdOf, ipHashOf } from '@/lib/waitingServer';

/**
 * Join a room by code (idempotent rejoin).
 * - The room creator joins as operator (extra seat, runs the game, cannot answer later).
 * - Everyone else joins as player; only WAITING_ROOM_SIZE players fit.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  let payload: { guest_id?: unknown; name?: unknown; as_operator?: unknown };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return bad('Invalid request body');
  }

  const guestId = guestIdOf(payload.guest_id);
  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  if (!guestId) return bad('Missing guest identity.');
  if (!name) return bad('Please provide your display name.');
  if (name.length > WAITING_NAME_MAX) return bad(`Name must be ${String(WAITING_NAME_MAX)} characters or fewer.`);

  let room;
  try {
    room = await findRoomByCode(code);
  } catch {
    return bad('Backend is not configured yet.', 503);
  }
  if (!room) return bad('Room not found.', 404);
  if (room.status !== 'waiting') return bad('This room is no longer accepting participants.', 409);

  const supabase = getServiceSupabase();

  // Banned guests (by id or IP hash) cannot rejoin this room.
  const banClauses = [`guest_id.eq.${guestId}`];
  const ipHash = ipHashOf(request);
  if (ipHash) banClauses.push(`ip_hash.eq.${ipHash}`);
  const { data: ban } = await supabase
    .from('room_bans')
    .select('id')
    .eq('room_id', room.id)
    .or(banClauses.join(','))
    .maybeSingle();
  if (ban) return bad('You have been removed from this room and cannot rejoin.', 403);

  const { data: existing } = await supabase
    .from('room_members')
    .select('guest_id, is_host, is_operator')
    .eq('room_id', room.id)
    .eq('guest_id', guestId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('room_members')
      .update({ name, last_seen_at: new Date().toISOString(), left_at: null, ready: false })
      .eq('room_id', room.id)
      .eq('guest_id', guestId);
    return NextResponse.json({ code: room.code, is_host: existing.is_host as boolean, rejoined: true });
  }

  const wantsOperatorSeat = payload.as_operator === true;
  const isCreator = room.creator_guest_id !== null && room.creator_guest_id === guestId;

  const { data: active } = await supabase
    .from('room_members')
    .select('is_operator')
    .eq('room_id', room.id)
    .is('left_at', null);
  const activeMembers: { is_operator?: unknown }[] = Array.isArray(active) ? active : [];
  const playerCount = activeMembers.filter((member) => member.is_operator !== true).length;
  const hasOperator = activeMembers.some((member) => member.is_operator === true);

  if (wantsOperatorSeat) {
    if (!isCreator) return bad('Only the room creator can join as operator.', 403);
    if (hasOperator) return bad('This room already has an operator.', 409);
    const { error } = await supabase
      .from('room_members')
      .insert({ room_id: room.id, guest_id: guestId, name, is_host: true, is_operator: true, ready: false });
    if (error) return bad('Could not join the room. Please retry.', 500);
    return NextResponse.json({ code: room.code, is_host: true, is_operator: true });
  }

  if (playerCount >= WAITING_ROOM_SIZE) return bad('This room is already full (2 of 2 players).', 409);

  const { data: inserted, error }: { data: { is_host: boolean } | null; error: { code?: string } | null } = await supabase
    .from('room_members')
    .insert({ room_id: room.id, guest_id: guestId, name, is_host: false, is_operator: false, ready: false })
    .select('is_host')
    .single();
  if (error) {
    if (error.code === '23505') return bad('This room is already full (2 of 2 players).', 409);
    return bad('Could not join the room. Please retry.', 500);
  }
  if (!inserted) return bad('Could not join the room. Please retry.', 500);
  return NextResponse.json({ code: room.code, is_host: inserted.is_host });
}
