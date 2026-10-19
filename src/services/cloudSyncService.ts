import { DSBProject, ActivityLog } from '../types/dsb';

// Public default Firebase Realtime Database endpoint for instant silent auto-sync
export const DEFAULT_RTDB_URL = 'https://dsb-utilitas-default-rtdb.firebaseio.com';

// Clean/normalize Firebase Realtime Database URL
export function normalizeRtdbUrl(url: string): string {
  let cleaned = (url || '').trim();
  if (!cleaned) return DEFAULT_RTDB_URL;
  
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = 'https://' + cleaned;
  }
  
  cleaned = cleaned.replace(/\/+$/, '');
  cleaned = cleaned.replace(/\.json$/, '');
  cleaned = cleaned.replace(/\/projects$/, '');
  cleaned = cleaned.replace(/\/logs$/, '');
  
  return cleaned;
}

class CloudSyncService {
  private syncTimer: NodeJS.Timeout | null = null;
  private isSyncingNow: boolean = false;
  private lastKnownCloudHash: string = '';

  public getRtdbUrl(): string {
    if (typeof window === 'undefined') return DEFAULT_RTDB_URL;
    const stored = localStorage.getItem('dsb_firebase_rtdb_url');
    if (stored && stored.trim()) {
      return normalizeRtdbUrl(stored);
    }
    localStorage.setItem('dsb_firebase_rtdb_url', DEFAULT_RTDB_URL);
    return DEFAULT_RTDB_URL;
  }

  public isEnabled(): boolean {
    return true;
  }

  public getLastSyncTime(): string {
    if (typeof window === 'undefined') return new Date().toLocaleTimeString('id-ID');
    const sync = localStorage.getItem('dsb_last_cloud_sync_time');
    if (!sync) return new Date().toLocaleTimeString('id-ID');
    try {
      return new Date(sync).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return new Date().toLocaleTimeString('id-ID');
    }
  }

  private setLastSyncTime(timeIso: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('dsb_last_cloud_sync_time', timeIso);
  }

  /**
   * Pull projects & logs silently from Cloud Database
   */
  public async pullFromCloud(): Promise<{ projects: DSBProject[] | null; logs: ActivityLog[] | null; success: boolean }> {
    const targetUrl = this.getRtdbUrl();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const resProj = await fetch(`${targetUrl}/projects.json`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!resProj.ok) {
        return { projects: null, logs: null, success: false };
      }

      const projData = await resProj.json();
      let cloudProjects: DSBProject[] = [];

      if (Array.isArray(projData)) {
        cloudProjects = projData.filter(Boolean);
      } else if (projData && typeof projData === 'object') {
        cloudProjects = Object.values(projData).filter(Boolean) as DSBProject[];
      }

      let cloudLogs: ActivityLog[] = [];
      try {
        const resLogs = await fetch(`${targetUrl}/logs.json`);
        if (resLogs.ok) {
          const logsData = await resLogs.json();
          if (Array.isArray(logsData)) {
            cloudLogs = logsData.filter(Boolean);
          } else if (logsData && typeof logsData === 'object') {
            cloudLogs = Object.values(logsData).filter(Boolean) as ActivityLog[];
          }
        }
      } catch {
        // Silently catch
      }

      this.setLastSyncTime(new Date().toISOString());

      return {
        projects: cloudProjects.length > 0 ? cloudProjects : null,
        logs: cloudLogs.length > 0 ? cloudLogs : null,
        success: true
      };
    } catch {
      return { projects: null, logs: null, success: false };
    }
  }

  /**
   * Push current local projects & logs silently to Cloud Database
   */
  public async pushToCloud(projects: DSBProject[], logs?: ActivityLog[]): Promise<boolean> {
    const targetUrl = this.getRtdbUrl();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const projObj: Record<string, DSBProject> = {};
      projects.forEach((p) => {
        if (p && p.id) {
          projObj[p.id] = p;
        }
      });

      const resProj = await fetch(`${targetUrl}/projects.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projObj),
        signal: controller.signal
      });

      if (logs && logs.length > 0) {
        const logsObj: Record<string, ActivityLog> = {};
        logs.slice(0, 100).forEach((l) => {
          if (l && l.id) {
            logsObj[l.id] = l;
          }
        });
        await fetch(`${targetUrl}/logs.json`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logsObj),
          signal: controller.signal
        }).catch(() => {});
      }

      clearTimeout(timeoutId);

      if (resProj.ok) {
        this.setLastSyncTime(new Date().toISOString());
        this.lastKnownCloudHash = JSON.stringify(projects.map(p => ({ id: p.id, updated: p.updatedAt, thumbs: p.thumbsCount, status: p.status })));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Silent background polling loop (runs every 3 seconds)
   */
  public startAutoSync(onRemoteDataReceived: (projects: DSBProject[], logs?: ActivityLog[]) => void): () => void {
    if (this.syncTimer) clearInterval(this.syncTimer);

    const checkCloud = async () => {
      if (this.isSyncingNow) return;
      const targetUrl = this.getRtdbUrl();

      this.isSyncingNow = true;

      try {
        const res = await fetch(`${targetUrl}/projects.json`, { cache: 'no-store' });
        if (res.ok) {
          const raw = await res.json();
          if (raw) {
            let cloudProjects: DSBProject[] = [];
            if (Array.isArray(raw)) {
              cloudProjects = raw.filter(Boolean);
            } else if (typeof raw === 'object') {
              cloudProjects = Object.values(raw).filter(Boolean) as DSBProject[];
            }

            if (cloudProjects.length > 0) {
              const currentHash = JSON.stringify(cloudProjects.map(p => ({ id: p.id, updated: p.updatedAt, thumbs: p.thumbsCount, status: p.status })));
              if (currentHash !== this.lastKnownCloudHash) {
                this.lastKnownCloudHash = currentHash;
                this.setLastSyncTime(new Date().toISOString());

                let cloudLogs: ActivityLog[] | undefined = undefined;
                try {
                  const logRes = await fetch(`${targetUrl}/logs.json`, { cache: 'no-store' });
                  if (logRes.ok) {
                    const rawLogs = await logRes.json();
                    if (Array.isArray(rawLogs)) cloudLogs = rawLogs.filter(Boolean);
                    else if (typeof rawLogs === 'object') cloudLogs = Object.values(rawLogs).filter(Boolean) as ActivityLog[];
                  }
                } catch {
                  // ignore
                }

                onRemoteDataReceived(cloudProjects, cloudLogs);
              }
            }
          }
        }
      } catch {
        // Silent catch
      } finally {
        this.isSyncingNow = false;
      }
    };

    // Immediate initial check after 500ms
    const initialTimeout = setTimeout(() => {
      checkCloud();
    }, 500);

    // Silent polling every 3 seconds (3000ms)
    this.syncTimer = setInterval(checkCloud, 3000);

    return () => {
      clearTimeout(initialTimeout);
      if (this.syncTimer) clearInterval(this.syncTimer);
    };
  }
}

export const cloudSyncService = new CloudSyncService();
