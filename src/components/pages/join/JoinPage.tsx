 'use client';

import { useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { writeSession } from '@/lib/storage';
import { useToast } from '@/components/ui/ToastProvider';
import { JoinPart1 } from './JoinPart1';
import { JoinPart2 } from './JoinPart2';

export function JoinPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { showToast } = useToast();
  const [name, setName] = useState('Alex Morgan');
  const [avatarSrc, setAvatarSrc] = useState('');
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const roomCode = params.get('code')?.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 24) || 'SYNC-9021';

  const onAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Maximum file size is 2MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.addEventListener('load', () => setAvatarSrc(typeof reader.result === 'string' ? reader.result : ''));
    reader.readAsDataURL(file);
  };

  const onEnter = () => {
    const finalName = name.trim() || 'Alex Morgan';
    writeSession('samepage_room_identity', { name: finalName, photo: avatarSrc, roomCode });
    setBusy(true);
    showToast(`Welcome, ${finalName}!`);
    window.setTimeout(() => router.push(`/waiting?code=${encodeURIComponent(roomCode)}`), 450);
  };

  return (
    <>
      <JoinPart1 />
      <JoinPart2
        name={name}
        avatarSrc={avatarSrc}
        busy={busy}
        fileInputRef={fileInputRef}
        onAvatarTrigger={() => fileInputRef.current?.click()}
        onAvatarChange={onAvatarChange}
        onNameChange={setName}
        onEnter={onEnter}
      />
    </>
  );
}
