'use client';

import { useSessionWebMCP } from '@/components/pages/waiting/useSessionWebMCP';

interface SessionWebMCPBridgeProps {
  code: string;
  guestId: string;
  isOperator: boolean;
  status: string;
  activeNumber: number | null;
  getAnswerDraft: () => string;
  setAnswerDraft: (value: string) => void;
  submitAnswer: () => Promise<{ question: number; saved: true }>;
}

/** Mounts the role-aware WebMCP surface beside the live session UI. */
export function SessionWebMCPBridge({
  code,
  guestId,
  isOperator,
  status,
  activeNumber,
  getAnswerDraft,
  setAnswerDraft,
  submitAnswer,
}: SessionWebMCPBridgeProps) {
  useSessionWebMCP({
    getCode: () => code,
    getGuestId: () => guestId,
    isOperator: () => isOperator,
    getStatus: () => status,
    getAnswerDraft,
    setAnswerDraft,
    submitAnswer,
    phase: 'session',
    watchKey: `${isOperator ? 'operator' : 'participant'}:${status}:${activeNumber === null ? 'none' : String(activeNumber)}`,
  });
  return null;
}
