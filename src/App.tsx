import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  storageService, 
  subscribeToRealtimeSync 
} from './services/storageService';
import { cloudSyncService } from './services/cloudSyncService';
import { 
  DSBProject, 
  MenuType, 
  FilterState, 
  ActivityLog, 
  ProjectStatus 
} from './types/dsb';
import { VENDORS_LIST, SEGMENTS_LIST } from './data/initialData';
import { LoginView } from './components/LoginView';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { ProjectFormModal } from './components/ProjectFormModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ProjectListView } from './components/ProjectListView';
import { UserSettingsView } from './components/UserSettingsView';
import { ActivityLogView } from './components/ActivityLogView';
import { MetricDetailModal, MetricDetailType } from './components/MetricDetailModal';
import { ProjectCharts } from './components/ProjectCharts';

export default function App() {
  // Session State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => storageService.isLoggedIn());
  const [currentUser, setCurrentUser] = useState(() => storageService.getCurrentUser());

  // Navigation State
  const [currentMenu, setCurrentMenu] = useState<MenuType>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Real-time Data State
  const [projects, setProjects] = useState<DSBProject[]>(() => storageService.getProjects());
  const [logs, setLogs] = useState<ActivityLog[]>(() => storageService.getLogs());
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => storageService.getLastSync());
  const [isSyncing, setIsSyncing] = useState(false);

  // View & Filter State
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    vendor: 'ALL',
    segment: 'ALL',
    status: 'ALL',
    poStatus: 'ALL',
    picGovrel: 'ALL',
    picDsb: 'ALL',
    sortBy: 'terbaru'
  });

  // Modals & Selected Entities
  const [selectedProject, setSelectedProject] = useState<DSBProject | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<DSBProject | null>(null);
  const [deletingProject, setDeletingProject] = useState<DSBProject | null>(null);
  const [activeMetricDetail, setActiveMetricDetail] = useState<MetricDetailType | null>(null);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2400);
  };

  // 1. Silent Initial Pull from Cloud on App Mount / Login
  useEffect(() => {
    let isMounted = true;
    cloudSyncService.pullFromCloud().then((cloudRes) => {
      if (isMounted && cloudRes.success && cloudRes.projects && cloudRes.projects.length > 0) {
        storageService.saveProjectsFromCloud(cloudRes.projects, cloudRes.logs || undefined);
        setProjects(cloudRes.projects);
        if (cloudRes.logs) setLogs(cloudRes.logs);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  // 2. Silent Cross-tab & Storage Subscriber
  useEffect(() => {
    const unsubscribe = subscribeToRealtimeSync(({ type }) => {
      setProjects(storageService.getProjects());
      setLogs(storageService.getLogs());
      setLastSyncTime(storageService.getLastSync());

      if (selectedProject) {
        const fresh = storageService.getProjects().find((p) => p.id === selectedProject.id);
        setSelectedProject(fresh || null);
      }
    });

    return () => unsubscribe();
  }, [selectedProject]);

  // 3. Silent Polling Loop every 3 seconds (No Pop-ups)
  useEffect(() => {
    const cleanupCloudSync = cloudSyncService.startAutoSync((cloudProjects, cloudLogs) => {
      storageService.saveProjectsFromCloud(cloudProjects, cloudLogs);
      setProjects(cloudProjects);
      if (cloudLogs) setLogs(cloudLogs);
      const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSyncTime(timeStr);

      if (selectedProject) {
        const updated = cloudProjects.find((p) => p.id === selectedProject.id);
        setSelectedProject(updated || null);
      }
    });

    return () => cleanupCloudSync();
  }, [selectedProject]);

  // Periodic subtle time update
  useEffect(() => {
    const interval = setInterval(() => {
      setLastSyncTime(storageService.getLastSync());
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Recalculate KPIs dynamically
  const kpiSummary = useMemo(() => {
    return storageService.calculateKPI(projects);
  }, [projects]);

  // Active filters count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search.trim()) count++;
    if (filters.vendor !== 'ALL') count++;
    if (filters.segment !== 'ALL') count++;
    if (filters.status !== 'ALL') count++;
    if (filters.poStatus !== 'ALL') count++;
    if (filters.picGovrel && filters.picGovrel !== 'ALL') count++;
    if (filters.picDsb && filters.picDsb !== 'ALL') count++;
    return count;
  }, [filters]);

  // Dynamically extract all unique segments (from projects + defaults)
  const dynamicSegmentList = useMemo(() => {
    const fromProjects = projects.map((p) => p.segmentRelokasi).filter(Boolean);
    const combined = Array.from(new Set([...fromProjects, ...SEGMENTS_LIST]));
    return combined.sort();
  }, [projects]);

  // Trigger manual sync
  const handleTriggerSync = async () => {
    setIsSyncing(true);
    storageService.triggerSyncManual();
    
    const cloudRes = await cloudSyncService.pullFromCloud();
    setIsSyncing(false);

    if (cloudRes.success && cloudRes.projects) {
      storageService.saveProjectsFromCloud(cloudRes.projects, cloudRes.logs || undefined);
      setProjects(cloudRes.projects);
      if (cloudRes.logs) setLogs(cloudRes.logs);
    }
  };

  // Silent Login Handler
  const handleLoginSuccess = async (user: { username: string; role: string; fullName: string }) => {
    setCurrentUser(user);
    setIsAuthenticated(true);

    // Pull from cloud silently
    const cloudRes = await cloudSyncService.pullFromCloud();

    if (cloudRes.success && cloudRes.projects) {
      storageService.saveProjectsFromCloud(cloudRes.projects, cloudRes.logs || undefined);
      setProjects(cloudRes.projects);
      if (cloudRes.logs) setLogs(cloudRes.logs);
    } else {
      setProjects(storageService.getProjects());
      setLogs(storageService.getLogs());
    }
  };

  // CRUD Operations (Silent Cloud Push in background)
  const handleCreateProject = (projectData: any) => {
    const created = storageService.addProject(projectData);
    setProjects(storageService.getProjects());
    setLogs(storageService.getLogs());
    setIsCreateModalOpen(false);
  };

  const handleUpdateProject = (updatedProject: DSBProject) => {
    const saved = storageService.updateProject(updatedProject);
    setProjects(storageService.getProjects());
    setLogs(storageService.getLogs());
    setEditingProject(null);
    if (selectedProject && selectedProject.id === saved.id) {
      setSelectedProject(saved);
    }
  };

  const handleDeleteProject = (projectId: string) => {
    const deleted = storageService.deleteProject(projectId);
    setProjects(storageService.getProjects());
    setLogs(storageService.getLogs());
    setDeletingProject(null);
    if (selectedProject && selectedProject.id === projectId) {
      setSelectedProject(null);
    }
  };

  const handleQuickChangeStatus = (projectId: string, newStatus: ProjectStatus) => {
    const target = projects.find((p) => p.id === projectId);
    if (!target) return;
    const updated = {
      ...target,
      status: newStatus,
      progressPercent: newStatus === 'Done' ? 100 : target.progressPercent
    };
    handleUpdateProject(updated);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      vendor: 'ALL',
      segment: 'ALL',
      status: 'ALL',
      poStatus: 'ALL',
      picGovrel: 'ALL',
      picDsb: 'ALL',
      sortBy: 'terbaru'
    });
  };

  const handleLogout = () => {
    storageService.clearSession();
    setIsAuthenticated(false);
  };

  // If not logged in, show Login view
  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-white">
      {/* Sliding Interactive Sidebar */}
      <Sidebar
        currentMenu={currentMenu}
        onSelectMenu={(menu) => setCurrentMenu(menu)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        totalProjects={projects.length}
        lastSyncTime={lastSyncTime}
        isSyncing={isSyncing}
        onTriggerSync={handleTriggerSync}
        currentUser={currentUser}
        onLogout={handleLogout}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          currentMenu={currentMenu}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          isSyncing={isSyncing}
          onTriggerSync={handleTriggerSync}
          lastSyncTime={lastSyncTime}
        />

        {/* Viewport Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* MENU 1: DASHBOARD PROJECT */}
          {currentMenu === 'dashboard' && (
            <div className="space-y-6">
              {/* Interactive KPI Cards (Total Project, Galian, Akses, HH, Statuses, PO) */}
              <MetricCards
                summary={kpiSummary}
                activeStatusFilter={filters.status}
                activePOFilter={filters.poStatus}
                onFilterByStatus={(status) => {
                  setFilters((prev) => ({
                    ...prev,
                    status: prev.status === status ? 'ALL' : status
                  }));
                }}
                onFilterByPO={(poStatus) => {
                  setFilters((prev) => ({
                    ...prev,
                    poStatus: prev.poStatus === poStatus ? 'ALL' : poStatus
                  }));
                }}
                onOpenMetricDetail={(type) => setActiveMetricDetail(type)}
              />

              {/* Interactive Charts: Pie Chart (Status) & Diagram Batang Vertikal */}
              <ProjectCharts
                projects={projects}
                summary={kpiSummary}
                activeStatusFilter={filters.status}
                activeSegmentFilter={filters.segment}
                onFilterByStatus={(status) => {
                  setFilters((prev) => ({
                    ...prev,
                    status: prev.status === status ? 'ALL' : status
                  }));
                }}
                onFilterBySegment={(segment) => {
                  setFilters((prev) => ({
                    ...prev,
                    segment: prev.segment === segment ? 'ALL' : segment
                  }));
                }}
                onSelectProject={(project) => setSelectedProject(project)}
              />
            </div>
          )}

          {/* MENU 2: PROJECT LIST (FULL FILTERS & CRUD) */}
          {currentMenu === 'project_list' && (
            <ProjectListView
              projects={projects}
              summary={kpiSummary}
              filters={filters}
              onFilterChange={(updates) => setFilters((prev) => ({ ...prev, ...updates }))}
              onResetFilters={handleResetFilters}
              vendorList={VENDORS_LIST}
              segmentList={dynamicSegmentList}
              viewMode={viewMode}
              onChangeViewMode={setViewMode}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
              activeFilterCount={activeFilterCount}
              onSelectProject={(project) => setSelectedProject(project)}
              onEditProject={(project) => setEditingProject(project)}
              onDeleteProject={(project) => setDeletingProject(project)}
            />
          )}

          {/* MENU 3: PENGATURAN PENGGUNA (USER SETTINGS) */}
          {currentMenu === 'pengaturan' && (
            <UserSettingsView
              currentUser={currentUser}
              onUpdateCurrentUser={(updated) => setCurrentUser(updated)}
            />
          )}

          {/* MENU 4: LOG AKTIVITAS SISTEM (AUDIT TRAIL) */}
          {currentMenu === 'log_aktivitas' && (
            <ActivityLogView
              logs={logs}
              onClearLogs={() => {
                if (window.confirm('Bersihkan seluruh log audit aktivitas sistem?')) {
                  storageService.clearLogs();
                  setLogs([]);
                }
              }}
            />
          )}
        </main>
      </div>

      {/* Interactive Detail Modal (Clickable Drilldown) */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onEdit={(p) => {
            setSelectedProject(null);
            setEditingProject(p);
          }}
          onDelete={(p) => {
            setSelectedProject(null);
            setDeletingProject(p);
          }}
          onQuickChangeStatus={handleQuickChangeStatus}
        />
      )}

      {/* Metric Detail Deep Dive Modal */}
      {activeMetricDetail && (
        <MetricDetailModal
          type={activeMetricDetail}
          onClose={() => setActiveMetricDetail(null)}
          projects={projects}
          summary={kpiSummary}
          onSelectProject={(p) => {
            setActiveMetricDetail(null);
            setSelectedProject(p);
          }}
        />
      )}

      {/* CRUD 1: Create Project Modal */}
      <ProjectFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
      />

      {/* CRUD 2: Edit Project Modal */}
      {editingProject && (
        <ProjectFormModal
          isOpen={!!editingProject}
          onClose={() => setEditingProject(null)}
          onSubmit={handleUpdateProject}
          initialProject={editingProject}
        />
      )}

      {/* CRUD 3: Delete Project Confirmation Modal */}
      {deletingProject && (
        <DeleteConfirmModal
          isOpen={!!deletingProject}
          project={deletingProject}
          onClose={() => setDeletingProject(null)}
          onConfirmDelete={(id) => handleDeleteProject(id)}
        />
      )}

      {/* Real-time Toast Feedback */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-cyan-500/50 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-medium"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
