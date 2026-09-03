'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MemeHeader } from './MemeHeader';
import { MemeStage } from './MemeStage';

export function MemePage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(7);
  const [busy, setBusy] = useState(false);
  const [duration, setDuration] = useState(255);

  useEffect(() => {
    const tick = window.setInterval(() => { setCountdown((value) => Math.max(0, value - 1)); }, 1000);
    const elapsed = window.setInterval(() => { setDuration((value) => value + 1); }, 1000);
    return () => {
      window.clearInterval(tick);
      window.clearInterval(elapsed);
    };
  }, []);

  const goNext = useCallback(() => {
    if (busy) return;
    setBusy(true);
    window.setTimeout(() => { router.push('/session?q=2'); }, 250);
  }, [busy, router]);

  useEffect(() => {
    if (countdown === 0) window.setTimeout(goNext, 0);
  }, [countdown, goNext]);

  const time = `${String(Math.floor(duration / 60)).padStart(2, '0')}:${String(duration % 60).padStart(2, '0')}`;
  return (
    <>
      <MemeHeader duration={time} />
      <MemeStage countdown={countdown} onNext={goNext} busy={busy} />
    </>
  );
}
