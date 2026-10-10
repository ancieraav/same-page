'use client';

import { useEffect, useRef, useState } from 'react';
import { SessionLaunchOverlay } from '@/components/pages/session/SessionLaunchOverlay';

export default function DebugTimerPage() {
  const [countdown, setCountdown] = useState<number>(3);
  const animationVersion = useRef(0);

  useEffect(() => {
    const version = animationVersion.current + 1;
    animationVersion.current = version;
    const isCurrent = () => animationVersion.current === version;

    const pause = (ms: number) => new Promise((resolve) => { window.setTimeout(resolve, ms); });

    const loop = async () => {
      while (isCurrent()) {
        setCountdown(3);
        await pause(1000);
        if (!isCurrent()) break;

        setCountdown(2);
        await pause(1000);
        if (!isCurrent()) break;

        setCountdown(1);
        await pause(1000);
        if (!isCurrent()) break;

        await pause(250);
      }
    };

    void loop();

    return () => {
      animationVersion.current += 1;
    };
  }, []);

  return (
    <SessionLaunchOverlay
      phase="countdown"
      countdown={countdown}
      hidden={false}
      text=""
    />
  );
}
