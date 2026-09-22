import React, { useState } from 'react';
import { MessageCircle, X, ExternalLink, HelpCircle, Sparkles, MapPin, Phone } from 'lucide-react';
import { StoreSettings } from '../types';
import { cleanPhoneNumber } from '../utils/formatters';

interface FloatingWhatsAppProps {
  onOpenAskAdmin: () => void;
  storeSettings?: StoreSettings;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({
  onOpenAskAdmin,
  storeSettings,
}) => {
  const [isOpenTooltip, setIsOpenTooltip] = useState(false);
  const adminPhone = storeSettings?.adminWhatsApp || storeSettings?.whatsappNumber || '6281248002026';

  const handleDirectWhatsApp = () => {
    const defaultMsg = encodeURIComponent(
      'Shalom Admin Toko Buku Berkat DMM, saya ingin bertanya seputar buku rohani/kesehatan dan info pengiriman di wilayah kepulauan Maluku. Mohon informasinya ya, terima kasih! 🙏'
    );
    window.open(`https://wa.me/${cleanPhoneNumber(adminPhone)}?text=${defaultMsg}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end">
      {/* Quick Interactive Popover Card */}
      {isOpenTooltip && (
        <div 
          className="mb-3 w-72 sm:w-80 bg-white rounded-2xl shadow-[0_15px_35px_-5px_rgba(15,44,89,0.25),0_5px_15px_-3px_rgba(0,0,0,0.08)] border border-slate-200/90 p-4 space-y-3 animate-in zoom-in-95 fade-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                WA
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Admin Toko Berkat DMM</h4>
                <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Siap Melayani Pertanyaan Anda
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpenTooltip(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-amber-50/80 p-2 rounded-xl border border-amber-200/60 text-[11px] text-amber-900 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>Pengiriman khusus melayani <strong>seluruh wilayah Kepulauan Maluku</strong>.</span>
          </div>

          <div className="space-y-1.5 pt-1">
            <button
              onClick={() => {
                setIsOpenTooltip(false);
                onOpenAskAdmin();
              }}
              className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-200 transition-all flex items-center justify-between text-xs group"
            >
              <div>
                <div className="font-bold text-slate-800 group-hover:text-[#0F2C59]">Tanya mengenai Buku Tertentu</div>
                <div className="text-[10px] text-slate-500">Pilih buku, cek ketersediaan stok & konsultasi</div>
              </div>
              <HelpCircle className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
            </button>

            <button
              onClick={handleDirectWhatsApp}
              className="w-full text-left p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 transition-all flex items-center justify-between text-xs group"
            >
              <div>
                <div className="font-bold text-emerald-950">Chat WhatsApp Langsung</div>
                <div className="text-[10px] text-emerald-700 font-mono">+{adminPhone} (Admin Toko)</div>
              </div>
              <ExternalLink className="w-4 h-4 text-emerald-600" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            if (!isOpenTooltip) {
              setIsOpenTooltip(true);
            } else {
              setIsOpenTooltip(false);
              onOpenAskAdmin();
            }
          }}
          className="group flex items-center gap-2.5 bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-4 py-3 rounded-full shadow-[0_4px_0_#065f46,0_10px_20px_-3px_rgba(16,185,129,0.4)] hover:shadow-[0_2px_0_#065f46,0_6px_15px_-3px_rgba(16,185,129,0.4)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all transform-gpu"
          aria-label="Tanya Admin atau WhatsApp"
        >
          <div className="relative">
            <MessageCircle className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-emerald-700 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-emerald-700" />
          </div>
          <span className="font-bold text-xs sm:text-sm tracking-wide">
            Tanya Admin / WA
          </span>
        </button>
      </div>
    </div>
  );
};
