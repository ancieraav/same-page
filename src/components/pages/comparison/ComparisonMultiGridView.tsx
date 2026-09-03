import { ComparisonToolbar, type Filter, type Sort } from './ComparisonToolbar';
import { ComparisonEmptyState } from './ComparisonEmptyState';
import { ComparisonResponsesList } from './ComparisonResponsesList';

interface ComparisonMultiGridViewProps {
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

export function ComparisonMultiGridView({
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
}: ComparisonMultiGridViewProps) {
  return (
    <section className={`comparison-stage-mode${multi ? '' : ' is-hidden'}`} id="stage-mode-multi">
      <ComparisonToolbar
        search={search}
        filter={filter}
        sort={sort}
        onSearch={onSearch}
        onFilterChange={onFilterChange}
        onSortChange={onSortChange}
        onRefresh={onRefresh}
      />
      <ComparisonEmptyState />
      <ComparisonResponsesList
        visibleIds={visibleIds}
        expanded={expanded}
        onToggle={onToggle}
      />
    </section>
  );
}
