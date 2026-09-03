'use client';

import { useState } from 'react';

export function ComparisonSideBySideView({ multi }: { multi: boolean }) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const toggle = (index: number) => { setExpanded((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    }); };

  return (
    <section className={`comparison-stage-mode${multi ? ' is-hidden' : ''}`} id="stage-mode-two">
      <div className="side-by-side-grid">
        <article className="perspective-room-card is-self">
          <div className="room-card-profile-header">
            <div className="room-avatar-circle avatar-color-indigo">
              <span>A</span>
            </div>
            <div className="room-profile-meta">
              <span className="room-user-name">Anugrah (You)</span>
              <span className="room-user-role-title">Lead Product Strategist</span>
            </div>
            <div className="room-alignment-pill tone-indigo" title="Personal alignment">
              <span>84% Aligned</span>
            </div>
          </div>
          <div className="room-statement-surface">
            <div className="statement-rendered-content statement-expandable-wrap">
              <div className="statement-preview-text">
                <p>
                  Our single highest-leverage priority must be{' '}
                  <strong>locking the core checkout retention loop</strong> before launching widespread user acquisition.
                </p>
              </div>
              <div className={`statement-extended-text${expanded.has(0) ? ' is-open' : ''}`}>
                <p>
                  We are explicitly deprioritizing <em>ancillary redesign features</em> and custom team dashboards until database latency stabilizes below 120ms.
                </p>
                <ul className="rendered-list">
                  <li>Zero regressions on core funnel conversion</li>
                  <li>Halt cosmetic UI churn on non-critical screens</li>
                </ul>
              </div>
              <button
                type="button"
                className={`btn-read-more-statement${expanded.has(0) ? ' is-expanded' : ''}`}
                aria-expanded={expanded.has(0)}
                title="Toggle full response"
                onClick={() => { toggle(0); }}
              >
                <span>{expanded.has(0) ? 'Show less' : 'Read more'}</span>
                <svg
                  className="chevron-mini"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>
          </div>
        </article>
        <article className="perspective-room-card">
          <div className="room-card-profile-header">
            <div className="room-avatar-circle avatar-color-emerald">
              <span>ER</span>
            </div>
            <div className="room-profile-meta">
              <span className="room-user-name">Elena Rostova</span>
              <span className="room-user-role-title">Design Lead</span>
            </div>
            <div className="room-alignment-pill tone-positive" title="Consensus match">
              <span>88% Aligned</span>
            </div>
          </div>
          <div className="room-statement-surface">
            <div className="statement-rendered-content statement-expandable-wrap">
              <div className="statement-preview-text">
                <p>
                  Priority is <strong>eliminating micro-friction in checkout typography</strong>, input masking, and form error validation states.
                </p>
              </div>
              <div className={`statement-extended-text${expanded.has(1) ? ' is-open' : ''}`}>
                <p>
                  Deprioritizing marketing landing page revamps and micro-interactions for now so the checkout funnel has zero visual distraction.
                </p>
                <ul className="rendered-list">
                  <li>Audit checkout input labels and error helpers</li>
                  <li>Delay hero animations until core conversion tests pass</li>
                </ul>
              </div>
              <button
                type="button"
                className={`btn-read-more-statement${expanded.has(1) ? ' is-expanded' : ''}`}
                aria-expanded={expanded.has(1)}
                title="Toggle full response"
                onClick={() => { toggle(1); }}
              >
                <span>{expanded.has(1) ? 'Show less' : 'Read more'}</span>
                <svg
                  className="chevron-mini"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
