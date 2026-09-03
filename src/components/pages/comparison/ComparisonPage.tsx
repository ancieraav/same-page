'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ui/ToastProvider';
import { ComparisonPart1 } from './ComparisonPart1';
import { ComparisonPart2 } from './ComparisonPart2';

type Filter = 'all' | 'high' | 'moderate' | 'low';
type Sort = 'match-desc' | 'match-asc' | 'name-asc' | 'name-desc';

const people = [
  { id: 'you', name: 'Anugrah (You)', role: 'Lead Product Strategist', score: 84 },
  { id: 'raka', name: 'Raka Pratama', role: 'Engineering Lead', score: 78 },
  { id: 'elena', name: 'Elena Rostova', role: 'Design Lead', score: 88 },
  { id: 'sarah', name: 'Sarah Jenkins', role: 'Growth Marketing', score: 69 },
  { id: 'david', name: 'David Chen', role: 'Ops Finance', score: 73 },
];

export function ComparisonPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { showToast } = useToast();
  const questionId = params.get('q') === '2' ? 2 : 1;
  const multi = params.get('combo') === '1' || params.get('mode') === 'multi';
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('match-desc');

  const visibleIds = useMemo(() => {
    const query = search.trim().toLowerCase();
    return people.filter((person) => {
      const matchesSearch = !query || `${person.name} ${person.role}`.toLowerCase().includes(query);
      const matchesFilter = filter === 'all' || filter === 'high' && person.score >= 80 || filter === 'moderate' && person.score >= 70 && person.score < 80 || filter === 'low' && person.score < 70;
      return matchesSearch && matchesFilter;
    }).sort((left, right) => sort === 'match-asc' ? left.score - right.score : sort === 'name-asc' ? left.name.localeCompare(right.name) : sort === 'name-desc' ? right.name.localeCompare(left.name) : right.score - left.score).map((person) => person.id);
  }, [filter, search, sort]);

  const toggleStatement = (index: number) => setExpanded((current) => {
    const next = new Set(current);
    if (next.has(index)) next.delete(index); else next.add(index);
    return next;
  });

  const nextQuestion = () => {
    if (questionId === 1) router.push('/session?q=2');
    else router.push('/analytics?combo=1');
  };

  return <><ComparisonPart1 /><ComparisonPart2 questionId={questionId as 1 | 2} summaryOpen={summaryOpen} onToggleSummary={() => setSummaryOpen((value) => !value)} onNext={nextQuestion} busy={false} multi={multi} visibleIds={visibleIds} expanded={expanded} onToggle={toggleStatement} search={search} filter={filter} sort={sort} onSearch={setSearch} onFilterChange={setFilter} onSortChange={setSort} onRefresh={() => showToast('Perspectives refreshed')} /></>;
}
