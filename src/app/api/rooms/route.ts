import { NextRequest, NextResponse } from 'next/server';
import { generateRoomCode } from '@/lib/roomCode';
import { getServiceSupabase } from '@/lib/supabaseServer';
import { bad, guestIdOf } from '@/lib/waitingServer';
import { isSupportedAttachment, SUPPORTED_ATTACHMENT_LABEL } from '@/lib/attachmentRemote';

/** Create a room. The creator sets their profile on the next step. */
export async function POST(request: NextRequest) {
  let payload: { name?: unknown; topic?: unknown; notes?: unknown; guest_id?: unknown; attachments?: unknown };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return bad('Invalid request body');
  }

  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const topic = typeof payload.topic === 'string' ? payload.topic.trim() : '';
  const notes = typeof payload.notes === 'string' ? payload.notes.trim() : '';
  const guestId = guestIdOf(payload.guest_id);
  if (!name) return bad('Please provide a room name.');
  if (!guestId) return bad('Missing guest identity.');
  if (name.length > 80) return bad('Room name is too long.');

  // Store only safe metadata here; the browser uploads file bytes immediately
  // after room creation through the private attachments endpoint.
  const attachments: { id: string; name: string; size?: string; ext?: string; isImage?: boolean; mime?: string }[] = [];
  if (Array.isArray(payload.attachments)) {
    if (payload.attachments.length > 20) return bad('Maximum 20 attachments.');
    for (const item of payload.attachments) {
      if (typeof item !== 'object' || item === null) return bad('Invalid attachment metadata.');
      const attachment = item as { id?: unknown; name?: unknown; size?: unknown; ext?: unknown; isImage?: unknown; mime?: unknown };
      const fileName = typeof attachment.name === 'string'
        ? attachment.name.trim()
        : '';
      if (!fileName || fileName.length > 120) return bad('Invalid attachment metadata.');
      const mime = typeof attachment.mime === 'string' ? attachment.mime : null;
      if (!isSupportedAttachment(fileName, mime)) return bad(`Attachments must be ${SUPPORTED_ATTACHMENT_LABEL}.`);
      const id = typeof attachment.id === 'string' && attachment.id ? attachment.id : `attachment-${String(attachments.length + 1)}`;
      attachments.push({
        id,
        name: fileName,
        ...(typeof attachment.size === 'string' ? { size: attachment.size } : {}),
        ...(typeof attachment.ext === 'string' ? { ext: attachment.ext } : {}),
        ...(typeof attachment.isImage === 'boolean' ? { isImage: attachment.isImage } : {}),
        ...(typeof attachment.mime === 'string' ? { mime: attachment.mime } : {}),
      });
    }
  }

  let supabase;
  try {
    supabase = getServiceSupabase();
  } catch {
    return bad('Backend is not configured yet.', 503);
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generateRoomCode();
    const inserted: { data: { code: string } | null; error: { code?: string } | null } = await supabase
      .from('rooms')
      .insert({ code, name, topic, notes, creator_guest_id: guestId, attachments })
      .select('code')
      .single();
    if (inserted.error) {
      if (inserted.error.code === '23505') continue;
      return bad('Could not create the room. Please retry.', 500);
    }
    if (!inserted.data) return bad('Could not create the room. Please retry.', 500);
    return NextResponse.json({ code: inserted.data.code });
  }
  return bad('Could not create the room. Please retry.', 500);
}
