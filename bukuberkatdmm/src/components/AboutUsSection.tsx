import React from 'react';
import { Sparkles, Heart, Shield, BookOpen, MapPin, Clock, MessageCircle, Mail } from 'lucide-react';
import { WebsiteAboutConfig, StoreSettings } from '../types';

interface AboutUsSectionProps {
  aboutConfig?: WebsiteAboutConfig;
  storeSettings?: StoreSettings;
  onOpenWhatsApp?: () => void;
}

export const AboutUsSection: React.FC<AboutUsSectionProps> = ({
  aboutConfig,
  storeSettings,
  onOpenWhatsApp,
}) => {
  if (!aboutConfig || !aboutConfig.showAboutSection) {
    return null;
  }

  const pillars = [
    {
      icon: BookOpen,
      title: aboutConfig.pillar1Title || 'Literatur Rohani Berkualitas',
      desc: aboutConfig.pillar1Desc || 'Buku pelajaran Sekolah Sabat, Roh Nubuat, renungan harian, dan Alkitab edisi istimewa untuk menumbuhkan iman jemaat.',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      icon: Heart,
      title: aboutConfig.pillar2Title || 'Kesehatan Holistik Alami',
      desc: aboutConfig.pillar2Desc || 'Panduan medis nabati, nutrisi alami, dan pencegahan penyakit sesuai 8 hukum kesehatan.',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      icon: Shield,
      title: aboutConfig.pillar3Title || 'Jangkauan Bahari Maluku',
      desc: aboutConfig.pillar3Desc || 'Pengiriman terpercaya melalui ekspedisi udara, darat, dan armada kapal laut ke seluruh pelosok pulau Maluku.',
      color: 'bg-amber-50 text-amber-800 border-amber-200',
    },
  ];

  return (
    <section className="my-14 overflow-hidden rounded-3xl bg-white border border-slate-200/90 shadow-[0_20px_45px_-15px_rgba(15,44,89,0.08),0_4px_12px_-2px_rgba(0,0,0,0.03)] p-6 sm:p-10 lg:p-12 relative">
      {/* Decorative ambient elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center space-y-4 mb-10">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-50 to-amber-100/80 border border-amber-200 text-amber-900 text-xs font-bold px-4 py-1.5 rounded-full shadow-[0_2px_6px_rgba(217,119,6,0.15)]">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          <span>{aboutConfig.sectionBadge || 'Tentang Pelayanan Kami'}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-extrabold text-slate-900 tracking-tight">
          {aboutConfig.sectionTitle || 'Misi & Dedikasi Toko Buku Berkat DMM'}
        </h2>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          {aboutConfig.sectionSubtitle || 'Melayani Penyebaran Firman, Kesehatan, dan Penguatan Keluarga di Seluruh Kepulauan Maluku'}
        </p>
      </div>

      {/* Main Narrative Paragraphs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/80 p-6 sm:p-7 rounded-2xl border border-slate-200/70 shadow-inner mb-10">
        <div className="space-y-3">
          <p>
            {aboutConfig.paragraph1 || 'Toko Buku Berkat DMM adalah pusat distribusi resmi literatur rohani, buku kesehatan alami, dan panduan pendidikan keluarga di bawah naungan Gereja Masehi Advent Hari Ketujuh Daerah Misi Maluku. Kami berkomitmen untuk menjangkau setiap jemaat, keluarga, dan masyarakat hingga ke pulau-pulau terjauh.'}
          </p>
        </div>
        <div className="space-y-3">
          <p>
            {aboutConfig.paragraph2 || 'Setiap buku yang kami sediakan dipilih secara cermat dari penerbit terpercaya seperti Indonesia Publishing House (IPH) untuk menjadi pedoman hidup yang menginspirasi, memulihkan kesehatan secara holistik, serta membangun generasi beriman teguh.'}
          </p>
        </div>
      </div>

      {/* 3 Pillars with Semi-3D Card Elevation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto mb-10">
        {pillars.map((pillar, idx) => {
          const Icon = pillar.icon;
          return (
            <div
              key={idx}
              className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_4px_14px_-2px_rgba(15,44,89,0.06),0_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1.5 hover:shadow-[0_18px_32px_-6px_rgba(15,44,89,0.14)] transition-all duration-300 transform-gpu flex flex-col"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center border mb-4 shrink-0 shadow-[0_3px_0_rgba(0,0,0,0.06)] ${pillar.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-2">{pillar.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-auto">{pillar.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Office, Working Hours, & Contact info strip */}
      {storeSettings && (
        <div className="max-w-5xl mx-auto pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="flex items-start gap-2.5 text-slate-600">
            <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-800">Alamat Kantor Toko</strong>
              <span className="leading-snug">{storeSettings.storeAddress}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-slate-600">
            <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-800">Jam Operasional Layanan</strong>
              <span className="leading-snug">{storeSettings.operatingHours}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-slate-600">
            <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-800">Layanan Konsultasi</strong>
              <button
                type="button"
                onClick={onOpenWhatsApp}
                className="text-emerald-700 hover:underline font-bold"
              >
                Hubungi via WhatsApp Toko &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
