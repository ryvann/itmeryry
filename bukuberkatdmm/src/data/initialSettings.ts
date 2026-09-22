import { 
  StoreSettings, 
  CourierOption, 
  BankTransferAccount, 
  EWalletAccount, 
  VirtualAccountConfig, 
  QRISConfig,
  WebsiteAppearanceConfig
} from '../types';

export const INITIAL_WEBSITE_CONFIG: WebsiteAppearanceConfig = {
  branding: {
    storeName: 'BukuBerkatDMM',
    storeTagline: 'Rohani • Keluarga • Kesehatan • Maluku',
    storeBadge: 'Pusat Literatur Rohani, Kesehatan & Keluarga Advent Maluku',
    customLogoUrl: '',
    fontStyle: 'classic-serif',
    themeColor: 'navy',
  },
  hero: {
    showHeroBanner: true,
    badgeText: 'Pusat Literatur Rohani, Kesehatan & Keluarga Advent Maluku',
    headlinePrefix: 'Sumber Berkat & Hikmat Rohani bagi',
    headlineHighlight: 'Keluarga Maluku',
    headlineSuffix: '',
    description: 'Menyediakan koleksi buku penguatan iman, pedoman keharmonisan rumah tangga, terapi kesehatan alami holistik, serta literatur pelayanan bagi seluruh jemaat dan masyarakat di Kepulauan Maluku dan Indonesia.',
    bannerTheme: 'royal-navy',
    features: [
      { text: '100% Buku Asli', iconName: 'CheckCircle' },
      { text: 'Kirim ke Seluruh Pulau', iconName: 'Truck' },
      { text: 'QRIS & VA Otomatis', iconName: 'Sparkles' },
      { text: 'Update Resi via WA', iconName: 'Shield' },
    ],
  },
  billboard: {
    showBillboard: true,
    sectionTitle: 'Segera Rilis',
    sectionSubtitle: 'Temukan kedamaian dan kesehatan melalui koleksi literatur rohani terbaik yang dikurasi khusus untuk pertumbuhan iman Anda.',
  },
  about: {
    showAboutSection: true,
    sectionBadge: 'Tentang Pelayanan Kami',
    sectionTitle: 'Misi & Dedikasi Toko Buku Berkat DMM',
    sectionSubtitle: 'Melayani Penyebaran Firman, Kesehatan, dan Penguatan Keluarga di Seluruh Kepulauan Maluku',
    paragraph1: 'Toko Buku Berkat DMM adalah pusat distribusi resmi literatur rohani, buku kesehatan alami, dan panduan pendidikan keluarga di bawah naungan Gereja Masehi Advent Hari Ketujuh Daerah Misi Maluku. Kami berkomitmen untuk menjangkau setiap jemaat, keluarga, dan masyarakat hingga ke pulau-pulau terjauh.',
    paragraph2: 'Setiap buku yang kami sediakan dipilih secara cermat dari penerbit terpercaya seperti Indonesia Publishing House (IPH) untuk menjadi pedoman hidup yang menginspirasi, memulihkan kesehatan secara holistik, serta membangun generasi beriman teguh.',
    pillar1Title: 'Literatur Rohani Berkualitas',
    pillar1Desc: 'Buku pelajaran Sekolah Sabat, Roh Nubuat, renungan harian, dan Alkitab edisi istimewa untuk menumbuhkan iman jemaat.',
    pillar2Title: 'Kesehatan Holistik Alami',
    pillar2Desc: 'Panduan medis nabati, nutrisi alami, dan pencegahan penyakit sesuai 8 hukum kesehatan.',
    pillar3Title: 'Jangkauan Bahari Maluku',
    pillar3Desc: 'Pengiriman terpercaya melalui ekspedisi udara, darat, dan armada kapal laut ke seluruh pelosok pulau Maluku.',
  },
  footer: {
    tagline: 'Sumber Berkat, Hikmat, dan Terapi Kesehatan Alami untuk Umat dan Masyarakat di Bumi Raja-Raja.',
    copyrightText: 'BukuBerkatDMM. Hak Cipta Dilindungi Undang-Undang. Daerah Misi Maluku.',
    coverageText: 'Layanan pengiriman melayani seluruh wilayah kepulauan: Ambon, Seram, Saparua, Banda, Kei, Tanimbar, Aru, MBD, Buru, hingga ke seluruh Indonesia.',
    facebookUrl: 'https://facebook.com',
    instagramUrl: 'https://instagram.com',
    youtubeUrl: 'https://youtube.com',
  },
};

