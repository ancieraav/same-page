'use client';

import { useMemo, useState } from 'react';
import { useToast } from '@/components/ui/ToastProvider';
import { ParticipantsHeader } from './ParticipantsHeader';
import { ParticipantsStage } from './ParticipantsStage';
import { ParticipantDetailModal, type SelectedParticipant } from './ParticipantDetailModal';
import type { Filter, Sort } from '../comparison/ComparisonToolbar';

export function ParticipantsPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('match-desc');
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<SelectedParticipant>({
    name: 'Elena Rostova',
    initials: 'ER',
    role: 'Design Lead',
    score: 88,
  });

  const participants = useMemo(
    () => [
      { id: 'elena', name: 'Elena Rostova', role: 'Design Lead', score: 88, initials: 'ER' },
      { id: 'you', name: 'Anugrah (You)', role: 'Lead Product Strategist', score: 84, initials: 'A' },
      { id: 'raka', name: 'Raka Pratama', role: 'Engineering Lead', score: 78, initials: 'RP' },
      { id: 'david', name: 'David Chen', role: 'Ops · Finance', score: 73, initials: 'DC' },
      { id: 'sarah', name: 'Sarah Jenkins', role: 'Growth · Marketing', score: 69, initials: 'SJ' },
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

  const toggleStatement = (index: number) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  const openParticipantModal = (id: string) => {
    const item = participants.find((p) => p.id === id);
    if (item) setSelected(item);
    setModalOpen(true);
  };

  return (
    <>
      <ParticipantsHeader />
      <ParticipantsStage
        visibleIds={visibleIds}
        empty={visibleIds.length === 0}
        expanded={expanded}
        onToggle={toggleStatement}
        onOpen={openParticipantModal}
        search={search}
        filter={filter}
        sort={sort}
        onSearch={setSearch}
        onFilterChange={setFilter}
        onSortChange={setSort}
        onRefresh={() => showToast('Team perspectives updated')}
        onReset={() => {
          setSearch('');
          setFilter('all');
        }}
      />
      <ParticipantDetailModal
        open={modalOpen}
        selected={selected}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
