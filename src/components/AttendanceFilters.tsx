'use client';

import { useState } from 'react';
import { FilterOptions } from '@/types/attendance';
import { getSessionLabel } from '@/utils/attendance';
import { Filter, X, Clock, Building, CheckCircle, Calendar } from 'lucide-react';

interface AttendanceFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableBranches: string[];
  availableSessions: string[];
  availableDays: number[];
}

const AttendanceFilters = ({ 
  filters, 
  onFiltersChange, 
  availableBranches,
  availableSessions,
  availableDays
}: AttendanceFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof FilterOptions, value: string | boolean | number | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value === '' ? undefined : value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({ showScannedOnly: false });
  };

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => key !== 'showScannedOnly' && value !== undefined && value !== ''
  ) || filters.showScannedOnly === true;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Filters</h3>
        </div>
        <div className="flex items-center space-x-3">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-2 px-4 py-2 text-sm bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <X className="h-4 w-4" />
              <span>Clear All</span>
            </button>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-4 py-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            {isOpen ? 'Hide' : 'Show'} Filters
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <CheckCircle className="h-4 w-4" />
              <span>Scan Status</span>
            </label>
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.showScannedOnly === true}
                  onChange={(e) => updateFilter('showScannedOnly', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Show only scanned records</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Building className="h-4 w-4" />
                <span>Branch</span>
              </label>
              <select
                value={filters.branch || ''}
                onChange={(e) => updateFilter('branch', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Branches</option>
                {availableBranches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Clock className="h-4 w-4" />
                <span>Session</span>
              </label>
              <select
                value={filters.session || ''}
                onChange={(e) => updateFilter('session', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Sessions</option>
                {availableSessions.map((session) => (
                  <option key={session} value={session}>
                    {getSessionLabel(session)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Calendar className="h-4 w-4" />
                <span>Day</span>
              </label>
              <select
                value={filters.day?.toString() || ''}
                onChange={(e) => updateFilter('day', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Days</option>
                {availableDays.map((day) => (
                  <option key={day} value={day}>
                    Day {day}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {hasActiveFilters && (
        <div className="mt-6 flex flex-wrap gap-2">
          {filters.branch && (
            <span className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
              <Building className="h-3 w-3 mr-1" />
              Branch: {filters.branch}
              <button
                onClick={() => updateFilter('branch', undefined)}
                className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
              >
                ×
              </button>
            </span>
          )}
          {filters.session && (
            <span className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm">
              <Clock className="h-3 w-3 mr-1" />
              Session: {getSessionLabel(filters.session)}
              <button
                onClick={() => updateFilter('session', undefined)}
                className="ml-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
              >
                ×
              </button>
            </span>
          )}
          {filters.day && (
            <span className="inline-flex items-center px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm">
              <Calendar className="h-3 w-3 mr-1" />
              Day: {filters.day}
              <button
                onClick={() => updateFilter('day', undefined)}
                className="ml-2 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
              >
                ×
              </button>
            </span>
          )}
          {filters.showScannedOnly === false && (
            <span className="inline-flex items-center px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-full text-sm">
              <CheckCircle className="h-3 w-3 mr-1" />
              Including unscanned
              <button
                onClick={() => updateFilter('showScannedOnly', true)}
                className="ml-2 text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceFilters;
