import React, { useMemo } from 'react';
import { 
  FolderKanban, 
  Download, 
  Plus, 
  RotateCcw, 
  Ruler, 
  Cable, 
  Share2, 
  Box, 
  FileCheck, 
  Clock, 
  TrendingUp, 
  XCircle,
  Building2,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { DSBProject, KPISummary, FilterState } from '../types/dsb';
import { FilterBar } from './FilterBar';
import { ProjectCard } from './ProjectCard';
import { ProjectTable } from './ProjectTable';

interface ProjectListViewProps {
  projects: DSBProject[];
  summary: KPISummary;
  filters: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  onResetFilters: () => void;
  vendorList: string[];
  segmentList: string[];
  viewMode: 'grid' | 'table';
  onChangeViewMode: (mode: 'grid' | 'table') => void;
  onOpenCreateModal: () => void;
  activeFilterCount: number;
  onSelectProject: (project: DSBProject) => void;
  onEditProject: (project: DSBProject) => void;
  onDeleteProject: (project: DSBProject) => void;
}

export const ProjectListView: React.FC<ProjectListViewProps> = ({
  projects,
  summary,
  filters,
  onFilterChange,
  onResetFilters,
  vendorList,
  segmentList,
  viewMode,
  onChangeViewMode,
  onOpenCreateModal,
  activeFilterCount,
  onSelectProject,
  onEditProject,
  onDeleteProject
}) => {
  // Filter and sort projects based on active filter state
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // 1. Keyword search (Name, Code, Vendor, Segment, PIC Govrel, PIC DSB)
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const matchName = (project.projectName || '').toLowerCase().includes(q);
        const matchCode = (project.projectCode || '').toLowerCase().includes(q);
        const matchVendor = (project.vendorName || '').toLowerCase().includes(q);
        const matchSeg = (project.segmentRelokasi || '').toLowerCase().includes(q);
        const matchGovrel = (project.picGovrel || '').toLowerCase().includes(q);
        const matchDsb = (project.picDsb || '').toLowerCase().includes(q);
        const matchPicLegacy = (project.picName || '').toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchVendor && !matchSeg && !matchGovrel && !matchDsb && !matchPicLegacy) {
          return false;
        }
      }

      // 2. Vendor filter
      if (filters.vendor !== 'ALL' && project.vendorName !== filters.vendor) {
        return false;
      }

      // 3. Segment Relokasi filter
      if (filters.segment !== 'ALL' && project.segmentRelokasi !== filters.segment) {
        return false;
      }

      // 4. PIC Govrel filter
      if (filters.picGovrel && filters.picGovrel !== 'ALL' && project.picGovrel !== filters.picGovrel) {
        return false;
      }

      // 5. PIC DSB filter
      if (filters.picDsb && filters.picDsb !== 'ALL' && project.picDsb !== filters.picDsb) {
        return false;
      }

      // 6. Status Project filter
      if (filters.status !== 'ALL' && project.status !== filters.status) {
        return false;
      }

      // 7. Status PO filter
      if (filters.poStatus !== 'ALL') {
        const normPO = (project.poStatus === 'Release' || (project.poStatus as string) === 'Released') ? 'Release' 
          : (project.poStatus === 'Cancel' || (project.poStatus as string) === 'Revisi PO') ? 'Cancel' 
          : 'Not Yet';
        if (normPO !== filters.poStatus) return false;
      }

      return true;
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case 'terlama':
          return (a.createdAt || '').localeCompare(b.createdAt || '');
        case 'galian_desc':
          return (Number(b.panjangGalian) || 0) - (Number(a.panjangGalian) || 0);
        case 'galian_asc':
          return (Number(a.panjangGalian) || 0) - (Number(b.panjangGalian) || 0);
        case 'kabel_desc':
          return (Number(b.panjangKabelFo) || 0) - (Number(a.panjangKabelFo) || 0);
        case 'akses_desc':
          return (Number(b.aksesMeter) || 0) - (Number(a.aksesMeter) || 0);
        case 'hh_desc':
          return (Number(b.totalHH) || 0) - (Number(a.totalHH) || 0);
        case 'progress_desc':
          return (Number(b.progressPercent) || 0) - (Number(a.progressPercent) || 0);
        case 'terbaru':
        default:
          return (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || '');
      }
    });
  }, [projects, filters]);

  // Aggregate stats for filtered view
  const aggregatedStats = useMemo(() => {
    let galian = 0;
    let kabel = 0;
    let akses = 0;
    let hh = 0;
    filteredProjects.forEach((p) => {
      galian += Number(p.panjangGalian) || 0;
      kabel += Number(p.panjangKabelFo) || 0;
      akses += Number(p.aksesMeter) || 0;
      hh += Number(p.totalHH) || 0;
    });
    return { galian, kabel, akses, hh };
  }, [filteredProjects]);

  // Export CSV handler
  const handleExportCSV = () => {
    const headers = [
      'No',
      'Kode Project',
      'Nama Vendor',
      'Segment Relokasi',
      'PIC Govrel',
      'PIC DSB',
      'Tanggal Start',
      'Tanggal End',
      'Panjang Galian (m)',
      'Panjang Kabel FO (m)',
      'Akses (m)',
      'Instal HH (Unit)',
      'Instal HS (Unit)',
      'Instal HG (Unit)',
      'Instal HM (Unit)',
      'Total HH (Unit)',
      'Status Project',
      'Status PO',
      'Progres Fisik (%)',
      'Catatan'
    ];

    const rows = filteredProjects.map((p, idx) => [
      idx + 1,
      `"${p.projectCode}"`,
      `"${p.vendorName}"`,
      `"${p.segmentRelokasi.replace(/"/g, '""')}"`,
      `"${p.picGovrel || ''}"`,
      `"${p.picDsb || ''}"`,
      `"${p.startDate || ''}"`,
      `"${p.targetEndDate || ''}"`,
      p.panjangGalian || 0,
      p.panjangKabelFo || 0,
      p.aksesMeter || 0,
      p.instalHH || 0,
      p.instalHS || 0,
      p.instalHG || 0,
      p.instalHM || 0,
      p.totalHH || 0,
      `"${p.status}"`,
      `"${p.poStatus}"`,
      `${p.progressPercent}%`,
      `"${(p.catatan || '').replace(/"/g, '""')}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Project_List_DSB_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Page Title & Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Project List
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Daftar Paket Pekerjaan Utilitas Bawah Tanah & Manajemen Operasional CRUD
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Download seluruh data proyek dalam format CSV"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-cyan-950 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Input Data Proyek</span>
          </button>
        </div>
      </div>

      {/* Filter Bar with Full Parameters */}
      <FilterBar
        filters={filters}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
        vendorList={vendorList}
        segmentList={segmentList}
        viewMode={viewMode}
        onChangeViewMode={onChangeViewMode}
        onOpenCreateModal={onOpenCreateModal}
        activeFilterCount={activeFilterCount}
      />

      {/* Active Filters Pill Bar (if any active) */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            Filter Aktif:
          </span>

          {filters.search && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700 text-[11px]">
              Pencarian: "{filters.search}"
              <button onClick={() => onFilterChange({ search: '' })} className="hover:text-white font-bold ml-1">✕</button>
            </span>
          )}

          {filters.vendor !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-blue-300 border border-slate-700 text-[11px]">
              Vendor: {filters.vendor}
              <button onClick={() => onFilterChange({ vendor: 'ALL' })} className="hover:text-white font-bold ml-1">✕</button>
            </span>
          )}

          {filters.segment !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-purple-300 border border-slate-700 text-[11px]">
              Segmen: {filters.segment}
              <button onClick={() => onFilterChange({ segment: 'ALL' })} className="hover:text-white font-bold ml-1">✕</button>
            </span>
          )}

          {filters.picGovrel && filters.picGovrel !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-teal-300 border border-slate-700 text-[11px]">
              Govrel: {filters.picGovrel}
              <button onClick={() => onFilterChange({ picGovrel: 'ALL' })} className="hover:text-white font-bold ml-1">✕</button>
            </span>
          )}

          {filters.picDsb && filters.picDsb !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700 text-[11px]">
              DSB: {filters.picDsb}
              <button onClick={() => onFilterChange({ picDsb: 'ALL' })} className="hover:text-white font-bold ml-1">✕</button>
            </span>
          )}

          {filters.status !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-emerald-300 border border-slate-700 text-[11px]">
              Status: {filters.status}
              <button onClick={() => onFilterChange({ status: 'ALL' })} className="hover:text-white font-bold ml-1">✕</button>
            </span>
          )}

          {filters.poStatus !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700 text-[11px]">
              PO: {filters.poStatus}
              <button onClick={() => onFilterChange({ poStatus: 'ALL' })} className="hover:text-white font-bold ml-1">✕</button>
            </span>
          )}

          <button
            onClick={onResetFilters}
            className="text-[11px] text-slate-400 hover:text-white underline ml-auto"
          >
            Hapus Semua Filter
          </button>
        </div>
      )}

      {/* Aggregate Volume Banner of Filtered Results */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Count */}
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-center">
          <span className="text-[10px] text-slate-400 font-medium">Paket Proyek</span>
          <div className="text-base sm:text-lg font-bold text-white font-mono mt-0.5">
            {filteredProjects.length}{' '}
            <span className="text-xs font-normal text-slate-500">/ {projects.length} Total</span>
          </div>
        </div>

        {/* Galian */}
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-center">
          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
            <Ruler className="w-3 h-3 text-emerald-400" /> Total Galian
          </span>
          <div className="text-base sm:text-lg font-bold text-emerald-400 font-mono mt-0.5">
            {aggregatedStats.galian.toLocaleString('id-ID')}{' '}
            <span className="text-xs font-normal text-emerald-600">m</span>
          </div>
        </div>

        {/* Kabel FO */}
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-center">
          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
            <Cable className="w-3 h-3 text-cyan-400" /> Kabel FO
          </span>
          <div className="text-base sm:text-lg font-bold text-cyan-400 font-mono mt-0.5">
            {aggregatedStats.kabel.toLocaleString('id-ID')}{' '}
            <span className="text-xs font-normal text-cyan-600">m</span>
          </div>
        </div>

        {/* Akses */}
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-center">
          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
            <Share2 className="w-3 h-3 text-blue-400" /> Akses Pelanggan
          </span>
          <div className="text-base sm:text-lg font-bold text-blue-400 font-mono mt-0.5">
            {aggregatedStats.akses.toLocaleString('id-ID')}{' '}
            <span className="text-xs font-normal text-blue-600">m</span>
          </div>
        </div>

        {/* Instal HH */}
        <div className="col-span-2 sm:col-span-1 p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-center">
          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
            <Box className="w-3 h-3 text-amber-400" /> Total Handhole
          </span>
          <div className="text-base sm:text-lg font-bold text-amber-400 font-mono mt-0.5">
            {aggregatedStats.hh}{' '}
            <span className="text-xs font-normal text-amber-600">Unit</span>
          </div>
        </div>
      </div>

      {/* Main Content: Table or Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <FolderKanban className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-white">Tidak ada data proyek yang cocok</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Kombinasi kata kunci pencarian atau filter yang dipilih tidak menemukan proyek apapun.
          </p>
          <div className="pt-2 flex items-center justify-center gap-2">
            <button
              onClick={onResetFilters}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
            >
              Reset Semua Filter
            </button>
            <button
              onClick={onOpenCreateModal}
              className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-medium text-white transition-colors"
            >
              Input Data Proyek Baru
            </button>
          </div>
        </div>
      ) : viewMode === 'table' ? (
        <ProjectTable
          projects={filteredProjects}
          onSelectProject={onSelectProject}
          onEditProject={onEditProject}
          onDeleteProject={onDeleteProject}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelectProject={onSelectProject}
              onEditProject={onEditProject}
              onDeleteProject={onDeleteProject}
            />
          ))}
        </div>
      )}
    </div>
  );
};
