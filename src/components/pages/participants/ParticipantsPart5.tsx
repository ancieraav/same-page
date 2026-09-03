export function ParticipantsPart5({ visible, onReset }: { visible: boolean; onReset: () => void }) {
  return (
    <div className={"team-list-empty-state"} id={"team-list-empty"} style={{ display: visible ? "block" : "none" }}>
      <svg width={"36"} height={"36"} viewBox={"0 0 24 24"} fill={"none"} stroke={"var(--text-muted)"} strokeWidth={"1.8"} strokeLinecap={"round"} strokeLinejoin={"round"}>
        <circle cx={"11"} cy={"11"} r={"8"}></circle>
        <line x1={"21"} y1={"21"} x2={"16.65"} y2={"16.65"}></line>
      </svg>
      <p className={"empty-title"}>
        No matching perspectives found
      </p>
      <p className={"empty-desc"}>
        Try modifying your search keywords or resetting your filter criteria.
      </p>
      <button type={"button"} className={"btn-reset-filters"} id={"btn-reset-filters"} onClick={onReset}>
        Clear Search &amp; Filters
      </button>
    </div>
  );
}
