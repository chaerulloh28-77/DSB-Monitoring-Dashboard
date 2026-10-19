import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PieChart as PieIcon, 
  BarChart3, 
  Layers, 
  Ruler, 
  Share2, 
  Box, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  XCircle, 
  ExternalLink,
  ChevronRight,
  Info,
  Building2,
  HardHat,
  RotateCcw
} from 'lucide-react';
import { DSBProject, ProjectStatus, KPISummary } from '../types/dsb';
import { VendorBadge } from './VendorBadge';

interface ProjectChartsProps {
  projects: DSBProject[];
  summary: KPISummary;
  activeStatusFilter: string;
  activeSegmentFilter: string;
  onFilterByStatus: (status: string) => void;
  onFilterBySegment: (segment: string) => void;
  onSelectProject: (project: DSBProject) => void;
}

export const ProjectCharts: React.FC<ProjectChartsProps> = ({
  projects,
  summary,
  activeStatusFilter,
  activeSegmentFilter,
  onFilterByStatus,
  onFilterBySegment,
  onSelectProject
}) => {
  const [activeTab, setActiveTab] = useState<'both' | 'pie' | 'bar'>('both');
  const [barGrouping, setBarGrouping] = useState<'segment' | 'vendor' | 'method'>('segment');
  
  // Pie state
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);
  const [clickedStatus, setClickedStatus] = useState<ProjectStatus | null>(null);
  
  // Bar state
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [clickedBarItem, setClickedBarItem] = useState<string | null>(null);

  const formatNum = (num: number) => num.toLocaleString('id-ID');
  const formatKm = (meters: number) => (meters / 1000).toFixed(2) + ' km';

  // 1. Data for Pie Chart (Status Distribution)
  const statusData: {
    status: ProjectStatus;
    label: string;
    count: number;
    color: string;
    hoverColor: string;
    meters: number;
    akses: number;
    hh: number;
  }[] = [
    {
      status: 'Done',
      label: 'Done',
      count: summary.doneCount,
      color: '#10b981', // emerald-500
      hoverColor: '#34d399',
      meters: projects.filter((p) => p.status === 'Done').reduce((acc, p) => acc + p.panjangGalian, 0),
      akses: projects.filter((p) => p.status === 'Done').reduce((acc, p) => acc + (p.totalAkses || 0), 0),
      hh: projects.filter((p) => p.status === 'Done').reduce((acc, p) => acc + p.totalHH, 0)
    },
    {
      status: 'In Progress',
      label: 'In Progress',
      count: summary.inProgressCount,
      color: '#3b82f6', // blue-500
      hoverColor: '#60a5fa',
      meters: projects.filter((p) => p.status === 'In Progress').reduce((acc, p) => acc + p.panjangGalian, 0),
      akses: projects.filter((p) => p.status === 'In Progress').reduce((acc, p) => acc + (p.totalAkses || 0), 0),
      hh: projects.filter((p) => p.status === 'In Progress').reduce((acc, p) => acc + p.totalHH, 0)
    },
    {
      status: 'Not Yet',
      label: 'Not Yet',
      count: summary.notYetCount,
      color: '#94a3b8', // slate-400
      hoverColor: '#cbd5e1',
      meters: projects.filter((p) => p.status === 'Not Yet').reduce((acc, p) => acc + p.panjangGalian, 0),
      akses: projects.filter((p) => p.status === 'Not Yet').reduce((acc, p) => acc + (p.totalAkses || 0), 0),
      hh: projects.filter((p) => p.status === 'Not Yet').reduce((acc, p) => acc + p.totalHH, 0)
    },
    {
      status: 'Cancel',
      label: 'Cancel',
      count: summary.cancelCount,
      color: '#f43f5e', // rose-500
      hoverColor: '#fb7185',
      meters: projects.filter((p) => p.status === 'Cancel').reduce((acc, p) => acc + p.panjangGalian, 0),
      akses: projects.filter((p) => p.status === 'Cancel').reduce((acc, p) => acc + (p.totalAkses || 0), 0),
      hh: projects.filter((p) => p.status === 'Cancel').reduce((acc, p) => acc + p.totalHH, 0)
    }
  ];

  const totalPieCount = summary.totalProjects || 1;

  // SVG Pie Math
  let cumulativeAngle = 0;
  const pieSlices = statusData.map((item) => {
    const fraction = item.count / totalPieCount;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + fraction * 360;
    cumulativeAngle = endAngle;

    const radius = 70;
    const innerRadius = 42;
    const cx = 100;
    const cy = 100;

    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const x3 = cx + innerRadius * Math.cos(endRad);
    const y3 = cy + innerRadius * Math.sin(endRad);
    const x4 = cx + innerRadius * Math.cos(startRad);
    const y4 = cy + innerRadius * Math.sin(startRad);

    const largeArc = fraction > 0.5 ? 1 : 0;

    const pathData =
      item.count === 0
        ? ''
        : fraction >= 0.999
        ? `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.001} ${cy - radius} L ${cx - 0.001} ${cy - innerRadius} A ${innerRadius} ${innerRadius} 0 1 0 ${cx} ${cy - innerRadius} Z`
        : `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;

    const percentage = Math.round(fraction * 100);

    return {
      ...item,
      pathData,
      percentage
    };
  });

  // 2. Data for Vertical Bar Chart (Diagram Batang Vertikal)
  let verticalBarData: {
    key: string;
    label: string;
    shortLabel: string;
    meters: number;
    count: number;
    akses: number;
    hh: number;
    projects: DSBProject[];
  }[] = [];

  if (barGrouping === 'segment') {
    const map: { [key: string]: { meters: number; count: number; akses: number; hh: number; projects: DSBProject[] } } = {};
    projects.forEach((p) => {
      const seg = p.segmentRelokasi || 'Belum Ditentukan';
      if (!map[seg]) map[seg] = { meters: 0, count: 0, akses: 0, hh: 0, projects: [] };
      map[seg].meters += p.panjangGalian;
      map[seg].count += 1;
      map[seg].akses += (p.totalAkses || 0);
      map[seg].hh += p.totalHH;
      map[seg].projects.push(p);
    });

    verticalBarData = Object.entries(map).map(([seg, d]) => {
      // Shorten label for clean display under vertical bar
      const short = seg.replace(/^Segmen \d+:\s*/i, '').replace(/Jl\.\s*/i, '');
      return {
        key: seg,
        label: seg,
        shortLabel: short.length > 14 ? short.substring(0, 12) + '...' : short,
        ...d
      };
    });
  } else if (barGrouping === 'vendor') {
    const map: { [key: string]: { meters: number; count: number; akses: number; hh: number; projects: DSBProject[] } } = {};
    projects.forEach((p) => {
      const ven = p.vendorName || 'Lainnya';
      if (!map[ven]) map[ven] = { meters: 0, count: 0, akses: 0, hh: 0, projects: [] };
      map[ven].meters += p.panjangGalian;
      map[ven].count += 1;
      map[ven].akses += (p.totalAkses || 0);
      map[ven].hh += p.totalHH;
      map[ven].projects.push(p);
    });

    verticalBarData = Object.entries(map).map(([ven, d]) => ({
      key: ven,
      label: ven,
      shortLabel: ven.length > 12 ? ven.substring(0, 10) + '...' : ven,
      ...d
    }));
  } else {
    // By Digging Method
    const map: { [key: string]: { meters: number; count: number; akses: number; hh: number; projects: DSBProject[] } } = {};
    projects.forEach((p) => {
      const m = p.diggingMethod || 'Boring HDD';
      if (!map[m]) map[m] = { meters: 0, count: 0, akses: 0, hh: 0, projects: [] };
      map[m].meters += p.panjangGalian;
      map[m].count += 1;
      map[m].akses += (p.totalAkses || 0);
      map[m].hh += p.totalHH;
      map[m].projects.push(p);
    });

    verticalBarData = Object.entries(map).map(([m, d]) => ({
      key: m,
      label: m,
      shortLabel: m,
      ...d
    }));
  }

  // Sort descending by meters
  verticalBarData.sort((a, b) => b.meters - a.meters);

  const maxBarMeters = Math.max(...verticalBarData.map((b) => b.meters), 1);
  // Round up max for Y-axis scale (e.g. 3500 -> 4000)
  const yAxisMax = Math.ceil(maxBarMeters / 1000) * 1000 || 1000;
  const yAxisSteps = [yAxisMax, Math.round(yAxisMax * 0.75), Math.round(yAxisMax * 0.5), Math.round(yAxisMax * 0.25), 0];

  // Handle Pie Slice Click
  const handleSliceClick = (status: ProjectStatus) => {
    if (clickedStatus === status) {
      setClickedStatus(null);
      onFilterByStatus('ALL');
    } else {
      setClickedStatus(status);
      onFilterByStatus(status);
    }
  };

  // Handle Vertical Bar Click
  const handleBarClick = (key: string) => {
    if (clickedBarItem === key) {
      setClickedBarItem(null);
      if (barGrouping === 'segment') onFilterBySegment('ALL');
    } else {
      setClickedBarItem(key);
      if (barGrouping === 'segment') onFilterBySegment(key);
    }
  };

  // Active item details for information panel
  const activeBarDetail = clickedBarItem
    ? verticalBarData.find((b) => b.key === clickedBarItem)
    : null;

  const activeStatusProjects = clickedStatus
    ? projects.filter((p) => p.status === clickedStatus)
    : [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-6">
      {/* Top Header & View Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <BarChart3 className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Diagram & Grafik Interaktif DSB
            </h2>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="inline-flex rounded-lg border border-slate-800 p-0.5 bg-slate-950 shrink-0">
          <button
            onClick={() => setActiveTab('both')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'both' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Semua Grafik
          </button>
          <button
            onClick={() => setActiveTab('pie')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'pie' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pie Status
          </button>
          <button
            onClick={() => setActiveTab('bar')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'bar' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Batang Vertikal
          </button>
        </div>
      </div>

      {/* Main Charts Layout */}
      <div className={`grid gap-6 ${activeTab === 'both' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
        
        {/* 1. PIE CHART SECTION */}
        {(activeTab === 'both' || activeTab === 'pie') && (
          <div className={`${activeTab === 'both' ? 'lg:col-span-5' : 'w-full'} bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between`}>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <PieIcon className="w-4 h-4 text-cyan-400" />
                  Komposisi Status Proyek
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {summary.totalProjects} Proyek
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                Klik irisan donat untuk rincian data akurat sesuai status.
              </p>

              {/* Donut Graphic */}
              <div className="relative flex items-center justify-center my-3">
                <svg viewBox="0 0 200 200" className="w-52 h-52 transform -rotate-90">
                  {pieSlices.map((slice) => {
                    if (!slice.pathData) return null;
                    const isHovered = hoveredSlice === slice.status;
                    const isClicked = clickedStatus === slice.status || activeStatusFilter === slice.status;

                    return (
                      <path
                        key={slice.status}
                        d={slice.pathData}
                        fill={isHovered ? slice.hoverColor : slice.color}
                        stroke="#090d16"
                        strokeWidth={isClicked ? '3.5' : '1.5'}
                        className="cursor-pointer transition-all duration-200"
                        onMouseEnter={() => setHoveredSlice(slice.status)}
                        onMouseLeave={() => setHoveredSlice(null)}
                        onClick={() => handleSliceClick(slice.status)}
                        style={{
                          transformOrigin: '100px 100px',
                          transform: isHovered || isClicked ? 'scale(1.05)' : 'scale(1)'
                        }}
                      />
                    );
                  })}
                </svg>

                {/* Center Label in Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Status</span>
                  <span className="text-xl font-extrabold text-white font-mono tabular-nums leading-none mt-1">
                    {hoveredSlice || clickedStatus || (activeStatusFilter !== 'ALL' ? activeStatusFilter : `${summary.totalProjects}`)}
                  </span>
                  <span className="text-[11px] text-cyan-400 font-mono mt-1 font-semibold">
                    {hoveredSlice
                      ? `${statusData.find((s) => s.status === hoveredSlice)?.count} Paket Proyek`
                      : 'Paket Pekerjaan'}
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Legend with Click Filter Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/80">
              {pieSlices.map((slice) => {
                const isSelected = activeStatusFilter === slice.status || clickedStatus === slice.status;
                return (
                  <button
                    key={slice.status}
                    onClick={() => handleSliceClick(slice.status)}
                    onMouseEnter={() => setHoveredSlice(slice.status)}
                    onMouseLeave={() => setHoveredSlice(null)}
                    className={`p-2.5 rounded-xl text-left transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-slate-800 border-cyan-500 shadow-md ring-1 ring-cyan-500/40'
                        : 'bg-slate-900/70 border-slate-800/70 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: slice.color }}
                        />
                        <span className="font-bold text-slate-200 text-xs">{slice.label}</span>
                      </div>
                      <span className="font-mono text-cyan-300 font-extrabold text-xs tabular-nums">
                        {slice.percentage}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{slice.count} Proyek</span>
                      <span>{formatNum(slice.meters)}m</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. DIAGRAM BATANG VERTIKAL (VERTICAL BAR CHART) */}
        {(activeTab === 'both' || activeTab === 'bar') && (
          <div className={`${activeTab === 'both' ? 'lg:col-span-7' : 'w-full'} bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between`}>
            <div>
              {/* Header with Grouping Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-cyan-400" />
                    Diagram Batang Vertikal: Panjang Galian (Meter)
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Tinggi kolom vertikal sebanding dengan meter galian. Klik batang untuk info akurat.
                  </p>
                </div>

                {/* Sub-grouping Pills */}
                <div className="inline-flex rounded-lg border border-slate-800 p-0.5 bg-slate-900 shrink-0 self-start sm:self-auto">
                  <button
                    onClick={() => {
                      setBarGrouping('segment');
                      setClickedBarItem(null);
                    }}
                    className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                      barGrouping === 'segment' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Segmen
                  </button>
                  <button
                    onClick={() => {
                      setBarGrouping('vendor');
                      setClickedBarItem(null);
                    }}
                    className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                      barGrouping === 'vendor' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Vendor
                  </button>
                  <button
                    onClick={() => {
                      setBarGrouping('method');
                      setClickedBarItem(null);
                    }}
                    className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                      barGrouping === 'method' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Metode
                  </button>
                </div>
              </div>

              {/* VERTICAL BAR CHART STAGE */}
              <div className="relative pt-6 pb-2 mt-4 bg-slate-900/30 rounded-xl border border-slate-800/60 p-3">
                {/* Horizontal Background Guidelines (Y-Axis Grids) */}
                <div className="absolute inset-x-12 top-6 bottom-16 flex flex-col justify-between pointer-events-none z-0">
                  {yAxisSteps.map((val, idx) => (
                    <div key={idx} className="w-full flex items-center gap-2">
                      <div className="w-full border-b border-slate-800/80 border-dashed" />
                    </div>
                  ))}
                </div>

                {/* Vertical Columns Container */}
                <div className="relative z-10 flex items-end justify-around gap-2 sm:gap-3 h-64 pl-8 sm:pl-12 pr-2">
                  {/* Y-Axis Labels Column on Far Left */}
                  <div className="absolute left-1 top-6 bottom-16 flex flex-col justify-between text-[10px] font-mono text-slate-500 tabular-nums pointer-events-none select-none text-right w-8 sm:w-10">
                    {yAxisSteps.map((val, idx) => (
                      <span key={idx}>{val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}m</span>
                    ))}
                  </div>

                  {/* Render Each Vertical Bar */}
                  {verticalBarData.map((item, idx) => {
                    const heightPercent = yAxisMax > 0 ? (item.meters / yAxisMax) * 100 : 0;
                    const isSelected = clickedBarItem === item.key || activeSegmentFilter === item.key;
                    const isHovered = hoveredBarIndex === idx;

                    return (
                      <div
                        key={item.key}
                        onClick={() => handleBarClick(item.key)}
                        onMouseEnter={() => setHoveredBarIndex(idx)}
                        onMouseLeave={() => setHoveredBarIndex(null)}
                        className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer max-w-[72px]"
                      >
                        {/* Hover Tooltip / Meter Value on Top of Column */}
                        <div className={`mb-1.5 text-center transition-all duration-200 select-none ${
                          isSelected || isHovered ? 'opacity-100 -translate-y-1' : 'opacity-80'
                        }`}>
                          <span className={`text-[10px] font-mono font-bold px-1 py-0.5 rounded tabular-nums whitespace-nowrap ${
                            isSelected
                              ? 'bg-cyan-500 text-slate-950 shadow-sm'
                              : isHovered
                              ? 'bg-slate-800 text-cyan-300'
                              : 'text-slate-300'
                          }`}>
                            {formatNum(item.meters)}m
                          </span>
                        </div>

                        {/* The Actual Vertical Column Bar */}
                        <div className="w-full relative flex items-end justify-center h-48">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(heightPercent, 4)}%` }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className={`w-full max-w-[40px] rounded-t-lg transition-all duration-200 shadow-md ${
                              isSelected
                                ? 'bg-gradient-to-t from-cyan-500 to-emerald-400 ring-2 ring-cyan-400 shadow-cyan-900/40'
                                : isHovered
                                ? 'bg-gradient-to-t from-cyan-600 to-cyan-400 shadow-cyan-950/30'
                                : 'bg-gradient-to-t from-blue-700/80 to-cyan-500/80'
                            }`}
                          />
                        </div>

                        {/* Baseline Divider */}
                        <div className="w-full h-0.5 bg-slate-700 my-1" />

                        {/* Column X-Axis Label & Project Count */}
                        <div className="text-center w-full mt-1">
                          <span
                            title={item.label}
                            className={`block text-[10px] font-medium truncate transition-colors ${
                              isSelected ? 'text-cyan-400 font-bold' : 'text-slate-300 group-hover:text-white'
                            }`}
                          >
                            {item.shortLabel}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono block -mt-0.5">
                            {item.count} Proyek
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer Summary Strip */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Total Volume: <strong className="text-emerald-400 font-semibold">{formatKm(summary.totalPanjangGalian)}</strong></span>
              {clickedBarItem && (
                <button
                  onClick={() => {
                    setClickedBarItem(null);
                    onFilterBySegment('ALL');
                  }}
                  className="text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Pilihan</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. ACCURATE INFORMATION PANEL (Appears whenever a slice or vertical bar is clicked) */}
      {(clickedStatus || clickedBarItem) && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 border border-cyan-500/40 rounded-2xl space-y-4 shadow-xl"
        >
          {/* Title Header */}
          <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Informasi Akurat Terkait Item:</span>
                  {clickedStatus && (
                    <span className="text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                      Status: {clickedStatus}
                    </span>
                  )}
                  {clickedBarItem && (
                    <span className="text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 truncate max-w-xs">
                      {clickedBarItem}
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Data teknis mendalam dan daftar proyek yang berelasi langsung dengan item grafik yang Anda klik.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setClickedStatus(null);
                setClickedBarItem(null);
                onFilterByStatus('ALL');
                onFilterBySegment('ALL');
              }}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
            >
              Tutup Rincian
            </button>
          </div>

          {/* Quick Metrics of Clicked Selection */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">Jumlah Proyek</span>
              <span className="text-base sm:text-lg font-bold text-white tabular-nums">
                {clickedStatus ? activeStatusProjects.length : activeBarDetail ? activeBarDetail.count : 0} Proyek
              </span>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">Total Panjang Galian</span>
              <span className="text-base sm:text-lg font-bold text-emerald-400 tabular-nums">
                {formatNum(
                  clickedStatus
                    ? activeStatusProjects.reduce((a, b) => a + b.panjangGalian, 0)
                    : activeBarDetail ? activeBarDetail.meters : 0
                )} m
              </span>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">Total Titik Akses Drop</span>
              <span className="text-base sm:text-lg font-bold text-blue-400 tabular-nums">
                {formatNum(
                  clickedStatus
                    ? activeStatusProjects.reduce((a, b) => a + (b.totalAkses || 0), 0)
                    : activeBarDetail ? activeBarDetail.akses : 0
                )} Akses
              </span>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">Total Handhole (HH)</span>
              <span className="text-base sm:text-lg font-bold text-amber-400 tabular-nums">
                {formatNum(
                  clickedStatus
                    ? activeStatusProjects.reduce((a, b) => a + b.totalHH, 0)
                    : activeBarDetail ? activeBarDetail.hh : 0
                )} Pit
              </span>
            </div>
          </div>

          {/* Contributing Projects List (Click to open accurate details) */}
          <div className="space-y-2 pt-1">
            <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Daftar Proyek Kontributor:</span>
              <span className="text-[10px] text-slate-400 font-normal">Klik untuk membuka rincian spesifikasi lengkap</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
              {(clickedStatus ? activeStatusProjects : activeBarDetail ? activeBarDetail.projects : []).map((project) => (
                <div
                  key={project.id}
                  onClick={() => onSelectProject(project)}
                  className="p-3 bg-slate-950/90 hover:bg-slate-800/90 border border-slate-800/80 hover:border-cyan-500/50 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-[10px] text-cyan-400 font-semibold">
                        {project.projectCode}
                      </span>
                      <VendorBadge vendorName={project.vendorName} size="xs" />
                    </div>
                    <h4 className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors truncate">
                      {project.projectName}
                    </h4>
                    <span className="text-[10px] text-slate-400 truncate block">
                      {project.segmentRelokasi}
                    </span>
                  </div>

                  <div className="text-right font-mono shrink-0">
                    <span className="text-xs font-bold text-emerald-400 tabular-nums block">
                      {formatNum(project.panjangGalian)}m
                    </span>
                    <span className="text-[10px] text-cyan-300 flex items-center justify-end gap-1 mt-0.5">
                      <span>Buka</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
