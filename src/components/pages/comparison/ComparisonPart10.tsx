import Link from 'next/link';
export function ComparisonPart10({ onNext, busy }: { onNext: () => void; busy: boolean }) {
  return (
    <footer className={"comparison-bottom-dock"}>
      <div className={"dock-left"}>
        <Link href={"/session?q=1&review=1"} className={"dock-btn-secondary"} id={"btn-back-question"}>
          <svg width={"15"} height={"15"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2.5"}>
            <line x1={"19"} y1={"12"} x2={"5"} y2={"12"}></line>
            <polyline points={"12 19 5 12 12 5"}></polyline>
          </svg>
          <span>
            Review Question 1
          </span>
        </Link>
      </div>
      <div className={"dock-right"}>
        <button type={"button"} className={"dock-btn-primary"} id={"btn-next-question"} onClick={onNext} disabled={busy}>
          <span>
            {busy ? 'Loading…' : 'Continue to Question 2 of 2'}
          </span>
          <svg width={"15"} height={"15"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2.5"}>
            <line x1={"5"} y1={"12"} x2={"19"} y2={"12"}></line>
            <polyline points={"12 5 19 12 12 19"}></polyline>
          </svg>
        </button>
      </div>
    </footer>
  );
}
