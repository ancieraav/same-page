'use client';

import { useState } from 'react';

export type Filter = 'all' | 'high' | 'moderate' | 'low';
export type Sort = 'match-desc' | 'match-asc' | 'name-asc' | 'name-desc';

const FILTER_OPTIONS: { value: Filter; label: string; menuLabel: string }[] = [
  { value: 'all', label: 'All Match Levels', menuLabel: 'All Match Levels' },
  { value: 'high', label: 'High Match (≥ 80%)', menuLabel: 'High Match (≥ 80%)' },
  { value: 'moderate', label: 'Moderate Match (70–79%)', menuLabel: 'Moderate Match (70–79%)' },
  { value: 'low', label: 'Divergent (< 70%)', menuLabel: 'Divergent Perspectives (< 70%)' },
];

const SORT_OPTIONS: { value: Sort; label: string; menuLabel: string }[] = [
  { value: 'match-desc', label: 'Match: High to Low', menuLabel: 'Highest Alignment First' },
  { value: 'match-asc', label: 'Match: Low to High', menuLabel: 'Lowest Alignment First' },
  { value: 'name-asc', label: 'Name: A to Z', menuLabel: 'Name (A–Z)' },
  { value: 'name-desc', label: 'Name: Z to A', menuLabel: 'Name (Z–A)' },
];

function SearchInputBox({ search, onSearch }: { search: string; onSearch: (val: string) => void }) {
  return (
    <div className="team-toolbar-search-box">
      <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="text"
        id="multi-search-input"
        className="multi-search-input"
        placeholder="Search by name or perspective..."
        aria-label="Search perspectives"
        value={search}
        onChange={(event) => { onSearch(event.target.value); }}
      />
      <button
        type="button"
        className="btn-clear-search"
        id="btn-clear-search"
        aria-label="Clear search"
        title="Clear search"
        style={{ display: search ? 'block' : 'none' }}
        onClick={() => { onSearch(''); }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

function FilterDropdown({
  filter,
  open,
  onToggle,
  onSelect,
}: {
  filter: Filter;
  open: boolean;
  onToggle: () => void;
  onSelect: (val: Filter) => void;
}) {
  const current = FILTER_OPTIONS.find((item) => item.value === filter) ?? FILTER_OPTIONS[0];

  return (
    <div className={`custom-dropdown${open ? ' is-open' : ''}`} id="dropdown-filter-wrap">
      <button
        type="button"
        className="custom-dropdown-trigger"
        id="btn-filter-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        title="Filter by alignment score"
        onClick={onToggle}
      >
        <svg className="dropdown-trigger-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        <span className="custom-dropdown-label" id="filter-dropdown-label">
          {current?.label}
        </span>
        <svg className="dropdown-chevron-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div className="custom-dropdown-menu" id="menu-filter-options" role="listbox">
        {FILTER_OPTIONS.map((item) => (
          <button
            key={item.value}
            type="button"
            className={`custom-dropdown-item${filter === item.value ? ' is-selected' : ''}`}
            role="option"
            data-value={item.value}
            aria-selected={filter === item.value}
            onClick={() => { onSelect(item.value); }}
          >
            <span className="item-label">{item.menuLabel}</span>
            <svg className="item-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

function SortDropdown({
  sort,
  open,
  onToggle,
  onSelect,
}: {
  sort: Sort;
  open: boolean;
  onToggle: () => void;
  onSelect: (val: Sort) => void;
}) {
  const current = SORT_OPTIONS.find((item) => item.value === sort) ?? SORT_OPTIONS[0];

  return (
    <div className={`custom-dropdown${open ? ' is-open' : ''}`} id="dropdown-sort-wrap">
      <button
        type="button"
        className="custom-dropdown-trigger"
        id="btn-sort-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        title="Sort perspectives"
        onClick={onToggle}
      >
        <svg className="dropdown-trigger-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="4" />
          <polyline points="14 16 18 20 22 16" />
          <line x1="6" y1="4" x2="6" y2="20" />
          <polyline points="10 8 6 4 2 8" />
        </svg>
        <span className="custom-dropdown-label" id="sort-dropdown-label">
          {current?.label}
        </span>
        <svg className="dropdown-chevron-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div className="custom-dropdown-menu" id="menu-sort-options" role="listbox">
        {SORT_OPTIONS.map((item) => (
          <button
            key={item.value}
            type="button"
            className={`custom-dropdown-item${sort === item.value ? ' is-selected' : ''}`}
            role="option"
            data-value={item.value}
            aria-selected={sort === item.value}
            onClick={() => { onSelect(item.value); }}
          >
            <span className="item-label">{item.menuLabel}</span>
            <svg className="item-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

interface ComparisonToolbarProps {
  search: string;
  filter: Filter;
  sort: Sort;
  onSearch: (value: string) => void;
  onFilterChange: (value: Filter) => void;
  onSortChange: (value: Sort) => void;
  onRefresh: () => void;
}

export function ComparisonToolbar({
  search,
  filter,
  sort,
  onSearch,
  onFilterChange,
  onSortChange,
  onRefresh,
}: ComparisonToolbarProps) {
  const [openMenu, setOpenMenu] = useState<'filter' | 'sort' | null>(null);

  return (
    <div className="team-list-toolbar" id="team-list-toolbar">
      <SearchInputBox search={search} onSearch={onSearch} />
      <div className="team-toolbar-actions">
        <FilterDropdown
          filter={filter}
          open={openMenu === 'filter'}
          onToggle={() => { setOpenMenu(openMenu === 'filter' ? null : 'filter'); }}
          onSelect={(val) => {
            onFilterChange(val);
            setOpenMenu(null);
          }}
        />
        <SortDropdown
          sort={sort}
          open={openMenu === 'sort'}
          onToggle={() => { setOpenMenu(openMenu === 'sort' ? null : 'sort'); }}
          onSelect={(val) => {
            onSortChange(val);
            setOpenMenu(null);
          }}
        />
        <button
          type="button"
          className="btn-toolbar-refresh"
          id="btn-toolbar-refresh"
          title="Refresh perspectives"
          onClick={onRefresh}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </button>
      </div>
    </div>
  );
}
