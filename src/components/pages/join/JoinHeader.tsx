import Link from 'next/link';
import { AvatarMenu } from '@/components/layout/AvatarMenu';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { LiveActivityBadge } from '@/components/layout/LiveActivityBadge';

export function JoinHeader() {
  return (
    <header className="minimal-header">
      <Link href="/" className="brand-group" id="brand-logo-link">
        <span className="brand-logo-frame">
          <BrandLogo />
        </span>
        <span className="brand-name">Same Page</span>
      </Link>
      <div className="header-nav">
        <LiveActivityBadge />
        <AvatarMenu />
      </div>
    </header>
  );
}
