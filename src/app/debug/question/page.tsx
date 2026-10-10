'use client';

import { useEffect, useState } from 'react';
import { PageRoot } from '@/components/layout/PageRoot';
import { SessionHeader } from '@/components/pages/session/SessionHeader';
import { SessionQuestionStage } from '@/components/pages/session/SessionQuestionStage';
import { useToast } from '@/components/ui/ToastProvider';

function formatTimer(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function DebugQuestionPage() {
  const { showToast } = useToast();
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [roomSeconds, setRoomSeconds] = useState(214);
  const [deadlineSeconds, setDeadlineSeconds] = useState(148);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRoomSeconds((prev) => prev + 1);
      setDeadlineSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => { window.clearInterval(timer); };
  }, []);

  const handleSubmit = async () => {
    if (!draft.trim() || busy) return;
    setBusy(true);
    await new Promise((resolve) => { window.setTimeout(resolve, 500); });
    setBusy(false);
    setSubmitted(true);
    showToast('Your response has been saved!');
  };

  return (
    <PageRoot bodyClass="viewport-fit-page session-body">
      <SessionHeader
        roomTimer={formatTimer(roomSeconds)}
        deadlineTimer={formatTimer(deadlineSeconds)}
      />
      <main className="session-canvas-wrapper" id="session-canvas-wrapper">
        <SessionQuestionStage
          questionNumber={1}
          questionText="Based on our strategic goals in Design Alignment Sync, what is the single highest-leverage priority our team must commit to, and what are we explicitly deprioritizing?"
          answer={draft}
          operator={false}
          disabled={submitted}
          busy={busy}
          submittedCount={submitted ? 2 : 1}
          participantCount={2}
          onAnswerChange={setDraft}
          onSubmit={handleSubmit}
        />
      </main>
    </PageRoot>
  );
}
