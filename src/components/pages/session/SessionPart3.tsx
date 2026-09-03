'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { readStored, writeStored } from '@/lib/storage';
import { useToast } from '@/components/ui/ToastProvider';
import { SessionToolbar } from './SessionToolbar';
import { SessionAvatarStack } from './SessionAvatarStack';

const questions = {
  1: { title: 'Based on our strategic goals in Design Alignment Sync, what is the single highest-leverage priority our team must commit to, and what are we explicitly deprioritizing?', sub: 'Write what you believe independently before the room unlocks and compares perspectives against the benchmark.' },
  2: { title: 'What is the single biggest architectural or operational bottleneck that could prevent our team from hitting our Q3 North Star metrics, and who owns the fix?', sub: 'Identify the critical cross-team dependency and specify the exact trade-off needed to unblock delivery.' },
} as const;

function inlineMarkdown(value: string): ReactNode[] {
  const tokens = value.split(/(\*\*[^*]+\*\*|__[^_]+__|~~[^~]+~~|`[^`]+`|\*[^*]+\*)/g);
  return tokens.map((token, index) => {
    if (token.startsWith('**') || token.startsWith('__')) return <strong key={index}>{token.slice(2, -2)}</strong>;
    if (token.startsWith('~~')) return <del key={index}>{token.slice(2, -2)}</del>;
    if (token.startsWith('`')) return <code className="rendered-code" key={index}>{token.slice(1, -1)}</code>;
    if (token.startsWith('*')) return <em key={index}>{token.slice(1, -1)}</em>;
    return <span key={index}>{token}</span>;
  });
}

function MarkdownPreview({ value }: { value: string }) {
  if (!value.trim()) return <div className="preview-empty-state">Nothing to preview yet. Switch to Write mode to draft your thoughts.</div>;
  return <div>{value.split('\n').map((line, index) => line.trim() ? <p className="rendered-p" key={index}>{inlineMarkdown(line)}</p> : <div className="rendered-spacer" key={index} />)}</div>;
}

export function SessionPart3({ ready }: { ready: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const { showToast } = useToast();
  const answerRef = useRef<HTMLTextAreaElement>(null);
  const questionId = params.get('q') === '2' ? 2 : 1;
  const review = params.get('review') === '1';
  const question = questions[questionId];
  const [answer, setAnswer] = useState('');
  const [mode, setMode] = useState<'write' | 'preview'>('write');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const stored = readStored(`samepage_user_answer_q${questionId}`, '');
    window.queueMicrotask(() => setAnswer(stored));
  }, [questionId]);

  useEffect(() => {
    if (ready) answerRef.current?.focus();
  }, [ready]);

  const applyFormat = (format: string) => {
    const element = answerRef.current;
    if (!element) return;
    const start = element.selectionStart;
    const end = element.selectionEnd;
    const selected = answer.slice(start, end) || 'text';
    const wrappers: Record<string, [string, string]> = { bold: ['**', '**'], italic: ['*', '*'], underline: ['<u>', '</u>'], strike: ['~~', '~~'], code: ['`', '`'], quote: ['> ', ''], 'bullet-list': ['- ', ''] };
    const [prefix, suffix] = wrappers[format] ?? ['', ''];
    const next = `${answer.slice(0, start)}${prefix}${selected}${suffix}${answer.slice(end)}`;
    setAnswer(next);
    window.requestAnimationFrame(() => { element.focus(); element.setSelectionRange(start + prefix.length, start + prefix.length + selected.length); });
  };

  const submit = () => {
    if (!answer.trim()) { showToast('Please write your response first', 'error'); answerRef.current?.focus(); return; }
    setBusy(true);
    writeStored(`samepage_user_answer_q${questionId}`, answer);
    writeStored('samepage_user_answer', answer);
    showToast('Response saved');
    window.setTimeout(() => router.push(`/comparison?q=${questionId}&review=1`), 500);
  };

  return (
    <main className={`session-canvas-wrapper${ready ? '' : ' is-launching'}`}>
      <div className="question-stage-clean"><div className="question-round-indicator"><span className="round-indicator-dot" aria-hidden="true" style={review ? { background: '#10B981' } : undefined} /><span>Question {questionId} of 2{review ? ' • Review Mode' : ''}</span></div><h1 className="question-headline">{question.title}</h1><p className="question-sub-prompt">{question.sub}</p><div className="rich-editor-box"><SessionToolbar mode={mode} onFormat={applyFormat} onMode={setMode} /><div className="editor-textarea-wrapper">{mode === 'write' ? <textarea ref={answerRef} id="participant-answer-input" className="answer-textarea" placeholder="Write your honest perspective here..." rows={4} value={answer} onChange={(event) => setAnswer(event.target.value)} /> : <div className="answer-preview-pane" tabIndex={0}><MarkdownPreview value={answer} /></div>}<div className="editor-grab-handle" title="Drag to resize box" aria-label="Resize handle"><svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><line x1="8.5" y1="1.5" x2="1.5" y2="8.5" /><line x1="8.5" y1="5" x2="5" y2="8.5" /></svg></div></div></div><div className="question-actions-row"><div className="avatar-stack-container"><SessionAvatarStack /><span className="avatar-stack-label"><strong>2 of 5 participants</strong> have answered</span></div>{review && <Link href={`/comparison?q=${questionId}&review=1`} className="dock-btn-secondary btn-session-review-back">← <span>Review Question {questionId} Comparison</span></Link>}<button type="button" className="btn-submit-answer" onClick={submit} disabled={busy} aria-busy={busy}><span>{busy ? 'Saving…' : review ? 'Update Response' : 'Submit Response'}</span> <span aria-hidden="true">→</span></button></div></div>
    </main>
  );
}
