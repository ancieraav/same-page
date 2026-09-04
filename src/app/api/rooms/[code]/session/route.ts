import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabaseServer';
import { bad, findRoomByCode, guestIdOf, resolveRoomAttachments } from '@/lib/waitingServer';
import { QUESTION_STATUS, SESSION_STATUS, assembleFinalReport, secondsLeft } from '@/lib/session';
import { getRoomSummary, getSessionMembers, getSessionQuestions, getSuggestResponses, getSuggests, maybeCloseRound, sessionPlayers, workflowFor } from '@/lib/sessionServer';

interface SessionAnswerRow {
  question_id: string;
  guest_id: string;
  body: string;
  missing: boolean;
  updated_at: string;
}

interface SessionAnalyticsRow {
  question_id: string;
  summaries: unknown;
  alignment: unknown;
  agreed: unknown;
  disagreed: unknown;
  hidden_mismatches: unknown;
  assumptions: unknown;
  flags: unknown;
  confidence: unknown;
}

interface SummaryPayload {
  guest_id?: unknown;
  summary?: unknown;
}

function readSummaries(value: unknown): { guest_id: string; summary: string }[] {
  if (!Array.isArray(value)) return [];
  const items: { guest_id: string; summary: string }[] = [];
  for (const item of value) {
    if (typeof item !== 'object' || item === null) continue;
    const record = item as SummaryPayload;
    items.push({
      guest_id: typeof record.guest_id === 'string' ? record.guest_id : '',
      summary: typeof record.summary === 'string' ? record.summary : '',
    });
  }
  return items;
}

function readStringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

