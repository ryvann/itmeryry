import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  MessageCircle, 
  Menu, 
  X, 
  BookOpen, 
  HeartHandshake, 
  Sparkles,
  User,
  LogIn,
  LogOut,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { Logo } from './Logo';
import { BookCategory, CustomerUser, StoreSettings } from '../types';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenTracking: () => void;
  onOpenAdmin: () => void;
  onOpenWhatsAppHelp: () => void;
  currentUser?: CustomerUser | null;
  onOpenCustomerAuth?: () => void;
  onCustomerLogout?: () => void;
  storeSettings?: StoreSettings;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  cartCount,
  onOpenCart,
  onOpenTracking,
  onOpenAdmin,
  onOpenWhatsAppHelp,
  currentUser,
  onOpenCustomerAuth,
  onCustomerLogout,
  storeSettings,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const branding = storeSettings?.websiteConfig?.branding;

  const categories: { label: string; value: string }[] = [
    { label: 'Semua Koleksi', value: 'ALL' },
    { label: 'Rohani & Doa', value: 'Rohani & Doa' },
    { label: 'Keluarga & Nikah', value: 'Keluarga & Pernikahan' },
    { label: 'Kesehatan Alami', value: 'Kesehatan Alami' },
    { label: 'Anak & Remaja', value: 'Pendidikan Anak' },
    { label: 'Misi Maluku', value: 'Misi & Sejarah Maluku' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(15,44,89,0.09)]">
      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 md:gap-6">
          
          {/* Brand Logo */}
          <div className="flex items-center cursor-pointer transition-transform hover:scale-[1.02] active:scale-98" onClick={() => onSelectCategory('ALL')}>
            <Logo 
              size="md" 
              storeName={branding?.storeName}
              storeTagline={branding?.storeTagline}
              customLogoUrl={branding?.customLogoUrl}
            />
          </div>

          {/* Search Input (Desktop & Tablet) */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari judul buku, penulis, kata kunci, atau ISBN..."
              className="w-full bg-slate-50 border border-slate-200/90 rounded-full pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30 focus:border-[#0F2C59] focus:bg-white transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Action Navigation Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* Lacak Resi */}
            <button
              onClick={onOpenTracking}
              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:text-[#0F2C59] hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 sm:border-transparent"
              title="Lacak Nomor Resi / Status Pesanan"
            >
              <Truck className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">Lacak Resi</span>
            </button>

            {/* WA / Tanya Admin */}
            <button
              onClick={onOpenWhatsAppHelp}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl shadow-[0_2px_0_#a7f3d0] active:translate-y-0.5 active:shadow-none transition-all"
              title="Konsultasi Buku & Tanya Admin / Pemilik Toko via WhatsApp"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span className="hidden md:inline">Tanya Admin</span>
              <span className="md:hidden">WA</span>
            </button>

            {/* Customer User Account / Login Button */}
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-xl transition-all"
                  title={`Akun: ${currentUser.name} (${currentUser.email})`}
                >
                  {currentUser.avatarUrl ? (
                    <img 
                      src={currentUser.avatarUrl} 
                      alt={currentUser.name} 
                      className="w-7 h-7 rounded-full object-cover border border-emerald-400 shrink-0 shadow-xs" 
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="hidden xl:flex flex-col text-left leading-tight">
                    <span className="text-xs font-bold text-emerald-950 max-w-[110px] truncate">{currentUser.name}</span>
                    <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                      {currentUser.authProvider === 'google' || currentUser.email.endsWith('@gmail.com') ? 'Google Aktif' : 'Email Aktif'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-emerald-700 hidden sm:inline" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        {currentUser.avatarUrl ? (
                          <img 
                            src={currentUser.avatarUrl} 
                            alt={currentUser.name} 
                            className="w-9 h-9 rounded-full object-cover border border-emerald-300 shrink-0" 
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
                            {currentUser.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                          <p className="text-[11px] text-emerald-700 font-semibold truncate flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            {currentUser.email}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 text-[10px] text-slate-600 bg-slate-50 p-2 rounded-xl">
                        <div>WA: <span className="font-mono font-bold text-slate-800">{currentUser.phone}</span></div>
                        {currentUser.city && <div className="text-slate-500 mt-0.5">Wilayah: {currentUser.city}</div>}
                        <div className="mt-1 pt-1 border-t border-slate-200/60 flex items-center gap-1 text-[10px] text-blue-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Status: Email & Sandi Aktif</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 space-y-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenTracking();
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-left"
                      >
                        <Truck className="w-3.5 h-3.5 text-amber-600" />
                        <span>Riwayat Pesanan & Resi Saya</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onCustomerLogout?.();
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-left font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Keluar / Ganti Akun</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenCustomerAuth}
                className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold text-[#0F2C59] bg-gradient-to-b from-blue-50 to-blue-100/90 hover:from-blue-100 hover:to-blue-200/90 rounded-xl transition-all border border-blue-200/90 shadow-[0_2px_0_#bfdbfe] active:translate-y-0.5 active:shadow-none group"
                title="Masuk atau Daftar dengan Google Email & Sandi"
              >
                <LogIn className="w-4 h-4 text-blue-700 group-hover:scale-110 transition-transform" />
                <span>Masuk</span>
                <span className="text-[10px] bg-blue-200/90 text-[#0F2C59] font-bold px-1.5 py-0.5 rounded-md hidden lg:inline">
                  Google / Email
                </span>
              </button>
            )}

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center justify-center p-2.5 sm:px-3.5 sm:py-2 text-slate-950 bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 border border-amber-600/30 rounded-xl font-bold text-sm shadow-[0_3px_0_#b45309] hover:shadow-[0_1.5px_0_#b45309] hover:translate-y-[1.5px] active:shadow-none active:translate-y-[3px] transition-all"
              aria-label="Buka Keranjang Belanja"
            >
              <ShoppingBag className="w-5 h-5 text-slate-950" />
              <span className="hidden sm:inline ml-1.5 font-extrabold text-slate-950">Keranjang</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#0F2C59] text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.3)] border border-white">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {/* Admin Portal Button */}
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-2.5 py-2 text-xs sm:text-sm font-semibold text-[#0F2C59] bg-slate-100 hover:bg-[#0F2C59] hover:text-white rounded-xl transition-all border border-slate-200 shadow-[0_2px_0_#cbd5e1] active:translate-y-0.5 active:shadow-none group"
              title="Portal Pengelola / Admin Toko (Jalur /admin)"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600 group-hover:text-amber-400" />
              <span className="hidden md:inline">Admin</span>
              <span className="hidden lg:inline text-[10px] font-mono bg-white/70 group-hover:bg-white/20 px-1 py-0.2 rounded text-slate-600 group-hover:text-amber-200">/admin</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari buku rohani, kesehatan, keluarga..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Categories Bar (Desktop horizontal pills) */}
        <div className="hidden md:flex items-center gap-1.5 py-2 overflow-x-auto border-t border-slate-100 no-scrollbar">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2 shrink-0">Kategori:</span>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => onSelectCategory(cat.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-[#0F2C59] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-3 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kategori Buku</div>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => {
                  onSelectCategory(cat.value);
                  setMobileMenuOpen(false);
                }}
                className={`p-2 rounded-lg text-left text-xs font-medium ${
                  selectedCategory === cat.value
                    ? 'bg-[#0F2C59] text-white'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            {/* Mobile Customer User Section */}
            {currentUser ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full object-cover border border-emerald-400 shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-bold text-slate-900 block leading-tight">{currentUser.name}</span>
                    <span className="text-[10px] text-emerald-700 font-semibold block leading-tight">{currentUser.email} (Aktif)</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onCustomerLogout?.();
                    setMobileMenuOpen(false);
                  }}
                  className="text-[11px] text-rose-600 font-bold px-2 py-1 bg-white border border-rose-200 rounded-lg hover:bg-rose-50"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenCustomerAuth?.();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-white bg-[#0F2C59] hover:bg-[#1a3d74] rounded-xl shadow-xs"
              >
                <LogIn className="w-4 h-4 text-amber-400" />
                <span>Masuk / Daftar dengan Akun Google</span>
              </button>
            )}

            <button
              onClick={() => {
                onOpenTracking();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-xs font-medium text-slate-700 p-2 rounded-lg hover:bg-slate-50"
            >
              <Truck className="w-4 h-4 text-amber-600" />
              <span>Lacak Resi Pengiriman</span>
            </button>
            <button
              onClick={() => {
                onOpenWhatsAppHelp();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-between text-xs font-bold text-emerald-800 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 active:bg-emerald-100"
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Tanya Admin / Konsultasi Buku</span>
              </div>
              <span className="text-[10px] bg-emerald-200 text-emerald-950 font-bold px-1.5 py-0.2 rounded">
                WhatsApp
              </span>
            </button>
            <button
              onClick={() => {
                onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-between text-xs font-semibold text-[#0F2C59] p-2.5 rounded-lg bg-slate-100"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Portal Admin & Inventaris</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                /admin
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
