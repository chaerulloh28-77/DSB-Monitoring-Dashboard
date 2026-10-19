import { DSBProject, ActivityLog, UserAccount, KPISummary } from '../types/dsb';
import { INITIAL_PROJECTS, INITIAL_LOGS, INITIAL_USERS, VENDORS_LIST } from '../data/initialData';
import { cloudSyncService } from './cloudSyncService';

const STORAGE_KEYS = {
  PROJECTS: 'dsb_monitoring_projects_v2',
  LOGS: 'dsb_monitoring_logs_v1',
  USERS: 'dsb_monitoring_users_v1',
  LAST_SYNC: 'dsb_monitoring_last_sync_v1',
  SESSION: 'dsb_monitoring_session_v1'
};

// Real-time broadcast channel for cross-tab synchronization
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('dsb_realtime_channel');
  }
} catch {
  // Graceful fallback if BroadcastChannel is not supported
  broadcastChannel = null;
}

type SyncCallback = (data: { type: string; payload?: unknown }) => void;
const listeners: Set<SyncCallback> = new Set();

export const subscribeToRealtimeSync = (callback: SyncCallback) => {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
};

const notifySubscribers = (type: string, payload?: unknown) => {
  listeners.forEach((callback) => {
    try {
      callback({ type, payload });
    } catch (err) {
      console.error('Subscriber callback error:', err);
    }
  });

  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type, payload, timestamp: Date.now() });
    } catch (err) {
      console.error('BroadcastChannel post error:', err);
    }
  }

  // Update last sync time
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
  }
};

// Listen for external broadcast events
if (broadcastChannel) {
  broadcastChannel.onmessage = (event) => {
    listeners.forEach((callback) => {
      try {
        callback(event.data);
      } catch (err) {
        console.error('Broadcast message callback error:', err);
      }
    });
  };
}

