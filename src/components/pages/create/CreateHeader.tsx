import Link from 'next/link';
import { AvatarMenu } from '@/components/layout/AvatarMenu';
import { BrandLogo } from '@/components/brand/BrandLogo';

export function CreateHeader() {
  return (
    <header className="minimal-header">
      <Link href="/" className="brand-group" id="brand-logo-link">
        <span className="brand-logo-frame">
          <BrandLogo />
        </span>
        <span className="brand-name">Same Page</span>
      </Link>
      <div className="header-nav">
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
        <Link href="/" className="nav-link-btn" id="nav-join-link">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Join Room</span>
        </Link>
        <AvatarMenu />
      </div>
    </header>
  );
}
