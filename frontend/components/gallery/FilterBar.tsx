"use client";

import { Search, Calendar, Trash2, Download, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface FilterState {
  search: string;
  dateFrom: string;
  dateTo: string;
  type: string;
  status: string;
}

export interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  selectedCount: number;
  onSelectAll: () => void;
  onDeleteSelected: () => void;
  onDownloadSelected: () => void;
}

export default function FilterBar({
  filters,
  onFilterChange,
  selectedCount,
  onSelectAll,
  onDeleteSelected,
  onDownloadSelected,
}: FilterBarProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      search: e.target.value,
    });
  };

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      dateFrom: e.target.value,
    });
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      dateTo: e.target.value,
    });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      type: e.target.value,
    });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      status: e.target.value,
    });
  };

  const clearFilters = () => {
    onFilterChange({
      search: "",
      dateFrom: "",
      dateTo: "",
      type: "",
      status: "",
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.type ||
    filters.status;

  return (
    <Card className="bg-gray-900/60 border-gray-800 p-4">
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by prompt text..."
                value={filters.search}
                onChange={handleSearchChange}
                className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={handleDateFromChange}
                className="w-36 bg-gray-800 border-gray-700 text-white"
              />
              <span className="text-gray-400">to</span>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={handleDateToChange}
                className="w-36 bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <select
              value={filters.type}
              onChange={handleTypeChange}
              className="rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white"
            >
              <option value="">All Types</option>
              <option value="favorites">Favorites</option>
              <option value="generated">Generated</option>
              <option value="edited">Edited</option>
            </select>

            <select
              value={filters.status}
              onChange={handleStatusChange}
              className="rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 rounded-md bg-gray-800 px-3 py-2 text-gray-200 hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-800 pt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={onSelectAll}
              className="rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 transition-colors"
            >
              Select All on Page
            </button>
            <span className="text-sm text-gray-400">
              {selectedCount > 0 ? `${selectedCount} selected` : "No images selected"}
            </span>
          </div>

          {selectedCount > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={onDownloadSelected}
                className="flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                Download Selected ({selectedCount})
              </button>
              <button
                onClick={onDeleteSelected}
                className="flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected ({selectedCount})
              </button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
