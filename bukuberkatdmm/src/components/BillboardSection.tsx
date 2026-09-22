import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, User, BookOpen, MessageCircle, Sparkles } from 'lucide-react';
import { Book } from '../types';

export interface BillboardItem {
  id: string;
  title: string;
  author: string;
  category: string;
  badge: string;
  coverImage: string;
  description?: string;
  price?: number;
  bookRefId?: string;
}

interface BillboardSectionProps {
  books?: Book[];
  onSelectBook?: (book: Book) => void;
  onOpenAskAdmin?: (book?: Book) => void;
  customTitle?: string;
  customSubtitle?: string;
}

export const BillboardSection: React.FC<BillboardSectionProps> = ({
  books = [],
  onSelectBook,
  onOpenAskAdmin,
  customTitle = 'Segera Rilis',
  customSubtitle = 'Temukan kedamaian dan kesehatan melalui koleksi literatur rohani terbaik yang dikurasi khusus untuk pertumbuhan iman Anda.',
}) => {
  // Curated showcase items matching user specification & uploaded screenshot
  const defaultBillboardItems: BillboardItem[] = [
    {
      id: 'bb-1',
      title: 'Surat Cinta Bagi Dunia',
      author: 'Wilson Nadeak',
      category: 'PENDIDIKAN ROHANI',
      badge: 'NEW',
      coverImage: '/surat_cinta_cover.jpg',
      description: 'Renungan harian yang merefleksikan surat cinta kasih karunia Allah bagi dunia.',
      bookRefId: 'buku-rilis-01',
    },
    {
      id: 'bb-2',
      title: '52 Minggu Bersama Tuhan 2',
      author: 'F. Parhusip',
      category: 'BUKU PEDOMAN ANAK',
      badge: 'NEW',
      coverImage: '/minggu_bersama_tuhan2.jpg',
      description: 'Pelajaran Alkitab setahun untuk anak volume kedua penuh sukacita dan ilustrasi inspiratif.',
      bookRefId: 'buku-rilis-02',
    },
    {
      id: 'bb-3',
      title: '52 Minggu Bersama Tuhan 1',
      author: 'Fernando Parhusip',
      category: 'BUKU PEDOMAN ANAK',
      badge: 'NEW',
      coverImage: '/minggu_bersama_tuhan1.jpg',
      description: 'Pelajaran Alkitab setahun untuk anak volume pertama membentuk karakter beriman.',
      bookRefId: 'buku-rilis-03',
    },
    {
      id: 'bb-4',
      title: 'Kemenangan Akhir (The Great Controversy)',
      author: 'Ellen G. White',
      category: 'ROHANI & DOA',
      badge: 'BESTSELLER',
      coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
      description: 'Mahakarya sejarah pertentangan besar antara kebaikan dan kejahatan.',
      bookRefId: 'buku-01',
    },
    {
      id: 'bb-5',
      title: 'Petunjuk Pola Hidup Sehat & Terapi Alami',
      author: 'dr. John H. Kellogg & E.G. White',
      category: 'KESEHATAN ALAMI',
      badge: 'UNGGULAN',
      coverImage: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=80',
      description: 'Panduan lengkap prinsip kesehatan alami holistik NEWSTART.',
      bookRefId: 'buku-03',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Determine items per page based on screen width
  const totalItems = defaultBillboardItems.length;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalItems);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems);
  };

  // Autoplay cycle
  useEffect(() => {
    if (!isAutoPlay) return;
    const timer = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(timer);
  }, [isAutoPlay, currentIndex]);

  const handleCardClick = (item: BillboardItem) => {
    // Look up book in full catalog
    const matchedBook = books.find(
      (b) => b.id === item.bookRefId || b.title.toLowerCase() === item.title.toLowerCase()
    );
    if (matchedBook && onSelectBook) {
      onSelectBook(matchedBook);
    } else if (matchedBook && onOpenAskAdmin) {
      onOpenAskAdmin(matchedBook);
    } else if (onOpenAskAdmin) {
      onOpenAskAdmin();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      handleNext();
    }
    if (touchStartX.current - touchEndX.current < -50) {
      handlePrev();
    }
  };

  return (
    <section 
      aria-label="Papan Iklan & Koleksi Segera Rilis"
      className="relative overflow-hidden bg-[#08101E] text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 rounded-3xl my-6 border border-blue-900/50 shadow-2xl shadow-slate-950/60"
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(true)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Starry Dot Matrix Grid Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: 'radial-gradient(rgba(147, 197, 253, 0.4) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Atmospheric Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-blue-600/15 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute -left-20 bottom-0 w-80 h-80 bg-blue-500/10 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute -right-20 bottom-0 w-80 h-80 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        
        {/* Top Header Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          {/* Subtitle text matching user screenshot */}
          <p className="text-xs sm:text-sm md:text-base text-blue-200/80 font-normal leading-relaxed tracking-wide px-4">
            {customSubtitle}
          </p>

          {/* Heading with horizontal flanking lines */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 pt-1">
            <div className="w-8 sm:w-14 h-0.5 bg-blue-500/80 rounded-full" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-wide drop-shadow-sm font-sans">
              {customTitle}
            </h2>
            <div className="w-8 sm:w-14 h-0.5 bg-blue-500/80 rounded-full" />
          </div>
        </div>

        {/* Carousel Showcase Row with Left & Right Arrows */}
        <div className="relative flex items-center justify-center">
          
          {/* Left Navigation Arrow */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Geser ke buku sebelumnya"
            className="absolute -left-2 sm:-left-4 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900/90 border border-slate-700/80 text-white/80 hover:text-white hover:bg-blue-600 hover:border-blue-400 flex items-center justify-center transition-all shadow-xl active:scale-95 cursor-pointer backdrop-blur-xs"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Cards Display Grid (Showing 3 visible active / staggered cards) */}
          <div className="w-full overflow-hidden px-6 sm:px-10 py-2">
            <div 
              className="flex items-stretch justify-center gap-4 sm:gap-6 transition-transform duration-500 ease-out"
            >
              {[0, 1, 2].map((offset) => {
                const itemIndex = (currentIndex + offset) % totalItems;
                const item = defaultBillboardItems[itemIndex];
                const isCenter = offset === 0;

                return (
                  <div
                    key={`${item.id}-${offset}`}
                    onClick={() => handleCardClick(item)}
                    className={`flex-1 min-w-[280px] max-w-[390px] bg-white text-slate-900 rounded-[26px] sm:rounded-[30px] p-4 sm:p-5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] border border-white/40 flex flex-row items-center gap-4 sm:gap-5 cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_25px_50px_-12px_rgba(59,130,246,0.3)] group ${
                      offset === 2 ? 'hidden lg:flex' : offset === 1 ? 'hidden sm:flex' : 'flex'
                    }`}
                  >
                    {/* Left: Book Cover Image with rounded corners and soft shadow */}
                    <div className="w-24 sm:w-28 md:w-32 aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 shadow-md border border-slate-200/60 shrink-0 relative group-hover:shadow-lg transition-all">
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                    </div>

                    {/* Right: Content details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                      <div>
                        {/* Badges row: Category pill + NEW status badge */}
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="bg-blue-50 text-blue-700 font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider truncate max-w-[140px] border border-blue-200/50">
                            {item.category}
                          </span>
                          <span className="bg-amber-400 text-amber-950 font-black text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider shadow-2xs">
                            {item.badge}
                          </span>
                        </div>

                        {/* Bold Book Title */}
                        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base md:text-lg leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
                          {item.title}
                        </h3>
                      </div>

                      {/* Author Info Section */}
                      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block leading-tight">
                              PENULIS
                            </span>
                            <span className="font-black text-xs sm:text-sm text-slate-800 truncate block leading-tight">
                              {item.author}
                            </span>
                          </div>
                        </div>

                        <div className="hidden xl:flex items-center gap-1 text-[11px] font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform shrink-0">
                          <span>Detail</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Navigation Arrow */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Geser ke buku selanjutnya"
            className="absolute -right-2 sm:-right-4 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900/90 border border-slate-700/80 text-white/80 hover:text-white hover:bg-blue-600 hover:border-blue-400 flex items-center justify-center transition-all shadow-xl active:scale-95 cursor-pointer backdrop-blur-xs"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Bottom Pagination Pill Indicators matching screenshot */}
        <div className="flex flex-col items-center justify-center gap-3 pt-2">
          <div className="flex items-center gap-2">
            {defaultBillboardItems.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Slide ke-${idx + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  currentIndex === idx
                    ? 'w-8 sm:w-10 h-2 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]'
                    : 'w-2 sm:w-2.5 h-2 bg-slate-600 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>

          {/* Subtle Bottom Accent Glow Line */}
          <div className="w-28 sm:w-40 h-0.5 bg-gradient-to-r from-transparent via-blue-500/70 to-transparent rounded-full" />
        </div>

      </div>
    </section>
  );
};
