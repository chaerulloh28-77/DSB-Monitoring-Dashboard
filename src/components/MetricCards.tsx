import React from 'react';
import { 
  FolderKanban, 
  Ruler, 
  Share2, 
  Box, 
  Clock, 
  TrendingUp, 
  XCircle, 
  CheckCircle2, 
  FileCheck,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { KPISummary } from '../types/dsb';

interface MetricCardsProps {
  summary: KPISummary;
  activeStatusFilter: string;
  activePOFilter: string;
  onFilterByStatus: (status: string) => void;
  onFilterByPO: (poStatus: string) => void;
  onOpenMetricDetail: (type: 'panjang_galian' | 'total_akses' | 'total_hh') => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  summary,
  activeStatusFilter,
  activePOFilter,
  onFilterByStatus,
  onFilterByPO,
  onOpenMetricDetail
}) => {
  const formatNum = (num: number) => num.toLocaleString('id-ID');
  const formatKm = (meters: number) => (meters / 1000).toFixed(2) + ' km';

  return (
    <div className="space-y-3.5">
      {/* 1. Baris Utama: 4 Kartu Metrik Infrastruktur DSB */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Project */}
        <button
          onClick={() => {
            onFilterByStatus('ALL');
            onFilterByPO('ALL');
          }}
          className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group cursor-pointer flex flex-col justify-between ${
            activeStatusFilter === 'ALL' && activePOFilter === 'ALL'
              ? 'bg-slate-900 border-cyan-500 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-500/30'
              : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
          }`}
          title="Klik langsung untuk menampilkan seluruh paket pekerjaan"
        >
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Total Project</span>
              <FolderKanban className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono tabular-nums">
              {formatNum(summary.totalProjects)}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-cyan-400 font-medium">
            <span>Filter Semua Proyek</span>
            <span className="group-hover:translate-x-0.5 transition-transform">Klik Disini →</span>
          </div>
        </button>

        {/* Panjang Galian */}
        <button
          onClick={() => onOpenMetricDetail('panjang_galian')}
          className="p-4 rounded-xl border border-slate-800 bg-slate-900/90 hover:border-emerald-500 hover:bg-slate-900 text-left transition-all relative overflow-hidden group cursor-pointer shadow-sm flex flex-col justify-between"
          title="Klik untuk membuka rincian akurat panjang galian, metode, dan segmen"
        >
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Panjang Galian</span>
              <Ruler className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-400 font-mono tabular-nums">
              {formatNum(summary.totalPanjangGalian)} <span className="text-xs font-normal text-slate-400">m</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-emerald-400 font-medium font-mono">
            <span>Rute: {formatKm(summary.totalPanjangGalian)}</span>
            <span className="group-hover:translate-x-0.5 transition-transform">Rincian Akurat →</span>
          </div>
        </button>

        {/* Total Akses */}
        <button
          onClick={() => onOpenMetricDetail('total_akses')}
          className="p-4 rounded-xl border border-slate-800 bg-slate-900/90 hover:border-blue-500 hover:bg-slate-900 text-left transition-all relative overflow-hidden group cursor-pointer shadow-sm flex flex-col justify-between"
          title="Klik untuk melihat rincian akurat akumulasi titik sambung akses drop pelanggan"
        >
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Total Akses</span>
              <Share2 className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-blue-400 font-mono tabular-nums">
              {formatNum(summary.totalAkses)} <span className="text-xs font-normal text-slate-400">Titik</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-blue-400 font-medium font-mono">
            <span>Koneksi Pelanggan</span>
            <span className="group-hover:translate-x-0.5 transition-transform">Rincian Akurat →</span>
          </div>
        </button>

        {/* Total Handhole (HH) */}
        <button
          onClick={() => onOpenMetricDetail('total_hh')}
          className="p-4 rounded-xl border border-slate-800 bg-slate-900/90 hover:border-amber-500 hover:bg-slate-900 text-left transition-all relative overflow-hidden group cursor-pointer shadow-sm flex flex-col justify-between"
          title="Klik untuk melihat rincian akurat titik pit tarik & sambung precast"
        >
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Total HH (Handhole)</span>
              <Box className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-amber-400 font-mono tabular-nums">
              {formatNum(summary.totalHH)} <span className="text-xs font-normal text-slate-400">Pit</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-amber-400 font-medium font-mono">
            <span>Precast Joint Pit</span>
            <span className="group-hover:translate-x-0.5 transition-transform">Rincian Akurat →</span>
          </div>
        </button>
      </div>

      {/* 2. Baris Status Proyek & PO Release (5 Kartu Dapat Diklik Langsung untuk Filter Instan) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {/* Not Yet */}
        <button
          onClick={() => onFilterByStatus(activeStatusFilter === 'Not Yet' ? 'ALL' : 'Not Yet')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeStatusFilter === 'Not Yet'
              ? 'bg-slate-800 border-slate-300 ring-2 ring-slate-400/40 shadow-md'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
          title="Klik langsung untuk memfilter proyek Not Yet"
        >
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Not Yet
              </span>
              <span className="text-lg font-bold text-slate-200 font-mono tabular-nums">
                {summary.notYetCount}
              </span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>{summary.totalProjects > 0 ? Math.round((summary.notYetCount / summary.totalProjects) * 100) : 0}% Porsi</span>
            <span className={activeStatusFilter === 'Not Yet' ? 'text-cyan-400 font-semibold' : ''}>
              {activeStatusFilter === 'Not Yet' ? 'Aktif ✓' : 'Filter →'}
            </span>
          </div>
        </button>

        {/* In Progress */}
        <button
          onClick={() => onFilterByStatus(activeStatusFilter === 'In Progress' ? 'ALL' : 'In Progress')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeStatusFilter === 'In Progress'
              ? 'bg-blue-950/60 border-blue-400 ring-2 ring-blue-500/40 shadow-md'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
          title="Klik langsung untuk memfilter proyek In Progress"
        >
          <div>
            <div className="flex items-center justify-between text-blue-400 mb-1">
              <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                In Progress
              </span>
              <span className="text-lg font-bold text-blue-300 font-mono tabular-nums">
                {summary.inProgressCount}
              </span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-blue-400 font-mono">
            <span>{summary.totalProjects > 0 ? Math.round((summary.inProgressCount / summary.totalProjects) * 100) : 0}% Porsi</span>
            <span className={activeStatusFilter === 'In Progress' ? 'font-semibold' : ''}>
              {activeStatusFilter === 'In Progress' ? 'Aktif ✓' : 'Filter →'}
            </span>
          </div>
        </button>

        {/* Cancel */}
        <button
          onClick={() => onFilterByStatus(activeStatusFilter === 'Cancel' ? 'ALL' : 'Cancel')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeStatusFilter === 'Cancel'
              ? 'bg-rose-950/60 border-rose-400 ring-2 ring-rose-500/40 shadow-md'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
          title="Klik langsung untuk memfilter proyek Cancel"
        >
          <div>
            <div className="flex items-center justify-between text-rose-400 mb-1">
              <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                Cancel
              </span>
              <span className="text-lg font-bold text-rose-300 font-mono tabular-nums">
                {summary.cancelCount}
              </span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-rose-400 font-mono">
            <span>{summary.totalProjects > 0 ? Math.round((summary.cancelCount / summary.totalProjects) * 100) : 0}% Porsi</span>
            <span className={activeStatusFilter === 'Cancel' ? 'font-semibold' : ''}>
              {activeStatusFilter === 'Cancel' ? 'Aktif ✓' : 'Filter →'}
            </span>
          </div>
        </button>

        {/* Done */}
        <button
          onClick={() => onFilterByStatus(activeStatusFilter === 'Done' ? 'ALL' : 'Done')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeStatusFilter === 'Done'
              ? 'bg-emerald-950/60 border-emerald-400 ring-2 ring-emerald-500/40 shadow-md'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
          title="Klik langsung untuk memfilter proyek Done"
        >
          <div>
            <div className="flex items-center justify-between text-emerald-400 mb-1">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Done
              </span>
              <span className="text-lg font-bold text-emerald-300 font-mono tabular-nums">
                {summary.doneCount}
              </span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-emerald-400 font-mono">
            <span>{summary.totalProjects > 0 ? Math.round((summary.doneCount / summary.totalProjects) * 100) : 0}% Porsi</span>
            <span className={activeStatusFilter === 'Done' ? 'font-semibold' : ''}>
              {activeStatusFilter === 'Done' ? 'Aktif ✓' : 'Filter →'}
            </span>
          </div>
        </button>

        {/* PO Release */}
        <button
          onClick={() => onFilterByPO(activePOFilter === 'Release' ? 'ALL' : 'Release')}
          className={`col-span-2 sm:col-span-1 p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activePOFilter === 'Release' || activePOFilter === 'Released'
              ? 'bg-cyan-950/60 border-cyan-400 ring-2 ring-cyan-500/40 shadow-md'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
          title="Klik langsung untuk memfilter proyek dengan PO Release"
        >
          <div>
            <div className="flex items-center justify-between text-cyan-400 mb-1">
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
                PO Release
              </span>
              <span className="text-lg font-bold text-cyan-300 font-mono tabular-nums">
                {summary.poReleaseCount}
              </span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-cyan-400 font-mono">
            <span>{summary.totalProjects > 0 ? Math.round((summary.poReleaseCount / summary.totalProjects) * 100) : 0}% Terbit</span>
            <span className={activePOFilter === 'Release' || activePOFilter === 'Released' ? 'font-semibold' : ''}>
              {activePOFilter === 'Release' || activePOFilter === 'Released' ? 'Aktif ✓' : 'Filter →'}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
