'use client';

import { useEffect, useRef, useState } from 'react';
import { SessionLaunchOverlay } from '@/components/pages/session/SessionLaunchOverlay';

const PREPARING_COPY = [
  { text: "Hold on, I'm thinking...", typeSpeed: 36 },
  { text: "Hmmm, actually I'm writing now...", typeSpeed: 34 },
  { text: "Almost there, I'm evaluating...", typeSpeed: 34 },
  { text: "Get ready 😈", typeSpeed: 42 },
] as const;

function pause(milliseconds: number): Promise<void> {
  return new Promise((resolve) => { window.setTimeout(resolve, milliseconds); });
}

export default function DebugAgentThinkingPage() {
  const [typedText, setTypedText] = useState('');
  const animationVersion = useRef(0);

  useEffect(() => {
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
      while (isCurrent()) {
        for (const sentence of PREPARING_COPY) {
          await type(sentence.text, sentence.typeSpeed);
          const holdTime = sentence.text === 'Get ready 😈' ? 1200 : 750;
          await pause(holdTime);
          if (!isCurrent()) return;
          await erase(sentence.text);
          await pause(180);
          if (!isCurrent()) return;
        }
      }
    };

    void run();

    return () => {
      animationVersion.current += 1;
    };
  }, []);

  return (
    <SessionLaunchOverlay
      phase="ai"
      countdown={0}
      hidden={false}
      text={typedText}
    />
  );
}
