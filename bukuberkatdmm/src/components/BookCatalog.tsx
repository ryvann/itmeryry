import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  ShoppingBag, 
  Eye, 
  SlidersHorizontal, 
  Flame, 
  Heart, 
  Shield, 
  CheckCircle,
  Truck,
  ArrowUpDown,
  Search,
  MessageCircle,
  MapPin
} from 'lucide-react';
import { Book, BookCategory, StoreSettings } from '../types';
import { formatRupiah } from '../utils/formatters';
import { BillboardSection } from './BillboardSection';

interface BookCatalogProps {
  books: Book[];
  searchQuery: string;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onSelectBook: (book: Book) => void;
  onAddToCart: (book: Book, qty?: number) => void;
  onOpenAskAdmin?: (book?: Book) => void;
  storeSettings?: StoreSettings;
}

export const BookCatalog: React.FC<BookCatalogProps> = ({
  books,
  searchQuery,
  selectedCategory,
  onSelectCategory,
  onSelectBook,
  onAddToCart,
  onOpenAskAdmin,
  storeSettings,
}) => {
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'popular' | 'stock'>('featured');
  const [addedBookId, setAddedBookId] = useState<string | null>(null);

  const heroConfig = storeSettings?.websiteConfig?.hero;
  const showBanner = heroConfig ? heroConfig.showHeroBanner : true;
  const billboardConfig = storeSettings?.websiteConfig?.billboard;
  const showBillboard = billboardConfig ? billboardConfig.showBillboard : true;
  const bannerThemeClass = heroConfig?.bannerTheme 
    ? (heroConfig.bannerTheme === 'emerald-mission'
        ? 'bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#047857] border-emerald-400/25'
        : heroConfig.bannerTheme === 'deep-burgundy'
        ? 'bg-gradient-to-br from-[#4a0404] via-[#5c0b1e] to-[#7f1d1d] border-amber-500/25'
        : heroConfig.bannerTheme === 'ocean-blue'
        ? 'bg-gradient-to-br from-[#0c4a6e] via-[#0369a1] to-[#0284c7] border-cyan-400/25'
        : heroConfig.bannerTheme === 'warm-amber'
        ? 'bg-gradient-to-br from-[#78350f] via-[#92400e] to-[#b45309] border-amber-300/30'
        : 'bg-gradient-to-br from-[#0B2B4C] via-[#0F2C59] to-[#1E3E62] border-amber-500/20')
    : 'bg-gradient-to-br from-[#0B2B4C] via-[#0F2C59] to-[#1E3E62] border-amber-500/20';

  const renderHeroFeatureIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Truck': return <Truck className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'Shield': return <Shield className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'Heart': return <Heart className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'BookOpen': return <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'CheckCircle':
      default:
        return <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />;
    }
  };

  const categories = [
    { id: 'ALL', label: 'Semua Koleksi', icon: BookOpen },
    { id: 'Rohani & Doa', label: 'Rohani & Doa', icon: Flame },
    { id: 'Keluarga & Pernikahan', label: 'Keluarga & Nikah', icon: Heart },
    { id: 'Kesehatan Alami', label: 'Kesehatan Alami', icon: Sparkles },
    { id: 'Pendidikan Anak', label: 'Anak & Remaja', icon: Shield },
    { id: 'Misi & Sejarah Maluku', label: 'Misi Maluku', icon: CheckCircle },
  ];

  const filteredAndSortedBooks = useMemo(() => {
    let result = [...books];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          b.isbn.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q)
      );
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== 'ALL') {
      result = result.filter((b) => b.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        result.sort((a, b) => (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0));
        break;
      case 'stock':
        result.sort((a, b) => b.stock - a.stock);
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    return result;
  }, [books, searchQuery, selectedCategory, sortBy]);

  const handleQuickAdd = (e: React.MouseEvent, book: Book) => {
    e.stopPropagation();
    onAddToCart(book, 1);
    setAddedBookId(book.id);
    setTimeout(() => setAddedBookId(null), 1500);
  };

  return (
    <section className="space-y-8 pb-16">
      
      {/* Brand Hero Banner (If not searching and enabled by admin) */}
      {!searchQuery && selectedCategory === 'ALL' && showBanner && (
        <div className={`relative overflow-hidden rounded-3xl ${bannerThemeClass} text-white shadow-[0_20px_50px_-15px_rgba(15,44,89,0.35),0_0_0_1px_rgba(255,255,255,0.15)] p-6 sm:p-10 border transition-all`}>
          {/* Subtle Background 3D Glow & Grid */}
          <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-96 h-96 rounded-full bg-blue-400/15 blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-7 xl:col-span-8">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400/20 to-amber-500/20 border border-amber-300/40 text-amber-300 text-xs font-bold px-3.5 py-1.5 rounded-full mb-4 shadow-[0_2px_8px_rgba(245,158,11,0.2)] backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>{heroConfig?.badgeText || 'Pusat Literatur Rohani, Kesehatan & Keluarga Advent Maluku'}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
                {heroConfig?.headlinePrefix || 'Sumber Berkat & Hikmat Rohani bagi '}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 underline decoration-amber-400/40">
                  {heroConfig?.headlineHighlight || 'Keluarga Maluku'}
                </span>
                {heroConfig?.headlineSuffix ? ` ${heroConfig.headlineSuffix}` : ''}
              </h1>

              <p className="mt-3.5 text-sm sm:text-base text-slate-200 leading-relaxed font-normal drop-shadow-xs max-w-2xl">
                {heroConfig?.description || 'Menyediakan koleksi buku penguatan iman, pedoman keharmonisan rumah tangga, terapi kesehatan alami holistik, serta literatur pelayanan bagi seluruh jemaat dan masyarakat. Khusus melayani pengiriman ke seluruh pulau di wilayah Provinsi Maluku.'}
              </p>

              {/* Action Buttons in Hero Banner */}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onOpenAskAdmin?.()}
                  className="inline-flex items-center gap-2 bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-[0_3px_0_#065f46] hover:shadow-[0_1.5px_0_#065f46] hover:translate-y-[1.5px] active:shadow-none active:translate-y-[3px] transition-all text-xs sm:text-sm"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-100" />
                  <span>Tanya Admin / Chat WA</span>
                </button>

                <div className="inline-flex items-center gap-1.5 text-xs text-amber-200/90 bg-black/20 backdrop-blur-xs px-3 py-2 rounded-xl border border-white/10 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Pengiriman Khusus Wilayah Kepulauan Maluku</span>
                </div>
              </div>

              {/* Fast Value Props */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/15 text-xs">
                {(heroConfig?.features || [
                  { text: '100% Buku Asli', iconName: 'CheckCircle' },
                  { text: 'Khusus Wilayah Maluku', iconName: 'Truck' },
                  { text: 'QRIS & VA Otomatis', iconName: 'Sparkles' },
                  { text: 'Konsultasi Admin via WA', iconName: 'Shield' },
                ]).map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-slate-100 font-medium">
                    {renderHeroFeatureIcon(feat.iconName)}
                    <span>{feat.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side: Semi-3D Floating Book Showcase Stack (Desktop & Tablet) */}
            <div className="hidden lg:flex lg:col-span-5 xl:col-span-4 justify-center items-center">
              <div className="relative w-64 h-80 flex items-center justify-center [perspective:1000px]">
                {/* Background Shadow Pedestal */}
                <div className="absolute -bottom-6 w-48 h-8 bg-black/40 rounded-full blur-xl pointer-events-none" />

                {/* Back 3D Book */}
                <div className="absolute w-44 h-60 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 shadow-[0_15px_30px_rgba(0,0,0,0.5)] border border-amber-300/30 transform -rotate-12 -translate-x-6 translate-y-2 opacity-85 transition-transform duration-500 hover:-rotate-16">
                  <div className="absolute left-0 inset-y-0 w-3 bg-gradient-to-r from-black/40 to-transparent rounded-l-xl" />
                  <div className="p-3 text-[10px] font-bold text-amber-100 flex flex-col justify-between h-full">
                    <span className="bg-amber-900/60 px-2 py-0.5 rounded w-max">Buku Rohani</span>
                    <span className="font-serif text-xs text-white">Roh Nubuat & Doa</span>
                  </div>
                </div>

                {/* Front 3D Main Book */}
                <div className="relative w-48 h-64 rounded-xl bg-gradient-to-br from-[#163a75] to-[#0a1f3d] shadow-[0_20px_40px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.2)] border border-blue-400/40 transform rotate-3 translate-x-2 -translate-y-2 hover:rotate-0 hover:scale-105 transition-all duration-500 cursor-pointer group">
                  {/* 3D Spine Crease */}
                  <div className="absolute left-0 inset-y-0 w-4 bg-gradient-to-r from-black/50 via-black/20 to-transparent rounded-l-xl z-20 pointer-events-none" />
                  <div className="absolute left-3.5 inset-y-0 w-[1px] bg-white/30 z-20 pointer-events-none" />
                  {/* Page Edge Stack */}
                  <div className="absolute right-0 top-1 bottom-1 w-1.5 bg-gradient-to-l from-amber-100/80 to-slate-300 rounded-r-xs z-10" />
                  <div className="absolute bottom-0 inset-x-2 h-1.5 bg-gradient-to-t from-amber-100/90 to-transparent rounded-b-xs z-10" />

                  <div className="p-4 flex flex-col justify-between h-full relative z-10">
                    <div className="flex items-center justify-between">
                      <span className="bg-amber-400 text-[#0F2C59] text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                        EDISI TERBARU
                      </span>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
                    </div>
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-300/40 flex items-center justify-center mb-2 text-amber-300">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <h4 className="font-serif font-bold text-white text-sm leading-tight">
                        Literatur Berkat Advent
                      </h4>
                      <p className="text-[10px] text-blue-200 mt-1">
                        Maluku & Nusantara
                      </p>
                    </div>
                  </div>
                </div>

                {/* Floating 3D Badge Pill */}
                <div className="absolute -bottom-2 -left-4 bg-white/95 backdrop-blur-md text-[#0F2C59] px-3 py-1.5 rounded-xl shadow-[0_8px_16px_rgba(0,0,0,0.25)] border border-slate-200/80 text-[10px] font-bold flex items-center gap-1.5 transform hover:scale-105 transition-transform z-30">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Stok Ready Siap Kirim</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Papan Iklan Segera Rilis / Koleksi Unggulan Carousel (Macam Gambar Referensi) */}
      {!searchQuery && selectedCategory === 'ALL' && showBillboard && (
        <BillboardSection
          books={books}
          onSelectBook={onSelectBook}
          onOpenAskAdmin={onOpenAskAdmin}
          customTitle={billboardConfig?.sectionTitle || 'Segera Rilis'}
          customSubtitle={billboardConfig?.sectionSubtitle || 'Temukan kedamaian dan kesehatan melalui koleksi literatur rohani terbaik yang dikurasi khusus untuk pertumbuhan iman Anda.'}
        />
      )}

      {/* Filter and Sorting Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-[0_4px_16px_-4px_rgba(15,44,89,0.06),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
        
        {/* Category Pills (Tactile Semi-3D buttons) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#0F2C59] text-white shadow-[0_3px_0_#071936] -translate-y-0.5'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 shadow-[0_2px_0_#cbd5e1] active:translate-y-0.5 active:shadow-none'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sorting Dropdown & Count */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <span className="text-xs text-slate-500 font-medium">
            <strong className="text-slate-800 font-bold">{filteredAndSortedBooks.length}</strong> buku
          </span>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs shadow-2xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent border-none text-slate-700 font-semibold focus:outline-none cursor-pointer pr-1"
            >
              <option value="featured">Rekomendasi</option>
              <option value="popular">Terpopuler</option>
              <option value="price-asc">Harga: Rendah ke Tinggi</option>
              <option value="price-desc">Harga: Tinggi ke Rendah</option>
              <option value="stock">Stok Terbanyak</option>
            </select>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredAndSortedBooks.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Search className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Buku Tidak Ditemukan</h3>
            <p className="text-sm text-slate-500 mt-1">
              Tidak ada buku yang sesuai dengan pencarian atau filter yang dipilih. Silakan coba kata kunci lain.
            </p>
          </div>
          <button
            onClick={() => {
              onSelectCategory('ALL');
            }}
            className="px-4 py-2 bg-[#0F2C59] text-white text-xs font-bold rounded-xl hover:bg-[#1a3d74] shadow-[0_3px_0_#071936] active:translate-y-0.5 active:shadow-none transition-all"
          >
            Tampilkan Semua Buku
          </button>
        </div>
      )}

      {/* Book Grid with Semi-3D Book Spines and Tactile Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {filteredAndSortedBooks.map((book) => {
          const discountPercent = book.originalPrice
            ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
            : 0;

          const isJustAdded = addedBookId === book.id;

          return (
            <div
              key={book.id}
              onClick={() => onSelectBook(book)}
              className="group bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_14px_-2px_rgba(15,44,89,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] hover:-translate-y-2 hover:shadow-[0_22px_38px_-10px_rgba(15,44,89,0.22),0_8px_16px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 transform-gpu flex flex-col justify-between cursor-pointer overflow-hidden border-t-white/80"
            >
              <div>
                {/* Semi-3D Book Cover Container with Spine Illusion */}
                <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden flex items-center justify-center">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* 3D Physical Book Spine Shadow on Left Edge */}
                  <div className="absolute left-0 inset-y-0 w-3.5 bg-gradient-to-r from-black/45 via-black/20 to-transparent z-10 pointer-events-none" />
                  {/* Subtle Spine Highlight Line */}
                  <div className="absolute left-2.5 inset-y-0 w-[1px] bg-white/30 z-10 pointer-events-none" />
                  {/* Right & Bottom Page Stack Illusion */}
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-l from-black/15 to-transparent z-10 pointer-events-none" />
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-t from-black/20 to-transparent z-10 pointer-events-none" />

                  {/* 3D Badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-20">
                    {book.badge && (
                      <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-[0_2px_6px_rgba(217,119,6,0.4)] border border-amber-300/40">
                        {book.badge}
                      </span>
                    )}
                    {discountPercent > 0 && (
                      <span className="bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-[0_2px_6px_rgba(225,29,72,0.4)]">
                        -{discountPercent}%
                      </span>
                    )}
                  </div>

                  {/* Quick View Hover Button */}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2 z-20 backdrop-blur-2xs">
                    <span className="bg-white/95 text-slate-900 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 transform group-hover:scale-105 transition-transform">
                      <Eye className="w-3.5 h-3.5 text-amber-600" />
                      Detail Buku
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-3.5 sm:p-4 space-y-1.5">
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block truncate">
                    {book.category}
                  </span>

                  <h3 className="font-serif font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-[#0F2C59] transition-colors">
                    {book.title}
                  </h3>

                  <p className="text-xs text-slate-500 truncate">
                    Oleh: {book.author}
                  </p>
                </div>
              </div>

              {/* Pricing & Semi-3D Tactile Cart Button */}
              <div className="p-3.5 sm:p-4 pt-0 border-t border-slate-100/80 mt-2">
                <div className="flex items-baseline justify-between gap-1 mb-3">
                  <div>
                    <span className="text-sm sm:text-base font-extrabold text-[#0F2C59]">
                      {formatRupiah(book.price)}
                    </span>
                    {book.originalPrice && (
                      <span className="block text-[11px] text-slate-400 line-through">
                        {formatRupiah(book.originalPrice)}
                      </span>
                    )}
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    book.stock > 10
                      ? 'bg-slate-100 text-slate-600'
                      : book.stock > 0
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {book.stock > 0 ? `Sisa ${book.stock}` : 'Habis'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <button
                    type="button"
                    disabled={book.stock <= 0}
                    onClick={(e) => handleQuickAdd(e, book)}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      book.stock <= 0
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : isJustAdded
                        ? 'bg-emerald-600 text-white shadow-[0_3px_0_#065f46]'
                        : 'bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-[0_3px_0_#b45309] hover:shadow-[0_1.5px_0_#b45309] hover:translate-y-[1.5px] active:shadow-none active:translate-y-[3px]'
                    }`}
                  >
                    {isJustAdded ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Masuk Keranjang!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>+ Keranjang</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenAskAdmin) {
                        onOpenAskAdmin(book);
                      } else {
                        onSelectBook(book);
                      }
                    }}
                    className="w-full py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100/90 text-emerald-800 border border-emerald-200/90 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-colors active:bg-emerald-200"
                    title="Tanya admin mengenai buku ini via WhatsApp"
                  >
                    <MessageCircle className="w-3 h-3 text-emerald-600" />
                    <span>Tanya Admin / WA</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
