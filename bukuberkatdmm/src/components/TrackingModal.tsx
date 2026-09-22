import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Package, 
  ArrowRight, 
  MessageCircle, 
  ExternalLink, 
  AlertCircle 
} from 'lucide-react';
import { Order, TrackingStep, CustomerUser } from '../types';
import { formatTanggalIndo, formatRupiah, generateWhatsAppUrl, generateWhatsAppMessage } from '../utils/formatters';

interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  initialTrackingCode?: string;
  currentUser?: CustomerUser | null;
}

export const TrackingModal: React.FC<TrackingModalProps> = ({
  isOpen,
  onClose,
  orders,
  initialTrackingCode = '',
  currentUser,
}) => {
  const [searchCode, setSearchCode] = useState(initialTrackingCode);
  const [matchedOrder, setMatchedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialTrackingCode) {
      setSearchCode(initialTrackingCode);
      handleSearch(initialTrackingCode);
    } else if (currentUser) {
      // Find order matching current customer
      const myOrder = orders.find(
        (o) =>
          o.shipping.recipientName.toLowerCase().includes(currentUser.name.toLowerCase()) ||
          o.shipping.phoneNumber.replace(/[^0-9]/g, '').includes(currentUser.phone.replace(/[^0-9]/g, '').slice(-8))
      );
      if (myOrder) {
        setMatchedOrder(myOrder);
        setSearchCode(myOrder.trackingNumber || myOrder.id);
        setHasSearched(true);
      } else if (orders.length > 0) {
        setMatchedOrder(orders[0]);
        setSearchCode(orders[0].trackingNumber || orders[0].id);
        setHasSearched(true);
      }
    } else if (orders.length > 0) {
      // Default to first order for instant preview
      setMatchedOrder(orders[0]);
      setSearchCode(orders[0].trackingNumber || orders[0].id);
      setHasSearched(true);
    }
  }, [initialTrackingCode, orders, isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSearch = (codeToSearch?: string) => {
    const code = (codeToSearch || searchCode).trim().toLowerCase();
    setHasSearched(true);
    if (!code) {
      setMatchedOrder(null);
      return;
    }

    const found = orders.find(
      (o) =>
        (o.trackingNumber && o.trackingNumber.toLowerCase().includes(code)) ||
        o.id.toLowerCase().includes(code) ||
        o.shipping.phoneNumber.replace(/[^0-9]/g, '').includes(code.replace(/[^0-9]/g, ''))
    );

    setMatchedOrder(found || null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-slate-900 text-lg sm:text-xl">
                Pelacakan Nomor Resi & Pesanan
              </h2>
              <p className="text-xs text-slate-500">
                Lacak posisi kiriman buku rohani, kesehatan & keluarga ke seluruh Maluku
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors"
            aria-label="Tutup pelacakan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* Search Box */}
          <div className="space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  placeholder="Masukkan No. Resi (cth: BBDMM-JNE-...) atau No. Pesanan..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/20"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#0F2C59] hover:bg-[#1a3d74] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors shrink-0"
              >
                Cari Resi
              </button>
            </form>

            {/* Quick Sample Resi Pill Buttons */}
            {orders.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-500 pt-1">
                <span className="text-[11px] font-medium text-slate-400">Contoh Resi Aktif:</span>
                {orders.slice(0, 3).map((ord) => (
                  <button
                    key={ord.id}
                    type="button"
                    onClick={() => {
                      const code = ord.trackingNumber || ord.id;
                      setSearchCode(code);
                      handleSearch(code);
                    }}
                    className="text-[11px] font-mono bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 px-2 py-0.5 rounded border border-slate-200 transition-colors"
                  >
                    {ord.trackingNumber || ord.id}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Results Area */}
          {matchedOrder ? (
            <div className="space-y-5 animate-in fade-in duration-300">
              
              {/* Order Status Card */}
              <div className="bg-gradient-to-br from-[#0F2C59] to-[#1E3E62] text-white p-4 sm:p-5 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-900">
                      {matchedOrder.orderStatus}
                    </span>
                    <span className="text-xs text-slate-300 font-mono">
                      Kurir: <strong className="text-white font-bold">{matchedOrder.shipping.courier}</strong>
                    </span>
                  </div>

                  <span className="text-xs text-amber-300 font-medium">
                    Estimasi Tiba: {matchedOrder.shipping.estimatedDelivery}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-white/10">
                  <div>
                    <span className="text-slate-400 block">No. Resi Pengiriman:</span>
                    <span className="font-mono font-bold text-sm text-amber-400">
                      {matchedOrder.trackingNumber || 'Sedang Diproses Ekspedisi'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Penerima & Alamat Tujuan:</span>
                    <span className="text-slate-200 font-medium truncate block">
                      {matchedOrder.shipping.recipientName} - {matchedOrder.shipping.city}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items in this Shipment */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs space-y-2">
                <div className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-amber-600" />
                  Isi Paket Buku ({matchedOrder.items.length} Judul):
                </div>
                <div className="space-y-1">
                  {matchedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-slate-600">
                      <span className="truncate max-w-[70%]">
                        • {item.book.title}
                      </span>
                      <span className="font-mono text-slate-500 shrink-0">
                        {item.quantity} eks
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline Tracking Steps */}
              <div className="space-y-3 pt-2">
                <h3 className="font-serif font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Riwayat Perjalanan Paket Ekspedisi
                </h3>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {matchedOrder.trackingHistory.map((step, idx) => (
                    <div key={idx} className="relative group">
                      {/* Step Indicator Dot */}
                      <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                        step.completed
                          ? 'bg-emerald-500 border-white text-white shadow-xs'
                          : 'bg-white border-slate-300 text-transparent'
                      }`}>
                        {step.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>

                      {/* Content */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className={`text-xs font-bold ${step.completed ? 'text-slate-800' : 'text-slate-400'}`}>
                            {step.status}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatTanggalIndo(step.timestamp)}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {step.description}
                        </p>

                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                          <MapPin className="w-3 h-3 text-amber-600" />
                          <span>{step.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* WhatsApp Notification Share / Direct Contact */}
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-900 block">
                      Kirim Rincian Resi ke WhatsApp Penerima
                    </span>
                    <span className="text-emerald-700 text-[11px]">
                      Buka pesan WhatsApp resmi ke nomor {matchedOrder.shipping.phoneNumber}
                    </span>
                  </div>
                </div>

                <a
                  href={generateWhatsAppUrl(
                    matchedOrder.shipping.phoneNumber,
                    generateWhatsAppMessage(matchedOrder, 'order_shipped')
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-2xs shrink-0"
                >
                  <span>Buka WA</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ) : hasSearched ? (
            <div className="text-center py-8 space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Resi Tidak Ditemukan</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Nomor resi atau pesanan yang Anda masukkan belum terdaftar dalam sistem. Pastikan kode yang dimasukkan sudah benar.
                </p>
              </div>
            </div>
          ) : null}

        </div>
      </div>
    </div>
  );
};
