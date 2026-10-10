import { ComparisonQuestionCard } from './ComparisonQuestionCard';
import { ComparisonOverviewCards } from './ComparisonOverviewCards';
import { ComparisonSideBySideView, type PerspectiveCardData } from './ComparisonSideBySideView';
import { ComparisonMultiGridView } from './ComparisonMultiGridView';
import { ComparisonBottomDock } from './ComparisonBottomDock';
import type { Filter, Sort } from './ComparisonToolbar';

export interface ComparisonStageProps {
  questionId?: 1 | 2 | undefined;
  summaryOpen: boolean;
  onToggleSummary: () => void;
  onNext?: (() => void) | undefined;
  busy?: boolean | undefined;
  multi?: boolean | undefined;
  visibleIds?: string[] | undefined;
  expanded?: Set<number> | undefined;
  onToggle?: ((index: number) => void) | undefined;
  search?: string | undefined;
  filter?: Filter | undefined;
  sort?: Sort | undefined;
  onSearch?: ((value: string) => void) | undefined;
  onFilterChange?: ((value: Filter) => void) | undefined;
  onSortChange?: ((value: Sort) => void) | undefined;
  onRefresh?: (() => void) | undefined;
  // Optional Live props
  secondsLeft?: number | null | undefined;
  questionNumber?: number | undefined;
  totalQuestions?: number | undefined;
  questionText?: string | undefined;
  alignment?: number | null | undefined;
  userAlignment?: number | null | undefined;
  consensusSummary?: string | undefined;
  sharedNorthStar?: string | undefined;
  divergencePoint?: string | undefined;
  perspectives?: PerspectiveCardData[] | undefined;
}

const noop = () => { /* no-op handler */ };
const noopArg = (_value?: unknown) => { /* no-op handler */ };

export function ComparisonStage({
  questionId = 1,
  summaryOpen,
  onToggleSummary,
  onNext,
  busy = false,
  multi = false,
  visibleIds = [],
  expanded = new Set(),
  onToggle = noopArg,
  search = '',
  filter = 'all',
  sort = 'match-desc',
  onSearch = noopArg,
  onFilterChange = noopArg,
  onSortChange = noopArg,
  onRefresh = noop,
  secondsLeft = 30,
  questionNumber,
  totalQuestions = 5,
  questionText,
  alignment,
  userAlignment,
  consensusSummary,
  sharedNorthStar,
  divergencePoint,
  perspectives,
}: ComparisonStageProps) {
  return (
    <main className="comparison-canvas-wrapper" id="comparison-canvas-wrapper">
      <ComparisonQuestionCard
        questionId={questionId}
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        questionText={questionText}
        secondsLeft={secondsLeft}
      />
      <ComparisonOverviewCards
        summaryOpen={summaryOpen}
        onToggleSummary={onToggleSummary}
        alignment={alignment}
        userAlignment={userAlignment}
        consensusSummary={consensusSummary}
        sharedNorthStar={sharedNorthStar}
        divergencePoint={divergencePoint}
      />
      <ComparisonSideBySideView multi={multi} perspectives={perspectives} />
      {multi ? (
        <ComparisonMultiGridView
          multi={multi}
          visibleIds={visibleIds}
          expanded={expanded}
          onToggle={onToggle}
          search={search}
          filter={filter}
          sort={sort}
          onSearch={onSearch}
          onFilterChange={onFilterChange}
          onSortChange={onSortChange}
          onRefresh={onRefresh}
        />
      ) : null}
      <ComparisonBottomDock secondsLeft={secondsLeft} onNext={onNext} busy={busy} />
    </main>
  );
}
