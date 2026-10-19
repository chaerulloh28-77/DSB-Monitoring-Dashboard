import React from 'react';
import { 
  Building2, 
  MapPin, 
  Ruler, 
  Cable, 
  Share2, 
  Box, 
  FileCheck, 
  Edit3, 
  Trash2, 
  ExternalLink,
  CheckCircle2,
  Clock,
  TrendingUp,
  XCircle,
  Calendar,
  UserCheck
} from 'lucide-react';
import { DSBProject, ProjectStatus, POStatus } from '../types/dsb';
import { VendorBadge } from './VendorBadge';

interface ProjectCardProps {
  project: DSBProject;
  onSelectProject: (project: DSBProject) => void;
  onEditProject: (project: DSBProject) => void;
  onDeleteProject: (project: DSBProject) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
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
        <span className="text-[10px] text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-1.5 py-0.5 rounded flex items-center gap-1 font-mono font-semibold">
          <FileCheck className="w-3 h-3" />
          PO Release
        </span>
      );
    }
    if (poStatus === 'Cancel' || poStatus === 'Revisi PO') {
      return (
        <span className="text-[10px] text-rose-300 bg-rose-950/60 border border-rose-800/60 px-1.5 py-0.5 rounded flex items-center gap-1 font-mono font-semibold">
          <XCircle className="w-3 h-3" />
          PO Cancel
        </span>
      );
    }
    return (
      <span className="text-[10px] text-amber-300 bg-amber-950/60 border border-amber-800/60 px-1.5 py-0.5 rounded flex items-center gap-1 font-mono font-semibold">
        <Clock className="w-3 h-3" />
        PO Not Yet
      </span>
    );
  };

  const totalHHDisplay = project.totalHH || (
    Number(project.instalHH || 0) +
    Number(project.instalHS || 0) +
    Number(project.instalHG || 0) +
    Number(project.instalHM || 0)
  );

  return (
    <div
      onClick={() => onSelectProject(project)}
      className="bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-4 transition-all duration-200 hover:shadow-lg hover:shadow-cyan-950/20 cursor-pointer flex flex-col justify-between group relative"
    >
      <div>
        {/* Top Badges: Vendor, PO Status, Project Status */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <VendorBadge vendorName={project.vendorName} size="xs" />
            <span className="text-[10px] font-mono font-semibold text-cyan-400 bg-cyan-950/40 border border-cyan-900/60 px-1.5 py-0.5 rounded">
              {project.projectCode}
            </span>
            {getPOBadge(project.poStatus)}
          </div>
          <div>{getStatusBadge(project.status)}</div>
        </div>

        {/* Segment Relokasi (Prominent) */}
        <div className="flex items-center gap-1.5 text-xs text-cyan-300 font-semibold mb-1">
          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="line-clamp-1">{project.segmentRelokasi}</span>
        </div>

        {/* Project Name (if different) */}
        {project.projectName && project.projectName !== project.segmentRelokasi && (
          <h4 className="text-xs text-slate-300 line-clamp-1 group-hover:text-white transition-colors mb-2.5">
            {project.projectName}
          </h4>
        )}

        {/* PIC Govrel & PIC DSB */}
        <div className="grid grid-cols-2 gap-2 text-[11px] p-2 bg-slate-950/50 rounded-lg border border-slate-800/60 mb-3">
          <div className="truncate">
            <span className="text-[10px] text-slate-400 block">PIC Govrel:</span>
            <span className="font-medium text-slate-200 truncate">{project.picGovrel || '-'}</span>
          </div>
          <div className="truncate">
            <span className="text-[10px] text-slate-400 block">PIC DSB:</span>
            <span className="font-medium text-slate-200 truncate">{project.picDsb || '-'}</span>
          </div>
        </div>

        {/* Schedule: Start - End */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-3 px-1">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-cyan-400" /> Start: {project.startDate}
          </span>
          <span>End: {project.targetEndDate}</span>
        </div>

        {/* Progress Bar */}
        <div className="mb-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-slate-400 font-medium">Progres Fisik</span>
            <span className="font-mono text-cyan-400 font-semibold tabular-nums">
              {project.progressPercent}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
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
        </div>

        {/* Technical Specs Strip: Galian (m), Kabel FO (m), Akses (m), Instal HH (unit) */}
        <div className="grid grid-cols-4 gap-1.5 bg-slate-950/70 p-2 rounded-lg border border-slate-800/70 text-center font-mono">
          <div>
            <div className="text-[9px] text-slate-400 flex items-center justify-center gap-0.5">
              <Ruler className="w-2.5 h-2.5 text-emerald-400" /> Galian
            </div>
            <div className="text-[11px] font-semibold text-slate-200 mt-0.5 tabular-nums">
              {Number(project.panjangGalian || 0).toLocaleString('id-ID')}m
            </div>
          </div>
          <div>
            <div className="text-[9px] text-slate-400 flex items-center justify-center gap-0.5">
              <Cable className="w-2.5 h-2.5 text-cyan-400" /> Kabel FO
            </div>
            <div className="text-[11px] font-semibold text-cyan-300 mt-0.5 tabular-nums">
              {Number(project.panjangKabelFo || 0).toLocaleString('id-ID')}m
            </div>
          </div>
          <div>
            <div className="text-[9px] text-slate-400 flex items-center justify-center gap-0.5">
              <Share2 className="w-2.5 h-2.5 text-blue-400" /> Akses
            </div>
            <div className="text-[11px] font-semibold text-blue-300 mt-0.5 tabular-nums">
              {Number(project.aksesMeter || 0).toLocaleString('id-ID')}m
            </div>
          </div>
          <div>
            <div className="text-[9px] text-slate-400 flex items-center justify-center gap-0.5">
              <Box className="w-2.5 h-2.5 text-amber-400" /> HH
            </div>
            <div className="text-[11px] font-semibold text-amber-300 mt-0.5 tabular-nums" title={`HH:${project.instalHH || 0} HS:${project.instalHS || 0} HG:${project.instalHG || 0} HM:${project.instalHM || 0}`}>
              {totalHHDisplay} u
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Action Buttons (Edit, Hapus, Detail) */}
      <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
        <span className="text-[10px] text-slate-400 font-mono">
          HH:{project.instalHH ?? 0} HS:{project.instalHS ?? 0} HG:{project.instalHG ?? 0} HM:{project.instalHM ?? 0}
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEditProject(project);
            }}
            className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Edit Data Proyek"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteProject(project);
            }}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
            title="Hapus Data Proyek"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectProject(project);
            }}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs cursor-pointer"
            title="Buka Informasi Akurat"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
