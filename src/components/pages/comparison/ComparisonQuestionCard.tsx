export interface ComparisonQuestionCardProps {
  questionId?: 1 | 2 | undefined;
  questionNumber?: number | undefined;
  totalQuestions?: number | undefined;
  questionText?: string | undefined;
  secondsLeft?: number | null | undefined;
}

export function ComparisonQuestionCard({
  questionId = 1,
  questionNumber,
  totalQuestions = 5,
  questionText,
  secondsLeft = 30,
}: ComparisonQuestionCardProps) {
  const number = questionNumber ?? questionId;
  const displaySeconds = secondsLeft !== null ? Math.max(0, secondsLeft) : 30;
  const title = questionText ?? (
    questionId === 1
      ? 'Based on our strategic goals in Design Alignment Sync, what is the single highest-leverage priority our team must commit to, and what are we explicitly deprioritizing?'
      : 'What is the single biggest architectural or operational bottleneck that could prevent our team from hitting our Q3 North Star metrics, and who owns the fix?'
  );

  return (
    <section className="comparison-question-header">
      <div className="comparison-headline-row">
        <div className="question-round-indicator" id="comparison-round-indicator">
          <span className="round-indicator-dot" aria-hidden="true" />
          <span>Question {number} of {totalQuestions} &bull; Completed</span>
        </div>
        <div className="summary-timer-badge" id="summary-review-timer-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>Reading time: <strong>{displaySeconds}s</strong></span>
        </div>
      </div>
      <h1 className="comparison-question-title" id="comparison-question-title">
        {title}
      </h1>
    </section>
  );
}
