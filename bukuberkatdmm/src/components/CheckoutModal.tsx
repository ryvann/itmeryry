import React, { useState, useId } from 'react';
import { 
  X, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  QrCode, 
  Smartphone, 
  Building, 
  Building2,
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  Send, 
  Clock, 
  Sparkles,
  ArrowLeft,
  Mail,
  Wallet,
  Lock,
  User,
  LogIn,
  MapPin,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, Order, PaymentMethodType, ShippingDetails, StoreSettings, CustomerUser } from '../types';
import { 
  INITIAL_STORE_SETTINGS, 
  INITIAL_COURIERS, 
  INITIAL_BANK_TRANSFERS, 
  INITIAL_EWALLETS, 
  INITIAL_VIRTUAL_ACCOUNTS, 
  INITIAL_QRIS, 
  normalizeStoreSettings 
} from '../data/initialSettings';
import { 
  formatRupiah, 
  cleanPhoneNumber, 
  getPaymentMethodName, 
  generateWhatsAppMessage, 
  generateWhatsAppUrl, 
  buildInitialTrackingSteps 
} from '../utils/formatters';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onOrderSuccess: (order: Order) => void;
  onOpenTrackingWithCode?: (code: string) => void;
  storeSettings?: StoreSettings;
  currentUser?: CustomerUser | null;
  onRequireLogin?: (email?: string) => void;
}

