import React from 'react';
import { 
  Menu, 
  RefreshCw, 
  Plus
} from 'lucide-react';
import { MenuType } from '../types/dsb';

interface HeaderProps {
  currentMenu: MenuType;
  onOpenMobileMenu: () => void;
  onOpenCreateModal: () => void;
  isSyncing: boolean;
  onTriggerSync: () => void;
  lastSyncTime: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentMenu,
  onOpenMobileMenu,
  onOpenCreateModal,
  isSyncing,
  onTriggerSync,
  lastSyncTime
}) => {
  const getMenuTitle = () => {
    switch (currentMenu) {
      case 'project_list':
        return 'Project List';
      case 'pengaturan':
        return 'Pengaturan Pengguna';
      case 'log_aktivitas':
        return 'Log Aktivitas Sistem';
      case 'dashboard':
      default:
        return 'Dashboard Project';
    }
  };

  return (
    <header className="h-16 px-4 sm:px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md">
      {/* Zone 1: Mobile Hamburger + Breadcrumb Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 truncate">
          <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
            DSB Utilitas
          </span>
          <span className="text-slate-600 hidden sm:inline">/</span>
          <h1 className="text-sm sm:text-base font-bold text-white truncate">
            {getMenuTitle()}
          </h1>
        </div>
      </div>

      {/* Zone 2: Passive Static Badge "Cloud Online" (Non-clickable) */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-300 px-3 py-1 rounded-full bg-slate-950 border border-slate-800/80 shadow-inner select-none pointer-events-none">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-400 font-semibold text-[11px] sm:text-xs tracking-wide">
            Cloud Online
          </span>
        </div>
      </div>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Sync Manual Button */}
        <button
          onClick={onTriggerSync}
          disabled={isSyncing}
          className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 border border-slate-800 transition-colors disabled:opacity-40 cursor-pointer"
          title="Sinkronkan data sekarang"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
        </button>

        {/* Primary Action Button */}
        <button
          onClick={onOpenCreateModal}
          className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-medium rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-sm shadow-cyan-950 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Input Data Proyek</span>
          <span className="sm:hidden">Tambah</span>
        </button>
      </div>
    </header>
  );
};
