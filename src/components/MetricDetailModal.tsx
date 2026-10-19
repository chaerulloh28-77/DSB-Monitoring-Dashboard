import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Ruler, 
  Share2, 
  Box, 
  Building2, 
  MapPin, 
  ExternalLink, 
  HardHat, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  XCircle,
  Layers,
  Sparkles
} from 'lucide-react';
import { DSBProject, KPISummary } from '../types/dsb';
import { VendorBadge } from './VendorBadge';

export type MetricDetailType = 'panjang_galian' | 'total_akses' | 'total_hh';

interface MetricDetailModalProps {
  type: MetricDetailType | null;
  onClose: () => void;
  projects: DSBProject[];
  summary: KPISummary;
  onSelectProject: (project: DSBProject) => void;
}

export const MetricDetailModal: React.FC<MetricDetailModalProps> = ({
  type,
  onClose,
  projects,
  summary,
  onSelectProject
}) => {
  if (!type) return null;

  const formatNum = (num: number) => num.toLocaleString('id-ID');
  const formatKm = (meters: number) => (meters / 1000).toFixed(2) + ' km';

  // 1. Data Processing for Panjang Galian
  const methodStats: { [key: string]: { meters: number; count: number } } = {};
  const segmentStats: { [key: string]: { meters: number; akses: number; hh: number; count: number } } = {};
  const vendorStats: { [key: string]: { meters: number; akses: number; hh: number; count: number } } = {};
  const statusStats: { [key: string]: { meters: number; akses: number; hh: number; count: number } } = {
    'Done': { meters: 0, akses: 0, hh: 0, count: 0 },
    'In Progress': { meters: 0, akses: 0, hh: 0, count: 0 },
    'Not Yet': { meters: 0, akses: 0, hh: 0, count: 0 },
    'Cancel': { meters: 0, akses: 0, hh: 0, count: 0 }
  };

  projects.forEach((p) => {
    // Methods
    const method = p.diggingMethod || 'Boring HDD';
    if (!methodStats[method]) methodStats[method] = { meters: 0, count: 0 };
    methodStats[method].meters += Number(p.panjangGalian) || 0;
    methodStats[method].count += 1;

    // Segments
    const seg = p.segmentRelokasi;
    if (!segmentStats[seg]) segmentStats[seg] = { meters: 0, akses: 0, hh: 0, count: 0 };
    segmentStats[seg].meters += Number(p.panjangGalian) || 0;
    segmentStats[seg].akses += Number(p.totalAkses) || 0;
    segmentStats[seg].hh += Number(p.totalHH) || 0;
    segmentStats[seg].count += 1;

    // Vendors
    const ven = p.vendorName;
    if (!vendorStats[ven]) vendorStats[ven] = { meters: 0, akses: 0, hh: 0, count: 0 };
    vendorStats[ven].meters += Number(p.panjangGalian) || 0;
    vendorStats[ven].akses += Number(p.totalAkses) || 0;
    vendorStats[ven].hh += Number(p.totalHH) || 0;
    vendorStats[ven].count += 1;

    // Status
    if (statusStats[p.status]) {
      statusStats[p.status].meters += Number(p.panjangGalian) || 0;
      statusStats[p.status].akses += Number(p.totalAkses) || 0;
      statusStats[p.status].hh += Number(p.totalHH) || 0;
      statusStats[p.status].count += 1;
    }
  });

  // Top Sorted Lists
  const projectsSortedByGalian = [...projects].sort((a, b) => b.panjangGalian - a.panjangGalian);
  const projectsSortedByAkses = [...projects].sort((a, b) => (b.totalAkses || 0) - (a.totalAkses || 0));
  const projectsSortedByHH = [...projects].sort((a, b) => b.totalHH - a.totalHH);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6 z-10 max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex items-start justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                type === 'panjang_galian'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : type === 'total_akses'
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}>
                {type === 'panjang_galian' && <Ruler className="w-5 h-5" />}
                {type === 'total_akses' && <Share2 className="w-5 h-5" />}
                {type === 'total_hh' && <Box className="w-5 h-5" />}
              </div>

              <div>
                <div className="text-[11px] font-semibold tracking-wider uppercase text-cyan-400">
                  Informasi Akurat & Detail Item Terpilih
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {type === 'panjang_galian' && 'Rincian Akurat: Panjang Galian DSB'}
                  {type === 'total_akses' && 'Rincian Akurat: Total Akses Pelanggan'}
                  {type === 'total_hh' && 'Rincian Akurat: Total Handhole (HH) & Joint Pit'}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
            {/* Top Primary Aggregates Banner */}
            {type === 'panjang_galian' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-0.5">Total Panjang Jalur</span>
                  <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
                    {formatNum(summary.totalPanjangGalian)} <span className="text-sm font-normal text-slate-400">meter</span>
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-0.5">Konversi Rute</span>
                  <div className="text-2xl font-bold text-white font-mono tabular-nums">
                    {formatKm(summary.totalPanjangGalian)}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-0.5">Rata-rata per Proyek</span>
                  <div className="text-2xl font-bold text-cyan-400 font-mono tabular-nums">
                    {summary.totalProjects > 0 ? formatNum(Math.round(summary.totalPanjangGalian / summary.totalProjects)) : 0} <span className="text-sm font-normal text-slate-400">m</span>
                  </div>
                </div>
              </div>
            )}

            {type === 'total_akses' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-blue-950/20 border border-blue-500/30 rounded-xl">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-0.5">Total Titik Akses Drop</span>
                  <div className="text-2xl font-bold text-blue-400 font-mono tabular-nums">
                    {formatNum(summary.totalAkses)} <span className="text-sm font-normal text-slate-400">Akses</span>
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-0.5">Kepadatan Sambungan</span>
                  <div className="text-2xl font-bold text-white font-mono tabular-nums">
                    {summary.totalPanjangGalian > 0 ? (summary.totalAkses / (summary.totalPanjangGalian / 1000)).toFixed(1) : 0} <span className="text-sm font-normal text-slate-400">/ km</span>
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-0.5">Akses Selesai (Done)</span>
                  <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
                    {formatNum(statusStats['Done'].akses)} <span className="text-sm font-normal text-slate-400">Akses</span>
                  </div>
                </div>
              </div>
            )}

            {type === 'total_hh' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-0.5">Total Titik Handhole</span>
                  <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums">
                    {formatNum(summary.totalHH)} <span className="text-sm font-normal text-slate-400">Pit Precast</span>
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-0.5">Jarak Rata-rata antar Pit</span>
                  <div className="text-2xl font-bold text-white font-mono tabular-nums">
                    {summary.totalHH > 0 ? (summary.totalPanjangGalian / summary.totalHH).toFixed(1) : 0} <span className="text-sm font-normal text-slate-400">m / HH</span>
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-0.5">Handhole Terpasang (Done)</span>
                  <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
                    {formatNum(statusStats['Done'].hh)} <span className="text-sm font-normal text-slate-400">Pit</span>
                  </div>
                </div>
              </div>
            )}

            {/* Breakdown per Status Realisasi */}
            <div>
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Distribusi Berdasarkan Status Pekerjaan
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(['Done', 'In Progress', 'Not Yet', 'Cancel'] as const).map((st) => {
                  const data = statusStats[st];
                  const value = 
                    type === 'panjang_galian' ? data.meters :
                    type === 'total_akses' ? data.akses : data.hh;
                  const unit = 
                    type === 'panjang_galian' ? 'm' :
                    type === 'total_akses' ? 'Akses' : 'Pit';
                  const totalVal = 
                    type === 'panjang_galian' ? summary.totalPanjangGalian :
                    type === 'total_akses' ? summary.totalAkses : summary.totalHH;
                  const percent = totalVal > 0 ? Math.round((value / totalVal) * 100) : 0;

                  return (
                    <div key={st} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span className="font-semibold">{st}</span>
                        <span className="text-[10px] font-mono">{data.count} Proyek</span>
                      </div>
                      <div className="text-base font-bold text-white font-mono tabular-nums">
                        {formatNum(value)} <span className="text-xs font-normal text-slate-400">{unit}</span>
                      </div>
                      <div className="text-[10px] text-cyan-400 font-mono mt-0.5">
                        Kontribusi: {percent}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* If PANJANG GALIAN: Breakdown by Digging Method */}
            {type === 'panjang_galian' && (
              <div>
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <HardHat className="w-3.5 h-3.5 text-cyan-400" />
                  Rincian Volume per Metode Galian Fisik
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {Object.entries(methodStats).map(([method, data]) => {
                    const pct = summary.totalPanjangGalian > 0 ? ((data.meters / summary.totalPanjangGalian) * 100).toFixed(1) : '0';
                    return (
                      <div key={method} className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-200">{method}</span>
                          <span className="font-mono text-emerald-400 tabular-nums">
                            {formatNum(data.meters)} m ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Diterapkan pada {data.count} paket pekerjaan
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Breakdown per Segment Relokasi */}
            <div>
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                Rincian Akurat per Segment Relokasi
              </h3>
              <div className="space-y-2">
                {Object.entries(segmentStats).map(([seg, data]) => {
                  const value = 
                    type === 'panjang_galian' ? data.meters :
                    type === 'total_akses' ? data.akses : data.hh;
                  const unit = 
                    type === 'panjang_galian' ? 'm' :
                    type === 'total_akses' ? 'Akses' : 'Pit Handhole';
                  const totalVal = 
                    type === 'panjang_galian' ? summary.totalPanjangGalian :
                    type === 'total_akses' ? summary.totalAkses : summary.totalHH;
                  const pct = totalVal > 0 ? ((value / totalVal) * 100).toFixed(1) : '0';

                  return (
                    <div key={seg} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-200 truncate pr-2">{seg}</span>
                        <span className="font-mono font-bold text-cyan-300 tabular-nums shrink-0">
                          {formatNum(value)} {unit}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>Porsi: {pct}%</span>
                        <span>{data.count} Proyek Relokasi</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Breakdown per Vendor Rekanan */}
            <div>
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                Rincian Kontribusi per Vendor Rekanan
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.entries(vendorStats).map(([ven, data]) => {
                  const value = 
                    type === 'panjang_galian' ? data.meters :
                    type === 'total_akses' ? data.akses : data.hh;
                  const unit = 
                    type === 'panjang_galian' ? 'm' :
                    type === 'total_akses' ? 'Akses' : 'Pit';

                  return (
                    <div key={ven} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <span className="font-medium text-white block truncate">{ven}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{data.count} Proyek ditangani</span>
                      </div>
                      <div className="font-mono font-bold text-white tabular-nums text-right shrink-0">
                        {formatNum(value)} <span className="text-[10px] font-normal text-slate-400">{unit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ranked Projects Contributing to this Metric */}
            <div>
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                <span>Daftar Proyek Terkait (Urutan Tertinggi)</span>
                <span className="text-[10px] text-slate-400 font-normal">Klik untuk buka rincian</span>
              </h3>

              <div className="space-y-2">
                {(type === 'panjang_galian' 
                  ? projectsSortedByGalian 
                  : type === 'total_akses' 
                  ? projectsSortedByAkses 
                  : projectsSortedByHH
                ).map((project, idx) => {
                  const val = 
                    type === 'panjang_galian' ? project.panjangGalian :
                    type === 'total_akses' ? project.totalAkses : project.totalHH;
                  const unit = 
                    type === 'panjang_galian' ? 'm' :
                    type === 'total_akses' ? 'Akses' : 'Pit';

                  return (
                    <div
                      key={project.id}
                      onClick={() => {
                        onClose();
                        onSelectProject(project);
                      }}
                      className="p-3 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-400 font-mono text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-mono text-[10px] text-cyan-400 font-semibold">
                              {project.projectCode}
                            </span>
                            <VendorBadge vendorName={project.vendorName} size="xs" />
                          </div>
                          <h4 className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors truncate">
                            {project.projectName}
                          </h4>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {project.segmentRelokasi}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right font-mono">
                          <div className={`text-sm font-bold tabular-nums ${
                            type === 'panjang_galian' ? 'text-emerald-400' :
                            type === 'total_akses' ? 'text-blue-400' : 'text-amber-400'
                          }`}>
                            {formatNum(val || 0)} {unit}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            Progres: {project.progressPercent}%
                          </span>
                        </div>

                        <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-end shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              Tutup Rincian
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
