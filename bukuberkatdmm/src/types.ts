export type BookCategory = 
  | 'Rohani & Doa'
  | 'Keluarga & Pernikahan'
  | 'Kesehatan Alami'
  | 'Pendidikan Anak'
  | 'Misi & Sejarah Maluku';

export interface Book {
  id: string;
  title: string;
  author: string;
  category: BookCategory;
  price: number;
  originalPrice?: number;
  stock: number;
  weightGrams: number; // For shipping calculation
  coverImage: string;
  description: string;
  publisher: string;
  pages: number;
  isbn: string;
  featured?: boolean;
  bestseller?: boolean;
  badge?: string;
  publishedYear?: number;
}

export interface CartItem {
  book: Book;
  quantity: number;
}

export type OrderStatus = 
  | 'Menunggu Pembayaran'
  | 'Dibayar & Diproses'
  | 'Sedang Dikemas'
  | 'Dikirim'
  | 'Selesai'
  | 'Dibatalkan';

export type PaymentMethodType = 
  | 'qris'
  | 'bca_va'
  | 'mandiri_va'
  | 'bri_va'
  | 'bni_va'
  | 'gopay'
  | 'dana'
  | 'ovo'
  | 'shopeepay'
  | 'bank_transfer'
  | string;

export interface BankAccountInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  branch?: string;
  isActive?: boolean;
}

export interface CourierOption {
  id: string;
  name: string; // e.g. "JNE Express", "POS Indonesia", "J&T Express", "SiCepat"
  code: string; // e.g. "JNE", "POS", "J&T", "SICEPAT", "KAPAL"
  serviceType: string; // e.g. "Reguler", "Kilat Khusus Maluku", "EZ", "Kargo"
  multiplier: number; // e.g. 1.0, 0.95, 1.05, 0.90
  estimatedLeadDays: string; // e.g. "2-3 Hari"
  isActive: boolean;
  notes?: string;
}

export interface BankTransferAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  branch?: string;
  isPrimary: boolean;
  isActive: boolean;
}

export interface EWalletAccount {
  id: string;
  name: 'GoPay' | 'DANA' | 'OVO' | 'ShopeePay' | string;
  accountNumber: string;
  accountHolder: string;
  isActive: boolean;
  instructions?: string;
}

export interface VirtualAccountConfig {
  id: string;
  bankName: string; // 'BCA' | 'Mandiri' | 'BRI' | 'BNI'
  bankCode: string; // 'bca_va' | 'mandiri_va' | 'bri_va' | 'bni_va'
  prefix: string; // '80918', '88902', '12984', '98801'
  isActive: boolean;
  description?: string;
}

export interface QRISConfig {
  merchantName: string;
  nmid?: string;
  qrImageUrl?: string;
  instructions?: string;
  isActive: boolean;
}

export interface PaymentChannelsControl {
  qris: boolean;
  virtualAccount: boolean;
  eWallet: boolean;
  bankTransfer: boolean;
}

export interface WebsiteFeatureProp {
  text: string;
  iconName: 'CheckCircle' | 'Truck' | 'Sparkles' | 'Shield' | 'Heart' | 'BookOpen';
}

export interface WebsiteHeroConfig {
  showHeroBanner: boolean;
  badgeText: string;
  headlinePrefix: string;
  headlineHighlight: string;
  headlineSuffix: string;
  description: string;
  bannerTheme: 'royal-navy' | 'emerald-mission' | 'deep-burgundy' | 'ocean-blue' | 'warm-amber';
  features: [WebsiteFeatureProp, WebsiteFeatureProp, WebsiteFeatureProp, WebsiteFeatureProp];
}

export interface WebsiteBrandingConfig {
  storeName: string;
  storeTagline: string;
  storeBadge: string;
  customLogoUrl?: string;
  fontStyle: 'classic-serif' | 'modern-sans';
  themeColor: 'navy' | 'emerald' | 'burgundy' | 'blue';
}

