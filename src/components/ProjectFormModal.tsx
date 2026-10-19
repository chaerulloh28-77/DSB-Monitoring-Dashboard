import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Save, 
  Plus, 
  Edit3, 
  AlertCircle, 
  Building2, 
  MapPin, 
  Calendar, 
  UserCheck, 
  Ruler, 
  Box, 
  FileCheck, 
  Clock, 
  TrendingUp, 
  Cable, 
  Share2 
} from 'lucide-react';
import { DSBProject, ProjectStatus, POStatus } from '../types/dsb';
import { VENDORS_LIST, PIC_GOVREL_OPTIONS, PIC_DSB_OPTIONS } from '../data/initialData';
import { VendorBadge } from './VendorBadge';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectData: any) => void;
  initialProject?: DSBProject | null;
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialProject
}) => {
  const isEditing = !!initialProject;

  const [formData, setFormData] = useState({
    projectCode: '',
    projectName: '',
    vendorName: VENDORS_LIST[0],
    segmentRelokasi: '',
    picGovrel: PIC_GOVREL_OPTIONS[0],
    picDsb: PIC_DSB_OPTIONS[0],
    startDate: new Date().toISOString().split('T')[0],
    targetEndDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
    panjangGalian: 1500,
    panjangKabelFo: 1750,
    aksesMeter: 600,
    instalHH: 12,
    instalHS: 4,
    instalHG: 3,
    instalHM: 2,
    status: 'In Progress' as ProjectStatus,
    poStatus: 'Release' as POStatus,
    progressPercent: 25,
    catatan: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialProject) {
      // Normalize PO status to 'Not Yet' | 'Release' | 'Cancel'
      let poSt: POStatus = 'Release';
      if (initialProject.poStatus === 'Release' || (initialProject.poStatus as string) === 'Released') {
        poSt = 'Release';
      } else if (initialProject.poStatus === 'Cancel' || (initialProject.poStatus as string) === 'Revisi PO') {
        poSt = 'Cancel';
      } else {
        poSt = 'Not Yet';
      }

      setFormData({
        projectCode: initialProject.projectCode || '',
        projectName: initialProject.projectName || '',
        vendorName: initialProject.vendorName || VENDORS_LIST[0],
        segmentRelokasi: initialProject.segmentRelokasi || '',
        picGovrel: initialProject.picGovrel || PIC_GOVREL_OPTIONS[0],
        picDsb: initialProject.picDsb || PIC_DSB_OPTIONS[0],
        startDate: initialProject.startDate || new Date().toISOString().split('T')[0],
        targetEndDate: initialProject.targetEndDate || new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
        panjangGalian: Number(initialProject.panjangGalian) || 0,
        panjangKabelFo: Number(initialProject.panjangKabelFo) || Math.round((Number(initialProject.panjangGalian) || 1000) * 1.15),
        aksesMeter: Number(initialProject.aksesMeter) || Math.round((Number(initialProject.panjangGalian) || 1000) * 0.4),
        instalHH: Number(initialProject.instalHH) || 10,
        instalHS: Number(initialProject.instalHS) || 4,
        instalHG: Number(initialProject.instalHG) || 2,
        instalHM: Number(initialProject.instalHM) || 2,
        status: initialProject.status || 'In Progress',
        poStatus: poSt,
        progressPercent: Number(initialProject.progressPercent) || 0,
        catatan: initialProject.catatan || ''
      });
    } else {
      const randomCode = `DSB-2026-JKT-${Math.floor(100 + Math.random() * 900)}`;
      setFormData({
        projectCode: randomCode,
        projectName: '',
        vendorName: VENDORS_LIST[0],
        segmentRelokasi: '',
        picGovrel: PIC_GOVREL_OPTIONS[0],
        picDsb: PIC_DSB_OPTIONS[0],
        startDate: new Date().toISOString().split('T')[0],
        targetEndDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
        panjangGalian: 2000,
        panjangKabelFo: 2300,
        aksesMeter: 800,
        instalHH: 14,
        instalHS: 5,
        instalHG: 3,
        instalHM: 2,
        status: 'In Progress',
        poStatus: 'Release',
        progressPercent: 15,
        catatan: ''
      });
    }
    setErrors({});
  }, [initialProject, isOpen]);

  if (!isOpen) return null;

  const totalCalculatedHH = 
    (Number(formData.instalHH) || 0) +
    (Number(formData.instalHS) || 0) +
    (Number(formData.instalHG) || 0) +
    (Number(formData.instalHM) || 0);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.vendorName.trim()) {
      newErrors.vendorName = 'Nama vendor wajib diisi.';
    }
    if (!formData.segmentRelokasi.trim()) {
      newErrors.segmentRelokasi = 'Segment Relokasi wajib diisi manual.';
    }
    if (!formData.picGovrel.trim()) {
      newErrors.picGovrel = 'PIC Govrel wajib diisi.';
    }
    if (!formData.picDsb.trim()) {
      newErrors.picDsb = 'PIC DSB wajib diisi.';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Tanggal start wajib ditentukan.';
    }
    if (!formData.targetEndDate) {
      newErrors.targetEndDate = 'Tanggal end wajib ditentukan.';
    }
    if (formData.startDate && formData.targetEndDate && formData.startDate > formData.targetEndDate) {
      newErrors.targetEndDate = 'Tanggal end tidak boleh lebih awal dari tanggal start.';
    }
    if (Number(formData.panjangGalian) <= 0) {
      newErrors.panjangGalian = 'Panjang galian harus lebih dari 0 meter.';
    }
    if (Number(formData.panjangKabelFo) < 0) {
      newErrors.panjangKabelFo = 'Panjang kabel FO tidak boleh negatif.';
    }
    if (Number(formData.aksesMeter) < 0) {
      newErrors.aksesMeter = 'Akses meter tidak boleh negatif.';
    }
    if (Number(formData.instalHH) < 0) newErrors.instalHH = 'Unit HH tidak boleh negatif.';
    if (Number(formData.instalHS) < 0) newErrors.instalHS = 'Unit HS tidak boleh negatif.';
    if (Number(formData.instalHG) < 0) newErrors.instalHG = 'Unit HG tidak boleh negatif.';
    if (Number(formData.instalHM) < 0) newErrors.instalHM = 'Unit HM tidak boleh negatif.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      projectCode: formData.projectCode || `DSB-2026-JKT-${Math.floor(100 + Math.random() * 900)}`,
      projectName: formData.projectName.trim() || `Pekerjaan Utilitas ${formData.segmentRelokasi}`,
      vendorName: formData.vendorName,
      segmentRelokasi: formData.segmentRelokasi,
      picGovrel: formData.picGovrel,
      picDsb: formData.picDsb,
      startDate: formData.startDate,
      targetEndDate: formData.targetEndDate,
      panjangGalian: Number(formData.panjangGalian),
      panjangKabelFo: Number(formData.panjangKabelFo),
      aksesMeter: Number(formData.aksesMeter),
      instalHH: Number(formData.instalHH),
      instalHS: Number(formData.instalHS),
      instalHG: Number(formData.instalHG),
      instalHM: Number(formData.instalHM),
      totalHH: totalCalculatedHH,
      status: formData.status,
      poStatus: formData.poStatus,
      progressPercent: formData.status === 'Done' ? 100 : Number(formData.progressPercent),
      catatan: formData.catatan
    };

    if (isEditing && initialProject) {
      onSubmit({
        ...initialProject,
        ...payload
      });
    } else {
      onSubmit(payload);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6 z-10 max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                {isEditing ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {isEditing ? `Edit Data Proyek: ${formData.projectCode}` : 'Input Data Proyek Baru'}
                </h2>
                <p className="text-xs text-slate-400">
                  {isEditing 
                    ? 'Perbarui parameter teknis, PIC, jadwal, volume galian & kabel, serta instalasi HH' 
                    : 'Lengkapi formulir terpadu proyek utilitas bawah tanah DSB'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body (Scrollable) */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
            {/* Section 1: Vendor & Segment Relokasi */}
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 space-y-3">
              <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4" /> 1. Vendor & Segment Relokasi
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nama Vendor */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Nama Vendor <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.vendorName}
                    onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {VENDORS_LIST.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                  {errors.vendorName && (
                    <p className="text-rose-400 text-[11px] mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.vendorName}
                    </p>
                  )}
                </div>

                {/* Segment Relokasi (Diisi Manual) */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Segment Relokasi <span className="text-rose-400">*</span>
                    <span className="text-[10px] text-cyan-400 font-normal ml-1.5">(Diisi Manual)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.segmentRelokasi}
                    onChange={(e) => setFormData({ ...formData, segmentRelokasi: e.target.value })}
                    placeholder="Contoh: Segmen 1: Jl. Jend. Sudirman - Bundaran HI"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  {errors.segmentRelokasi && (
                    <p className="text-rose-400 text-[11px] mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.segmentRelokasi}
                    </p>
                  )}
                </div>
              </div>

              {/* Optional Project Name & Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/60">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Nama Proyek / Uraian Pekerjaan
                  </label>
                  <input
                    type="text"
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    placeholder="Contoh: Relokasi Kabel Bawah Tanah Koridor Utama"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Kode Project
                  </label>
                  <input
                    type="text"
                    value={formData.projectCode}
                    onChange={(e) => setFormData({ ...formData, projectCode: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Person In Charge (PIC Govrel & PIC DSB) */}
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 space-y-3">
              <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4" /> 2. Person In Charge (PIC)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* PIC Govrel */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    PIC Govrel <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.picGovrel}
                    onChange={(e) => setFormData({ ...formData, picGovrel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
                  >
                    {PIC_GOVREL_OPTIONS.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  {errors.picGovrel && (
                    <p className="text-rose-400 text-[11px] mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.picGovrel}
                    </p>
                  )}
                </div>

                {/* PIC DSB */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    PIC DSB <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.picDsb}
                    onChange={(e) => setFormData({ ...formData, picDsb: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
                  >
                    {PIC_DSB_OPTIONS.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  {errors.picDsb && (
                    <p className="text-rose-400 text-[11px] mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.picDsb}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Timeline (Tanggal Start & Tanggal End) */}
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 space-y-3">
              <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4" /> 3. Jadwal Pelaksanaan (Start & End)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tanggal Start */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Tanggal Start <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  {errors.startDate && (
                    <p className="text-rose-400 text-[11px] mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.startDate}
                    </p>
                  )}
                </div>

                {/* Tanggal End */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Tanggal End <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.targetEndDate}
                    onChange={(e) => setFormData({ ...formData, targetEndDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  {errors.targetEndDate && (
                    <p className="text-rose-400 text-[11px] mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.targetEndDate}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 4: Volume & Metrik Teknis (Galian, Kabel FO, Akses) */}
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 space-y-3">
              <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Ruler className="w-4 h-4" /> 4. Volume Rute & Kabel (Meter)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Panjang Galian meter */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Panjang Galian (meter) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={formData.panjangGalian}
                      onChange={(e) => setFormData({ ...formData, panjangGalian: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-500 font-mono">m</span>
                  </div>
                  {errors.panjangGalian && (
                    <p className="text-rose-400 text-[11px] mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.panjangGalian}
                    </p>
                  )}
                </div>

                {/* Panjang Kabel FO meter */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Panjang Kabel FO (meter) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={formData.panjangKabelFo}
                      onChange={(e) => setFormData({ ...formData, panjangKabelFo: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-500 font-mono">m</span>
                  </div>
                  {errors.panjangKabelFo && (
                    <p className="text-rose-400 text-[11px] mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.panjangKabelFo}
                    </p>
                  )}
                </div>

                {/* Akses meter */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Akses (meter) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={formData.aksesMeter}
                      onChange={(e) => setFormData({ ...formData, aksesMeter: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-500 font-mono">m</span>
                  </div>
                  {errors.aksesMeter && (
                    <p className="text-rose-400 text-[11px] mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.aksesMeter}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 5: Instal Handhole (HH, HS, HG, HM Unit) */}
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                  <Box className="w-4 h-4" /> 5. Instalasi Handhole (Unit)
                </h3>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-semibold">
                  Total Handhole: {totalCalculatedHH} Unit
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Instal HH */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Instal HH (Unit)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.instalHH}
                    onChange={(e) => setFormData({ ...formData, instalHH: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-[10px] text-slate-500 block mt-0.5">Handhole Standar</span>
                </div>

                {/* Instal HS */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Instal HS (Unit)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.instalHS}
                    onChange={(e) => setFormData({ ...formData, instalHS: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-[10px] text-slate-500 block mt-0.5">Handhole Special</span>
                </div>

                {/* Instal HG */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Instal HG (Unit)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.instalHG}
                    onChange={(e) => setFormData({ ...formData, instalHG: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-[10px] text-slate-500 block mt-0.5">Handhole Garden</span>
                </div>

                {/* Instal HM */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Instal HM (Unit)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.instalHM}
                    onChange={(e) => setFormData({ ...formData, instalHM: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-[10px] text-slate-500 block mt-0.5">Handhole Manhole</span>
                </div>
              </div>
            </div>

            {/* Section 6: Status Proyek & Status PO */}
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 space-y-3">
              <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <FileCheck className="w-4 h-4" /> 6. Status Proyek & Status PO
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Status Project */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Status Project <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => {
                      const newSt = e.target.value as ProjectStatus;
                      setFormData({ 
                        ...formData, 
                        status: newSt,
                        progressPercent: newSt === 'Done' ? 100 : newSt === 'Not Yet' ? 0 : formData.progressPercent
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Not Yet">Not Yet</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Cancel">Cancel</option>
                    <option value="Done">Done</option>
                  </select>
                </div>

                {/* Status PO */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Status PO <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.poStatus}
                    onChange={(e) => setFormData({ ...formData, poStatus: e.target.value as POStatus })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Not Yet">Not Yet</option>
                    <option value="Release">Release</option>
                    <option value="Cancel">Cancel</option>
                  </select>
                </div>
              </div>

              {/* Progress Percent Slider */}
              <div className="pt-2 border-t border-slate-800/60">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Progres Fisik Lapangan:</span>
                  <span className="font-mono text-cyan-400 font-bold">{formData.progressPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.progressPercent}
                  onChange={(e) => setFormData({ ...formData, progressPercent: Number(e.target.value) })}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Catatan Lapangan */}
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Catatan Teknis / Kondisi Lapangan (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  placeholder="Catatan koordinasi, kondisi tanah, perizinan, atau kendala..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </form>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-cyan-950 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Simpan Perubahan' : 'Simpan Data Proyek'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
