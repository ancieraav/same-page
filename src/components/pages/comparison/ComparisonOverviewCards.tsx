type ComparisonOverviewCardsProps = {
  summaryOpen: boolean;
  onToggleSummary: () => void;
};

export function ComparisonOverviewCards({
  summaryOpen,
  onToggleSummary,
}: ComparisonOverviewCardsProps) {
  return (
    <section className="alignment-overview-grid">
      <div className="alignment-metric-card">
        <div className="metric-card-header">
          <span className="metric-label">Overall Alignment</span>
          <span className="metric-badge-pill tone-positive">Strong Consensus</span>
        </div>
        <div className="metric-value-row">
          <span className="metric-score-giant">
            78<span className="metric-score-percent">%</span>
          </span>
          <div className="metric-progress-wrapper">
            <div className="curved-progress-container" title="78% Team Alignment">
              <svg className="curved-progress-svg" viewBox="0 0 220 30" fill="none" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="gradient-scurve-team" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4F46E5" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </linearGradient>
                </defs>
                <path
                  className="curved-track-bg"
                  d="M 10,15 C 28,4 42,4 60,15 C 78,26 92,26 110,15 C 128,4 142,4 160,15 C 178,26 192,26 210,15"
                  stroke="#E2E8F0"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <path
                  className="curved-track-fill"
                  d="M 10,15 C 28,4 42,4 60,15 C 78,26 92,26 110,15 C 128,4 142,4 160,15 C 178,26 192,26 210,15"
                  stroke="url(#gradient-scurve-team)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  pathLength="100"
                  strokeDasharray="100"
                  strokeDashoffset="22"
                />
              </svg>
            </div>
            <span className="metric-sub-detail">4 of 5 core assumptions shared across roles</span>
          </div>
        </div>
      </div>
      <div className="alignment-metric-card">
        <div className="metric-card-header">
          <span className="metric-label">Your Alignment Score</span>
          <span className="metric-badge-pill tone-indigo">Above Average</span>
        </div>
        <div className="metric-value-row">
          <span className="metric-score-giant text-indigo">
            84<span className="metric-score-percent">%</span>
          </span>
          <div className="metric-progress-wrapper">
            <div className="curved-progress-container" title="84% Personal Alignment">
              <svg className="curved-progress-svg" viewBox="0 0 220 30" fill="none" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="gradient-scurve-self" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4F46E5" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
                <path
                  className="curved-track-bg"
                  d="M 10,15 C 28,4 42,4 60,15 C 78,26 92,26 110,15 C 128,4 142,4 160,15 C 178,26 192,26 210,15"
                  stroke="#E2E8F0"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <path
                  className="curved-track-fill"
                  d="M 10,15 C 28,4 42,4 60,15 C 78,26 92,26 110,15 C 128,4 142,4 160,15 C 178,26 192,26 210,15"
                  stroke="url(#gradient-scurve-self)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  pathLength="100"
                  strokeDasharray="100"
                  strokeDashoffset="16"
                />
              </svg>
            </div>
            <span className="metric-sub-detail text-indigo">+6% vs general room benchmark</span>
          </div>
        </div>
      </div>
      <div className="ai-summary-card">
        <div className="summary-card-header">
          <div className="summary-badge">
            <span className="summary-sparkle">✦</span>
            <span>Room Consensus</span>
          </div>
          <button
            type="button"
            className="btn-toggle-summary"
            id="btn-toggle-summary"
            aria-expanded={summaryOpen}
            title="Toggle full summary"
            onClick={onToggleSummary}
          >
            <span id="toggle-summary-label">{summaryOpen ? 'Hide Full Summary' : 'Read Full Summary'}</span>
            <svg
              className="summary-chevron-icon"
              id="summary-chevron"
              width="14"
              height="14"
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
        <div className="summary-body-content">
          <p className="summary-preview-paragraph" id="summary-preview">
            The room broadly agrees on prioritizing conversion retention and funnel latency over aesthetic revamps. While Elena (Design) leans heavily on refining input validation typography, Anugrah and David Chen align on hardening database connection pooling before launching new marketing initiatives.
          </p>
          <div className={`summary-extended-drawer${summaryOpen ? ' is-open' : ''}`} id="summary-extended-drawer">
            <div className="summary-extended-inner" id="summary-extended-content">
              <p>
                <strong>Shared North Star:</strong> 4 out of 5 participants directly identified database throughput and zero checkout regressions as non-negotiable for Q3 success.
              </p>
              <p>
                <strong>Divergence Point:</strong> Design favors shipping micro-interaction polish this sprint, whereas Product Strategist and Ops insist on freezing all cosmetic revisions until load testing passes 50k rpm.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
