'use client';

import { useEffect, useRef, useState } from 'react';
import { SessionLaunchOverlay } from './SessionLaunchOverlay';

const PREPARING_COPY = [
  { text: "Hold on, I'm thinking...", typeSpeed: 36 },
  { text: "Hmmm, actually I'm writing now...", typeSpeed: 34 },
  { text: "Almost there, I'm evaluating...", typeSpeed: 34 },
] as const;
const GET_READY_COPY = 'Get ready 😈';

function pause(milliseconds: number): Promise<void> {
  return new Promise((resolve) => { window.setTimeout(resolve, milliseconds); });
}

interface SessionQuestionTransitionProps {
  status: string;
  hasActiveQuestion: boolean;
}

/** Full-screen agent preparation and question-launch transition. */
export function SessionQuestionTransition({ status, hasActiveQuestion }: SessionQuestionTransitionProps) {
  const [typedText, setTypedText] = useState('');
  const [phase, setPhase] = useState<'typing' | 'countdown' | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const wasPreparing = useRef(false);
  const animationVersion = useRef(0);
  const transitionStatus = status === 'answering' || status === 'analyzing';
  const preparing = !hasActiveQuestion && transitionStatus;

  useEffect(() => {
    if (!preparing) return;
    wasPreparing.current = true;
    const version = animationVersion.current + 1;
    animationVersion.current = version;
    const isCurrent = () => animationVersion.current === version;
    const type = async (text: string, speed: number) => {
      setTypedText('');
      for (let index = 1; index <= text.length && isCurrent(); index += 1) {
        setTypedText(text.slice(0, index));
        await pause(speed);
      }
    };
    const erase = async (text: string) => {
      for (let index = text.length - 1; index >= 0 && isCurrent(); index -= 1) {
        setTypedText(text.slice(0, index));
        await pause(16);
      }
    };
    const run = async () => {
      await pause(0);
      if (!isCurrent()) return;
      setCountdown(null);
      setPhase('typing');
      while (isCurrent()) {
        for (const sentence of PREPARING_COPY) {
          await type(sentence.text, sentence.typeSpeed);
          await pause(650);
          if (!isCurrent()) return;
          await erase(sentence.text);
          await pause(150);
          if (!isCurrent()) return;
        }
      }
    };
    void run();
    return () => { animationVersion.current += 1; };
  }, [preparing]);

  useEffect(() => {
    if (preparing || !hasActiveQuestion || !wasPreparing.current) return;
    wasPreparing.current = false;
    const version = animationVersion.current + 1;
    animationVersion.current = version;
    const isCurrent = () => animationVersion.current === version;
    const run = async () => {
      setPhase('typing');
      setTypedText('');
      for (let index = 1; index <= GET_READY_COPY.length && isCurrent(); index += 1) {
        setTypedText(GET_READY_COPY.slice(0, index));
        await pause(42);
      }
      await pause(850);
      if (!isCurrent()) return;
      setPhase('countdown');
      setCountdown(3);
    };
    void run();
    return () => { animationVersion.current += 1; };
  }, [hasActiveQuestion, preparing]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 1) {
      const done = window.setTimeout(() => {
        setCountdown(null);
        setPhase(null);
      }, 850);
      return () => { window.clearTimeout(done); };
    }
    const next = window.setTimeout(() => { setCountdown((value) => value === null ? null : value - 1); }, 850);
    return () => { window.clearTimeout(next); };
  }, [countdown]);

  if (!transitionStatus) return null;
  if (phase === 'typing' && (preparing || hasActiveQuestion)) {
    return <SessionLaunchOverlay phase="ai" countdown={0} hidden={false} text={typedText} />;
  }
  if (phase === 'countdown' && countdown !== null && hasActiveQuestion) {
    return <SessionLaunchOverlay phase="countdown" countdown={countdown} hidden={false} text="" />;
  }
  return null;
}
