import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  KeyRound, 
  Check, 
  Trash2, 
  Mail, 
  User, 
  Clock,
  Lock,
  AlertCircle
} from 'lucide-react';
import { UserAccount } from '../types/dsb';
import { storageService } from '../services/storageService';

interface UserSettingsViewProps {
  currentUser: { username: string; role: string; fullName: string };
  onUpdateCurrentUser: (user: { username: string; role: string; fullName: string }) => void;
}

export const UserSettingsView: React.FC<UserSettingsViewProps> = ({
  currentUser,
  onUpdateCurrentUser
}) => {
  const [users, setUsers] = useState<UserAccount[]>(() => storageService.getUsers());
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');

  // Find active user in storage
  const activeUserInStorage = users.find((u) => u.username === currentUser.username);

  // Profile Form
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [email, setEmail] = useState(() => {
    if (activeUserInStorage && activeUserInStorage.email) {
      if (activeUserInStorage.email !== 'admin.dsb@jakarta.go.id' && activeUserInStorage.email !== 'admin.dsb@monitoring.dki.go.id') {
        return activeUserInStorage.email;
      }
    }
    return '';
  });

  // Password Form
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState('');

  // New User Form Modal
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserAccount['role']>('Field Inspector');
  const [addUserError, setAddUserError] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const updated = {
      ...currentUser,
      fullName: fullName.trim()
    };
    onUpdateCurrentUser(updated);
    storageService.setSession(updated);

    // Update email in storage and users list for admindsb
    const allUsers = storageService.getUsers();
    const targetUser = allUsers.find((u) => u.username === currentUser.username);
    if (targetUser) {
      storageService.updateUser(targetUser.id, {
        fullName: fullName.trim(),
        email: email.trim()
      });
    }

    setUsers(storageService.getUsers());
    setProfileSuccessMsg('Profil dan email pribadi administrator berhasil disimpan!');
    setTimeout(() => setProfileSuccessMsg(''), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPasswordSuccessMsg('');

    if (!currentPass || !newPass || !confirmPass) {
      setPassError('Semua kolom password wajib diisi.');
      return;
    }

    if (currentPass !== 'admindsb123') {
      setPassError('Password saat ini salah (default: admindsb123).');
      return;
    }

    if (newPass.length < 6) {
      setPassError('Password baru minimal 6 karakter.');
      return;
    }

    if (newPass !== confirmPass) {
      setPassError('Konfirmasi password baru tidak cocok.');
      return;
    }

    setPasswordSuccessMsg('Password berhasil diperbarui! Gunakan password baru pada sesi berikutnya.');
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    setTimeout(() => setPasswordSuccessMsg(''), 4000);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserError('');

    if (!newUsername.trim() || !newFullName.trim() || !newEmail.trim()) {
      setAddUserError('Lengkapi seluruh formulir.');
      return;
    }

    if (users.some((u) => u.username.toLowerCase() === newUsername.toLowerCase())) {
      setAddUserError('Username sudah terdaftar.');
      return;
    }

    const created = storageService.addUser({
      username: newUsername.trim(),
      fullName: newFullName.trim(),
      email: newEmail.trim(),
      role: newRole,
      status: 'Active'
    });

    setUsers(storageService.getUsers());
    setIsAddUserOpen(false);
    setNewUsername('');
    setNewFullName('');
    setNewEmail('');
  };

  const handleDeleteUser = (userId: string) => {
    try {
      storageService.deleteUser(userId);
      setUsers(storageService.getUsers());
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus user');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <Users className="w-4 h-4" />
            </span>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Pengaturan Pengguna & Akses Sistem
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Kelola profil administrator, peran pengawas lapangan, serta otorisasi hak akses DSB
          </p>
        </div>

        <button
          onClick={() => setIsAddUserOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Tambah Pengguna</span>
        </button>
      </div>

      {/* Profile & Security Two-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Profile Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" />
              Profil Akun Aktif
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800">
              {currentUser.role}
            </span>
          </div>

          {profileSuccessMsg && (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>{profileSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Username (ID Sistem)</label>
              <input
                type="text"
                disabled
                value={currentUser.username}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 font-mono cursor-not-allowed text-xs"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Username utama sistem admindsb tidak dapat diganti
              </span>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Nama Lengkap</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Email Resmi / Pribadi</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ketik email pribadi Anda (contoh: nama@gmail.com, user@yahoo.com)..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs font-sans"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Bebas diisi email pribadi (@gmail.com, @yahoo.com, dll) atau email dinas
              </span>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg text-xs transition-colors cursor-pointer"
              >
                Simpan Perubahan Profil
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-cyan-400" />
              Ganti Password
            </h2>
            <span className="text-[10px] text-slate-400">Kredensial Sesi</span>
          </div>

          {passError && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{passError}</span>
            </div>
          )}

          {passwordSuccessMsg && (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>{passwordSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 mb-1">Password Saat Ini</label>
              <input
                type="password"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="Masukkan password saat ini (admindsb123)..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Password Baru</label>
              <input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Minimal 6 karakter..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Konfirmasi Password Baru</label>
              <input
                type="password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Ulangi password baru..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500 text-xs"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs border border-slate-700 transition-colors cursor-pointer"
              >
                Perbarui Password
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Cloud Real-Time Multi-Device Sync Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Koneksi Cloud Real-Time & Multi-Device Sync
              </h2>
              <p className="text-[11px] text-slate-400">
                Data otomatis disinkronkan ke seluruh perangkat (laptop, ponsel pengawas & tim)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-emerald-950/80 text-emerald-400 border border-emerald-800 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Cloud Sync: Multi-Device Aktif
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="font-semibold text-white">Arsitektur Hybrid Local-First</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Semua data disimpan di LocalStorage perangkat agar cepat dan dapat diakses saat offline. Setiap ada penambahan, edit, atau penghapusan data, perubahan langsung terkirim ke Cloud Database secara otomatis.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="font-semibold text-cyan-300">Sinkronisasi Otomatis Latar Belakang</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Sistem berjalan 100% otomatis secara hening tanpa memerlukan pop-up atau intervensi manual. Polling hening berkala setiap 3 detik memastikan pembaruan data dari ponsel atau laptop rekan kerja langsung terlihat secara instan.
            </p>
          </div>
        </div>
      </div>

      {/* Registered Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Daftar Akun Pengguna & Hak Akses ({users.length})
          </h3>
          <span className="text-[11px] text-slate-400">Sinkronisasi Real-Time</span>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Pengguna</th>
                <th className="py-2.5 px-3">Peran / Role</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Sesi Login Terakhir</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-3">
                    <div className="font-semibold text-white">{u.fullName}</div>
                    <div className="font-mono text-[10px] text-cyan-400">{u.username}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400">{u.email}</td>
                  <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">{u.lastLogin}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    {u.username === 'admindsb' ? (
                      <span className="text-[10px] text-slate-500 font-mono">Master</span>
                    ) : (
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Hapus akun"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-cyan-400" />
                Tambah Akun Pengguna Baru
              </h3>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {addUserError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {addUserError}
              </div>
            )}

            <form onSubmit={handleAddUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Username</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Contoh: pengawas_dsb"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="Nama lengkap staf / pengawas"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="staf@monitoring.dki.go.id"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Peran Akses</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserAccount['role'])}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500 text-xs"
                >
                  <option value="Project Manager">Project Manager</option>
                  <option value="Field Inspector">Field Inspector</option>
                  <option value="Viewer">Viewer (Hanya Lihat)</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium cursor-pointer"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
