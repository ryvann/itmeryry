import { CustomerUser } from '../types';

export const INITIAL_CUSTOMERS: CustomerUser[] = [
  {
    id: 'CUST-001',
    email: 'ryvansadondang@gmail.com',
    name: 'Ryvan Sadondang',
    phone: '081240192831',
    password: 'password123',
    authProvider: 'google',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    city: 'Kota Ambon',
    district: 'Sirimau',
    address: 'Jl. Sam Ratulangi No. 12, RT 03 / RW 02',
    postalCode: '97126',
    isEmailVerified: true,
    registeredAt: '2026-01-15T09:00:00.000Z',
    lastLoginAt: new Date().toISOString(),
  },
  {
    id: 'CUST-002',
    email: 'pattiradjawane.y@gmail.com',
    name: 'Bpk. Yohanes Pattiradjawane',
    phone: '081248002931',
    password: 'password123',
    authProvider: 'email_password',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    city: 'Kota Ambon',
    district: 'Nusaniwe (Kudamati)',
    address: 'Jl. Dr. Kayadoe No. 45, RT 02 / RW 04',
    postalCode: '97116',
    isEmailVerified: true,
    registeredAt: '2026-02-10T11:20:00.000Z',
    lastLoginAt: new Date().toISOString(),
  },
  {
    id: 'CUST-003',
    email: 'marta.lekatompessy@gmail.com',
    name: 'Ibu Marta Lekatompessy',
    phone: '085243110928',
    password: 'password123',
    authProvider: 'email_password',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    city: 'Maluku Tengah (Masohi)',
    district: 'Kota Masohi',
    address: 'Jl. Geser No. 8, Kompleks Jemaat Masohi',
    postalCode: '97511',
    isEmailVerified: true,
    registeredAt: '2026-03-01T14:30:00.000Z',
    lastLoginAt: new Date().toISOString(),
  }
];

export const isGoogleEmail = (email: string): boolean => {
  const clean = email.trim().toLowerCase();
  return clean.endsWith('@gmail.com') || clean.endsWith('@googlemail.com');
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim().toLowerCase());
};

export const loadStoredCustomers = (): CustomerUser[] => {
  try {
    const data = localStorage.getItem('bukuberkat_customers');
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure default passwords and fields exist
        return parsed.map((cust: CustomerUser) => ({
          ...cust,
          password: cust.password || 'password123',
          authProvider: cust.authProvider || (isGoogleEmail(cust.email) ? 'google' : 'email_password'),
        }));
      }
    }
  } catch (e) {
    console.error('Failed to load customers from storage', e);
  }
  return INITIAL_CUSTOMERS;
};

export const findCustomerByEmail = (email: string): CustomerUser | undefined => {
  const all = loadStoredCustomers();
  return all.find((c) => c.email.trim().toLowerCase() === email.trim().toLowerCase());
};

export const saveStoredCustomers = (customers: CustomerUser[]): void => {
  try {
    localStorage.setItem('bukuberkat_customers', JSON.stringify(customers));
  } catch (e) {
    console.error('Failed to save customers to storage', e);
  }
};

export const loadCurrentCustomerSession = (): CustomerUser | null => {
  try {
    const data = localStorage.getItem('bukuberkat_current_customer');
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load customer session', e);
  }
  return null;
};

export const saveCurrentCustomerSession = (customer: CustomerUser | null): void => {
  try {
    if (customer) {
      localStorage.setItem('bukuberkat_current_customer', JSON.stringify(customer));
    } else {
      localStorage.removeItem('bukuberkat_current_customer');
    }
  } catch (e) {
    console.error('Failed to save customer session', e);
  }
};

export const clearCurrentCustomerSession = (): void => {
  saveCurrentCustomerSession(null);
};

