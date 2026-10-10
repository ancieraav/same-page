'use client';

import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/components/ui/ToastProvider';
import { SessionToolbar } from './SessionToolbar';
import { SessionAvatarStack } from './SessionAvatarStack';

export interface SessionQuestionStageProps {
  questionNumber: number;
  questionText: string;
  answer: string;
  operator: boolean;
  disabled: boolean;
  busy: boolean;
  submittedCount: number;
  participantCount: number;
  players?: { guest_id: string; name: string; avatar_url?: string | null | undefined }[] | undefined;
  submittedIds?: string[] | undefined;
  selfId?: string | undefined;
  badgeLabel?: string;
  subPrompt?: string;
  placeholder?: string;
  submitLabel?: string;
  onAnswerChange: (value: string) => void;
  onSubmit: () => Promise<void>;
}

function MarkdownPreview({ value }: { value: string }) {
  const lines = value.split('\n');
  if (!value.trim()) return <p className="preview-empty-state">Nothing to preview yet.</p>;
  return (
    <div className="rendered-markdown-content">
      {lines.map((line, index) => {
        const key = `line-${String(index)}-${line.slice(0, 8)}`;
        if (!line.trim()) return <div className="rendered-spacer" key={key} />;
        if (line.startsWith('- ')) return <ul className="rendered-list" key={key}><li>{line.slice(2)}</li></ul>;
        if (line.startsWith('> ')) return <blockquote className="rendered-quote" key={key}><p>{line.slice(2)}</p></blockquote>;
        return <p className="rendered-p" key={key}>{line}</p>;
      })}
    </div>
  );
}

/** Shared live question UI for both operator and participant roles. */
export function SessionQuestionStage({
  questionNumber,
  questionText,
  answer,
  operator,
  disabled,
  busy,
  submittedCount,
  participantCount,
  players,
  submittedIds,
  selfId,
  badgeLabel,
  subPrompt,
  placeholder,
  submitLabel,
  onAnswerChange,
  onSubmit,
}: SessionQuestionStageProps) {
  const { showToast } = useToast();
  const answerRef = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState<'write' | 'preview'>('write');
  const [submitting, setSubmitting] = useState(false);
  const editable = !disabled && !busy && !submitting;
  const responseClosed = disabled && !busy && !submitting;

  useEffect(() => {
    if (editable && !operator) answerRef.current?.focus();
  }, [editable, operator, questionNumber]);

  const applyFormat = (format: string) => {
    if (operator) {
      showToast('Operators cannot answer questions. Participants answer from their own tabs.', 'error');
      return;
    }
    const element = answerRef.current;
    if (!element || !editable) return;
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
    onAnswerChange(next);
    window.requestAnimationFrame(() => {
      element.focus();
      element.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    });
  };

  const submit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (operator) {
      showToast('Operators cannot submit responses. Participants answer from their own tabs.', 'error');
      return;
    }
    if (!editable || !answer.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="question-stage-clean live-question-editor" aria-labelledby="live-question-title">
      <div className="question-round-indicator"><span className="round-indicator-dot" aria-hidden="true" />{badgeLabel ?? `Question ${String(questionNumber)}`}</div>
      <h2 className="question-headline" id="live-question-title">{questionText}</h2>
      <p className="question-sub-prompt">{subPrompt ?? 'Share your honest perspective. Your response stays private until the round closes.'}</p>
      <form onSubmit={(event) => { void submit(event); }}>
        <div className="rich-editor-box">
          <SessionToolbar mode={mode} onFormat={applyFormat} onMode={setMode} disabled={!operator && !editable} />
          <div className="editor-textarea-wrapper">
            {mode === 'write' ? (
              <textarea
                ref={answerRef}
                id="participant-answer-input"
                className="answer-textarea"
                placeholder={responseClosed ? 'Responses are closed for this question.' : placeholder ?? 'Write your honest perspective here...'}
                aria-label="Write your response"
                value={answer}
                readOnly={operator}
                disabled={!operator && (disabled || busy || submitting)}
                onClick={() => {
                  if (operator) {
                    showToast('Operators cannot answer questions. Participants answer from their own tabs.', 'error');
                  }
                }}
                onKeyDown={(event) => {
                  if (operator) {
                    event.preventDefault();
                    showToast('Operators cannot answer questions. Participants answer from their own tabs.', 'error');
                  }
                }}
                onChange={(event) => {
                  if (!operator) {
                    onAnswerChange(event.target.value);
                  }
                }}
              />
            ) : <div className="answer-preview-pane"><MarkdownPreview value={answer} /></div>}
            <div className="editor-grab-handle" title="Drag to resize box" aria-label="Resize handle" aria-hidden="true">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><line x1="8.5" y1="1.5" x2="1.5" y2="8.5" /><line x1="8.5" y1="5" x2="5" y2="8.5" /></svg>
            </div>
          </div>
        </div>
        <div className="question-actions-row">
          <div className="avatar-stack-container" id="avatar-stack-container">
            <SessionAvatarStack
              players={players}
              submitted={submittedIds}
              selfId={selfId}
            />
            <span className="avatar-stack-label" id="avatar-stack-label">
              <strong id="answered-count-text">{submittedCount} of {participantCount} participants</strong> have answered
            </span>
          </div>
          <button
            type="submit"
            className="btn-submit-answer"
            disabled={!operator && (!editable || !answer.trim())}
            aria-busy={busy || submitting}
            onClick={(event) => {
              if (operator) {
                event.preventDefault();
                showToast('Operators cannot submit responses. Participants answer from their own tabs.', 'error');
              }
            }}
          >
            <span>{responseClosed ? 'Response window closed' : busy || submitting ? 'Saving…' : answer.trim() ? (submitLabel ?? 'Update Response') : (submitLabel ?? 'Submit Response')}</span><span aria-hidden="true"> →</span>
          </button>
        </div>
      </form>
    </section>
  );
}
