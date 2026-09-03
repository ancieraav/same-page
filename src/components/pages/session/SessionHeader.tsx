import Link from 'next/link';
import { AvatarMenu } from '@/components/layout/AvatarMenu';
import { BrandLogo } from '@/components/brand/BrandLogo';

export function SessionHeader({ timer }: { timer: string }) {
  return (
    <header className="minimal-header">
      <Link href="/" className="brand-group" id="brand-logo-link">
        <span className="brand-logo-frame">
          <BrandLogo />
        </span>
        <span className="brand-name">Same Page</span>
      </Link>
      <div className="header-nav">
        <div className="header-participants-badge" id="header-participants-badge" title="Session participants">
          <svg
            width="14"
            height="14"
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
          <span id="header-participants-count">2 Participants</span>
        </div>
        <span className="session-timer-pill" id="session-timer-badge" title="Question countdown">
          <span className="session-timer-dot" aria-hidden="true" />
          <span id="session-timer-countdown">{timer}</span>
        </span>
        <AvatarMenu />
      </div>
    </header>
  );
}
