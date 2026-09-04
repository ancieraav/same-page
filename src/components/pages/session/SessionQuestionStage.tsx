'use client';

import { useEffect, useRef, useState } from 'react';
import { SessionToolbar } from './SessionToolbar';

export interface SessionQuestionStageProps {
  questionNumber: number;
  questionText: string;
  answer: string;
  operator: boolean;
  disabled: boolean;
  busy: boolean;
  submittedCount: number;
  participantCount: number;
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
  onAnswerChange,
  onSubmit,
}: SessionQuestionStageProps) {
  const answerRef = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState<'write' | 'preview'>('write');
  const [submitting, setSubmitting] = useState(false);
  const editable = !disabled && !busy && !submitting;
  const responseClosed = disabled && !operator && !busy && !submitting;

  useEffect(() => {
    if (editable) answerRef.current?.focus();
  }, [editable, questionNumber]);

  const applyFormat = (format: string) => {
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
    if (!editable || !answer.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setSubmitting(false);
    }
  };

  const participantLabel = `${String(submittedCount)} of ${String(participantCount)} participants answered`;
  return (
    <section className="question-stage-clean live-question-editor" aria-labelledby="live-question-title">
      <div className="question-round-indicator"><span className="round-indicator-dot" aria-hidden="true" />Question {String(questionNumber)}</div>
      <h2 className="question-headline" id="live-question-title">{questionText}</h2>
      <p className="question-sub-prompt">Share your honest perspective. Your response stays private until the round closes.</p>
      <form onSubmit={(event) => { void submit(event); }}>
        <div className="rich-editor-box">
          <SessionToolbar mode={mode} onFormat={applyFormat} onMode={setMode} disabled={!editable} />
          <div className="editor-textarea-wrapper">
            {mode === 'write' ? (
              <textarea
                ref={answerRef}
                id="participant-answer-input"
                className="answer-textarea"
                placeholder={operator ? 'Operator view — participants answer from their own tabs.' : responseClosed ? 'Responses are closed for this question.' : 'Write your honest perspective here...'}
                aria-label="Write your response"
                value={answer}
                disabled={disabled || busy || submitting}
                onChange={(event) => { onAnswerChange(event.target.value); }}
              />
            ) : <div className="answer-preview-pane"><MarkdownPreview value={answer} /></div>}
            <div className="editor-grab-handle" title="Drag to resize box" aria-label="Resize handle" aria-hidden="true">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><line x1="8.5" y1="1.5" x2="1.5" y2="8.5" /><line x1="8.5" y1="5" x2="5" y2="8.5" /></svg>
            </div>
          </div>
        </div>
        <div className="question-actions-row">
          <span className="question-participant-status">{operator ? `Operator view · ${participantLabel}` : responseClosed ? 'Response window closed' : participantLabel}</span>
          <button type="submit" className="btn-submit-answer" disabled={!editable || !answer.trim()} aria-busy={busy || submitting}>
            <span>{operator ? 'Operator view' : responseClosed ? 'Response window closed' : busy || submitting ? 'Saving…' : answer.trim() ? 'Update Response' : 'Submit Response'}</span><span aria-hidden="true"> →</span>
          </button>
        </div>
      </form>
    </section>
  );
}
