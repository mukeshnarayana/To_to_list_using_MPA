import React, { useState, useEffect } from 'react';
import { Search, ArrowUpDown, Filter, RotateCcw } from 'lucide-react';

export default function Filters({ filters, onFilterChange, onReset }) {
  // Local state for debounced search input
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  // Debounce search input by 400ms
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== filters.search) {
        onFilterChange('search', searchTerm);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm, filters.search, onFilterChange]);

  const hasActiveFilters =
    Boolean(filters.search) ||
    Boolean(filters.status) ||
    Boolean(filters.priority) ||
    filters.sortBy !== 'createdAt' ||
    filters.order !== 'desc';

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 p-4 mb-6 space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Search tasks by title or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Filter and Sort controls */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        {/* Status */}
        <div>
          <label htmlFor="filter-status" className="sr-only">Status</label>
          <select
            id="filter-status"
            value={filters.status || ''}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">⏳ Pending</option>
            <option value="in-progress">🔄 In Progress</option>
            <option value="completed">✅ Completed</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="filter-priority" className="sr-only">Priority</label>
          <select
            id="filter-priority"
            value={filters.priority || ''}
            onChange={(e) => onFilterChange('priority', e.target.value)}
            className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Priorities</option>
            <option value="low">🟢 Low</option>
            <option value="medium">🟡 Medium</option>
            <option value="high">🔴 High</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label htmlFor="filter-sortby" className="sr-only">Sort By</label>
          <select
            id="filter-sortby"
            value={filters.sortBy || 'createdAt'}
            onChange={(e) => onFilterChange('sortBy', e.target.value)}
            className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="createdAt">Date Created</option>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>

        {/* Order toggle + Reset */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onFilterChange('order', filters.order === 'asc' ? 'desc' : 'asc')}
            title={`Sort order: ${filters.order === 'asc' ? 'Ascending' : 'Descending'}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{filters.order === 'asc' ? 'Asc' : 'Desc'}</span>
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                onReset();
              }}
              title="Reset all filters"
              aria-label="Reset all filters"
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent rounded-xl transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
