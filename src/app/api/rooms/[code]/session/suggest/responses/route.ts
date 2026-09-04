import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabaseServer';
import { bad, findRoomByCode, guestIdOf } from '@/lib/waitingServer';
import { SESSION_STATUS } from '@/lib/session';
import { auditSession, getSessionMembers, sessionPlayers } from '@/lib/sessionServer';

/** Participants answer a suggest question (same UI pattern as context answers). */
export async function POST(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  let payload: { guest_id?: unknown; suggest_number?: unknown; body?: unknown };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return bad('Invalid request body');
  }
  const guestId = guestIdOf(payload.guest_id);
  if (!guestId) return bad('Missing guest identity.');
  const suggestNumber = typeof payload.suggest_number === 'number' ? payload.suggest_number : Number.NaN;
  const body = typeof payload.body === 'string' ? payload.body : '';
  if (!Number.isInteger(suggestNumber) || suggestNumber < 1) return bad('Provide suggest_number as an integer >= 1.');
  if (!body.trim() || body.length > 5000) return bad('Provide body as non-empty text (max 5000 characters).');

  let room;
  try {
    room = await findRoomByCode(code);
  } catch {
    return bad('Backend is not configured yet.', 503);
  }
  if (!room) return bad('Room not found.', 404);
  if (room.status === SESSION_STATUS.COMPLETED || room.status === SESSION_STATUS.WAITING) {
    return bad('This room is not accepting suggest responses right now.', 409);
  }

  const members = await getSessionMembers(room.id);
  if (!sessionPlayers(members).some((m) => m.guest_id === guestId)) return bad('Only players can submit suggest responses.', 403);

  const supabase = getServiceSupabase();
  const { data: suggest } = await supabase
    .from('question_suggests')
    .select('id')
    .eq('room_id', room.id)
    .eq('number', suggestNumber)
    .maybeSingle();
  if (!suggest) return bad(`Suggest question ${String(suggestNumber)} was not found.`, 404);

  const { error } = await supabase.from('suggest_responses').upsert(
    { room_id: room.id, suggest_id: (suggest.id as string), guest_id: guestId, body, updated_at: new Date().toISOString() },
    { onConflict: 'suggest_id,guest_id' },
  );
  if (error) return bad('Could not save the response. Please retry.', 500);
  await auditSession(room.id, 'suggest_response', guestId, { number: suggestNumber });
  return NextResponse.json({ code: room.code, submitted: suggestNumber });
}
