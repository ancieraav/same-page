
'use client';

export interface TeammateItem {
  guest_id: string;
  name: string;
  initials: string;
  color: string;
  avatar_url?: string | null | undefined;
  done: boolean;
  isSelf: boolean;
}

export interface SessionAvatarStackProps {
  players?: { guest_id: string; name: string; avatar_url?: string | null | undefined }[] | undefined;
  submitted?: string[] | undefined;
  selfId?: string | undefined;
}

const AVATAR_COLORS = [
  'avatar-color-indigo',
  'avatar-color-cyan',
  'avatar-color-amber',
  'avatar-color-rose',
  'avatar-color-purple',
  'avatar-color-emerald',
] as const;

function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'P';
  if (parts.length === 1) {
    const single = parts[0] ?? '';
    return single.slice(0, 2).toUpperCase();
  }
  const first = parts[0] ?? '';
  const last = parts[parts.length - 1] ?? '';
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}

const FALLBACK_TEAMMATES: TeammateItem[] = [
  { guest_id: 'you', name: 'You', initials: 'AR', color: 'avatar-color-indigo', done: false, isSelf: true },
  { guest_id: 'alex', name: 'Alex', initials: 'AL', color: 'avatar-color-cyan', done: true, isSelf: false },
];

export function SessionAvatarStack({ players, submitted, selfId }: SessionAvatarStackProps) {
  let teammates: TeammateItem[];

  if (players && players.length > 0) {
    teammates = players.map((player, index) => {
      const isSelf = player.guest_id === selfId;
      const done = (submitted ?? []).includes(player.guest_id);
      const name = isSelf ? 'You' : player.name || `Participant ${String(index + 1)}`;
      return {
        guest_id: player.guest_id,
        name,
        initials: deriveInitials(player.name || (isSelf ? 'You' : `P${String(index + 1)}`)),
        color: AVATAR_COLORS[index % AVATAR_COLORS.length] ?? 'avatar-color-indigo',
        avatar_url: player.avatar_url,
        done,
        isSelf,
      };
    });
  } else {
    teammates = FALLBACK_TEAMMATES;
  }

  return (
    <div className="avatar-stack-row" id="avatar-stack-row">
      {teammates.map((teammate, index) => (
        <div
          key={teammate.guest_id}
          className={`stacked-avatar-circle ${teammate.color}${teammate.done ? ' is-answered' : ''}`}
          style={{ zIndex: teammates.length - index }}
          title={`${teammate.name} (${teammate.done ? 'Submitted response' : 'Writing response...'})`}
        >
          {teammate.avatar_url ? (
            <img src={teammate.avatar_url} alt={teammate.name} className="stacked-avatar-img" />
          ) : (
            <span>{teammate.initials}</span>
          )}
          {teammate.done && (
            <div className="stacked-avatar-check">
              <svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
