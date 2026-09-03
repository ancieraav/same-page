import Link from 'next/link';
import { AvatarMenu } from '@/components/layout/AvatarMenu';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { HeaderParticipantsBadge } from '@/components/layout/HeaderParticipantsBadge';

interface WaitingHeaderProps {
  roomCode: string;
  duration: string;
  onShare: () => void;
  onCopy: () => void;
}

export function WaitingHeader({ roomCode, duration, onShare, onCopy }: WaitingHeaderProps) {
  return (
    <header className="minimal-header">
      <Link href="/" className="brand-group" id="brand-logo-link">
        <span className="brand-logo-frame">
          <BrandLogo />
        </span>
        <span className="brand-name">Same Page</span>
      </Link>
      <div className="header-nav">
        <div className="header-room-code-badge" id="header-code-box">
          <button
            type="button"
            className="room-code-share-btn"
            title="Open room access codes"
            aria-label="Open room access codes"
            onClick={onShare}
          >
            <span className="room-code-label">ROOM</span>
            <span className="room-code-text" id="header-room-code">{roomCode}</span>
          </button>
          <button
            type="button"
            className="btn-copy-code-mini"
            id="btn-copy-header-code"
            title="Copy room code"
            aria-label="Copy room code"
            onClick={onCopy}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
        </div>
        <HeaderParticipantsBadge label="2/2 Ready" title="Connected participants" />
        <div className="header-duration-badge" id="header-duration-badge" title="Waiting room duration">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span id="header-duration-time">{duration}</span>
        </div>
        <AvatarMenu />
      </div>
    </header>
  );
}
