import Link from 'next/link';
import { AnalyticsComboCards } from './AnalyticsComboCards';

interface AnalyticsDashboardProps {
  summaryOpen: boolean;
  onToggleSummary: () => void;
}

export function AnalyticsDashboard({ summaryOpen, onToggleSummary }: AnalyticsDashboardProps) {
  return (
    <main className="analytics-canvas-wrapper" id="analytics-canvas-wrapper">
      <header className="analytics-page-header">
        <div className="analytics-meta-pill">
          <span className="round-indicator-dot" aria-hidden="true" />
          <span id="analytics-mode-indicator">Complete</span>
        </div>
        <h1 className="analytics-main-title" id="analytics-main-title">
          Session Alignment &amp; Perspective Analytics
        </h1>
        <p className="analytics-subtitle" id="analytics-subtitle">
          Aggregated consensus, cognitive divergence, and unstated assumptions across all completed questions.
        </p>
      </header>
      <section className="shared-hero-analytics-grid" id="shared-hero-analytics">
        <div className="hero-metric-card" id="card-hero-overall">
          <div className="hero-card-header">
            <div className="hero-metric-title-group">
              <span className="hero-metric-label">Overall Alignment</span>
              <span className="hero-metric-sublabel">
                Cross-participant consensus across all questions
              </span>
            </div>
            <span className="hero-status-pill tone-positive" id="overall-status-pill">
              Mostly aligned
            </span>
          </div>
          <div className="hero-metric-value-row">
            <div className="hero-score-giant-wrap">
              <span className="hero-score-giant" id="overall-score-num">
                74
              </span>
              <span className="hero-score-percent">%</span>
            </div>
            <div className="hero-progress-group">
              <div className="curved-progress-container">
                <svg className="curved-progress-svg" viewBox="0 0 220 30" fill="none" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="gradient-analytics-overall" x1="0%" y1="0%" x2="100%" y2="0%">
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
                    id="overall-scurve-fill"
                    d="M 10,15 C 28,4 42,4 60,15 C 78,26 92,26 110,15 C 128,4 142,4 160,15 C 178,26 192,26 210,15"
                    stroke="url(#gradient-analytics-overall)"
                    strokeWidth="7"
                    strokeLinecap="round"
                    pathLength="100"
                    strokeDasharray="100"
                    strokeDashoffset="26"
                  />
                </svg>
              </div>
              <div className="hero-mini-breakdown" id="overall-mini-breakdown">
                <span className="breakdown-tag tone-aligned">8 aligned</span>
                <span className="breakdown-dot">&bull;</span>
                <span className="breakdown-tag tone-mixed">3 mixed</span>
                <span className="breakdown-dot">&bull;</span>
                <span className="breakdown-tag tone-divided">2 divided</span>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-metric-card" id="card-hero-your">
          <div className="hero-card-header">
            <div className="hero-metric-title-group">
              <span className="hero-metric-label">Your Alignment</span>
              <span className="hero-metric-sublabel">
                Your proximity to the collective room perspective
              </span>
            </div>
            <span className="hero-status-pill tone-indigo" id="your-status-pill">
              +7% Above Room Avg
            </span>
          </div>
          <div className="hero-metric-value-row">
            <div className="hero-score-giant-wrap">
              <span className="hero-score-giant text-indigo" id="your-score-num">
                81
              </span>
              <span className="hero-score-percent text-indigo">%</span>
            </div>
            <div className="hero-progress-group">
              <div className="curved-progress-container">
                <svg className="curved-progress-svg" viewBox="0 0 220 30" fill="none" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="gradient-analytics-your" x1="0%" y1="0%" x2="100%" y2="0%">
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
                    id="your-scurve-fill"
                    d="M 10,15 C 28,4 42,4 60,15 C 78,26 92,26 110,15 C 128,4 142,4 160,15 C 178,26 192,26 210,15"
                    stroke="url(#gradient-analytics-your)"
                    strokeWidth="7"
                    strokeLinecap="round"
                    pathLength="100"
                    strokeDasharray="100"
                    strokeDashoffset="19"
                  />
                </svg>
              </div>
              <div className="hero-bench-note" id="your-bench-note">
                <span>
                  You align <strong>81%</strong> with the room across all evaluated trade-offs
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="ai-summary-card" id="analytics-ai-summary-card">
        <div className="summary-card-header">
          <div className="summary-badge">
            <span className="summary-sparkle">✦</span>
            <span>Summary</span>
          </div>
          <button
            type="button"
            className="btn-toggle-summary"
            id="btn-toggle-analytics-summary"
            aria-expanded={summaryOpen}
            title="Toggle full summary"
            onClick={onToggleSummary}
          >
            <span id="toggle-analytics-summary-label">
              {summaryOpen ? 'Hide Full Summary' : 'Read Full Summary'}
            </span>
            <svg
              className="summary-chevron-icon"
              id="analytics-summary-chevron"
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
          <p className="summary-preview-paragraph" id="analytics-summary-preview">
            Across all completed questions, the room established a decisive{' '}
            <strong>74% overall alignment</strong> on prioritizing platform reliability and shipping an MVP this month over secondary features. While you and Alex diverged on final design decision ownership (Product vs Design), both participants hold strong consensus on delivery timelines and technical prerequisites.
          </p>
          <div
            className={`summary-extended-drawer${summaryOpen ? ' is-open' : ''}`}
            id="analytics-summary-drawer"
          >
            <div className="summary-extended-inner" id="analytics-summary-extended">
              <p>
                <strong>Core Unanimous Commitments:</strong> Both participants strictly committed to an MVP delivery window within this month, agreeing that database connection pooling and checkout table locking are the non-negotiable operational blockers that must be resolved prior to scaling marketing spend.
              </p>
              <p>
                <strong>Primary Divergences &amp; Next Steps:</strong> The central friction lies in decision ownership for UX edge cases and sprint duration pacing (2 vs 3 weeks). The team is positioned to resolve these minor variances in a focused 5-minute sync without delaying the launch milestone.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="dynamic-combo-container" id="dynamic-combo-container" aria-live="polite">
        <AnalyticsComboCards />
      </section>
      <footer className="analytics-bottom-dock">
        <div className="dock-left">
          <Link href="/comparison?q=2&review=1" className="dock-btn-secondary" id="btn-review-answers">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Review Question Answers</span>
          </Link>
          <Link
            href="/participants"
            className="dock-btn-secondary"
            id="btn-view-participants"
            title="View other participants"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>View Other Participants</span>
            <span className="dock-badge-count">4</span>
          </Link>
        </div>
        <div className="dock-right">
          <Link href="/" className="dock-btn-primary" id="btn-finish-session">
            <span>Complete Room Session</span>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </Link>
        </div>
      </footer>
    </main>
  );
}
