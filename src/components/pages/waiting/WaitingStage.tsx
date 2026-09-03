'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/ToastProvider';
import { copyText } from '@/lib/clipboard';

interface Group {
  id: number;
  name: string;
  isSourceOfTruth: boolean;
  roles: string[];
}

interface Room {
  code: string;
  name: string;
  topic?: string;
  participantMode?: 'flexible' | 'fixed';
  participantCount?: number;
  groups?: Group[];
}

interface Participant {
  id: string;
  name: string;
  initials: string;
  group: string;
  role: string;
  color: string;
  operator?: boolean;
  sot?: boolean;
}

const mockProfiles = [
  ['Elena Rostova', 'ER', 'avatar-color-cyan'],
  ['Marcus Vance', 'MV', 'avatar-color-amber'],
  ['Siti Sarah', 'SS', 'avatar-color-rose'],
  ['David Chen', 'DC', 'avatar-color-purple'],
] as const satisfies readonly (readonly [string, string, string])[];

function getMockProfile(index: number): readonly [string, string, string] {
  const profile = mockProfiles[index % mockProfiles.length];
  return profile ?? mockProfiles[0];
}

const reactions = ['👋', '☕', '🚀', '💡', '🔥', '🎉', '❤️', '👏'];

function makeParticipants(room: Room): Participant[] {
  const defaultGroup: Group = { id: 1, name: 'General', isSourceOfTruth: true, roles: ['Participant'] };
  const groups = room.groups?.length ? room.groups : [defaultGroup];
  const source = groups.find((group) => group.isSourceOfTruth) ?? groups[0] ?? defaultGroup;
  const initialRole = source.roles[0] ?? 'Host';
  const result: Participant[] = [{
    id: 'p1',
    name: 'You (Operator)',
    initials: 'AR',
    group: source.name,
    role: initialRole,
    color: 'avatar-color-indigo',
    operator: true,
    sot: source.isSourceOfTruth,
  }];

  let profileIndex = 0;
  for (const group of groups.filter((item) => item.id !== source.id)) {
    const roles = group.roles.length ? group.roles : ['Contributor'];
    for (const role of roles) {
      if (result.length >= 5) break;
      if (group.id === source.id && role === initialRole) continue;
      const [name, initials, color] = getMockProfile(profileIndex++);
      result.push({
        id: `p${String(result.length + 1)}`,
        name,
        initials,
        group: group.name,
        role,
        color,
        sot: group.isSourceOfTruth,
      });
    }
  }

  for (const role of source.roles.slice(1)) {
    if (result.length >= 5) break;
    const [name, initials, color] = getMockProfile(profileIndex++);
    result.push({
      id: `p${String(result.length + 1)}`,
      name,
      initials,
      group: source.name,
      role,
      color,
      sot: true,
    });
  }

  while (result.length < 5) {
    const [name, initials, color] = getMockProfile(profileIndex++);
    result.push({
      id: `p${String(result.length + 1)}`,
      name,
      initials,
      group: 'General',
      role: 'Participant',
      color,
    });
  }

  return result;
}

interface EmojiParticle {
  id: string;
  emoji: string;
  left: number;
  top: number;
  sway: string;
  fontSize: string;
  delay: string;
  duration: string;
}

