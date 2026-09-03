'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SessionLaunchOverlay } from './SessionLaunchOverlay';
import { SessionHeader } from './SessionHeader';
import { SessionQuestionStage } from './SessionQuestionStage';

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
    const timeouts: number[] = [];
    const schedule = (callback: () => void, delayMs: number) => {
      timeouts.push(window.setTimeout(callback, delayMs));
    };

    schedule(() => { setLaunchText("Hold on, I'm thinking..."); }, 50);
    schedule(() => { setLaunchText("Almost there, evaluating..."); }, 500);
    schedule(() => { setLaunchText('Get ready 😈'); }, 950);
    schedule(() => { setPhase('countdown'); setCountdown(3); }, 1250);
    schedule(() => { setCountdown(2); }, 1450);
    schedule(() => { setCountdown(1); }, 1650);
    schedule(() => { setReady(true); setLaunchText(''); }, 1800);

    return () => {
      timeouts.forEach((id) => { window.clearTimeout(id); });
    };
  }, [review]);

  useEffect(() => {
    const timer = window.setInterval(() => { setSeconds((value) => Math.max(0, value - 1)); }, 1000);
    return () => { window.clearInterval(timer); };
  }, []);

  const duration = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  const questionId: 1 | 2 = params.get('q') === '2' ? 2 : 1;

  return (
    <div className="session-page-viewport">
      {!ready && (
        <SessionLaunchOverlay
          phase={phase}
          text={launchText}
          countdown={countdown}
          hidden={ready}
        />
      )}
      <SessionHeader timer={duration} />
      <SessionQuestionStage questionId={questionId} ready={ready} review={review} />
    </div>
  );
}
