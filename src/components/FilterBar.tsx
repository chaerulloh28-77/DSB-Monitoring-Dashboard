import React from 'react';
import { Search, Filter, X, Plus, RotateCcw, LayoutGrid, List } from 'lucide-react';
import { FilterState, ProjectStatus, POStatus } from '../types/dsb';
import { PIC_GOVREL_OPTIONS, PIC_DSB_OPTIONS } from '../data/initialData';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  onResetFilters: () => void;
  vendorList: string[];
  segmentList: string[];
  viewMode: 'grid' | 'table';
  onChangeViewMode: (mode: 'grid' | 'table') => void;
  onOpenCreateModal: () => void;
  activeFilterCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  vendorList,
  segmentList,
  viewMode,
  onChangeViewMode,
  onOpenCreateModal,
  activeFilterCount
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-3">
      {/* Top Row: Search Input + Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Search Field */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Cari vendor, segment, PIC Govrel, PIC DSB, kode, atau rute..."
            className="w-full pl-9 pr-8 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: '' })}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View Toggle + New Project Button */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Grid / Table Toggle */}
          <div className="inline-flex rounded-lg border border-slate-800 p-0.5 bg-slate-950">
            <button
              onClick={() => onChangeViewMode('table')}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-slate-800 text-cyan-400 font-medium shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Tampilan Tabel Rinci (12 Kolom Lengkap)"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => onChangeViewMode('grid')}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-slate-800 text-cyan-400 font-medium shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Tampilan Grid Card"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Reset Filters (if any active) */}
          {activeFilterCount > 0 && (
            <button
              onClick={onResetFilters}
              className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 border border-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Reset semua filter"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset ({activeFilterCount})</span>
            </button>
          )}

          {/* Input Data Proyek Button (CRUD Create) */}
          <button
            onClick={onOpenCreateModal}
            className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-medium rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-sm shadow-cyan-900/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Input Data Proyek</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Granular Filters (Vendor, Segment, PIC Govrel, PIC DSB, Status, PO Status, Sort) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 pt-1 border-t border-slate-800/80">
        {/* Vendor Filter */}
        <div>
          <label className="block text-[10px] text-slate-400 mb-1 font-medium">
            Nama Vendor
          </label>
          <select
            value={filters.vendor}
            onChange={(e) => onFilterChange({ vendor: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">Semua Vendor</option>
            {vendorList.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        {/* Segment Relokasi Filter */}
        <div>
          <label className="block text-[10px] text-slate-400 mb-1 font-medium">
            Segment Relokasi
          </label>
          <select
            value={filters.segment}
            onChange={(e) => onFilterChange({ segment: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500 truncate"
          >
            <option value="ALL">Semua Segmen</option>
            {segmentList.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* PIC Govrel Filter */}
        <div>
          <label className="block text-[10px] text-slate-400 mb-1 font-medium">
            PIC Govrel
          </label>
          <select
            value={filters.picGovrel || 'ALL'}
            onChange={(e) => onFilterChange({ picGovrel: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500 truncate font-medium"
          >
            <option value="ALL">Semua PIC Govrel</option>
            {PIC_GOVREL_OPTIONS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* PIC DSB Filter */}
        <div>
          <label className="block text-[10px] text-slate-400 mb-1 font-medium">
            PIC DSB
          </label>
          <select
            value={filters.picDsb || 'ALL'}
            onChange={(e) => onFilterChange({ picDsb: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500 truncate font-medium"
          >
            <option value="ALL">Semua PIC DSB</option>
            {PIC_DSB_OPTIONS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Project Filter (Not Yet, In Progress, Cancel, Done) */}
        <div>
          <label className="block text-[10px] text-slate-400 mb-1 font-medium">
            Status Project
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="Not Yet">Not Yet</option>
            <option value="In Progress">In Progress</option>
            <option value="Cancel">Cancel</option>
            <option value="Done">Done</option>
          </select>
        </div>

        {/* Status PO Filter (Not Yet, Release, Cancel) */}
        <div>
          <label className="block text-[10px] text-slate-400 mb-1 font-medium">
            Status PO
          </label>
          <select
            value={filters.poStatus}
            onChange={(e) => onFilterChange({ poStatus: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">Semua Status PO</option>
            <option value="Not Yet">Not Yet</option>
            <option value="Release">Release</option>
            <option value="Cancel">Cancel</option>
          </select>
        </div>

        {/* Sorting Dropdown */}
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-[10px] text-slate-400 mb-1 font-medium">
            Urutkan
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as FilterState['sortBy'] })}
            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="terbaru">Terbaru Diperbarui</option>
            <option value="terlama">Terlama</option>
            <option value="galian_desc">Galian Terpanjang (m)</option>
            <option value="galian_asc">Galian Terpendek (m)</option>
            <option value="kabel_desc">Kabel FO Terpanjang (m)</option>
            <option value="akses_desc">Akses Terpanjang (m)</option>
            <option value="hh_desc">Instal HH Terbanyak (Unit)</option>
            <option value="progress_desc">Progres Tertinggi (%)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