export function WaitingStage({ room, onShare }: { room: Room; onShare: () => void }) {
  const router = useRouter();
  const { showToast } = useToast();
  const operatorCardRef = useRef<HTMLDivElement>(null);
  const participants = useMemo(() => makeParticipants(room), [room]);
  const [comment, setComment] = useState('');
  const [speech, setSpeech] = useState<Record<string, string>>({ p1: 'Ready to launch whenever everyone is here!' });
  const [particles, setParticles] = useState<EmojiParticle[]>([]);
  const [launching, setLaunching] = useState(false);

  const joinedLabel = room.participantMode === 'fixed'
    ? `4 of ${String(room.participantCount ?? 10)} joined`
    : '4 joined (Open capacity)';

  const triggerReaction = (emoji: string) => {
    const rect = operatorCardRef.current?.getBoundingClientRect()
      ?? document.querySelector('.participant-bubble-card:first-child')?.getBoundingClientRect()
      ?? { left: window.innerWidth / 2 - 40, top: window.innerHeight * 0.45, width: 80, height: 80 };

    const newParticles: EmojiParticle[] = Array.from({ length: 4 }).map((_, i) => {
      const startX = rect.left + rect.width / 2 + (Math.random() * 44 - 22);
      const startY = rect.top + (Math.random() * 20 - 10);
      const swayPx = `${String(Math.random() * 100 - 50)}px`;
      return {
        id: `${String(Date.now())}-${String(Math.random())}-${String(i)}`,
        emoji,
        left: startX,
        top: startY,
        sway: swayPx,
        fontSize: `${String(1.8 + Math.random() * 1.0)}rem`,
        delay: `${String(i * 0.08)}s`,
        duration: `${String(2.6 + Math.random() * 0.5)}s`,
      };
    });

    setParticles((current) => [...current, ...newParticles]);
    window.setTimeout(() => {
      const idsToRemove = new Set(newParticles.map((p) => p.id));
      setParticles((current) => current.filter((p) => !idsToRemove.has(p.id)));
    }, 3400);
  };

  const submitComment = (event: React.SyntheticEvent) => {
    event.preventDefault();
    const clean = comment.trim();
    if (!clean) return;
    setSpeech((current) => ({ ...current, p1: clean }));
    setComment('');
    window.setTimeout(() => {
      setSpeech((current) => ({ ...current, p2: 'Getting ready for the session.' }));
    }, 1200);
  };

  const copyInvite = async () => {
    const invite = `${window.location.origin}/join?code=${encodeURIComponent(room.code)}`;
    if (await copyText(invite)) showToast('Invite link copied');
    else showToast('Clipboard permission was not granted', 'error');
  };

  const launch = () => {
    setLaunching(true);
    showToast('Launching session for all participants…');
    window.setTimeout(() => {
      router.push('/session');
    }, 900);
  };

  return (
    <main className="waiting-canvas-wrapper">
      <div className="waiting-hero-block">
        <div className="waiting-status-pill">
          <span className="pulsing-live-dot" aria-hidden="true" />
          <span>{launching ? 'Starting session' : 'Waiting for participants to get ready'}</span>
        </div>
        <h1 className="waiting-room-title">{room.name}</h1>
        <div className="waiting-meta-bar">
          <span className="waiting-meta-item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>{joinedLabel}</span>
          </span>
          <span className="meta-dot">•</span>
          <span className="waiting-meta-item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>{room.topic ?? 'General'}</span>
          </span>
        </div>
      </div>
      <section className="participant-bubble-stage" aria-label="Participants in waiting room">
        <div className="bubbles-flex-grid">
          {participants.map((participant) => (
            <div
              className="participant-bubble-card"
              key={participant.id}
              ref={participant.operator ? operatorCardRef : undefined}
            >
              <div className={`bubble-speech-balloon${speech[participant.id] ? ' active' : ''}`}>
                {speech[participant.id]}
              </div>
              <div
                className={`bubble-avatar-frame${participant.operator ? ' is-operator' : ''}${
                  participant.sot ? ' is-sot' : ''
                }`}
              >
                <div className={`bubble-avatar-inner ${participant.color}`}>{participant.initials}</div>
                <span className="bubble-online-dot" title="Online now" />
                {participant.sot && (
                  <div className="bubble-crown-badge" title="Source of Truth Benchmark Group">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span>SOT</span>
                  </div>
                )}
              </div>
              <div className="bubble-info-block">
                <div className="bubble-participant-name">{participant.name}</div>
                <div
                  className={`bubble-tag-pill${
                    participant.sot ? ' sot-pill' : participant.operator ? ' operator-pill' : ''
                  }`}
                >
                  <span>{participant.group} • {participant.role}</span>
                </div>
              </div>
            </div>
          ))}
          <button type="button" className="participant-bubble-card" onClick={onShare} title="Invite a teammate">
            <div className="bubble-avatar-frame is-add-slot">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <div className="bubble-info-block">
              <div className="bubble-participant-name" style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Open Seat</div>
              <div className="bubble-tag-pill" style={{ borderStyle: 'dashed' }}>+ Share Link</div>
            </div>
          </button>
        </div>
      </section>
      <div className="waiting-dock-container">
        <div className="waiting-dock-card">
          <div className="emoji-reaction-bar" aria-label="Send live emoji reaction">
            <span className="dock-label-tiny">React:</span>
            <div className="emoji-buttons-row">
              {reactions.map((emoji) => (
                <button
                  type="button"
                  className="btn-emoji-react"
                  key={emoji}
                  title={`React ${emoji}`}
                  onClick={() => { triggerReaction(emoji); }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <div className="dock-divider-v" aria-hidden="true" />
          <form className="waiting-comment-form" onSubmit={submitComment}>
            <input
              type="text"
              className="waiting-comment-input"
              placeholder="Say something while waiting..."
              aria-label="Say something while waiting"
              maxLength={100}
              value={comment}
              onChange={(event) => { setComment(event.target.value); }}
            />
            <button type="submit" className="btn-send-comment" title="Send message" aria-label="Send message">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
          <div className="dock-divider-v" aria-hidden="true" />
          <div className="waiting-launch-area">
            <button type="button" className="btn-launch-session" onClick={launch} disabled={launching}>
              <span>{launching ? 'Starting session…' : 'Launch Session'}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </button>
          </div>
        </div>
        <div className="waiting-sub-actions">
          <button
            type="button"
            className="btn-sub-action"
            onClick={() => { void copyInvite(); }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span>Copy Invite Link</span>
          </button>
          <Link href="/" className="btn-sub-action leave-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Leave Room</span>
          </Link>
        </div>
      </div>
      {particles.length > 0 && (
        <div className="emoji-fountain-layer" aria-hidden="true">
          {particles.map((particle) => (
            <span
              className="floating-emoji-item"
              key={particle.id}
              style={{
                left: `${String(particle.left)}px`,
                top: `${String(particle.top)}px`,
                fontSize: particle.fontSize,
                animationDelay: particle.delay,
                animationDuration: particle.duration,
                ['--sway' as string]: particle.sway,
              }}
            >
              {particle.emoji}
            </span>
          ))}
        </div>
      )}
    </main>
  );
}
