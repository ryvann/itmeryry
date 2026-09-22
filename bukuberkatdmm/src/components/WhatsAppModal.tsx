import React, { useState } from 'react';
import { X, MessageCircle, Send, ExternalLink, CheckCircle2, Clock, Phone, Sparkles, Copy, Check } from 'lucide-react';
import { Order, WhatsAppNotificationRecord } from '../types';
import { generateWhatsAppMessage, generateWhatsAppUrl } from '../utils/formatters';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onTriggerNotification?: (orderId: string, type: 'order_created' | 'payment_confirmed' | 'order_shipped' | 'order_delivered' | 'order_cancelled') => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  orders,
  onTriggerNotification,
}) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(orders[0] || null);
  const [selectedType, setSelectedType] = useState<'order_created' | 'payment_confirmed' | 'order_shipped' | 'order_delivered' | 'order_cancelled'>('order_shipped');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentOrder = selectedOrder || orders[0];
  const previewMessage = currentOrder ? generateWhatsAppMessage(currentOrder, selectedType) : '';
  const waUrl = currentOrder ? generateWhatsAppUrl(currentOrder.shipping.phoneNumber, previewMessage) : '';

  const copyText = () => {
    navigator.clipboard.writeText(previewMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-emerald-700 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg sm:text-xl">
                Sistem Notifikasi WhatsApp Otomatis
              </h2>
              <p className="text-xs text-emerald-100">
                Pembaruan status pesanan, verifikasi otomatis & nomor resi langsung ke HP pelanggan
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* Order Selector */}
          {orders.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Pilih Pesanan Pelanggan:
                </label>
                <span className="text-xs text-slate-400">Total {orders.length} Pesanan Terdaftar</span>
              </div>

              <select
                value={currentOrder?.id || ''}
                onChange={(e) => {
                  const ord = orders.find((o) => o.id === e.target.value);
                  if (ord) setSelectedOrder(ord);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {orders.map((ord) => (
                  <option key={ord.id} value={ord.id}>
                    {ord.id} - {ord.shipping.recipientName} ({ord.shipping.phoneNumber}) • Status: {ord.orderStatus}
                  </option>
                ))}
              </select>

              {/* Message Type Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 block">
                  Template Notifikasi WhatsApp Otomatis:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedType('order_created')}
                    className={`p-2 rounded-lg text-xs font-semibold text-left transition-colors ${
                      selectedType === 'order_created'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    1. Pesanan Dibuat
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedType('payment_confirmed')}
                    className={`p-2 rounded-lg text-xs font-semibold text-left transition-colors ${
                      selectedType === 'payment_confirmed'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    2. Lunas / Dikemas
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedType('order_shipped')}
                    className={`p-2 rounded-lg text-xs font-semibold text-left transition-colors ${
                      selectedType === 'order_shipped'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    3. Resi & Dikirim
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedType('order_delivered')}
                    className={`p-2 rounded-lg text-xs font-semibold text-left transition-colors ${
                      selectedType === 'order_delivered'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    4. Paket Tiba
                  </button>
                </div>
              </div>

              {/* WhatsApp Live Simulator Bubble */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Format Pesan WhatsApp Resmi:
                  </span>
                  <button
                    type="button"
                    onClick={copyText}
                    className="flex items-center gap-1 text-emerald-700 hover:underline font-medium"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Tersalin' : 'Salin Teks'}</span>
                  </button>
                </div>

                <div className="bg-[#EFEAE2] p-4 rounded-2xl border border-slate-300 shadow-inner">
                  {/* WhatsApp Chat Balloon */}
                  <div className="bg-white rounded-xl rounded-tl-none p-3.5 shadow-sm max-w-lg border border-slate-200/60 font-sans text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                    {previewMessage}
                    <div className="text-right text-[10px] text-slate-400 mt-1 flex items-center justify-end gap-1">
                      <span>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-blue-500 font-bold">✓✓</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 text-sm transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Buka Chat WhatsApp Pelanggan ({currentOrder?.shipping.phoneNumber})</span>
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-200" />
                </a>

                {onTriggerNotification && currentOrder && (
                  <button
                    type="button"
                    onClick={() => {
                      onTriggerNotification(currentOrder.id, selectedType);
                      alert(`Notifikasi WhatsApp status "${selectedType}" berhasil dicatat dalam log pesanan ${currentOrder.id}.`);
                    }}
                    className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Catat Log Notifikasi Sistem</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs">
              Belum ada pesanan aktif. Lakukan checkout buku terlebih dahulu untuk mencoba fitur notifikasi WhatsApp otomatis.
            </div>
          )}

          {/* Customer Service Contact Card */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-600" />
              Kontak Layanan Pelanggan Toko BukuBerkatDMM:
            </h4>
            <p className="text-slate-600">
              Butuh panduan pemilihan buku rohani, konsultasi kesehatan, atau pesanan jemaat jumlah besar?
            </p>
            <a
              href="https://wa.me/6281248002931?text=Halo%20Admin%20BukuBerkatDMM%20Daerah%20Misi%20Maluku,%20saya%20ingin%20konsultasi%20buku..."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-700 font-bold hover:underline"
            >
              <span>Hubungi Admin Toko via WhatsApp (0812-4800-2931)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};
