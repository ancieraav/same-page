'use client';

import { useEffect, useRef, useState } from 'react';
import { SessionLaunchOverlay } from './SessionLaunchOverlay';

const PREPARING_COPY = [
  { text: "Hold on, I'm thinking...", typeSpeed: 36 },
  { text: "Hmmm, actually I'm writing now...", typeSpeed: 34 },
  { text: "Almost there, I'm evaluating...", typeSpeed: 34 },
] as const;

function pause(milliseconds: number): Promise<void> {
  return new Promise((resolve) => { window.setTimeout(resolve, milliseconds); });
}

interface SessionQuestionTransitionProps {
  status: string;
  hasActiveQuestion: boolean;
  hasSummary?: boolean;
}

/** Full-screen agent preparation transition shown while thinking before a question is published. */
export function SessionQuestionTransition({
  status,
  hasActiveQuestion,
  hasSummary = false,
}: SessionQuestionTransitionProps) {
  const [typedText, setTypedText] = useState('');
  const [phase, setPhase] = useState<'typing' | null>(null);
  const animationVersion = useRef(0);
  const transitionStatus = status === 'answering' || status === 'analyzing';
  const preparing = !hasActiveQuestion && transitionStatus && !hasSummary;

  useEffect(() => {
    if (!preparing) return;
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
    return () => {
      animationVersion.current += 1;
      setPhase(null);
      setTypedText('');
    };
  }, [preparing]);

  if (!transitionStatus || hasSummary || hasActiveQuestion) return null;
  if (phase === 'typing' && preparing) {
    return <SessionLaunchOverlay phase="ai" countdown={0} hidden={false} text={typedText} />;
  }
  return null;
}
