import { ComparisonPart7 } from './ComparisonPart7';
import { ComparisonPart8 } from './ComparisonPart8';
import { ComparisonPart9 } from './ComparisonPart9';

export function ComparisonPart6({ multi, visibleIds, expanded, onToggle, search, filter, sort, onSearch, onFilterChange, onSortChange, onRefresh }: { multi: boolean; visibleIds: string[]; expanded: Set<number>; onToggle: (index: number) => void; search: string; filter: 'all' | 'high' | 'moderate' | 'low'; sort: 'match-desc' | 'match-asc' | 'name-asc' | 'name-desc'; onSearch: (value: string) => void; onFilterChange: (value: 'all' | 'high' | 'moderate' | 'low') => void; onSortChange: (value: 'match-desc' | 'match-asc' | 'name-asc' | 'name-desc') => void; onRefresh: () => void }) {
  return (
    <section className={`comparison-stage-mode${multi ? '' : ' is-hidden'}`} id={"stage-mode-multi"}>
      <ComparisonPart7 search={search} filter={filter} sort={sort} onSearch={onSearch} onFilterChange={onFilterChange} onSortChange={onSortChange} onRefresh={onRefresh} />
      <ComparisonPart8 />
      <ComparisonPart9 visibleIds={visibleIds} expanded={expanded} onToggle={onToggle} />
    </section>
  );
}
