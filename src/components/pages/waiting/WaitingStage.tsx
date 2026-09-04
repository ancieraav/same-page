'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/ui/ToastProvider';
import { copyText } from '@/lib/clipboard';
import { PAIR_MODE, PAIR_SIZE } from '@/lib/pairMode';
import { WAITING_EMOJIS } from '@/lib/waiting';
import { EmojiFountain, type EmojiParticle } from './EmojiFountain';
import { LaunchBlockedModal } from './LaunchBlockedModal';
import type { LiveWaitingData } from './useWaitingRoom';
import {
  makeFallbackParticipants,
  type FallbackParticipant,
  type WaitingRoomInfo,
} from './waitingFallback';

type Room = WaitingRoomInfo;
type Participant = FallbackParticipant;

const reactions = [...WAITING_EMOJIS];

interface EmojiBurst {
  emoji: string;
  participantId: string;
}

export function WaitingStage({ room, onShare, live, onLeave, isLiveRoom = false }: { room: Room; onShare: () => void; live: LiveWaitingData | null; onLeave?: () => void; isLiveRoom?: boolean }) {
  const { showToast } = useToast();
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const mockParticipants = useMemo(() => makeFallbackParticipants(room), [room]);
  // Live room but data not loaded yet: never show mock profiles (Alex Morgan
  // et al). Show a single joining placeholder instead.
  const joiningPlaceholder: Participant[] = [{
    id: 'self',
    name: 'Joining…',
    initials: '…',
    group: '',
    role: '',
    color: 'avatar-color-indigo',
    avatarUrl: null,
    operator: true,
  }];
  const participants: Participant[] = live
    ? live.participants.map((peer) => ({
        id: peer.id,
        name: peer.name,
        initials: peer.initials,
        group: '',
        role: '',
        color: peer.color,
        avatarUrl: peer.avatarUrl,
        operator: peer.operator,
      }))
    : isLiveRoom
      ? joiningPlaceholder
      : mockParticipants;
  const selfId = live?.selfId ?? participants.find((item) => item.operator)?.id ?? 'p1';
  const [comment, setComment] = useState('');
  const [localSpeech, setLocalSpeech] = useState<Record<string, string>>(
    live ? {} : { p1: 'Ready to launch whenever everyone is here!' }
  );
  const speech = live ? live.speech : localSpeech;
  const [particles, setParticles] = useState<EmojiParticle[]>([]);
  const [launchBlocked, setLaunchBlocked] = useState(false);
  const [kickMenuId, setKickMenuId] = useState<string | null>(null);
  const [kickConfirm, setKickConfirm] = useState(false);

  const amOperator = live?.amOperator ?? false;
  const isLivePlayer = live !== null && !amOperator;
  const isLoadingLiveSeat = isLiveRoom && live === null;
  const isKickable = (participantId: string) =>
    amOperator && live !== null && participantId !== selfId;

  const joinedLabel = live
    ? `${String(live.participants.filter((peer) => !peer.isOperator).length)} of ${String(PAIR_SIZE)} players joined · ${String(live.participants.filter((peer) => !peer.isOperator && peer.ready).length)} ready`
    : PAIR_MODE
    ? `${String(PAIR_SIZE)} of ${String(PAIR_SIZE)} joined`
    : room.participantMode === 'fixed'
    ? `4 of ${String(room.participantCount ?? 10)} joined`
    : '4 joined (Open capacity)';

  const spawnBurst = ({ emoji, participantId }: EmojiBurst) => {
    const rect = cardRefs.current[participantId]?.getBoundingClientRect()
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

  const triggerReaction = (emoji: string, participantId: string = selfId) => {
    spawnBurst({ emoji, participantId });
  };

  useEffect(() => {
    if (live?.lastEmoji) {
      spawnBurst({ emoji: live.lastEmoji.emoji, participantId: live.lastEmoji.guestId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live?.lastEmoji?.nonce]);

  const submitComment = (event: React.SyntheticEvent) => {
    event.preventDefault();
    const clean = comment.trim();
    if (!clean) return;
    if (live) {
      live.sendChat(clean);
      setComment('');
      return;
    }
    setLocalSpeech((current) => ({ ...current, p1: clean }));
    setComment('');
    window.setTimeout(() => {
      setLocalSpeech((current) => ({ ...current, p2: 'Getting ready for the session.' }));
    }, 1200);
  };

  const copyInvite = async () => {
    const invite = `${window.location.origin}/join?code=${encodeURIComponent(room.code)}`;
    if (await copyText(invite)) showToast('Invite link copied');
    else showToast('Clipboard permission was not granted', 'error');
  };

  const launch = () => {
    if (isLivePlayer) return;
    // Manual launch is disabled — only the AI agent may start via WebMCP.
    setLaunchBlocked(true);
  };

  return (
    <main className="waiting-canvas-wrapper">
      <div className="waiting-hero-block">
        <div className="waiting-status-pill">
          <span className="pulsing-live-dot" aria-hidden="true" />
          <span>Waiting for participants to get ready</span>
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
              className={`participant-bubble-card${isKickable(participant.id) ? ' is-kickable' : ''}`}
              key={participant.id}
              ref={(node) => {
                cardRefs.current[participant.id] = node;
              }}
              onClick={() => {
                if (!isKickable(participant.id)) return;
                setKickMenuId((current) => (current === participant.id ? null : participant.id));
                setKickConfirm(false);
              }}
              role={isKickable(participant.id) ? 'button' : undefined}
              tabIndex={isKickable(participant.id) ? 0 : undefined}
              aria-label={isKickable(participant.id) ? `Manage ${participant.name}` : undefined}
            >
              <div className={`bubble-speech-balloon${speech[participant.id] ? ' active' : ''}`}>
                {speech[participant.id]}
              </div>
              <div
                className={`bubble-avatar-frame${participant.operator && !PAIR_MODE ? ' is-operator' : ''}${
                  participant.sot && !PAIR_MODE ? ' is-sot' : ''
                }`}
              >
                {participant.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="bubble-avatar-photo" src={participant.avatarUrl} alt={participant.name} />
                ) : (
                  <div className={`bubble-avatar-inner ${participant.color}`}>{participant.initials}</div>
                )}
                <span className="bubble-online-dot" title="Online now" />
                {/* REVIVE: SOT crown badge (hidden in PAIR_MODE) */}
                {!PAIR_MODE && participant.sot && (
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
                {/* REVIVE: group • role pill (hidden in PAIR_MODE) */}
                {!PAIR_MODE && (
                <div
                  className={`bubble-tag-pill${
                    participant.sot ? ' sot-pill' : participant.operator ? ' operator-pill' : ''
                  }`}
                >
                  <span>{participant.group} • {participant.role}</span>
                </div>
                )}
              </div>
              {kickMenuId === participant.id && live && (
                <div className="kick-menu" role="menu" aria-label={`Manage ${participant.name}`}>
                  {!kickConfirm ? (
                    <button
                      type="button"
                      className="kick-menu-btn"
                      onClick={(event) => {
                        event.stopPropagation();
                        setKickConfirm(true);
                      }}
                    >
                      Kick from room
                    </button>
                  ) : (
                    <div className="kick-confirm-row">
                      <span className="kick-confirm-text">Remove {participant.name}?</span>
                      <div className="kick-confirm-actions">
                        <button
                          type="button"
                          className="kick-confirm-yes"
                          onClick={(event) => {
                            event.stopPropagation();
                            live.kickPlayer(participant.id);
                            setKickMenuId(null);
                            setKickConfirm(false);
                          }}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          className="kick-confirm-no"
                          onClick={(event) => {
                            event.stopPropagation();
                            setKickConfirm(false);
                          }}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {/* REVIVE: Open Seat invite slot for +3 multi-user (hidden in PAIR_MODE, room is 2/2 full) */}
          {!PAIR_MODE && (
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
          )}
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
                  onClick={() => {
                    triggerReaction(emoji, selfId);
                    live?.sendEmoji(emoji);
                  }}
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
            {isLivePlayer ? (
              <button
                type="button"
                className="btn-launch-session"
                aria-pressed={live.playerReady}
                disabled={live.status !== 'waiting'}
                onClick={() => { live.setPlayerReady(!live.playerReady); }}
              >
                <span>{live.status !== 'waiting' ? 'Starting…' : live.playerReady ? 'Ready ✓' : 'I’m Ready'}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </button>
            ) : isLoadingLiveSeat ? (
              <div className="waiting-ready-state" role="status" aria-live="polite">
                <span className="waiting-ready-copy">
                  <strong>Checking your seat…</strong>
                  <small>Loading the waiting-room status.</small>
                </span>
              </div>
            ) : (
              <button type="button" className="btn-launch-session" onClick={launch}>
                <span>Launch Session</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </button>
            )}
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
          <Link href="/" className="btn-sub-action leave-link" onClick={() => { onLeave?.(); }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Leave Room</span>
          </Link>
        </div>
      </div>
      <EmojiFountain particles={particles} />
      {launchBlocked && (
        <LaunchBlockedModal roomCode={room.code} onClose={() => { setLaunchBlocked(false); }} />
      )}
    </main>
  );
}
