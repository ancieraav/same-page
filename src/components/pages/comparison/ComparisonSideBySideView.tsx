'use client';

import { useState } from 'react';
import { PAIR_MODE } from '@/lib/pairMode';

export interface PerspectiveCardData {
  id: string;
  name: string;
  role?: string | undefined;
  score?: number | null | undefined;
  scoreTone?: string | undefined;
  avatarColor?: string | undefined;
  initials?: string | undefined;
  isSelf?: boolean | undefined;
  preview: string;
  extended?: string | undefined;
  keyPoints?: string[] | undefined;
}

export interface ComparisonSideBySideViewProps {
  multi: boolean;
  perspectives?: PerspectiveCardData[] | undefined;
}

export function ComparisonSideBySideView({ multi, perspectives }: ComparisonSideBySideViewProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const toggle = (index: number) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  if (perspectives && perspectives.length > 0) {
    return (
      <section className={`comparison-stage-mode${multi ? ' is-hidden' : ''}`} id="stage-mode-two">
        <div className="side-by-side-grid">
          {perspectives.map((item, index) => {
            const isItemExpanded = expanded.has(index);
            const scoreLabel = `${String(item.score ?? 75)}% Aligned`;
            const toneClass = item.scoreTone ?? ((item.score ?? 75) >= 70 ? 'tone-positive' : 'tone-indigo');

            return (
              <article
                key={item.id || String(index)}
                className={`perspective-room-card${item.isSelf ? ' is-self' : ''}`}
                id={`perspective-card-${String(index)}`}
              >
                <div className="room-card-profile-header">
                  <div className={`room-avatar-circle ${item.avatarColor ?? 'avatar-color-indigo'}`}>
                    <span>{item.initials ?? item.name.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div className="room-profile-meta">
                    <span className="room-user-name">{item.name}</span>
                    {item.role && !PAIR_MODE ? <span className="room-user-role-title">{item.role}</span> : null}
                  </div>
                  <div className={`room-alignment-pill ${toneClass}`} title="Alignment rating">
                    <span>{scoreLabel}</span>
                  </div>
                </div>
                <div className="room-statement-surface">
                  <div className="statement-rendered-content statement-expandable-wrap">
                    <div className="statement-preview-text">
                      <p>{item.preview}</p>
                    </div>
                    {item.extended ? (
                      <div className={`statement-extended-text${isItemExpanded ? ' is-open' : ''}`}>
                        <p>{item.extended}</p>
                        {item.keyPoints && item.keyPoints.length > 0 ? (
                          <ul className="rendered-list">
                            {item.keyPoints.map((point, pIdx) => (
                              <li key={pIdx}>{point}</li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    ) : null}
                    {item.extended ? (
                      <button
                        type="button"
                        className={`btn-read-more-statement${isItemExpanded ? ' is-expanded' : ''}`}
                        aria-expanded={isItemExpanded}
                        title="Toggle full response"
                        onClick={() => { toggle(index); }}
                      >
                        <span>{isItemExpanded ? 'Show less' : 'Read more'}</span>
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
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    );
  }

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
              {!PAIR_MODE && <span className="room-user-role-title">Lead Product Strategist</span>}
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
              <span>AL</span>
            </div>
            <div className="room-profile-meta">
              <span className="room-user-name">Alex Morgan</span>
              {!PAIR_MODE && <span className="room-user-role-title">Design Lead</span>}
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
