interface SessionLaunchOverlayProps {
  phase: 'ai' | 'countdown';
  countdown: number;
  hidden: boolean;
  text: string;
}

export function SessionLaunchOverlay({ phase, countdown, hidden, text }: SessionLaunchOverlayProps) {
  return (
    <div
      className={`launch-transition-overlay${hidden ? ' is-hidden' : ''}`}
      id="launch-transition-overlay"
      aria-live="polite"
    >
      <div className="launch-stage-container">
        <div
          className="launch-ai-phase"
          id="launch-ai-phase"
          style={{ display: phase === 'ai' ? 'flex' : 'none' }}
        >
          <div className="ai-human-typewriter-container">
            <p className="ai-typewriter-paragraph" id="ai-typewriter-paragraph">
              <span className="ai-typewriter-text" id="ai-typewriter-text">
                {text}
              </span>
              <span className="ai-typewriter-caret" id="ai-typewriter-caret" aria-hidden="true" />
            </p>
          </div>
        </div>
        <div
          className="launch-countdown-phase"
          id="launch-countdown-phase"
          style={{ display: phase === 'countdown' ? 'flex' : 'none' }}
        >
          <div className="countdown-number-box">
            <div className="countdown-number-val" id="countdown-number-val" key={countdown}>
              {countdown}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
