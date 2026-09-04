'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { compressAvatarImage } from '@/lib/avatar';
import { blobToDataUrl } from '@/lib/blob';
import { getGuestId, mintTabGuestId } from '@/lib/guest';
import { isHttpUrl, maxAttachmentBytes, remoteFileName } from '@/lib/attachmentRemote';
import { writeSession } from '@/lib/storage';
import { useToast } from '@/components/ui/ToastProvider';
import { AmbientBackground } from '@/components/layout/AmbientBackground';
import { JoinHeader } from './JoinHeader';
import { JoinIdentityForm } from './JoinIdentityForm';
import { useJoinWebMCP } from './useJoinWebMCP';

export function JoinPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [avatarSrc, setAvatarSrc] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [roomName, setRoomName] = useState('');
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<number | null>(null);

  const roomCode = params.get('code')?.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 24) ?? '';
  const isHost = params.get('as') === 'host';

  useEffect(() => {
    // Demo/testing escape hatch: `?seat=new` gives this tab its own identity
    // so one browser can hold two seats (tabs otherwise share localStorage).
    if (params.get('seat') === 'new') mintTabGuestId();
  }, [params]);

  useEffect(() => {
    if (!roomCode) return;
    void fetch(`/api/rooms/${encodeURIComponent(roomCode)}`)
      .then(async (response) => {
        if (!response.ok) return;
        const payload = (await response.json()) as { name?: unknown };
        if (typeof payload.name !== 'string') return;
        setRoomName(payload.name);
      })
      .catch(() => { /* offline: fallback UI stays */ });
  }, [roomCode]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const onAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please choose an image file', 'error');
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    const onLoad = () => {
      setAvatarSrc(typeof reader.result === 'string' ? reader.result : '');
      reader.removeEventListener('load', onLoad);
    };
    reader.addEventListener('load', onLoad);
    reader.readAsDataURL(file);
  };

  const enterWithName = async (finalName: string): Promise<{ ok: boolean; error?: string; code?: string }> => {
    if (!finalName) {
      showToast('Please enter your display name.', 'error');
      return { ok: false, error: 'Please enter your display name.' };
    }
    if (!roomCode) {
      showToast('Missing room code.', 'error');
      return { ok: false, error: 'Missing room code.' };
    }
    setBusy(true);
    const guestId = getGuestId();
    try {
      const joinResponse = await fetch(`/api/rooms/${encodeURIComponent(roomCode)}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // The room creator takes the operator seat; players join via code.
        body: JSON.stringify({ guest_id: guestId, name: finalName, ...(isHost ? { as_operator: true } : {}) }),
      });
      const joinPayload = (await joinResponse.json().catch(() => null)) as { error?: unknown } | null;
      if (!joinResponse.ok) {
        const message = typeof joinPayload?.error === 'string' ? joinPayload.error : 'Could not join the room.';
        showToast(message, 'error');
        setBusy(false);
        return { ok: false, error: message };
      }
      let photoUrl = '';
      if (avatarFile) {
        try {
          const compressed = await compressAvatarImage(avatarFile);
          const form = new FormData();
          form.set('guest_id', guestId);
          form.set('photo', compressed, 'avatar.jpg');
          const photoResponse = await fetch(`/api/rooms/${encodeURIComponent(roomCode)}/profile`, {
            method: 'PATCH',
            body: form,
          });
          const photoPayload = (await photoResponse.json().catch(() => null)) as {
            member?: { avatar_url?: unknown };
            error?: unknown;
          } | null;
          if (!photoResponse.ok) throw new Error(typeof photoPayload?.error === 'string' ? photoPayload.error : 'Upload failed');
          if (typeof photoPayload?.member?.avatar_url === 'string') photoUrl = photoPayload.member.avatar_url;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Could not upload the photo.';
          showToast(message, 'error');
          setBusy(false);
          return { ok: false, error: message };
        }
      }
      writeSession('samepage_room_identity', { name: finalName, photo: photoUrl || avatarSrc, roomCode });
      showToast(isHost ? `Your room is ready, ${finalName}!` : `Welcome, ${finalName}!`);
      timeoutRef.current = window.setTimeout(() => {
        router.push(`/waiting?code=${encodeURIComponent(roomCode)}`);
      }, 450);
      return { ok: true, code: roomCode };
    } catch {
      showToast('Could not join the room. Please retry.', 'error');
      setBusy(false);
      return { ok: false, error: 'Could not join the room. Please retry.' };
    }
  };

  const onEnter = () => {
    void enterWithName(name.trim());
  };

  const requestEnter = async () => {
    if (!name.trim()) {
      showToast('Please enter your display name.', 'error');
      return { ok: false, error: 'Please enter your display name.' };
    }
    return enterWithName(name);
  };

  useJoinWebMCP({
    getDisplayName: () => name,
    setDisplayName: setName,
    clearDisplayName: () => {
      const had = name.length > 0;
      if (had) setName('');
      return had;
    },
    hasPhoto: () => avatarSrc !== '',
    setPhotoFromUrl: async (url: string) => {
      const cleanUrl = url.trim();
      if (!isHttpUrl(cleanUrl)) return { ok: false as const, error: 'Provide a valid http(s) image URL.' };
      try {
        const response = await fetch(cleanUrl);
        if (!response.ok) return { ok: false as const, error: `Download failed with status ${String(response.status)}.` };
        const blob = await response.blob();
        if (blob.size === 0) return { ok: false as const, error: 'The downloaded file is empty.' };
        if (blob.size > maxAttachmentBytes()) return { ok: false as const, error: 'The image is larger than 25 MB.' };
        const fileName = remoteFileName(cleanUrl, response.headers.get('content-type'));
        const file = new File([blob], fileName, { type: blob.type || 'image/jpeg' });
        if (!file.type.startsWith('image/')) return { ok: false as const, error: 'The URL did not return an image.' };
        setAvatarFile(file);
        setAvatarSrc(await blobToDataUrl(file));
        return { ok: true as const, name: fileName };
      } catch {
        return { ok: false as const, error: 'Could not download the URL. Check the link or CORS access.' };
      }
    },
    clearPhoto: () => {
      const had = avatarSrc !== '' || avatarFile !== null;
      setAvatarFile(null);
      setAvatarSrc('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return had;
    },
    openPhotoPicker: () => {
      fileInputRef.current?.click();
      return fileInputRef.current !== null;
    },
    requestEnter,
    cancelJoin: () => {
      router.push('/');
    },
  });

  return (
    <>
      <AmbientBackground />
      <JoinHeader />
      <JoinIdentityForm
        title={isHost ? 'Introduce Yourself as Host' : 'Set Your Room Identity'}
        subtitle={
          isHost
            ? `This is how the other person will see you${roomName ? ` in “${roomName}”` : ''}. Photo is optional.`
            : `Customize your display name and photo specifically for this session${roomName ? ` in “${roomName}”` : ''}.`
        }
        submitLabel={isHost ? 'Enter Waiting Room' : 'Enter Waiting Room'}
        name={name}
        avatarSrc={avatarSrc}
        busy={busy}
        fileInputRef={fileInputRef}
        onAvatarTrigger={() => { fileInputRef.current?.click(); }}
        onNameChange={setName}
        onAvatarChange={onAvatarChange}
        onEnter={onEnter}
      />
    </>
  );
}
