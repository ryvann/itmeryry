import React, { useState } from 'react';
import { X, ShoppingBag, Heart, Share2, Check, ShieldCheck, Truck, BookOpen, Layers, Award, MessageCircle, MapPin } from 'lucide-react';
import { Book, StoreSettings } from '../types';
import { formatRupiah, cleanPhoneNumber, generateBookInquiryWhatsAppMessage, generateWhatsAppUrl } from '../utils/formatters';

interface BookDetailModalProps {
  book: Book | null;
  onClose: () => void;
  onAddToCart: (book: Book, quantity: number) => void;
  onBuyNow: (book: Book, quantity: number) => void;
  onOpenAskAdmin?: (book: Book) => void;
  storeSettings?: StoreSettings;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  onClose,
  onAddToCart,
  onBuyNow,
  onOpenAskAdmin,
  storeSettings,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  if (!book) return null;

  const adminPhone = storeSettings?.adminWhatsApp || storeSettings?.whatsappNumber || '6281248002026';

  const handleAskAdminDirectWA = () => {
    const msg = generateBookInquiryWhatsAppMessage(book, undefined, 'Halo Admin, apakah stok buku ini ready dan bisa dikirim ke pulau saya di Maluku?');
    const url = generateWhatsAppUrl(adminPhone, msg);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const discountPercent = book.originalPrice
    ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-2xl max-w-3xl w-full shadow-[0_25px_60px_-15px_rgba(15,44,89,0.35),0_10px_25px_-5px_rgba(0,0,0,0.12)] overflow-hidden border border-slate-200/90 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-slate-700 bg-white/90 hover:bg-slate-100 rounded-full shadow-md border border-slate-200/80 transition-colors"
          aria-label="Tutup modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          
          {/* Cover & Gallery Column with Semi-3D Physical Book Illusion */}
          <div className="md:col-span-5 bg-gradient-to-b from-slate-100 via-slate-50 to-slate-200/70 p-6 sm:p-8 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-slate-200/80 shadow-inner">
            {book.badge && (
              <span className="absolute top-4 left-4 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[11px] font-extrabold px-3 py-1 rounded-full shadow-[0_2px_6px_rgba(217,119,6,0.35)] border border-amber-300/40 z-20">
                {book.badge}
              </span>
            )}
            
            <div className="w-48 sm:w-56 aspect-[3/4] relative rounded-xl shadow-[0_20px_35px_-5px_rgba(15,44,89,0.3),0_8px_16px_-4px_rgba(0,0,0,0.15)] overflow-hidden border-2 border-white bg-white group transform hover:scale-[1.02] transition-transform duration-300">
              <img
                src={book.coverImage}
                alt={book.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* 3D Physical Spine Crease */}
              <div className="absolute left-0 inset-y-0 w-4 bg-gradient-to-r from-black/50 via-black/20 to-transparent z-10 pointer-events-none rounded-l-xl" />
              <div className="absolute left-3 inset-y-0 w-[1px] bg-white/30 z-10 pointer-events-none" />

              {/* Page Edge Stack */}
              <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-gradient-to-l from-amber-100/90 to-slate-300 z-10 pointer-events-none" />
              <div className="absolute bottom-0 inset-x-0 h-1.5 bg-gradient-to-t from-slate-900/30 to-transparent z-10 pointer-events-none" />
            </div>

            <div className="mt-4 flex items-center justify-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-medium">
                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                {book.pages} Halaman
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                {book.weightGrams} gram
              </span>
            </div>

            <button
              onClick={handleShare}
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#0F2C59] bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tautan Disalin' : 'Bagikan Buku'}</span>
            </button>
          </div>

          {/* Details & Actions Column */}
          <div className="md:col-span-7 p-6 sm:p-7 flex flex-col justify-between max-h-[80vh] overflow-y-auto">
            <div className="space-y-4">
              <div>
                <span className="inline-block text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 mb-2">
                  {book.category}
                </span>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 leading-snug">
                  {book.title}
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Penulis: <span className="font-semibold text-slate-800">{book.author}</span>
                </p>
              </div>

              {/* Price & Stock */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-[#0F2C59]">
                    {formatRupiah(book.price)}
                  </div>
                  {book.originalPrice && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="line-through">{formatRupiah(book.originalPrice)}</span>
                      <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
                        Hemat {discountPercent}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
                    book.stock > 10
                      ? 'bg-emerald-100 text-emerald-800'
                      : book.stock > 0
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {book.stock > 0 ? `Stok: ${book.stock} Eks.` : 'Stok Habis'}
                  </span>
                  <div className="text-[11px] text-slate-400 mt-0.5">Siap kirim ke Maluku & RI</div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Sinopsis & Rangkuman
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {book.description}
                </p>
              </div>

              {/* Specifications Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200/70">
                <div>
                  <span className="text-slate-400 block">Penerbit:</span>
                  <span className="font-medium text-slate-700">{book.publisher}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">ISBN:</span>
                  <span className="font-mono text-slate-700">{book.isbn}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Tebal Halaman:</span>
                  <span className="font-medium text-slate-700">{book.pages ? `${book.pages} Halaman` : 'Standar'} ({book.weightGrams} gr)</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Jaminan:</span>
                  <span className="font-medium text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% Asli / Baru
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Bar & Ask Admin Section */}
            <div className="pt-4 border-t border-slate-100 mt-4 space-y-3">
              {book.stock > 0 ? (
                <>
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="flex items-center border border-slate-200/90 rounded-xl overflow-hidden bg-white shadow-[0_2px_0_#e2e8f0]">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-2 text-slate-600 hover:bg-slate-100 font-bold transition-colors active:bg-slate-200"
                        title="Kurangi jumlah"
                      >
                        -
                      </button>
                      <span className="px-2.5 py-2 text-sm font-bold text-slate-800 min-w-[2.2rem] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(book.stock, quantity + 1))}
                        className="px-3 py-2 text-slate-600 hover:bg-slate-100 font-bold transition-colors active:bg-slate-200"
                        title="Tambah jumlah"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        onAddToCart(book, quantity);
                        onClose();
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold py-2.5 px-3 sm:px-4 rounded-xl shadow-[0_3px_0_#b45309] hover:shadow-[0_1.5px_0_#b45309] hover:translate-y-[1.5px] active:shadow-none active:translate-y-[3px] transition-all text-xs sm:text-sm"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>+ Keranjang</span>
                    </button>

                    <button
                      onClick={() => {
                        onBuyNow(book, quantity);
                        onClose();
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-b from-[#13376f] to-[#0F2C59] hover:from-[#1a4485] hover:to-[#13376f] text-white font-bold py-2.5 px-3 sm:px-4 rounded-xl shadow-[0_3px_0_#071a36] hover:shadow-[0_1.5px_0_#071a36] hover:translate-y-[1.5px] active:shadow-none active:translate-y-[3px] transition-all text-xs sm:text-sm"
                    >
                      <span>Beli Langsung</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs space-y-2 text-center">
                  <p className="font-semibold">
                    Mohon maaf, persediaan stok buku ini di gudang Ambon sedang habis.
                  </p>
                  <button
                    onClick={() => {
                      if (onOpenAskAdmin) {
                        onOpenAskAdmin(book);
                        onClose();
                      } else {
                        handleAskAdminDirectWA();
                      }
                    }}
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-lg shadow-xs text-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Pesan Khusus via WhatsApp ke Admin</span>
                  </button>
                </div>
              )}

              {/* Ask Admin / WhatsApp Inquiry Button for this Book */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenAskAdmin) {
                      onOpenAskAdmin(book);
                      onClose();
                    } else {
                      handleAskAdminDirectWA();
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl shadow-[0_2px_0_#a7f3d0] active:translate-y-0.5 active:shadow-none transition-all group"
                  title="Hubungi Admin / Pemilik Toko via WhatsApp mengenai buku ini"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span>Tanya Admin / Chat WhatsApp Mengenai Buku Ini</span>
                  <span className="text-[10px] bg-emerald-200 text-emerald-950 font-bold px-1.5 py-0.2 rounded hidden sm:inline">
                    Respon Cepat
                  </span>
                </button>
              </div>

              {/* Territory Shipping Guarantee Notice */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Pengiriman Khusus Wilayah Kepulauan Maluku</span>
                </span>
                <span className="text-[10px] text-amber-800 font-semibold bg-amber-100/70 px-1.5 py-0.2 rounded">
                  Ambon & Pulau-pulau
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
