import { ParticipantsPart3 } from './ParticipantsPart3';
import { ParticipantsPart4 } from './ParticipantsPart4';
import { ParticipantsPart5 } from './ParticipantsPart5';
import { ParticipantsPart6 } from './ParticipantsPart6';
import { ParticipantsPart7 } from './ParticipantsPart7';
import type { Filter, Sort } from '../comparison/ComparisonPart7';

type Props = { visibleIds: string[]; empty: boolean; expanded: Set<number>; onToggle: (index: number) => void; onOpen: (id: string) => void; search: string; filter: Filter; sort: Sort; onSearch: (value: string) => void; onFilterChange: (value: Filter) => void; onSortChange: (value: Sort) => void; onRefresh: () => void; onReset: () => void };

export function ParticipantsPart2({ visibleIds, empty, expanded, onToggle, onOpen, search, filter, sort, onSearch, onFilterChange, onSortChange, onRefresh, onReset }: Props) {
  return <main className="analytics-canvas-wrapper" id="participants-canvas-wrapper"><ParticipantsPart3 /><ParticipantsPart4 search={search} filter={filter} sort={sort} onSearch={onSearch} onFilterChange={onFilterChange} onSortChange={onSortChange} onRefresh={onRefresh} /><ParticipantsPart5 visible={empty} onReset={onReset} /><ParticipantsPart6 visibleIds={visibleIds} expanded={expanded} onToggle={onToggle} onOpen={onOpen} /><ParticipantsPart7 /></main>;
}
