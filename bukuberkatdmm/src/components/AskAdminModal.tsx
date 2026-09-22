import React, { useState, useEffect } from 'react';
import { 
  X, 
  MessageCircle, 
  Send, 
  BookOpen, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles, 
  HelpCircle, 
  Phone, 
  MapPin, 
  Clock, 
  Check, 
  ShieldCheck,
  User,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Book, CustomerUser, StoreSettings, CustomerInquiry } from '../types';
import { 
  formatRupiah, 
  generateBookInquiryWhatsAppMessage, 
  generateGeneralInquiryWhatsAppMessage, 
  generateWhatsAppUrl,
  cleanPhoneNumber 
} from '../utils/formatters';

interface AskAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBook?: Book | null;
  book?: Book | null;
  currentUser?: CustomerUser | null;
  storeSettings?: StoreSettings;
  books?: Book[];
  onSaveInquiry?: (inquiry: CustomerInquiry) => void;
  onInquirySubmitted?: (inquiry: CustomerInquiry) => void;
}

const MALUKU_REGIONS = [
  'Kota Ambon (Pusat, Nusaniwe, Sirimau, Baguala, Teluk Ambon)',
  'Maluku Tengah - Masohi & Amahai (Pulau Seram)',
  'Maluku Tengah - Pulau Saparua & Nusalaut',
  'Maluku Tengah - Pulau Haruku',
  'Maluku Tengah - Kepulauan Banda (Banda Neira)',
  'Seram Bagian Barat - Piru & Kairatu',
  'Seram Bagian Timur - Bula & Geser',
  'Buru - Namlea & Waeapo',
  'Buru Selatan - Namrole & Leksula',
  'Maluku Tenggara - Langgur & Kepulauan Kei',
  'Kota Tual & Sekitarnya',
  'Kepulauan Aru - Dobo & Sekitarnya',
  'Kepulauan Tanimbar - Saumlaki & Selaru',
  'Maluku Barat Daya - Tiakur, Moa, Kisar & Wetar',
];

const QUICK_QUESTION_TEMPLATES = [
  'Apakah stok buku ini ready di toko Ambon?',
  'Berapa lama estimasi kirim dan ongkir ke pulau saya di Maluku?',
  'Mohon saran rekomendasi buku rohani sejenis untuk keluarga.',
  'Apakah ada potongan harga/diskon untuk pemesanan jemaat/organisasi?',
];

