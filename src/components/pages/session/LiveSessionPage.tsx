'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from '@/components/ui/ToastProvider';
import { getGuestId } from '@/lib/guest';
import { secondsLeft } from '@/lib/session';
import { sessionGet, sessionPost } from '@/lib/sessionClient';
import { useSessionWebMCP } from '@/components/pages/waiting/useSessionWebMCP';
import { SessionHeader } from './SessionHeader';

interface CurrentQuestion {
  number: number;
  text: string;
  deadline_at: string | null;
  seconds_left: number | null;
  submitted: string[];
  my_answer: { body?: string; missing?: boolean } | null;
}

interface SessionAnalytics {
  question: number | null;
  summaries: { guest_id: string; name: string; summary: string }[];
  alignment: number | null;
  agreed: string[];
  disagreed: string[];
  hidden_mismatches: string[];
  assumptions: string[];
  flags: string[];
  confidence: string;
}

interface FinalRound {
  number: number;
  text: string;
  answers: { name: string; body: string; missing: boolean }[];
  analytics: { summaries: { name: string; summary: string }[]; alignment: number | null; agreed: string[]; disagreed: string[] } | null;
}

interface FinalReport {
  questions_completed: number;
  rounds_answered: number;
  alignment_trend: (number | null)[];
  rounds: FinalRound[];
}

interface SuggestItem {
  number: number;
  text: string;
  created_at?: string;
}

interface SessionState {
  room: { code: string; name: string; topic: string; notes?: string; status: string };
  operator: { guest_id: string; name: string } | null;
  players: { guest_id: string; name: string }[];
  current: CurrentQuestion | null;
  questions: { number: number; status: string; has_analytics: boolean }[];
  analytics: SessionAnalytics[];
  final: FinalReport | null;
  completed_count?: number;
  suggests?: SuggestItem[];
  suggest_responses?: { suggest_number: number; guest_id: string; name: string; body: string }[];
  room_summary?: { available: boolean; summary?: Record<string, unknown> };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Could not load the session.';
}

function clockLabel(seconds: number | null): string {
  if (seconds === null) return '--:--';
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="live-analysis-list">
      <strong>{title}</strong>
      <ul>{items.map((item, index) => <li key={`${title}-${String(index)}`}>{item}</li>)}</ul>
    </div>
  );
}

function AnalysisCard({ analysis }: { analysis: SessionAnalytics }) {
  return (
    <section className="live-analysis-card" aria-live="polite">
      <div className="live-card-heading">
        <div>
          <span className="live-eyebrow">Agent analysis</span>
          <h2>Round {analysis.question ?? '—'} summary</h2>
        </div>
        {analysis.alignment !== null && (
          <div className="live-alignment-score"><strong>{analysis.alignment}</strong><span>% aligned</span></div>
        )}
      </div>
      <div className="live-player-summaries">
        {analysis.summaries.map((summary) => (
          <article key={summary.guest_id}>
            <strong>{summary.name || 'Participant'}</strong>
            <p>{summary.summary}</p>
          </article>
        ))}
      </div>
      <div className="live-analysis-columns">
        <ListBlock title="Agreed" items={analysis.agreed} />
        <ListBlock title="Different" items={analysis.disagreed} />
        <ListBlock title="Hidden mismatch" items={analysis.hidden_mismatches} />
        <ListBlock title="Shared assumptions" items={analysis.assumptions} />
      </div>
      {analysis.confidence ? <p className="live-confidence"><strong>Confidence:</strong> {analysis.confidence}</p> : null}
    </section>
  );
}

