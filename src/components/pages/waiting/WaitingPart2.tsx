import { AvatarMenu } from '@/components/layout/AvatarMenu';
import { BrandLogo } from '@/components/brand/BrandLogo';
import Link from 'next/link';
type WaitingPart2Props = {
  roomCode: string;
  duration: string;
  onShare: () => void;
  onCopy: () => void;
};

export function WaitingPart2({ roomCode, duration, onShare, onCopy }: WaitingPart2Props) {
  return (
    <header className={"minimal-header"}>
      <Link href={"/"} className={"brand-group"} id={"brand-logo-link"}>
        <span className={"brand-logo-frame"}>
          <BrandLogo />
        </span>
        <span className={"brand-name"}>
          Same Page
        </span>
      </Link>
      <div className={"header-nav"}>
        <button type="button" className={"header-room-code-badge"} id={"header-code-box"} title={"Click to copy room code"} onClick={onShare}>
          <span className={"room-code-label"}>
            ROOM
          </span>
          <span className={"room-code-text"} id={"header-room-code"}>
            {roomCode}
          </span>
          <span className={"btn-copy-code-mini"} id={"btn-copy-header-code"} aria-label={"Copy room code"} onClick={(event) => { event.stopPropagation(); onCopy(); }}>
            <svg width={"13"} height={"13"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2.5"}>
              <rect x={"9"} y={"9"} width={"13"} height={"13"} rx={"2"} ry={"2"}></rect>
              <path d={"M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"}></path>
            </svg>
          </span>
        </button>
        <div className={"header-participants-badge"} id={"header-participants-badge"} title={"Connected participants"}>
          <svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2.2"} strokeLinecap={"round"} strokeLinejoin={"round"}>
            <path d={"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"}></path>
            <circle cx={"9"} cy={"7"} r={"4"}></circle>
            <path d={"M23 21v-2a4 4 0 0 0-3-3.87"}></path>
            <path d={"M16 3.13a4 4 0 0 1 0 7.75"}></path>
          </svg>
          <span id={"header-participants-count"}>
            2/2 Ready
          </span>
        </div>
        <div className={"header-duration-badge"} id={"header-duration-badge"} title={"Waiting room duration"}>
          <svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2.2"} strokeLinecap={"round"} strokeLinejoin={"round"}>
            <circle cx={"12"} cy={"12"} r={"10"}></circle>
            <polyline points={"12 6 12 12 16 14"}></polyline>
          </svg>
          <span id={"header-duration-time"}>
            {duration}
          </span>
        </div>
        <AvatarMenu />
      </div>
    </header>
  );
}
