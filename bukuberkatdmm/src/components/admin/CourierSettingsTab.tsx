import React, { useState } from 'react';
import { 
  Truck, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  RotateCcw, 
  Save, 
  Info, 
  CheckCircle2, 
  X, 
  Percent, 
  Clock, 
  Navigation,
  Sparkles
} from 'lucide-react';
import { CourierOption, StoreSettings } from '../../types';
import { INITIAL_COURIERS } from '../../data/initialSettings';
import { formatRupiah } from '../../utils/formatters';

interface CourierSettingsTabProps {
  settings: StoreSettings;
  onUpdateSettings: (newSettings: StoreSettings) => void;
  onShowNotification?: (msg: string) => void;
}

export const CourierSettingsTab: React.FC<CourierSettingsTabProps> = ({
  settings,
  onUpdateSettings,
  onShowNotification,
}) => {
  const couriers = settings.couriers || INITIAL_COURIERS;

  // Add / Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editingCourierId, setEditingCourierId] = useState<string | null>(null);

  const [formData, setFormData] = useState<CourierOption>({
    id: '',
    name: '',
    code: '',
    serviceType: '',
    multiplier: 1.0,
    estimatedLeadDays: '2-3 Hari',
    isActive: true,
    notes: '',
  });

  const handleOpenAdd = () => {
    setFormData({
      id: `courier-${Date.now()}`,
      name: '',
      code: '',
      serviceType: 'Reguler',
      multiplier: 1.0,
      estimatedLeadDays: '2-3 Hari',
      isActive: true,
      notes: '',
    });
    setEditingCourierId(null);
    setIsEditing(true);
  };

  const handleOpenEdit = (courier: CourierOption) => {
    setFormData({ ...courier });
    setEditingCourierId(courier.id);
    setIsEditing(true);
  };

  const handleToggleActive = (id: string) => {
    const updated = couriers.map((c) =>
      c.id === id ? { ...c, isActive: !c.isActive } : c
    );
    const newSettings = { ...settings, couriers: updated };
    onUpdateSettings(newSettings);
    if (onShowNotification) {
      const target = updated.find((c) => c.id === id);
      onShowNotification(`Status ekspedisi "${target?.name}" diperbarui (${target?.isActive ? 'Aktif' : 'Nonaktif'}).`);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (couriers.length <= 1) {
      alert('Minimal harus ada 1 ekspedisi kurir yang terdaftar.');
      return;
    }
    if (confirm(`Hapus ekspedisi kurir "${name}" dari daftar pilihan toko?`)) {
      const updated = couriers.filter((c) => c.id !== id);
      const newSettings = { ...settings, couriers: updated };
      onUpdateSettings(newSettings);
      if (onShowNotification) {
        onShowNotification(`Ekspedisi "${name}" telah dihapus.`);
      }
    }
  };

  const handleResetToDefault = () => {
    if (confirm('Kembalikan daftar ekspedisi kurir ke setelan awal resmi Maluku?')) {
      const newSettings = { ...settings, couriers: INITIAL_COURIERS };
      onUpdateSettings(newSettings);
      if (onShowNotification) {
        onShowNotification('Daftar ekspedisi berhasil dikembalikan ke standar awal.');
      }
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      alert('Nama dan kode kurir wajib diisi.');
      return;
    }

    let updated: CourierOption[];
    if (editingCourierId) {
      updated = couriers.map((c) => (c.id === editingCourierId ? { ...formData } : c));
    } else {
      updated = [{ ...formData, id: `courier-${Date.now()}` }, ...couriers];
    }

    const newSettings = { ...settings, couriers: updated };
    onUpdateSettings(newSettings);
    setIsEditing(false);
    if (onShowNotification) {
      onShowNotification(editingCourierId ? 'Perubahan kurir berhasil disimpan.' : 'Ekspedisi kurir baru berhasil ditambahkan.');
    }
  };

  const activeCount = couriers.filter((c) => c.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h3 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#0F2C59]" />
            <span>Pilihan Ekspedisi Kurir Pengiriman</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Atur kurir yang tersedia untuk pelanggan di checkout, tarif pengali ongkos kirim, dan estimasi waktu sampai.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 shadow-2xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Default</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F2C59] hover:bg-[#1a3d74] text-white font-bold rounded-xl text-xs shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Ekspedisi</span>
          </button>
        </div>
      </div>

      {/* Info Status Banner */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0 text-amber-800">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold block">Status Kurir Aktif Saat Ini:</span>
            <span className="text-amber-800/80 text-[11px]">
              {activeCount} dari {couriers.length} ekspedisi aktif dan dapat dipilih pembeli di halaman Checkout.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold text-[11px] flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {activeCount} Aktif
          </span>
          {couriers.length - activeCount > 0 && (
            <span className="bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full font-bold text-[11px]">
              {couriers.length - activeCount} Nonaktif
            </span>
          )}
        </div>
      </div>

      {/* Couriers Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {couriers.map((courier) => {
          const sampleBaseCost = 25000;
          const calculatedSample = Math.round(sampleBaseCost * courier.multiplier);

          return (
            <div
              key={courier.id}
              className={`p-4 rounded-2xl border transition-all space-y-3 relative ${
                courier.isActive
                  ? 'bg-white border-slate-200 shadow-xs'
                  : 'bg-slate-50 border-dashed border-slate-300 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                    courier.isActive
                      ? 'bg-[#0F2C59] text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-slate-900 text-sm">{courier.name}</h4>
                      <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {courier.code}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 block font-medium">
                      {courier.serviceType}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <button
                  type="button"
                  onClick={() => handleToggleActive(courier.id)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                    courier.isActive
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                  title="Klik untuk mengubah status aktif/nonaktif"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${courier.isActive ? 'bg-emerald-600' : 'bg-slate-400'}`} />
                  <span>{courier.isActive ? 'Aktif' : 'Nonaktif'}</span>
                </button>
              </div>

              {/* Stats & Multipliers */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Estimasi Tiba:
                  </span>
                  <span className="font-bold text-slate-800">{courier.estimatedLeadDays}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium flex items-center gap-1">
                    <Percent className="w-3 h-3 text-slate-400" />
                    Pengali Tarif:
                  </span>
                  <span className={`font-bold ${
                    courier.multiplier < 1.0
                      ? 'text-emerald-700'
                      : courier.multiplier > 1.0
                      ? 'text-amber-700'
                      : 'text-slate-800'
                  }`}>
                    {courier.multiplier}x {courier.multiplier < 1.0 ? `(Diskon ${Math.round((1 - courier.multiplier) * 100)}%)` : courier.multiplier > 1.0 ? `(+${Math.round((courier.multiplier - 1) * 100)}%)` : '(Standar)'}
                  </span>
                </div>
              </div>

              {/* Note / Route */}
              {courier.notes && (
                <div className="text-[11px] text-slate-500 bg-amber-50/40 p-2 rounded-lg border border-amber-100/60 flex items-start gap-1.5">
                  <Navigation className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                  <span>{courier.notes}</span>
                </div>
              )}

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-[10px] text-slate-400">
                  Contoh Rp 25.000 → <strong className="text-slate-700">{formatRupiah(calculatedSample)}</strong>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(courier)}
                    className="p-1.5 text-slate-600 hover:text-[#0F2C59] hover:bg-slate-100 rounded-lg transition-colors"
                    title="Edit Ekspedisi"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(courier.id, courier.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Hapus Ekspedisi"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Preview of Checkout Dropdown */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Pratinjau Tampilan Pelanggan (Customer Checkout Preview)
            </span>
          </div>
          <span className="text-[10px] text-slate-400">Tampilan Saat Pelanggan Checkout</span>
        </div>

        <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-2">
          <label className="text-xs text-slate-300 font-medium block">
            Pilihan Ekspedisi Kurir (Sesuai Konfigurasi Aktif):
          </label>
          <div className="bg-white text-slate-800 rounded-xl px-3 py-2 text-xs font-medium flex items-center justify-between border border-slate-300">
            <span>{couriers.find((c) => c.isActive)?.name || 'Pilih Ekspedisi'} ({couriers.find((c) => c.isActive)?.serviceType})</span>
            <span className="text-[10px] text-slate-500 font-mono">
              Est: {couriers.find((c) => c.isActive)?.estimatedLeadDays}
            </span>
          </div>

          <div className="text-[11px] text-slate-400 pt-1">
            Hanya kurir dengan status <strong className="text-emerald-400">Aktif</strong> yang akan muncul di formulir checkout pembeli.
          </div>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#0F2C59]" />
                <span>{editingCourierId ? 'Edit Ekspedisi Kurir' : 'Tambah Ekspedisi Baru'}</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Ekspedisi</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: JNE Express / POS Indonesia / Kapal Cepat"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0F2C59]/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kode Singkat</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: JNE / POS / J&T"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono uppercase focus:ring-2 focus:ring-[#0F2C59]/30"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Jenis Layanan</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Reguler / Kilat / Kargo"
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0F2C59]/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Pengali Tarif (Multiplier)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.3"
                    max="3.0"
                    required
                    value={formData.multiplier}
                    onChange={(e) => setFormData({ ...formData, multiplier: parseFloat(e.target.value) || 1.0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-[#0F2C59]/30"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    1.0 = Normal, 0.9 = Diskon 10%, 1.1 = +10%
                  </span>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Estimasi Pengiriman</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 2-3 Hari / 1-2 Hari"
                    value={formData.estimatedLeadDays}
                    onChange={(e) => setFormData({ ...formData, estimatedLeadDays: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0F2C59]/30"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Catatan Khusus / Area Jangkauan</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan rute kurir, contoh: Melayani pulau Ambon, Saparua, Masohi dan sekitarnya."
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0F2C59]/30"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-[#0F2C59] rounded border-slate-300 focus:ring-[#0F2C59]"
                  />
                  <span className="font-semibold text-slate-800">Aktifkan ekspedisi ini untuk pelanggan</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0F2C59] hover:bg-[#1a3d74] text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Ekspedisi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
