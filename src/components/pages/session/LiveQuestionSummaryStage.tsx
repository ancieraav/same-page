'use client';

import { useMemo, useState } from 'react';
import { ComparisonStage } from '@/components/pages/comparison/ComparisonStage';
import type { PerspectiveCardData } from '@/components/pages/comparison/ComparisonSideBySideView';
import type { SessionAnalytics } from './SessionAnalysisCards';

interface PlayerInfo {
  guest_id: string;
  name: string;
  avatar_url?: string | null;
}

interface QuestionAnswer {
  question?: number | null;
  guest_id: string;
  name: string;
  body: string;
  missing?: boolean;
}

interface SnapshotData {
  players: PlayerInfo[];
  questions: { number: number; text?: string }[];
  answers?: QuestionAnswer[];
}

export interface LiveQuestionSummaryStageProps {
  analysis: SessionAnalytics;
  snapshot: SnapshotData;
  selfId: string;
  secondsLeft: number | null | undefined;
}

export function LiveQuestionSummaryStage({
  analysis,
  snapshot,
  selfId,
  secondsLeft,
}: LiveQuestionSummaryStageProps) {
  const [summaryOpen, setSummaryOpen] = useState(false);

  const questionNumber = analysis.question ?? 1;
  const foundText = snapshot.questions.find((q) => q.number === questionNumber)?.text;
  const questionText = analysis.question_text ?? foundText ?? `Question ${String(questionNumber)}`;

  const perspectives: PerspectiveCardData[] = useMemo(() => {
    const questionAnswers = snapshot.answers?.filter((a) => a.question === questionNumber) ?? [];
    return snapshot.players.map((player, idx) => {
      const summaryItem = analysis.summaries.find((s) => s.guest_id === player.guest_id);
      const answerItem = questionAnswers.find((a) => a.guest_id === player.guest_id);
      const isSelf = player.guest_id === selfId;

      return {
        id: player.guest_id,
        name: `${player.name}${isSelf ? ' (You)' : ''}`,
        role: '',
        score: analysis.alignment ?? 75,
        scoreTone: (analysis.alignment ?? 75) >= 70 ? 'tone-positive' : 'tone-indigo',
        avatarColor: idx === 0 ? 'avatar-color-indigo' : 'avatar-color-emerald',
        initials: player.name.slice(0, 2).toUpperCase(),
        isSelf,
        preview: summaryItem?.summary ?? answerItem?.body ?? 'Response submitted.',
        extended: answerItem?.body && summaryItem?.summary ? `Original Response:\n"${answerItem.body}"` : undefined,
      };
    });
  }, [analysis, questionNumber, selfId, snapshot.answers, snapshot.players]);

  const consensusSummary = analysis.agreed.length > 0
    ? analysis.agreed.join('. ')
    : analysis.confidence.trim().length > 0
    ? analysis.confidence
    : 'Consensus synthesized across all participant perspectives.';

  const sharedNorthStar = analysis.agreed.length > 0
    ? analysis.agreed.join(', ')
    : 'Common ground established on the primary strategic direction.';

  const divergencePoint = analysis.disagreed.length > 0
    ? analysis.disagreed.join(', ')
    : 'No critical blockers or divergences identified between participants.';

  return (
    <ComparisonStage
      questionNumber={questionNumber}
      totalQuestions={Math.max(5, snapshot.questions.length)}
      questionText={questionText}
      secondsLeft={secondsLeft}
      summaryOpen={summaryOpen}
      onToggleSummary={() => { setSummaryOpen((v) => !v); }}
      alignment={analysis.alignment}
      userAlignment={analysis.alignment}
      consensusSummary={consensusSummary}
      sharedNorthStar={sharedNorthStar}
      divergencePoint={divergencePoint}
      perspectives={perspectives}
    />
  );
}
