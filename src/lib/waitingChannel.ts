'use client';

import type { RealtimeChannel } from '@supabase/supabase-js';
import { getBrowserSupabase } from '@/lib/supabaseBrowser';

export interface WaitingPeer {
  guest_id: string;
  name: string;
  avatar_url: string | null;
}

export interface WaitingChat {
  id: string;
  guest_id: string;
  body: string;
  at: string;
}

interface WaitingChannelHandlers {
  onRoster?: (peers: WaitingPeer[]) => void;
  onChat: (chat: WaitingChat) => void;
  onEmoji: (guestId: string, emoji: string) => void;
  onProfile?: (peer: WaitingPeer) => void;
  onKicked?: (guestId: string) => void;
}

export interface WaitingChannel {
  broadcastChat: (chat: WaitingChat) => void;
  broadcastEmoji: (emoji: string) => void;
  broadcastProfile: (peer: WaitingPeer) => void;
  broadcastKicked: (guestId: string) => void;
  leave: () => void;
}

/** Live waiting-room channel: presence for roster, broadcast for chat/emoji/profile. */
export function joinWaitingChannel(
  code: string,
  self: WaitingPeer,
  handlers: WaitingChannelHandlers
): WaitingChannel | null {
  const supabase = getBrowserSupabase();
  if (!supabase) return null;

  const channel: RealtimeChannel = supabase.channel(`waiting:${code}`, {
    config: { presence: { key: self.guest_id }, broadcast: { self: false } },
  });

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState<WaitingPeer>();
      const peers = Object.values(state)
        .flat()
        .filter((peer) => peer.guest_id !== self.guest_id);
      handlers.onRoster?.(peers);
    })
    .on('broadcast', { event: 'chat' }, ({ payload }) => {
      const chat = payload as WaitingChat;
      if (chat.guest_id !== self.guest_id) handlers.onChat(chat);
    })
    .on('broadcast', { event: 'emoji' }, ({ payload }) => {
      const data = payload as { guest_id: string; emoji: string };
      if (data.guest_id !== self.guest_id) handlers.onEmoji(data.guest_id, data.emoji);
    })
    .on('broadcast', { event: 'profile' }, ({ payload }) => {
      const peer = payload as WaitingPeer;
      if (peer.guest_id !== self.guest_id) handlers.onProfile?.(peer);
    })
    .on('broadcast', { event: 'kicked' }, ({ payload }) => {
      const data = payload as { guest_id: string };
      handlers.onKicked?.(data.guest_id);
    })
    .subscribe((status) => {
      if ((status as string) === 'SUBSCRIBED') void channel.track(self);
    });

  return {
    broadcastChat: (chat) => {
      void channel.send({ type: 'broadcast', event: 'chat', payload: chat });
    },
    broadcastEmoji: (emoji) => {
      void channel.send({ type: 'broadcast', event: 'emoji', payload: { guest_id: self.guest_id, emoji } });
    },
    broadcastProfile: (peer) => {
      void channel.send({ type: 'broadcast', event: 'profile', payload: peer });
      void channel.track(peer);
    },
    broadcastKicked: (guestId: string) => {
      void channel.send({ type: 'broadcast', event: 'kicked', payload: { guest_id: guestId } });
    },
    leave: () => {
      void supabase.removeChannel(channel);
    },
  };
}
