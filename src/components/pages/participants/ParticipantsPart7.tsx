import Link from 'next/link';
export function ParticipantsPart7() {
  return (
    <footer className={"analytics-bottom-dock"}>
      <div className={"dock-left"}>
        <Link href={"/analytics"} className={"dock-btn-secondary"} id={"btn-back-analytics"}>
          <svg width={"15"} height={"15"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2.5"} strokeLinecap={"round"} strokeLinejoin={"round"}>
            <polyline points={"15 18 9 12 15 6"}></polyline>
          </svg>
          <span>
            Back to Session Analytics
          </span>
        </Link>
      </div>
      <div className={"dock-right"}>
        <Link href={"/"} className={"dock-btn-primary"} id={"btn-finish-session"}>
          <span>
            Complete Room Session
          </span>
          <svg width={"15"} height={"15"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2.5"} strokeLinecap={"round"} strokeLinejoin={"round"}>
            <polyline points={"20 6 9 17 4 12"}></polyline>
          </svg>
        </Link>
      </div>
    </footer>
  );
}
