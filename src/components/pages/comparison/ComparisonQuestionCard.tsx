export function ComparisonQuestionCard({ questionId }: { questionId: 1 | 2 }) {
  return (
    <section className="comparison-question-header">
      <div className="comparison-headline-row">
        <div className="question-round-indicator" id="comparison-round-indicator">
          <span className="round-indicator-dot" aria-hidden="true" />
          <span>Question {questionId} of 2 &bull; Completed</span>
        </div>
      </div>
      <h1 className="comparison-question-title" id="comparison-question-title">
        {questionId === 1
          ? 'Based on our strategic goals in Design Alignment Sync, what is the single highest-leverage priority our team must commit to, and what are we explicitly deprioritizing?'
          : 'What is the single biggest architectural or operational bottleneck that could prevent our team from hitting our Q3 North Star metrics, and who owns the fix?'}
      </h1>
    </section>
  );
}
