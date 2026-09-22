import React, { useState } from 'react';
import { 
  Palette, 
  Layout, 
  Sparkles, 
  CheckCircle, 
  Truck, 
  Shield, 
  Heart, 
  BookOpen, 
  Image as ImageIcon, 
  Globe, 
  Save, 
  RotateCcw, 
  Eye, 
  ExternalLink, 
  Layers, 
  Type,
  MapPin,
  Clock,
  MessageCircle,
  HelpCircle,
  Check,
  Flame
} from 'lucide-react';
import { StoreSettings, WebsiteAppearanceConfig, WebsiteFeatureProp } from '../types';
import { INITIAL_WEBSITE_CONFIG } from '../data/initialSettings';
import { Logo } from './Logo';

interface WebsiteEditorTabProps {
  storeSettings: StoreSettings;
  onSaveSettings: (updated: StoreSettings) => void;
  onNavigateToStore?: () => void;
  showToast: (msg: string) => void;
}

export const WebsiteEditorTab: React.FC<WebsiteEditorTabProps> = ({
  storeSettings,
  onSaveSettings,
  onNavigateToStore,
  showToast,
}) => {
  // Local state initialized from current storeSettings.websiteConfig
  const currentConfig: WebsiteAppearanceConfig = storeSettings.websiteConfig || INITIAL_WEBSITE_CONFIG;

  const [activeSubTab, setActiveSubTab] = useState<'branding' | 'hero' | 'billboard' | 'about' | 'footer' | 'contact' | 'preview'>('branding');

  // Form states
  const [branding, setBranding] = useState(currentConfig.branding);
  const [hero, setHero] = useState(currentConfig.hero);
  const [billboard, setBillboard] = useState(
    currentConfig.billboard || INITIAL_WEBSITE_CONFIG.billboard || {
      showBillboard: true,
      sectionTitle: 'Segera Rilis',
      sectionSubtitle: 'Temukan kedamaian dan kesehatan melalui koleksi literatur rohani terbaik yang dikurasi khusus untuk pertumbuhan iman Anda.',
    }
  );
  const [about, setAbout] = useState(currentConfig.about);
  const [footer, setFooter] = useState(currentConfig.footer);
  
  // Store contact info directly tied to storeSettings
  const [storeAddress, setStoreAddress] = useState(storeSettings.storeAddress);
  const [operatingHours, setOperatingHours] = useState(storeSettings.operatingHours);
  const [whatsappNumber, setWhatsappNumber] = useState(storeSettings.whatsappNumber);
  const [storeEmail, setStoreEmail] = useState(storeSettings.storeEmail);

  const [isSaved, setIsSaved] = useState(false);

  const bannerThemeOptions: { id: typeof hero.bannerTheme; name: string; gradient: string; previewClass: string }[] = [
    {
      id: 'royal-navy',
      name: 'Royal Navy & Gold (Resmi DMM)',
      gradient: 'from-[#0B2B4C] via-[#0F2C59] to-[#1E3E62]',
      previewClass: 'bg-gradient-to-r from-[#0B2B4C] via-[#0F2C59] to-[#1E3E62] border-amber-500/40 text-white',
    },
    {
      id: 'emerald-mission',
      name: 'Emerald Mission (Kesehatan & Harapan)',
      gradient: 'from-[#064e3b] via-[#065f46] to-[#047857]',
      previewClass: 'bg-gradient-to-r from-[#064e3b] via-[#065f46] to-[#047857] border-emerald-400/40 text-white',
    },
    {
      id: 'deep-burgundy',
      name: 'Deep Burgundy & Bronze (Klasik Rohani)',
      gradient: 'from-[#4a0404] via-[#5c0b1e] to-[#7f1d1d]',
      previewClass: 'bg-gradient-to-r from-[#4a0404] via-[#5c0b1e] to-[#7f1d1d] border-amber-500/40 text-white',
    },
    {
      id: 'ocean-blue',
      name: 'Ocean Blue (Kepulauan Bahari)',
      gradient: 'from-[#0c4a6e] via-[#0369a1] to-[#0284c7]',
      previewClass: 'bg-gradient-to-r from-[#0c4a6e] via-[#0369a1] to-[#0284c7] border-cyan-400/40 text-white',
    },
    {
      id: 'warm-amber',
      name: 'Warm Amber (Keluarga Hangat)',
      gradient: 'from-[#78350f] via-[#92400e] to-[#b45309]',
      previewClass: 'bg-gradient-to-r from-[#78350f] via-[#92400e] to-[#b45309] border-amber-300/40 text-white',
    },
  ];

  const availableIcons: { id: WebsiteFeatureProp['iconName']; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'CheckCircle', label: 'Centang Asli', icon: CheckCircle },
    { id: 'Truck', label: 'Truk Ekspedisi', icon: Truck },
    { id: 'Sparkles', label: 'Kilau / Otomatis', icon: Sparkles },
    { id: 'Shield', label: 'Perisai Aman', icon: Shield },
    { id: 'Heart', label: 'Hati / Kasih', icon: Heart },
    { id: 'BookOpen', label: 'Buku Terbuka', icon: BookOpen },
  ];

  const handleFeatureTextChange = (index: number, text: string) => {
    const updated = [...hero.features] as [WebsiteFeatureProp, WebsiteFeatureProp, WebsiteFeatureProp, WebsiteFeatureProp];
    updated[index] = { ...updated[index], text };
    setHero({ ...hero, features: updated });
  };

  const handleFeatureIconChange = (index: number, iconName: WebsiteFeatureProp['iconName']) => {
    const updated = [...hero.features] as [WebsiteFeatureProp, WebsiteFeatureProp, WebsiteFeatureProp, WebsiteFeatureProp];
    updated[index] = { ...updated[index], iconName };
    setHero({ ...hero, features: updated });
  };

  const handleSaveAll = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const updatedSettings: StoreSettings = {
      ...storeSettings,
      storeAddress,
      operatingHours,
      whatsappNumber,
      storeEmail,
      websiteConfig: {
        branding,
        hero,
        billboard,
        about,
        footer,
      },
    };

    onSaveSettings(updatedSettings);
    setIsSaved(true);
    showToast('Tampilan website & konten berhasil disimpan dan diterapkan!');
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleResetToDefault = () => {
    if (window.confirm('Kembalikan semua teks tampilan, banner hero, dan identitas ke setelan awal Toko Buku Berkat DMM?')) {
      setBranding(INITIAL_WEBSITE_CONFIG.branding);
      setHero(INITIAL_WEBSITE_CONFIG.hero);
      setBillboard(INITIAL_WEBSITE_CONFIG.billboard!);
      setAbout(INITIAL_WEBSITE_CONFIG.about);
      setFooter(INITIAL_WEBSITE_CONFIG.footer);
      setStoreAddress('Jl. Dr. Kayadoe, Kudamati, Nusaniwe, Kota Ambon, Maluku 97116');
      setOperatingHours('Senin - Kamis: 08.00 - 17.00 WIT | Jumat: 08.00 - 15.00 WIT');
      setWhatsappNumber('6281248002026');
      setStoreEmail('bukuberkat.dmm@gmail.com');

      const resetSettings: StoreSettings = {
        ...storeSettings,
        storeAddress: 'Jl. Dr. Kayadoe, Kudamati, Nusaniwe, Kota Ambon, Maluku 97116',
        operatingHours: 'Senin - Kamis: 08.00 - 17.00 WIT | Jumat: 08.00 - 15.00 WIT',
        whatsappNumber: '6281248002026',
        storeEmail: 'bukuberkat.dmm@gmail.com',
        websiteConfig: INITIAL_WEBSITE_CONFIG,
      };
      onSaveSettings(resetSettings);
      showToast('Tampilan website dikembalikan ke desain standar DMM.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0F2C59] to-[#1a3d74] text-white p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full mb-2 border border-amber-400/30">
            <Palette className="w-3.5 h-3.5" />
            <span>Website CMS & Appearance Manager</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
            Pengaturan Tampilan & Konten Website
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl leading-relaxed">
            Kelola branding toko, logo, tema banner hero, teks sambutan, seksi tentang kami, jam operasional, serta teks footer secara langsung.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {onNavigateToStore && (
            <button
              type="button"
              onClick={onNavigateToStore}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/20"
              title="Buka Toko Publik untuk melihat perubahan langsung"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka Toko (/)</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveAll}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-md transition-all ${
              isSaved
                ? 'bg-emerald-500 text-white'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-900'
            }`}
          >
            {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'Tersimpan!' : 'Simpan Tampilan'}</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveSubTab('branding')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap border-b-2 ${
            activeSubTab === 'branding'
              ? 'border-[#0F2C59] text-[#0F2C59] bg-white shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Type className="w-4 h-4" />
          <span>Branding & Logo</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('hero')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap border-b-2 ${
            activeSubTab === 'hero'
              ? 'border-[#0F2C59] text-[#0F2C59] bg-white shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layout className="w-4 h-4" />
          <span>Banner Hero (Beranda)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('billboard')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap border-b-2 ${
            activeSubTab === 'billboard'
              ? 'border-[#0F2C59] text-[#0F2C59] bg-white shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-500" />
          <span>Papan Iklan (Segera Rilis)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('about')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap border-b-2 ${
            activeSubTab === 'about'
              ? 'border-[#0F2C59] text-[#0F2C59] bg-white shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Seksi Tentang Kami</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('contact')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap border-b-2 ${
            activeSubTab === 'contact'
              ? 'border-[#0F2C59] text-[#0F2C59] bg-white shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Alamat & Kontak CS</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('footer')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap border-b-2 ${
            activeSubTab === 'footer'
              ? 'border-[#0F2C59] text-[#0F2C59] bg-white shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Footer & Hak Cipta</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('preview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap border-b-2 ${
            activeSubTab === 'preview'
              ? 'border-[#0F2C59] text-[#0F2C59] bg-white shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Eye className="w-4 h-4 text-amber-600" />
          <span>Pratinjau Langsung (Live Preview)</span>
        </button>
      </div>

      {/* TAB CONTENT */}

      {/* 1. BRANDING & LOGO */}
      {activeSubTab === 'branding' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Identitas Toko & Logo Resmi
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Atur nama toko, slogan, dan logo yang tampil di bagian atas (Navbar) dan Footer.
              </p>
            </div>
            {/* Live Mini Preview */}
            <div className="hidden sm:block p-2 bg-slate-50 rounded-2xl border border-slate-200">
              <Logo 
                size="md" 
                storeName={branding.storeName}
                storeTagline={branding.storeTagline}
                customLogoUrl={branding.customLogoUrl}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Nama Toko Utama
              </label>
              <input
                type="text"
                value={branding.storeName}
                onChange={(e) => setBranding({ ...branding, storeName: e.target.value })}
                placeholder="Contoh: BukuBerkatDMM"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/20"
              />
              <span className="text-[11px] text-slate-400">
                Tampil sebagai judul merek utama pada Navbar dan Footer.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Slogan / Tagline Toko
              </label>
              <input
                type="text"
                value={branding.storeTagline}
                onChange={(e) => setBranding({ ...branding, storeTagline: e.target.value })}
                placeholder="Contoh: Rohani • Keluarga • Kesehatan • Maluku"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/20"
              />
              <span className="text-[11px] text-slate-400">
                Teks kecil di bawah nama logo toko.
              </span>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="block text-xs font-bold text-slate-700">
              URL Logo Kustom (Opsional)
            </label>
            <div className="flex gap-3">
              <input
                type="url"
                value={branding.customLogoUrl || ''}
                onChange={(e) => setBranding({ ...branding, customLogoUrl: e.target.value })}
                placeholder="Kosongkan untuk menggunakan Logo Resmi DMM (/logo.jpg) atau tempel URL https://..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/20"
              />
              {branding.customLogoUrl && (
                <button
                  type="button"
                  onClick={() => setBranding({ ...branding, customLogoUrl: '' })}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                >
                  Gunakan Logo Resmi DMM
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Jika dikosongkan, sistem secara otomatis menggunakan lambang resmi DMM (Api Rohani, Alkitab Terbuka, & Salib Emas).
            </p>
          </div>

          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Tips Identitas Visual:</strong>
              Format logo resmi dirancang khusus dengan kontras tinggi sehingga tetap terbaca jernih di layar ponsel kecil maupun layar monitor lebar.
            </div>
          </div>
        </div>
      )}

      {/* 2. HERO BANNER */}
      {activeSubTab === 'hero' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Banner Utama Beranda (Hero Section)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kustomisasi tema warna, teks headline promosi, dan 4 poin keunggulan utama toko.
              </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold">
              <input
                type="checkbox"
                checked={hero.showHeroBanner}
                onChange={(e) => setHero({ ...hero, showHeroBanner: e.target.checked })}
                className="w-4 h-4 rounded text-[#0F2C59]"
              />
              <span>Tampilkan Banner di Beranda</span>
            </label>
          </div>

          {/* Banner Theme Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              Pilih Tema Warna Banner
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {bannerThemeOptions.map((thm) => (
                <button
                  key={thm.id}
                  type="button"
                  onClick={() => setHero({ ...hero, bannerTheme: thm.id })}
                  className={`p-3 rounded-2xl border text-left transition-all relative ${
                    hero.bannerTheme === thm.id
                      ? 'ring-2 ring-[#0F2C59] border-[#0F2C59] shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`h-8 rounded-lg mb-2 ${thm.previewClass}`} />
                  <span className="block text-xs font-bold text-slate-800 leading-tight">
                    {thm.name}
                  </span>
                  {hero.bannerTheme === thm.id && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Badge & Headline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Teks Badge Kecil (Atas Judul)
              </label>
              <input
                type="text"
                value={hero.badgeText}
                onChange={(e) => setHero({ ...hero, badgeText: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Judul Awal (Headline Prefix)
              </label>
              <input
                type="text"
                value={hero.headlinePrefix}
                onChange={(e) => setHero({ ...hero, headlinePrefix: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Kata Sorotan / Berwarna (Highlight Emas)
              </label>
              <input
                type="text"
                value={hero.headlineHighlight}
                onChange={(e) => setHero({ ...hero, headlineHighlight: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Judul Akhir (Headline Suffix - Opsional)
              </label>
              <input
                type="text"
                value={hero.headlineSuffix || ''}
                onChange={(e) => setHero({ ...hero, headlineSuffix: e.target.value })}
                placeholder="Contoh: Terpercaya"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/20"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Deskripsi Lengkap Banner
            </label>
            <textarea
              rows={3}
              value={hero.description}
              onChange={(e) => setHero({ ...hero, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/20"
            />
          </div>

          {/* 4 Feature Props */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-slate-700">
              4 Poin Keunggulan Utama (Value Proposition)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {hero.features.map((feat, idx) => (
                <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                    <span>Poin #{idx + 1}</span>
                  </div>
                  <input
                    type="text"
                    value={feat.text}
                    onChange={(e) => handleFeatureTextChange(idx, e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium"
                    placeholder="Teks keunggulan..."
                  />
                  <div className="flex items-center gap-1.5">
                    <label className="text-[11px] text-slate-500">Ikon:</label>
                    <select
                      value={feat.iconName}
                      onChange={(e) => handleFeatureIconChange(idx, e.target.value as WebsiteFeatureProp['iconName'])}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700"
                    >
                      {availableIcons.map((ic) => (
                        <option key={ic.id} value={ic.id}>
                          {ic.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2.5 BILLBOARD SECTION (SEGERA RILIS CAROUSEL MACAM GAMBAR) */}
      {activeSubTab === 'billboard' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 mb-1 border border-amber-300">
                <Flame className="w-3 h-3 text-amber-600" />
                <span>Papan Iklan Carousel (Macam Gambar)</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Papan Iklan Banner "Segera Rilis" & Koleksi Unggulan
              </h3>
              <p className="text-xs text-slate-500">
                Slider kartu 3D berlatar belakang gradasi modern dengan sampul buku melayang, badge rilis, dan tombol aksi langsung
              </p>
            </div>

            {/* Toggle Show/Hide Billboard */}
            <label className="flex items-center gap-2.5 cursor-pointer bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={billboard.showBillboard}
                onChange={(e) => setBillboard({ ...billboard, showBillboard: e.target.checked })}
                className="w-4 h-4 rounded text-[#0F2C59] focus:ring-[#0F2C59] border-slate-300"
              />
              <span className="text-xs font-bold text-slate-800">
                {billboard.showBillboard ? 'Papan Iklan Aktif (Tampil)' : 'Papan Iklan Disembunyikan'}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Judul Papan Iklan
              </label>
              <input
                type="text"
                value={billboard.sectionTitle}
                onChange={(e) => setBillboard({ ...billboard, sectionTitle: e.target.value })}
                placeholder="Segera Rilis"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/20"
              />
              <span className="text-[11px] text-slate-400">Contoh: "Segera Rilis", "Koleksi Terpopuler", "Spesial Pekan Doa"</span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Subjudul / Deskripsi Banner
              </label>
              <textarea
                rows={2}
                value={billboard.sectionSubtitle}
                onChange={(e) => setBillboard({ ...billboard, sectionSubtitle: e.target.value })}
                placeholder="Temukan kedamaian dan kesehatan melalui koleksi literatur rohani terbaik..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/20"
              />
            </div>
          </div>

          {/* Billboard Live Preview Card inside Admin */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#0F2C59]" />
                Pratinjau Mini Papan Iklan:
              </span>
              <span className="text-[11px] text-slate-500">Live preview format macam screenshot</span>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0F2C59] via-[#1E3E62] to-[#0B2B4C] p-5 text-white border border-slate-800/20 shadow-md">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold text-[10px] border border-amber-400/30">
                    {billboard.sectionTitle || 'Segera Rilis'}
                  </span>
                  <span className="text-[11px] text-slate-300 line-clamp-1">
                    {billboard.sectionSubtitle}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-300 font-semibold bg-emerald-500/20 px-2 py-0.5 rounded-full">
                  Status: {billboard.showBillboard ? 'Tayang di Beranda' : 'Nonaktif'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 flex items-center gap-3">
                  <img
                    src="/surat_cinta_cover.jpg"
                    alt="Buku 1"
                    className="w-12 h-16 object-cover rounded shadow-md border border-white/30"
                  />
                  <div>
                    <span className="text-[9px] font-bold text-amber-300">Segera Rilis</span>
                    <h5 className="font-bold text-xs text-white line-clamp-1">Surat Cinta dari Pulau Patmos</h5>
                    <p className="text-[10px] text-slate-300">Pdt. Steven Rattu</p>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 flex items-center gap-3">
                  <img
                    src="/minggu_bersama_tuhan2.jpg"
                    alt="Buku 2"
                    className="w-12 h-16 object-cover rounded shadow-md border border-white/30"
                  />
                  <div>
                    <span className="text-[9px] font-bold text-amber-300">Segera Rilis</span>
                    <h5 className="font-bold text-xs text-white line-clamp-1">7 Minggu Bersama Tuhan 2</h5>
                    <p className="text-[10px] text-slate-300">Pdt. Benny Karinda</p>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 flex items-center gap-3">
                  <img
                    src="/minggu_bersama_tuhan1.jpg"
                    alt="Buku 3"
                    className="w-12 h-16 object-cover rounded shadow-md border border-white/30"
                  />
                  <div>
                    <span className="text-[9px] font-bold text-amber-300">Segera Rilis</span>
                    <h5 className="font-bold text-xs text-white line-clamp-1">7 Minggu Bersama Tuhan 1</h5>
                    <p className="text-[10px] text-slate-300">Pdt. Benny Karinda</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. ABOUT SECTION */}
      {activeSubTab === 'about' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Seksi "Tentang Pelayanan Kami" (About Us)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Bagikan visi pelayanan rohani, komitmen kesehatan alami, dan 3 pilar misi toko di beranda publik.
              </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold">
              <input
                type="checkbox"
                checked={about.showAboutSection}
                onChange={(e) => setAbout({ ...about, showAboutSection: e.target.checked })}
                className="w-4 h-4 rounded text-[#0F2C59]"
              />
              <span>Tampilkan Seksi di Beranda</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Badge Seksi
              </label>
              <input
                type="text"
                value={about.sectionBadge}
                onChange={(e) => setAbout({ ...about, sectionBadge: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs sm:text-sm text-slate-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Judul Utama Seksi
              </label>
              <input
                type="text"
                value={about.sectionTitle}
                onChange={(e) => setAbout({ ...about, sectionTitle: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold text-slate-800"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Subjudul / Penjelasan Singkat
            </label>
            <input
              type="text"
              value={about.sectionSubtitle}
              onChange={(e) => setAbout({ ...about, sectionSubtitle: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs sm:text-sm text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Paragraf Penjelasan 1
              </label>
              <textarea
                rows={3}
                value={about.paragraph1}
                onChange={(e) => setAbout({ ...about, paragraph1: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Paragraf Penjelasan 2
              </label>
              <textarea
                rows={3}
                value={about.paragraph2}
                onChange={(e) => setAbout({ ...about, paragraph2: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800"
              />
            </div>
          </div>

          {/* 3 Pillars */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              3 Pilar Inti Pelayanan Misi
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-blue-700">Pilar 1: Rohani</span>
                <input
                  type="text"
                  value={about.pillar1Title}
                  onChange={(e) => setAbout({ ...about, pillar1Title: e.target.value })}
                  placeholder="Judul Pilar 1"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold"
                />
                <textarea
                  rows={2}
                  value={about.pillar1Desc}
                  onChange={(e) => setAbout({ ...about, pillar1Desc: e.target.value })}
                  placeholder="Deskripsi pilar 1..."
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-emerald-700">Pilar 2: Kesehatan</span>
                <input
                  type="text"
                  value={about.pillar2Title}
                  onChange={(e) => setAbout({ ...about, pillar2Title: e.target.value })}
                  placeholder="Judul Pilar 2"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold"
                />
                <textarea
                  rows={2}
                  value={about.pillar2Desc}
                  onChange={(e) => setAbout({ ...about, pillar2Desc: e.target.value })}
                  placeholder="Deskripsi pilar 2..."
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-amber-800">Pilar 3: Jangkauan</span>
                <input
                  type="text"
                  value={about.pillar3Title}
                  onChange={(e) => setAbout({ ...about, pillar3Title: e.target.value })}
                  placeholder="Judul Pilar 3"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold"
                />
                <textarea
                  rows={2}
                  value={about.pillar3Desc}
                  onChange={(e) => setAbout({ ...about, pillar3Desc: e.target.value })}
                  placeholder="Deskripsi pilar 3..."
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. CONTACT & ADDRESS */}
      {activeSubTab === 'contact' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Alamat Kantor Toko, Jam Layanan & Kontak CS
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Informasi ini tampil di Footer toko dan seksi informasi pelayanan.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Alamat Fisik Kantor Toko
              </label>
              <textarea
                rows={2}
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Nomor WhatsApp CS / Pemesanan
                </label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="62812..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs sm:text-sm text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Email Resmi Toko
                </label>
                <input
                  type="email"
                  value={storeEmail}
                  onChange={(e) => setStoreEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs sm:text-sm text-slate-800"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Jam Operasional Layanan Toko
              </label>
              <input
                type="text"
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
                placeholder="Contoh: Senin - Kamis: 08.00 - 17.00 WIT | Jumat: 08.00 - 15.00 WIT"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* 5. FOOTER */}
      {activeSubTab === 'footer' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Footer & Informasi Hak Cipta
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Atur teks deskripsi kaki halaman, jangkauan pengiriman kepulauan, dan teks hak cipta.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Tagline / Deskripsi Pelayanan Footer
              </label>
              <textarea
                rows={2}
                value={footer.tagline}
                onChange={(e) => setFooter({ ...footer, tagline: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs sm:text-sm text-slate-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Teks Jangkauan Pengiriman Antar Pulau
              </label>
              <textarea
                rows={2}
                value={footer.coverageText}
                onChange={(e) => setFooter({ ...footer, coverageText: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs sm:text-sm text-slate-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Teks Hak Cipta (Copyright Notice)
              </label>
              <input
                type="text"
                value={footer.copyrightText}
                onChange={(e) => setFooter({ ...footer, copyrightText: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs sm:text-sm text-slate-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* 6. LIVE PREVIEW TAB */}
      {activeSubTab === 'preview' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase">
                Pratinjau Nyata
              </span>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base mt-1">
                Mockup Tampilan Beranda Sesuai Pengaturan Saat Ini
              </h3>
            </div>
            {onNavigateToStore && (
              <button
                type="button"
                onClick={onNavigateToStore}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#0F2C59] text-white rounded-xl text-xs font-bold hover:bg-[#1a3d74] transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka Toko Publik (/)</span>
              </button>
            )}
          </div>

          {/* Mini Mockup Navbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <Logo 
              size="md" 
              storeName={branding.storeName}
              storeTagline={branding.storeTagline}
              customLogoUrl={branding.customLogoUrl}
            />
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg">Katalog Buku</span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg">Lacak Resi</span>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg">Bantuan WA</span>
            </div>
          </div>

          {/* Mini Mockup Hero */}
          {hero.showHeroBanner && (
            <div className={`p-6 sm:p-8 rounded-3xl shadow-md text-white ${
              hero.bannerTheme === 'emerald-mission'
                ? 'bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#047857]'
                : hero.bannerTheme === 'deep-burgundy'
                ? 'bg-gradient-to-br from-[#4a0404] via-[#5c0b1e] to-[#7f1d1d]'
                : hero.bannerTheme === 'ocean-blue'
                ? 'bg-gradient-to-br from-[#0c4a6e] via-[#0369a1] to-[#0284c7]'
                : hero.bannerTheme === 'warm-amber'
                ? 'bg-gradient-to-br from-[#78350f] via-[#92400e] to-[#b45309]'
                : 'bg-gradient-to-br from-[#0B2B4C] via-[#0F2C59] to-[#1E3E62]'
            }`}>
              <span className="inline-block text-[10px] font-bold bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full mb-3 border border-amber-400/30">
                {hero.badgeText}
              </span>
              <h2 className="text-xl sm:text-3xl font-serif font-extrabold leading-tight">
                {hero.headlinePrefix} <span className="text-amber-400 underline decoration-amber-400/40">{hero.headlineHighlight}</span> {hero.headlineSuffix}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
                {hero.description}
              </p>
              <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-200">
                {hero.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mini Mockup Footer */}
          <div className="bg-[#0A223B] text-slate-300 p-6 rounded-3xl space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <Logo 
                  size="sm" 
                  className="text-white"
                  storeName={branding.storeName}
                  storeTagline={branding.storeTagline}
                  customLogoUrl={branding.customLogoUrl}
                />
                <p className="text-[11px] text-slate-400 mt-2 max-w-sm">
                  {footer.tagline}
                </p>
              </div>
              <div className="text-[11px] text-slate-400 space-y-1">
                <div>{storeAddress}</div>
                <div>WA: {whatsappNumber}</div>
                <div>{operatingHours}</div>
              </div>
            </div>
            <div className="pt-3 border-t border-white/10 text-[10px] text-slate-500">
              © {new Date().getFullYear()} {branding.storeName}. {footer.copyrightText}
            </div>
          </div>
        </div>
      )}

      {/* Action Toolbar Bottom */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
        <button
          type="button"
          onClick={handleResetToDefault}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Kembalikan ke Desain Bawaan DMM</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setActiveSubTab('preview')}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Pratinjau</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-extrabold shadow-md transition-all ${
              isSaved
                ? 'bg-emerald-500 text-white'
                : 'bg-[#0F2C59] hover:bg-[#1a3d74] text-white'
            }`}
          >
            {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4 text-amber-400" />}
            <span>{isSaved ? 'Perubahan Tersimpan!' : 'Simpan Semua Perubahan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