// Storage helpers
export const storageService = {
  getProjects(): DSBProject[] {
    if (typeof window === 'undefined') return INITIAL_PROJECTS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (!data) {
        // Check if v1 exists and migrate vendor names
        const oldData = localStorage.getItem('dsb_monitoring_projects_v1');
        if (oldData) {
          try {
            const parsed: DSBProject[] = JSON.parse(oldData);
            const migrated = parsed.map((p) => {
              if (p.vendorName === 'PT Telkom Akses Mandiri') return { ...p, vendorName: 'BLAO' };
              if (p.vendorName === 'PT Fiberindo Prima Solusi') return { ...p, vendorName: 'FIROPTIX' };
              if (p.vendorName === 'PT Citra Infrastruktur Telekomunikasi') return { ...p, vendorName: 'SENTRATEL' };
              if (p.vendorName === 'PT Karya Jaringan Selaras') return { ...p, vendorName: 'MANDAU' };
              if (p.vendorName === 'PT Mega Galian Nusantara') return { ...p, vendorName: 'REKATAMA' };
              if (!VENDORS_LIST.includes(p.vendorName)) return { ...p, vendorName: 'BLAO' };
              return p;
            });
            localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(migrated));
            return migrated;
          } catch {
            // fallback
          }
        }
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(INITIAL_PROJECTS));
        return INITIAL_PROJECTS;
      }
      const parsed: DSBProject[] = JSON.parse(data);
      const cleaned = parsed.map((p) => {
        let vName = p.vendorName;
        if (vName === 'PT Telkom Akses Mandiri') vName = 'BLAO';
        else if (vName === 'PT Fiberindo Prima Solusi') vName = 'FIROPTIX';
        else if (vName === 'PT Citra Infrastruktur Telekomunikasi') vName = 'SENTRATEL';
        else if (vName === 'PT Karya Jaringan Selaras') vName = 'MANDAU';
        else if (vName === 'PT Mega Galian Nusantara') vName = 'REKATAMA';

        // Normalize PO Status: 'Released' -> 'Release', 'Pending PO' -> 'Not Yet', 'Revisi PO' -> 'Cancel'
        let normalizedPO: DSBProject['poStatus'] = 'Release';
        if (p.poStatus === 'Release' || (p.poStatus as string) === 'Released') {
          normalizedPO = 'Release';
        } else if (p.poStatus === 'Cancel' || (p.poStatus as string) === 'Revisi PO') {
          normalizedPO = 'Cancel';
        } else {
          normalizedPO = 'Not Yet';
        }

        const panjangGalian = Number(p.panjangGalian) || 1000;
        const panjangKabelFo = Number(p.panjangKabelFo) || Math.round(panjangGalian * 1.15);
        const aksesMeter = Number(p.aksesMeter) || Math.round(panjangGalian * 0.4);

        const oldHH = Number(p.totalHH) || 20;
        const instalHH = Number(p.instalHH) || Math.max(1, Math.round(oldHH * 0.6));
        const instalHS = Number(p.instalHS) || Math.max(1, Math.round(oldHH * 0.2));
        const instalHG = Number(p.instalHG) || Math.max(1, Math.round(oldHH * 0.12));
        const instalHM = Number(p.instalHM) || Math.max(1, oldHH - instalHH - instalHS - instalHG);
        const totalHH = instalHH + instalHS + instalHG + instalHM;

        return {
          ...p,
          vendorName: vName,
          poStatus: normalizedPO,
          panjangGalian,
          panjangKabelFo,
          aksesMeter,
          instalHH,
          instalHS,
          instalHG,
          instalHM,
          totalHH,
          picGovrel: p.picGovrel || (p.picName ? `${p.picName} (Govrel)` : 'Ir. Hendri Siregar (Govrel DKI)'),
          picDsb: p.picDsb || (p.picName ? `${p.picName} (DSB)` : 'Bambang Prasetyo (DSB)')
        };
      });
      return cleaned;
    } catch {
      return INITIAL_PROJECTS;
    }
  },

  saveProjects(projects: DSBProject[], recordLog = false, logDesc = 'Perubahan data proyek') {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    if (recordLog) {
      this.addLog({
        actionType: 'UPDATE',
        description: logDesc,
        userName: this.getCurrentUser().username
      });
    }
    notifySubscribers('PROJECTS_UPDATED', projects);
    cloudSyncService.pushToCloud(projects, this.getLogs());
  },

  saveProjectsFromCloud(cloudProjects: DSBProject[], cloudLogs?: ActivityLog[]) {
    if (typeof window === 'undefined') return;
    if (cloudProjects && cloudProjects.length > 0) {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(cloudProjects));
    }
    if (cloudLogs && cloudLogs.length > 0) {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(cloudLogs));
    }
    notifySubscribers('PROJECTS_UPDATED', cloudProjects);
  },

  addProject(projectData: Omit<DSBProject, 'id' | 'createdAt' | 'updatedAt' | 'thumbsCount' | 'isVerified'>): DSBProject {
    const projects = this.getProjects();
    const newId = 'dsb-' + Date.now().toString(36);
    const now = new Date().toISOString();

    const hh = Number(projectData.instalHH) || 0;
    const hs = Number(projectData.instalHS) || 0;
    const hg = Number(projectData.instalHG) || 0;
    const hm = Number(projectData.instalHM) || 0;
    const computedTotalHH = (hh + hs + hg + hm) > 0 ? (hh + hs + hg + hm) : (Number(projectData.totalHH) || 0);

    const newProject: DSBProject = {
      ...projectData,
      id: newId,
      totalHH: computedTotalHH,
      thumbsCount: 0,
      isVerified: false,
      createdAt: now,
      updatedAt: now
    };

    const updatedList = [newProject, ...projects];
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updatedList));

    this.addLog({
      actionType: 'CREATE',
      targetProjectCode: newProject.projectCode,
      targetProjectName: newProject.projectName,
      description: `Input data proyek baru: ${newProject.projectName} (${newProject.projectCode})`,
      details: `Vendor: ${newProject.vendorName} | Segmen: ${newProject.segmentRelokasi} | Galian: ${newProject.panjangGalian}m | Status: ${newProject.status}`
    });

    notifySubscribers('PROJECT_ADDED', newProject);
    cloudSyncService.pushToCloud(updatedList, this.getLogs());
    return newProject;
  },

  updateProject(updatedProject: DSBProject): DSBProject {
    const projects = this.getProjects();
    const existing = projects.find((p) => p.id === updatedProject.id);
    const now = new Date().toISOString();

    const hh = Number(updatedProject.instalHH) || 0;
    const hs = Number(updatedProject.instalHS) || 0;
    const hg = Number(updatedProject.instalHG) || 0;
    const hm = Number(updatedProject.instalHM) || 0;
    const computedTotalHH = (hh + hs + hg + hm) > 0 ? (hh + hs + hg + hm) : (Number(updatedProject.totalHH) || 0);

    const finalizedProject: DSBProject = {
      ...updatedProject,
      totalHH: computedTotalHH,
      updatedAt: now
    };

    const updatedList = projects.map((p) => (p.id === updatedProject.id ? finalizedProject : p));
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updatedList));

    let actionType: ActivityLog['actionType'] = 'UPDATE';
    let desc = `Edit data proyek: ${finalizedProject.projectName}`;

    if (existing && existing.status !== finalizedProject.status) {
      actionType = 'STATUS_CHANGE';
      desc = `Ubah status proyek [${finalizedProject.projectCode}] dari ${existing.status} menjadi ${finalizedProject.status}`;
    }

    this.addLog({
      actionType,
      targetProjectCode: finalizedProject.projectCode,
      targetProjectName: finalizedProject.projectName,
      description: desc,
      details: `Vendor: ${finalizedProject.vendorName} | Progres: ${finalizedProject.progressPercent}% | Galian: ${finalizedProject.panjangGalian}m`
    });

    notifySubscribers('PROJECT_UPDATED', finalizedProject);
    cloudSyncService.pushToCloud(updatedList, this.getLogs());
    return finalizedProject;
  },

  deleteProject(projectId: string): DSBProject | null {
    const projects = this.getProjects();
    const target = projects.find((p) => p.id === projectId);
    if (!target) return null;

    const filtered = projects.filter((p) => p.id !== projectId);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filtered));

    this.addLog({
      actionType: 'DELETE',
      targetProjectCode: target.projectCode,
      targetProjectName: target.projectName,
      description: `Hapus proyek: ${target.projectName} (${target.projectCode})`,
      details: `Data proyek dan catatan terkait telah dihapus permanen dari sistem monitoring.`
    });

    notifySubscribers('PROJECT_DELETED', { id: projectId, project: target });
    cloudSyncService.pushToCloud(filtered, this.getLogs());
    return target;
  },

  giveThumb(projectId: string): DSBProject | null {
    const projects = this.getProjects();
    const target = projects.find((p) => p.id === projectId);
    if (!target) return null;

    const updated: DSBProject = {
      ...target,
      thumbsCount: (target.thumbsCount || 0) + 1,
      isVerified: true,
      updatedAt: new Date().toISOString()
    };

    const updatedList = projects.map((p) => (p.id === projectId ? updated : p));
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updatedList));

    this.addLog({
      actionType: 'THUMB_VERIFY',
      targetProjectCode: updated.projectCode,
      targetProjectName: updated.projectName,
      description: `Apresiasi jempol & verifikasi data lapangan untuk ${updated.projectCode}`,
      details: `Total jempol: ${updated.thumbsCount} | Status verifikasi: Terverifikasi oleh ${this.getCurrentUser().username}`
    });

    notifySubscribers('THUMB_GIVEN', updated);
    cloudSyncService.pushToCloud(updatedList, this.getLogs());
    return updated;
  },

  resetToDefault() {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(INITIAL_PROJECTS));
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_LOGS));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    this.addLog({
      actionType: 'SYNC',
      description: 'Reset database monitoring ke konfigurasi awal bawaan sistem',
      details: 'Semua 8 proyek utama dan log berhasil dipulihkan.'
    });
    notifySubscribers('RESET_DATA');
    cloudSyncService.pushToCloud(INITIAL_PROJECTS, INITIAL_LOGS);
  },

  // Activity Logs
  getLogs(): ActivityLog[] {
    if (typeof window === 'undefined') return INITIAL_LOGS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_LOGS));
        return INITIAL_LOGS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_LOGS;
    }
  },

  addLog(logData: Omit<ActivityLog, 'id' | 'timestamp' | 'userName'> & { userName?: string }) {
    if (typeof window === 'undefined') return;
    const currentLogs = this.getLogs();
    const newLog: ActivityLog = {
      id: 'log-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 5),
      timestamp: new Date().toISOString(),
      userName: logData.userName || this.getCurrentUser().username,
      actionType: logData.actionType,
      targetProjectCode: logData.targetProjectCode,
      targetProjectName: logData.targetProjectName,
      description: logData.description,
      details: logData.details
    };

    const updatedLogs = [newLog, ...currentLogs.slice(0, 99)]; // Keep latest 100
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updatedLogs));
    notifySubscribers('LOG_ADDED', newLog);
  },

  clearLogs() {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([]));
    notifySubscribers('LOGS_CLEARED');
  },

  // Users
  getUsers(): UserAccount[] {
    if (typeof window === 'undefined') return INITIAL_USERS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
        return INITIAL_USERS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_USERS;
    }
  },

  addUser(user: Omit<UserAccount, 'id' | 'lastLogin'>): UserAccount {
    const users = this.getUsers();
    const newUser: UserAccount = {
      ...user,
      id: 'usr-' + Date.now().toString(36),
      lastLogin: 'Belum pernah login'
    };
    const updated = [...users, newUser];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
    this.addLog({
      actionType: 'CREATE',
      description: `Menambahkan user baru: ${newUser.username} (${newUser.role})`,
      details: `Email: ${newUser.email}`
    });
    notifySubscribers('USERS_UPDATED', updated);
    return newUser;
  },

  updateUser(userId: string, updates: Partial<UserAccount>) {
    const users = this.getUsers();
    const updated = users.map((u) => (u.id === userId ? { ...u, ...updates } : u));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
    this.addLog({
      actionType: 'UPDATE',
      description: `Memperbarui profil user ID: ${userId}`,
      details: JSON.stringify(updates)
    });
    notifySubscribers('USERS_UPDATED', updated);
  },

  deleteUser(userId: string) {
    const users = this.getUsers();
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    if (target.username === 'admindsb') {
      throw new Error('User admindsb adalah administrator utama dan tidak dapat dihapus.');
    }
    const filtered = users.filter((u) => u.id !== userId);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered));
    this.addLog({
      actionType: 'DELETE',
      description: `Menghapus akun pengguna: ${target.username} (${target.fullName})`
    });
    notifySubscribers('USERS_UPDATED', filtered);
  },

  // Session
  getCurrentUser(): { username: string; role: string; fullName: string } {
    if (typeof window === 'undefined') return { username: 'admindsb', role: 'Super Admin', fullName: 'Administrator DSB' };
    try {
      const session = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (session) {
        return JSON.parse(session);
      }
    } catch {
      // ignore
    }
    return { username: 'admindsb', role: 'Super Admin', fullName: 'Administrator Utama DSB' };
  },

  setSession(user: { username: string; role: string; fullName: string }) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
    this.addLog({
      actionType: 'LOGIN',
      userName: user.username,
      description: `User ${user.username} berhasil masuk ke dashboard monitoring`,
      details: `IP Sesi Lokal | Role: ${user.role}`
    });
  },

  clearSession() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  isLoggedIn(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(STORAGE_KEYS.SESSION);
  },

  getLastSync(): string {
    if (typeof window === 'undefined') return new Date().toLocaleTimeString('id-ID');
    const sync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    if (!sync) return new Date().toLocaleTimeString('id-ID');
    try {
      return new Date(sync).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return new Date().toLocaleTimeString('id-ID');
    }
  },

  triggerSyncManual() {
    notifySubscribers('MANUAL_SYNC_TRIGGERED');
    this.addLog({
      actionType: 'SYNC',
      description: 'Sinkronisasi manual data seluruh modul DSB berhasil dijalankan'
    });
  },

  // KPI Calculations
  calculateKPI(projects: DSBProject[]): KPISummary {
    let totalPanjang = 0;
    let totalPanjangKabelFo = 0;
    let totalAksesMeter = 0;
    let totalAkses = 0;
    let totalHH = 0;
    let totalInstalHH = 0;
    let totalInstalHS = 0;
    let totalInstalHG = 0;
    let totalInstalHM = 0;
    let notYet = 0;
    let inProgress = 0;
    let cancel = 0;
    let done = 0;
    let poRelease = 0;

    projects.forEach((p) => {
      totalPanjang += Number(p.panjangGalian) || 0;
      totalPanjangKabelFo += Number(p.panjangKabelFo) || 0;
      totalAksesMeter += Number(p.aksesMeter) || 0;
      totalAkses += Number(p.totalAkses) || 0;
      
      const hh = Number(p.instalHH) || 0;
      const hs = Number(p.instalHS) || 0;
      const hg = Number(p.instalHG) || 0;
      const hm = Number(p.instalHM) || 0;
      const thh = Number(p.totalHH) || (hh + hs + hg + hm);

      totalInstalHH += hh;
      totalInstalHS += hs;
      totalInstalHG += hg;
      totalInstalHM += hm;
      totalHH += thh;

      if (p.status === 'Not Yet') notYet++;
      else if (p.status === 'In Progress') inProgress++;
      else if (p.status === 'Cancel') cancel++;
      else if (p.status === 'Done') done++;

      if (p.poStatus === 'Release' || (p.poStatus as string) === 'Released') poRelease++;
    });

    return {
      totalProjects: projects.length,
      totalPanjangGalian: totalPanjang,
      totalPanjangKabelFo,
      totalAksesMeter,
      totalAkses,
      totalHH,
      totalInstalHH,
      totalInstalHS,
      totalInstalHG,
      totalInstalHM,
      notYetCount: notYet,
      inProgressCount: inProgress,
      cancelCount: cancel,
      doneCount: done,
      poReleaseCount: poRelease
    };
  }
};
