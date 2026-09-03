'use client';

import { useState } from 'react';

export type Filter = 'all' | 'high' | 'moderate' | 'low';
export type Sort = 'match-desc' | 'match-asc' | 'name-asc' | 'name-desc';

type ComparisonToolbarProps = {
  search: string;
  filter: Filter;
  sort: Sort;
  onSearch: (value: string) => void;
  onFilterChange: (value: Filter) => void;
  onSortChange: (value: Sort) => void;
  onRefresh: () => void;
};

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
      <div className="team-toolbar-search-box">
        <svg
          className="search-icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          id="multi-search-input"
          className="multi-search-input"
          placeholder="Search by name, role, or perspective..."
          aria-label="Search perspectives"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
        />
        <button
          type="button"
          className="btn-clear-search"
          id="btn-clear-search"
          aria-label="Clear search"
          title="Clear search"
          style={{ display: search ? 'block' : 'none' }}
          onClick={() => onSearch('')}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div className="team-toolbar-actions">
        <div className={`custom-dropdown${openMenu === 'filter' ? ' is-open' : ''}`} id="dropdown-filter-wrap">
          <button
            type="button"
            className="custom-dropdown-trigger"
            id="btn-filter-trigger"
            aria-haspopup="listbox"
            aria-expanded={openMenu === 'filter'}
            title="Filter by alignment score"
            onClick={() => setOpenMenu(openMenu === 'filter' ? null : 'filter')}
          >
            <svg
              className="dropdown-trigger-icon"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span className="custom-dropdown-label" id="filter-dropdown-label">
              {filter === 'high'
                ? 'High Match (≥ 80%)'
                : filter === 'moderate'
                ? 'Moderate Match (70–79%)'
                : filter === 'low'
                ? 'Divergent (< 70%)'
                : 'All Match Levels'}
            </span>
            <svg
              className="dropdown-chevron-icon"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <div className="custom-dropdown-menu" id="menu-filter-options" role="listbox">
            <button
              type="button"
              className={`custom-dropdown-item${filter === 'all' ? ' is-selected' : ''}`}
              role="option"
              data-value="all"
              aria-selected={filter === 'all'}
              onClick={() => {
                onFilterChange('all');
                setOpenMenu(null);
              }}
            >
              <span className="item-label">All Match Levels</span>
              <svg className="item-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
            <button
              type="button"
              className={`custom-dropdown-item${filter === 'high' ? ' is-selected' : ''}`}
              role="option"
              data-value="high"
              aria-selected={filter === 'high'}
              onClick={() => {
                onFilterChange('high');
                setOpenMenu(null);
              }}
            >
              <span className="item-label">High Match (&ge; 80%)</span>
              <svg className="item-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
            <button
              type="button"
              className={`custom-dropdown-item${filter === 'moderate' ? ' is-selected' : ''}`}
              role="option"
              data-value="moderate"
              aria-selected={filter === 'moderate'}
              onClick={() => {
                onFilterChange('moderate');
                setOpenMenu(null);
              }}
            >
              <span className="item-label">Moderate Match (70&ndash;79%)</span>
              <svg className="item-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
            <button
              type="button"
              className={`custom-dropdown-item${filter === 'low' ? ' is-selected' : ''}`}
              role="option"
              data-value="low"
              aria-selected={filter === 'low'}
              onClick={() => {
                onFilterChange('low');
                setOpenMenu(null);
              }}
            >
              <span className="item-label">Divergent Perspectives (&lt; 70%)</span>
              <svg className="item-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className={`custom-dropdown${openMenu === 'sort' ? ' is-open' : ''}`} id="dropdown-sort-wrap">
          <button
            type="button"
            className="custom-dropdown-trigger"
            id="btn-sort-trigger"
            aria-haspopup="listbox"
            aria-expanded={openMenu === 'sort'}
            title="Sort perspectives"
            onClick={() => setOpenMenu(openMenu === 'sort' ? null : 'sort')}
          >
            <svg
              className="dropdown-trigger-icon"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="20" x2="18" y2="4" />
              <polyline points="14 16 18 20 22 16" />
              <line x1="6" y1="4" x2="6" y2="20" />
              <polyline points="10 8 6 4 2 8" />
            </svg>
            <span className="custom-dropdown-label" id="sort-dropdown-label">
              {sort === 'match-asc'
                ? 'Match: Low to High'
                : sort === 'name-asc'
                ? 'Name: A to Z'
                : sort === 'name-desc'
                ? 'Name: Z to A'
                : 'Match: High to Low'}
            </span>
            <svg
              className="dropdown-chevron-icon"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <div className="custom-dropdown-menu" id="menu-sort-options" role="listbox">
            <button
              type="button"
              className={`custom-dropdown-item${sort === 'match-desc' ? ' is-selected' : ''}`}
              role="option"
              data-value="match-desc"
              aria-selected={sort === 'match-desc'}
              onClick={() => {
                onSortChange('match-desc');
                setOpenMenu(null);
              }}
            >
              <span className="item-label">Highest Alignment First</span>
              <svg className="item-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
            <button
              type="button"
              className={`custom-dropdown-item${sort === 'match-asc' ? ' is-selected' : ''}`}
              role="option"
              data-value="match-asc"
              aria-selected={sort === 'match-asc'}
              onClick={() => {
                onSortChange('match-asc');
                setOpenMenu(null);
              }}
            >
              <span className="item-label">Lowest Alignment First</span>
              <svg className="item-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
            <button
              type="button"
              className={`custom-dropdown-item${sort === 'name-asc' ? ' is-selected' : ''}`}
              role="option"
              data-value="name-asc"
              aria-selected={sort === 'name-asc'}
              onClick={() => {
                onSortChange('name-asc');
                setOpenMenu(null);
              }}
            >
              <span className="item-label">Name (A&ndash;Z)</span>
              <svg className="item-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
            <button
              type="button"
              className={`custom-dropdown-item${sort === 'name-desc' ? ' is-selected' : ''}`}
              role="option"
              data-value="name-desc"
              aria-selected={sort === 'name-desc'}
              onClick={() => {
                onSortChange('name-desc');
                setOpenMenu(null);
              }}
            >
              <span className="item-label">Name (Z&ndash;A)</span>
              <svg className="item-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
          </div>
        </div>
        <button
          type="button"
          className="btn-toolbar-refresh"
          id="btn-toolbar-refresh"
          title="Refresh perspectives"
          onClick={onRefresh}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </button>
      </div>
    </div>
  );
}
