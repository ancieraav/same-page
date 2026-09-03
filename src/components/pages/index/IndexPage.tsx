'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cleanRoomCode, pasteText } from '@/lib/clipboard';
import { useToast } from '@/components/ui/ToastProvider';
import { AmbientBackground } from '@/components/layout/AmbientBackground';
import { HomeStage } from './HomeStage';

export function IndexPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [code, setCode] = useState<string[]>(Array.from({ length: 7 }, () => ''));
  const [busy, setBusy] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const updateCode = (index: number, value: string) => {
    const nextValue = cleanRoomCode(value).slice(-1);
    setCode((current) => current.map((character, itemIndex) => itemIndex === index ? nextValue : character));
    if (nextValue && index < 6) inputRefs.current[index + 1]?.focus();
  };

  const applyCode = (value: string) => {
    const clean = cleanRoomCode(value);
    setCode((current) => current.map((_, index) => clean[index] ?? ''));
    inputRefs.current[Math.min(clean.length, 6)]?.focus();
    if (clean) showToast('Room code pasted');
  };

  const onCodeKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !code[index] && index > 0) {
      setCode((current) => current.map((character, itemIndex) => itemIndex === index - 1 ? '' : character));
      inputRefs.current[index - 1]?.focus();
    } else if (event.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (event.key === 'ArrowRight' && index < 6) {
      inputRefs.current[index + 1]?.focus();
    } else if (event.key === 'Enter') {
      onJoin();
    }
  };

  const onPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    applyCode(event.clipboardData.getData('text'));
  };

  const onPasteButton = async () => {
    const value = await pasteText();
    if (value === null) showToast('Clipboard permission was not granted', 'error');
    else applyCode(value);
  };

  const onJoin = () => {
    const roomCode = code.join('');
    if (roomCode.length !== 7) {
      showToast('Please enter all 7 characters', 'error');
      return;
    }
    setBusy(true);
    showToast(`Joining room ${roomCode}…`);
    window.setTimeout(() => router.push(`/join?code=${encodeURIComponent(roomCode)}`), 450);
  };

  return (
    <>
      <AmbientBackground />
      <HomeStage
        code={code}
        busy={busy}
        inputRefs={inputRefs}
        onCodeChange={updateCode}
        onCodeKeyDown={onCodeKeyDown}
        onPaste={onPaste}
        onPasteButton={onPasteButton}
        onJoin={onJoin}
      />
    </>
  );
}
