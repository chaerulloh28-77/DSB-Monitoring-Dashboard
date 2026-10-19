import React from 'react';
import { 
  Building2, 
  MapPin, 
  Edit3, 
  Trash2, 
  ExternalLink,
  CheckCircle2,
  Clock,
  TrendingUp,
  XCircle,
  FileCheck,
  Calendar,
  UserCheck,
  Ruler,
  Cable,
  Share2,
  Box
} from 'lucide-react';
import { DSBProject, ProjectStatus, POStatus } from '../types/dsb';
import { VendorBadge } from './VendorBadge';

interface ProjectTableProps {
  projects: DSBProject[];
  onSelectProject: (project: DSBProject) => void;
  onEditProject: (project: DSBProject) => void;
  onDeleteProject: (project: DSBProject) => void;
}

export const ProjectTable: React.FC<ProjectTableProps> = ({
  projects,
  onSelectProject,
  onEditProject,
  onDeleteProject
}) => {
  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'Done':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Done
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 bg-blue-950/60 border border-blue-500/30 px-2 py-0.5 rounded">
            <TrendingUp className="w-3 h-3 text-blue-400" />
            In Progress
          </span>
        );
      case 'Cancel':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-950/60 border border-rose-500/30 px-2 py-0.5 rounded">
            <XCircle className="w-3 h-3 text-rose-400" />
            Cancel
          </span>
        );
      case 'Not Yet':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-300 bg-slate-800/80 border border-slate-700 px-2 py-0.5 rounded">
            <Clock className="w-3 h-3 text-slate-400" />
            Not Yet
          </span>
        );
    }
  };

  const getPOBadge = (poStatus: POStatus | string) => {
    if (poStatus === 'Release' || poStatus === 'Released') {
      return (
        <span className="text-[10px] text-cyan-300 bg-cyan-950/50 border border-cyan-800/50 px-2 py-0.5 rounded font-mono font-semibold flex items-center justify-center gap-1">
          <FileCheck className="w-3 h-3" />
          Release
        </span>
      );
    }
    if (poStatus === 'Cancel' || poStatus === 'Revisi PO') {
      return (
        <span className="text-[10px] text-rose-300 bg-rose-950/50 border border-rose-800/50 px-2 py-0.5 rounded font-mono font-semibold flex items-center justify-center gap-1">
          <XCircle className="w-3 h-3" />
          Cancel
        </span>
      );
    }
    return (
      <span className="text-[10px] text-amber-300 bg-amber-950/50 border border-amber-800/50 px-2 py-0.5 rounded font-mono font-semibold flex items-center justify-center gap-1">
        <Clock className="w-3 h-3" />
        Not Yet
      </span>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 border-b border-slate-800 text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-3.5">Nama Vendor</th>
              <th className="py-3 px-3">Segment Relokasi</th>
              <th className="py-3 px-3">PIC Govrel & DSB</th>
              <th className="py-3 px-3">Jadwal (Start - End)</th>
              <th className="py-3 px-3 text-right">Galian (m)</th>
              <th className="py-3 px-3 text-right">Kabel FO (m)</th>
              <th className="py-3 px-3 text-right">Akses (m)</th>
              <th className="py-3 px-3 text-center">Instal HH Unit</th>
              <th className="py-3 px-3 text-center">Status Project</th>
              <th className="py-3 px-3 text-center">Status PO</th>
              <th className="py-3 px-3.5 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {projects.map((project) => (
              <tr
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
              >
                {/* 1. Nama Vendor & Kode */}
                <td className="py-3 px-3.5 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    <VendorBadge vendorName={project.vendorName} size="xs" />
                    <span className="font-mono text-[10px] text-cyan-400">
                      {project.projectCode}
                    </span>
                  </div>
                </td>

                {/* 2. Segment Relokasi */}
                <td className="py-3 px-3 max-w-[200px]">
                  <div className="text-white font-medium line-clamp-1 group-hover:text-cyan-300 transition-colors" title={project.segmentRelokasi}>
                    {project.segmentRelokasi}
                  </div>
                  {project.projectName && project.projectName !== project.segmentRelokasi && (
                    <div className="text-[11px] text-slate-400 line-clamp-1 truncate">
                      {project.projectName}
                    </div>
                  )}
                </td>

                {/* 3. PIC Govrel & PIC DSB */}
                <td className="py-3 px-3 max-w-[180px] whitespace-nowrap">
                  <div className="text-slate-200 text-xs flex items-center gap-1.5 truncate">
                    <span className="text-[10px] text-cyan-400 font-semibold px-1 rounded bg-cyan-950/70 border border-cyan-900/60">Gov</span>
                    <span className="truncate">{project.picGovrel || '-'}</span>
                  </div>
                  <div className="text-slate-400 text-[11px] flex items-center gap-1.5 mt-0.5 truncate">
                    <span className="text-[10px] text-emerald-400 font-semibold px-1 rounded bg-emerald-950/70 border border-emerald-900/60">DSB</span>
                    <span className="truncate">{project.picDsb || '-'}</span>
                  </div>
                </td>

                {/* 4. Tanggal Start & End */}
                <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px]">
                  <div className="text-slate-300">
                    {project.startDate}
                  </div>
                  <div className="text-slate-500 text-[10px]">
                    s/d {project.targetEndDate}
                  </div>
                </td>

                {/* 5. Panjang Galian (m) */}
                <td className="py-3 px-3 text-right font-mono text-slate-200 tabular-nums whitespace-nowrap">
                  <span className="font-semibold">{Number(project.panjangGalian || 0).toLocaleString('id-ID')}</span>
                  <span className="text-slate-500 text-[10px] ml-0.5">m</span>
                </td>

                {/* 6. Panjang Kabel FO (m) */}
                <td className="py-3 px-3 text-right font-mono text-cyan-300 tabular-nums whitespace-nowrap">
                  <span className="font-semibold">{Number(project.panjangKabelFo || 0).toLocaleString('id-ID')}</span>
                  <span className="text-slate-500 text-[10px] ml-0.5">m</span>
                </td>

                {/* 7. Akses (m) */}
                <td className="py-3 px-3 text-right font-mono text-emerald-300 tabular-nums whitespace-nowrap">
                  <span className="font-semibold">{Number(project.aksesMeter || 0).toLocaleString('id-ID')}</span>
                  <span className="text-slate-500 text-[10px] ml-0.5">m</span>
                </td>

                {/* 8. Instal HH, HS, HG, HM Unit */}
                <td className="py-3 px-3 text-center whitespace-nowrap">
                  <div className="inline-flex flex-col items-center">
                    <span className="font-mono text-xs font-bold text-amber-300 tabular-nums">
                      {project.totalHH || (Number(project.instalHH || 0) + Number(project.instalHS || 0) + Number(project.instalHG || 0) + Number(project.instalHM || 0))} Unit
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      HH:{project.instalHH ?? 0} HS:{project.instalHS ?? 0} HG:{project.instalHG ?? 0} HM:{project.instalHM ?? 0}
                    </span>
                  </div>
                </td>

                {/* 9. Status Project */}
                <td className="py-3 px-3 text-center whitespace-nowrap">
                  {getStatusBadge(project.status)}
                </td>

                {/* 10. Status PO */}
                <td className="py-3 px-3 text-center whitespace-nowrap">
                  {getPOBadge(project.poStatus)}
                </td>

                {/* 11. Aksi (Edit, Hapus, Detail) */}
                <td className="py-3 px-3.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onEditProject(project)}
                      className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Edit Data Proyek"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteProject(project)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Proyek"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onSelectProject(project)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Lihat Detail Lengkap"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