const MALUKU_DESTINATIONS: { name: string; baseRatePerKg: number; leadDays: string; regency: string }[] = [
  { name: 'Kota Ambon - Nusaniwe & Pusat Kota', baseRatePerKg: 12000, leadDays: '1 Hari (Reguler)', regency: 'Kota Ambon' },
  { name: 'Kota Ambon - Sirimau & Teluk Ambon', baseRatePerKg: 15000, leadDays: '1-2 Hari', regency: 'Kota Ambon' },
  { name: 'Kota Ambon - Baguala & Leitimur Selatan', baseRatePerKg: 18000, leadDays: '1-2 Hari', regency: 'Kota Ambon' },
  { name: 'Maluku Tengah - Masohi & Amahai (Pulau Seram)', baseRatePerKg: 28000, leadDays: '2-3 Hari', regency: 'Maluku Tengah' },
  { name: 'Maluku Tengah - Pulau Saparua & Nusalaut', baseRatePerKg: 30000, leadDays: '2-3 Hari', regency: 'Maluku Tengah' },
  { name: 'Maluku Tengah - Pulau Haruku', baseRatePerKg: 30000, leadDays: '2-3 Hari', regency: 'Maluku Tengah' },
  { name: 'Maluku Tengah - Kepulauan Banda (Banda Neira)', baseRatePerKg: 40000, leadDays: '3-5 Hari (Kapal/Pesawat)', regency: 'Maluku Tengah' },
  { name: 'Seram Bagian Barat - Piru & Kairatu', baseRatePerKg: 28000, leadDays: '2-3 Hari', regency: 'Seram Bagian Barat' },
  { name: 'Seram Bagian Barat - Taniwel & Huamual', baseRatePerKg: 35000, leadDays: '3-4 Hari', regency: 'Seram Bagian Barat' },
  { name: 'Seram Bagian Timur - Bula & Geser', baseRatePerKg: 38000, leadDays: '3-5 Hari', regency: 'Seram Bagian Timur' },
  { name: 'Seram Bagian Timur - Werinama & Wakate', baseRatePerKg: 42000, leadDays: '3-5 Hari', regency: 'Seram Bagian Timur' },
  { name: 'Buru - Kota Namlea & Waeapo', baseRatePerKg: 35000, leadDays: '2-4 Hari', regency: 'Kabupaten Buru' },
  { name: 'Buru - Air Buaya & Batabual', baseRatePerKg: 40000, leadDays: '3-5 Hari', regency: 'Kabupaten Buru' },
  { name: 'Buru Selatan - Namrole, Leksula & Ambalau', baseRatePerKg: 42000, leadDays: '3-5 Hari', regency: 'Buru Selatan' },
  { name: 'Maluku Tenggara - Langgur & Kei Kecil', baseRatePerKg: 45000, leadDays: '3-4 Hari', regency: 'Maluku Tenggara' },
  { name: 'Maluku Tenggara - Kei Besar', baseRatePerKg: 50000, leadDays: '3-5 Hari', regency: 'Maluku Tenggara' },
  { name: 'Kota Tual - Dullah & Pulau Tayando/Kur', baseRatePerKg: 45000, leadDays: '3-4 Hari', regency: 'Kota Tual' },
  { name: 'Kepulauan Aru - Dobo & Sekitarnya', baseRatePerKg: 52000, leadDays: '4-6 Hari (Pelni/Pesawat)', regency: 'Kepulauan Aru' },
  { name: 'Kepulauan Tanimbar - Saumlaki & Selaru', baseRatePerKg: 50000, leadDays: '3-5 Hari (Pelni/Pesawat)', regency: 'Kepulauan Tanimbar' },
  { name: 'Maluku Barat Daya - Tiakur & Pulau Moa', baseRatePerKg: 60000, leadDays: '4-7 Hari (Pelni/Perintis)', regency: 'Maluku Barat Daya' },
  { name: 'Maluku Barat Daya - Kisar, Wetar, Babar & Romang', baseRatePerKg: 65000, leadDays: '5-8 Hari (Kapal Perintis)', regency: 'Maluku Barat Daya' },
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  onOrderSuccess,
  onOpenTrackingWithCode,
  storeSettings = INITIAL_STORE_SETTINGS,
  currentUser = null,
  onRequireLogin,
}) => {
  const [step, setStep] = useState<'form' | 'payment_gateway' | 'completed'>('form');
  
  const normalizedSettings = normalizeStoreSettings(storeSettings || INITIAL_STORE_SETTINGS);

  // Ekspedisi Kurir Aktif dari Pengaturan Toko Admin
  const availableCouriers = (normalizedSettings.couriers && normalizedSettings.couriers.length > 0 
    ? normalizedSettings.couriers 
    : INITIAL_COURIERS
  ).filter((c) => c.isActive);

  // Saluran Pembayaran Aktif dari Pengaturan Toko Admin
  const channels = normalizedSettings.enabledPaymentChannels || {
    qris: true,
    virtualAccount: true,
    eWallet: true,
    bankTransfer: true,
  };
  const activeVAs = (normalizedSettings.virtualAccounts || INITIAL_VIRTUAL_ACCOUNTS).filter((v) => v.isActive);
  const activeEWallets = (normalizedSettings.eWallets || INITIAL_EWALLETS).filter((e) => e.isActive);
  const activeBanks = (normalizedSettings.bankTransfers || INITIAL_BANK_TRANSFERS).filter((b) => b.isActive);
  const isQrisActive = channels.qris && (normalizedSettings.qrisConfig?.isActive ?? true);

  const defaultMethod: PaymentMethodType = isQrisActive 
    ? 'qris' 
    : channels.virtualAccount && activeVAs.length > 0 
    ? (activeVAs[0].bankCode as any)
    : channels.eWallet && activeEWallets.length > 0 
    ? (activeEWallets[0].name.toLowerCase() as any)
    : 'bank_transfer';

  // Shipping & Customer Identity Form State (Wajib Nama & Email Aktif)
  const [recipientName, setRecipientName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phone || '');
  const [selectedDestination, setSelectedDestination] = useState(MALUKU_DESTINATIONS[0].name);
  const [district, setDistrict] = useState(currentUser?.district || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [postalCode, setPostalCode] = useState(currentUser?.postalCode || '');
  const [courier, setCourier] = useState<string>(() => availableCouriers[0]?.name || 'JNE Express');
  const [notes, setNotes] = useState('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>(defaultMethod);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [copiedVa, setCopiedVa] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  // Auto-fill and synchronize whenever currentUser changes
  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.name) setRecipientName(currentUser.name);
      if (currentUser.email) setEmail(currentUser.email);
      if (currentUser.phone) setPhoneNumber(currentUser.phone);
      if (currentUser.address) setAddress(currentUser.address);
      if (currentUser.district) setDistrict(currentUser.district);
      if (currentUser.postalCode) setPostalCode(currentUser.postalCode);
      if (currentUser.city) {
        const matched = MALUKU_DESTINATIONS.find((d) => 
          d.name.toLowerCase().includes(currentUser.city!.toLowerCase()) || 
          currentUser.city!.toLowerCase().includes(d.name.toLowerCase())
        );
        if (matched) setSelectedDestination(matched.name);
      }
    }
  }, [currentUser]);

  const formId = useId();

  if (!isOpen) return null;

  // Weight and shipping calculations
  const totalWeightGrams = items.reduce((acc, it) => acc + it.book.weightGrams * it.quantity, 0);
  const weightKg = Math.max(1, Math.ceil(totalWeightGrams / 1000));
  const subtotal = items.reduce((acc, it) => acc + it.book.price * it.quantity, 0);
  
  const destData = MALUKU_DESTINATIONS.find((d) => d.name === selectedDestination) || MALUKU_DESTINATIONS[0];
  
  // Courier multiplier adjustment dari konfigurasi admin
  const currentCourierObj = availableCouriers.find((c) => c.name === courier || c.code === courier) || availableCouriers[0];
  const courierMultiplier = currentCourierObj ? currentCourierObj.multiplier : 1.0;
  const shippingCost = Math.round(destData.baseRatePerKg * weightKg * courierMultiplier);
  const totalAmount = subtotal + shippingCost;

  // Dynamic VA Numbers generator
  const cleanPhone = cleanPhoneNumber(phoneNumber || '081234567890');
  const getVaNumber = (method: string) => {
    const bankCode = method.replace('_va', '').toUpperCase();
    const matched = activeVAs.find((v) => v.bankCode === method || v.bankName.toUpperCase().includes(bankCode));
    const prefix = matched?.prefix || (bankCode === 'BCA' ? '80918' : bankCode === 'MANDIRI' ? '88902' : bankCode === 'BRI' ? '12984' : '98801');
    return `${prefix}${cleanPhone.slice(-8)}`;
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();

    // Wajib Login dengan Email Aktif Sebelum Melakukan Pembayaran
    if (!currentUser) {
      if (onRequireLogin) {
        onRequireLogin(email.trim() || undefined);
      } else {
        alert('Setiap pembeli wajib login dengan Email Aktif terlebih dahulu sebelum melakukan pembayaran.');
      }
      return;
    }

    if (!recipientName.trim()) {
      alert('Mohon masukkan Nama Lengkap Anda (Nama Aktif Pembeli).');
      return;
    }

    const emailTrimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailTrimmed || !emailRegex.test(emailTrimmed)) {
      alert('Setiap pembeli wajib memasukkan Email Aktif yang valid (contoh: nama@gmail.com). Bukti invoice digital, rincian buku, dan nomor resi akan dikirim ke email ini.');
      return;
    }

    if (!phoneNumber.trim()) {
      alert('Mohon masukkan Nomor WhatsApp aktif untuk notifikasi status pengiriman & update resi kurir.');
      return;
    }

    if (!address.trim()) {
      alert('Mohon lengkapi Alamat Lengkap pengiriman buku.');
      return;
    }

    setStep('payment_gateway');
  };

  const handleSimulatePaymentSuccess = () => {
    if (!currentUser) {
      alert('Sesi login diperlukan sebelum melakukan pembayaran. Silakan masuk dengan email aktif Anda.');
      onRequireLogin?.(email);
      return;
    }

    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);

      // Generate Order ID & Resi
      const randomOrderNum = Math.floor(10000 + Math.random() * 90000);
      const randomResiNum = Math.floor(100000 + Math.random() * 900000);
      const orderId = `ORD-DMM-${randomOrderNum}`;
      const trackingNumber = `BBDMM-${courier.replace(/\s+/g, '')}-${randomResiNum}`;
      const nowIso = new Date().toISOString();

      const shippingDetails: ShippingDetails = {
        recipientName,
        email: email.trim(),
        phoneNumber,
        province: 'Maluku',
        city: selectedDestination,
        district: district || 'Area Pusat',
        address,
        postalCode: postalCode || '97111',
        courier,
        serviceType: 'Layanan Pengiriman Resmi',
        shippingCost,
        estimatedDelivery: destData.leadDays,
        notes,
      };

      const trackingSteps = buildInitialTrackingSteps(courier, selectedDestination);

      const orderData: Order = {
        id: orderId,
        createdAt: nowIso,
        updatedAt: nowIso,
        items: [...items],
        subtotal,
        shippingCost,
        discount: 0,
        totalAmount,
        shipping: shippingDetails,
        paymentMethod,
        paymentStatus: 'paid',
        paymentGatewayTrxId: `TRX-AUTO-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        orderStatus: 'Dibayar & Diproses',
        trackingNumber,
        trackingHistory: trackingSteps,
        whatsAppNotifications: [],
      };

      // Create WhatsApp notification records
      const initialWaMsg = generateWhatsAppMessage(orderData, 'order_created');
      const paidWaMsg = generateWhatsAppMessage(orderData, 'payment_confirmed');

      orderData.whatsAppNotifications = [
        {
          id: `wa-${Date.now()}-1`,
          timestamp: nowIso,
          phoneNumber,
          messageType: 'order_created',
          messageText: initialWaMsg,
          status: 'delivered',
        },
        {
          id: `wa-${Date.now()}-2`,
          timestamp: new Date(Date.now() + 1000).toISOString(),
          phoneNumber,
          messageType: 'payment_confirmed',
          messageText: paidWaMsg,
          status: 'delivered',
        },
      ];

      setCompletedOrder(orderData);
      onOrderSuccess(orderData);
      setStep('completed');

      // Trigger Confetti!
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0F2C59', '#D97706', '#10B981', '#3B82F6'],
        });
      } catch (err) {
        console.error(err);
      }
    }, 1500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedVa(true);
    setTimeout(() => setCopiedVa(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            {step === 'payment_gateway' && (
              <button
                onClick={() => setStep('form')}
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors mr-1"
                title="Kembali ke formulir"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h2 className="font-serif font-bold text-slate-900 text-lg sm:text-xl flex items-center gap-2">
                {step === 'form' && 'Formulir Pengiriman & Checkout'}
                {step === 'payment_gateway' && 'Gateway Pembayaran Otomatis'}
                {step === 'completed' && 'Pembayaran Berhasil Diverifikasi! 🎉'}
              </h2>
              <span className="text-xs text-slate-500">
                Toko Buku Rohani, Keluarga & Kesehatan BukuBerkatDMM
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* STEP 1: SHIPPING FORM */}
          {step === 'form' && (
            <form id={formId} onSubmit={handleProceedToPayment} className="space-y-5">
              
              {/* Order Summary Alert */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-amber-900 block text-sm">
                    {items.length} Judul Buku ({totalWeightGrams} gr / {weightKg} kg)
                  </span>
                  <span className="text-amber-700">
                    Subtotal: <strong className="font-bold">{formatRupiah(subtotal)}</strong>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block">Estimasi Ongkir Maluku:</span>
                  <span className="font-bold text-amber-900 text-sm">{formatRupiah(shippingCost)}</span>
                </div>
              </div>

              {/* Data Pelanggan: Nama & Email Aktif & WhatsApp */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-slate-800 text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#0F2C59] text-white flex items-center justify-center text-xs">1</span>
                    Identitas Pembeli (Wajib Akun Email Aktif)
                  </h3>
                  {currentUser ? (
                    <span className="text-[10px] text-emerald-800 bg-emerald-100 font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Terverifikasi Login
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-800 bg-amber-100 font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-600" />
                      Wajib Login
                    </span>
                  )}
                </div>

                {/* Status Login Card / Banner */}
                {currentUser ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      {currentUser.avatarUrl ? (
                        <img 
                          src={currentUser.avatarUrl} 
                          alt={currentUser.name} 
                          className="w-10 h-10 rounded-full object-cover border border-emerald-400 shrink-0 shadow-xs" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                          {currentUser.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-emerald-950 text-sm">
                          <span>{currentUser.name}</span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {currentUser.authProvider === 'google' || currentUser.email.endsWith('@gmail.com') ? 'Google Email Aktif' : 'Email Aktif Terverifikasi'}
                          </span>
                        </div>
                        <div className="text-[11px] text-emerald-800 mt-0.5">
                          Email: <strong className="font-bold">{currentUser.email}</strong> • No. HP: {currentUser.phone}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRequireLogin?.(currentUser.email)}
                      className="text-[11px] font-bold text-slate-700 hover:text-[#0F2C59] bg-white border border-emerald-300 hover:bg-emerald-100/50 px-3 py-1.5 rounded-xl transition-colors shrink-0"
                    >
                      Ganti Akun
                    </button>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-4 text-xs space-y-3 shadow-xs">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-amber-950 text-sm flex items-center gap-1.5">
                          <span>Wajib Login Akun Pelanggan Sebelum Melakukan Pembayaran</span>
                          <span className="text-[10px] bg-amber-200 text-amber-900 font-extrabold px-1.5 py-0.5 rounded">
                            Syarat Checkout
                          </span>
                        </h4>
                        <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
                          Sesuai kebijakan toko kami, pelanggan wajib login menggunakan <strong>Google Email & kata sandi aktif</strong> sebelum pembayaran agar invoice digital resmi, rincian buku, dan pelacakan resi kurir terkirim otomatis ke email Anda.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-200/60">
                      <button
                        type="button"
                        onClick={() => onRequireLogin?.(email || '')}
                        className="px-4 py-2 bg-[#0F2C59] hover:bg-[#19427e] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all"
                      >
                        <LogIn className="w-3.5 h-3.5 text-amber-400" />
                        <span>Masuk dengan Google / Sandi</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onRequireLogin?.(email || '')}
                        className="px-3.5 py-2 bg-white hover:bg-amber-100/60 border border-amber-300 text-amber-950 font-bold rounded-xl text-xs transition-all"
                      >
                        <span>Daftar Akun Baru (Sign Up)</span>
                      </button>
                      <span className="text-[11px] text-amber-700 italic hidden sm:inline ml-auto">
                        *Klik untuk login instan atau daftar akun gratis
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Nama Lengkap Pelanggan */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama Lengkap Anda <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Daniel Tahitu / Bpk. Markus"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/20 font-medium"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Nama aktif yang tertera pada nota pesanan & pengiriman kurir.
                    </span>
                  </div>

                  {/* Email Aktif Pelanggan */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-blue-600" />
                        <span>Email Aktif Pelanggan <span className="text-rose-500">*</span></span>
                      </span>
                      {currentUser ? (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" />
                          Terverifikasi
                        </span>
                      ) : (
                        <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded font-medium">
                          Wajib Aktif
                        </span>
                      )}
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="nama.anda@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full border rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 font-medium ${
                        currentUser 
                          ? 'bg-emerald-50/40 border-emerald-300 focus:ring-emerald-500/20 text-emerald-950' 
                          : 'bg-slate-50 border-slate-200 focus:ring-blue-500/20'
                      }`}
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Salinan bukti transaksi & e-receipt otomatis dikirim ke email aktif ini.
                    </span>
                  </div>
                </div>

                {/* WhatsApp Pelanggan */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>No. WhatsApp Aktif <span className="text-rose-500">*</span></span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium">
                      Untuk Resi & Notifikasi Otomatis
                    </span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 0812-4800-xxxx"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/20 font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Pemberitahuan perubahan status paket & nomor resi akan dikirim langsung ke WhatsApp ini.
                  </span>
                </div>
              </div>

              {/* Alamat Pengiriman */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-slate-800 text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#0F2C59] text-white flex items-center justify-center text-xs">2</span>
                    Alamat Pengiriman (Khusus Wilayah Kepulauan Maluku)
                  </h3>
                  <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-700" />
                    Hanya Area Maluku
                  </span>
                </div>

                <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl p-2.5 text-[11px] text-amber-950 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Ketentuan Wilayah Pengiriman:</strong> Toko Buku Berkat DMM melayani pengiriman khusus ke seluruh kabupaten, kota, dan pulau di wilayah Provinsi Maluku (Kota Ambon, Seram, Saparua, Haruku, Banda, Buru, Kei, Tanimbar, Aru, & MBD).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Kabupaten / Kota Tujuan <span className="text-rose-500">*</span></span>
                      <span className="text-[10px] text-amber-700 font-medium">11 Daerah Maluku</span>
                    </label>
                    <select
                      value={selectedDestination}
                      onChange={(e) => setSelectedDestination(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/20"
                    >
                      {MALUKU_DESTINATIONS.map((dest) => (
                        <option key={dest.name} value={dest.name}>
                          {dest.name} (Est: {dest.leadDays})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Kecamatan / Kelurahan / Desa
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Nusaniwe, Kudamati / Sirimau"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Alamat Lengkap (Jalan, RT/RW, Patokan / Rumah) <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Contoh: Jl. Dr. Kayadoe No. 12B, Belakang Gereja Advent Kudamati"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/20 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Kode Pos
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 97116"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Pilihan Ekspedisi Kurir
                    </label>
                    <select
                      value={courier}
                      onChange={(e) => setCourier(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/20 font-medium"
                    >
                      {availableCouriers.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name} ({c.serviceType}) — Est. {c.estimatedLeadDays} {c.multiplier < 1.0 ? `(Diskon ${Math.round((1 - c.multiplier) * 100)}%)` : c.multiplier > 1.0 ? `(+${Math.round((c.multiplier - 1) * 100)}%)` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 block">Total Tagihan Pesanan:</span>
                  <span className="text-lg sm:text-xl font-bold text-[#0F2C59]">
                    {formatRupiah(totalAmount)}
                  </span>
                </div>

                <button
                  type="submit"
                  className={`px-5 py-2.5 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 ${
                    currentUser 
                      ? 'bg-[#0F2C59] hover:bg-[#1a3d74]' 
                      : 'bg-amber-600 hover:bg-amber-700 ring-2 ring-amber-400/40'
                  }`}
                >
                  {!currentUser ? (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Wajib Login Email Sebelum Bayar →</span>
                    </>
                  ) : (
                    <span>Lanjut ke Pembayaran Gateway →</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: AUTOMATIC PAYMENT GATEWAY */}
          {step === 'payment_gateway' && (
            <div className="space-y-6">
              
              {/* Authenticated Customer Verified Banner */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
                <div className="flex items-center gap-2.5 text-emerald-950">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold flex items-center gap-1.5 text-sm">
                      <span>Pelanggan Terverifikasi: {recipientName}</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-100 font-extrabold px-1.5 py-0.2 rounded">
                        Email Aktif
                      </span>
                    </div>
                    <div className="text-[11px] text-emerald-800">
                      Invoice digital & resi kurir akan terkirim otomatis ke <strong>{email}</strong>
                    </div>
                  </div>
                </div>
                <div className="text-[11px] font-mono text-emerald-900 bg-emerald-100/70 px-2 py-1 rounded-lg">
                  WA: {phoneNumber}
                </div>
              </div>
              
              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Pilih Saluran Pembayaran Otomatis
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {/* QRIS */}
                  {isQrisActive && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('qris')}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all ${
                        paymentMethod === 'qris'
                          ? 'border-amber-500 bg-amber-50/50 shadow-xs ring-2 ring-amber-500/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <QrCode className="w-5 h-5 text-amber-700" />
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                          Instan
                        </span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">QRIS Dinamis</div>
                        <div className="text-[10px] text-slate-500 line-clamp-1">{normalizedSettings.qrisConfig?.merchantName || 'Semua Bank & E-Wallet'}</div>
                      </div>
                    </button>
                  )}

                  {/* Virtual Account Banks (Dinamis dari Pengaturan Admin) */}
                  {channels.virtualAccount && activeVAs.map((va) => {
                    const methodKey = va.bankCode as PaymentMethodType;
                    const isSelected = paymentMethod === methodKey;
                    return (
                      <button
                        key={va.id}
                        type="button"
                        onClick={() => setPaymentMethod(methodKey)}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/50 shadow-xs ring-2 ring-amber-500/20'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Building className="w-5 h-5 text-blue-700" />
                        <div>
                          <div className="text-xs font-bold text-slate-800">{va.bankName}</div>
                          <div className="text-[10px] text-slate-500 line-clamp-1">{va.description || 'Verifikasi 24 Jam'}</div>
                        </div>
                      </button>
                    );
                  })}

                  {/* E-Wallets (Dinamis dari Pengaturan Admin) */}
                  {channels.eWallet && activeEWallets.map((ew) => {
                    const methodKey = ew.name.toLowerCase() as PaymentMethodType;
                    const isSelected = paymentMethod === methodKey;
                    return (
                      <button
                        key={ew.id}
                        type="button"
                        onClick={() => setPaymentMethod(methodKey)}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/50 shadow-xs ring-2 ring-amber-500/20'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Smartphone className="w-5 h-5 text-emerald-700" />
                        <div>
                          <div className="text-xs font-bold text-slate-800">{ew.name}</div>
                          <div className="text-[10px] text-slate-500 line-clamp-1">{ew.accountHolder ? `A.N. ${ew.accountHolder}` : 'Aplikasi Dompet'}</div>
                        </div>
                      </button>
                    );
                  })}

                  {/* Transfer Manual (Dinamis dari Rekening Bank Admin) */}
                  {channels.bankTransfer && activeBanks.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bank_transfer')}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all ${
                        paymentMethod === 'bank_transfer'
                          ? 'border-amber-500 bg-amber-50/50 shadow-xs ring-2 ring-amber-500/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-slate-700" />
                      <div>
                        <div className="text-xs font-bold text-slate-800">Transfer Manual</div>
                        <div className="text-[10px] text-slate-500">{activeBanks.length} Rekening Toko DMM</div>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Dynamic Gateway View */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200/60 pb-3">
                  <span>Jumlah yang Harus Dibayar:</span>
                  <span className="text-base font-bold text-[#0F2C59]">{formatRupiah(totalAmount)}</span>
                </div>

                {/* QRIS Display */}
                {paymentMethod === 'qris' && (
                  <div className="flex flex-col items-center justify-center text-center space-y-3 py-2">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center">
                      <div className="text-[11px] font-bold text-slate-600 mb-2 flex items-center gap-1">
                        <QrCode className="w-4 h-4 text-amber-600" />
                        {normalizedSettings.qrisConfig?.merchantName ? normalizedSettings.qrisConfig.merchantName.toUpperCase() : 'QRIS DMM - VERIFIKASI INSTAN'}
                      </div>
                      
                      {normalizedSettings.qrisConfig?.nmid && (
                        <div className="text-[10px] text-slate-500 font-mono mb-2">
                          NMID: {normalizedSettings.qrisConfig.nmid}
                        </div>
                      )}
                      
                      {/* Realistic QRIS Matrix */}
                      <div className="w-44 h-44 bg-white p-2 border-2 border-slate-800 rounded-xl relative flex items-center justify-center">
                        <img 
                          src={normalizedSettings.qrisConfig?.qrImageUrl || `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=00020101021226680016ID.CO.BUKUBERKATDMM.WWW0118936009990000000000520458125303360540${totalAmount}5802ID5914BUKUBERKATDMM6005AMBON6304A1B2`}
                          alt="QRIS Barcode"
                          className="w-full h-full object-contain"
                        />
                        {/* Center Logo Badge */}
                        <div className="absolute inset-0 m-auto w-8 h-8 bg-[#0F2C59] rounded-md border-2 border-white flex items-center justify-center text-[9px] font-bold text-white shadow-xs">
                          DMM
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Berlaku 14:59 menit</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 max-w-sm">
                      {normalizedSettings.qrisConfig?.instructions || 'Buka aplikasi Mobile Banking (BCA Mobile, Livin Mandiri, BRImo, BNI) atau E-Wallet (GoPay, OVO, DANA, ShopeePay), lalu scan kode QRIS di atas.'}
                    </p>
                  </div>
                )}

                {/* Virtual Account Display */}
                {paymentMethod.endsWith('_va') && (
                  <div className="space-y-3 py-2">
                    {(() => {
                      const bankCode = paymentMethod.replace('_va', '').toUpperCase();
                      const currentVA = activeVAs.find((v) => v.bankCode === paymentMethod || v.bankName.toUpperCase().includes(bankCode)) || activeVAs[0];
                      const vaNum = getVaNumber(paymentMethod);
                      return (
                        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                          <span className="text-xs text-slate-500 font-medium block">
                            Nomor Virtual Account ({currentVA ? currentVA.bankName : paymentMethod.toUpperCase().replace('_', ' ')}):
                          </span>
                          <div className="flex items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                            <span className="font-mono text-base font-bold text-slate-900 tracking-wider">
                              {vaNum}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(vaNum)}
                              className="flex items-center gap-1 text-xs text-[#0F2C59] hover:text-amber-600 font-semibold px-2 py-1 rounded bg-white border border-slate-200"
                            >
                              {copiedVa ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedVa ? 'Disalin' : 'Salin'}</span>
                            </button>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Nama Akun: <strong>BUKUBERKAT DMM / {recipientName || 'PELANGGAN'}</strong>
                          </div>
                          {currentVA?.description && (
                            <div className="text-[11px] text-slate-400">
                              {currentVA.description}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* E-Wallet Display (Dinamis) */}
                {activeEWallets.some((ew) => ew.name.toLowerCase() === paymentMethod) && (
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 text-center py-4">
                    {(() => {
                      const currentEW = activeEWallets.find((ew) => ew.name.toLowerCase() === paymentMethod) || activeEWallets[0];
                      return (
                        <>
                          <Smartphone className="w-10 h-10 text-emerald-600 mx-auto" />
                          <h4 className="text-sm font-bold text-slate-800">Pembayaran via {currentEW.name}</h4>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            {currentEW.instructions || `Transfer langsung ke nomor ${currentEW.name} resmi toko buku kami:`}
                          </p>

                          <div className="max-w-xs mx-auto bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 mt-2">
                            <div className="text-[10px] text-slate-400 font-medium">Nomor Akun / HP {currentEW.name}:</div>
                            <div className="flex items-center justify-between gap-2 bg-white p-2 rounded-lg border border-slate-200">
                              <span className="font-mono text-base font-bold text-slate-900">
                                {currentEW.accountNumber}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(currentEW.accountNumber);
                                  setCopiedAccount(currentEW.accountNumber);
                                  setTimeout(() => setCopiedAccount(null), 2000);
                                }}
                                className="flex items-center gap-1 text-xs text-[#0F2C59] font-bold px-2 py-1 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200"
                              >
                                {copiedAccount === currentEW.accountNumber ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-emerald-700">Disalin</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Salin</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <div className="text-[11px] text-slate-600 text-left">
                              Atas Nama: <strong>{currentEW.accountHolder}</strong>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* Bank Transfer Manual - Menggunakan Pengaturan Rekening Admin Toko */}
                {paymentMethod === 'bank_transfer' && (
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 text-xs text-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">
                        Rekening Resmi Toko Buku Daerah Misi Maluku:
                      </div>
                      <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded">
                        Terkonfirmasi Admin
                      </span>
                    </div>

                    {/* Render active banks from storeSettings.bankTransfers */}
                    <div className="space-y-2.5">
                      {activeBanks.map((bank) => (
                        <div key={bank.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#0F2C59]">{bank.bankName}</span>
                            {bank.branch && (
                              <span className="text-[10px] text-slate-400">{bank.branch}</span>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between gap-2 bg-white p-2 rounded-lg border border-slate-200">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-medium">Nomor Rekening:</span>
                              <span className="font-mono font-extrabold text-sm sm:text-base text-slate-900 tracking-wider">
                                {bank.accountNumber}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(bank.accountNumber);
                                setCopiedAccount(bank.accountNumber);
                                setTimeout(() => setCopiedAccount(null), 2000);
                              }}
                              className="flex items-center gap-1 text-xs text-[#0F2C59] hover:text-amber-700 font-bold px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
                            >
                              {copiedAccount === bank.accountNumber ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-700">Disalin</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Salin Rekening</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="text-[11px] text-slate-600">
                            Atas Nama: <strong className="text-slate-800">{bank.accountHolder}</strong>
                          </div>
                        </div>
                      ))}
                    </div>

                    {normalizedSettings.paymentInstructions && (
                      <p className="text-[11px] text-slate-500 bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/60 leading-relaxed">
                        ℹ️ {normalizedSettings.paymentInstructions}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Automatic Gateway Verification Simulation Button */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handleSimulatePaymentSuccess}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 text-sm transition-all"
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Menghubungi Payment Gateway & Memverifikasi...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                      <span>Bayar Sekarang (Simulasikan Verifikasi Gateway Otomatis)</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-slate-500">
                  ⚡ Gateway otomatis langsung mencatat status <em>LUNAS</em> dan memicu notifikasi WhatsApp & email ke Anda.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: ORDER SUCCESS & WHATSAPP TRIGGER */}
          {step === 'completed' && completedOrder && (
            <div className="text-center space-y-5 py-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
                  Pembayaran Terverifikasi Otomatis
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 mt-2">
                  Terima Kasih, Pesanan Berhasil Dibuat!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
                  Paket buku rohani Anda sedang disiapkan dan akan segera dikirimkan ke alamat Anda di <strong className="text-slate-800">{completedOrder.shipping.city}</strong>.
                </p>
              </div>

              {/* Order Receipt Box (Lengkap dengan Identitas Nama & Email Aktif) */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2.5 max-w-lg mx-auto">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Nomor Pesanan:</span>
                  <span className="font-mono font-bold text-slate-900">{completedOrder.id}</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Nama Pembeli (Aktif):</span>
                  <span className="font-bold text-slate-900">{completedOrder.shipping.recipientName}</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    <span>Email Aktif Pelanggan:</span>
                  </span>
                  <span className="font-medium text-blue-700 font-mono">{completedOrder.shipping.email}</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">No. WhatsApp:</span>
                  <span className="font-mono font-bold text-slate-800">{completedOrder.shipping.phoneNumber}</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">No. Resi Pengiriman:</span>
                  <span className="font-mono font-bold text-amber-700">{completedOrder.trackingNumber}</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Metode Pembayaran:</span>
                  <span className="font-semibold text-slate-800">{getPaymentMethodName(completedOrder.paymentMethod)}</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Kurir & Tujuan:</span>
                  <span className="font-semibold text-slate-800">{completedOrder.shipping.courier} ({completedOrder.shipping.city})</span>
                </div>

                <div className="flex justify-between items-center pt-1 font-bold text-sm">
                  <span>Total Lunas:</span>
                  <span className="text-[#0F2C59]">{formatRupiah(completedOrder.totalAmount)}</span>
                </div>

                {/* Email Confirmation Notice */}
                <div className="mt-2 p-2.5 bg-blue-50/80 rounded-xl border border-blue-200/70 text-[11px] text-blue-800 flex items-start gap-2">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    Salinan invoice transaksi resmi dan resi pelacakan kurir telah dikirimkan ke email aktif Anda: <strong>{completedOrder.shipping.email}</strong>.
                  </span>
                </div>
              </div>

              {/* Automatic WhatsApp Action Card */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 rounded-2xl shadow-md text-left max-w-lg mx-auto space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Send className="w-5 h-5 text-emerald-200 shrink-0" />
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                        Notifikasi WhatsApp Otomatis
                      </div>
                      <div className="text-sm font-semibold">
                        Kirim / Simpan Bukti Pesanan ke WhatsApp Anda
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-emerald-50 leading-relaxed">
                  Pesan detail pesanan, rincian buku, dan nomor resi telah diformat secara otomatis untuk nomor WhatsApp Anda (<strong>{completedOrder.shipping.phoneNumber}</strong>).
                </p>

                <a
                  href={generateWhatsAppUrl(
                    completedOrder.shipping.phoneNumber,
                    generateWhatsAppMessage(completedOrder, 'payment_confirmed')
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white text-emerald-800 font-bold rounded-xl text-xs sm:text-sm hover:bg-emerald-50 transition-colors shadow-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Buka Pesan di WhatsApp Sekarang (wa.me)</span>
                </a>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                {onOpenTrackingWithCode && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenTrackingWithCode(completedOrder.trackingNumber || completedOrder.id);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Lacak Perjalanan Paket Buku</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm transition-colors"
                >
                  Selesai & Lanjut Belanja
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
