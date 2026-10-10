export interface ComparisonBottomDockProps {
  secondsLeft?: number | null | undefined;
  onNext?: (() => void) | undefined;
  busy?: boolean | undefined;
}

export function ComparisonBottomDock({
  secondsLeft = 30,
}: ComparisonBottomDockProps) {
  const displaySeconds = secondsLeft !== null ? Math.max(0, secondsLeft) : 30;

  return (
    <footer className="comparison-bottom-dock" id="comparison-bottom-dock">
      <div className="dock-left">
        <div className="dock-timer-indicator" id="summary-dock-timer">
          <span className="round-indicator-dot" aria-hidden="true" />
          <span>Summary review window closes in <strong>{displaySeconds}s</strong></span>
        </div>
      </div>
      <div className="dock-right">
        <span className="dock-status-text">
          {displaySeconds > 0
            ? 'Review perspectives before the next question starts'
            : 'Summary period completed. Preparing next stage…'}
        </span>
      </div>
    </footer>
  );
}
