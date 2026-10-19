import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Building2, 
  MapPin, 
  Calendar, 
  Phone, 
  User, 
  Ruler, 
  Cable, 
  Share2, 
  Box, 
  HardHat, 
  FileCheck, 
  FileText, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  XCircle, 
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { DSBProject, ProjectStatus, POStatus } from '../types/dsb';
import { VendorBadge } from './VendorBadge';

interface ProjectDetailModalProps {
  project: DSBProject | null;
  onClose: () => void;
  onEdit: (project: DSBProject) => void;
  onDelete: (project: DSBProject) => void;
  onQuickChangeStatus: (projectId: string, newStatus: ProjectStatus) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  onClose,
  onEdit,
  onDelete,
  onQuickChangeStatus
}) => {
  if (!project) return null;

  const formatKm = (meters: number) => (meters / 1000).toFixed(2) + ' km';

  const totalHHCount = project.totalHH || (
    Number(project.instalHH || 0) +
    Number(project.instalHS || 0) +
    Number(project.instalHG || 0) +
    Number(project.instalHM || 0)
  );

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
          {/* Header Banner */}
          <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex items-start justify-between gap-4 shrink-0">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/80">
                  {project.projectCode}
                </span>
                <VendorBadge vendorName={project.vendorName} size="xs" />
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 ${
                  project.status === 'Done'
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80'
                    : project.status === 'In Progress'
                    ? 'bg-blue-950/80 text-blue-400 border border-blue-800/80'
                    : project.status === 'Cancel'
                    ? 'bg-rose-950/80 text-rose-400 border border-rose-800/80'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}>
                  {project.status}
                </span>
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded flex items-center gap-1 ${
                  project.poStatus === 'Release' || (project.poStatus as string) === 'Released'
                    ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/60'
                    : project.poStatus === 'Cancel' || (project.poStatus as string) === 'Revisi PO'
                    ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                    : 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                }`}>
                  <FileCheck className="w-3 h-3" />
                  Status PO: {project.poStatus}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                {project.projectName || project.segmentRelokasi}
              </h2>
              <div className="text-xs text-cyan-400 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{project.segmentRelokasi}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content (Scrollable) */}
          <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
            {/* Progress Section */}
            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                  Realisasi Progres Fisik Proyek
                </span>
                <span className="font-mono text-cyan-400 font-bold text-sm tabular-nums">
                  {project.progressPercent}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    project.status === 'Done'
                      ? 'bg-emerald-500'
                      : project.status === 'Cancel'
                      ? 'bg-rose-500'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                  }`}
                  style={{ width: `${project.progressPercent}%` }}
                />
              </div>

              {/* Quick Status Selector */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
                <span className="text-[11px] text-slate-400">Ubah Status Cepat:</span>
                <div className="flex items-center gap-1.5">
                  {(['Not Yet', 'In Progress', 'Done', 'Cancel'] as ProjectStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => onQuickChangeStatus(project.id, st)}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                        project.status === st
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                          : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Technical Specifications Grid (4 Primary Cards) */}
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                Volume Pekerjaan & Rute
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Panjang Galian */}
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                    <Ruler className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Panjang Galian</span>
                  </div>
                  <div className="text-lg font-bold text-white font-mono tabular-nums">
                    {Number(project.panjangGalian || 0).toLocaleString('id-ID')} m
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                    {formatKm(Number(project.panjangGalian || 0))}
                  </div>
                </div>

                {/* Panjang Kabel FO */}
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                    <Cable className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Panjang Kabel FO</span>
                  </div>
                  <div className="text-lg font-bold text-cyan-300 font-mono tabular-nums">
                    {Number(project.panjangKabelFo || 0).toLocaleString('id-ID')} m
                  </div>
                  <div className="text-[10px] text-cyan-400 font-mono mt-0.5">
                    {formatKm(Number(project.panjangKabelFo || 0))}
                  </div>
                </div>

                {/* Akses (Meter) */}
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                    <Share2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Akses Meter</span>
                  </div>
                  <div className="text-lg font-bold text-blue-300 font-mono tabular-nums">
                    {Number(project.aksesMeter || 0).toLocaleString('id-ID')} m
                  </div>
                  <div className="text-[10px] text-blue-400 mt-0.5">
                    Drop Cable Route
                  </div>
                </div>

                {/* Total Handhole */}
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                    <Box className="w-3.5 h-3.5 text-amber-400" />
                    <span>Total Handhole</span>
                  </div>
                  <div className="text-lg font-bold text-amber-300 font-mono tabular-nums">
                    {totalHHCount} Unit
                  </div>
                  <div className="text-[10px] text-amber-400 mt-0.5">
                    Precast Joint Pit
                  </div>
                </div>
              </div>
            </div>

            {/* Handhole Unit Breakdown Strip (HH, HS, HG, HM) */}
            <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
              <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5" />
                Rincian Instalasi Handhole per Tipe (Unit):
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Instal HH (Standar)</span>
                  <span className="text-sm font-bold text-white tabular-nums">{project.instalHH ?? 0} Unit</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Instal HS (Special)</span>
                  <span className="text-sm font-bold text-cyan-300 tabular-nums">{project.instalHS ?? 0} Unit</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Instal HG (Garden)</span>
                  <span className="text-sm font-bold text-emerald-300 tabular-nums">{project.instalHG ?? 0} Unit</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Instal HM (Manhole)</span>
                  <span className="text-sm font-bold text-purple-300 tabular-nums">{project.instalHM ?? 0} Unit</span>
                </div>
              </div>
            </div>

            {/* PIC Information & Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* PIC Info */}
              <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  Penanggung Jawab Proyek (PIC)
                </h4>

                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400 block text-[10px] mb-0.5">PIC Government Relations (Govrel):</span>
                    <span className="text-white font-semibold text-sm">{project.picGovrel || '-'}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400 block text-[10px] mb-0.5">PIC DSB (Ducting Sarana Bersama):</span>
                    <span className="text-white font-semibold text-sm">{project.picDsb || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Schedule & Vendor */}
              <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Jadwal & Rekanan Vendor
                </h4>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] mb-1">Nama Vendor:</span>
                    <VendorBadge vendorName={project.vendorName} size="md" />
                  </div>

                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-slate-400 block text-[10px]">Periode Pelaksanaan:</span>
                    <div className="text-slate-200 font-mono text-xs mt-0.5 flex items-center gap-2">
                      <span className="text-cyan-300 font-semibold">{project.startDate}</span>
                      <span className="text-slate-500">s/d</span>
                      <span className="text-emerald-300 font-semibold">{project.targetEndDate}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Status Purchase Order (PO):</span>
                    <span className="text-slate-200 font-mono font-semibold">{project.poStatus}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Field Notes & Kendala */}
            <div className="p-3.5 bg-slate-950/40 rounded-xl border border-slate-800/90 text-xs">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                Catatan Teknis & Kondisi Lapangan:
              </span>
              <p className="text-slate-300 leading-relaxed">
                {project.catatan || 'Tidak ada catatan kendala teknis khusus.'}
              </p>
            </div>
          </div>

          {/* Footer Actions (Edit, Delete, Close) */}
          <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onEdit(project);
                }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Data</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  onDelete(project);
                }}
                className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium rounded-lg border border-rose-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Proyek</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
