import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Lock, User, Eye, EyeOff, ArrowRight, Activity, ThumbsUp } from 'lucide-react';
import { storageService } from '../services/storageService';

interface LoginViewProps {
  onLoginSuccess: (user: { username: string; role: string; fullName: string }) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  // Requirement: Kosongkan tampilan username dan password by default
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [thumbClicked, setThumbClicked] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Mohon masukkan username dan password Anda.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Validate credentials
      if (username.trim() === 'admindsb' && password === 'admindsb123') {
        const loggedUser = {
          username: 'admindsb',
          role: 'Super Admin',
          fullName: 'Administrator Utama DSB'
        };
        storageService.setSession(loggedUser);
        onLoginSuccess(loggedUser);
      } else {
        setIsLoading(false);
        setErrorMsg('Username atau password tidak sesuai. Pastikan username: admindsb dan password: admindsb123');
      }
    }, 450);
  };

  const handleFillDemo = () => {
    setUsername('admindsb');
    setPassword('admindsb123');
    setErrorMsg('');
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        {/* Subtle technical grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 sm:p-8"
      >
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-3 shadow-inner">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            DSB Monitoring System
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Ducting Bersama & Sarana Jaringan Utilitas Terpadu
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs leading-relaxed"
          >
            {errorMsg}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Field */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Masukkan username..."
                autoComplete="off"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Masukkan password..."
                autoComplete="off"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 cursor-pointer"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Memverifikasi...
              </span>
            ) : (
              <>
                <span>Masuk Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Quick Fill Hint */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Kredensial Akses Pengawas:</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono bg-slate-950 px-3 py-1.5 rounded border border-slate-800 flex items-center gap-2">
            <span>User: <strong className="text-slate-200">admindsb</strong></span>
            <span>·</span>
            <span>Pass: <strong className="text-slate-200">admindsb123</strong></span>
          </div>

          <button
            type="button"
            onClick={handleFillDemo}
            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors underline underline-offset-4 cursor-pointer mt-1"
          >
            Klik untuk isi otomatis form
          </button>

          {/* Interactive Thumb Feature */}
          <div className="mt-3 flex items-center justify-center">
            <button
              type="button"
              onClick={() => {
                setThumbClicked(true);
                setTimeout(() => setThumbClicked(false), 800);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-all cursor-pointer group active:scale-95"
              title="Apresiasi Sistem DSB"
            >
              <ThumbsUp
                className={`w-3.5 h-3.5 text-amber-400 transition-transform ${
                  thumbClicked ? 'scale-130 rotate-[-15deg]' : 'group-hover:scale-115'
                }`}
              />
              <span>{thumbClicked ? 'Mantap! Siap Masuk 👍' : 'DSB Monitoring Aktif'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
