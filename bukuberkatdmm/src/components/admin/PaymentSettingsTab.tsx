import React, { useState } from 'react';
import { 
  CreditCard, 
  Building2, 
  QrCode, 
  Smartphone, 
  Building, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  RotateCcw, 
  Save, 
  Info, 
  CheckCircle2, 
  X, 
  Upload, 
  Copy, 
  Sparkles,
  ShieldCheck,
  Eye,
  Wallet
} from 'lucide-react';
import { 
  StoreSettings, 
  BankTransferAccount, 
  EWalletAccount, 
  VirtualAccountConfig, 
  QRISConfig, 
  PaymentChannelsControl 
} from '../../types';
import { 
  INITIAL_BANK_TRANSFERS, 
  INITIAL_EWALLETS, 
  INITIAL_VIRTUAL_ACCOUNTS, 
  INITIAL_QRIS, 
  INITIAL_STORE_SETTINGS 
} from '../../data/initialSettings';

interface PaymentSettingsTabProps {
  settings: StoreSettings;
  onUpdateSettings: (newSettings: StoreSettings) => void;
  onShowNotification?: (msg: string) => void;
}

export const PaymentSettingsTab: React.FC<PaymentSettingsTabProps> = ({
  settings,
  onUpdateSettings,
  onShowNotification,
}) => {
  // Sub-tabs inside Payment Settings: 'all' | 'transfer' | 'bank_va' | 'ewallet' | 'qris'
  const [activePillar, setActivePillar] = useState<'all' | 'transfer' | 'bank_va' | 'ewallet' | 'qris' | 'preview'>('all');

  // Modals state
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [editingBankId, setEditingBankId] = useState<string | null>(null);
  const [bankFormData, setBankFormData] = useState<BankTransferAccount>({
    id: '',
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    branch: '',
    isPrimary: false,
    isActive: true,
  });

  const [isEditingEWallet, setIsEditingEWallet] = useState(false);
  const [editingEWalletId, setEditingEWalletId] = useState<string | null>(null);
  const [eWalletFormData, setEWalletFormData] = useState<EWalletAccount>({
    id: '',
    name: 'GoPay',
    accountNumber: '',
    accountHolder: '',
    isActive: true,
    instructions: '',
  });

  const bankTransfers = settings.bankTransfers || INITIAL_BANK_TRANSFERS;
  const virtualAccounts = settings.virtualAccounts || INITIAL_VIRTUAL_ACCOUNTS;
  const eWallets = settings.eWallets || INITIAL_EWALLETS;
  const qrisConfig = settings.qrisConfig || INITIAL_QRIS;
  const channels = settings.enabledPaymentChannels || {
    qris: true,
    virtualAccount: true,
    eWallet: true,
    bankTransfer: true,
  };

  // Toggle Master Channels
  const handleToggleChannel = (key: keyof PaymentChannelsControl) => {
    const updatedChannels = {
      ...channels,
      [key]: !channels[key],
    };
    const updated = {
      ...settings,
      enabledPaymentChannels: updatedChannels,
    };
    onUpdateSettings(updated);
    if (onShowNotification) {
      onShowNotification(`Kategori pembayaran ${key.toUpperCase()} telah di-${updatedChannels[key] ? 'aktifkan' : 'nonaktifkan'}.`);
    }
  };

  // --- BANK TRANSFER ACTIONS ---
  const handleOpenAddBank = () => {
    setBankFormData({
      id: `bt-${Date.now()}`,
      bankName: '',
      accountNumber: '',
      accountHolder: settings.primaryBank?.accountHolder || 'Toko Buku Berkat DMM',
      branch: 'KC Ambon',
      isPrimary: bankTransfers.length === 0,
      isActive: true,
    });
    setEditingBankId(null);
    setIsEditingBank(true);
  };

  const handleOpenEditBank = (bank: BankTransferAccount) => {
    setBankFormData({ ...bank });
    setEditingBankId(bank.id);
    setIsEditingBank(true);
  };

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankFormData.bankName.trim() || !bankFormData.accountNumber.trim()) {
      alert('Nama bank dan nomor rekening wajib diisi.');
      return;
    }

    let updated: BankTransferAccount[];
    if (editingBankId) {
      updated = bankTransfers.map((b) => {
        if (b.id === editingBankId) {
          return { ...bankFormData };
        }
        if (bankFormData.isPrimary) {
          return { ...b, isPrimary: false };
        }
        return b;
      });
    } else {
      const newBank = { ...bankFormData, id: `bt-${Date.now()}` };
      if (newBank.isPrimary) {
        updated = bankTransfers.map((b) => ({ ...b, isPrimary: false })).concat(newBank);
      } else {
        updated = [...bankTransfers, newBank];
      }
    }

    const primaryOne = updated.find((b) => b.isPrimary) || updated[0];
    const secondaryOne = updated.find((b) => !b.isPrimary && b.isActive);

    const updatedSettings: StoreSettings = {
      ...settings,
      bankTransfers: updated,
      primaryBank: primaryOne ? {
        bankName: primaryOne.bankName,
        accountNumber: primaryOne.accountNumber,
        accountHolder: primaryOne.accountHolder,
        branch: primaryOne.branch,
        isActive: primaryOne.isActive,
      } : settings.primaryBank,
      secondaryBank: secondaryOne ? {
        bankName: secondaryOne.bankName,
        accountNumber: secondaryOne.accountNumber,
        accountHolder: secondaryOne.accountHolder,
        branch: secondaryOne.branch,
        isActive: secondaryOne.isActive,
      } : settings.secondaryBank,
    };

    onUpdateSettings(updatedSettings);
    setIsEditingBank(false);
    if (onShowNotification) {
      onShowNotification(editingBankId ? 'Rekening bank berhasil diperbarui.' : 'Rekening bank baru berhasil ditambahkan.');
    }
  };

  const handleToggleBankActive = (id: string) => {
    const updated = bankTransfers.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b));
    const primaryOne = updated.find((b) => b.isPrimary) || updated[0];
    const secondaryOne = updated.find((b) => !b.isPrimary && b.isActive);

    onUpdateSettings({
      ...settings,
      bankTransfers: updated,
      primaryBank: primaryOne ? {
        bankName: primaryOne.bankName,
        accountNumber: primaryOne.accountNumber,
        accountHolder: primaryOne.accountHolder,
        branch: primaryOne.branch,
        isActive: primaryOne.isActive,
      } : settings.primaryBank,
      secondaryBank: secondaryOne ? {
        bankName: secondaryOne.bankName,
        accountNumber: secondaryOne.accountNumber,
        accountHolder: secondaryOne.accountHolder,
        branch: secondaryOne.branch,
        isActive: secondaryOne.isActive,
      } : settings.secondaryBank,
    });
  };

  const handleDeleteBank = (id: string, name: string) => {
    if (bankTransfers.length <= 1) {
      alert('Minimal harus ada 1 rekening bank aktif.');
      return;
    }
    if (confirm(`Hapus rekening "${name}" dari daftar transfer manual?`)) {
      const updated = bankTransfers.filter((b) => b.id !== id);
      if (!updated.some((b) => b.isPrimary) && updated.length > 0) {
        updated[0].isPrimary = true;
      }
      onUpdateSettings({ ...settings, bankTransfers: updated });
      if (onShowNotification) {
        onShowNotification(`Rekening "${name}" dihapus.`);
      }
    }
  };

  // --- VIRTUAL ACCOUNT ACTIONS ---
  const handleToggleVA = (id: string) => {
    const updated = virtualAccounts.map((v) => (v.id === id ? { ...v, isActive: !v.isActive } : v));
    onUpdateSettings({ ...settings, virtualAccounts: updated });
  };

  const handleUpdateVAPrefix = (id: string, prefix: string) => {
    const updated = virtualAccounts.map((v) => (v.id === id ? { ...v, prefix } : v));
    onUpdateSettings({ ...settings, virtualAccounts: updated });
  };

  // --- E-WALLET ACTIONS ---
  const handleOpenAddEWallet = () => {
    setEWalletFormData({
      id: `ew-${Date.now()}`,
      name: 'GoPay',
      accountNumber: settings.adminWhatsApp || '081248002026',
      accountHolder: 'Toko Buku Berkat DMM',
      isActive: true,
      instructions: 'Kirim saldo dompet digital ke nomor ponsel resmi toko',
    });
    setEditingEWalletId(null);
    setIsEditingEWallet(true);
  };

  const handleOpenEditEWallet = (ew: EWalletAccount) => {
    setEWalletFormData({ ...ew });
    setEditingEWalletId(ew.id);
    setIsEditingEWallet(true);
  };

  const handleSaveEWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eWalletFormData.accountNumber.trim()) {
      alert('Nomor ponsel akun e-wallet wajib diisi.');
      return;
    }

    let updated: EWalletAccount[];
    if (editingEWalletId) {
      updated = eWallets.map((ew) => (ew.id === editingEWalletId ? { ...eWalletFormData } : ew));
    } else {
      updated = [...eWallets, { ...eWalletFormData, id: `ew-${Date.now()}` }];
    }

    onUpdateSettings({ ...settings, eWallets: updated });
    setIsEditingEWallet(false);
    if (onShowNotification) {
      onShowNotification('Akun E-Wallet berhasil disimpan.');
    }
  };

  const handleToggleEWallet = (id: string) => {
    const updated = eWallets.map((ew) => (ew.id === id ? { ...ew, isActive: !ew.isActive } : ew));
    onUpdateSettings({ ...settings, eWallets: updated });
  };

  const handleDeleteEWallet = (id: string, name: string) => {
    if (eWallets.length <= 1) {
      alert('Minimal sisakan 1 e-wallet.');
      return;
    }
    if (confirm(`Hapus akun E-Wallet ${name}?`)) {
      const updated = eWallets.filter((ew) => ew.id !== id);
      onUpdateSettings({ ...settings, eWallets: updated });
      if (onShowNotification) {
        onShowNotification(`E-Wallet ${name} dihapus.`);
      }
    }
  };

  // --- QRIS ACTIONS ---
  const handleToggleQRIS = () => {
    const updatedQRIS = { ...qrisConfig, isActive: !qrisConfig.isActive };
    onUpdateSettings({
      ...settings,
      qrisConfig: updatedQRIS,
      qrisMerchantName: updatedQRIS.merchantName,
    });
    if (onShowNotification) {
      onShowNotification(`Layanan QRIS telah di-${updatedQRIS.isActive ? 'aktifkan' : 'nonaktifkan'}.`);
    }
  };

  const handleUpdateQRISField = (field: keyof QRISConfig, value: any) => {
    const updatedQRIS = { ...qrisConfig, [field]: value };
    onUpdateSettings({
      ...settings,
      qrisConfig: updatedQRIS,
      ...(field === 'merchantName' ? { qrisMerchantName: value } : {}),
    });
  };

  const handleUploadQRISImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran gambar barcode QRIS maksimal 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        handleUpdateQRISField('qrImageUrl', event.target.result as string);
        if (onShowNotification) {
          onShowNotification('Gambar barcode QRIS resmi toko berhasil diunggah.');
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetAllPayments = () => {
    if (confirm('Kembalikan seluruh konfigurasi pembayaran (Bank, E-Wallet, Transfer, QRIS) ke data bawaan resmi DMM?')) {
      onUpdateSettings({
        ...settings,
        bankTransfers: INITIAL_BANK_TRANSFERS,
        virtualAccounts: INITIAL_VIRTUAL_ACCOUNTS,
        eWallets: INITIAL_EWALLETS,
        qrisConfig: INITIAL_QRIS,
        enabledPaymentChannels: {
          qris: true,
          virtualAccount: true,
          eWallet: true,
          bankTransfer: true,
        },
      });
      if (onShowNotification) {
        onShowNotification('Semua metode pembayaran dikembalikan ke default resmi.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h3 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#0F2C59]" />
            <span>Pengaturan Metode Pembayaran Terpadu</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola 4 pilar pembayaran: Virtual Account Bank, E-Wallet, Transfer Manual, dan QRIS Nasional.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetAllPayments}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 shadow-2xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Default</span>
          </button>
        </div>
      </div>

      {/* 4 MASTER CHANNELS TOGGLE BAR */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Master Switch Saluran Pembayaran Checkout:</span>
          </span>
          <span className="text-[11px] text-slate-500 font-normal">Klik untuk aktif/nonaktifkan kategori</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* QRIS Switch */}
          <button
            type="button"
            onClick={() => handleToggleChannel('qris')}
            className={`p-3 rounded-xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
              channels.qris
                ? 'bg-amber-50/70 border-amber-300 text-amber-950 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-400 opacity-60'
            }`}
          >
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-amber-700" />
              <div>
                <div className="text-xs font-bold">1. QRIS</div>
                <div className="text-[10px] text-slate-500">Scan Barcode</div>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              channels.qris ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
            }`}>
              {channels.qris ? 'Aktif' : 'Mati'}
            </span>
          </button>

          {/* Virtual Account Switch */}
          <button
            type="button"
            onClick={() => handleToggleChannel('virtualAccount')}
            className={`p-3 rounded-xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
              channels.virtualAccount
                ? 'bg-blue-50/70 border-blue-300 text-blue-950 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-400 opacity-60'
            }`}
          >
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-700" />
              <div>
                <div className="text-xs font-bold">2. BANK (VA)</div>
                <div className="text-[10px] text-slate-500">BCA, Mandiri, BRI</div>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              channels.virtualAccount ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
            }`}>
              {channels.virtualAccount ? 'Aktif' : 'Mati'}
            </span>
          </button>

          {/* E-Wallet Switch */}
          <button
            type="button"
            onClick={() => handleToggleChannel('eWallet')}
            className={`p-3 rounded-xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
              channels.eWallet
                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-400 opacity-60'
            }`}
          >
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-700" />
              <div>
                <div className="text-xs font-bold">3. E-WALLET</div>
                <div className="text-[10px] text-slate-500">GoPay, DANA, OVO</div>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              channels.eWallet ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
            }`}>
              {channels.eWallet ? 'Aktif' : 'Mati'}
            </span>
          </button>

          {/* Bank Transfer Switch */}
          <button
            type="button"
            onClick={() => handleToggleChannel('bankTransfer')}
            className={`p-3 rounded-xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
              channels.bankTransfer
                ? 'bg-purple-50/70 border-purple-300 text-purple-950 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-400 opacity-60'
            }`}
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-700" />
              <div>
                <div className="text-xs font-bold">4. TRANSFER</div>
                <div className="text-[10px] text-slate-500">Rekening Manual</div>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              channels.bankTransfer ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
            }`}>
              {channels.bankTransfer ? 'Aktif' : 'Mati'}
            </span>
          </button>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActivePillar('all')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activePillar === 'all'
              ? 'bg-[#0F2C59] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Semua Bagian
        </button>

        <button
          type="button"
          onClick={() => setActivePillar('qris')}
          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activePillar === 'qris'
              ? 'bg-[#0F2C59] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <QrCode className="w-3.5 h-3.5 text-amber-500" />
          <span>QRIS ({qrisConfig.isActive ? 'Aktif' : 'Off'})</span>
        </button>

        <button
          type="button"
          onClick={() => setActivePillar('bank_va')}
          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activePillar === 'bank_va'
              ? 'bg-[#0F2C59] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building className="w-3.5 h-3.5 text-blue-500" />
          <span>Bank VA ({virtualAccounts.filter(v => v.isActive).length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActivePillar('ewallet')}
          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activePillar === 'ewallet'
              ? 'bg-[#0F2C59] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
          <span>E-Wallet ({eWallets.filter(e => e.isActive).length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActivePillar('transfer')}
          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activePillar === 'transfer'
              ? 'bg-[#0F2C59] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-purple-500" />
          <span>Transfer Bank ({bankTransfers.filter(b => b.isActive).length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActivePillar('preview')}
          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ml-auto ${
            activePillar === 'preview'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-amber-800 hover:bg-amber-50'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Live Checkout Preview</span>
        </button>
      </div>

      {/* PILLAR 1: QRIS MANAGEMENT */}
      {(activePillar === 'all' || activePillar === 'qris') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">1. QRIS (Quick Response Code Indonesian Standard)</h4>
                <p className="text-xs text-slate-500">Menerima pembayaran dari semua aplikasi e-wallet & mobile banking di Indonesia</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleQRIS}
              className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                qrisConfig.isActive
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${qrisConfig.isActive ? 'bg-emerald-600' : 'bg-slate-400'}`} />
              <span>{qrisConfig.isActive ? 'QRIS Aktif' : 'QRIS Nonaktif'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            {/* Form Fields */}
            <div className="md:col-span-2 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Nama Merchant QRIS (Tampil ke Pembeli)
                  </label>
                  <input
                    type="text"
                    required
                    value={qrisConfig.merchantName}
                    onChange={(e) => handleUpdateQRISField('merchantName', e.target.value)}
                    placeholder="Contoh: BUKUBERKAT DMM AMBON"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-[#0F2C59]/30 uppercase"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Nama resmi toko yang tercantum pada barcode QRIS.
                  </span>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    NMID (National Merchant ID QRIS)
                  </label>
                  <input
                    type="text"
                    value={qrisConfig.nmid || ''}
                    onChange={(e) => handleUpdateQRISField('nmid', e.target.value)}
                    placeholder="Contoh: ID1020039281728"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-[#0F2C59]/30"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    ID Merchant resmi dari Bank Indonesia / PJSP.
                  </span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Gambar Barcode QRIS Resmi Toko (Opsional / Kustom)
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={qrisConfig.qrImageUrl || ''}
                    onChange={(e) => handleUpdateQRISField('qrImageUrl', e.target.value)}
                    placeholder="Tempel URL gambar barcode QRIS (kosongkan untuk gunakan QR otomatis)"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-[#0F2C59]/30"
                  />
                  <label className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs cursor-pointer border border-slate-200 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload QRIS</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadQRISImage}
                      className="hidden"
                    />
                  </label>
                  {qrisConfig.qrImageUrl && (
                    <button
                      type="button"
                      onClick={() => handleUpdateQRISField('qrImageUrl', '')}
                      className="px-2.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold"
                      title="Gunakan QR Dinamis Bawaan"
                    >
                      Hapus
                    </button>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Jika dikosongkan, sistem secara otomatis menghasilkan kode QRIS dinamis berlogo DMM sesuai total tagihan pembeli.
                </span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Petunjuk Pembayaran QRIS Pelanggan
                </label>
                <textarea
                  rows={2}
                  value={qrisConfig.instructions || ''}
                  onChange={(e) => handleUpdateQRISField('instructions', e.target.value)}
                  placeholder="Instruksi scan QRIS..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0F2C59]/30"
                />
              </div>
            </div>

            {/* QRIS Live Preview Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center text-center space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Tampilan Barcode QRIS:</span>
              <div className="w-32 h-32 bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center overflow-hidden">
                {qrisConfig.qrImageUrl ? (
                  <img
                    src={qrisConfig.qrImageUrl}
                    alt="Custom QRIS"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=00020101021226680016ID.CO.BUKUBERKATDMM.WWW01189360099900000000005204581253033605802ID5914BUKUBERKATDMM6005AMBON6304A1B2"
                    alt="Dynamic QRIS Preview"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
              <span className="font-bold text-slate-900 text-xs">{qrisConfig.merchantName || 'BUKUBERKAT DMM'}</span>
              {qrisConfig.nmid && <span className="text-[10px] font-mono text-slate-400">NMID: {qrisConfig.nmid}</span>}
            </div>
          </div>
        </div>
      )}

      {/* PILLAR 2: BANK (VIRTUAL ACCOUNT) */}
      {(activePillar === 'all' || activePillar === 'bank_va') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">2. BANK (Virtual Account)</h4>
                <p className="text-xs text-slate-500">Nomor VA otomatis unik per nomor HP pembeli dengan prefix resmi bank</p>
              </div>
            </div>

            <span className="text-[11px] font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
              {virtualAccounts.filter((v) => v.isActive).length} Bank VA Aktif
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {virtualAccounts.map((va) => (
              <div
                key={va.id}
                className={`p-3.5 rounded-xl border transition-all space-y-2.5 ${
                  va.isActive ? 'bg-slate-50/60 border-slate-200' : 'bg-slate-100/60 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-700" />
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">
                      Virtual Account {va.bankName}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleVA(va.id)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
                      va.isActive
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {va.isActive ? 'Aktif' : 'Nonaktif'}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Prefix Kode VA</label>
                    <input
                      type="text"
                      value={va.prefix}
                      onChange={(e) => handleUpdateVAPrefix(va.id, e.target.value)}
                      placeholder="80918"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Rumus VA Pelanggan</label>
                    <div className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-slate-700 truncate">
                      {va.prefix} + [8 digit No.HP]
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500">
                  {va.description || `Verifikasi otomatis 24 jam melalui Mobile Banking & ATM ${va.bankName}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PILLAR 3: E-WALLET (DOMPET DIGITAL) */}
      {(activePillar === 'all' || activePillar === 'ewallet') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">3. E-WALLET (Dompet Digital: GoPay, DANA, OVO, ShopeePay)</h4>
                <p className="text-xs text-slate-500">Pelanggan dapat melakukan transfer saldo dompet digital ke nomor resmi toko</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenAddEWallet}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0F2C59] hover:bg-[#1a3d74] text-white font-bold rounded-xl text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah E-Wallet</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {eWallets.map((ew) => (
              <div
                key={ew.id}
                className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                  ew.isActive ? 'bg-slate-50/60 border-slate-200' : 'bg-slate-100/60 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-900 text-sm">{ew.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleEWallet(ew.id)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
                        ew.isActive
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      {ew.isActive ? 'Aktif' : 'Nonaktif'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditEWallet(ew)}
                      className="p-1 text-slate-500 hover:text-slate-800"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteEWallet(ew.id, ew.name)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-medium">Nomor Akun HP:</span>
                    <span className="text-[10px] text-emerald-700 font-bold">{ew.name}</span>
                  </div>
                  <div className="font-mono font-bold text-slate-900 text-sm">{ew.accountNumber}</div>
                  <div className="text-[11px] text-slate-600">
                    a.n. <strong className="text-slate-800">{ew.accountHolder}</strong>
                  </div>
                </div>

                {ew.instructions && (
                  <div className="text-[10px] text-slate-500 italic">
                    ℹ️ {ew.instructions}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PILLAR 4: TRANSFER BANK MANUAL (REKENING RESMI DMM) */}
      {(activePillar === 'all' || activePillar === 'transfer') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">4. TRANSFER (Rekening Bank Transfer Manual)</h4>
                <p className="text-xs text-slate-500">Kelola nomor rekening bank untuk transfer manual (BRI, Mandiri, BCA, Bank Maluku Malut, dll.)</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenAddBank}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0F2C59] hover:bg-[#1a3d74] text-white font-bold rounded-xl text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Rekening</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bankTransfers.map((bank) => (
              <div
                key={bank.id}
                className={`p-4 rounded-xl border transition-all space-y-3 relative ${
                  bank.isActive ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-100 border-dashed border-slate-300 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h5 className="font-bold text-slate-900 text-sm">{bank.bankName}</h5>
                      {bank.isPrimary && (
                        <span className="bg-purple-100 text-purple-900 font-extrabold text-[9px] px-2 py-0.5 rounded-full">
                          Utama
                        </span>
                      )}
                    </div>
                    {bank.branch && (
                      <span className="text-[11px] text-slate-500 block">{bank.branch}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggleBankActive(bank.id)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
                        bank.isActive
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      {bank.isActive ? 'Aktif' : 'Nonaktif'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditBank(bank)}
                      className="p-1 text-slate-500 hover:text-slate-800"
                      title="Edit Rekening"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBank(bank.id, bank.bankName)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                      title="Hapus Rekening"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                  <div className="text-[10px] text-slate-400 font-medium">Nomor Rekening:</div>
                  <div className="font-mono font-extrabold text-base text-slate-900 tracking-wider">
                    {bank.accountNumber}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Atas Nama: <strong className="text-slate-800 uppercase">{bank.accountHolder}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Instructions Field */}
          <div className="pt-2">
            <label className="font-semibold text-slate-700 block mb-1 text-xs">
              Petunjuk Transfer Umum untuk Pembeli
            </label>
            <textarea
              rows={2}
              value={settings.paymentInstructions || ''}
              onChange={(e) => onUpdateSettings({ ...settings, paymentInstructions: e.target.value })}
              placeholder="Petunjuk verifikasi transfer..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0F2C59]/30"
            />
          </div>
        </div>
      )}

      {/* LIVE CHECKOUT PREVIEW (Simulasi Checkout Pembeli) */}
      {(activePillar === 'all' || activePillar === 'preview') && (
        <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Pratinjau Langsung Checkout Pelanggan (Customer Checkout View)
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Sesuai Konfigurasi Terkini</span>
          </div>

          <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 space-y-3">
            <div className="text-xs font-semibold text-slate-300">Pilihan Saluran yang Muncul di Mata Pembeli:</div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {channels.qris && qrisConfig.isActive && (
                <div className="bg-white/10 p-2.5 rounded-lg border border-white/20 text-xs">
                  <QrCode className="w-4 h-4 text-amber-400 mb-1" />
                  <div className="font-bold text-white text-xs">QRIS Dinamis</div>
                  <div className="text-[10px] text-slate-300">Semua E-Wallet & Bank</div>
                </div>
              )}

              {channels.virtualAccount && virtualAccounts.filter(v => v.isActive).map(va => (
                <div key={va.id} className="bg-white/10 p-2.5 rounded-lg border border-white/20 text-xs">
                  <Building className="w-4 h-4 text-blue-400 mb-1" />
                  <div className="font-bold text-white text-xs">{va.bankName} VA</div>
                  <div className="text-[10px] text-slate-300">Prefix: {va.prefix}</div>
                </div>
              ))}

              {channels.eWallet && eWallets.filter(e => e.isActive).map(ew => (
                <div key={ew.id} className="bg-white/10 p-2.5 rounded-lg border border-white/20 text-xs">
                  <Smartphone className="w-4 h-4 text-emerald-400 mb-1" />
                  <div className="font-bold text-white text-xs">{ew.name}</div>
                  <div className="text-[10px] text-slate-300">{ew.accountNumber}</div>
                </div>
              ))}

              {channels.bankTransfer && (
                <div className="bg-white/10 p-2.5 rounded-lg border border-white/20 text-xs">
                  <Building2 className="w-4 h-4 text-purple-400 mb-1" />
                  <div className="font-bold text-white text-xs">Transfer Manual</div>
                  <div className="text-[10px] text-slate-300">{bankTransfers.filter(b => b.isActive).length} Rekening Aktif</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT / TAMBAH REKENING BANK */}
      {isEditingBank && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#0F2C59]" />
                <span>{editingBankId ? 'Edit Rekening Bank' : 'Tambah Rekening Bank Baru'}</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsEditingBank(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBank} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Bank</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bank BRI / Bank Mandiri / Bank Maluku Malut"
                  value={bankFormData.bankName}
                  onChange={(e) => setBankFormData({ ...bankFormData, bankName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0F2C59]/30"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nomor Rekening</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 0018-01-002934-50-8"
                  value={bankFormData.accountNumber}
                  onChange={(e) => setBankFormData({ ...bankFormData, accountNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:ring-2 focus:ring-[#0F2C59]/30"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Atas Nama Pemilik Rekening</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Gereja Masehi Advent Hari Ketujuh DMM"
                  value={bankFormData.accountHolder}
                  onChange={(e) => setBankFormData({ ...bankFormData, accountHolder: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs uppercase font-semibold focus:ring-2 focus:ring-[#0F2C59]/30"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Kantor Cabang</label>
                <input
                  type="text"
                  placeholder="Contoh: KC Ambon / KCP Pattimura"
                  value={bankFormData.branch || ''}
                  onChange={(e) => setBankFormData({ ...bankFormData, branch: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0F2C59]/30"
                />
              </div>

              <div className="pt-1 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bankFormData.isPrimary}
                    onChange={(e) => setBankFormData({ ...bankFormData, isPrimary: e.target.checked })}
                    className="w-4 h-4 text-[#0F2C59] rounded border-slate-300"
                  />
                  <span className="font-semibold text-slate-800">Tandai sebagai Rekening Utama</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bankFormData.isActive}
                    onChange={(e) => setBankFormData({ ...bankFormData, isActive: e.target.checked })}
                    className="w-4 h-4 text-[#0F2C59] rounded border-slate-300"
                  />
                  <span className="font-semibold text-slate-800">Status Rekening Aktif</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditingBank(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0F2C59] hover:bg-[#1a3d74] text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Rekening</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT / TAMBAH E-WALLET */}
      {isEditingEWallet && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>{editingEWalletId ? 'Edit Akun E-Wallet' : 'Tambah Akun E-Wallet Baru'}</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsEditingEWallet(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEWallet} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama E-Wallet</label>
                <select
                  value={eWalletFormData.name}
                  onChange={(e) => setEWalletFormData({ ...eWalletFormData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0F2C59]/30 font-semibold"
                >
                  <option value="GoPay">GoPay</option>
                  <option value="DANA">DANA</option>
                  <option value="OVO">OVO</option>
                  <option value="ShopeePay">ShopeePay</option>
                  <option value="LinkAja">LinkAja</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nomor Ponsel Akun E-Wallet</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 081248002026"
                  value={eWalletFormData.accountNumber}
                  onChange={(e) => setEWalletFormData({ ...eWalletFormData, accountNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:ring-2 focus:ring-[#0F2C59]/30"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Pemilik Akun</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Toko Buku Berkat DMM"
                  value={eWalletFormData.accountHolder}
                  onChange={(e) => setEWalletFormData({ ...eWalletFormData, accountHolder: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-[#0F2C59]/30"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Petunjuk Singkat Pembayaran</label>
                <input
                  type="text"
                  placeholder="Contoh: Kirim uang / transfer saldo ke nomor di atas"
                  value={eWalletFormData.instructions || ''}
                  onChange={(e) => setEWalletFormData({ ...eWalletFormData, instructions: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0F2C59]/30"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={eWalletFormData.isActive}
                    onChange={(e) => setEWalletFormData({ ...eWalletFormData, isActive: e.target.checked })}
                    className="w-4 h-4 text-[#0F2C59] rounded border-slate-300"
                  />
                  <span className="font-semibold text-slate-800">Status Akun E-Wallet Aktif</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditingEWallet(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0F2C59] hover:bg-[#1a3d74] text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan E-Wallet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