export interface WebsiteAboutConfig {
  showAboutSection: boolean;
  sectionBadge: string;
  sectionTitle: string;
  sectionSubtitle: string;
  paragraph1: string;
  paragraph2: string;
  pillar1Title: string;
  pillar1Desc: string;
  pillar2Title: string;
  pillar2Desc: string;
  pillar3Title: string;
  pillar3Desc: string;
}

export interface WebsiteFooterConfig {
  tagline: string;
  copyrightText: string;
  coverageText: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
}

export interface WebsiteBillboardConfig {
  showBillboard: boolean;
  sectionTitle: string;
  sectionSubtitle: string;
}

export interface WebsiteAppearanceConfig {
  branding: WebsiteBrandingConfig;
  hero: WebsiteHeroConfig;
  billboard?: WebsiteBillboardConfig;
  about: WebsiteAboutConfig;
  footer: WebsiteFooterConfig;
}

export interface StoreSettings {
  storeName?: string;
  primaryBank: BankAccountInfo;
  secondaryBank?: BankAccountInfo;
  qrisMerchantName: string;
  whatsappNumber: string;
  adminWhatsApp?: string;
  storeEmail: string;
  storeAddress: string;
  operatingHours: string;
  paymentInstructions?: string;
  // Extended Courier & Payment management
  couriers: CourierOption[];
  bankTransfers: BankTransferAccount[];
  eWallets: EWalletAccount[];
  virtualAccounts: VirtualAccountConfig[];
  qrisConfig: QRISConfig;
  enabledPaymentChannels?: PaymentChannelsControl;
  // Website Appearance & CMS
  websiteConfig?: WebsiteAppearanceConfig;
}

export interface ShippingDetails {
  recipientName: string;
  phoneNumber: string; // WhatsApp number
  email: string; // Active email (Wajib email aktif pelanggan)
  province: string;
  city: string;
  district: string;
  address: string;
  postalCode: string;
  courier: string;
  serviceType: string;
  shippingCost: number;
  estimatedDelivery: string;
  notes?: string;
}

export interface TrackingStep {
  status: string;
  location: string;
  timestamp: string;
  description: string;
  completed: boolean;
}

export interface Order {
  id: string; // e.g. ORD-2026-0901
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  totalAmount: number;
  shipping: ShippingDetails;
  paymentMethod: PaymentMethodType;
  paymentStatus: 'unpaid' | 'paid' | 'expired';
  paymentGatewayTrxId?: string;
  orderStatus: OrderStatus;
  trackingNumber?: string; // e.g. BBDMM-JNE-881920
  trackingHistory: TrackingStep[];
  whatsAppNotifications: WhatsAppNotificationRecord[];
}

export interface WhatsAppNotificationRecord {
  id: string;
  timestamp: string;
  phoneNumber: string;
  messageType: 'order_created' | 'payment_confirmed' | 'order_shipped' | 'order_delivered' | 'order_cancelled';
  messageText: string;
  status: 'sent' | 'pending' | 'delivered';
}

export interface AnnouncementItem {
  id: string;
  text: string;
  link?: string;
  type: 'promo' | 'info' | 'announcement';
  active: boolean;
}

export type UserRole = 'GUEST' | 'CUSTOMER' | 'ADMIN';

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  role: 'ADMIN';
  email: string;
  token: string;
  loginAt: string;
  permissions: string[];
}

export interface CustomerUser {
  id: string;
  email: string; // Email aktif terverifikasi (Google Mail / email aktif)
  name: string;
  phone: string;
  password?: string; // Kata sandi akun aktif
  authProvider?: 'google' | 'email_password' | 'demo';
  avatarUrl?: string;
  googleSub?: string;
  address?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  isEmailVerified: boolean;
  registeredAt: string;
  lastLoginAt: string;
}

export interface CustomerInquiry {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  bookId?: string;
  bookTitle?: string;
  bookCategory?: string;
  message: string;
  region?: string;
  channel: 'whatsapp' | 'web';
  status: 'pending' | 'replied';
  repliedAt?: string;
}

