'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { copyText } from '@/lib/clipboard';
import { getGuestId } from '@/lib/guest';
import { readStored } from '@/lib/storage';
import { useToast } from '@/components/ui/ToastProvider';
import { AmbientBackground } from '@/components/layout/AmbientBackground';
import { WaitingHeader } from './WaitingHeader';
import { WaitingStage } from './WaitingStage';
import { ShareInviteModal } from './ShareInviteModal';
import { ShareRolesModal } from './ShareRolesModal';
import { useWaitingRoom } from './useWaitingRoom';
import { useSessionWebMCP } from './useSessionWebMCP';
import { PAIR_MODE } from '@/lib/pairMode';
import { durationLabel, secondsElapsed } from '@/lib/session';

interface Room {
  code: string;
  name: string;
  topic: string;
  notes?: string;
  participantMode?: 'flexible' | 'fixed';
  participantCount?: number;
  groups?: { id: number; name: string; isSourceOfTruth: boolean; roles: string[] }[];
  attachments?: { name: string; size?: string; ext?: string; isImage?: boolean }[];
}

// REVIVE: full multi-group fallback with SOT + roles (hidden in PAIR_MODE).
const fallbackRoom: Room = {
  code: 'SP-7942',
  name: 'Design Alignment Sync',
  topic: 'Product Strategy',
  participantMode: 'fixed',
  participantCount: 2,
  notes: 'Please review the attached strategy brief before voting on upcoming questions.',
  groups: [],
  attachments: [{ name: 'Q3_Product_Strategy_Deck.pdf', size: '2.4 MB', ext: 'PDF' }],
};

// Waiting-room WebMCP surface for everyone; the operator additionally gets
// start_session + kick_participant. Session-only tools hint "not yet".
function WaitingSessionTools({
  code,
  live,
  goHome,
}: {
  code: string;
  live: ReturnType<typeof useWaitingRoom>;
  goHome: () => void;
}) {
  useSessionWebMCP({
    getCode: () => code,
    getGuestId,
    isOperator: () => live?.amOperator === true,
    getStatus: () => live?.status ?? 'waiting',
    goHome,
    phase: 'waiting',
    watchKey: `${live?.amOperator === true ? 'op' : 'player'}:${live?.status ?? 'loading'}`,
  });
  return null;
}

export function WaitingPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [room, setRoom] = useState<Room>(fallbackRoom);
  const [clock, setClock] = useState(() => Date.now());
  const [shareOpen, setShareOpen] = useState(false);

  const queryCode = params.get('code');
  const live = useWaitingRoom(queryCode);
  const hasLive = live !== null;
  const liveKicked = live?.kicked ?? false;
  const liveDissolved = live?.dissolved ?? false;
  const liveSessionReady = live?.sessionReady ?? false;
  const liveStatus = live?.status ?? 'waiting';

  useEffect(() => {
    const stored = readStored<Partial<Room> | null>('samepage_active_room', null);
    if (stored) {
      window.queueMicrotask(() => { setRoom((current) => ({ ...current, ...stored, code: stored.code ?? current.code })); });
    }
    if (queryCode) {
      window.queueMicrotask(() => { setRoom((current) => ({ ...current, code: queryCode })); });
    }
  }, [queryCode]);

  useEffect(() => {
    if (live) {
      const name = live.name || room.name;
      const topic = live.topic || room.topic;
      if (name !== room.name || topic !== room.topic || live.participants.length > 0) {
        window.queueMicrotask(() => {
          setRoom((current) => ({ ...current, name, topic }));
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live?.name, live?.topic]);

  useEffect(() => {
    if (live?.kicked) {
      showToast('You were removed from this room by the operator.', 'error');
      router.push('/');
    }
  }, [live?.kicked, router, showToast]);

  useEffect(() => {
    if (live?.dissolved) {
      showToast('The operator left, so this room was closed.', 'error');
      router.push('/');
    }
  }, [live?.dissolved, router, showToast]);

  useEffect(() => {
    // The live session keeps the role-aware WebMCP roadmap mounted after this hand-off.
    if (!queryCode || !hasLive || liveKicked || liveDissolved) return;
    if (!liveSessionReady && liveStatus === 'waiting') return;
    router.replace(`/session?code=${encodeURIComponent(queryCode)}`);
  }, [hasLive, liveDissolved, liveKicked, liveSessionReady, liveStatus, queryCode, router]);

  useEffect(() => {
    const timer = window.setInterval(() => { setClock(Date.now()); }, 1000);
    return () => { window.clearInterval(timer); };
  }, []);

  const duration = durationLabel(secondsElapsed(live?.timerStartedAt, null, clock));

  const copyCode = async () => {
    if (await copyText(room.code)) showToast('Room code copied');
    else showToast('Clipboard permission was not granted', 'error');
  };

  const copyRole = async (value: string, label: string) => {
    if (await copyText(value)) showToast(`${label} copied`);
    else showToast('Clipboard permission was not granted', 'error');
  };

  const leaveRoom = () => {
    if (!queryCode) return;
    void fetch(`/api/rooms/${encodeURIComponent(queryCode)}/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guest_id: getGuestId() }),
    }).catch(() => { /* offline: fallback UI stays */ });
  };

  return (
    <>
      <AmbientBackground />
      <WaitingHeader
        roomCode={room.code}
        duration={duration}
        presenceLabel={live ? `${String(live.participants.filter((participant) => !participant.isOperator).length)}/${String(PAIR_MODE ? 2 : room.participantCount ?? 2)} players` : '2/2 Ready'}
        onShare={() => { setShareOpen(true); }}
        onCopy={() => { void copyCode(); }}
      />
      <WaitingStage room={room} onShare={() => { setShareOpen(true); }} live={live} isLiveRoom={Boolean(queryCode)} onLeave={leaveRoom} />
      {queryCode ? <WaitingSessionTools code={queryCode} live={live} goHome={() => { router.push('/'); }} /> : null}
      {shareOpen && PAIR_MODE && (
        <ShareInviteModal
          roomCode={room.code}
          onClose={() => { setShareOpen(false); }}
          onCopy={(value, label) => { void copyRole(value, label); }}
        />
      )}
      {shareOpen && !PAIR_MODE && (
        <ShareRolesModal
          roomCode={room.code}
          groups={room.groups ?? []}
          onClose={() => { setShareOpen(false); }}
          onCopyRole={(value, label) => { void copyRole(value, label); }}
        />
      )}
    </>
  );
}
