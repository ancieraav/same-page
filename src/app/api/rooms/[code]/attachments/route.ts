import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabaseServer';
import { bad, findRoomByCode, guestIdOf, resolveRoomAttachments, type RoomAttachment } from '@/lib/waitingServer';
import { isSupportedAttachment, maxAttachmentBytes, SUPPORTED_ATTACHMENT_LABEL } from '@/lib/attachmentRemote';

const MAX_ATTACHMENTS = 20;

function readableSize(bytes: number): string {
  if (bytes < 1024) return `${String(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extension(name: string): string {
  return (name.split('.').pop() ?? 'FILE').toUpperCase().slice(0, 12);
}

interface IncomingMeta {
  id?: unknown;
  name?: unknown;
  ext?: unknown;
  isImage?: unknown;
}

/** Upload creator-selected attachments into the room's private context bucket. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const form = await request.formData().catch(() => null);
  if (!form) return bad('Invalid multipart form.');
  const guestId = guestIdOf(form.get('guest_id'));
  if (!guestId) return bad('Missing guest identity.');

  let room;
  try {
    room = await findRoomByCode(code);
  } catch {
    return bad('Backend is not configured yet.', 503);
  }
  if (!room) return bad('Room not found.', 404);
  if (room.creator_guest_id !== guestId) return bad('Only the room creator can upload room attachments.', 403);

  const rawMetadata = form.get('metadata');
  let metadata: IncomingMeta[] = [];
  if (typeof rawMetadata === 'string' && rawMetadata.length > 0) {
    try {
      const parsed: unknown = JSON.parse(rawMetadata);
      if (!Array.isArray(parsed)) return bad('Invalid attachment metadata.');
      metadata = parsed as IncomingMeta[];
    } catch {
      return bad('Invalid attachment metadata.');
    }
  }

  const files = form.getAll('files').filter((value): value is File => value instanceof File);
  if (files.length === 0) return NextResponse.json({ attachments: room.attachments ?? [] });
  if (files.length > MAX_ATTACHMENTS || files.length !== metadata.length) return bad('Attachment count and metadata do not match.');

  const existing = Array.isArray(room.attachments) ? room.attachments : [];
  if (existing.length + files.length > MAX_ATTACHMENTS) return bad(`Maximum ${String(MAX_ATTACHMENTS)} attachments.`);

  for (const [index, file] of files.entries()) {
    const meta = metadata[index] ?? {};
    const name = typeof meta.name === 'string' && meta.name ? meta.name : file.name;
    if (file.size <= 0) return bad(`Attachment ${String(index + 1)} is empty.`);
    if (file.size > maxAttachmentBytes()) return bad(`${name} is larger than 25 MB.`);
    if (!isSupportedAttachment(name, file.type || null)) {
      return bad(`${name} is not supported. Attachments must be ${SUPPORTED_ATTACHMENT_LABEL}.`);
    }
  }

  const storage = getServiceSupabase().storage.from('room-attachments');
  const uploaded: RoomAttachment[] = [];
  const paths: string[] = [];
  try {
    for (const [index, file] of files.entries()) {
      const meta = metadata[index] ?? {};
      const id = typeof meta.id === 'string' && meta.id ? meta.id : randomUUID();
      const name = typeof meta.name === 'string' && meta.name ? meta.name : file.name;
      const path = `${room.id}/${randomUUID()}-${name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120)}`;
      const { error } = await storage.upload(path, await file.arrayBuffer(), {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });
      if (error) throw error;
      paths.push(path);
      uploaded.push({
        id,
        name,
        size: readableSize(file.size),
        ext: typeof meta.ext === 'string' ? meta.ext : extension(name),
        isImage: typeof meta.isImage === 'boolean' ? meta.isImage : file.type.startsWith('image/'),
        mime: file.type || 'application/octet-stream',
        path,
      });
    }

    const nextAttachments = [...existing.filter((item) => !uploaded.some((file) => file.id === item.id)), ...uploaded];
    const { error } = await getServiceSupabase()
      .from('rooms')
      .update({ attachments: nextAttachments })
      .eq('id', room.id)
      .eq('creator_guest_id', guestId);
    if (error) throw error;

    const attachments = await resolveRoomAttachments(nextAttachments);
    return NextResponse.json({ attachments });
  } catch {
    if (paths.length > 0) await storage.remove(paths).catch(() => undefined);
    return bad('Could not upload room attachments. Please retry.', 500);
  }
}
