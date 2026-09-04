'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getGuestId } from '@/lib/guest';
import { initialsOf } from '@/lib/avatar';
import { joinWaitingChannel, type WaitingChannel, type WaitingChat } from '@/lib/waitingChannel';
import { useToast } from '@/components/ui/ToastProvider';

export interface LiveParticipant {
  id: string;
  name: string;
  initials: string;
  color: string;
  avatarUrl: string | null;
  operator: boolean;
  isOperator: boolean;
  ready: boolean;
}

export interface LiveWaitingData {
  name: string;
  topic: string;
  status: string;
  sessionReady: boolean;
  participants: LiveParticipant[];
  /** Latest chat message per participant id (for speech balloons). */
  speech: Record<string, string>;
  selfId: string;
  /** True when you are the room operator (can kick players). */
  amOperator: boolean;
  /** True when the operator removed you from this room. */
  kicked: boolean;
  /** True when the operator left and dissolved the room (state returns 404). */
  dissolved: boolean;
  /** Latest remote emoji signal: who reacted with what. */
  lastEmoji: { guestId: string; emoji: string; nonce: number } | null;
  sendChat: (body: string) => void;
  sendEmoji: (emoji: string) => void;
  kickPlayer: (targetId: string) => void;
  playerReady: boolean;
  setPlayerReady: (ready: boolean) => void;
}

interface StatePayload {
  room?: { name?: unknown; topic?: unknown; status?: unknown };
  session?: { has_questions?: unknown };
  members?: { guest_id?: unknown; name?: unknown; avatar_url?: unknown; is_host?: unknown; is_operator?: unknown; ready?: unknown }[];
  messages?: { id?: unknown; guest_id?: unknown; body?: unknown }[];
}

const AVATAR_COLORS = ['avatar-color-indigo', 'avatar-color-cyan', 'avatar-color-amber'] as const;

function toParticipants(members: StatePayload['members'], selfId: string): LiveParticipant[] {
  const list = Array.isArray(members) ? members : [];
  return list.slice(0, 3).map((member, index) => {
    const guestId = typeof member.guest_id === 'string' ? member.guest_id : `unknown-${String(index)}`;
    const rawName = typeof member.name === 'string' && member.name ? member.name : 'Joining…';
    const isOperator = member.is_operator === true;
    const selfSuffix = guestId === selfId ? ' (You)' : '';
    const roleSuffix = isOperator ? ' · Operator' : '';
    return {
      id: guestId,
      name: `${rawName}${selfSuffix}${roleSuffix}`,
      initials: initialsOf(rawName),
      color: AVATAR_COLORS[index % AVATAR_COLORS.length] ?? 'avatar-color-indigo',
      avatarUrl: typeof member.avatar_url === 'string' ? member.avatar_url : null,
      operator: guestId === selfId,
      isOperator,
      ready: member.ready === true,
    };
  });
}

