export function ComparisonPart4({ summaryOpen, onToggleSummary }: { summaryOpen: boolean; onToggleSummary: () => void }) {
  return (
    <section className={"alignment-overview-grid"}>
      <div className={"alignment-metric-card"}>
        <div className={"metric-card-header"}>
          <span className={"metric-label"}>
            Overall Alignment
          </span>
          <span className={"metric-badge-pill tone-positive"}>
            Strong Consensus
          </span>
        </div>
        <div className={"metric-value-row"}>
          <span className={"metric-score-giant"}>
            78
            <span className={"metric-score-percent"}>
              %
            </span>
          </span>
          <div className={"metric-progress-wrapper"}>
            <div className={"curved-progress-container"} title={"78% Team Alignment"}>
              <svg className={"curved-progress-svg"} viewBox={"0 0 220 30"} fill={"none"} preserveAspectRatio={"none"}>
                <defs>
                  <linearGradient id={"gradient-scurve-team"} x1={"0%"} y1={"0%"} x2={"100%"} y2={"0%"}>
                    <stop offset={"0%"} stopColor={"#4F46E5"}></stop>
                    <stop offset={"100%"} stopColor={"#6366F1"}></stop>
                  </linearGradient>
                </defs>
                <path className={"curved-track-bg"} d={"M 10,15 C 28,4 42,4 60,15 C 78,26 92,26 110,15 C 128,4 142,4 160,15 C 178,26 192,26 210,15"} stroke={"#E2E8F0"} strokeWidth={"7"} strokeLinecap={"round"}></path>
                <path className={"curved-track-fill"} d={"M 10,15 C 28,4 42,4 60,15 C 78,26 92,26 110,15 C 128,4 142,4 160,15 C 178,26 192,26 210,15"} stroke={"url(#gradient-scurve-team)"} strokeWidth={"7"} strokeLinecap={"round"} pathLength={"100"} stroke-dasharray={"100"} stroke-dashoffset={"22"}></path>
              </svg>
            </div>
            <span className={"metric-sub-detail"}>
              4 of 5 core assumptions shared across roles
            </span>
          </div>
        </div>
      </div>
      <div className={"alignment-metric-card"}>
        <div className={"metric-card-header"}>
          <span className={"metric-label"}>
            Your Alignment Score
          </span>
          <span className={"metric-badge-pill tone-indigo"}>
            Above Average
          </span>
        </div>
        <div className={"metric-value-row"}>
          <span className={"metric-score-giant text-indigo"}>
            84
            <span className={"metric-score-percent"}>
              %
            </span>
          </span>
          <div className={"metric-progress-wrapper"}>
            <div className={"curved-progress-container"} title={"84% Personal Alignment"}>
              <svg className={"curved-progress-svg"} viewBox={"0 0 220 30"} fill={"none"} preserveAspectRatio={"none"}>
                <defs>
                  <linearGradient id={"gradient-scurve-self"} x1={"0%"} y1={"0%"} x2={"100%"} y2={"0%"}>
                    <stop offset={"0%"} stopColor={"#4F46E5"}></stop>
                    <stop offset={"100%"} stopColor={"#8B5CF6"}></stop>
                  </linearGradient>
                </defs>
                <path className={"curved-track-bg"} d={"M 10,15 C 28,4 42,4 60,15 C 78,26 92,26 110,15 C 128,4 142,4 160,15 C 178,26 192,26 210,15"} stroke={"#E2E8F0"} strokeWidth={"7"} strokeLinecap={"round"}></path>
                <path className={"curved-track-fill"} d={"M 10,15 C 28,4 42,4 60,15 C 78,26 92,26 110,15 C 128,4 142,4 160,15 C 178,26 192,26 210,15"} stroke={"url(#gradient-scurve-self)"} strokeWidth={"7"} strokeLinecap={"round"} pathLength={"100"} stroke-dasharray={"100"} stroke-dashoffset={"16"}></path>
              </svg>
            </div>
            <span className={"metric-sub-detail"}>
              Ranked #1 closest match with benchmark scope
            </span>
          </div>
        </div>
      </div>
      <div className={"ai-summary-card"} id={"ai-summary-card"}>
        <div className={"summary-card-header"}>
          <div className={"summary-badge"}>
            <span className={"summary-sparkle"}>
              ✦
            </span>
            <span>
              Summary
            </span>
          </div>
          <button type={"button"} className={"btn-toggle-summary"} id={"btn-toggle-summary"} aria-expanded={summaryOpen} title={"Toggle full summary"} onClick={onToggleSummary}>
            <span id={"toggle-summary-label"}>
              {summaryOpen ? 'Hide Full Summary' : 'Read Full Summary'}
            </span>
            <svg className={"summary-chevron-icon"} id={"summary-chevron"} width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2.5"} strokeLinecap={"round"} strokeLinejoin={"round"}>
              <polyline points={"6 9 12 15 18 9"}></polyline>
            </svg>
          </button>
        </div>
        <div className={"summary-body-content"}>
          <p className={"summary-preview-paragraph"}>
            The room achieved a strong{' '}<strong>
              78% alignment
            </strong>{' '}on locking checkout reliability and database latency before scaling acquisition campaigns. While you uniquely surfaced technical debt bottlenecks as a hard prerequisite, the team universally agreed to deprioritize ancillary cosmetic redesigns and referral features to focus engineering capacity on conversion stability.
          </p>
          <div className={`summary-extended-drawer${summaryOpen ? ' is-open' : ''}`} id={"summary-extended-drawer"}>
            <div className={"summary-extended-inner"}>
              <p>
                <strong>
                  Cross-Role Consensus:
                </strong>{' '}Engineering (Raka) and Design (Elena) aligned closely with Product (You) on eliminating conversion drop-off points. Both agreed that checkout friction directly degrades refund reconciliation (David) and paid campaign ROI (Sarah).
              </p>
              <p>
                <strong>
                  Explicit Deprioritizations:
                </strong>{' '}Non-essential homepage revamps, custom enterprise invoice tooling, and new marketing referral widgets were unanimously deferred to subsequent sprints.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
