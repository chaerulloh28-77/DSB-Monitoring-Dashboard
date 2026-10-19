import React from 'react';
import { 
  Building2, 
  Cpu, 
  Radio, 
  Wifi, 
  Layers, 
  Share2, 
  Zap, 
  Globe, 
  Cable, 
  Server,
  Shield,
  Activity,
  HardDrive,
  Compass
} from 'lucide-react';

interface VendorBadgeProps {
  vendorName: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

// Generate deterministic visual styling (logo color gradient & emblem) based on vendor name
const getVendorTheme = (name: string) => {
  const cleanName = name.replace(/^PT\.?\s+/i, '').trim().toUpperCase();
  
  // Hash function for consistent color selection
  let hash = 0;
  for (let i = 0; i < cleanName.length; i++) {
    hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
  }

  const themes = [
    {
      bg: 'from-blue-600 to-indigo-800',
      border: 'border-blue-500/40',
      text: 'text-blue-400',
      tagBg: 'bg-blue-950/60',
      icon: Cable
    },
    {
      bg: 'from-emerald-600 to-teal-800',
      border: 'border-emerald-500/40',
      text: 'text-emerald-400',
      tagBg: 'bg-emerald-950/60',
      icon: Zap
    },
    {
      bg: 'from-cyan-600 to-blue-800',
      border: 'border-cyan-500/40',
      text: 'text-cyan-400',
      tagBg: 'bg-cyan-950/60',
      icon: Radio
    },
    {
      bg: 'from-amber-600 to-orange-800',
      border: 'border-amber-500/40',
      text: 'text-amber-400',
      tagBg: 'bg-amber-950/60',
      icon: Wifi
    },
    {
      bg: 'from-purple-600 to-violet-800',
      border: 'border-purple-500/40',
      text: 'text-purple-400',
      tagBg: 'bg-purple-950/60',
      icon: Layers
    },
    {
      bg: 'from-rose-600 to-pink-800',
      border: 'border-rose-500/40',
      text: 'text-rose-400',
      tagBg: 'bg-rose-950/60',
      icon: Share2
    },
    {
      bg: 'from-sky-600 to-indigo-700',
      border: 'border-sky-500/40',
      text: 'text-sky-400',
      tagBg: 'bg-sky-950/60',
      icon: Globe
    },
    {
      bg: 'from-teal-600 to-emerald-800',
      border: 'border-teal-500/40',
      text: 'text-teal-400',
      tagBg: 'bg-teal-950/60',
      icon: Server
    }
  ];

  const index = Math.abs(hash) % themes.length;
  const initials = cleanName.length >= 2 ? cleanName.substring(0, 2) : cleanName;

  return {
    cleanName,
    initials,
    ...themes[index]
  };
};

export const VendorBadge: React.FC<VendorBadgeProps> = ({
  vendorName,
  size = 'sm',
  showName = true,
  className = ''
}) => {
  const theme = getVendorTheme(vendorName || 'VENDOR');
  const IconComponent = theme.icon;

  const sizeClasses = {
    xs: {
      logo: 'w-4 h-4 text-[9px] rounded',
      icon: 'w-2.5 h-2.5',
      text: 'text-[10px]',
      padding: 'px-1.5 py-0.5'
    },
    sm: {
      logo: 'w-5 h-5 text-[10px] rounded-md',
      icon: 'w-3 h-3',
      text: 'text-xs',
      padding: 'px-2 py-0.5'
    },
    md: {
      logo: 'w-7 h-7 text-xs rounded-lg',
      icon: 'w-4 h-4',
      text: 'text-xs',
      padding: 'px-2.5 py-1'
    },
    lg: {
      logo: 'w-9 h-9 text-sm rounded-xl',
      icon: 'w-5 h-5',
      text: 'text-sm',
      padding: 'px-3 py-1.5'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`inline-flex items-center gap-1.5 ${theme.tagBg} border ${theme.border} rounded-lg ${currentSize.padding} ${className}`}>
      {/* Visual Logo / Graphic Avatar */}
      <div
        className={`shrink-0 flex items-center justify-center font-bold font-mono tracking-tighter text-white bg-gradient-to-br ${theme.bg} shadow-sm ${currentSize.logo}`}
        title={`Logo Vendor ${theme.cleanName}`}
      >
        <IconComponent className={currentSize.icon} />
      </div>

      {/* Single, non-duplicated Vendor Name */}
      {showName && (
        <span className={`font-semibold tracking-tight text-slate-200 truncate ${currentSize.text}`}>
          {theme.cleanName}
        </span>
      )}
    </div>
  );
};