export const INITIAL_COURIERS: CourierOption[] = [
  {
    id: 'courier-jne',
    name: 'JNE Express',
    code: 'JNE',
    serviceType: 'Reguler (JTR/REG)',
    multiplier: 1.0,
    estimatedLeadDays: '2-3 Hari',
    isActive: true,
    notes: 'Jangkauan seluruh pulau dan kabupaten di Maluku',
  },
  {
    id: 'courier-pos',
    name: 'POS Indonesia',
    code: 'POS Indonesia',
    serviceType: 'Kilat Khusus Maluku',
    multiplier: 0.95,
    estimatedLeadDays: '2-4 Hari',
    isActive: true,
    notes: 'Menjangkau pelosok kecamatan dan kantor pos pulau',
  },
  {
    id: 'courier-jnt',
    name: 'J&T Express',
    code: 'J&T Express',
    serviceType: 'EZ Layanan Cepat',
    multiplier: 1.05,
    estimatedLeadDays: '2-3 Hari',
    isActive: true,
    notes: 'Pengiriman harian cepat dan drop point strategis',
  },
  {
    id: 'courier-sicepat',
    name: 'SiCepat Cargo',
    code: 'SiCepat',
    serviceType: 'GOKIL / Regular',
    multiplier: 0.9,
    estimatedLeadDays: '3-5 Hari',
    isActive: true,
    notes: 'Hemat biaya untuk pesanan buku dalam jumlah paket besar',
  },
  {
    id: 'courier-kapal',
    name: 'Kapal Cepat & Perintis Maluku',
    code: 'Kapal Cepat Maluku',
    serviceType: 'Antar Pulau (Pelabuhan Yos Sudarso / Slamet Riyadi)',
    multiplier: 0.8,
    estimatedLeadDays: '3-6 Hari',
    isActive: true,
    notes: 'Pengiriman via armada laut ke Banda, Tanimbar, Aru, MBD, Buru',
  },
  {
    id: 'courier-lokal',
    name: 'Kurir Khusus Toko DMM Ambon',
    code: 'Kurir DMM Ambon',
    serviceType: 'Antar Langsung (Same-Day / Next-Day)',
    multiplier: 0.7,
    estimatedLeadDays: '1 Hari',
    isActive: true,
    notes: 'Khusus alamat tujuan di Kota Ambon, Sirimau, Nusaniwe, Kudamati, Passo',
  },
];

export const INITIAL_BANK_TRANSFERS: BankTransferAccount[] = [
  {
    id: 'bt-bri',
    bankName: 'Bank BRI (Bank Rakyat Indonesia)',
    accountNumber: '0018-01-002934-50-8',
    accountHolder: 'Gereja Masehi Advent Hari Ketujuh DMM',
    branch: 'KC Ambon - Maluku',
    isPrimary: true,
    isActive: true,
  },
  {
    id: 'bt-mandiri',
    bankName: 'Bank Mandiri',
    accountNumber: '152-00-1892019-3',
    accountHolder: 'Toko Buku Berkat DMM',
    branch: 'KCP Pattimura Ambon',
    isPrimary: false,
    isActive: true,
  },
  {
    id: 'bt-bca',
    bankName: 'Bank Central Asia (BCA)',
    accountNumber: '880-192-8471',
    accountHolder: 'Buku Berkat Misi Maluku',
    branch: 'KCU Ambon',
    isPrimary: false,
    isActive: true,
  },
  {
    id: 'bt-bni',
    bankName: 'Bank BNI 46',
    accountNumber: '038-291-8821',
    accountHolder: 'Toko Buku Berkat DMM',
    branch: 'KC Ambon',
    isPrimary: false,
    isActive: true,
  },
  {
    id: 'bt-maluku',
    bankName: 'Bank Maluku Malut',
    accountNumber: '010-209-1182',
    accountHolder: 'Toko Buku Berkat DMM',
    branch: 'Cabang Utama Ambon',
    isPrimary: false,
    isActive: true,
  },
];

