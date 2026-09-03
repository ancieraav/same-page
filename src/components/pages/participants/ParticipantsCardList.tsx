type ParticipantsCardListProps = {
  visibleIds: string[];
  expanded: Set<number>;
  onToggle: (index: number) => void;
  onOpen: (id: string) => void;
};

export function ParticipantsCardList({
  visibleIds,
  expanded,
  onToggle,
  onOpen,
}: ParticipantsCardListProps) {
  return (
    <div className="team-list-stack" id="team-list-stack">
      <article
        className="team-member-card is-clickable"
        data-participant-id="elena"
        tabIndex={0}
        role="button"
        aria-label="View Elena Rostova analytics"
        style={{ display: visibleIds.includes('elena') ? undefined : 'none' }}
        onClick={() => onOpen('elena')}
      >
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
                Priority is <strong>eliminating micro-friction in checkout typography</strong>, input masking, and form error validation states.
              </p>
            </div>
            <div className={`statement-extended-text${expanded.has(0) ? ' is-open' : ''}`}>
              <p>
                Deprioritizing marketing landing page revamps and micro-interactions for now so the checkout funnel has zero visual distraction.
              </p>
            </div>
            <button
              type="button"
              className={`btn-read-more-statement${expanded.has(0) ? ' is-expanded' : ''}`}
              aria-expanded={expanded.has(0)}
              title="Toggle full response"
              onClick={(event) => {
                event.stopPropagation();
                onToggle(0);
              }}
            >
              <span>{expanded.has(0) ? 'Show less' : 'Read more'}</span>
              <svg className="chevron-mini" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        </div>
      </article>

      <article
        className="team-member-card is-self is-clickable"
        data-participant-id="you"
        tabIndex={0}
        role="button"
        aria-label="View your analytics"
        style={{ display: visibleIds.includes('you') ? undefined : 'none' }}
        onClick={() => onOpen('you')}
      >
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
                Our single highest-leverage priority must be <strong>locking the core checkout retention loop</strong> before scaling ad spend.
              </p>
            </div>
            <div className={`statement-extended-text${expanded.has(1) ? ' is-open' : ''}`}>
              <p>
                Explicitly deprioritizing ancillary redesign features, custom analytics dashboards, and non-essential UI churn until database latency stabilizes below 120ms.
              </p>
            </div>
            <button
              type="button"
              className={`btn-read-more-statement${expanded.has(1) ? ' is-expanded' : ''}`}
              aria-expanded={expanded.has(1)}
              title="Toggle full response"
              onClick={(event) => {
                event.stopPropagation();
                onToggle(1);
              }}
            >
              <span>{expanded.has(1) ? 'Show less' : 'Read more'}</span>
              <svg className="chevron-mini" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        </div>
      </article>

      <article
        className="team-member-card is-clickable"
        data-participant-id="raka"
        tabIndex={0}
        role="button"
        aria-label="View Raka Pratama analytics"
        style={{ display: visibleIds.includes('raka') ? undefined : 'none' }}
        onClick={() => onOpen('raka')}
      >
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
                I agree that <strong>checkout reliability and database indexing</strong> take 100% precedence for our upcoming production release.
              </p>
            </div>
            <div className={`statement-extended-text${expanded.has(2) ? ' is-open' : ''}`}>
              <p>
                Completely deprioritizing new third-party marketing integrations and localized payment gateways until infrastructure stress tests pass under 5,000 req/sec.
              </p>
            </div>
            <button
              type="button"
              className={`btn-read-more-statement${expanded.has(2) ? ' is-expanded' : ''}`}
              aria-expanded={expanded.has(2)}
              title="Toggle full response"
              onClick={(event) => {
                event.stopPropagation();
                onToggle(2);
              }}
            >
              <span>{expanded.has(2) ? 'Show less' : 'Read more'}</span>
              <svg className="chevron-mini" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        </div>
      </article>

      <article
        className="team-member-card is-clickable"
        data-participant-id="david"
        tabIndex={0}
        role="button"
        aria-label="View David Chen analytics"
        style={{ display: visibleIds.includes('david') ? undefined : 'none' }}
        onClick={() => onOpen('david')}
      >
        <div className="team-card-profile-col">
          <div className="room-avatar-circle avatar-color-rose">
            <span>DC</span>
          </div>
          <div className="team-member-info">
            <span className="team-member-name">David Chen</span>
            <span className="team-member-role">Ops &bull; Finance</span>
          </div>
          <div className="team-card-score-pill tone-neutral">
            <span>73% Match</span>
          </div>
        </div>
        <div className="team-card-statement-col">
          <div className="statement-expandable-wrap">
            <div className="statement-preview-text">
              <p>
                Protecting <strong>unit margin and refund reconciliation</strong> is top operational priority for financial health.
              </p>
            </div>
            <div className={`statement-extended-text${expanded.has(3) ? ' is-open' : ''}`}>
              <p>
                Agreeing to deprioritize custom enterprise invoicing and multi-currency billing until checkout payment webhooks achieve 99.99% automated reconciliation.
              </p>
            </div>
            <button
              type="button"
              className={`btn-read-more-statement${expanded.has(3) ? ' is-expanded' : ''}`}
              aria-expanded={expanded.has(3)}
              title="Toggle full response"
              onClick={(event) => {
                event.stopPropagation();
                onToggle(3);
              }}
            >
              <span>{expanded.has(3) ? 'Show less' : 'Read more'}</span>
              <svg className="chevron-mini" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        </div>
      </article>

      <article
        className="team-member-card is-clickable"
        data-participant-id="sarah"
        tabIndex={0}
        role="button"
        aria-label="View Sarah Jenkins analytics"
        style={{ display: visibleIds.includes('sarah') ? undefined : 'none' }}
        onClick={() => onOpen('sarah')}
      >
        <div className="team-card-profile-col">
          <div className="room-avatar-circle avatar-color-cyan">
            <span>SJ</span>
          </div>
          <div className="team-member-info">
            <span className="team-member-name">Sarah Jenkins</span>
            <span className="team-member-role">Growth &bull; Marketing</span>
          </div>
          <div className="team-card-score-pill tone-neutral">
            <span>69% Match</span>
          </div>
        </div>
        <div className="team-card-statement-col">
          <div className="statement-expandable-wrap">
            <div className="statement-preview-text">
              <p>
                We need <strong>frictionless conversion from paid campaigns</strong> to ensure our acquisition budget is not leaking users.
              </p>
            </div>
            <div className={`statement-extended-text${expanded.has(4) ? ' is-open' : ''}`}>
              <p>
                Pausing viral referral invite popups to ensure core checkout payment conversion rates stay robust.
              </p>
            </div>
            <button
              type="button"
              className={`btn-read-more-statement${expanded.has(4) ? ' is-expanded' : ''}`}
              aria-expanded={expanded.has(4)}
              title="Toggle full response"
              onClick={(event) => {
                event.stopPropagation();
                onToggle(4);
              }}
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