/** Full session state (lazy round-close on read; server clock authoritative). */
export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const guestId = guestIdOf(new URL(request.url).searchParams.get('guest_id'));

  let room;
  try {
    room = await findRoomByCode(code);
  } catch {
    return bad('Backend is not configured yet.', 503);
  }
  if (!room) return bad('Room not found.', 404);

  if (!guestId) return bad('Missing guest identity.', 401);
  const members = await getSessionMembers(room.id);
  if (!members.some((member) => member.guest_id === guestId)) return bad('You are not a member of this room.', 403);

  const closed = await maybeCloseRound(room.id);
  // maybeCloseRound may have just flipped the room — don't report stale status.
  const roomStatus = closed.closed !== null ? SESSION_STATUS.ANALYZING : room.status;

  const supabase = getServiceSupabase();
  const players = sessionPlayers(members);
  const questions = await getSessionQuestions(room.id);
  const questionIds = questions.map((question) => question.id);
  const nameOf = (id: string) => members.find((member) => member.guest_id === id)?.name ?? '';

  const { data: answerData } = questionIds.length > 0
    ? await supabase.from('session_answers').select('question_id, guest_id, body, missing, updated_at').in('question_id', questionIds)
    : { data: [] as SessionAnswerRow[] };
  const { data: analyticsData } = questionIds.length > 0
    ? await supabase.from('round_analytics').select('question_id, summaries, alignment, agreed, disagreed, hidden_mismatches, assumptions, flags, confidence').in('question_id', questionIds)
    : { data: [] as SessionAnalyticsRow[] };
  const answerRows: SessionAnswerRow[] = Array.isArray(answerData) ? answerData : [];
  const analyticsRows: SessionAnalyticsRow[] = Array.isArray(analyticsData) ? analyticsData : [];

  const nowMs = Date.now();
  const attachments = await resolveRoomAttachments(room.attachments);
  const answerList = answerRows.map((answer) => ({
    question_id: answer.question_id,
    guest_id: answer.guest_id,
    name: nameOf(answer.guest_id),
    body: answer.body,
    missing: answer.missing,
    updated_at: answer.updated_at,
  }));
  const analyticsByQuestion = new Map(analyticsRows.map((row) => [row.question_id, row]));
  const questionById = new Map(questions.map((question) => [question.id, question]));

  const active = questions.find((question) => question.status === QUESTION_STATUS.ACTIVE) ?? null;
  const activeAnswers = active ? answerList.filter((answer) => answer.question_id === active.id) : [];
  const analyticsIds = new Set([...analyticsByQuestion.keys()]);
  const suggests = await getSuggests(room.id);
  const suggestResponses = await getSuggestResponses(room.id);
  const roomSummary = await getRoomSummary(room.id);
  const workflow = workflowFor(roomStatus, questions, analyticsIds, suggests.length);
  const completedCount = questions.filter((q) => q.status === QUESTION_STATUS.CLOSED && analyticsIds.has(q.id)).length;

  return NextResponse.json({
    room: {
      code: room.code,
      name: room.name,
      topic: room.topic,
      notes: room.notes,
      status: roomStatus,
      attachments,
    },
    now: new Date(nowMs).toISOString(),
    just_closed: closed.closed,
    operator: members.find((member) => member.is_operator) ?? null,
    players: players.map((player) => ({ guest_id: player.guest_id, name: player.name, ready: player.ready })),
    current: active
      ? {
          number: active.number,
          text: active.text,
          published_at: active.published_at,
          deadline_at: active.deadline_at,
          seconds_left: active.deadline_at ? secondsLeft(active.deadline_at, nowMs) : null,
          submitted: activeAnswers.filter((answer) => !answer.missing).map((answer) => answer.guest_id),
          my_answer: guestId
            ? (activeAnswers.find((answer) => answer.guest_id === guestId) ?? null)
            : null,
        }
      : null,
    questions: questions.map((question) => ({
      number: question.number,
      text: question.text,
      status: question.status,
      deadline_at: question.deadline_at,
      has_analytics: analyticsByQuestion.has(question.id),
    })),
    answers: answerList
      .filter((answer) => {
        const question = questionById.get(answer.question_id);
        if (question?.status === QUESTION_STATUS.CLOSED) return true;
        return answer.guest_id === guestId;
      })
      .map((answer) => ({
        question: questionById.get(answer.question_id)?.number ?? null,
        guest_id: answer.guest_id,
        name: answer.name,
        body: answer.body,
        missing: answer.missing,
      })),
    analytics: [...analyticsByQuestion.values()].map((row) => {
      const question = questionById.get(row.question_id);
      return {
        question: question?.number ?? null,
        summaries: readSummaries(row.summaries).map((item) => ({ ...item, name: nameOf(item.guest_id) })),
        alignment: typeof row.alignment === 'number' ? row.alignment : null,
        agreed: readStringList(row.agreed),
        disagreed: readStringList(row.disagreed),
        hidden_mismatches: readStringList(row.hidden_mismatches),
        assumptions: readStringList(row.assumptions),
        flags: readStringList(row.flags),
        confidence: typeof row.confidence === 'string' ? row.confidence : '',
      };
    }),
    workflow,
    completed_count: completedCount,
    suggests: suggests.map((s) => ({ number: s.number, text: s.text, created_at: s.created_at })),
    suggest_responses: suggestResponses.map((r) => ({
      suggest_number: r.suggest_number,
      guest_id: r.guest_id,
      name: nameOf(r.guest_id),
      body: r.body,
      created_at: r.created_at,
    })),
    room_summary: roomSummary
      ? { available: true, summary: roomSummary.summary, created_at: roomSummary.created_at }
      : { available: false },
    final:
      roomStatus === SESSION_STATUS.COMPLETED
        ? assembleFinalReport(
            { code: room.code, name: room.name, topic: room.topic },
            questions.map((question) => {
              const row = analyticsByQuestion.get(question.id);
              return {
                number: question.number,
                text: question.text,
                answers: answerList
                  .filter((answer) => answer.question_id === question.id)
                  .map((answer) => ({
                    question: question.number,
                    guest_id: answer.guest_id,
                    name: answer.name,
                    body: answer.body,
                    missing: answer.missing,
                  })),
                analytics: row
                  ? {
                      summaries: readSummaries(row.summaries).map((item) => ({ ...item, name: nameOf(item.guest_id) })),
                      alignment: typeof row.alignment === 'number' ? row.alignment : null,
                      agreed: readStringList(row.agreed),
                      disagreed: readStringList(row.disagreed),
                    }
                  : null,
              };
            }),
          )
        : null,
  });
}
