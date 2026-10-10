export interface ComparisonOverviewCardsProps {
  summaryOpen: boolean;
  onToggleSummary: () => void;
  alignment?: number | null | undefined;
  userAlignment?: number | null | undefined;
  consensusSummary?: string | undefined;
  sharedNorthStar?: string | undefined;
  divergencePoint?: string | undefined;
}

export function ComparisonOverviewCards({
  summaryOpen,
  onToggleSummary,
  alignment,
  userAlignment,
  consensusSummary,
  sharedNorthStar,
  divergencePoint,
}: ComparisonOverviewCardsProps) {
  const score = typeof alignment === 'number' ? alignment : 78;
  const userScore = typeof userAlignment === 'number' ? userAlignment : typeof alignment === 'number' ? alignment : 84;
  const toneClass = score >= 75 ? 'tone-positive' : score >= 50 ? 'tone-indigo' : 'tone-warning';
  const toneLabel = score >= 75 ? 'Strong Consensus' : score >= 50 ? 'Moderate Consensus' : 'Divergent Views';
  const userToneLabel = userScore >= 75 ? 'Strong Alignment' : userScore >= 50 ? 'Above Average' : 'Needs Discussion';

  const previewText = consensusSummary ?? 'The group perspectives have been analyzed across key trade-offs, core priorities, and operational assumptions for this question.';
  const northStar = sharedNorthStar ?? 'All participants converge on foundational strategic outcomes and delivering core value.';
  const divergence = divergencePoint ?? 'Minor variances in tactical timing or sequencing were noted between participants.';

  return (
    <section className="alignment-overview-grid">
      <div className="alignment-metric-card">
        <div className="metric-card-header">
          <span className="metric-label">Overall Alignment</span>
          <span className={`metric-badge-pill ${toneClass}`}>{toneLabel}</span>
        </div>
        <div className="metric-value-row">
          <span className="metric-score-giant">
            {score}<span className="metric-score-percent">%</span>
          </span>
          <div className="metric-progress-wrapper">
            <div className="curved-progress-container" title={`${String(score)}% Team Alignment`}>
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
                  strokeDashoffset={Math.max(0, Math.min(100, 100 - score))}
                />
              </svg>
            </div>
            <span className="metric-sub-detail">Shared assumptions & consensus score</span>
          </div>
        </div>
      </div>
      <div className="alignment-metric-card">
        <div className="metric-card-header">
          <span className="metric-label">Your Alignment Score</span>
          <span className="metric-badge-pill tone-indigo">{userToneLabel}</span>
        </div>
        <div className="metric-value-row">
          <span className="metric-score-giant text-indigo">
            {userScore}<span className="metric-score-percent">%</span>
          </span>
          <div className="metric-progress-wrapper">
            <div className="curved-progress-container" title={`${String(userScore)}% Personal Alignment`}>
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
                  strokeDashoffset={Math.max(0, Math.min(100, 100 - userScore))}
                />
              </svg>
            </div>
            <span className="metric-sub-detail text-indigo">Personal resonance with room outcome</span>
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
            {previewText}
          </p>
          <div className={`summary-extended-drawer${summaryOpen ? ' is-open' : ''}`} id="summary-extended-drawer">
            <div className="summary-extended-inner" id="summary-extended-content">
              <p>
                <strong>Shared North Star:</strong> {northStar}
              </p>
              <p>
                <strong>Divergence Point:</strong> {divergence}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
