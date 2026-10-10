export interface SessionAnalytics {
  question: number | null;
  summaries: { guest_id: string; name: string; summary: string }[];
  alignment: number | null;
  agreed: string[];
  disagreed: string[];
  hidden_mismatches: string[];
  assumptions: string[];
  flags: string[];
  confidence: string;
  published_at?: string | null | undefined;
  closes_at?: string | null | undefined;
  seconds_left?: number | null | undefined;
  question_text?: string | undefined;
}

export interface FinalRound {
  number: number;
  text: string;
  answers: { name: string; body: string; missing: boolean }[];
  analytics: { summaries: { name: string; summary: string }[]; alignment: number | null; agreed: string[]; disagreed: string[] } | null;
}

export interface FinalReport {
  questions_completed: number;
  rounds_answered: number;
  alignment_trend: (number | null)[];
  rounds: FinalRound[];
}

export function ListBlock({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="live-analysis-list">
      <strong>{title}</strong>
      <ul>
        {items.map((item, index) => (
          <li key={`${title}-${String(index)}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function AnalysisCard({ analysis }: { analysis: SessionAnalytics }) {
  return (
    <section className="live-analysis-card" aria-live="polite">
      <div className="live-card-heading">
        <div>
          <span className="live-eyebrow">Agent analysis</span>
          <h2>Round {analysis.question ?? '—'} summary</h2>
        </div>
        {analysis.alignment !== null && (
          <div className="live-alignment-score">
            <strong>{analysis.alignment}</strong>
            <span>% aligned</span>
          </div>
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
      {analysis.confidence ? (
        <p className="live-confidence">
          <strong>Confidence:</strong> {analysis.confidence}
        </p>
      ) : null}
    </section>
  );
}

export function FinalReportCard({ report }: { report: FinalReport }) {
  return (
    <section className="live-final-card" aria-labelledby="live-final-title">
      <div className="live-card-heading">
        <div>
          <span className="live-eyebrow">Final report</span>
          <h2 id="live-final-title">Session alignment journey</h2>
        </div>
        <div className="live-alignment-score">
          <strong>{report.questions_completed}</strong>
          <span>rounds</span>
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
            <p>
              {round.analytics
                ? round.analytics.summaries.map((summary) => `${summary.name}: ${summary.summary}`).join(' ') || 'No analysis available.'
                : 'No analysis available.'}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function RoomSummaryCard({ summary }: { summary: Record<string, unknown> }) {
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
