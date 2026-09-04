import { NextRequest, NextResponse } from 'next/server';
import { buildRoomContext } from '@/lib/attachmentContext';
import { getServiceSupabase } from '@/lib/supabaseServer';
import { bad, findRoomByCode, guestIdOf } from '@/lib/waitingServer';
import { SESSION_STATUS, buildWorkflow } from '@/lib/session';
import { auditSession, getSessionMembers, requireSessionOperator, sessionPlayers } from '@/lib/sessionServer';

/** start_session: operator (= AI agent) starts the session (waiting -> answering). */
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
  if (room.status !== SESSION_STATUS.WAITING) return bad('This room already started.', 409);

  const operator = await requireSessionOperator(room.id, guestId);
  if (!operator) return bad('Only the room operator can start the session.', 403);

  const players = sessionPlayers(await getSessionMembers(room.id));
  if (players.length !== 2) return bad(`Need exactly 2 players to start (now ${String(players.length)}).`, 409);
  if (!players.every((player) => player.ready)) return bad('Both players must mark themselves ready before the session can start.', 409);

  const { error } = await getServiceSupabase().from('rooms').update({ status: SESSION_STATUS.ANSWERING }).eq('id', room.id);
  if (error) return bad('Could not start the session. Please retry.', 500);
  await auditSession(room.id, 'launch_session', guestId, { code: room.code });
  let roomContext;
  try {
    roomContext = await buildRoomContext(room);
  } catch {
    roomContext = {
      room: { code: room.code, name: room.name, topic: room.topic, information: room.notes },
      instructions: [
        'Read the room context, then send Q1 with send_question_context.',
        'Never submit, edit, or invent participant answers.',
      ],
      attachments: [],
      error: 'Attachment context could not be prepared.',
    };
  }
  return NextResponse.json({
    code: room.code,
    started: true,
    status: SESSION_STATUS.ANSWERING,
    agent_instruction: 'Session started. Read room_context, then send Q1 with send_question_context. Never submit participant answers.',
    room_context: roomContext,
    workflow: buildWorkflow({ status: SESSION_STATUS.ANSWERING, activeNumber: null, pendingSummaryNumber: null, completedCount: 0, suggestsSent: 0 }),
  });
}
