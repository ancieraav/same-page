import { ComparisonToolbar, type Filter, type Sort } from '../comparison/ComparisonToolbar';
import { ParticipantsHero } from './ParticipantsHero';
import { ParticipantsEmptyState } from './ParticipantsEmptyState';
import { ParticipantsCardList } from './ParticipantsCardList';
import { ParticipantsBottomDock } from './ParticipantsBottomDock';

interface ParticipantsStageProps {
  visibleIds: string[];
  empty: boolean;
  expanded: Set<number>;
  onToggle: (index: number) => void;
  onOpen: (id: string) => void;
  search: string;
  filter: Filter;
  sort: Sort;
  onSearch: (value: string) => void;
  onFilterChange: (value: Filter) => void;
  onSortChange: (value: Sort) => void;
  onRefresh: () => void;
  onReset: () => void;
}

export function ParticipantsStage({
  visibleIds,
  empty,
  expanded,
  onToggle,
  onOpen,
  search,
  filter,
  sort,
  onSearch,
  onFilterChange,
  onSortChange,
  onRefresh,
  onReset,
}: ParticipantsStageProps) {
  return (
    <main className="analytics-canvas-wrapper" id="participants-canvas-wrapper">
      <ParticipantsHero />
      <ComparisonToolbar
        search={search}
        filter={filter}
        sort={sort}
        onSearch={onSearch}
        onFilterChange={onFilterChange}
        onSortChange={onSortChange}
        onRefresh={onRefresh}
      />
      <ParticipantsEmptyState visible={empty} onReset={onReset} />
      <ParticipantsCardList
        visibleIds={visibleIds}
        expanded={expanded}
        onToggle={onToggle}
        onOpen={onOpen}
      />
      <ParticipantsBottomDock />
    </main>
  );
}
