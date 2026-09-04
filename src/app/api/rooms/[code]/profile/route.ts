import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabaseServer';
import { WAITING_AVATAR_MAX_BYTES, WAITING_NAME_MAX } from '@/lib/waiting';
import { bad, findRoomByCode, guestIdOf } from '@/lib/waitingServer';

/** Update your own waiting-room profile: name and/or photo (multipart). */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return bad('Invalid request body');
  }

  const guestId = guestIdOf(form.get('guest_id'));
  const rawName = form.get('name');
  const name = typeof rawName === 'string' ? rawName.trim() : null;
  const photo = form.get('photo');
  if (!guestId) return bad('Missing guest identity.');
  if (name !== null && (name.length === 0 || name.length > WAITING_NAME_MAX)) {
    return bad(`Name must be 1–${String(WAITING_NAME_MAX)} characters.`);
  }
  if (photo !== null && !(photo instanceof Blob)) return bad('Invalid photo.');

  let room;
  try {
    room = await findRoomByCode(code);
  } catch {
    return bad('Backend is not configured yet.', 503);
  }
  if (!room) return bad('Room not found.', 404);

  const supabase = getServiceSupabase();
  const { data: member } = await supabase
    .from('room_members')
    .select('guest_id')
    .eq('room_id', room.id)
    .eq('guest_id', guestId)
    .is('left_at', null)
    .maybeSingle();
  if (!member) return bad('You are not in this room.', 403);

  const updates: { name?: string; avatar_url?: string; last_seen_at?: string } = {
    last_seen_at: new Date().toISOString(),
  };
  if (name !== null) updates.name = name;

  if (photo instanceof Blob && photo.size > 0) {
    if (photo.size > WAITING_AVATAR_MAX_BYTES) return bad('Photo must be under 2MB.', 413);
    if (!photo.type.startsWith('image/')) return bad('Photo must be an image file.');
    const path = `${room.code}/${guestId}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, photo, { contentType: 'image/jpeg', upsert: true });
    if (uploadError) return bad('Could not upload the photo. Please retry.', 500);
    const { data: publicUrl } = supabase.storage.from('avatars').getPublicUrl(path);
    updates.avatar_url = publicUrl.publicUrl;
  }

  const { data: updated, error }: {
    data: { guest_id: string; name: string; avatar_url: string | null; is_host: boolean } | null;
    error: unknown;
  } = await supabase
    .from('room_members')
    .update(updates)
    .eq('room_id', room.id)
    .eq('guest_id', guestId)
    .select('guest_id, name, avatar_url, is_host')
    .single();
  if (error || !updated) return bad('Could not update your profile.', 500);
  return NextResponse.json({ member: updated });
}