export const AskAdminModal: React.FC<AskAdminModalProps> = ({
  isOpen,
  onClose,
  selectedBook,
  book,
  currentUser,
  storeSettings,
  books = [],
  onSaveInquiry,
  onInquirySubmitted,
}) => {
  const effectiveInitialBook = book !== undefined ? book : selectedBook;
  const [activeBook, setActiveBook] = useState<Book | null>(effectiveInitialBook || null);
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [selectedRegion, setSelectedRegion] = useState(MALUKU_REGIONS[0]);
  const [inquiryTopic, setInquiryTopic] = useState('Konsultasi Buku & Ketersediaan Stok');
  const [questionText, setQuestionText] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const saveInquiryHandler = onInquirySubmitted || onSaveInquiry;

  // Sync when selectedBook or currentUser changes
  useEffect(() => {
    setActiveBook((book !== undefined ? book : selectedBook) || null);
  }, [selectedBook, book]);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.name) setCustomerName(currentUser.name);
      if (currentUser.phone) setCustomerPhone(currentUser.phone);
      if (currentUser.city) {
        const matched = MALUKU_REGIONS.find((r) => r.toLowerCase().includes(currentUser.city!.toLowerCase()));
        if (matched) setSelectedRegion(matched);
      }
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const adminPhone = storeSettings?.adminWhatsApp || storeSettings?.whatsappNumber || '6281248002026';

  const constructMessage = (): string => {
    if (activeBook) {
      return generateBookInquiryWhatsAppMessage(
        activeBook,
        customerName || (currentUser ? currentUser.name : 'Pelanggan'),
        questionText || undefined,
        selectedRegion
      );
    }
    return generateGeneralInquiryWhatsAppMessage(
      customerName || (currentUser ? currentUser.name : 'Pelanggan'),
      inquiryTopic,
      questionText || undefined,
      selectedRegion
    );
  };

  const handleSendViaWhatsApp = () => {
    const message = constructMessage();
    const waUrl = generateWhatsAppUrl(adminPhone, message);

    // Save inquiry record if handler exists
    if (saveInquiryHandler) {
      const newInquiry: CustomerInquiry = {
        id: `INQ-${Date.now()}`,
        createdAt: new Date().toISOString(),
        customerName: customerName || 'Pelanggan Toko',
        customerPhone: customerPhone || '-',
        customerEmail: currentUser?.email,
        bookId: activeBook?.id,
        bookTitle: activeBook?.title,
        bookCategory: activeBook?.category,
        message: questionText || (activeBook ? `Tanya seputar ${activeBook.title}` : inquiryTopic),
        region: selectedRegion,
        channel: 'whatsapp',
        status: 'pending',
      };
      saveInquiryHandler(newInquiry);
    }

    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSubmitWebInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (saveInquiryHandler) {
      const newInquiry: CustomerInquiry = {
        id: `INQ-${Date.now()}`,
        createdAt: new Date().toISOString(),
        customerName: customerName || 'Pelanggan Toko',
        customerPhone: customerPhone || '-',
        customerEmail: currentUser?.email,
        bookId: activeBook?.id,
        bookTitle: activeBook?.title,
        bookCategory: activeBook?.category,
        message: questionText || (activeBook ? `Tanya seputar ${activeBook.title}` : inquiryTopic),
        region: selectedRegion,
        channel: 'web',
        status: 'pending',
      };
      saveInquiryHandler(newInquiry);
    }
    setSubmittedSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-3xl max-w-xl w-full shadow-[0_25px_60px_-15px_rgba(15,44,89,0.35),0_10px_25px_-5px_rgba(0,0,0,0.12)] overflow-hidden border border-slate-200/90 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-emerald-600/20 bg-gradient-to-r from-emerald-800 via-emerald-700 to-[#0F2C59] text-white shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-inner border border-white/20 shrink-0">
              <MessageCircle className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-base sm:text-lg">
                  Tanya Admin / Pemilik Toko
                </h2>
                <span className="bg-emerald-500/30 text-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/40 hidden sm:inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  Online
                </span>
              </div>
              <p className="text-xs text-emerald-100/90">
                Layanan konsultasi buku & info pengiriman khusus wilayah Maluku
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Territory Limitation Info Banner */}
        <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-2.5 flex items-center justify-between text-xs text-amber-900 gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="font-medium">
              <strong>Wilayah Pengiriman:</strong> Khusus Melayani Kepulauan Provinsi Maluku
            </span>
          </div>
          <span className="text-[10px] bg-amber-200/80 text-amber-950 font-bold px-2 py-0.5 rounded-md shrink-0">
            DMM Ambon
          </span>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-slate-800">
          {submittedSuccess ? (
            <div className="text-center py-8 space-y-4 animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">
                  Pertanyaan Anda Telah Diterima Admin!
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Terima kasih Kak <strong>{customerName || 'Pelanggan'}</strong>. Pengelola Toko Buku Berkat DMM akan segera meninjau dan merespon pertanyaan Anda melalui WhatsApp <strong>{customerPhone}</strong>.
                </p>
              </div>

              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-2">
                <button
                  onClick={handleSendViaWhatsApp}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-[0_3px_0_#065f46] active:translate-y-0.5 active:shadow-none transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Lanjut Chat Langsung di WhatsApp</span>
                </button>
                <button
                  onClick={() => {
                    setSubmittedSuccess(false);
                    onClose();
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitWebInquiry} className="space-y-4">
              
              {/* Selected Book Presentation (if available) */}
              {activeBook ? (
                <div className="bg-gradient-to-r from-blue-50 to-amber-50/50 p-3.5 rounded-2xl border border-blue-200/80 shadow-2xs relative">
                  <div className="flex items-start gap-3">
                    <div className="w-14 sm:w-16 aspect-[3/4] rounded-lg overflow-hidden bg-white shadow-md border border-white shrink-0 relative">
                      <img
                        src={activeBook.coverImage}
                        alt={activeBook.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute left-0 inset-y-0 w-1.5 bg-black/40" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md">
                          {activeBook.category}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          activeBook.stock > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {activeBook.stock > 0 ? `Stok: ${activeBook.stock} eks` : 'Stok Kosong'}
                        </span>
                      </div>
                      
                      <h4 className="font-serif font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">
                        {activeBook.title}
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        Penulis: <span className="font-semibold text-slate-800">{activeBook.author}</span>
                      </p>
                      <p className="text-xs font-bold text-[#0F2C59] mt-0.5">
                        {formatRupiah(activeBook.price)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveBook(null)}
                      className="text-[10px] text-slate-400 hover:text-rose-600 underline shrink-0"
                      title="Ganti ke pertanyaan umum"
                    >
                      Batal Pilih
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pilih Buku yang Ingin Ditanyakan (Opsional):
                  </label>
                  <select
                    value=""
                    onChange={(e) => {
                      const found = books.find((b) => b.id === e.target.value);
                      setActiveBook(found || null);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="">-- Pertanyaan Umum / Konsultasi Rekomendasi Buku --</option>
                    {books.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title} ({formatRupiah(b.price)}) • {b.category}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Identity Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Anda <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Daniel Tahitu / Ibu Maria"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor WhatsApp Anda <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 0812-4800-xxxx"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
                  />
                </div>
              </div>

              {/* Destination in Maluku */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Wilayah Tempat Tinggal Anda di Maluku <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-medium">
                    Khusus Provinsi Maluku
                  </span>
                </label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {MALUKU_REGIONS.map((reg) => (
                    <option key={reg} value={reg}>
                      {reg}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Template Chips */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Pertanyaan Populer (Klik untuk Mengisi Otomatis):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_QUESTION_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setQuestionText(tmpl)}
                      className="text-[11px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition-all text-left"
                    >
                      + {tmpl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Question Textarea */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tuliskan Pertanyaan Anda untuk Admin: <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Contoh: Halo Admin, apakah buku ini tersedia untuk dikirim ke Masohi? Berapa lama perkiraan waktu sampai dan apakah ada buku panduan doa lainnya?"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleSendViaWhatsApp}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold py-3 px-4 rounded-xl shadow-[0_3px_0_#065f46] hover:shadow-[0_1.5px_0_#065f46] hover:translate-y-[1.5px] active:shadow-none active:translate-y-[3px] transition-all text-xs sm:text-sm"
                >
                  <MessageCircle className="w-5 h-5 text-emerald-100" />
                  <span>Kirim & Buka Chat WhatsApp Admin</span>
                  <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
                </button>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200/90 transition-colors"
                  >
                    Simpan Pertanyaan di Web
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="py-2 px-4 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </div>

            </form>
          )}

          {/* Official Admin Profile Footer Box */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs text-slate-600 space-y-1.5 mt-2">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Kontak Resmi Admin Toko Buku Berkat DMM
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                WhatsApp Aktif
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-600 pt-1">
              <div>
                WA Admin: <a href={`https://wa.me/${cleanPhoneNumber(adminPhone)}`} target="_blank" rel="noreferrer" className="font-mono font-bold text-emerald-700 hover:underline">+{adminPhone}</a>
              </div>
              <div>
                Jam Operasional: <span className="font-medium text-slate-700">08.00 - 21.00 WIT</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 border-t border-slate-200/60 pt-1">
              📍 Kantor Pelayanan: Jl. Dr. Kayadoe, Kudamati, Kota Ambon, Maluku 97116
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
