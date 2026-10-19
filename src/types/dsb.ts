export type ProjectStatus = 'Not Yet' | 'In Progress' | 'Cancel' | 'Done';

export type POStatus = 'Not Yet' | 'Release' | 'Cancel';

export type DiggingMethod = 'Boring HDD' | 'Open Trench' | 'Microtrenching' | 'Kombinasi HDD & Trench';

export interface DSBProject {
  id: string;
  projectCode: string; // e.g., "DSB-2026-JKT-001"
  projectName: string;
  vendorName: string; // Nama Vendor
  segmentRelokasi: string; // Segment Relokasi (manual input)
  picGovrel: string; // PIC Govrel
  picDsb: string; // PIC DSB
  startDate: string; // Tanggal Start (YYYY-MM-DD)
  targetEndDate: string; // Tanggal End (YYYY-MM-DD)
  panjangGalian: number; // Panjang Galian (meter)
  panjangKabelFo: number; // Panjang Kabel FO (meter)
  aksesMeter: number; // Akses (meter)
  instalHH: number; // Instal HH (unit)
  instalHS: number; // Instal HS (unit)
  instalHG: number; // Instal HG (unit)
  instalHM: number; // Instal HM (unit)
  totalHH: number; // Total Handhole unit (instalHH + instalHS + instalHG + instalHM)
  status: ProjectStatus; // 'Not Yet' | 'In Progress' | 'Cancel' | 'Done'
  poStatus: POStatus; // 'Not Yet' | 'Release' | 'Cancel'
  
  // Supplementary fields
  poNumber?: string;
  poReleaseDate?: string;
  totalAkses?: number; // Akumulasi titik sambung
  kedalamanGalian?: number; // in cm
  subductType?: string; // e.g. "3-Way HDPE 40/33mm"
  diggingMethod?: DiggingMethod;
  progressPercent: number; // 0 to 100
  lokasiAwal?: string;
  lokasiAkhir?: string;
  picName?: string;
  picPhone?: string;
  catatan?: string;
  thumbsCount?: number;
  isVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type MenuType = 'dashboard' | 'project_list' | 'pengaturan' | 'log_aktivitas';

export interface ActivityLog {
  id: string;
  timestamp: string;
  userName: string;
  actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'THUMB_VERIFY' | 'LOGIN' | 'SYNC';
  targetProjectCode?: string;
  targetProjectName?: string;
  description: string;
  details?: string;
}

export interface UserAccount {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: 'Super Admin' | 'Project Manager' | 'Field Inspector' | 'Viewer';
  status: 'Active' | 'Inactive';
  lastLogin: string;
}

export interface FilterState {
  search: string;
  vendor: string;
  segment: string;
  status: string; // 'ALL' or ProjectStatus
  poStatus: string; // 'ALL' or POStatus
  picGovrel: string; // 'ALL' or PIC Govrel name
  picDsb: string; // 'ALL' or PIC DSB name
  sortBy: 'terbaru' | 'terlama' | 'galian_desc' | 'galian_asc' | 'kabel_desc' | 'akses_desc' | 'hh_desc' | 'progress_desc';
}

export interface KPISummary {
  totalProjects: number;
  totalPanjangGalian: number; // meters
  totalPanjangKabelFo: number; // meters
  totalAksesMeter: number; // meters
  totalAkses: number;
  totalHH: number;
  totalInstalHH: number;
  totalInstalHS: number;
  totalInstalHG: number;
  totalInstalHM: number;
  notYetCount: number;
  inProgressCount: number;
  cancelCount: number;
  doneCount: number;
  poReleaseCount: number;
}
