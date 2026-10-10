'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from '@/components/ui/ToastProvider';
import { getGuestId } from '@/lib/guest';
import { durationLabel, secondsElapsed, secondsLeft } from '@/lib/session';
import { sessionGet, sessionPost } from '@/lib/sessionClient';
import { getBrowserSupabase } from '@/lib/supabaseBrowser';
import { SessionHeader } from './SessionHeader';
import { SessionWebMCPBridge } from './SessionWebMCPBridge';
import { SessionQuestionStage } from './SessionQuestionStage';
import { SessionQuestionTransition } from './SessionQuestionTransition';
import { LiveQuestionSummaryStage } from './LiveQuestionSummaryStage';
import {
  FinalReportCard,
  RoomSummaryCard,
  type FinalReport,
  type SessionAnalytics,
} from './SessionAnalysisCards';

interface CurrentQuestion {
  number: number;
  text: string;
  deadline_at: string | null;
  seconds_left: number | null;
  submitted: string[];
  my_answer: { body?: string; missing?: boolean } | null;
}

interface SuggestItem {
  number: number;
  text: string;
  created_at?: string;
  deadline_at?: string | null;
  seconds_left?: number | null;
}

interface SessionState {
  room: {
    code: string;
    name: string;
    topic: string;
    notes?: string;
    status: string;
    timer_started_at?: string | null;
    timer_ended_at?: string | null;
  };
  operator: { guest_id: string; name: string } | null;
  players: { guest_id: string; name: string; avatar_url?: string | null }[];
  current: CurrentQuestion | null;
  questions: { number: number; status: string; has_analytics: boolean }[];
  analytics: SessionAnalytics[];
  final: FinalReport | null;
  completed_count?: number;
  suggests?: SuggestItem[];
  suggest_responses?: { suggest_number: number; guest_id: string; name: string; body: string }[];
  room_summary?: { available: boolean; summary?: Record<string, unknown>; created_at?: string };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Could not load the session.';
}

function clockLabel(seconds: number | null): string {
  return durationLabel(seconds);
}

