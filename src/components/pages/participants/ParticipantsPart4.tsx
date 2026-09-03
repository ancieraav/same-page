import { ComparisonPart7, type Filter, type Sort } from '../comparison/ComparisonPart7';

export function ParticipantsPart4(props: { search: string; filter: Filter; sort: Sort; onSearch: (value: string) => void; onFilterChange: (value: Filter) => void; onSortChange: (value: Sort) => void; onRefresh: () => void }) {
  return <ComparisonPart7 {...props} />;
}
