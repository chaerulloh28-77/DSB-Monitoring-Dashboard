import React from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  History, 
  ChevronLeft, 
  ChevronRight, 
  Activity, 
  RefreshCw, 
  LogOut, 
  Radio
} from 'lucide-react';
import { MenuType } from '../types/dsb';

interface SidebarProps {
  currentMenu: MenuType;
  onSelectMenu: (menu: MenuType) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  totalProjects: number;
  lastSyncTime: string;
  isSyncing: boolean;
  onTriggerSync: () => void;
  currentUser: { username: string; role: string; fullName: string };
  onLogout: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentMenu,
  onSelectMenu,
  isCollapsed,
  onToggleCollapse,
  totalProjects,
  lastSyncTime,
  isSyncing,
  onTriggerSync,
  currentUser,
  onLogout,
  isMobileOpen,
  onCloseMobile
}) => {
  const menuItems: { id: MenuType; label: string; subLabel: string; icon: React.ElementType }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard Project',
      subLabel: 'Monitoring DSB Utama',
      icon: LayoutDashboard
    },
    {
      id: 'project_list',
      label: 'Project List',
      subLabel: 'Daftar Paket & CRUD',
      icon: FolderKanban
    },
    {
      id: 'pengaturan',
      label: 'Pengaturan Pengguna',
      subLabel: 'Hak Akses & Akun',
      icon: Users
    },
    {
      id: 'log_aktivitas',
      label: 'Log Aktivitas Sistem',
      subLabel: 'Audit Real-time Perubahan',
      icon: History
    }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <h2 className="text-sm font-bold tracking-tight text-white truncate">
                DSB MONITORING
              </h2>
              <span className="text-[10px] text-slate-400 block -mt-0.5 truncate">
                Infrastruktur Utilitas
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex items-center justify-center w-7 h-7 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        <div className={`px-2 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider ${isCollapsed ? 'hidden' : 'block'}`}>
          Menu Navigasi
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentMenu === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectMenu(item.id);
                onCloseMobile();
              }}
              title={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left group relative cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform ${
                  isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="truncate font-semibold">{item.label}</div>
                  <div className="text-[10px] text-slate-400 truncate font-normal">
                    {item.subLabel}
                  </div>
                </div>
              )}
              {(item.id === 'dashboard' || item.id === 'project_list') && !isCollapsed && (
                <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-300 border border-slate-700 tabular-nums">
                  {totalProjects}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Real-time Sync Status Widget */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        {!isCollapsed ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
                <Radio className={`w-3 h-3 ${isSyncing ? 'text-amber-400 animate-spin' : 'text-emerald-400'}`} />
                <span className="font-medium">Sinkronisasi Real-Time</span>
              </div>
              <button
                onClick={onTriggerSync}
                disabled={isSyncing}
                title="Sinkronkan data sekarang"
                className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors disabled:opacity-40 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Auto-Sync: Aktif</span>
              <span>{lastSyncTime}</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={onTriggerSync}
              title="Sinkronisasi Data DSB"
              className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        )}
      </div>

      {/* User Session & Logout */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/90">
        <div className="flex items-center justify-between gap-2">
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-slate-200 truncate">
                {currentUser.username}
              </div>
              <div className="text-[10px] text-cyan-400 truncate">
                {currentUser.role}
              </div>
            </div>
          )}
          <button
            onClick={onLogout}
            title="Keluar dari akun"
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-18' : 'w-64'
        }`}
      >
        <div className="sticky top-0 h-screen">{sidebarContent}</div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Slide-in Drawer */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 max-w-[80vw] transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};
