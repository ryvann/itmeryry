import React, { useState, useEffect } from 'react';
import { Megaphone, ChevronRight, Pause, Play, Sparkles } from 'lucide-react';

interface AnnouncementTickerProps {
  announcements: string[];
  onOpenPromo?: () => void;
}

export const AnnouncementTicker: React.FC<AnnouncementTickerProps> = ({
  announcements,
  onOpenPromo,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || announcements.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, announcements.length]);

  if (!announcements || announcements.length === 0) return null;

  return (
    <aside aria-label="Pengumuman & Promo Toko" className="bg-gradient-to-r from-[#0F2C59] via-[#1E3E62] to-[#0F2C59] text-white py-2 px-3 text-xs md:text-sm border-b border-amber-500/30 relative overflow-hidden shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left Badge */}
        <div className="flex items-center gap-1.5 shrink-0 bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-400/40 text-[11px] font-semibold uppercase tracking-wider">
          <Megaphone className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="hidden sm:inline">Info & Promo DMM</span>
          <span className="sm:hidden">Info</span>
        </div>

        {/* Dynamic Running / Cycling Content */}
        <div 
          className="flex-1 overflow-hidden cursor-pointer"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onClick={onOpenPromo}
          title="Klik untuk detail info toko"
        >
          <div className="transition-all duration-700 ease-in-out font-medium text-slate-100 flex items-center gap-2 truncate">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 hidden md:inline" />
            <span className="truncate">{announcements[currentIndex]}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 shrink-0 text-slate-300">
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="p-1 hover:text-white rounded hover:bg-white/10 transition-colors"
            title={isPaused ? 'Lanjutkan Teks' : 'Jeda Teks'}
            aria-label={isPaused ? 'Lanjutkan teks pengumuman' : 'Jeda teks pengumuman'}
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          </button>
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => (prev + 1) % announcements.length)}
            className="p-1 hover:text-amber-300 rounded hover:bg-white/10 transition-colors flex items-center gap-0.5 text-[11px]"
            title="Pengumuman Berikutnya"
            aria-label="Pengumuman berikutnya"
          >
            <span className="hidden lg:inline">{currentIndex + 1}/{announcements.length}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
