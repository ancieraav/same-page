import { useEffect } from 'react';
import { PAIR_MODE } from '@/lib/pairMode';

export interface SelectedParticipant {
  name: string;
  initials: string;
  role: string;
  score: number;
}

interface ParticipantDetailModalProps {
  open: boolean;
  selected: SelectedParticipant;
  onClose: () => void;
}

export function ParticipantDetailModal({ open, selected, onClose }: ParticipantDetailModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);
  return (
    <div
      className={`analytics-modal-backdrop${open ? ' is-active' : ''}`}
      id="participant-analytics-modal"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) {
          onClose();
        }
      }}
    >
      <div className="participant-modal-card" id="participant-modal-card">
        <div className="modal-header-banner">
          <div className="modal-profile-group">
            <div className="room-avatar-circle" id="modal-participant-avatar">
              <span id="modal-participant-initials">{selected.initials}</span>
            </div>
            <div className="modal-profile-text">
              <div className="modal-profile-name-row">
                <h2 className="modal-participant-name" id="modal-participant-name">
                  {selected.name}
                </h2>
                <span className="hero-status-pill tone-positive" id="modal-participant-badge">
                  {selected.score}% Match
                </span>
              </div>
              {/* REVIVE: role line (hidden in PAIR_MODE) */}
              {!PAIR_MODE && (
              <span className="modal-participant-role" id="modal-participant-role">
                {selected.role}
              </span>
              )}
            </div>
          </div>
          <button
            type="button"
            className="btn-modal-close"
            id="btn-close-participant-modal"
            aria-label="Close analytics popup"
            title="Close (Esc)"
            onClick={onClose}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="modal-body-scrollable" id="modal-body-scrollable">
          <header className="analytics-page-header">
            <div className="analytics-meta-pill">
              <span className="round-indicator-dot" aria-hidden="true" />
              <span>Complete</span>
            </div>
            <h1 className="analytics-main-title" id="modal-analytics-main-title">
              Session Alignment &amp; Perspective Analytics
            </h1>
            <p className="analytics-subtitle" id="modal-analytics-subtitle">
              Aggregated consensus, cognitive divergence, and unstated assumptions across all completed questions.
            </p>
          </header>
          <section className="shared-hero-analytics-grid modal-hero-grid" id="modal-shared-hero-analytics">
            <div className="hero-metric-card" id="modal-card-hero-overall">
              <div className="hero-card-header">
                <div className="hero-metric-title-group">
                  <span className="hero-metric-label">Overall Alignment</span>
                  <span className="hero-metric-sublabel">
                    Cross-participant consensus across all questions
                  </span>
                </div>
                <span className="hero-status-pill tone-positive">Mostly aligned</span>
              </div>
              <div className="hero-metric-value-row">
                <div className="hero-score-giant-wrap">
                  <span className="hero-score-giant" id="modal-overall-score-num">
                    74
                  </span>
                  <span className="hero-score-percent">%</span>
                </div>
                <div className="hero-progress-group">
                  <div className="curved-progress-container">
                    <svg className="curved-progress-svg" viewBox="0 0 220 30" fill="none" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="gradient-analytics-overall-popup" x1="0%" y1="0%" x2="100%" y2="0%">
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
                        id="modal-overall-scurve-fill"
                        d="M 10,15 C 28,4 42,4 60,15 C 78,26 92,26 110,15 C 128,4 142,4 160,15 C 178,26 192,26 210,15"
                        stroke="url(#gradient-analytics-overall-popup)"
                        strokeWidth="7"
                        strokeLinecap="round"
                        pathLength="100"
                        strokeDasharray="100"
                        strokeDashoffset="26"
                      />
                    </svg>
                  </div>
                  <div className="hero-mini-breakdown" id="modal-overall-mini-breakdown">
                    <span className="breakdown-tag tone-aligned">8 aligned</span>
                    <span className="breakdown-dot">&bull;</span>
                    <span className="breakdown-tag tone-mixed">3 mixed</span>
                    <span className="breakdown-dot">&bull;</span>
                    <span className="breakdown-tag tone-divided">2 divided</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="hero-metric-card" id="modal-card-hero-participant">
              <div className="hero-card-header">
                <div className="hero-metric-title-group">
                  <span className="hero-metric-label" id="modal-participant-metric-label">
                    {selected.name.split(' ')[0]}&apos;s Alignment
                  </span>
                  <span className="hero-metric-sublabel">
                    Proximity to the collective room perspective
                  </span>
                </div>
                <span className="hero-status-pill tone-indigo" id="modal-participant-status-pill">
                  +{selected.score - 74}% Above Room Avg
                </span>
              </div>
              <div className="hero-metric-value-row">
                <div className="hero-score-giant-wrap">
                  <span className="hero-score-giant text-indigo" id="modal-participant-score-num">
                    {selected.score}
                  </span>
                  <span className="hero-score-percent text-indigo">%</span>
                </div>
                <div className="hero-progress-group">
                  <div className="curved-progress-container">
                    <svg className="curved-progress-svg" viewBox="0 0 220 30" fill="none" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="gradient-analytics-participant-popup" x1="0%" y1="0%" x2="100%" y2="0%">
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
                        id="modal-participant-scurve-fill"
                        d="M 10,15 C 28,4 42,4 60,15 C 78,26 92,26 110,15 C 128,4 142,4 160,15 C 178,26 192,26 210,15"
                        stroke="url(#gradient-analytics-participant-popup)"
                        strokeWidth="7"
                        strokeLinecap="round"
                        pathLength="100"
                        strokeDasharray="100"
                        strokeDashoffset="12"
                      />
                    </svg>
                  </div>
                  <div className="hero-bench-note" id="modal-participant-bench-note">
                    <span>
                      {selected.name.split(' ')[0]} aligns <strong>{selected.score}%</strong> with the room across all evaluated trade-offs
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="ai-summary-card" id="modal-ai-summary-card">
            <div className="summary-card-header">
              <div className="summary-badge">
                <span className="summary-sparkle">✦</span>
                <span>Summary</span>
              </div>
              <button
                type="button"
                className="btn-toggle-summary"
                id="btn-toggle-modal-summary"
                aria-expanded="false"
                title="Toggle full summary"
              >
                <span id="toggle-modal-summary-label">Read Full Summary</span>
                <svg
                  className="summary-chevron-icon"
                  id="modal-summary-chevron"
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
              <p className="summary-preview-paragraph" id="modal-summary-preview" />
              <div className="summary-extended-drawer" id="modal-summary-drawer">
                <div className="summary-extended-inner" id="modal-summary-extended" />
              </div>
            </div>
          </section>
          <section className="dynamic-combo-container" id="modal-dynamic-combo-container" aria-live="polite" />
        </div>
        <div className="modal-footer-bar">
          <span className="modal-esc-hint">Press Esc or click outside to dismiss</span>
          <button
            type="button"
            className="dock-btn-secondary"
            id="btn-footer-close-modal"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
