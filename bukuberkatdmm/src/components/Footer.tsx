import React from 'react';
import { ShieldCheck, Truck, MessageCircle, MapPin, Phone, Mail, Clock, Lock, Sparkles, Heart } from 'lucide-react';
import { Logo } from './Logo';
import { StoreSettings } from '../types';

interface FooterProps {
  onOpenAdmin: () => void;
  onOpenTracking: () => void;
  onOpenWhatsAppHelp: () => void;
  onSelectCategory: (cat: string) => void;
  storeSettings?: StoreSettings;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAdmin,
  onOpenTracking,
  onOpenWhatsAppHelp,
  onSelectCategory,
  storeSettings,
}) => {
  const branding = storeSettings?.websiteConfig?.branding;
  const footerConfig = storeSettings?.websiteConfig?.footer;

  return (
    <footer className="bg-[#0A223B] text-slate-300 border-t border-amber-500/20 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Col 1 & 2: Brand Identity & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/5 p-3 rounded-2xl inline-block border border-white/10">
              <Logo 
                size="md" 
                className="text-white" 
                storeName={branding?.storeName}
                storeTagline={branding?.storeTagline}
                customLogoUrl={branding?.customLogoUrl}
              />
            </div>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm">
              {footerConfig?.tagline || 'Toko Buku Resmi Pelayanan Rohani, Keluarga Bahagia, dan Kesehatan Holistik Alami Alkitabiah Daerah Misi Maluku (DMM). Menyebarkan benih kebenaran firman dan kesehatan sejati ke setiap pulau dan rumah tangga di Maluku.'}
            </p>

            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Kantor: {storeSettings?.storeAddress || 'Jl. Dr. Kayadoe, Kudamati, Nusaniwe, Kota Ambon, Maluku 97116'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Layanan WA: {storeSettings?.whatsappNumber || '0812-4800-2931'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{storeSettings?.operatingHours || 'Senin - Kamis: 08.00 - 17.00 WIT | Jumat: 08.00 - 15.00 WIT'}</span>
              </div>
            </div>
          </div>

          {/* Col 3: Kategori Buku */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-white text-sm tracking-wide">
              Koleksi Literatur
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onSelectCategory('Rohani & Doa')}
                  className="hover:text-amber-300 transition-colors"
                >
                  Buku Rohani, Doa & Nubuat
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Keluarga & Pernikahan')}
                  className="hover:text-amber-300 transition-colors"
                >
                  Pembinaan Keluarga & Nikah
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Kesehatan Alami')}
                  className="hover:text-amber-300 transition-colors"
                >
                  Gaya Hidup & Terapi Alami
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Pendidikan Anak')}
                  className="hover:text-amber-300 transition-colors"
                >
                  Cerita Alkitab Anak & Remaja
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Misi & Sejarah Maluku')}
                  className="hover:text-amber-300 transition-colors"
                >
                  Pekabaran Misi Kepulauan Maluku
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Layanan & Pelacakan */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-white text-sm tracking-wide">
              Bantuan & Layanan
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={onOpenTracking}
                  className="hover:text-amber-300 transition-colors flex items-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pelacakan Nomor Resi</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenWhatsAppHelp}
                  className="hover:text-emerald-300 transition-colors flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Konsultasi Buku via WhatsApp</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-amber-300 transition-colors flex items-center gap-1.5 group"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400" />
                  <span>Portal Admin & Inventaris</span>
                  <span className="text-[10px] font-mono text-slate-400 bg-white/10 px-1 rounded">/admin</span>
                </button>
              </li>
              <li className="pt-2 text-[11px] text-slate-400">
                {footerConfig?.coverageText || 'Layanan pengiriman melayani seluruh wilayah kepulauan: Ambon, Seram, Saparua, Banda, Kei, Tanimbar, Aru, MBD, hingga ke seluruh Indonesia.'}
              </li>
            </ul>
          </div>

          {/* Col 5: Keamanan & Pembayaran */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-white text-sm tracking-wide">
              Metode Pembayaran Resmi
            </h4>
            <div className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-2">
              <div className="text-[11px] font-semibold text-amber-400">
                ⚡ Gateway Pembayaran Otomatis
              </div>
              <div className="text-[10px] text-slate-300 leading-relaxed">
                QRIS Dinamis (BCA, GoPay, OVO, DANA), Virtual Account Mandiri / BRI / BCA, serta Transfer Rekening Bank DMM.
              </div>
              <div className="pt-1 flex items-center gap-1 text-[10px] text-emerald-400">
                <ShieldCheck className="w-3 h-3" />
                <span>Verifikasi Instan 24 Jam</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} <strong>{branding?.storeName || 'BukuBerkatDMM'}</strong>. {footerConfig?.copyrightText || 'Hak Cipta Dilindungi Undang-Undang. Daerah Misi Maluku.'}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onOpenAdmin}
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Login Pengelola (/admin)</span>
            </button>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-400">
              Dibangun dengan Kasih & Dedikasi untuk Pelayanan Jemaat Maluku
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
