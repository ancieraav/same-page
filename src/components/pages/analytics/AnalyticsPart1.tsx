import { AvatarMenu } from '@/components/layout/AvatarMenu';
import { BrandLogo } from '@/components/brand/BrandLogo';
import Link from 'next/link';
export function AnalyticsPart1() {
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
        <Link href={"/participants"} className={"header-participants-badge header-participants-link"} id={"header-participants-badge"} title={"View all participants"}>
          <svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2.2"} strokeLinecap={"round"} strokeLinejoin={"round"}>
            <path d={"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"}></path>
            <circle cx={"9"} cy={"7"} r={"4"}></circle>
            <path d={"M23 21v-2a4 4 0 0 0-3-3.87"}></path>
            <path d={"M16 3.13a4 4 0 0 1 0 7.75"}></path>
          </svg>
          <span id={"header-participants-count"}>
            2 Participants
          </span>
        </Link>
        <div className={"header-duration-badge"} id={"header-duration-badge"} title={"Total session duration"}>
          <svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2.2"} strokeLinecap={"round"} strokeLinejoin={"round"}>
            <circle cx={"12"} cy={"12"} r={"10"}></circle>
            <polyline points={"12 6 12 12 16 14"}></polyline>
          </svg>
          <span id={"header-duration-text"}>
            05:24
          </span>
        </div>
        <AvatarMenu />
      </div>
    </header>
  );
}
