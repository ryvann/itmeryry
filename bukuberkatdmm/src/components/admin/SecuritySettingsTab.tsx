import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  Check, 
  AlertCircle, 
  RotateCcw, 
  Sparkles, 
  ShieldAlert,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { 
  updateAdminPassword, 
  resetAdminPassword, 
  hasCustomAdminPassword, 
  getLastPasswordUpdate 
} from '../../utils/adminAuth';

interface SecuritySettingsTabProps {
  onShowNotification: (message: string) => void;
}

export const SecuritySettingsTab: React.FC<SecuritySettingsTabProps> = ({
  onShowNotification
}) => {
  // Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Visibility Toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Status & Feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Metadata State
  const [isCustom, setIsCustom] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    setIsCustom(hasCustomAdminPassword());
    setLastUpdated(getLastPasswordUpdate());
  }, []);

  // Calculate Password Strength
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Belum diisi', color: 'bg-slate-200', text: 'text-slate-400' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Lemah', color: 'bg-rose-500', text: 'text-rose-600' };
    if (score === 2 || score === 3) return { score: 2, label: 'Cukup Kuat', color: 'bg-amber-500', text: 'text-amber-600' };
    if (score === 4) return { score: 3, label: 'Kuat', color: 'bg-blue-600', text: 'text-blue-600' };
    return { score: 4, label: 'Sangat Kuat & Aman', color: 'bg-emerald-600', text: 'text-emerald-600' };
  };

  const strength = getPasswordStrength(newPassword);
  const isMatch = newPassword && confirmPassword && newPassword === confirmPassword;
  const isMismatch = confirmPassword && newPassword !== confirmPassword;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!currentPassword.trim()) {
      setErrorMessage('Mohon masukkan kata sandi saat ini.');
      return;
    }

    if (!newPassword.trim()) {
      setErrorMessage('Mohon masukkan kata sandi baru.');
      return;
    }

    if (newPassword.trim().length < 6) {
      setErrorMessage('Kata sandi baru minimal harus 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi baru tidak sesuai.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const result = updateAdminPassword(currentPassword, newPassword);
      setIsSubmitting(false);

      if (result.success) {
        setSuccessMessage(result.message);
        onShowNotification('Kata sandi admin berhasil diperbarui!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsCustom(hasCustomAdminPassword());
        setLastUpdated(getLastPasswordUpdate());
      } else {
        setErrorMessage(result.message);
      }
    }, 400);
  };

  const handleResetDefault = () => {
    if (confirm('Apakah Anda yakin ingin mengembalikan kata sandi admin ke setelan awal sistem?')) {
      const result = resetAdminPassword();
      if (result.success) {
        setIsCustom(false);
        setLastUpdated(getLastPasswordUpdate());
        setSuccessMessage('Kata sandi telah dikembalikan ke setelan awal sistem.');
        onShowNotification('Kata sandi berhasil dikembalikan ke setelan awal.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <h3 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0F2C59] text-amber-400 flex items-center justify-center shadow-xs">
              <KeyRound className="w-4 h-4" />
            </div>
            <span>Keamanan & Kata Sandi Pengelola</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Ganti dan perbarui kredensial kata sandi admin untuk menjaga kerahasiaan data pesanan, inventaris buku, dan pengaturan rekening toko.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-full shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Autentikasi Aman
          </span>
        </div>
      </div>

      {/* Main Grid: Form & Security Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Change Password Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#0F2C59]" />
              <h4 className="font-bold text-slate-900 text-sm">Formulir Penggantian Kata Sandi</h4>
            </div>
            <span className="text-[11px] text-slate-400">Tersimpan Otomatis & Terenkripsi</span>
          </div>

          {/* Feedback Banners */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3.5 rounded-2xl text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input 1: Kata Sandi Saat Ini */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Kata Sandi Saat Ini <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  placeholder="Masukkan kata sandi yang aktif saat ini"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    setErrorMessage(null);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 pr-10 text-xs sm:text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/20 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[11px] text-slate-400 block">
                Verifikasi identitas Anda dengan memasukkan kata sandi admin yang sedang berlaku.
              </span>
            </div>

            {/* Input 2: Kata Sandi Baru */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Kata Sandi Baru <span className="text-rose-500">*</span>
                </label>
                {newPassword && (
                  <span className={`text-[11px] font-bold ${strength.text}`}>
                    Kekuatan: {strength.label}
                  </span>
                )}
              </div>
              
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  placeholder="Kombinasi minimal 6 karakter"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setErrorMessage(null);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 pr-10 text-xs sm:text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/20 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Meter Bar */}
              {newPassword && (
                <div className="space-y-1 pt-1">
                  <div className="grid grid-cols-4 gap-1.5 h-1.5">
                    <div className={`rounded-full ${strength.score >= 1 ? strength.color : 'bg-slate-200'}`} />
                    <div className={`rounded-full ${strength.score >= 2 ? strength.color : 'bg-slate-200'}`} />
                    <div className={`rounded-full ${strength.score >= 3 ? strength.color : 'bg-slate-200'}`} />
                    <div className={`rounded-full ${strength.score >= 4 ? strength.color : 'bg-slate-200'}`} />
                  </div>
                </div>
              )}

              <span className="text-[11px] text-slate-400 block">
                Disarankan menggunakan minimal 6–12 karakter dengan paduan huruf dan angka.
              </span>
            </div>

            {/* Input 3: Konfirmasi Kata Sandi Baru */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Ulangi Kata Sandi Baru <span className="text-rose-500">*</span>
                </label>
                {confirmPassword && (
                  <span className={`text-[11px] font-bold ${isMatch ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {isMatch ? '✓ Cocok' : '✕ Tidak Cocok'}
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  placeholder="Ketik ulang kata sandi baru Anda"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrorMessage(null);
                  }}
                  className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 pr-10 text-xs sm:text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                    isMatch 
                      ? 'border-emerald-300 focus:ring-emerald-500/20' 
                      : isMismatch 
                        ? 'border-rose-300 focus:ring-rose-500/20' 
                        : 'border-slate-200 focus:ring-[#0F2C59]/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-[#0F2C59] hover:bg-[#19427e] disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>{isSubmitting ? 'Memperbarui...' : 'Simpan & Perbarui Kata Sandi'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Security Status, Audit & Guidelines (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Status Kredensial Card */}
          <div className="bg-gradient-to-br from-[#0F2C59] to-[#1e4887] text-white p-5 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-400 border border-white/10">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Status: Aman & Terverifikasi
              </span>
            </div>

            <div>
              <h5 className="font-serif font-bold text-base text-white">
                Sesi Otoritas Pengelola Toko
              </h5>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Toko Buku Gereja Misi Maluku beroperasi dengan sistem autentikasi mandiri. Kata sandi mengunci hak akses pengubahan stok, nomor rekening penerima, dan konfirmasi resi kurir.
              </p>
            </div>

            <div className="pt-2 border-t border-white/10 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Tipe Kredensial:</span>
                <span className="font-bold text-amber-300">
                  {isCustom ? 'Kata Sandi Kustom Pribadi' : 'Setelan Sistem'}
                </span>
              </div>

              {lastUpdated && (
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Pembaruan Terakhir:
                  </span>
                  <span className="font-mono text-[11px] text-white">{lastUpdated}</span>
                </div>
              )}
            </div>

            {/* Tombol Kembalikan ke Setelan Awal jika sudah custom */}
            {isCustom && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleResetDefault}
                  className="w-full py-2 bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-white/15"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Kembalikan ke Setelan Awal Sistem</span>
                </button>
              </div>
            )}
          </div>

          {/* Panduan & Pedoman Keamanan Pengelola */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3.5">
            <h5 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Pedoman Keamanan Akun Pengelola</span>
            </h5>

            <ul className="text-xs text-slate-600 space-y-2.5">
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                <span>Jangan membagikan kata sandi admin kepada pihak luar yang tidak berkepentingan dalam tata kelola literatur misi.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                <span>Ganti kata sandi secara berkala (misalnya setiap 3–6 bulan) demi keamanan nomor rekening penerima transaksi.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                <span>Bila Anda lupa kata sandi kustom, hubungi koordinator teknis Toko Buku DMM atau gunakan tombol reset sistem.</span>
              </li>
            </ul>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 italic">
              Daerah Misi Maluku • Pelayanan Literatur & Kebenaran Firman
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