function FinalReportCard({ report }: { report: FinalReport }) {
  return (
    <section className="live-final-card" aria-labelledby="live-final-title">
      <div className="live-card-heading">
        <div>
          <span className="live-eyebrow">Final report</span>
          <h2 id="live-final-title">Session alignment journey</h2>
        </div>
        <div className="live-alignment-score">
          <strong>{report.questions_completed}</strong><span>rounds</span>
        </div>
      </div>
      <p className="live-final-trend">
        Alignment trend: {report.alignment_trend.filter((item): item is number => item !== null).join(' → ') || 'not available'}
      </p>
      <div className="live-final-rounds">
        {report.rounds.map((round) => (
          <article key={round.number}>
            <div className="live-final-round-heading">
              <strong>Q{round.number}</strong>
              {round.analytics && round.analytics.alignment !== null ? <span>{round.analytics.alignment}% aligned</span> : null}
            </div>
            <p>{round.analytics ? round.analytics.summaries.map((summary) => `${summary.name}: ${summary.summary}`).join(' ') || 'No analysis available.' : 'No analysis available.'}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function RoomSummaryCard({ summary }: { summary: Record<string, unknown> }) {
  const list = (key: string): string[] => (Array.isArray(summary[key]) ? (summary[key] as string[]) : []);
  return (
    <section className="live-final-card" aria-labelledby="live-room-summary-title">
      <div className="live-card-heading">
        <div>
          <span className="live-eyebrow">Room summary</span>
          <h2 id="live-room-summary-title">Final alignment</h2>
        </div>
      </div>
      <div className="live-analysis-columns">
        <ListBlock title="Agreements" items={list('agreements')} />
        <ListBlock title="Disagreements" items={list('disagreements')} />
        <ListBlock title="Open points" items={list('open_points')} />
      </div>
    </section>
  );
}

function SessionOperatorTools({ code, guestId }: { code: string; guestId: string }) {
  useSessionWebMCP({ getCode: () => code, getGuestId: () => guestId, isOperator: () => true, phase: 'session', watchKey: 'session' });
  return null;
}

/** Real participant session view backed by the server session state. */
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

  const load = useCallback(async () => {
    try {
      const next = (await sessionGet(code, selfId)) as SessionState;
      setSnapshot(next);
      setError('');
      const nextNumber = next.current?.number ?? null;
      if (nextNumber !== questionRef.current) {
        questionRef.current = nextNumber;
        draftDirtyRef.current = false;
        setDraft(next.current?.my_answer?.body ?? '');
      } else if (!draftDirtyRef.current && next.current?.my_answer) {
        setDraft(next.current.my_answer.body ?? '');
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

  const active = snapshot?.current ?? null;
  const remaining = active?.deadline_at ? secondsLeft(active.deadline_at, clock) : active?.seconds_left ?? null;
  const isOperatorView = snapshot?.operator?.guest_id === selfId;
  const canAnswer = Boolean(active && remaining !== null && remaining > 0 && !busy && !isOperatorView);

  const submit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!active || !draft.trim() || !canAnswer) {
      if (!draft.trim()) showToast('Please write your response first.', 'error');
      return;
    }
    setBusy(true);
    try {
      await sessionPost(code, 'answers', { guest_id: selfId, number: active.number, body: draft });
      draftDirtyRef.current = false;
      await load();
      showToast('Response saved');
    } catch (submitError) {
      showToast(errorMessage(submitError), 'error');
    } finally {
      setBusy(false);
    }
  };

  const latestAnalysis = snapshot?.analytics.at(-1) ?? null;
  const isOperator = isOperatorView;
  const status = snapshot?.room.status ?? 'waiting';
  const alignmentTrend = snapshot?.final?.alignment_trend.filter((item): item is number => item !== null) ?? [];
  const alignmentTrendLabel = alignmentTrend.length > 0 ? alignmentTrend.join(' → ') : 'not available';
  const latestSuggest = snapshot?.suggests?.at(-1) ?? null;
  const mySuggestResponse = latestSuggest
    ? snapshot?.suggest_responses?.find((r) => r.suggest_number === latestSuggest.number && r.guest_id === selfId) ?? null
    : null;

  const submitSuggest = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
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
    <div className="live-session-page">
      <SessionHeader timer={clockLabel(remaining)} />
      <main className="live-session-shell" id="live-session-shell">
        {loading && !snapshot ? <div className="live-state-card">Loading session…</div> : null}
        {error && !snapshot ? <div className="live-state-card live-state-error" role="alert">{error}</div> : null}
        {snapshot ? (
          <>
            <header className="live-session-heading">
              <span className={`live-status-pill is-${status}`}>{status === 'answering' ? 'Live session' : status}</span>
              <h1>{snapshot.room.name}</h1>
              <p>{snapshot.room.topic || 'Alignment session'} <span aria-hidden="true">·</span> {snapshot.players.length} participants</p>
            </header>

            {status === 'completed' && snapshot.final ? <FinalReportCard report={snapshot.final} /> : null}
            {status === 'completed' && snapshot.room_summary?.available && snapshot.room_summary.summary
              ? <RoomSummaryCard summary={snapshot.room_summary.summary} />
              : null}
            {latestAnalysis && status !== 'waiting' && status !== 'completed' ? <AnalysisCard analysis={latestAnalysis} /> : null}

            {latestSuggest && status !== 'completed' && status !== 'waiting' ? (
              <section className="live-question-card" aria-labelledby="live-suggest-title">
                <div className="live-question-meta">
                  <span>Suggest question {latestSuggest.number}</span>
                  <span>{mySuggestResponse ? 'answered' : 'awaiting your input'}</span>
                </div>
                <h2 id="live-suggest-title">{latestSuggest.text}</h2>
                <form onSubmit={(event) => { void submitSuggest(event); }}>
                  <textarea
                    id="participant-suggest-input"
                    aria-label="Write your suggestion"
                    placeholder="Any suggested follow-up question?"
                    value={mySuggestResponse?.body ?? suggestDraft}
                    disabled={Boolean(mySuggestResponse) || suggestBusy}
                    onChange={(event) => { setSuggestDraft(event.target.value); }}
                  />
                  <div className="live-question-footer">
                    <span>Suggestion for the agent</span>
                    <button type="submit" disabled={Boolean(mySuggestResponse) || suggestBusy || !suggestDraft.trim()}>
                      {suggestBusy ? 'Sending…' : mySuggestResponse ? 'Sent' : 'Send Suggestion'} <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </form>
              </section>
            ) : null}

            {active ? (
              <section className="live-question-card" aria-labelledby="live-question-title">
                <div className="live-question-meta">
                  <span>Question {active.number}</span>
                  <span>{active.submitted.length} of {snapshot.players.length} answered</span>
                </div>
                <h2 id="live-question-title">{active.text}</h2>
                {isOperator ? (
                  <p className="live-operator-note" role="status">
                    Operator view — {active.submitted.length} of {snapshot.players.length} answered.
                    Participants answer from their own tabs; you cannot submit answers.
                  </p>
                ) : (
                <form onSubmit={(event) => { void submit(event); }}>
                  <textarea
                    id="participant-answer-input"
                    aria-label="Write your response"
                    placeholder="Write your honest perspective here..."
                    value={draft}
                    disabled={!canAnswer}
                    onChange={(event) => {
                      draftDirtyRef.current = true;
                      setDraft(event.target.value);
                    }}
                  />
                  <div className="live-question-footer">
                    <span className={remaining !== null && remaining < 30 ? 'is-urgent' : ''}>
                      {remaining === 0 ? 'Round closing…' : `${clockLabel(remaining)} remaining`}
                    </span>
                    <button type="submit" disabled={!canAnswer || !draft.trim()}>
                      {busy ? 'Saving…' : active.my_answer ? 'Update Response' : 'Submit Response'} <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </form>
                )}
              </section>
            ) : (
              <section className="live-state-card" aria-live="polite">
                {status === 'waiting' ? <><h2>Waiting for the session to start</h2><p>The agent will publish the first question when everyone is ready.</p></> : null}
                {status === 'answering' ? <><h2>Agent is preparing the next question</h2><p>Your saved answers are safe. The next round will appear here automatically.</p></> : null}
                {status === 'analyzing' ? <><h2>Agent is analyzing the round</h2><p>The next question will appear after the analysis is published.</p></> : null}
                {status === 'finalization' ? <><h2>Session is being finalized</h2><p>The agent is writing the final room summary.</p></> : null}
                {status === 'completed' ? <><h2>Session complete</h2><p>The final report is ready. Alignment trend: {alignmentTrendLabel}.</p></> : null}
              </section>
            )}

            {error ? <p className="live-inline-error" role="status">{error}</p> : null}
          </>
        ) : null}
      </main>
      {snapshot && isOperator ? <SessionOperatorTools code={code} guestId={selfId} /> : null}
    </div>
  );
}
