import { ComparisonQuestionCard } from './ComparisonQuestionCard';
import { ComparisonOverviewCards } from './ComparisonOverviewCards';
import { ComparisonSideBySideView } from './ComparisonSideBySideView';
import { ComparisonMultiGridView } from './ComparisonMultiGridView';
import { ComparisonBottomDock } from './ComparisonBottomDock';
import type { Filter, Sort } from './ComparisonToolbar';

interface ComparisonStageProps {
  questionId: 1 | 2;
  summaryOpen: boolean;
  onToggleSummary: () => void;
  onNext: () => void;
  busy: boolean;
  multi: boolean;
  visibleIds: string[];
  expanded: Set<number>;
  onToggle: (index: number) => void;
  search: string;
  filter: Filter;
  sort: Sort;
  onSearch: (value: string) => void;
  onFilterChange: (value: Filter) => void;
  onSortChange: (value: Sort) => void;
  onRefresh: () => void;
}

export function ComparisonStage({
  questionId,
  summaryOpen,
  onToggleSummary,
  onNext,
  busy,
  multi,
  visibleIds,
  expanded,
  onToggle,
  search,
  filter,
  sort,
  onSearch,
  onFilterChange,
  onSortChange,
  onRefresh,
}: ComparisonStageProps) {
  return (
    <main className="comparison-canvas-wrapper" id="comparison-canvas-wrapper">
      <ComparisonQuestionCard questionId={questionId} />
      <ComparisonOverviewCards
        summaryOpen={summaryOpen}
        onToggleSummary={onToggleSummary}
      />
      <ComparisonSideBySideView multi={multi} />
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
      <ComparisonBottomDock onNext={onNext} busy={busy} />
    </main>
  );
}