/** Live waiting-room data (backend + realtime). Returns null when offline/no code. */
export function useWaitingRoom(code: string | null): LiveWaitingData | null {
  const { showToast } = useToast();
  const [roomName, setRoomName] = useState('');
  const [roomTopic, setRoomTopic] = useState('');
  const [roomStatus, setRoomStatus] = useState('waiting');
  const [sessionReady, setSessionReady] = useState(false);
  const [participants, setParticipants] = useState<LiveParticipant[]>([]);
  const [speech, setSpeech] = useState<Record<string, string>>({});
  const [lastEmoji, setLastEmoji] = useState<LiveWaitingData['lastEmoji']>(null);
  const [kicked, setKicked] = useState(false);
  const [dissolved, setDissolved] = useState(false);
  const [ready, setReady] = useState(false);
  const channelRef = useRef<WaitingChannel | null>(null);
  const loadRef = useRef(() => { /* replaced with the state loader below */ });
  const joinedOnceRef = useRef(false);
  // Pending ready toggle: the 2s poll must not overwrite our optimistic value
  // with stale server state before the POST lands.
  const pendingReadyRef = useRef<{ value: boolean; at: number } | null>(null);
  const toastRef = useRef(showToast);
  useEffect(() => {
    toastRef.current = showToast;
  }, [showToast]);

  const selfId = getGuestId();

  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    const load = () => {
      void fetch(`/api/rooms/${encodeURIComponent(code)}/state?guest_id=${encodeURIComponent(selfId)}`)
        .then(async (response) => {
          if (cancelled) return;
          // Room gone while we were joined means the operator dissolved it.
          if (response.status === 404) {
            if (joinedOnceRef.current) {
              setDissolved(true);
              setReady(true);
            }
            return;
          }
          if (!response.ok) return;
          const payload = (await response.json()) as StatePayload;
          if (typeof payload.room?.name === 'string') setRoomName(payload.room.name);
          if (typeof payload.room?.topic === 'string') setRoomTopic(payload.room.topic);
          if (typeof payload.room?.status === 'string') setRoomStatus(payload.room.status);
          setSessionReady(payload.session?.has_questions === true);
          const next = toParticipants(payload.members, selfId);
          const pending = pendingReadyRef.current;
          if (pending && Date.now() - pending.at < 8000) {
            const server = next.find((member) => member.id === selfId)?.ready ?? false;
            if (server === pending.value) pendingReadyRef.current = null;
            else {
              const fixed = next.map((member) => member.id === selfId ? { ...member, ready: pending.value } : member);
              setParticipants(fixed);
              return;
            }
          }
          setParticipants(next);
          // Safety net: seat gone while we were joined means we were kicked.
          if (next.some((member) => member.id === selfId)) joinedOnceRef.current = true;
          else if (joinedOnceRef.current) setKicked(true);
          setReady(true);
          const messages = Array.isArray(payload.messages) ? payload.messages : [];
          setSpeech((current) => {
            const speechNext = { ...current };
            for (const message of messages) {
              if (typeof message.guest_id === 'string' && typeof message.body === 'string') {
                speechNext[message.guest_id] = message.body;
              }
            }
            return speechNext;
          });
        })
        .catch(() => { /* offline: fallback UI stays */ });
    };
    loadRef.current = load;
    const beat = () => {
      void fetch(`/api/rooms/${encodeURIComponent(code)}/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guest_id: selfId }),
      }).catch(() => { /* offline: fallback UI stays */ });
    };
    load();
    beat();
    // Session publication is the hand-off from waiting to the live view;
    // keep this poll short so participants do not sit on stale waiting UI.
    const stateTimer = window.setInterval(load, 2000);
    const beatTimer = window.setInterval(beat, 20000);
    return () => {
      cancelled = true;
      window.clearInterval(stateTimer);
      window.clearInterval(beatTimer);
    };
  }, [code, selfId]);

  useEffect(() => {
    if (!code) return;
    const channel = joinWaitingChannel(
      code,
      { guest_id: selfId, name: '', avatar_url: null },
      {
        onChat: (chat: WaitingChat) => {
          setSpeech((current) => ({ ...current, [chat.guest_id]: chat.body }));
        },
        onEmoji: (guestId: string, emoji: string) => {
          setLastEmoji({ guestId, emoji, nonce: Date.now() });
        },
        onKicked: (guestId: string) => {
          if (guestId === selfId) setKicked(true);
          else loadRef.current();
        },
      }
    );
    channelRef.current = channel;
    return () => {
      channel?.leave();
      channelRef.current = null;
    };
  }, [code, selfId]);

  const sendChat = useCallback(
    (body: string) => {
      if (!code) return;
      const clean = body.trim();
      if (!clean) return;
      setSpeech((current) => ({ ...current, [selfId]: clean }));
      void fetch(`/api/rooms/${encodeURIComponent(code)}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guest_id: selfId, type: 'chat', body: clean }),
      })
        .then(async (response) => {
          const payload = (await response.json().catch(() => null)) as {
            event?: WaitingChat;
            error?: unknown;
          } | null;
          if (!response.ok || !payload?.event) {
            toastRef.current(typeof payload?.error === 'string' ? payload.error : 'Could not send the message.', 'error');
            return;
          }
          channelRef.current?.broadcastChat(payload.event);
        })
        .catch(() => {
          toastRef.current('Could not send the message.', 'error');
        });
    },
    [code, selfId]
  );

  const sendEmoji = useCallback(
    (emoji: string) => {
      if (!code) return;
      channelRef.current?.broadcastEmoji(emoji);
      void fetch(`/api/rooms/${encodeURIComponent(code)}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guest_id: selfId, type: 'emoji', emoji }),
      }).catch(() => { /* offline: fallback UI stays */ });
    },
    [code, selfId]
  );

  const kickPlayer = useCallback(
    (targetId: string) => {
      if (!code || targetId === selfId) return;
      void fetch(`/api/rooms/${encodeURIComponent(code)}/kick`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guest_id: selfId, target_guest_id: targetId }),
      })
        .then(async (response) => {
          const payload = (await response.json().catch(() => null)) as {
            removed?: unknown;
            error?: unknown;
          } | null;
          if (!response.ok) {
            toastRef.current(typeof payload?.error === 'string' ? payload.error : 'Could not remove the participant.', 'error');
            return;
          }
          channelRef.current?.broadcastKicked(targetId);
          loadRef.current();
          toastRef.current(typeof payload?.removed === 'string' ? `${payload.removed} was removed.` : 'Participant removed.');
        })
        .catch(() => {
          toastRef.current('Could not remove the participant.', 'error');
        });
    },
    [code, selfId]
  );

  const amOperator = participants.some((member) => member.id === selfId && member.isOperator);
  const playerReady = participants.find((member) => member.id === selfId)?.ready ?? false;
  const setPlayerReady = useCallback((nextReady: boolean) => {
    if (!code || amOperator) return;
    pendingReadyRef.current = { value: nextReady, at: Date.now() };
    setParticipants((current) => current.map((member) => member.id === selfId ? { ...member, ready: nextReady } : member));
    void fetch(`/api/rooms/${encodeURIComponent(code)}/ready`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guest_id: selfId, ready: nextReady }),
    }).then(async (response) => {
      if (response.ok) {
        loadRef.current();
        return;
      }
      pendingReadyRef.current = null;
      const payload = (await response.json().catch(() => null)) as { error?: unknown } | null;
      toastRef.current(typeof payload?.error === 'string' ? payload.error : 'Could not update ready status.', 'error');
      loadRef.current();
    }).catch(() => {
      pendingReadyRef.current = null;
      toastRef.current('Could not update ready status.', 'error');
      loadRef.current();
    });
  }, [amOperator, code, selfId]);

  return useMemo(() => {
    if (!code || !ready) return null;
    return { name: roomName, topic: roomTopic, status: roomStatus, sessionReady, participants, speech, selfId, amOperator, kicked, dissolved, lastEmoji, sendChat, sendEmoji, kickPlayer, playerReady, setPlayerReady };
  }, [code, ready, roomName, roomTopic, roomStatus, sessionReady, participants, speech, selfId, amOperator, kicked, dissolved, lastEmoji, sendChat, sendEmoji, kickPlayer, playerReady, setPlayerReady]);
}
