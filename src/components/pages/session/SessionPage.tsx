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
    // Pre-quality-gate pacing: typewriter per character, slow countdown.
    const sentences = [
      "Hold on, I'm thinking...",
      "Hmmm, actually I'm writing now...",
      'Almost there, evaluating...',
      'Get ready 😈',
    ];
    let cancelled = false;
    const timeouts: number[] = [];
    const schedule = (callback: () => void, delayMs: number) => {
      timeouts.push(window.setTimeout(() => { if (!cancelled) callback(); }, delayMs));
    };

    let t = 0;
    sentences.forEach((sentence, sentenceIndex) => {
      const typeMs = sentenceIndex === sentences.length - 1 ? 42 : 36;
      const holdMs = sentenceIndex === sentences.length - 1 ? 850 : 650;
      for (let index = 1; index <= sentence.length; index += 1) {
        const slice = sentence.slice(0, index);
        t += typeMs;
        schedule(() => { setLaunchText(slice); }, t);
      }
      t += holdMs;
      for (let index = sentence.length - 1; index >= 0; index -= 1) {
        const slice = sentence.slice(0, index);
        t += 16;
        schedule(() => { setLaunchText(slice); }, t);
      }
      t += 150;
    });

    t += 50;
    schedule(() => { setPhase('countdown'); setCountdown(3); }, t);
    t += 1000;
    schedule(() => { setCountdown(2); }, t);
    t += 1000;
    schedule(() => { setCountdown(1); }, t);
    t += 1000;
    schedule(() => { setReady(true); setLaunchText(''); }, t);

    return () => {
      cancelled = true;
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
