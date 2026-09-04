import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabaseServer';
import { bad, findRoomByCode, guestIdOf, resolveRoomAttachments } from '@/lib/waitingServer';
import { getSessionQuestions } from '@/lib/sessionServer';

/** Full waiting-room state: room, active members, recent chat + reactions. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const guestId = guestIdOf(new URL(request.url).searchParams.get('guest_id'));

  let room;
  try {
    room = await findRoomByCode(code);
  } catch {
    return bad('Backend is not configured yet.', 503);
  }
  if (!room) return bad('Room not found.', 404);

  const supabase = getServiceSupabase();
  const [members, messages, reactions, sessionQuestions] = await Promise.all([
    supabase
      .from('room_members')
      .select('guest_id, name, avatar_url, is_host, is_operator, ready, last_seen_at, joined_at')
      .eq('room_id', room.id)
      .is('left_at', null)
      .order('joined_at', { ascending: true }),
    supabase
      .from('waiting_messages')
      .select('id, guest_id, body, created_at')
      .eq('room_id', room.id)
      .order('created_at', { ascending: false })
      .limit(30),
    supabase
      .from('waiting_reactions')
      .select('id, guest_id, emoji, created_at')
      .eq('room_id', room.id)
      .order('created_at', { ascending: false })
      .limit(20),
    getSessionQuestions(room.id),
  ]);

  const onlineCutoff = Date.now() - 90_000;
  const attachments = await resolveRoomAttachments(room.attachments);
  const activeMembers = members.data ?? [];
  const operator = activeMembers.find((member) => member.is_operator === true);
  return NextResponse.json({
    room: {
      code: room.code,
      name: room.name,
      topic: room.topic,
      notes: room.notes,
      status: room.status,
      timer_started_at: (operator?.joined_at as string | undefined) ?? room.created_at,
      attachments,
    },
    session: {
      has_questions: sessionQuestions.length > 0,
      current: sessionQuestions.find((question) => question.status === 'active') ?? null,
    },
    self: guestId,
    members: activeMembers.map((member) => ({
      guest_id: member.guest_id as string,
      name: member.name as string,
      avatar_url: (member.avatar_url as string | null) ?? null,
      is_host: member.is_host as boolean,
      is_operator: (member.is_operator as boolean | undefined) ?? false,
      ready: (member.ready as boolean | undefined) ?? false,
      joined_at: member.joined_at as string,
      online: new Date(member.last_seen_at as string).getTime() >= onlineCutoff,
    })),
    messages: (messages.data ?? []).reverse().map((message) => ({
      id: message.id as string,
      guest_id: message.guest_id as string,
      body: message.body as string,
      at: message.created_at as string,
    })),
    reactions: (reactions.data ?? []).reverse().map((reaction) => ({
      id: reaction.id as string,
      guest_id: reaction.guest_id as string,
      emoji: reaction.emoji as string,
      at: reaction.created_at as string,
    })),
  });
}
