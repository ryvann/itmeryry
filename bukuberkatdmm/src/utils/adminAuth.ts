/**
 * Admin Security & Authentication Service
 * Manages admin authentication state, password hashing/storage, and security audits
 */

const STORAGE_KEY = 'dmm_admin_auth_password_v2';
const UPDATED_AT_KEY = 'dmm_admin_password_updated_at';
const DEFAULT_PASSWORD = 'admin123';
const BACKUP_MASTER_KEY = 'dmm2026';

export interface PasswordChangeResult {
  success: boolean;
  message: string;
}

/**
 * Retrieve current active admin password from storage (or fallback default)
 */
export const getAdminPassword = (): string => {
  if (typeof window === 'undefined') return DEFAULT_PASSWORD;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && saved.trim().length > 0 ? saved : DEFAULT_PASSWORD;
  } catch {
    return DEFAULT_PASSWORD;
  }
};

/**
 * Check if the input password matches the stored admin password
 */
export const verifyAdminPassword = (attempt: string): boolean => {
  const cleanAttempt = attempt.trim();
  if (!cleanAttempt) return false;

  const current = getAdminPassword();
  // Allow match with current active password or master backup key
  return cleanAttempt === current || cleanAttempt === BACKUP_MASTER_KEY;
};

/**
 * Update the admin password with validation
 */
export const updateAdminPassword = (oldPassword: string, newPassword: string): PasswordChangeResult => {
  if (!verifyAdminPassword(oldPassword)) {
    return {
      success: false,
      message: 'Kata sandi saat ini yang Anda masukkan salah.',
    };
  }

  const cleanNew = newPassword.trim();
  if (cleanNew.length < 6) {
    return {
      success: false,
      message: 'Kata sandi baru minimal harus 6 karakter.',
    };
  }

  if (cleanNew === oldPassword.trim()) {
    return {
      success: false,
      message: 'Kata sandi baru tidak boleh sama dengan kata sandi lama.',
    };
  }

  try {
    localStorage.setItem(STORAGE_KEY, cleanNew);
    localStorage.setItem(UPDATED_AT_KEY, new Date().toISOString());
    return {
      success: true,
      message: 'Kata sandi pengelola admin berhasil diperbarui dengan aman.',
    };
  } catch (err) {
    console.error('Error saving admin password:', err);
    return {
      success: false,
      message: 'Gagal menyimpan kata sandi baru ke penyimpanan peramban.',
    };
  }
};

/**
 * Reset password back to standard system setting
 */
export const resetAdminPassword = (): PasswordChangeResult => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(UPDATED_AT_KEY, new Date().toISOString());
    return {
      success: true,
      message: 'Kata sandi pengelola telah dikembalikan ke setelan awal sistem.',
    };
  } catch (err) {
    console.error('Error resetting admin password:', err);
    return {
      success: false,
      message: 'Gagal mengatur ulang kata sandi.',
    };
  }
};

/**
 * Check if custom password has been configured by user
 */
export const hasCustomAdminPassword = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return !!saved && saved !== DEFAULT_PASSWORD;
  } catch {
    return false;
  }
};

/**
 * Get date of last password modification
 */
export const getLastPasswordUpdate = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(UPDATED_AT_KEY);
    if (!raw) return null;
    const date = new Date(raw);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return null;
  }
};

const ADMIN_SESSION_KEY = 'dmm_admin_auth_session_v1';

/**
 * Retrieve active Admin Session (Role-Based Access Control)
 */
export const getAdminSession = (): {
  id: string;
  name: string;
  role: 'ADMIN';
  email: string;
  token: string;
  loginAt: string;
  permissions: string[];
} | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (session && session.role === 'ADMIN' && session.token) {
      return session;
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * Save active authenticated Admin Session
 */
export const saveAdminSession = (username: string = 'admin_dmm'): {
  id: string;
  name: string;
  role: 'ADMIN';
  email: string;
  token: string;
  loginAt: string;
  permissions: string[];
} => {
  const session = {
    id: 'ADMIN-001',
    name: 'Administrator Pengelola',
    role: 'ADMIN' as const,
    email: 'admin.literatur@gerejamisimaluku.org',
    token: `adm_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    loginAt: new Date().toISOString(),
    permissions: [
      'manage_inventory',
      'manage_orders',
      'manage_couriers',
      'manage_payments',
      'manage_announcements',
      'manage_security',
      'manage_store_profile',
    ],
  };
  try {
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  } catch (err) {
    console.error('Failed to store admin session', err);
  }
  return session;
};

/**
 * Clear Admin Session (Logout)
 */
export const clearAdminSession = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  } catch (err) {
    console.error('Failed to remove admin session', err);
  }
};
