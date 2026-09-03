import Link from 'next/link';
import { AvatarMenu } from '@/components/layout/AvatarMenu';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { HeaderParticipantsBadge } from '@/components/layout/HeaderParticipantsBadge';

export function ParticipantsHeader() {
  return (
    <header className="minimal-header">
      <Link href="/" className="brand-group" id="brand-logo-link">
        <span className="brand-logo-frame">
          <BrandLogo />
        </span>
        <span className="brand-name">Same Page</span>
      </Link>
      <div className="header-nav">
        <HeaderParticipantsBadge label="2 Participants" title="Active participants count" />
        <div className="header-duration-badge" id="header-duration-badge" title="Session duration">
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
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span id="header-duration-text">08:42</span>
        </div>
        <AvatarMenu />
      </div>
    </header>
  );
}
