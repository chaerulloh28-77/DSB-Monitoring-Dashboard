import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { DSBProject } from '../types/dsb';

interface DeleteConfirmModalProps {
  project: DSBProject | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (projectId: string) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  project,
  isOpen,
  onClose,
  onConfirmDelete
}) => {
  if (!isOpen || !project) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-2xl shadow-2xl overflow-hidden p-6 z-10"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="flex-1">
              <h3 className="text-base font-bold text-white mb-1">
                Konfirmasi Hapus Data Proyek
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Apakah Anda yakin ingin menghapus data proyek ini dari sistem monitoring DSB?
              </p>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1 mb-4">
                <div className="font-mono text-cyan-400 font-semibold">
                  {project.projectCode}
                </div>
                <div className="text-slate-200 font-medium">
                  {project.projectName}
                </div>
                <div className="text-slate-500 text-[11px]">
                  Vendor: {project.vendorName} · Galian: {project.panjangGalian}m
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onConfirmDelete(project.id);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white text-xs font-medium transition-all flex items-center gap-1.5 shadow-md shadow-rose-900/30 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Permanen</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
