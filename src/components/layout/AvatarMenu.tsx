'use client';

export function AvatarMenu({ initial = 'A' }: { initial?: string }) {
  return (
    <div className="nav-avatar-icon" aria-hidden="true">
      <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{initial}</span>
    </div>
  );
}