export const INITIAL_EWALLETS: EWalletAccount[] = [
  {
    id: 'ew-gopay',
    name: 'GoPay',
    accountNumber: '081248002026',
    accountHolder: 'Toko Buku Berkat DMM',
    isActive: true,
    instructions: 'Buka aplikasi Gojek / GoPay, transfer ke nomor HP akun resmi di atas',
  },
  {
    id: 'ew-dana',
    name: 'DANA',
    accountNumber: '081248002026',
    accountHolder: 'Toko Buku Berkat DMM',
    isActive: true,
    instructions: 'Buka aplikasi DANA, kirim uang ke nomor DANA resmi toko',
  },
  {
    id: 'ew-ovo',
    name: 'OVO',
    accountNumber: '081248002026',
    accountHolder: 'Toko Buku Berkat DMM',
    isActive: true,
    instructions: 'Kirim saldo OVO ke nomor akun ponsel di atas',
  },
  {
    id: 'ew-shopeepay',
    name: 'ShopeePay',
    accountNumber: '081248002026',
    accountHolder: 'Toko Buku Berkat DMM',
    isActive: true,
    instructions: 'Transfer saldo ShopeePay ke nomor resmi admin toko',
  },
];

export const INITIAL_VIRTUAL_ACCOUNTS: VirtualAccountConfig[] = [
  {
    id: 'va-bca',
    bankName: 'BCA',
    bankCode: 'bca_va',
    prefix: '80918',
    isActive: true,
    description: 'BCA Virtual Account - Verifikasi Otomatis 24 Jam',
  },
  {
    id: 'va-mandiri',
    bankName: 'Mandiri',
    bankCode: 'mandiri_va',
    prefix: '88902',
    isActive: true,
    description: 'Mandiri Bill Payment / Livin Mandiri Otomatis',
  },
  {
    id: 'va-bri',
    bankName: 'BRI (BRIVA)',
    bankCode: 'bri_va',
    prefix: '12984',
    isActive: true,
    description: 'BRIVA BRImo - Populer di Seluruh Pelosok Maluku',
  },
  {
    id: 'va-bni',
    bankName: 'BNI',
    bankCode: 'bni_va',
    prefix: '98801',
    isActive: true,
    description: 'BNI Virtual Account - Layanan Otomatis',
  },
];

export const INITIAL_QRIS: QRISConfig = {
  merchantName: 'BUKUBERKAT DMM AMBON',
  nmid: 'ID1020039281728',
  qrImageUrl: '',
  instructions: 'Buka aplikasi m-Banking (BCA, BRI, Mandiri, BNI, Bank Maluku) atau E-Wallet (GoPay, DANA, OVO, ShopeePay), lalu scan barcode QRIS.',
  isActive: true,
};

export const INITIAL_STORE_SETTINGS: StoreSettings = {
  storeName: 'BukuBerkatDMM (Daerah Misi Maluku)',
  primaryBank: {
    bankName: 'Bank BRI Kantor Cabang Ambon',
    accountNumber: '0018-01-002934-50-8',
    accountHolder: 'Gereja Masehi Advent Hari Ketujuh DMM',
    branch: 'KC Ambon - Maluku',
    isActive: true,
  },
  secondaryBank: {
    bankName: 'Bank Mandiri Cabang Pattimura',
    accountNumber: '152-00-1892019-3',
    accountHolder: 'Toko Buku Berkat DMM',
    branch: 'KCP Pattimura Ambon',
    isActive: true,
  },
  qrisMerchantName: 'BUKUBERKAT DMM AMBON',
  whatsappNumber: '6281248002026',
  adminWhatsApp: '6281248002026',
  storeEmail: 'bukuberkat.dmm@gmail.com',
  storeAddress: 'Jl. Dr. Kayadoe, Kudamati, Nusaniwe, Kota Ambon, Maluku 97116',
  operatingHours: 'Senin - Kamis: 08.00 - 17.00 WIT | Jumat: 08.00 - 15.00 WIT',
  paymentInstructions: 'Setelah melakukan transfer, sistem gateway dan pengelola akan segera memverifikasi otomatis serta mengirimkan notifikasi resi.',
  
  // Couriers & Payment Gateways Extended Config
  couriers: INITIAL_COURIERS,
  bankTransfers: INITIAL_BANK_TRANSFERS,
  eWallets: INITIAL_EWALLETS,
  virtualAccounts: INITIAL_VIRTUAL_ACCOUNTS,
  qrisConfig: INITIAL_QRIS,
  enabledPaymentChannels: {
    qris: true,
    virtualAccount: true,
    eWallet: true,
    bankTransfer: true,
  },
  websiteConfig: INITIAL_WEBSITE_CONFIG,
};

/**
 * Normalizes loaded settings from localStorage so all fields, couriers, and payment channels are defined
 */
