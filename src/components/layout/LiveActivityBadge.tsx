export function LiveActivityBadge() {
  return (
    <div className="live-activity-badge" title="142 private rooms active right now">
      <div className="activity-signal" aria-hidden="true">
        <span className="signal-bar bar-1" />
        <span className="signal-bar bar-2" />
        <span className="signal-bar bar-3" />
      </div>
      <div className="activity-text">
        <span className="activity-number">142</span>
        <span className="activity-label">rooms active</span>
      </div>
    </div>
  );
}
