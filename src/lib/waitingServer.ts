import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabaseServer';
import { normalizeRoomCode } from '@/lib/roomCode';

export interface RoomRow {
  id: string;
  code: string;
  name: string;
  topic: string;
  notes: string;
  status: string;
  created_at: string;
  creator_guest_id: string | null;
  attachments?: RoomAttachment[] | null;
}

export interface RoomAttachment {
  id: string;
  name: string;
  size?: string;
  ext?: string;
  isImage?: boolean;
  mime?: string;
  path?: string;
  url?: string;
}

export interface PublicRoomAttachment {
  id: string;
  name: string;
  size?: string;
  ext?: string;
  isImage?: boolean;
  mime?: string;
  url?: string;
}

export function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function guestIdOf(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const clean = value.trim();
  return clean.length >= 8 && clean.length <= 64 ? clean : null;
}

/** Client IP for ban enforcement (hashed before storage, never stored raw). */
export function ipHashOf(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() ?? 'unknown';
  if (ip === 'unknown' || ip === '') return '';
  return createHash('sha256').update(ip).digest('hex');
}

export async function findRoomByCode(code: string): Promise<RoomRow | null> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from('rooms')
    .select('id, code, name, topic, notes, status, created_at, creator_guest_id, attachments')
    .eq('code', normalizeRoomCode(code))
    .maybeSingle();
  if (error || !data) return null;
  return data;
}

/**
 * Return attachment metadata with fresh, short-lived URLs for agent/browser
 * context. Files remain in the private Supabase Storage bucket.
 */
export async function resolveRoomAttachments(attachments: RoomAttachment[] | null | undefined): Promise<PublicRoomAttachment[]> {
  const list = Array.isArray(attachments) ? attachments : [];
  const withPaths = list.filter((attachment) => typeof attachment.path === 'string' && attachment.path.length > 0);
  if (withPaths.length === 0) return list.map(({ path: _path, ...attachment }) => attachment);
  const storage = getServiceSupabase().storage.from('room-attachments');
  const resolved = await Promise.all(list.map(async (attachment) => {
    const { path, ...publicAttachment } = attachment;
    if (!path) return publicAttachment;
    const { data } = await storage.createSignedUrl(path, 3600);
    return data?.signedUrl ? { ...publicAttachment, url: data.signedUrl } : publicAttachment;
  }));
  return resolved;
}
