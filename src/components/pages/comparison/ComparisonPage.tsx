'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ui/ToastProvider';
import { ComparisonHeader } from './ComparisonHeader';
import { ComparisonStage } from './ComparisonStage';
import type { Filter, Sort } from './ComparisonToolbar';

export function ComparisonPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const questionParam = Number(searchParams.get('q') ?? '1');
  const questionId = questionParam === 2 ? 2 : 1;
  const multi = searchParams.get('multi') === '1';

  const [summaryOpen, setSummaryOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('match-desc');
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const participants = useMemo(
    () => [
      { id: 'you', name: 'Anugrah (You)', role: 'Lead Product Strategist', score: 84 },
      { id: 'raka', name: 'Raka Pratama', role: 'Engineering Lead', score: 78 },
      { id: 'elena', name: 'Elena Rostova', role: 'Design Lead', score: 88 },
      { id: 'david', name: 'David Chen', role: 'Ops · Finance', score: 73 },
      { id: 'sarah', name: 'Sarah Jenkins', role: 'Growth · Marketing', score: 69 },
    ],
    []
  );

  const visibleIds = useMemo(() => {
    const query = search.trim().toLowerCase();
    return participants
      .filter((participant) => {
        const matchesSearch =
          !query || `${participant.name} ${participant.role}`.toLowerCase().includes(query);
        const matchesFilter =
          filter === 'all' ||
          (filter === 'high' && participant.score >= 80) ||
          (filter === 'moderate' && participant.score >= 70 && participant.score < 80) ||
          (filter === 'low' && participant.score < 70);
        return matchesSearch && matchesFilter;
      })
      .sort((left, right) =>
        sort === 'match-asc'
          ? left.score - right.score
          : sort === 'name-asc'
          ? left.name.localeCompare(right.name)
          : sort === 'name-desc'
          ? right.name.localeCompare(left.name)
          : right.score - left.score
      )
      .map((participant) => participant.id);
  }, [filter, participants, search, sort]);

  const toggleStatement = (index: number) => { setExpanded((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    }); };

  const nextQuestion = () => {
    if (questionId === 1) router.push('/meme');
    else router.push('/analytics');
  };

  return (
    <>
      <ComparisonHeader />
      <ComparisonStage
        questionId={questionId}
        summaryOpen={summaryOpen}
        onToggleSummary={() => { setSummaryOpen((value) => !value); }}
        onNext={nextQuestion}
        busy={false}
        multi={multi}
        visibleIds={visibleIds}
        expanded={expanded}
        onToggle={toggleStatement}
        search={search}
        filter={filter}
        sort={sort}
        onSearch={setSearch}
        onFilterChange={setFilter}
        onSortChange={setSort}
        onRefresh={() => { showToast('Perspectives refreshed'); }}
      />
    </>
  );
}
