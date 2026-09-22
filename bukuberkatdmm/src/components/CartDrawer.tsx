import React from 'react';
import { X, ShoppingBag, Trash2, ArrowRight, ShieldCheck, Truck, Layers } from 'lucide-react';
import { CartItem } from '../types';
import { formatRupiah } from '../utils/formatters';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (bookId: string, quantity: number) => void;
  onRemoveItem: (bookId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.book.price * item.quantity, 0);
  const totalWeightGrams = items.reduce((acc, item) => acc + item.book.weightGrams * item.quantity, 0);
  const totalWeightKg = (totalWeightGrams / 1000).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-600" />
              <h2 className="font-serif font-bold text-slate-800 text-lg">
                Keranjang Belanja
              </h2>
              <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
                {totalQuantity}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors"
              aria-label="Tutup keranjang"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-slate-800 text-base">Keranjang Anda Masih Kosong</h3>
                <p className="text-xs text-slate-500 max-w-xs">
                  Pilih buku rohani, kesehatan, atau pembinaan keluarga favorit Anda dari etalase BukuBerkatDMM.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-4 py-2 bg-[#0F2C59] text-white text-xs font-bold rounded-xl hover:bg-[#1a3d74] transition-colors"
                >
                  Mulai Belanja Sekarang
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.book.id}
                  className="flex gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80 items-start"
                >
                  <img
                    src={item.book.coverImage}
                    alt={item.book.title}
                    referrerPolicy="no-referrer"
                    className="w-16 h-20 object-cover rounded-lg shrink-0 border border-slate-200 bg-white"
                  />

                  <div className="flex-1 min-w-0 flex flex-col justify-between h-20">
                    <div>
                      <h4 className="font-serif font-bold text-xs sm:text-sm text-slate-900 truncate">
                        {item.book.title}
                      </h4>
                      <div className="text-xs text-amber-700 font-bold mt-0.5">
                        {formatRupiah(item.book.price)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {item.book.weightGrams * item.quantity} gr
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.book.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-100 font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 text-xs font-semibold text-slate-800 min-w-[1.75rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={item.quantity >= item.book.stock}
                          onClick={() => onUpdateQuantity(item.book.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-100 font-bold disabled:text-slate-300"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.book.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        title="Hapus dari keranjang"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Action */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-slate-500">
                    <Layers className="w-3.5 h-3.5" /> Total Berat:
                  </span>
                  <span className="font-semibold text-slate-800">
                    {totalWeightKg} kg ({totalWeightGrams} gr)
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm pt-1 border-t border-slate-200/60">
                  <span className="font-semibold text-slate-700">Subtotal Belanja:</span>
                  <span className="font-bold text-[#0F2C59] text-base sm:text-lg">
                    {formatRupiah(subtotal)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  *Ongkos kirim dihitung otomatis saat pengisian alamat tujuan Maluku/Indonesia.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full py-3 px-4 bg-[#0F2C59] hover:bg-[#1a3d74] text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 text-sm transition-all"
              >
                <span>Lanjut ke Checkout & Pembayaran</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>

              <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Transaksi Terenkripsi
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Truck className="w-3 h-3 text-amber-600" /> Ekspedisi Resmi
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
