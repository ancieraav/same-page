import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabaseServer';
import { bad, findRoomByCode, guestIdOf } from '@/lib/waitingServer';
import { QUESTION_STATUS, SESSION_STATUS, roundDeadlineFrom } from '@/lib/session';
import { auditSession, getSessionQuestions, requireSessionOperator, workflowFor } from '@/lib/sessionServer';

/** Publish Q1 as active and Q2 as queued after the agent reads room context. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  let payload: { guest_id?: unknown; q1?: unknown; q2?: unknown };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return bad('Invalid request body.');
  }
  const guestId = guestIdOf(payload.guest_id);
  const q1 = typeof payload.q1 === 'string' ? payload.q1.trim() : '';
  const q2 = typeof payload.q2 === 'string' ? payload.q2.trim() : '';
  if (!guestId) return bad('Missing guest identity.');
  if (!q1 || q1.length > 2000 || !q2 || q2.length > 2000) return bad('Provide non-empty q1 and q2 text (max 2000 characters each).');

  let room;
  try {
    room = await findRoomByCode(code);
  } catch {
    return bad('Backend is not configured yet.', 503);
  }
  if (!room) return bad('Room not found.', 404);
  if (room.status !== SESSION_STATUS.ANSWERING) return bad('Start the session before publishing initial questions.', 409);
  const operator = await requireSessionOperator(room.id, guestId);
  if (!operator) return bad('Only the room operator can publish questions.', 403);
  if ((await getSessionQuestions(room.id)).length > 0) return bad('Initial questions are already published.', 409);

  const now = new Date();
  const deadline = roundDeadlineFrom(now.getTime());
  const { error } = await getServiceSupabase().from('session_questions').insert([
    { room_id: room.id, number: 1, text: q1, status: QUESTION_STATUS.ACTIVE, published_at: now.toISOString(), deadline_at: deadline },
    { room_id: room.id, number: 2, text: q2, status: QUESTION_STATUS.QUEUED, published_at: now.toISOString(), deadline_at: null },
  ]);
  if (error) return bad('Could not publish initial questions. Please retry.', 500);
  await auditSession(room.id, 'publish_questions', guestId, { numbers: [1, 2] });
  const questions = await getSessionQuestions(room.id);
  return NextResponse.json({
    code: room.code,
    published: [1, 2],
    active: 1,
    deadline_at: deadline,
    workflow: workflowFor(SESSION_STATUS.ANSWERING, questions, new Set<string>(), 0),
  });
}
