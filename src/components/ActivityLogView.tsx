import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Trash2, 
  PlusCircle, 
  Edit3, 
  XCircle, 
  ThumbsUp, 
  CheckCircle, 
  LogIn, 
  RefreshCw,
  Clock,
  User,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ActivityLog } from '../types/dsb';
import { storageService } from '../services/storageService';

interface ActivityLogViewProps {
  logs: ActivityLog[];
  onClearLogs: () => void;
}

export const ActivityLogView: React.FC<ActivityLogViewProps> = ({
  logs,
  onClearLogs
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const getActionBadge = (actionType: ActivityLog['actionType']) => {
    switch (actionType) {
      case 'CREATE':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/80">
            <PlusCircle className="w-3 h-3" /> INPUT
          </span>
        );
      case 'UPDATE':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-800/80">
            <Edit3 className="w-3 h-3" /> EDIT
          </span>
        );
      case 'DELETE':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-800/80">
            <XCircle className="w-3 h-3" /> HAPUS
          </span>
        );
      case 'STATUS_CHANGE':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-800/80">
            <CheckCircle className="w-3 h-3" /> STATUS
          </span>
        );
      case 'THUMB_VERIFY':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
            <ThumbsUp className="w-3 h-3 text-amber-400" /> JEMPOL
          </span>
        );
      case 'LOGIN':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-950/80 text-purple-400 border border-purple-800/80">
            <LogIn className="w-3 h-3" /> LOGIN
          </span>
        );
      case 'SYNC':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            <RefreshCw className="w-3 h-3" /> SYNC
          </span>
        );
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesType = filterType === 'ALL' || log.actionType === filterType;
    const matchesSearch =
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.targetProjectCode && log.targetProjectCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const formatTimestamp = (iso: string) => {
    try {
      const date = new Date(iso);
      return date.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }) + ' WIB';
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <History className="w-4 h-4" />
            </span>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Log Aktivitas Sistem & Audit Trail
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Rekam jejak real-time setiap perubahan data: input proyek, edit spesifikasi, hapus data, verifikasi jempol, dan sesi pengguna
          </p>
        </div>

        <button
          onClick={onClearLogs}
          disabled={logs.length === 0}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer disabled:opacity-40"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Bersihkan Log</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari dalam log aktivitas..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Action Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
            {['ALL', 'CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'THUMB_VERIFY', 'LOGIN'].map((act) => (
              <button
                key={act}
                onClick={() => setFilterType(act)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                  filterType === act
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {act === 'ALL'
                  ? 'Semua'
                  : act === 'CREATE'
                  ? 'Input'
                  : act === 'UPDATE'
                  ? 'Edit'
                  : act === 'DELETE'
                  ? 'Hapus'
                  : act === 'STATUS_CHANGE'
                  ? 'Status'
                  : act === 'THUMB_VERIFY'
                  ? 'Jempol'
                  : 'Login'}
              </button>
            ))}
          </div>
        </div>

        {/* Log Entries List */}
        <div className="space-y-2 pt-2">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-10 bg-slate-950/40 rounded-xl border border-dashed border-slate-800 text-slate-500 text-xs">
              Tidak ada catatan aktivitas yang cocok dengan kriteria pencarian.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              return (
                <div
                  key={log.id}
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                  className="p-3.5 bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 rounded-xl transition-all text-xs cursor-pointer group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {getActionBadge(log.actionType)}
                      {log.targetProjectCode && (
                        <span className="font-mono text-[11px] text-cyan-400 font-semibold bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-900/60">
                          {log.targetProjectCode}
                        </span>
                      )}
                      <span className="text-white font-medium group-hover:text-cyan-300 transition-colors">
                        {log.description}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono shrink-0">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-500" />
                        <strong className="text-slate-300">{log.userName}</strong>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {formatTimestamp(log.timestamp)}
                      </span>
                      <span className="text-slate-500">
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {isExpanded && log.details && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-lg font-mono">
                      <span className="text-slate-500 block mb-0.5">Rincian Teknis Perubahan:</span>
                      <span className="text-slate-300">{log.details}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