export function normalizeStoreSettings(raw: any): StoreSettings {
  if (!raw || typeof raw !== 'object') {
    return INITIAL_STORE_SETTINGS;
  }

  return {
    ...INITIAL_STORE_SETTINGS,
    ...raw,
    primaryBank: {
      ...INITIAL_STORE_SETTINGS.primaryBank,
      ...(raw.primaryBank || {}),
    },
    secondaryBank: raw.secondaryBank
      ? { ...INITIAL_STORE_SETTINGS.secondaryBank, ...raw.secondaryBank }
      : INITIAL_STORE_SETTINGS.secondaryBank,
    couriers: Array.isArray(raw.couriers) && raw.couriers.length > 0
      ? raw.couriers
      : INITIAL_COURIERS,
    bankTransfers: Array.isArray(raw.bankTransfers) && raw.bankTransfers.length > 0
      ? raw.bankTransfers
      : INITIAL_BANK_TRANSFERS,
    eWallets: Array.isArray(raw.eWallets) && raw.eWallets.length > 0
      ? raw.eWallets
      : INITIAL_EWALLETS,
    virtualAccounts: Array.isArray(raw.virtualAccounts) && raw.virtualAccounts.length > 0
      ? raw.virtualAccounts
      : INITIAL_VIRTUAL_ACCOUNTS,
    qrisConfig: {
      ...INITIAL_QRIS,
      ...(raw.qrisConfig || {}),
      merchantName: raw.qrisConfig?.merchantName || raw.qrisMerchantName || INITIAL_QRIS.merchantName,
    },
    enabledPaymentChannels: {
      ...INITIAL_STORE_SETTINGS.enabledPaymentChannels!,
      ...(raw.enabledPaymentChannels || {}),
    },
    websiteConfig: {
      branding: {
        ...INITIAL_WEBSITE_CONFIG.branding,
        ...(raw.websiteConfig?.branding || {}),
      },
      hero: {
        ...INITIAL_WEBSITE_CONFIG.hero,
        ...(raw.websiteConfig?.hero || {}),
        features: Array.isArray(raw.websiteConfig?.hero?.features) && raw.websiteConfig.hero.features.length === 4
          ? raw.websiteConfig.hero.features
          : INITIAL_WEBSITE_CONFIG.hero.features,
      },
      billboard: {
        ...INITIAL_WEBSITE_CONFIG.billboard!,
        ...(raw.websiteConfig?.billboard || {}),
      },
      about: {
        ...INITIAL_WEBSITE_CONFIG.about,
        ...(raw.websiteConfig?.about || {}),
      },
      footer: {
        ...INITIAL_WEBSITE_CONFIG.footer,
        ...(raw.websiteConfig?.footer || {}),
      },
    },
  };
}

export const PRESET_BOOK_COVERS = [
  {
    name: 'Alkitab & Lilin Klasik',
    url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    category: 'Rohani & Doa',
  },
  {
    name: 'Doa Fajar & Cahaya Renungan',
    url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600&auto=format&fit=crop&q=80',
    category: 'Rohani & Doa',
  },
  {
    name: 'Buku Suci & Salib Kayu',
    url: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=600&auto=format&fit=crop&q=80',
    category: 'Rohani & Doa',
  },
  {
    name: 'Keluarga Bahagia & Rumah Damai',
    url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&auto=format&fit=crop&q=80',
    category: 'Keluarga & Pernikahan',
  },
  {
    name: 'Orang Tua & Anak Bahagia',
    url: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=600&auto=format&fit=crop&q=80',
    category: 'Keluarga & Pernikahan',
  },
  {
    name: 'Kesehatan Alami & Nutrisi Nabati',
    url: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=80',
    category: 'Kesehatan Alami',
  },
  {
    name: 'Tanaman Obat Herbal & Kebugaran',
    url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80',
    category: 'Kesehatan Alami',
  },
  {
    name: 'Pendidikan Anak & Cerita Bergambar',
    url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
    category: 'Pendidikan Anak',
  },
  {
    name: 'Anak Membaca & Belajar Alkitab',
    url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80',
    category: 'Pendidikan Anak',
  },
  {
    name: 'Kepulauan Maluku & Misi Bahari',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    category: 'Misi & Sejarah Maluku',
  },
  {
    name: 'Sejarah Teluk Ambon & Perjalanan Misi',
    url: 'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=600&auto=format&fit=crop&q=80',
    category: 'Misi & Sejarah Maluku',
  },
];
