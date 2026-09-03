'use client';

import { useEffect, useMemo, useState } from 'react';
import { useToast } from '@/components/ui/ToastProvider';
import { ParticipantsPart1 } from './ParticipantsPart1';
import { ParticipantsPart2 } from './ParticipantsPart2';
import { ParticipantsPart8 } from './ParticipantsPart8';
import type { Filter, Sort } from '../comparison/ComparisonPart7';

const participants = [
  { id: 'elena', name: 'Elena Rostova', initials: 'ER', role: 'Design Lead', score: 88 },
  { id: 'you', name: 'Anugrah (You)', initials: 'A', role: 'Lead Product Strategist', score: 84 },
  { id: 'raka', name: 'Raka Pratama', initials: 'RP', role: 'Engineering Lead', score: 78 },
  { id: 'david', name: 'David Chen', initials: 'DC', role: 'Ops · Finance', score: 73 },
  { id: 'sarah', name: 'Sarah Jenkins', initials: 'SJ', role: 'Growth · Marketing', score: 69 },
];

export function ParticipantsPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('match-desc');
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const visibleIds = useMemo(() => {
    const query = search.trim().toLowerCase();
    return participants.filter((participant) => {
      const matchesSearch = !query || `${participant.name} ${participant.role}`.toLowerCase().includes(query);
      const matchesFilter = filter === 'all' || filter === 'high' && participant.score >= 80 || filter === 'moderate' && participant.score >= 70 && participant.score < 80 || filter === 'low' && participant.score < 70;
      return matchesSearch && matchesFilter;
    }).sort((left, right) => sort === 'match-asc' ? left.score - right.score : sort === 'name-asc' ? left.name.localeCompare(right.name) : sort === 'name-desc' ? right.name.localeCompare(left.name) : right.score - left.score).map((participant) => participant.id);
  }, [filter, search, sort]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setSelectedId(null); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const selected = participants.find((participant) => participant.id === selectedId) ?? participants[0];
  const toggleStatement = (index: number) => setExpanded((current) => {
    const next = new Set(current);
    if (next.has(index)) next.delete(index); else next.add(index);
    return next;
  });
  const reset = () => { setSearch(''); setFilter('all'); setSort('match-desc'); };

  return <><ParticipantsPart1 /><ParticipantsPart2 visibleIds={visibleIds} empty={visibleIds.length === 0} expanded={expanded} onToggle={toggleStatement} onOpen={setSelectedId} search={search} filter={filter} sort={sort} onSearch={setSearch} onFilterChange={setFilter} onSortChange={setSort} onRefresh={() => showToast('Perspectives refreshed')} onReset={reset} /><ParticipantsPart8 open={selectedId !== null} selected={selected} onClose={() => setSelectedId(null)} /></>;
}
