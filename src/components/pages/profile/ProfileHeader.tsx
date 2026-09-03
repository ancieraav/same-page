/* eslint-disable @next/next/no-img-element -- avatar data URLs are local browser state. */
import Link from 'next/link';
import { BrandLogo } from '@/components/brand/BrandLogo';

type ProfileHeaderProps = {
  name: string;
  age: number;
  avatarSrc: string;
  dropdownOpen: boolean;
  onToggle: () => void;
  onLogout: () => void;
};

export function ProfileHeader({
  name,
  age,
  avatarSrc,
  dropdownOpen,
  onToggle,
  onLogout,
}: ProfileHeaderProps) {
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
        <Link href="/create" className="nav-link-btn" id="nav-create-link">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Create Room</span>
        </Link>
        <div className="nav-avatar-dropdown-wrap" id="nav-avatar-dropdown-wrap">
          <button
            type="button"
            className="nav-avatar-icon nav-avatar-btn"
            id="header-avatar-btn"
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
            title="Account Menu"
            onClick={onToggle}
          >
            {avatarSrc ? (
              <img className="profile-avatar-img" id="header-avatar-img" src={avatarSrc} alt="Avatar" />
            ) : (
              <span className="nav-avatar-text" id="header-avatar-initials">
                {name.charAt(0).toUpperCase() || 'A'}
              </span>
            )}
          </button>
          <div className={`avatar-dropdown-menu${dropdownOpen ? ' is-open' : ''}`} id="avatar-dropdown-menu" role="menu">
            <div className="dropdown-user-header">
              <div className="dropdown-user-name" id="dropdown-user-name">
                {name}
              </div>
              <div className="dropdown-user-meta" id="dropdown-user-meta">
                Host · {age} yrs
              </div>
            </div>
            <div className="dropdown-divider" />
            <Link href="/profile" className="dropdown-item" role="menuitem" id="dropdown-link-profile">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Profile</span>
            </Link>
            <button
              type="button"
              className="dropdown-item dropdown-item-danger"
              id="dropdown-btn-logout"
              role="menuitem"
              onClick={onLogout}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