/** Real participant and operator session view backed by server state and Supabase realtime. */
export function LiveSessionPage({ code }: { code: string }) {
  const { showToast } = useToast();
  const [selfId] = useState(() => getGuestId());
  const [snapshot, setSnapshot] = useState<SessionState | null>(null);
  const [draft, setDraft] = useState('');
  const [suggestDraft, setSuggestDraft] = useState('');
  const [suggestBusy, setSuggestBusy] = useState(false);
  const [clock, setClock] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const questionRef = useRef<number | null>(null);
  const draftDirtyRef = useRef(false);
  const draftRef = useRef('');

  const load = useCallback(async () => {
    try {
      const next = (await sessionGet(code, selfId)) as SessionState;
      setSnapshot(next);
      setError('');
      const nextNumber = next.current?.number ?? null;
      if (nextNumber !== questionRef.current) {
        questionRef.current = nextNumber;
        draftDirtyRef.current = false;
        const nextDraft = next.current?.my_answer?.body ?? '';
        draftRef.current = nextDraft;
        setDraft(nextDraft);
      } else if (!draftDirtyRef.current && next.current?.my_answer) {
        const nextDraft = next.current.my_answer.body ?? '';
        draftRef.current = nextDraft;
        setDraft(nextDraft);
      }
    } catch (loadError) {
      setError(errorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [code, selfId]);

  useEffect(() => {
    window.queueMicrotask(() => { void load(); });
    const poll = window.setInterval(() => { void load(); }, 2000);
    const ticker = window.setInterval(() => { setClock(Date.now()); }, 1000);
    return () => {
      window.clearInterval(poll);
      window.clearInterval(ticker);
    };
  }, [load]);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase || !code) return;
    const channel = supabase.channel(`session:${code}`, {
      config: { broadcast: { self: false } },
    });
    channel
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `code=eq.${code}` }, () => {
        void load();
      })
      .on('broadcast', { event: 'answer_submitted' }, () => {
        void load();
      })
      .on('broadcast', { event: 'session_update' }, () => {
        void load();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [code, load]);

  const active = snapshot?.current ?? null;
  const remaining = active?.deadline_at ? secondsLeft(active.deadline_at, clock) : active?.seconds_left ?? null;
  const isOperator = snapshot?.operator?.guest_id === selfId;
  const isRoundClosed = remaining !== null && remaining <= 0;
  const canAnswer = Boolean(active && remaining !== null && remaining > 0 && !busy && !isOperator);

  const expiredRef = useRef<number | null>(null);
  useEffect(() => {
    if (active && remaining !== null && remaining <= 0 && expiredRef.current !== active.number) {
      expiredRef.current = active.number;
      void load();
    }
  }, [active, remaining, load]);

  const setAnswerDraft = useCallback((value: string) => {
    draftDirtyRef.current = true;
    draftRef.current = value;
    setDraft(value);
  }, []);

  const submitAnswer = useCallback(async (): Promise<{ question: number; saved: true }> => {
    if (!active || !draftRef.current.trim() || !canAnswer) {
      if (!draftRef.current.trim()) throw new Error('Please write your response first.');
      throw new Error('This response can no longer be submitted.');
    }
    setBusy(true);
    try {
      await sessionPost(code, 'answers', { guest_id: selfId, number: active.number, body: draftRef.current });
      draftDirtyRef.current = false;
      await load();

      const supabase = getBrowserSupabase();
      if (supabase) {
        const channel = supabase.channel(`session:${code}`);
        void channel.send({
          type: 'broadcast',
          event: 'answer_submitted',
          payload: { guest_id: selfId, number: active.number },
        });
      }

      return { question: active.number, saved: true };
    } finally {
      setBusy(false);
    }
  }, [active, canAnswer, code, load, selfId]);

  const submitQuestion = useCallback(async () => {
    try {
      await submitAnswer();
      showToast('Response saved');
    } catch (submitError) {
      showToast(errorMessage(submitError), 'error');
    }
  }, [showToast, submitAnswer]);

  const latestAnalysis = snapshot?.analytics.at(-1) ?? null;
  const summaryClosesAt = latestAnalysis?.closes_at ? new Date(latestAnalysis.closes_at).getTime() : null;
  const summarySecondsLeft = summaryClosesAt ? Math.max(0, Math.ceil((summaryClosesAt - clock) / 1000)) : null;
  const isShowingSummary = Boolean(
    latestAnalysis &&
    !active &&
    (summarySecondsLeft === null || summarySecondsLeft > 0) &&
    snapshot?.room.status !== 'completed' &&
    snapshot?.room.status !== 'waiting'
  );
  const status = snapshot?.room.status ?? 'waiting';
  const roomTimer = durationLabel(secondsElapsed(snapshot?.room.timer_started_at, snapshot?.room.timer_ended_at, clock));
  const deadlineTimer = active?.deadline_at ? clockLabel(remaining) : null;
  const latestSuggest = snapshot?.suggests?.at(-1) ?? null;
  const suggestRemaining = latestSuggest?.deadline_at ? secondsLeft(latestSuggest.deadline_at, clock) : null;
  const isSuggestActive = Boolean(latestSuggest && !active && !isShowingSummary && status !== 'completed' && status !== 'waiting');
  const mySuggestResponse = latestSuggest
    ? snapshot?.suggest_responses?.find((r) => r.suggest_number === latestSuggest.number && r.guest_id === selfId) ?? null
    : null;

  const headerDeadline = active
    ? deadlineTimer
    : isShowingSummary && summarySecondsLeft !== null
    ? clockLabel(summarySecondsLeft)
    : isSuggestActive && suggestRemaining !== null
    ? clockLabel(suggestRemaining)
    : null;
  const headerDeadlineLabel = isShowingSummary ? 'Summary' : 'Deadline';

  const submitSuggest = async () => {
    if (!latestSuggest || !suggestDraft.trim() || suggestBusy) return;
    setSuggestBusy(true);
    try {
      await sessionPost(code, 'suggest/responses', { guest_id: selfId, suggest_number: latestSuggest.number, body: suggestDraft });
      setSuggestDraft('');
      await load();
      showToast('Suggestion sent');
    } catch (submitError) {
      showToast(errorMessage(submitError), 'error');
    } finally {
      setSuggestBusy(false);
    }
  };

  return (
    <div className={`page-root viewport-fit-page session-body${isShowingSummary ? ' comparison-body' : ''}`}>
      <SessionHeader
        roomTimer={roomTimer}
        deadlineTimer={headerDeadline}
        deadlineLabel={headerDeadlineLabel}
        participantCount={snapshot?.players.length ?? 0}
      />
      {isShowingSummary && latestAnalysis && snapshot ? (
        <LiveQuestionSummaryStage
          analysis={latestAnalysis}
          snapshot={snapshot}
          selfId={selfId}
          secondsLeft={summarySecondsLeft}
        />
      ) : (
        <main className="session-canvas-wrapper" id="session-canvas-wrapper">
          {loading && !snapshot ? <div className="live-state-card">Loading session…</div> : null}
          {error && !snapshot ? <div className="live-state-card live-state-error" role="alert">{error}</div> : null}
          {snapshot ? (
            <>
              {!active && !isShowingSummary && !isSuggestActive && (
                <header className="live-session-heading">
                  <span className={`live-status-pill is-${status}`}>{status === 'answering' ? 'Live session' : status}</span>
                  <h1>{snapshot.room.name}</h1>
                  <p>{snapshot.room.topic || 'Alignment session'} <span aria-hidden="true">·</span> {snapshot.players.length} participants</p>
                </header>
              )}

              {status === 'completed' && snapshot.final ? <FinalReportCard report={snapshot.final} /> : null}
              {status === 'completed' && snapshot.room_summary?.available && snapshot.room_summary.summary
                ? <RoomSummaryCard summary={snapshot.room_summary.summary} />
                : null}

              {isSuggestActive && latestSuggest ? (
                <SessionQuestionStage
                  questionNumber={latestSuggest.number}
                  questionText={latestSuggest.text}
                  answer={isOperator ? '' : (mySuggestResponse?.body ?? suggestDraft)}
                  operator={isOperator}
                  disabled={isOperator ? false : Boolean(mySuggestResponse)}
                  busy={suggestBusy}
                  submittedCount={snapshot.suggest_responses?.filter((r) => r.suggest_number === latestSuggest.number).length ?? 0}
                  participantCount={snapshot.players.length}
                  players={snapshot.players}
                  submittedIds={snapshot.suggest_responses?.filter((r) => r.suggest_number === latestSuggest.number).map((r) => r.guest_id) ?? []}
                  selfId={selfId}
                  badgeLabel="Milestone Suggestion & Continuation"
                  subPrompt="Weigh in on whether to stop or continue the session, and add/weight any suggested questions."
                  placeholder="Do you want to wrap up or continue? Suggest or weigh in on the next questions..."
                  submitLabel="Send Suggestion"
                  onAnswerChange={setSuggestDraft}
                  onSubmit={submitSuggest}
                />
              ) : null}

              {active ? (
                <SessionQuestionStage
                  questionNumber={active.number}
                  questionText={active.text}
                  answer={isOperator ? '' : draft}
                  operator={isOperator}
                  disabled={isOperator ? isRoundClosed : !canAnswer}
                  busy={busy}
                  submittedCount={active.submitted.length}
                  participantCount={snapshot.players.length}
                  players={snapshot.players}
                  submittedIds={active.submitted}
                  selfId={selfId}
                  onAnswerChange={setAnswerDraft}
                  onSubmit={submitQuestion}
                />
              ) : !isSuggestActive && status !== 'completed' ? (
                <section className="live-state-card" aria-live="polite">
                  {status === 'waiting' ? <><h2>Waiting for the session to start</h2><p>The agent will publish the first question when everyone is ready.</p></> : null}
                  {status === 'answering' ? <><h2>Agent is preparing the next question</h2><p>Your saved answers are safe. The next round will appear here automatically.</p></> : null}
                  {status === 'analyzing' ? <><h2>Agent is analyzing the round</h2><p>The next question will appear after the analysis is published.</p></> : null}
                  {status === 'finalization' ? <><h2>Session is being finalized</h2><p>The agent is writing the final room summary.</p></> : null}
                </section>
              ) : null}

              {error ? <p className="live-inline-error" role="status">{error}</p> : null}
            </>
          ) : null}
        </main>
      )}
      {snapshot ? (
        <SessionQuestionTransition
          status={status}
          hasActiveQuestion={active !== null}
          hasSummary={isShowingSummary}
        />
      ) : null}
      {snapshot ? (
        <SessionWebMCPBridge
          code={code}
          guestId={selfId}
          isOperator={isOperator}
          status={status}
          activeNumber={active?.number ?? null}
          getAnswerDraft={() => draftRef.current}
          setAnswerDraft={setAnswerDraft}
          submitAnswer={submitAnswer}
        />
      ) : null}
    </div>
  );
}
