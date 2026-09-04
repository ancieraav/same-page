import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabaseServer';
import { bad, findRoomByCode, guestIdOf } from '@/lib/waitingServer';
import { QUESTION_STATUS, SESSION_STATUS, questionSummaryTemplate, stringArrayOf } from '@/lib/session';
import { auditSession, getSessionMembers, getSessionQuestions, requireSessionOperator, sessionPlayers, workflowFor } from '@/lib/sessionServer';

interface SummaryItem {
  guest_id?: unknown;
  summary?: unknown;
}

/** send_question_summary: summary + analysis for one completed question. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  let payload: {
    guest_id?: unknown;
    number?: unknown;
    summaries?: unknown;
    alignment?: unknown;
    agreed?: unknown;
    disagreed?: unknown;
    hidden_mismatches?: unknown;
    assumptions?: unknown;
    flags?: unknown;
    confidence?: unknown;
  };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return bad('Invalid request body');
  }
  const guestId = guestIdOf(payload.guest_id);
  if (!guestId) return bad('Missing guest identity.');
  const number = typeof payload.number === 'number' ? payload.number : Number.NaN;
  if (!Number.isInteger(number) || number < 1) return bad('Provide number as an integer >= 1.');

  let room;
  try {
    room = await findRoomByCode(code);
  } catch {
    return bad('Backend is not configured yet.', 503);
  }
  if (!room) return bad('Room not found.', 404);

  const operator = await requireSessionOperator(room.id, guestId);
  if (!operator) return bad('Only the room operator can publish analytics.', 403);

  const questions = await getSessionQuestions(room.id);
  const question = questions.find((item) => item.number === number && item.status === QUESTION_STATUS.CLOSED) ?? null;
  if (!question) return bad(`Question ${String(number)} is not closed yet.`, 409);

  const players = sessionPlayers(await getSessionMembers(room.id));
  const rawSummaries: unknown = payload.summaries;
  const summaries = (Array.isArray(rawSummaries) ? rawSummaries : []) as SummaryItem[];
  if (summaries.length !== players.length) {
    return NextResponse.json({ error: `Provide one summary per player (${String(players.length)} required).`, expected_template: questionSummaryTemplate() }, { status: 400 });
  }
  const cleanSummaries: { guest_id: string; summary: string }[] = [];
  for (const item of summaries) {
    const target = typeof item.guest_id === 'string' ? item.guest_id : '';
    const summary = typeof item.summary === 'string' ? item.summary.trim() : '';
    if (!players.some((player) => player.guest_id === target)) return NextResponse.json({ error: `Unknown player "${target}" in summaries.`, expected_template: questionSummaryTemplate() }, { status: 400 });
    if (summary.length < 1 || summary.length > 2000) return NextResponse.json({ error: 'Each summary must be 1..2000 characters.', expected_template: questionSummaryTemplate() }, { status: 400 });
    cleanSummaries.push({ guest_id: target, summary });
  }
  if (new Set(cleanSummaries.map((item) => item.guest_id)).size !== players.length) {
    return NextResponse.json({ error: 'Provide exactly one summary for each distinct player.', expected_template: questionSummaryTemplate() }, { status: 400 });
  }

  if (room.status !== SESSION_STATUS.ANALYZING) return bad('The room is not waiting for round analytics.', 409);

  const alignmentInput: unknown = payload.alignment ?? null;
  if (alignmentInput !== null && (typeof alignmentInput !== 'number' || !Number.isInteger(alignmentInput) || alignmentInput < 0 || alignmentInput > 100)) {
    return NextResponse.json({ error: 'Provide alignment as an integer 0..100 or null.', expected_template: questionSummaryTemplate() }, { status: 400 });
  }
  const alignment = typeof alignmentInput === 'number' ? alignmentInput : null;
  const agreed = stringArrayOf(payload.agreed ?? [], 20, 500);
  const disagreed = stringArrayOf(payload.disagreed ?? [], 20, 500);
  const hiddenMismatches = stringArrayOf(payload.hidden_mismatches ?? [], 20, 500);
  const assumptions = stringArrayOf(payload.assumptions ?? [], 20, 500);
  const flags = stringArrayOf(payload.flags ?? [], 20, 500);
  if (!agreed || !disagreed || !hiddenMismatches || !assumptions || !flags) {
    return NextResponse.json({ error: 'Provide agreed/disagreed/hidden_mismatches/assumptions/flags as string arrays (max 20 items, 500 chars each).', expected_template: questionSummaryTemplate() }, { status: 400 });
  }
  const confidence = typeof payload.confidence === 'string' ? payload.confidence.trim() : '';
  if (confidence.length > 1000) return NextResponse.json({ error: 'Provide confidence as text up to 1000 characters.', expected_template: questionSummaryTemplate() }, { status: 400 });

  const supabase = getServiceSupabase();
  const { error } = await supabase.from('round_analytics').insert({
    room_id: room.id,
    question_id: question.id,
    summaries: cleanSummaries,
    alignment,
    agreed,
    disagreed,
    hidden_mismatches: hiddenMismatches,
    assumptions,
    flags,
    confidence,
  });
  if (error) {
    if ((error.code as string | undefined) === '23505') return bad(`Summary for question ${String(number)} already exists.`, 409);
    return bad('Could not publish the summary. Please retry.', 500);
  }
  await auditSession(room.id, 'send_question_summary', guestId, { number });
  const freshQuestions = await getSessionQuestions(room.id);
  const { data: analyticsRows } = await supabase.from('round_analytics').select('question_id').eq('room_id', room.id);
  const analyticsIds = new Set((Array.isArray(analyticsRows) ? analyticsRows : []).map((r) => r.question_id as string));
  const { data: suggests } = await supabase.from('question_suggests').select('id').eq('room_id', room.id);
  return NextResponse.json({
    code: room.code,
    published: number,
    workflow: workflowFor(room.status, freshQuestions, analyticsIds, Array.isArray(suggests) ? suggests.length : 0),
  });
}
