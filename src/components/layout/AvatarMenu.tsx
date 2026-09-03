'use client';

import { useState } from 'react';
import Link from 'next/link';

export function AvatarMenu({ initial = 'A' }: { initial?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="nav-avatar-dropdown-wrap">
      <button type="button" className="nav-avatar-icon nav-avatar-btn" aria-haspopup="menu" aria-expanded={open} aria-label="Account menu" onClick={() => setOpen((value) => !value)}>
        <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{initial}</span>
      </button>
      <div className={`avatar-dropdown-menu${open ? ' is-open' : ''}`} role="menu">
        <div className="dropdown-user-header"><div className="dropdown-user-name">Alex Morgan</div><div className="dropdown-user-meta">Host · 28 yrs</div></div>
        <div className="dropdown-divider" />
        <Link href="/profile" className="dropdown-item" role="menuitem">Profile</Link>
      </div>
    </div>
  );
}
