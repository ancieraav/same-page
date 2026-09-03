'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { readStored, writeStored } from '@/lib/storage';
import { useToast } from '@/components/ui/ToastProvider';
import { SessionToolbar } from './SessionToolbar';
import { SessionAvatarStack } from './SessionAvatarStack';

interface QuestionStageProps {
  questionId: 1 | 2;
  ready: boolean;
  review: boolean;
}

const questions = {
  1: {
    title: 'Which feature should take priority for next quarter’s roadmap?',
    sub: 'Choose between shipping the core checkout loop or the customer feedback portal first. Explain your trade-offs.',
  },
  2: {
    title: 'How should we price our upcoming enterprise tier?',
    sub: 'Evaluate usage-based seat pricing against fixed platform tiers and provide your risk tolerance.',
  },
};

function MarkdownPreview({ value }: { value: string }) {
  const items = value.split('\n').map((line, position) => ({
    key: `md_line_${String(position + 1)}_${line.slice(0, 8)}`,
    line,
  }));
  return (
    <div className="rendered-markdown-content">
      {items.map((item) => {
        if (!item.line.trim()) return <p key={item.key} className="md-blank-line">&nbsp;</p>;
        if (item.line.startsWith('- ')) {
          return (
            <ul key={item.key} className="md-list">
              <li>{item.line.slice(2)}</li>
            </ul>
          );
        }
        if (item.line.startsWith('> ')) {
          return (
            <blockquote key={item.key} className="md-quote">
              {item.line.slice(2)}
            </blockquote>
          );
        }
        return <p key={item.key}>{item.line}</p>;
      })}
    </div>
  );
}

export function SessionQuestionStage({ questionId, ready, review }: QuestionStageProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const answerRef = useRef<HTMLTextAreaElement>(null);
  const question = questions[questionId];
  const [answer, setAnswer] = useState('');
  const [mode, setMode] = useState<'write' | 'preview'>('write');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const stored = readStored(`samepage_user_answer_q${String(questionId)}`, '');
    window.queueMicrotask(() => { setAnswer(stored); });
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
    const wrappers: Record<string, [string, string]> = {
      bold: ['**', '**'],
      italic: ['*', '*'],
      underline: ['<u>', '</u>'],
      strike: ['~~', '~~'],
      code: ['`', '`'],
      quote: ['> ', ''],
      'bullet-list': ['- ', ''],
    };
    const [prefix, suffix] = wrappers[format] ?? ['', ''];
    const next = `${answer.slice(0, start)}${prefix}${selected}${suffix}${answer.slice(end)}`;
    setAnswer(next);
    window.requestAnimationFrame(() => {
      element.focus();
      element.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    });
  };

  const submit = () => {
    if (!answer.trim()) {
      showToast('Please write your response first', 'error');
      answerRef.current?.focus();
      return;
    }
    setBusy(true);
    writeStored(`samepage_user_answer_q${String(questionId)}`, answer);
    writeStored('samepage_user_answer', answer);
    showToast('Response saved');
    window.setTimeout(() => {
      router.push(`/comparison?q=${String(questionId)}&review=1`);
    }, 500);
  };

  return (
    <main className={`session-canvas-wrapper${ready ? '' : ' is-launching'}`}>
      <div className="question-stage-clean">
        <div className="question-round-indicator">
          <span
            className="round-indicator-dot"
            aria-hidden="true"
            style={review ? { background: '#10B981' } : undefined}
          />
          <span>
            Question {questionId} of 2{review ? ' • Review Mode' : ''}
          </span>
        </div>
        <h1 className="question-headline">{question.title}</h1>
        <p className="question-sub-prompt">{question.sub}</p>
        <div className="rich-editor-box">
          <SessionToolbar mode={mode} onFormat={applyFormat} onMode={setMode} />
          <div className="editor-textarea-wrapper">
            {mode === 'write' ? (
              <textarea
                ref={answerRef}
                id="participant-answer-input"
                className="answer-textarea"
                placeholder="Write your honest perspective here..."
                aria-label="Write your honest perspective here"
                rows={4}
                value={answer}
                onChange={(event) => { setAnswer(event.target.value); }}
              />
            ) : (
              <div className="answer-preview-pane">
                <MarkdownPreview value={answer} />
              </div>
            )}
            <div className="editor-grab-handle" title="Drag to resize box" aria-label="Resize handle">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <line x1="8.5" y1="1.5" x2="1.5" y2="8.5" />
                <line x1="8.5" y1="5" x2="5" y2="8.5" />
              </svg>
            </div>
          </div>
        </div>
        <div className="question-actions-row">
          <div className="avatar-stack-container">
            <SessionAvatarStack />
            <span className="avatar-stack-label">
              <strong>2 of 5 participants</strong> have answered
            </span>
          </div>
          {review && (
            <Link href={`/comparison?q=${String(questionId)}&review=1`} className="dock-btn-secondary btn-session-review-back">
              ← <span>Review Question {questionId} Comparison</span>
            </Link>
          )}
          <button type="button" className="btn-submit-answer" onClick={submit} disabled={busy} aria-busy={busy}>
            <span>{busy ? 'Saving…' : review ? 'Update Response' : 'Submit Response'}</span>{' '}
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </main>
  );
}
