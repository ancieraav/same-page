type ComparisonResponsesListProps = {
  visibleIds: string[];
  expanded: Set<number>;
  onToggle: (index: number) => void;
};

export function ComparisonResponsesList({
  visibleIds,
  expanded,
  onToggle,
}: ComparisonResponsesListProps) {
  return (
    <div className="team-list-stack" id="team-list-stack">
      <article className="team-member-card is-self" style={{ display: visibleIds.includes('you') ? undefined : 'none' }}>
        <div className="team-card-profile-col">
          <div className="room-avatar-circle avatar-color-indigo">
            <span>A</span>
          </div>
          <div className="team-member-info">
            <span className="team-member-name">Anugrah (You)</span>
            <span className="team-member-role">Lead Product Strategist</span>
          </div>
          <div className="team-card-score-pill tone-indigo">
            <span>84% Match</span>
          </div>
        </div>
        <div className="team-card-statement-col">
          <div className="statement-expandable-wrap">
            <div className="statement-preview-text">
              <p>
                Our single highest-leverage priority must be{' '}
                <strong>locking the core checkout retention loop</strong> before scaling ad spend.
              </p>
            </div>
            <div className={`statement-extended-text${expanded.has(0) ? ' is-open' : ''}`}>
              <p>
                We are explicitly deprioritizing ancillary redesign features, custom analytics dashboards, and non-essential UI churn until database latency stabilizes below 120ms.
              </p>
            </div>
            <button
              type="button"
              className={`btn-read-more-statement${expanded.has(0) ? ' is-expanded' : ''}`}
              aria-expanded={expanded.has(0)}
              title="Toggle full response"
              onClick={() => onToggle(0)}
            >
              <span>{expanded.has(0) ? 'Show less' : 'Read more'}</span>
              <svg className="chevron-mini" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        </div>
      </article>

      <article className="team-member-card" style={{ display: visibleIds.includes('raka') ? undefined : 'none' }}>
        <div className="team-card-profile-col">
          <div className="room-avatar-circle avatar-color-amber">
            <span>RP</span>
          </div>
          <div className="team-member-info">
            <span className="team-member-name">Raka Pratama</span>
            <span className="team-member-role">Engineering Lead</span>
          </div>
          <div className="team-card-score-pill tone-positive">
            <span>78% Match</span>
          </div>
        </div>
        <div className="team-card-statement-col">
          <div className="statement-expandable-wrap">
            <div className="statement-preview-text">
              <p>
                Primary focus is <strong>database replication pooling and Redis eviction policies</strong> to survive flash traffic spikes.
              </p>
            </div>
            <div className={`statement-extended-text${expanded.has(1) ? ' is-open' : ''}`}>
              <p>
                We cannot afford server crashes on checkout while running multi-variant marketing promos.
              </p>
            </div>
            <button
              type="button"
              className={`btn-read-more-statement${expanded.has(1) ? ' is-expanded' : ''}`}
              aria-expanded={expanded.has(1)}
              title="Toggle full response"
              onClick={() => onToggle(1)}
            >
              <span>{expanded.has(1) ? 'Show less' : 'Read more'}</span>
              <svg className="chevron-mini" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        </div>
      </article>

      <article className="team-member-card" style={{ display: visibleIds.includes('elena') ? undefined : 'none' }}>
        <div className="team-card-profile-col">
          <div className="room-avatar-circle avatar-color-emerald">
            <span>ER</span>
          </div>
          <div className="team-member-info">
            <span className="team-member-name">Elena Rostova</span>
            <span className="team-member-role">Design Lead</span>
          </div>
          <div className="team-card-score-pill tone-positive">
            <span>88% Match</span>
          </div>
        </div>
        <div className="team-card-statement-col">
          <div className="statement-expandable-wrap">
            <div className="statement-preview-text">
              <p>
                Priority is <strong>streamlining the checkout input form validation</strong> so users don&apos;t abandon when card details error out.
              </p>
            </div>
            <div className={`statement-extended-text${expanded.has(2) ? ' is-open' : ''}`}>
              <p>
                Deprioritizing marketing landing page revamps and micro-interactions for now so the checkout funnel has zero visual distraction.
              </p>
            </div>
            <button
              type="button"
              className={`btn-read-more-statement${expanded.has(2) ? ' is-expanded' : ''}`}
              aria-expanded={expanded.has(2)}
              title="Toggle full response"
              onClick={() => onToggle(2)}
            >
              <span>{expanded.has(2) ? 'Show less' : 'Read more'}</span>
              <svg className="chevron-mini" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        </div>
      </article>

      <article className="team-member-card" style={{ display: visibleIds.includes('david') ? undefined : 'none' }}>
        <div className="team-card-profile-col">
          <div className="room-avatar-circle avatar-color-cyan">
            <span>DC</span>
          </div>
          <div className="team-member-info">
            <span className="team-member-name">David Chen</span>
            <span className="team-member-role">Ops · Finance</span>
          </div>
          <div className="team-card-score-pill tone-moderate">
            <span>73% Match</span>
          </div>
        </div>
        <div className="team-card-statement-col">
          <div className="statement-expandable-wrap">
            <div className="statement-preview-text">
              <p>
                Commitment must be to <strong>automated fraud scoring before payment gateway settlement</strong> to stem chargeback velocity.
              </p>
            </div>
            <div className={`statement-extended-text${expanded.has(3) ? ' is-open' : ''}`}>
              <p>
                Deprioritizing international multi-currency settlement till domestic gross merchandise value hits stable projections.
              </p>
            </div>
            <button
              type="button"
              className={`btn-read-more-statement${expanded.has(3) ? ' is-expanded' : ''}`}
              aria-expanded={expanded.has(3)}
              title="Toggle full response"
              onClick={() => onToggle(3)}
            >
              <span>{expanded.has(3) ? 'Show less' : 'Read more'}</span>
              <svg className="chevron-mini" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        </div>
      </article>

      <article className="team-member-card" style={{ display: visibleIds.includes('sarah') ? undefined : 'none' }}>
        <div className="team-card-profile-col">
          <div className="room-avatar-circle avatar-color-rose">
            <span>SJ</span>
          </div>
          <div className="team-member-info">
            <span className="team-member-name">Sarah Jenkins</span>
            <span className="team-member-role">Growth · Marketing</span>
          </div>
          <div className="team-card-score-pill tone-divided">
            <span>69% Match</span>
          </div>
        </div>
        <div className="team-card-statement-col">
          <div className="statement-expandable-wrap">
            <div className="statement-preview-text">
              <p>
                Need <strong>immediate referral share mechanics directly on payment completion</strong> to maintain user acquisition momentum.
              </p>
            </div>
            <div className={`statement-extended-text${expanded.has(4) ? ' is-open' : ''}`}>
              <p>
                We can deprioritize internal merchant reporting portals in order to maximize customer-facing virality this month.
              </p>
            </div>
            <button
              type="button"
              className={`btn-read-more-statement${expanded.has(4) ? ' is-expanded' : ''}`}
              aria-expanded={expanded.has(4)}
              title="Toggle full response"
              onClick={() => onToggle(4)}
            >
              <span>{expanded.has(4) ? 'Show less' : 'Read more'}</span>
              <svg className="chevron-mini" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
