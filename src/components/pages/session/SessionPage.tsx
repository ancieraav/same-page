'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SessionPart1 } from './SessionPart1';
import { SessionPart2 } from './SessionPart2';
import { SessionPart3 } from './SessionPart3';

const launchSentences = ["Hold on, I'm thinking...", "Hmmm, actually I'm writing now...", "Almost there, I'm evaluating...", 'Get ready 😈'];

function pause(milliseconds: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));
}

export function SessionPage() {
  const params = useSearchParams();
  const review = params.get('review') === '1' || params.get('mode') === 'review';
  const [phase, setPhase] = useState<'ai' | 'countdown'>('ai');
  const [launchText, setLaunchText] = useState('');
  const [countdown, setCountdown] = useState(3);
  const [ready, setReady] = useState(review);
  const [seconds, setSeconds] = useState(params.get('q') === '2' ? 180 : 170);

  useEffect(() => {
    if (review) return;
    let cancelled = false;
    const run = async () => {
      for (const sentence of launchSentences) {
        setLaunchText('');
        for (let index = 1; index <= sentence.length; index += 1) {
          await pause(sentence === launchSentences[3] ? 42 : 36);
          if (cancelled) return;
          setLaunchText(sentence.slice(0, index));
        }
        await pause(sentence === launchSentences[3] ? 850 : 650);
        for (let index = sentence.length - 1; index >= 0; index -= 1) {
          await pause(16);
          if (cancelled) return;
          setLaunchText(sentence.slice(0, index));
        }
        await pause(150);
      }
      setPhase('countdown');
      for (const value of [3, 2, 1]) {
        setCountdown(value);
        await pause(1000);
        if (cancelled) return;
      }
      setReady(true);
      await pause(500);
      if (!cancelled) setLaunchText('');
    };
    void run();
    return () => { cancelled = true; };
  }, [review]);

  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const timer = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  return <><SessionPart1 phase={phase} countdown={countdown} hidden={ready} text={launchText} /><SessionPart2 timer={timer} /><SessionPart3 ready={ready} /></>;
}
