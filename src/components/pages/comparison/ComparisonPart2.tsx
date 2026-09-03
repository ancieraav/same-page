import { ComparisonPart3 } from './ComparisonPart3';
import { ComparisonPart4 } from './ComparisonPart4';
import { ComparisonPart5 } from './ComparisonPart5';
import { ComparisonPart6 } from './ComparisonPart6';
import { ComparisonPart10 } from './ComparisonPart10';

export function ComparisonPart2({ questionId, summaryOpen, onToggleSummary, onNext, busy, multi, visibleIds, expanded, onToggle, search, filter, sort, onSearch, onFilterChange, onSortChange, onRefresh }: { questionId: 1 | 2; summaryOpen: boolean; onToggleSummary: () => void; onNext: () => void; busy: boolean; multi: boolean; visibleIds: string[]; expanded: Set<number>; onToggle: (index: number) => void; search: string; filter: 'all' | 'high' | 'moderate' | 'low'; sort: 'match-desc' | 'match-asc' | 'name-asc' | 'name-desc'; onSearch: (value: string) => void; onFilterChange: (value: 'all' | 'high' | 'moderate' | 'low') => void; onSortChange: (value: 'match-desc' | 'match-asc' | 'name-asc' | 'name-desc') => void; onRefresh: () => void }) {
  return (
    <main className={"comparison-canvas-wrapper"} id={"comparison-canvas-wrapper"}>
      <ComparisonPart3 questionId={questionId} />
      <ComparisonPart4 summaryOpen={summaryOpen} onToggleSummary={onToggleSummary} />
      <ComparisonPart5 multi={multi} />
      <ComparisonPart6 multi={multi} visibleIds={visibleIds} expanded={expanded} onToggle={onToggle} search={search} filter={filter} sort={sort} onSearch={onSearch} onFilterChange={onFilterChange} onSortChange={onSortChange} onRefresh={onRefresh} />
      <ComparisonPart10 onNext={onNext} busy={busy} />
    </main>
  );
}
