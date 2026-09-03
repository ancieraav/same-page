export function ComparisonPart9({ visibleIds, expanded, onToggle }: { visibleIds: string[]; expanded: Set<number>; onToggle: (index: number) => void }) {
  return (
    <div className={"team-list-stack"} id={"team-list-stack"}>
      <article className={"team-member-card is-self"} style={{ display: visibleIds.includes('you') ? undefined : 'none' }}>
        <div className={"team-card-profile-col"}>
          <div className={"room-avatar-circle avatar-color-indigo"}>
            <span>
              A
            </span>
          </div>
          <div className={"team-member-info"}>
            <span className={"team-member-name"}>
              Anugrah (You)
            </span>
            <span className={"team-member-role"}>
              Lead Product Strategist
            </span>
          </div>
          <div className={"team-card-score-pill tone-indigo"}>
            <span>
              84% Match
            </span>
          </div>
        </div>
        <div className={"team-card-statement-col"}>
          <div className={"statement-expandable-wrap"}>
            <div className={"statement-preview-text"}>
              <p>
                Our single highest-leverage priority must be{' '}<strong>
                  locking the core checkout retention loop
                </strong>{' '}before scaling ad spend.
              </p>
            </div>
            <div className={`statement-extended-text${expanded.has(0) ? ' is-open' : ''}`}>
              <p>
                We are explicitly deprioritizing ancillary redesign features, custom analytics dashboards, and non-essential UI churn until database latency stabilizes below 120ms.
              </p>
            </div>
            <button type={"button"} className={`btn-read-more-statement${expanded.has(0) ? ' is-expanded' : ''}`} aria-expanded={expanded.has(0)} title={"Toggle full response"} onClick={() => onToggle(0)}>
              <span>
                {expanded.has(0) ? 'Show less' : 'Read more'}
              </span>
              <svg className={"chevron-mini"} width={"12"} height={"12"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2.5"} strokeLinecap={"round"} strokeLinejoin={"round"}>
                <polyline points={"6 9 12 15 18 9"}></polyline>
              </svg>
            </button>
          </div>
        </div>
      </article>
      <article className={"team-member-card"} style={{ display: visibleIds.includes('raka') ? undefined : 'none' }}>
        <div className={"team-card-profile-col"}>
          <div className={"room-avatar-circle avatar-color-amber"}>
            <span>
              RP
            </span>
          </div>
          <div className={"team-member-info"}>
            <span className={"team-member-name"}>
              Raka Pratama
            </span>
            <span className={"team-member-role"}>
              Engineering Lead
            </span>
          </div>
          <div className={"team-card-score-pill tone-positive"}>
            <span>
              78% Match
            </span>
          </div>
        </div>
        <div className={"team-card-statement-col"}>
          <div className={"statement-expandable-wrap"}>
            <div className={"statement-preview-text"}>
              <p>
                I agree that{' '}<strong>
                  checkout reliability and database indexing
                </strong>{' '}take 100% precedence for our upcoming production release.
              </p>
            </div>
            <div className={`statement-extended-text${expanded.has(1) ? ' is-open' : ''}`}>
              <p>
                We should completely deprioritize new third-party marketing integrations and localized payment gateways until infrastructure stress tests pass under 5,000 req/sec.
              </p>
            </div>
            <button type={"button"} className={`btn-read-more-statement${expanded.has(1) ? ' is-expanded' : ''}`} aria-expanded={expanded.has(1)} title={"Toggle full response"} onClick={() => onToggle(1)}>
              <span>
                {expanded.has(1) ? 'Show less' : 'Read more'}
              </span>
              <svg className={"chevron-mini"} width={"12"} height={"12"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2.5"} strokeLinecap={"round"} strokeLinejoin={"round"}>
                <polyline points={"6 9 12 15 18 9"}></polyline>
              </svg>
            </button>
          </div>
        </div>
      </article>
      <article className={"team-member-card"} style={{ display: visibleIds.includes('elena') ? undefined : 'none' }}>
        <div className={"team-card-profile-col"}>
          <div className={"room-avatar-circle avatar-color-emerald"}>
            <span>
              ER
            </span>
          </div>
          <div className={"team-member-info"}>
            <span className={"team-member-name"}>
              Elena Rostova
            </span>
            <span className={"team-member-role"}>
              Design Lead
            </span>
          </div>
          <div className={"team-card-score-pill tone-positive"}>
            <span>
              88% Match
            </span>
          </div>
        </div>
        <div className={"team-card-statement-col"}>
          <div className={"statement-expandable-wrap"}>
            <div className={"statement-preview-text"}>
              <p>
                Priority is{' '}<strong>
                  eliminating micro-friction in checkout typography
                </strong>
                , input masking, and form error validation states.
              </p>
            </div>
            <div className={`statement-extended-text${expanded.has(2) ? ' is-open' : ''}`}>
              <p>
                Deprioritizing marketing landing page revamps, micro-interactions, and heavy animated transitions for now so the checkout funnel has zero visual distraction.
              </p>
            </div>
            <button type={"button"} className={`btn-read-more-statement${expanded.has(2) ? ' is-expanded' : ''}`} aria-expanded={expanded.has(2)} title={"Toggle full response"} onClick={() => onToggle(2)}>
              <span>
                {expanded.has(2) ? 'Show less' : 'Read more'}
              </span>
              <svg className={"chevron-mini"} width={"12"} height={"12"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2.5"} strokeLinecap={"round"} strokeLinejoin={"round"}>
                <polyline points={"6 9 12 15 18 9"}></polyline>
              </svg>
            </button>
          </div>
        </div>
      </article>
      <article className={"team-member-card"} style={{ display: visibleIds.includes('sarah') ? undefined : 'none' }}>
        <div className={"team-card-profile-col"}>
          <div className={"room-avatar-circle avatar-color-cyan"}>
            <span>
              SJ
            </span>
          </div>
          <div className={"team-member-info"}>
            <span className={"team-member-name"}>
              Sarah Jenkins
            </span>
            <span className={"team-member-role"}>
              Growth &bull; Marketing
            </span>
          </div>
          <div className={"team-card-score-pill tone-neutral"}>
            <span>
              69% Match
            </span>
          </div>
        </div>
        <div className={"team-card-statement-col"}>
          <div className={"statement-expandable-wrap"}>
            <div className={"statement-preview-text"}>
              <p>
                We need{' '}<strong>
                  frictionless conversion from paid campaigns
                </strong>{' '}to ensure our acquisition budget is not leaking users.
              </p>
            </div>
            <div className={`statement-extended-text${expanded.has(3) ? ' is-open' : ''}`}>
              <p>
                I was originally advocating for viral referral invite popups, but I am fully aligned with pausing that to ensure core payment conversion rates stay robust.
              </p>
            </div>
            <button type={"button"} className={`btn-read-more-statement${expanded.has(3) ? ' is-expanded' : ''}`} aria-expanded={expanded.has(3)} title={"Toggle full response"} onClick={() => onToggle(3)}>
              <span>
                {expanded.has(3) ? 'Show less' : 'Read more'}
              </span>
              <svg className={"chevron-mini"} width={"12"} height={"12"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2.5"} strokeLinecap={"round"} strokeLinejoin={"round"}>
                <polyline points={"6 9 12 15 18 9"}></polyline>
              </svg>
            </button>
          </div>
        </div>
      </article>
      <article className={"team-member-card"} style={{ display: visibleIds.includes('david') ? undefined : 'none' }}>
        <div className={"team-card-profile-col"}>
          <div className={"room-avatar-circle avatar-color-rose"}>
            <span>
              DC
            </span>
          </div>
          <div className={"team-member-info"}>
            <span className={"team-member-name"}>
              David Chen
            </span>
            <span className={"team-member-role"}>
              Ops &bull; Finance
            </span>
          </div>
          <div className={"team-card-score-pill tone-neutral"}>
            <span>
              73% Match
            </span>
          </div>
        </div>
        <div className={"team-card-statement-col"}>
          <div className={"statement-expandable-wrap"}>
            <div className={"statement-preview-text"}>
              <p>
                Protecting{' '}<strong>
                  unit margin and refund reconciliation
                </strong>{' '}is top operational priority for financial health.
              </p>
            </div>
            <div className={`statement-extended-text${expanded.has(4) ? ' is-open' : ''}`}>
              <p>
                Agreeing to deprioritize custom enterprise invoicing and multi-currency billing until checkout payment webhooks achieve 99.99% automated reconciliation.
              </p>
            </div>
            <button type={"button"} className={`btn-read-more-statement${expanded.has(4) ? ' is-expanded' : ''}`} aria-expanded={expanded.has(4)} title={"Toggle full response"} onClick={() => onToggle(4)}>
              <span>
                {expanded.has(4) ? 'Show less' : 'Read more'}
              </span>
              <svg className={"chevron-mini"} width={"12"} height={"12"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2.5"} strokeLinecap={"round"} strokeLinejoin={"round"}>
                <polyline points={"6 9 12 15 18 9"}></polyline>
              </svg>
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
