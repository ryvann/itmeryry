import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Unlock, 
  LayoutDashboard, 
  BookOpen, 
  ShoppingBag, 
  TrendingUp, 
  Plus, 
  Edit3, 
  Trash2, 
  Truck, 
  CheckCircle2, 
  MessageCircle, 
  Send, 
  Megaphone, 
  Printer, 
  Save, 
  RefreshCw, 
  Eye, 
  ExternalLink,
  DollarSign,
  Package,
  PackagePlus,
  Layers,
  Sparkles,
  CreditCard,
  Building2,
  Image as ImageIcon,
  Upload,
  Mail,
  Phone,
  MapPin,
  Check,
  RotateCcw,
  Info,
  KeyRound,
  EyeOff,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  ArrowLeft,
  UserCheck,
  Palette,
  Copy,
  ListPlus,
  Search,
  FileText,
  CheckCheck
} from 'lucide-react';
import { Book, Order, OrderStatus, BookCategory, StoreSettings, CustomerUser, CustomerInquiry } from '../types';
import { INITIAL_STORE_SETTINGS, PRESET_BOOK_COVERS, normalizeStoreSettings } from '../data/initialSettings';
import { formatRupiah, formatTanggalIndo, generateWhatsAppMessage, generateWhatsAppUrl } from '../utils/formatters';
import { CourierSettingsTab } from './admin/CourierSettingsTab';
import { PaymentSettingsTab } from './admin/PaymentSettingsTab';
import { SecuritySettingsTab } from './admin/SecuritySettingsTab';
import { WebsiteEditorTab } from './WebsiteEditorTab';
import { verifyAdminPassword, getAdminSession, saveAdminSession, clearAdminSession } from '../utils/adminAuth';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
  isStandalone?: boolean;
  currentUser?: CustomerUser | null;
  onNavigateToStore?: () => void;
  books: Book[];
  orders: Order[];
  announcements: string[];
  storeSettings?: StoreSettings;
  customerInquiries?: CustomerInquiry[];
  onUpdateBooks: (newBooks: Book[]) => void;
  onUpdateOrders: (newOrders: Order[]) => void;
  onUpdateAnnouncements: (newAnnouncements: string[]) => void;
  onUpdateStoreSettings?: (newSettings: StoreSettings) => void;
  onUpdateInquiries?: (inquiries: CustomerInquiry[]) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  isOpen,
  onClose,
  isStandalone = false,
  currentUser = null,
  onNavigateToStore,
  books,
  orders,
  announcements,
  storeSettings = INITIAL_STORE_SETTINGS,
  customerInquiries = [],
  onUpdateBooks,
  onUpdateOrders,
  onUpdateAnnouncements,
  onUpdateStoreSettings,
  onUpdateInquiries,
}) => {
  // Authentication & RBAC Session State
  const [adminSession, setAdminSession] = useState(() => getAdminSession());
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getAdminSession()));
  const [passwordInput, setPasswordInput] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [isElevatingRole, setIsElevatingRole] = useState(false);

  // Sync state if session exists
  useEffect(() => {
    const existing = getAdminSession();
    if (existing) {
      setAdminSession(existing);
      setIsAuthenticated(true);
    }
  }, []);

  // Navigation Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'orders' | 'inquiries' | 'couriers' | 'payments' | 'announcements' | 'website' | 'settings' | 'security'>('dashboard');
  const [inquiryFilter, setInquiryFilter] = useState<'ALL' | 'pending' | 'replied'>('ALL');
  const [adminToast, setAdminToast] = useState<string | null>(null);

  const showAdminToast = (msg: string) => {
    setAdminToast(msg);
    setTimeout(() => setAdminToast(null), 3500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPassword(passwordInput)) {
      const session = saveAdminSession('admin_dmm');
      setAdminSession(session);
      setIsAuthenticated(true);
      setAuthError(false);
      setPasswordInput('');
      setShowLoginPassword(false);
      setIsElevatingRole(false);
      showAdminToast('Selamat datang di Portal Pengelola Toko DMM!');
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    clearAdminSession();
    setAdminSession(null);
    setIsAuthenticated(false);
    setIsElevatingRole(false);
    showAdminToast('Sesi administrator telah diakhiri dengan aman.');
  };

  // Inventory Management State
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [coverMode, setCoverMode] = useState<'presets' | 'url' | 'upload'>('presets');
  const [coverCategoryFilter, setCoverCategoryFilter] = useState<string>('ALL');

  const [bookFormData, setBookFormData] = useState<Partial<Book>>({
    title: '',
    author: '',
    category: 'Rohani & Doa',
    price: 85000,
    originalPrice: 100000,
    stock: 20,
    weightGrams: 350,
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    description: '',
    publisher: 'Indonesia Publishing House (IPH)',
    pages: 250,
    isbn: '978-602-8411-99-9',
  });

  // Batch Add / Multi-Book Creation State (Tambah Buku Sebanyak Mungkin)
  const [batchAddModalOpen, setBatchAddModalOpen] = useState(false);
  const [batchAddTab, setBatchAddTab] = useState<'rows' | 'paste'>('rows');
  const [batchRows, setBatchRows] = useState<Array<{
    id: string;
    title: string;
    author: string;
    category: BookCategory;
    price: number;
    stock: number;
  }>>([
    { id: '1', title: '', author: '', category: 'Rohani & Doa', price: 85000, stock: 50 },
    { id: '2', title: '', author: '', category: 'Rohani & Doa', price: 85000, stock: 50 },
    { id: '3', title: '', author: '', category: 'Rohani & Doa', price: 85000, stock: 50 },
  ]);
  const [batchPasteContent, setBatchPasteContent] = useState('');

  // Admin Book List Filter & Search
  const [adminBookSearch, setAdminBookSearch] = useState('');
  const [adminBookCategoryFilter, setAdminBookCategoryFilter] = useState<string>('ALL');

  // Store Settings (Bank Accounts, Couriers, Payments, Contacts, QRIS) State
  const [settingsFormData, setSettingsFormData] = useState<StoreSettings>(() => normalizeStoreSettings(storeSettings || INITIAL_STORE_SETTINGS));
  const [settingsSavedSuccess, setSettingsSavedSuccess] = useState(false);

  // Order Management State
  const [orderFilter, setOrderFilter] = useState<string>('ALL');
  const [selectedOrderForResi, setSelectedOrderForResi] = useState<Order | null>(null);
  const [newResiInput, setNewResiInput] = useState('');

  // Announcements State
  const [announcementList, setAnnouncementList] = useState<string[]>(announcements);
  const [newAnnouncementText, setNewAnnouncementText] = useState('');

  // Stock Management (Single Book & Bulk Restock) State
  const [stockTargetBook, setStockTargetBook] = useState<Book | null>(null);
  const [stockAdjustmentMode, setStockAdjustmentMode] = useState<'add' | 'set'>('add');
  const [customStockAmount, setCustomStockAmount] = useState<string>('50');

  const [bulkRestockOpen, setBulkRestockOpen] = useState(false);
  const [bulkStockAmount, setBulkStockAmount] = useState<number>(50);
  const [bulkTargetCategory, setBulkTargetCategory] = useState<string>('ALL');

  if (!isOpen) return null;

  // Handler for uploading custom book cover from local device
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2.5 * 1024 * 1024) {
      alert('Ukuran file gambar maksimal 2.5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setBookFormData((prev) => ({
          ...prev,
          coverImage: event.target!.result as string,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Handler for saving store settings
  const handleSaveStoreSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizeStoreSettings(settingsFormData);
    setSettingsFormData(normalized);
    if (onUpdateStoreSettings) {
      onUpdateStoreSettings(normalized);
    }
    setSettingsSavedSuccess(true);
    showAdminToast('Pengaturan toko dan nomor rekening berhasil disimpan.');
    setTimeout(() => {
      setSettingsSavedSuccess(false);
    }, 3500);
  };

  // Handler for resetting store settings
  const handleResetStoreSettings = () => {
    if (confirm('Kembalikan semua nomor rekening dan pengaturan toko ke data bawaan resmi?')) {
      const normalized = normalizeStoreSettings(INITIAL_STORE_SETTINGS);
      setSettingsFormData(normalized);
      if (onUpdateStoreSettings) {
        onUpdateStoreSettings(normalized);
      }
      setSettingsSavedSuccess(true);
      showAdminToast('Pengaturan dikembalikan ke setelan awal.');
      setTimeout(() => setSettingsSavedSuccess(false), 3000);
    }
  };

  // Dashboard calculations
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((acc, o) => acc + o.totalAmount, 0);

  const totalBooksSold = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((acc, o) => acc + o.items.reduce((s, it) => s + it.quantity, 0), 0);

  const totalOrdersCount = orders.length;

  // Book Inventory Actions
  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookFormData.title || !bookFormData.author) return;

    if (isAddingBook) {
      const newBook: Book = {
        id: `buku-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: bookFormData.title || 'Judul Buku',
        author: bookFormData.author || 'Penulis',
        category: (bookFormData.category as BookCategory) || 'Rohani & Doa',
        price: Number(bookFormData.price) || 50000,
        originalPrice: bookFormData.originalPrice ? Number(bookFormData.originalPrice) : undefined,
        stock: Number(bookFormData.stock) || 10,
        weightGrams: Number(bookFormData.weightGrams) || 300,
        coverImage: bookFormData.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
        description: bookFormData.description || 'Buku literatur rohani bermutu untuk keluarga dan jemaat.',
        publisher: bookFormData.publisher || 'Indonesia Publishing House (IPH)',
        pages: Number(bookFormData.pages) || 200,
        isbn: bookFormData.isbn || `978-602-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}-0`,
      };
      onUpdateBooks([newBook, ...books]);
      showAdminToast(`Buku "${newBook.title}" berhasil ditambahkan ke etalase!`);
    } else if (editingBook) {
      const updated = books.map((b) =>
        b.id === editingBook.id ? { ...b, ...bookFormData } as Book : b
      );
      onUpdateBooks(updated);
      showAdminToast(`Buku "${bookFormData.title}" berhasil diperbarui!`);
    }

    setIsAddingBook(false);
    setEditingBook(null);
  };

  // Simpan dan langsung buka form untuk tambah buku berikutnya (tambah buku terus menerus)
  const handleSaveAndAddAnother = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!bookFormData.title || !bookFormData.author) {
      alert('Mohon isi Judul Buku dan Penulis terlebih dahulu.');
      return;
    }

    const newBook: Book = {
      id: `buku-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: bookFormData.title || 'Judul Buku',
      author: bookFormData.author || 'Penulis',
      category: (bookFormData.category as BookCategory) || 'Rohani & Doa',
      price: Number(bookFormData.price) || 50000,
      originalPrice: bookFormData.originalPrice ? Number(bookFormData.originalPrice) : undefined,
      stock: Number(bookFormData.stock) || 50,
      weightGrams: Number(bookFormData.weightGrams) || 350,
      coverImage: bookFormData.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
      description: bookFormData.description || 'Buku literatur rohani bermutu untuk keluarga dan jemaat.',
      publisher: bookFormData.publisher || 'Indonesia Publishing House (IPH)',
      pages: Number(bookFormData.pages) || 200,
      isbn: bookFormData.isbn || `978-602-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}-0`,
    };

    onUpdateBooks([newBook, ...books]);
    showAdminToast(`Buku "${newBook.title}" berhasil disimpan! Silakan input buku berikutnya.`);

    // Reset input fields for the next book while maintaining category, publisher & default price
    setBookFormData((prev) => ({
      ...prev,
      title: '',
      author: '',
      stock: 50,
      isbn: '',
      description: '',
    }));
  };

  // 1-Klik Duplikasi / Gandakan Buku
  const handleDuplicateBook = (bookToDuplicate: Book) => {
    const duplicated: Book = {
      ...bookToDuplicate,
      id: `buku-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: `${bookToDuplicate.title} (Salinan)`,
      stock: bookToDuplicate.stock || 50,
    };
    onUpdateBooks([duplicated, ...books]);
    showAdminToast(`Buku "${bookToDuplicate.title}" berhasil digandakan ke etalase!`);
  };

  // Batch Multi-Row Handlers (Tambah Banyak Buku Sekaligus)
  const handleAddBatchRow = (count = 1) => {
    const newRows = Array.from({ length: count }, (_, i) => ({
      id: `${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
      title: '',
      author: '',
      category: 'Rohani & Doa' as BookCategory,
      price: 85000,
      stock: 50,
    }));
    setBatchRows((prev) => [...prev, ...newRows]);
  };

  const handleUpdateBatchRow = (id: string, field: string, value: any) => {
    setBatchRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleDeleteBatchRow = (id: string) => {
    if (batchRows.length <= 1) {
      alert('Minimal harus ada 1 baris input.');
      return;
    }
    setBatchRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSaveBatchRows = () => {
    const validRows = batchRows.filter((r) => r.title.trim() !== '');
    if (validRows.length === 0) {
      alert('Mohon isi minimal 1 judul buku.');
      return;
    }

    const defaultCovers: Record<string, string> = {
      'Rohani & Doa': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
      'Keluarga & Pernikahan': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
      'Kesehatan Alami': 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&auto=format&fit=crop&q=80',
      'Pendidikan Anak': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80',
      'Misi & Sejarah Maluku': 'https://images.unsplash.com/photo-1447069387593-a5de076249c5?w=600&auto=format&fit=crop&q=80',
    };

    const newBooks: Book[] = validRows.map((r, idx) => ({
      id: `buku-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
      title: r.title.trim(),
      author: r.author.trim() || 'Penulis IPH / DMM',
      category: r.category,
      price: Number(r.price) || 75000,
      stock: Number(r.stock) || 50,
      weightGrams: 350,
      coverImage: defaultCovers[r.category] || defaultCovers['Rohani & Doa'],
      description: `Buku literatur pilihan kategori ${r.category} untuk jemaat dan masyarakat.`,
      publisher: 'Indonesia Publishing House (IPH)',
      pages: 220,
      isbn: `978-602-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}-0`,
    }));

    onUpdateBooks([...newBooks, ...books]);
    showAdminToast(`Berhasil menambahkan ${newBooks.length} buku baru sekaligus ke katalog!`);
    setBatchAddModalOpen(false);
    setBatchRows([
      { id: '1', title: '', author: '', category: 'Rohani & Doa', price: 85000, stock: 50 },
      { id: '2', title: '', author: '', category: 'Rohani & Doa', price: 85000, stock: 50 },
      { id: '3', title: '', author: '', category: 'Rohani & Doa', price: 85000, stock: 50 },
    ]);
  };

  // Batch Paste Handler (Format: Judul | Penulis | Kategori | Harga | Stok)
  const handleSaveBatchPaste = () => {
    if (!batchPasteContent.trim()) {
      alert('Teks format buku masih kosong. Silakan tempel data buku atau klik tombol contoh format.');
      return;
    }

    const lines = batchPasteContent
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith('#') && !l.toLowerCase().startsWith('judul'));

    if (lines.length === 0) {
      alert('Tidak ada baris data buku yang valid untuk diimpor.');
      return;
    }

    const defaultCovers: Record<string, string> = {
      'Rohani & Doa': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
      'Keluarga & Pernikahan': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
      'Kesehatan Alami': 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&auto=format&fit=crop&q=80',
      'Pendidikan Anak': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80',
      'Misi & Sejarah Maluku': 'https://images.unsplash.com/photo-1447069387593-a5de076249c5?w=600&auto=format&fit=crop&q=80',
    };

    const categoriesList: BookCategory[] = [
      'Rohani & Doa',
      'Keluarga & Pernikahan',
      'Kesehatan Alami',
      'Pendidikan Anak',
      'Misi & Sejarah Maluku',
    ];

    const parsedBooks: Book[] = [];

    lines.forEach((line, idx) => {
      const parts = line.includes('|')
        ? line.split('|').map((p) => p.trim())
        : line.includes('\t')
        ? line.split('\t').map((p) => p.trim())
        : line.split(',').map((p) => p.trim());

      const title = parts[0] || '';
      if (!title) return;

      const author = parts[1] || 'Penulis IPH / DMM';
      let category: BookCategory = 'Rohani & Doa';
      if (parts[2]) {
        const found = categoriesList.find((c) => c.toLowerCase() === parts[2].toLowerCase());
        if (found) category = found;
      }
      const price = parts[3] ? parseInt(parts[3].replace(/[^0-9]/g, ''), 10) || 75000 : 75000;
      const stock = parts[4] ? parseInt(parts[4].replace(/[^0-9]/g, ''), 10) || 50 : 50;

      parsedBooks.push({
        id: `buku-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
        title,
        author,
        category,
        price,
        stock,
        weightGrams: 350,
        coverImage: defaultCovers[category] || defaultCovers['Rohani & Doa'],
        description: `Buku literatur pilihan kategori ${category}.`,
        publisher: 'Indonesia Publishing House (IPH)',
        pages: 200,
        isbn: `978-602-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}-0`,
      });
    });

    if (parsedBooks.length === 0) {
      alert('Gagal membaca baris data. Pastikan format penulisan sesuai petunjuk.');
      return;
    }

    onUpdateBooks([...parsedBooks, ...books]);
    showAdminToast(`Berhasil menambahkan ${parsedBooks.length} buku baru sekaligus ke katalog!`);
    setBatchAddModalOpen(false);
    setBatchPasteContent('');
  };

  // Filtered books in Admin Table
  const filteredAdminBooks = useMemo(() => {
    return books.filter((b) => {
      const matchSearch =
        !adminBookSearch.trim() ||
        b.title.toLowerCase().includes(adminBookSearch.toLowerCase()) ||
        b.author.toLowerCase().includes(adminBookSearch.toLowerCase()) ||
        b.isbn.toLowerCase().includes(adminBookSearch.toLowerCase());
      const matchCategory =
        adminBookCategoryFilter === 'ALL' || b.category === adminBookCategoryFilter;
      return matchSearch && matchCategory;
    });
  }, [books, adminBookSearch, adminBookCategoryFilter]);

  const handleDeleteBook = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus buku ini dari katalog?')) {
      onUpdateBooks(books.filter((b) => b.id !== id));
    }
  };

  const handleQuickRestock = (id: string, amount: number) => {
    onUpdateBooks(
      books.map((b) => (b.id === id ? { ...b, stock: Math.max(0, b.stock + amount) } : b))
    );
  };

  const handleApplySingleStockAdjustment = () => {
    if (!stockTargetBook) return;
    const amount = parseInt(customStockAmount, 10);
    if (isNaN(amount) || amount < 0) {
      alert('Masukkan jumlah stok yang valid (angka positif).');
      return;
    }

    const updated = books.map((b) => {
      if (b.id === stockTargetBook.id) {
        const newStock = stockAdjustmentMode === 'add' ? b.stock + amount : amount;
        return { ...b, stock: Math.max(0, newStock) };
      }
      return b;
    });

    onUpdateBooks(updated);
    showAdminToast(
      stockAdjustmentMode === 'add'
        ? `Berhasil menambah +${amount} stok untuk "${stockTargetBook.title}"!`
        : `Stok "${stockTargetBook.title}" diatur menjadi ${amount}!`
    );
    setStockTargetBook(null);
    setCustomStockAmount('50');
  };

  const handleApplyBulkRestock = () => {
    if (bulkStockAmount <= 0) {
      alert('Jumlah stok tambahan harus lebih dari 0.');
      return;
    }

    let affectedCount = 0;
    const updated = books.map((b) => {
      if (bulkTargetCategory === 'ALL' || b.category === bulkTargetCategory) {
        affectedCount++;
        return { ...b, stock: b.stock + bulkStockAmount };
      }
      return b;
    });

    onUpdateBooks(updated);
    const targetDesc = bulkTargetCategory === 'ALL' ? 'semua buku di etalase' : `kategori "${bulkTargetCategory}"`;
    showAdminToast(`Berhasil menambah +${bulkStockAmount} stok untuk ${affectedCount} buku (${targetDesc})!`);
    setBulkRestockOpen(false);
  };

  // Order Management Actions
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        const history = [...o.trackingHistory];
        if (newStatus === 'Dikirim' && !o.trackingNumber) {
          o.trackingNumber = `BBDMM-${o.shipping.courier.replace(/\s+/g, '')}-${Math.floor(100000 + Math.random() * 900000)}`;
        }
        history.push({
          status: `Status Diperbarui: ${newStatus}`,
          location: 'Kantor Pengelola BukuBerkatDMM Ambon',
          timestamp: new Date().toISOString(),
          description: `Admin memperbarui status pesanan menjadi ${newStatus}.`,
          completed: true,
        });

        // Trigger notification log
        const waNotifs = [...o.whatsAppNotifications];
        const msgType = newStatus === 'Dikirim' ? 'order_shipped' : newStatus === 'Selesai' ? 'order_delivered' : 'payment_confirmed';
        waNotifs.push({
          id: `wa-${Date.now()}`,
          timestamp: new Date().toISOString(),
          phoneNumber: o.shipping.phoneNumber,
          messageType: msgType,
          messageText: generateWhatsAppMessage(o, msgType),
          status: 'delivered',
        });

        return {
          ...o,
          orderStatus: newStatus,
          updatedAt: new Date().toISOString(),
          trackingHistory: history,
          whatsAppNotifications: waNotifs,
        };
      }
      return o;
    });
    onUpdateOrders(updated);
  };

  const handleSaveResi = () => {
    if (!selectedOrderForResi || !newResiInput.trim()) return;
    const updated = orders.map((o) => {
      if (o.id === selectedOrderForResi.id) {
        return {
          ...o,
          trackingNumber: newResiInput.trim(),
          orderStatus: 'Dikirim' as OrderStatus,
          updatedAt: new Date().toISOString(),
        };
      }
      return o;
    });
    onUpdateOrders(updated);
    setSelectedOrderForResi(null);
    setNewResiInput('');
    alert('Nomor Resi berhasil disimpan & status pesanan diubah ke "Dikirim".');
  };

  // Announcements Actions
  const handleAddAnnouncement = () => {
    if (!newAnnouncementText.trim()) return;
    const updated = [newAnnouncementText.trim(), ...announcementList];
    setAnnouncementList(updated);
    onUpdateAnnouncements(updated);
    setNewAnnouncementText('');
  };

  const handleDeleteAnnouncement = (idx: number) => {
    const updated = announcementList.filter((_, i) => i !== idx);
    setAnnouncementList(updated);
    onUpdateAnnouncements(updated);
  };

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'ALL') return true;
    return o.orderStatus === orderFilter;
  });

  return (
    <div
      className={
        isStandalone
          ? "min-h-screen bg-slate-100 flex flex-col w-full text-slate-900"
          : "fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
      }
    >
      <div 
        className={
          isStandalone
            ? "flex-1 flex flex-col w-full bg-white shadow-sm overflow-hidden"
            : "relative bg-white rounded-3xl max-w-5xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 h-[94vh] flex flex-col"
        }
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dedicated Admin Topbar with URL Path & Role-Based Access Control Info */}
        <div className="p-3.5 sm:p-5 border-b border-slate-800 flex flex-wrap items-center justify-between bg-[#0F2C59] text-white shrink-0 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center font-bold shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-base sm:text-xl text-amber-300">
                  Portal Administrator Toko
                </h2>
                <span className="hidden sm:inline-block font-mono text-[10px] bg-white/10 text-amber-200 border border-white/15 px-2 py-0.5 rounded-full font-bold">
                  Jalur: /admin
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Toko Buku Daerah Misi Maluku • Sistem Pengelolaan Terpusat
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* RBAC Role Indicator */}
            {isAuthenticated ? (
              <div className="flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs px-2.5 py-1 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold">Role: ADMINISTRATOR</span>
              </div>
            ) : currentUser ? (
              <div className="flex items-center gap-1.5 bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs px-2.5 py-1 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="font-semibold">Role: PELANGGAN ({currentUser.name.split(' ')[0]})</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 text-slate-300 text-xs px-2.5 py-1 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span className="font-semibold">Role: GUEST (Tamu)</span>
              </div>
            )}

            {/* Navigation back to User Storefront */}
            <button
              onClick={onNavigateToStore || onClose}
              className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 text-slate-100 px-3 py-1.5 rounded-lg transition-all border border-white/15"
              title="Kembali ke halaman belanja publik"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>Toko Publik (/)</span>
            </button>

            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 px-3 py-1.5 rounded-lg transition-colors font-semibold"
              >
                Keluar Sesi
              </button>
            )}

            {!isStandalone && (
              <button
                onClick={onClose}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                aria-label="Tutup admin"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* AUTHENTICATION & ROLE-BASED ACCESS CONTROL GATE */}
        {!isAuthenticated ? (
          currentUser && !isElevatingRole ? (
            /* RBAC ACCESS RESTRICTION SCREEN FOR CUSTOMERS */
            <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-b from-slate-100/70 to-slate-200/60">
              <div className="max-w-md w-full bg-white p-7 sm:p-9 rounded-3xl shadow-xl border border-rose-200 text-center space-y-6 animate-in fade-in zoom-in-95">
                <div className="relative mx-auto w-16 h-16">
                  <div className="absolute inset-0 bg-rose-400/20 rounded-2xl blur-md" />
                  <div className="relative w-16 h-16 bg-gradient-to-br from-rose-600 to-rose-800 rounded-2xl flex items-center justify-center text-white shadow-md">
                    <ShieldAlert className="w-8 h-8" />
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-extrabold tracking-widest text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full uppercase">
                    Role-Based Access Control (RBAC)
                  </span>
                  <h3 className="font-serif font-bold text-slate-900 text-xl mt-2">
                    Akses Dibatasi: Khusus Administrator
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Jalur URL <code className="bg-slate-100 text-rose-700 px-1.5 py-0.5 rounded font-mono font-bold">/admin</code> diproteksi secara ketat. Akun yang sedang aktif terdaftar dengan peran <strong>PELANGGAN</strong>:
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-left text-xs space-y-1.5">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Pengguna Aktif:</span>
                    <strong className="text-slate-800">{currentUser.name}</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Email:</span>
                    <strong className="text-slate-800">{currentUser.email}</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Peran Akses:</span>
                    <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[11px]">
                      CUSTOMER (Pelanggan)
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed text-left">
                  Pelanggan tidak memiliki wewenang untuk mengubah stok buku, mengelola resi pengiriman, atau mengatur rekening bank toko.
                </p>

                <div className="space-y-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsElevatingRole(true)}
                    className="w-full py-3 bg-[#0F2C59] hover:bg-[#1a3d74] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span>Masukkan Kredensial Administrator (Elevasi)</span>
                  </button>

                  <button
                    type="button"
                    onClick={onNavigateToStore || onClose}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Beranda Belanja (/)</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ADMINISTRATOR LOGIN GATE */
            <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-b from-slate-100/70 to-slate-200/50">
              <div className="max-w-md w-full bg-white p-7 sm:p-9 rounded-3xl shadow-xl border border-slate-200/80 text-center space-y-6">
                
                {/* Elegant Emblem */}
                <div className="relative mx-auto w-16 h-16">
                  <div className="absolute inset-0 bg-amber-400/20 rounded-2xl blur-md" />
                  <div className="relative w-16 h-16 bg-gradient-to-br from-[#0F2C59] to-[#1a3d74] rounded-2xl flex items-center justify-center text-amber-400 shadow-md border border-white/20">
                    <KeyRound className="w-8 h-8" />
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-extrabold tracking-widest text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full uppercase">
                    Portal Resmi Pengelola (Jalur /admin)
                  </span>
                  <h3 className="font-serif font-bold text-slate-900 text-xl mt-2">
                    Akses Administrator Toko
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Masukkan kata sandi pengelola Toko Buku Daerah Misi Maluku untuk membuka laporan pesanan, stok buku, ekspedisi, dan rekening.
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4 text-left">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Kata Sandi Administrator
                    </label>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        autoFocus
                        placeholder="Masukkan kata sandi pengelola..."
                        value={passwordInput}
                        onChange={(e) => {
                          setPasswordInput(e.target.value);
                          setAuthError(false);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-11 py-3 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/25 focus:bg-white transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                        aria-label="Tampilkan atau sembunyikan kata sandi"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {authError && (
                      <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2.5 rounded-xl text-xs flex items-center gap-2 mt-2 font-medium animate-in fade-in">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Kata sandi tidak sesuai. Silakan periksa kembali.</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#0F2C59] hover:bg-[#1a3d74] text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>Buka Portal Pengelola</span>
                  </button>
                </form>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={onNavigateToStore || onClose}
                    className="hover:text-slate-800 flex items-center gap-1 font-semibold"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali ke Toko (/)</span>
                  </button>

                  {currentUser && isElevatingRole && (
                    <button
                      type="button"
                      onClick={() => setIsElevatingRole(false)}
                      className="text-amber-700 hover:underline text-[11px]"
                    >
                      Batal Elevasi
                    </button>
                  )}
                </div>

                <div className="pt-1 text-[11px] text-slate-400 leading-relaxed">
                  🛡️ Sesi aman terlindungi otorisasi lokal. Penggantian kata sandi dapat dilakukan di tab <strong>Keamanan & Password</strong> di dalam portal.
                </div>
              </div>
            </div>
          )
        ) : (
          /* AUTHENTICATED ADMIN DASHBOARD */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar Tabs */}
            <div className="w-full md:w-60 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-3 sm:p-4 space-y-1.5 shrink-0 flex md:flex-col overflow-x-auto md:overflow-visible">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === 'dashboard'
                    ? 'bg-[#0F2C59] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Laporan Penjualan</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === 'orders'
                    ? 'bg-[#0F2C59] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Kelola Pesanan & Resi</span>
                </div>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  {orders.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('inquiries')}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === 'inquiries'
                    ? 'bg-[#0F2C59] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MessageCircle className="w-4 h-4 text-emerald-500" />
                  <span>Konsultasi & Tanya Admin</span>
                </div>
                {customerInquiries.filter(i => i.status === 'pending').length > 0 ? (
                  <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-pulse">
                    {customerInquiries.filter(i => i.status === 'pending').length} Baru
                  </span>
                ) : (
                  <span className="bg-slate-200 text-slate-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    {customerInquiries.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('inventory')}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === 'inventory'
                    ? 'bg-[#0F2C59] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4" />
                  <span>Inventaris Buku</span>
                </div>
                <span className="bg-slate-200 text-slate-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  {books.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('couriers')}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === 'couriers'
                    ? 'bg-[#0F2C59] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4" />
                  <span>Ekspedisi Kurir</span>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  {(settingsFormData.couriers || []).filter(c => c.isActive).length} Aktif
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('payments')}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === 'payments'
                    ? 'bg-[#0F2C59] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4" />
                  <span>Pembayaran Terpadu</span>
                </div>
                <span className="bg-blue-100 text-blue-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  QRIS/VA
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('announcements')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === 'announcements'
                    ? 'bg-[#0F2C59] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <Megaphone className="w-4 h-4" />
                <span>Papan Iklan Berjalan</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('website')}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === 'website'
                    ? 'bg-[#0F2C59] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Palette className="w-4 h-4 text-amber-400" />
                  <span>Tampilan Website</span>
                </div>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md">
                  CMS
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'bg-[#0F2C59] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Profil Toko & Kontak</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === 'security'
                    ? 'bg-[#0F2C59] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <KeyRound className="w-4 h-4 text-amber-500" />
                  <span>Keamanan & Password</span>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                  Kredensial
                </span>
              </button>
            </div>

            {/* Main Panel Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
              
              {adminToast && (
                <div className="mb-5 bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{adminToast}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setAdminToast(null)} 
                    className="text-emerald-700 hover:text-emerald-950 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              
              {/* TAB 1: DASHBOARD & LAPORAN PENJUALAN */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="text-xl font-serif font-bold text-slate-900">
                        Laporan & Analisis Penjualan DMM
                      </h3>
                      <p className="text-xs text-slate-500">
                        Statistik transaksi otomatis gateway, buku terlaris, dan distribusi pengiriman Maluku
                      </p>
                    </div>

                    <button
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak / Cetak PDF Laporan</span>
                    </button>
                  </div>

                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Total Omset Penjualan
                        </span>
                        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                          <DollarSign className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-extrabold text-[#0F2C59]">
                        {formatRupiah(totalRevenue)}
                      </div>
                      <div className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Pembayaran Gateway Terverifikasi</span>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Total Buku Terjual
                        </span>
                        <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                          <BookOpen className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-extrabold text-amber-700">
                        {totalBooksSold} Eksemplar
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Koleksi Rohani, Kesehatan & Keluarga
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Total Transaksi
                        </span>
                        <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-extrabold text-slate-900">
                        {totalOrdersCount} Pesanan
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Ambon, Pulau Seram, Kei, Tanimbar & RI
                      </div>
                    </div>
                  </div>

                  {/* Best Sellers & Category Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Best Seller List */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                      <h4 className="font-serif font-bold text-slate-900 text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        Buku Paling Diminati Jemaat & Pembaca
                      </h4>
                      <div className="space-y-2">
                        {books.slice(0, 4).map((b, i) => (
                          <div key={b.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-bold text-slate-400 w-4">{i + 1}.</span>
                              <span className="font-semibold text-slate-800 truncate">{b.title}</span>
                            </div>
                            <span className="font-mono text-amber-700 font-bold shrink-0">
                              {formatRupiah(b.price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Gateway Status Info */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                      <h4 className="font-serif font-bold text-slate-900 text-sm flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Status Payment Gateway & Resi
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between p-2 bg-emerald-50 rounded-lg text-emerald-900 font-medium">
                          <span>QRIS & Virtual Account Otomatis:</span>
                          <span className="font-bold text-emerald-700">AKTIF / LIVE</span>
                        </div>
                        <div className="flex justify-between p-2 bg-slate-50 rounded-lg text-slate-700 font-medium">
                          <span>Notifikasi WhatsApp Pelanggan:</span>
                          <span className="font-bold text-slate-900">AKTIF (wa.me)</span>
                        </div>
                        <div className="flex justify-between p-2 bg-slate-50 rounded-lg text-slate-700 font-medium">
                          <span>Jaringan Ekspedisi Terhubung:</span>
                          <span className="font-bold text-slate-900">JNE, POS, J&T, SiCepat</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: INVENTORY MANAGEMENT */}
              {activeTab === 'inventory' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="text-xl font-serif font-bold text-slate-900">
                        Kelola Inventaris & Stok Buku
                      </h3>
                      <p className="text-xs text-slate-500">
                        Tambah buku baru, perbarui stok, ubah harga, atau deskripsi
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          setBulkTargetCategory('ALL');
                          setBulkStockAmount(50);
                          setBulkRestockOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                        title="Tambah stok ke banyak buku sekaligus sebanyak mungkin"
                      >
                        <PackagePlus className="w-4 h-4 text-emerald-300" />
                        <span>Restock Massal (+ Stok)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setBatchAddModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                        title="Tambah banyak judul buku baru sekaligus (multi-baris atau copy-paste)"
                      >
                        <ListPlus className="w-4 h-4 text-blue-200" />
                        <span>Tambah Banyak Buku (Massal)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingBook(true);
                          setEditingBook(null);
                          setBookFormData({
                            title: '',
                            author: '',
                            category: 'Rohani & Doa',
                            price: 85000,
                            stock: 50,
                            weightGrams: 350,
                            coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
                            description: '',
                            publisher: 'Indonesia Publishing House (IPH)',
                            pages: 240,
                            isbn: '',
                          });
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F2C59] hover:bg-[#1a3d74] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Buku Baru</span>
                      </button>
                    </div>
                  </div>

                  {/* Add / Edit Form Modal */}
                  {(isAddingBook || editingBook) && (
                    <form onSubmit={handleSaveBook} className="bg-white p-5 rounded-2xl border-2 border-[#0F2C59] shadow-md space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                        <h4 className="font-serif font-bold text-slate-900 text-sm">
                          {isAddingBook ? 'Tambah Buku Baru ke Etalase' : `Edit Buku: ${editingBook?.title}`}
                        </h4>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingBook(false);
                            setEditingBook(null);
                          }}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-xs">
                        {/* Left Columns: Book Information Fields */}
                        <div className="lg:col-span-2 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="font-semibold text-slate-700 block mb-1">
                                Judul Buku <span className="text-rose-500">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="Contoh: Kemenangan Akhir (The Great Controversy)"
                                value={bookFormData.title || ''}
                                onChange={(e) => setBookFormData({ ...bookFormData, title: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium focus:ring-2 focus:ring-[#0F2C59]/20"
                              />
                            </div>
                            <div>
                              <label className="font-semibold text-slate-700 block mb-1">
                                Penulis / Pengarang <span className="text-rose-500">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="Contoh: Ellen G. White / Tim Penulis DMM"
                                value={bookFormData.author || ''}
                                onChange={(e) => setBookFormData({ ...bookFormData, author: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium focus:ring-2 focus:ring-[#0F2C59]/20"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="font-semibold text-slate-700 block mb-1">Kategori Buku</label>
                              <select
                                value={bookFormData.category || 'Rohani & Doa'}
                                onChange={(e) => setBookFormData({ ...bookFormData, category: e.target.value as any })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                              >
                                <option value="Rohani & Doa">Rohani & Doa</option>
                                <option value="Keluarga & Pernikahan">Keluarga & Pernikahan</option>
                                <option value="Kesehatan Alami">Kesehatan Alami</option>
                                <option value="Pendidikan Anak">Pendidikan Anak</option>
                                <option value="Misi & Sejarah Maluku">Misi & Sejarah Maluku</option>
                              </select>
                            </div>
                            <div>
                              <label className="font-semibold text-slate-700 block mb-1">Harga Jual (Rp) <span className="text-rose-500">*</span></label>
                              <input
                                type="number"
                                required
                                min={1000}
                                value={bookFormData.price || ''}
                                onChange={(e) => setBookFormData({ ...bookFormData, price: Number(e.target.value) })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold"
                              />
                            </div>
                            <div>
                              <label className="font-semibold text-slate-700 block mb-1">Harga Coret/Asli (Opsional)</label>
                              <input
                                type="number"
                                placeholder="Contoh: 110000"
                                value={bookFormData.originalPrice || ''}
                                onChange={(e) => setBookFormData({ ...bookFormData, originalPrice: e.target.value ? Number(e.target.value) : undefined })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="font-semibold text-slate-700 block">Stok Buku</label>
                                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                  Bebas / Tak Terbatas
                                </span>
                              </div>
                              <input
                                type="number"
                                required
                                min={0}
                                value={bookFormData.stock ?? 20}
                                onChange={(e) => setBookFormData({ ...bookFormData, stock: Math.max(0, Number(e.target.value)) })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-900"
                              />
                              <div className="flex items-center gap-1 mt-1 flex-wrap">
                                {[10, 50, 100, 500, 1000].map((inc) => (
                                  <button
                                    key={inc}
                                    type="button"
                                    onClick={() => setBookFormData((prev) => ({ ...prev, stock: (Number(prev.stock) || 0) + inc }))}
                                    className="px-1.5 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-[9px] font-bold transition-colors"
                                    title={`Tambah +${inc} ke stok`}
                                  >
                                    +{inc}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="font-semibold text-slate-700 block mb-1">Berat (gram)</label>
                              <input
                                type="number"
                                required
                                min={50}
                                value={bookFormData.weightGrams ?? 350}
                                onChange={(e) => setBookFormData({ ...bookFormData, weightGrams: Number(e.target.value) })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
                              />
                            </div>
                            <div>
                              <label className="font-semibold text-slate-700 block mb-1">Jumlah Halaman</label>
                              <input
                                type="number"
                                placeholder="240"
                                value={bookFormData.pages || ''}
                                onChange={(e) => setBookFormData({ ...bookFormData, pages: Number(e.target.value) })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="font-semibold text-slate-700 block mb-1">Penerbit Resmi</label>
                              <input
                                type="text"
                                placeholder="Indonesia Publishing House (IPH) / DMM"
                                value={bookFormData.publisher || ''}
                                onChange={(e) => setBookFormData({ ...bookFormData, publisher: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                              />
                            </div>
                            <div>
                              <label className="font-semibold text-slate-700 block mb-1">Nomor ISBN</label>
                              <input
                                type="text"
                                placeholder="978-602-8411-xx-x"
                                value={bookFormData.isbn || ''}
                                onChange={(e) => setBookFormData({ ...bookFormData, isbn: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">Sinopsis & Rangkuman Isi Buku</label>
                            <textarea
                              rows={3}
                              placeholder="Tuliskan gambaran isi buku, pesan rohani, atau bab utama yang dibahas..."
                              value={bookFormData.description || ''}
                              onChange={(e) => setBookFormData({ ...bookFormData, description: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                            />
                          </div>
                        </div>

                        {/* Right Column: Book Cover Live Preview & Selection Engine */}
                        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                              <ImageIcon className="w-4 h-4 text-[#0F2C59]" />
                              Sampul Buku
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              Pratinjau Langsung
                            </span>
                          </div>

                          {/* Live Cover Preview */}
                          <div className="bg-white p-3 rounded-xl border border-slate-200 flex gap-3 shadow-xs">
                            <div className="w-20 h-28 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200 relative shadow-2xs">
                              <img
                                src={bookFormData.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'}
                                alt="Cover preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback image if broken
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80';
                                }}
                              />
                            </div>
                            <div className="flex flex-col justify-between overflow-hidden text-[11px]">
                              <div>
                                <span className="bg-[#0F2C59]/10 text-[#0F2C59] font-bold text-[9px] px-1.5 py-0.5 rounded">
                                  {bookFormData.category || 'Kategori'}
                                </span>
                                <div className="font-serif font-bold text-slate-900 truncate mt-1 text-xs">
                                  {bookFormData.title || 'Judul Buku Baru'}
                                </div>
                                <div className="text-slate-500 text-[10px] truncate">
                                  {bookFormData.author || 'Nama Penulis'}
                                </div>
                              </div>
                              <div className="font-mono font-bold text-amber-900 text-xs">
                                {formatRupiah(Number(bookFormData.price) || 0)}
                              </div>
                            </div>
                          </div>

                          {/* Cover Selection Mode Tabs */}
                          <div className="flex rounded-lg bg-slate-200/80 p-0.5 text-[10px] font-bold">
                            <button
                              type="button"
                              onClick={() => setCoverMode('presets')}
                              className={`flex-1 py-1 rounded-md transition-all ${
                                coverMode === 'presets' ? 'bg-white text-[#0F2C59] shadow-2xs' : 'text-slate-600'
                              }`}
                            >
                              Koleksi Preset
                            </button>
                            <button
                              type="button"
                              onClick={() => setCoverMode('upload')}
                              className={`flex-1 py-1 rounded-md transition-all ${
                                coverMode === 'upload' ? 'bg-white text-[#0F2C59] shadow-2xs' : 'text-slate-600'
                              }`}
                            >
                              Unggah File
                            </button>
                            <button
                              type="button"
                              onClick={() => setCoverMode('url')}
                              className={`flex-1 py-1 rounded-md transition-all ${
                                coverMode === 'url' ? 'bg-white text-[#0F2C59] shadow-2xs' : 'text-slate-600'
                              }`}
                            >
                              URL Tautan
                            </button>
                          </div>

                          {/* Mode 1: Presets Gallery */}
                          {coverMode === 'presets' && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-[10px] text-slate-500">
                                <span>Pilih dari koleksi sampul:</span>
                                <select
                                  value={coverCategoryFilter}
                                  onChange={(e) => setCoverCategoryFilter(e.target.value)}
                                  className="bg-white border border-slate-200 rounded px-1 py-0.5 text-[10px]"
                                >
                                  <option value="ALL">Semua Kategori</option>
                                  <option value="Rohani & Doa">Rohani & Doa</option>
                                  <option value="Keluarga & Pernikahan">Keluarga & Pernikahan</option>
                                  <option value="Kesehatan Alami">Kesehatan Alami</option>
                                  <option value="Pendidikan Anak">Pendidikan Anak</option>
                                  <option value="Misi & Sejarah Maluku">Misi & Sejarah Maluku</option>
                                </select>
                              </div>

                              <div className="grid grid-cols-4 gap-1.5 max-h-40 overflow-y-auto p-1 bg-white rounded-lg border border-slate-200">
                                {PRESET_BOOK_COVERS.filter(
                                  (p) => coverCategoryFilter === 'ALL' || p.category === coverCategoryFilter
                                ).map((preset, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setBookFormData({ ...bookFormData, coverImage: preset.url })}
                                    className={`relative group rounded-md overflow-hidden aspect-3/4 border-2 transition-all ${
                                      bookFormData.coverImage === preset.url
                                        ? 'border-[#0F2C59] ring-2 ring-[#0F2C59]/30 scale-95'
                                        : 'border-transparent hover:border-slate-300'
                                    }`}
                                    title={preset.name}
                                  >
                                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center p-0.5 text-[9px] text-white text-center leading-tight transition-opacity">
                                      {preset.name}
                                    </div>
                                    {bookFormData.coverImage === preset.url && (
                                      <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#0F2C59] text-white rounded-full flex items-center justify-center">
                                        <Check className="w-2.5 h-2.5" />
                                      </div>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Mode 2: Upload File From Device */}
                          {coverMode === 'upload' && (
                            <div className="space-y-2">
                              <label className="border-2 border-dashed border-slate-300 hover:border-[#0F2C59] rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-white transition-colors">
                                <Upload className="w-6 h-6 text-[#0F2C59]" />
                                <span className="font-bold text-slate-700 text-xs">Pilih Gambar Sampul</span>
                                <span className="text-[10px] text-slate-400 text-center">
                                  PNG, JPG, atau WebP dari Laptop / HP (Maks. 2.5MB)
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          )}

                          {/* Mode 3: Direct URL Link */}
                          {coverMode === 'url' && (
                            <div className="space-y-1.5">
                              <label className="text-[10px] text-slate-500 font-semibold block">
                                Tempel URL Gambar Web:
                              </label>
                              <input
                                type="url"
                                placeholder="https://domain.com/gambar-sampul.jpg"
                                value={bookFormData.coverImage || ''}
                                onChange={(e) => setBookFormData({ ...bookFormData, coverImage: e.target.value })}
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono text-[11px]"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-between items-center gap-2 pt-3 border-t border-slate-200">
                        <div className="text-[11px] text-slate-500">
                          {isAddingBook && (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                              <Sparkles className="w-3.5 h-3.5" />
                              Klik "Simpan & Tambah Lagi" untuk menginput banyak buku tanpa perlu bolak-balik buka form.
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingBook(false);
                              setEditingBook(null);
                            }}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                          >
                            Batal
                          </button>

                          {isAddingBook && (
                            <button
                              type="button"
                              onClick={handleSaveAndAddAnother}
                              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                              title="Simpan buku ini dan langsung lanjut ketik buku berikutnya"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Simpan & Tambah Lagi</span>
                            </button>
                          )}

                          <button
                            type="submit"
                            className="px-5 py-2 bg-[#0F2C59] hover:bg-[#1a3d74] text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                          >
                            {isAddingBook ? 'Simpan & Tutup' : 'Simpan Perubahan'}
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Search & Category Filter for Inventory */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={adminBookSearch}
                          onChange={(e) => setAdminBookSearch(e.target.value)}
                          placeholder="Cari judul buku, penulis, atau ISBN..."
                          className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-[#0F2C59]"
                        />
                        {adminBookSearch && (
                          <button
                            type="button"
                            onClick={() => setAdminBookSearch('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      <select
                        value={adminBookCategoryFilter}
                        onChange={(e) => setAdminBookCategoryFilter(e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium"
                      >
                        <option value="ALL">Semua Kategori</option>
                        <option value="Rohani & Doa">Rohani & Doa</option>
                        <option value="Keluarga & Pernikahan">Keluarga & Pernikahan</option>
                        <option value="Kesehatan Alami">Kesehatan Alami</option>
                        <option value="Pendidikan Anak">Pendidikan Anak</option>
                        <option value="Misi & Sejarah Maluku">Misi & Sejarah Maluku</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-medium">
                        Menampilkan <strong className="text-slate-800">{filteredAdminBooks.length}</strong> dari {books.length} buku
                      </span>
                    </div>
                  </div>

                  {/* Books Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                          <tr>
                            <th className="p-3">Buku & Penulis</th>
                            <th className="p-3">Kategori</th>
                            <th className="p-3">Harga</th>
                            <th className="p-3">Stok</th>
                            <th className="p-3 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredAdminBooks.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-slate-400">
                                <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                <p className="font-semibold text-slate-600">Tidak ada buku yang cocok dengan pencarian.</p>
                                <p className="text-xs text-slate-400 mt-1">Coba kata kunci lain atau gunakan tombol Tambah Buku.</p>
                              </td>
                            </tr>
                          ) : (
                            filteredAdminBooks.map((b) => (
                            <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-3">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={b.coverImage}
                                    alt={b.title}
                                    referrerPolicy="no-referrer"
                                    className="w-10 h-14 object-cover rounded shadow-2xs border border-slate-200 shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <div className="font-serif font-bold text-slate-900 truncate max-w-xs">{b.title}</div>
                                    <div className="text-[11px] text-slate-400">{b.author}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3">
                                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium text-[11px]">
                                  {b.category}
                                </span>
                              </td>
                              <td className="p-3 font-mono font-bold text-[#0F2C59]">
                                {formatRupiah(b.price)}
                              </td>
                              <td className="p-3">
                                <div className="flex flex-col gap-1.5 min-w-[170px]">
                                  <div className="flex items-center justify-between">
                                    <span className={`px-2 py-0.5 rounded-full font-mono font-bold text-[11px] ${
                                      b.stock > 20 ? 'bg-emerald-100 text-emerald-800' : b.stock > 0 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                                    }`}>
                                      Stok: {b.stock}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setStockTargetBook(b);
                                        setCustomStockAmount('50');
                                        setStockAdjustmentMode('add');
                                      }}
                                      className="px-2 py-0.5 bg-[#0F2C59] hover:bg-[#1a3d74] text-white rounded text-[10px] font-bold inline-flex items-center gap-1 shadow-2xs transition-colors"
                                      title="Buka menu tambah stok sebanyak mungkin"
                                    >
                                      <Layers className="w-3 h-3" />
                                      <span>+ Stok</span>
                                    </button>
                                  </div>

                                  {/* Quick increment chips for instant addition */}
                                  <div className="flex items-center gap-1">
                                    {[10, 50, 100, 500].map((qty) => (
                                      <button
                                        key={qty}
                                        type="button"
                                        onClick={() => {
                                          handleQuickRestock(b.id, qty);
                                          showAdminToast(`Stok "${b.title.slice(0, 20)}..." bertambah +${qty}!`);
                                        }}
                                        className="flex-1 py-0.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 rounded text-[9px] font-bold text-slate-700 transition-colors"
                                        title={`Tambah ${qty} stok seketika`}
                                      >
                                        +{qty}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleDuplicateBook(b)}
                                    className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                    title="Gandakan / Duplikasi Buku Ini (Buat Buku Baru Cepat)"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingBook(b);
                                      setBookFormData({ ...b });
                                      setIsAddingBook(false);
                                    }}
                                    className="p-1.5 text-slate-600 hover:text-[#0F2C59] hover:bg-slate-100 rounded-lg transition-colors"
                                    title="Edit Buku"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteBook(b.id)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                    title="Hapus Buku"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ORDER MANAGEMENT & RESI */}
              {activeTab === 'orders' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="text-xl font-serif font-bold text-slate-900">
                        Kelola Pesanan, Resi & Notifikasi WhatsApp
                      </h3>
                      <p className="text-xs text-slate-500">
                        Proses pesanan masuk, input nomor resi kurir, dan kirimkan update otomatis ke pelanggan
                      </p>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
                      {['ALL', 'Menunggu Pembayaran', 'Dibayar & Diproses', 'Sedang Dikemas', 'Dikirim', 'Selesai'].map((st) => (
                        <button
                          key={st}
                          onClick={() => setOrderFilter(st)}
                          className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                            orderFilter === st
                              ? 'bg-[#0F2C59] text-white'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {st === 'ALL' ? 'Semua' : st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input Resi Quick Drawer / Modal */}
                  {selectedOrderForResi && (
                    <div className="bg-amber-50 border-2 border-amber-400 p-4 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-amber-900 text-xs">
                          Input Nomor Resi untuk Pesanan {selectedOrderForResi.id} ({selectedOrderForResi.shipping.recipientName})
                        </span>
                        <button onClick={() => setSelectedOrderForResi(null)} className="text-amber-700">✕</button>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Contoh: BBDMM-JNE-882910"
                          value={newResiInput}
                          onChange={(e) => setNewResiInput(e.target.value)}
                          className="flex-1 bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-mono"
                        />
                        <button
                          onClick={handleSaveResi}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs"
                        >
                          Simpan & Update Status Dikirim
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Orders List */}
                  <div className="space-y-4">
                    {filteredOrders.length === 0 ? (
                      <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
                        Tidak ada pesanan dengan status ini.
                      </div>
                    ) : (
                      filteredOrders.map((order) => (
                        <div
                          key={order.id}
                          className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3"
                        >
                          {/* Order Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-900 text-sm">{order.id}</span>
                              <span className="text-slate-400">•</span>
                              <span className="text-slate-500">{formatTanggalIndo(order.createdAt)}</span>
                              <span className="text-slate-400">•</span>
                              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                {order.paymentStatus === 'paid' ? 'LUNAS (Gateway)' : 'Belum Lunas'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">Status Pesanan:</span>
                              <select
                                value={order.orderStatus}
                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-[#0F2C59] focus:outline-none"
                              >
                                <option value="Menunggu Pembayaran">Menunggu Pembayaran</option>
                                <option value="Dibayar & Diproses">Dibayar & Diproses</option>
                                <option value="Sedang Dikemas">Sedang Dikemas</option>
                                <option value="Dikirim">Dikirim</option>
                                <option value="Selesai">Selesai</option>
                                <option value="Dibatalkan">Dibatalkan</option>
                              </select>
                            </div>
                          </div>

                          {/* Order Info & Items */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div>
                              <span className="text-slate-400 block font-semibold mb-1">Penerima & Kontak Aktif:</span>
                              <div className="font-bold text-slate-800">{order.shipping.recipientName}</div>
                              {order.shipping.email && (
                                <div className="font-mono text-blue-700 font-medium text-[11px] flex items-center gap-1.5 mt-0.5">
                                  <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                  <span className="truncate">{order.shipping.email}</span>
                                </div>
                              )}
                              <div className="font-mono text-emerald-700 font-semibold mt-0.5 flex items-center gap-1.5">
                                <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span>{order.shipping.phoneNumber}</span>
                              </div>
                              <div className="text-slate-500 mt-1 flex items-start gap-1">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                                <span>{order.shipping.city} ({order.shipping.address})</span>
                              </div>
                            </div>

                            <div>
                              <span className="text-slate-400 block font-semibold mb-1">Buku yang Dipesan:</span>
                              <div className="space-y-1">
                                {order.items.map((it, idx) => (
                                  <div key={idx} className="text-slate-700 truncate">
                                    • {it.book.title} <span className="font-mono font-bold">({it.quantity}x)</span>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-1 font-bold text-[#0F2C59]">
                                Total: {formatRupiah(order.totalAmount)}
                              </div>
                            </div>

                            <div>
                              <span className="text-slate-400 block font-semibold mb-1">Kurir & Nomor Resi:</span>
                              <div className="font-semibold text-slate-800">
                                {order.shipping.courier} ({order.shipping.serviceType})
                              </div>
                              <div className="font-mono font-bold text-amber-700 mt-0.5">
                                {order.trackingNumber ? (
                                  <span>{order.trackingNumber}</span>
                                ) : (
                                  <span className="text-slate-400 font-normal italic">Belum ada resi</span>
                                )}
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedOrderForResi(order);
                                  setNewResiInput(order.trackingNumber || '');
                                }}
                                className="mt-1 text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-medium"
                              >
                                <Truck className="w-3 h-3" /> Input / Ganti Nomor Resi
                              </button>
                            </div>
                          </div>

                          {/* WhatsApp Auto-Trigger Bar */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
                            <span className="text-slate-500 text-[11px] flex items-center gap-1">
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                              Notifikasi WhatsApp Otomatis Siap Kirim
                            </span>

                            <a
                              href={generateWhatsAppUrl(
                                order.shipping.phoneNumber,
                                generateWhatsAppMessage(order, order.orderStatus === 'Dikirim' ? 'order_shipped' : 'payment_confirmed')
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-2xs"
                            >
                              <Send className="w-3 h-3" />
                              <span>Kirimkan Notifikasi WA Sekarang</span>
                              <ExternalLink className="w-3 h-3 text-emerald-200" />
                            </a>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB: CUSTOMER INQUIRIES & WHATSAPP CONSULTATIONS */}
              {activeTab === 'inquiries' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
                        <MessageCircle className="w-6 h-6 text-emerald-600" />
                        <span>Konsultasi & Pertanyaan Pelanggan</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Daftar pertanyaan seputar stok buku rohani, kesehatan, dan ongkos kirim ke pulau-pulau Maluku.
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setInquiryFilter('ALL')}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                          inquiryFilter === 'ALL'
                            ? 'bg-white text-[#0F2C59] shadow-xs font-bold'
                            : 'hover:text-slate-900'
                        }`}
                      >
                        Semua ({customerInquiries.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setInquiryFilter('pending')}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                          inquiryFilter === 'pending'
                            ? 'bg-white text-emerald-700 shadow-xs font-bold'
                            : 'hover:text-slate-900'
                        }`}
                      >
                        Menunggu Balasan ({customerInquiries.filter(i => i.status === 'pending').length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setInquiryFilter('replied')}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                          inquiryFilter === 'replied'
                            ? 'bg-white text-slate-800 shadow-xs font-bold'
                            : 'hover:text-slate-900'
                        }`}
                      >
                        Sudah Dibalas ({customerInquiries.filter(i => i.status === 'replied').length})
                      </button>
                    </div>
                  </div>

                  {/* List of Customer Inquiries */}
                  <div className="space-y-4">
                    {customerInquiries
                      .filter((inq) => inquiryFilter === 'ALL' || inq.status === inquiryFilter)
                      .length === 0 ? (
                      <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                          <MessageCircle className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm">
                          {inquiryFilter === 'pending' 
                            ? 'Tidak ada pertanyaan yang menunggu balasan.' 
                            : 'Belum ada data pertanyaan dari pengunjung.'}
                        </h4>
                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                          Pelanggan dapat bertanya langsung melalui tombol "Tanya Admin / Konsultasi Buku" yang tersedia di kartu buku, detail buku, serta tombol mengambang WhatsApp di beranda.
                        </p>
                      </div>
                    ) : (
                      customerInquiries
                        .filter((inq) => inquiryFilter === 'ALL' || inq.status === inquiryFilter)
                        .map((inq) => {
                          const replyMessage = `Halo Kak ${inq.customerName || 'Pelanggan'}, terima kasih telah menghubungi Toko Buku Rohani & Kesehatan Berkat DMM Ambon. Menanggapi pertanyaan Kakak mengenai: "${inq.message || inq.bookTitle || 'koleksi buku'}", berikut informasinya: `;
                          const replyUrl = generateWhatsAppUrl(inq.customerPhone, replyMessage);

                          return (
                            <div
                              key={inq.id}
                              className={`bg-white rounded-2xl p-5 border transition-all space-y-4 shadow-xs ${
                                inq.status === 'pending'
                                  ? 'border-emerald-200 ring-1 ring-emerald-500/20'
                                  : 'border-slate-200/80 bg-slate-50/40'
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-[#0F2C59] text-amber-400 flex items-center justify-center font-bold text-sm">
                                    {(inq.customerName || 'P').charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-bold text-slate-900 text-sm">{inq.customerName}</h4>
                                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                        inq.status === 'pending'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : 'bg-slate-100 text-slate-600'
                                      }`}>
                                        {inq.status === 'pending' ? '• Perlu Dibalas' : '✓ Sudah Dibalas'}
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5 flex-wrap">
                                      <span className="font-mono text-slate-700">{inq.customerPhone}</span>
                                      {inq.customerEmail && <span>• {inq.customerEmail}</span>}
                                      {inq.region && (
                                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-600">
                                          📍 {inq.region}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="text-[11px] text-slate-400 sm:text-right">
                                  {formatTanggalIndo(inq.createdAt)}
                                </div>
                              </div>

                              {inq.bookTitle && (
                                <div className="bg-amber-50/80 border border-amber-200/70 rounded-xl p-3 flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-2 text-xs">
                                    <BookOpen className="w-4 h-4 text-amber-700 shrink-0" />
                                    <div>
                                      <span className="text-[10px] text-amber-800 font-semibold uppercase block">Buku yang Ditanyakan:</span>
                                      <span className="font-bold text-slate-900">{inq.bookTitle}</span>
                                      {inq.bookCategory && (
                                        <span className="text-slate-500 text-[11px] ml-1.5">({inq.bookCategory})</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 text-xs text-slate-800 leading-relaxed">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                  Pertanyaan / Pesan:
                                </div>
                                <p className="font-medium">{inq.message}</p>
                              </div>

                              <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (onUpdateInquiries) {
                                        const updated = customerInquiries.map((item) =>
                                          item.id === inq.id
                                            ? { ...item, status: (item.status === 'pending' ? 'replied' : 'pending') as 'pending' | 'replied' }
                                            : item
                                        );
                                        onUpdateInquiries(updated);
                                        showAdminToast(
                                          inq.status === 'pending'
                                            ? 'Status ditandai: Sudah Dibalas'
                                            : 'Status dikembalikan ke: Menunggu Balasan'
                                        );
                                      }
                                    }}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                      inq.status === 'pending'
                                        ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                                        : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
                                    }`}
                                  >
                                    {inq.status === 'pending' ? 'Tandai Telah Dibalas' : 'Buka Kembali Status'}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (window.confirm('Hapus riwayat pertanyaan ini?')) {
                                        if (onUpdateInquiries) {
                                          const filtered = customerInquiries.filter((item) => item.id !== inq.id);
                                          onUpdateInquiries(filtered);
                                          showAdminToast('Pertanyaan berhasil dihapus');
                                        }
                                      }
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all"
                                    title="Hapus Pertanyaan"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>

                                <a
                                  href={replyUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => {
                                    if (inq.status === 'pending' && onUpdateInquiries) {
                                      const updated = customerInquiries.map((item) =>
                                        item.id === inq.id ? { ...item, status: 'replied' as const } : item
                                      );
                                      onUpdateInquiries(updated);
                                    }
                                  }}
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>Balas Pelanggan via WhatsApp</span>
                                  <ExternalLink className="w-3 h-3 text-emerald-200" />
                                </a>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: RUNNING ANNOUNCEMENTS */}
              {activeTab === 'announcements' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-slate-900">
                      Kelola Papan Pengumuman & Iklan Berjalan
                    </h3>
                    <p className="text-xs text-slate-500">
                      Teks berjalan di bagian atas website untuk info promo, diskon jemaat, dan jadwal pengiriman
                    </p>
                  </div>

                  {/* Add New Announcement */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">
                      Tambah Teks Pengumuman Baru:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newAnnouncementText}
                        onChange={(e) => setNewAnnouncementText(e.target.value)}
                        placeholder="Contoh: 🎁 Promo Pembelian Paket Buku Keluarga Diskon 15% Minggu Ini!"
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                      />
                      <button
                        onClick={handleAddAnnouncement}
                        className="px-4 py-2 bg-[#0F2C59] hover:bg-[#1a3d74] text-white font-bold rounded-xl text-xs"
                      >
                        Tambah
                      </button>
                    </div>
                  </div>

                  {/* List of Announcements */}
                  <div className="space-y-2">
                    {announcementList.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                      >
                        <span className="font-medium text-slate-700 flex-1">{item}</span>
                        <button
                          onClick={() => handleDeleteAnnouncement(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: EKSPEDISI KURIR (PILIHAN KURIR, BIAYA, ESTIMASI) */}
              {activeTab === 'couriers' && (
                <CourierSettingsTab
                  settings={settingsFormData}
                  onUpdateSettings={(newSettings) => {
                    const normalized = normalizeStoreSettings(newSettings);
                    setSettingsFormData(normalized);
                    if (onUpdateStoreSettings) {
                      onUpdateStoreSettings(normalized);
                    }
                  }}
                  onShowNotification={showAdminToast}
                />
              )}

              {/* TAB: METODE PEMBAYARAN (BANK, E-WALLET, TRANSFER & QRIS) */}
              {activeTab === 'payments' && (
                <PaymentSettingsTab
                  settings={settingsFormData}
                  onUpdateSettings={(newSettings) => {
                    const normalized = normalizeStoreSettings(newSettings);
                    setSettingsFormData(normalized);
                    if (onUpdateStoreSettings) {
                      onUpdateStoreSettings(normalized);
                    }
                  }}
                  onShowNotification={showAdminToast}
                />
              )}

              {/* TAB 5: STORE SETTINGS & BANK ACCOUNTS (EDIT NOMOR REKENING) */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h3 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-[#0F2C59]" />
                        <span>Pengaturan Nomor Rekening & Profil Toko</span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        Atur nomor rekening tujuan transfer, identitas toko, nomor WhatsApp resmi, dan nama QRIS yang tampil ke pelanggan saat checkout
                      </p>
                    </div>

                    {settingsSavedSuccess && (
                      <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-pulse">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Nomor Rekening & Pengaturan Berhasil Disimpan!</span>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleSaveStoreSettings} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Left Column: Bank Accounts Configuration */}
                      <div className="space-y-5">
                        {/* Primary Bank Card */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-[#0F2C59]" />
                              <h4 className="font-bold text-slate-900 text-sm">Rekening Bank Utama (Transfer Pelanggan)</h4>
                            </div>
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Wajib / Utama
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <label className="font-semibold text-slate-700 block mb-1">Nama Bank</label>
                              <input
                                type="text"
                                required
                                placeholder="Contoh: Bank Rakyat Indonesia (BRI)"
                                value={settingsFormData.primaryBank.bankName}
                                onChange={(e) =>
                                  setSettingsFormData({
                                    ...settingsFormData,
                                    primaryBank: { ...settingsFormData.primaryBank, bankName: e.target.value }
                                  })
                                }
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium"
                              />
                            </div>

                            <div>
                              <label className="font-semibold text-slate-700 block mb-1">Nomor Rekening</label>
                              <input
                                type="text"
                                required
                                placeholder="Contoh: 0115-01-002847-50-8"
                                value={settingsFormData.primaryBank.accountNumber}
                                onChange={(e) =>
                                  setSettingsFormData({
                                    ...settingsFormData,
                                    primaryBank: { ...settingsFormData.primaryBank, accountNumber: e.target.value }
                                  })
                                }
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono font-bold text-slate-900"
                              />
                            </div>

                            <div>
                              <label className="font-semibold text-slate-700 block mb-1">Atas Nama Rekening</label>
                              <input
                                type="text"
                                required
                                placeholder="Contoh: TOKO BUKU BERKAT DMM"
                                value={settingsFormData.primaryBank.accountHolder}
                                onChange={(e) =>
                                  setSettingsFormData({
                                    ...settingsFormData,
                                    primaryBank: { ...settingsFormData.primaryBank, accountHolder: e.target.value }
                                  })
                                }
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium uppercase text-slate-900"
                              />
                            </div>

                            <div>
                              <label className="font-semibold text-slate-700 block mb-1">Kantor Cabang</label>
                              <input
                                type="text"
                                placeholder="Contoh: KC Ambon"
                                value={settingsFormData.primaryBank.branch || ''}
                                onChange={(e) =>
                                  setSettingsFormData({
                                    ...settingsFormData,
                                    primaryBank: { ...settingsFormData.primaryBank, branch: e.target.value }
                                  })
                                }
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Secondary Bank Card (Optional) */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-slate-500" />
                              <h4 className="font-bold text-slate-900 text-sm">Rekening Bank Cadangan / Alternatif</h4>
                            </div>
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settingsFormData.secondaryBank?.isActive ?? false}
                                onChange={(e) =>
                                  setSettingsFormData({
                                    ...settingsFormData,
                                    secondaryBank: settingsFormData.secondaryBank
                                      ? { ...settingsFormData.secondaryBank, isActive: e.target.checked }
                                      : {
                                          bankName: 'Bank Central Asia (BCA)',
                                          accountNumber: '8801928471',
                                          accountHolder: 'BUKU BERKAT DMM',
                                          branch: 'KCU Ambon',
                                          isActive: e.target.checked
                                        }
                                  })
                                }
                                className="rounded text-[#0F2C59] focus:ring-[#0F2C59]"
                              />
                              <span>Aktifkan Rekening Cadangan</span>
                            </label>
                          </div>

                          {settingsFormData.secondaryBank?.isActive ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              <div>
                                <label className="font-semibold text-slate-700 block mb-1">Nama Bank Cadangan</label>
                                <input
                                  type="text"
                                  placeholder="Contoh: Bank Central Asia (BCA)"
                                  value={settingsFormData.secondaryBank.bankName}
                                  onChange={(e) =>
                                    setSettingsFormData({
                                      ...settingsFormData,
                                      secondaryBank: { ...settingsFormData.secondaryBank!, bankName: e.target.value }
                                    })
                                  }
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium"
                                />
                              </div>

                              <div>
                                <label className="font-semibold text-slate-700 block mb-1">Nomor Rekening</label>
                                <input
                                  type="text"
                                  placeholder="Contoh: 8801928471"
                                  value={settingsFormData.secondaryBank.accountNumber}
                                  onChange={(e) =>
                                    setSettingsFormData({
                                      ...settingsFormData,
                                      secondaryBank: { ...settingsFormData.secondaryBank!, accountNumber: e.target.value }
                                    })
                                  }
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono font-bold text-slate-900"
                                />
                              </div>

                              <div>
                                <label className="font-semibold text-slate-700 block mb-1">Atas Nama Rekening</label>
                                <input
                                  type="text"
                                  placeholder="Contoh: TOKO BUKU BERKAT DMM"
                                  value={settingsFormData.secondaryBank.accountHolder}
                                  onChange={(e) =>
                                    setSettingsFormData({
                                      ...settingsFormData,
                                      secondaryBank: { ...settingsFormData.secondaryBank!, accountHolder: e.target.value }
                                    })
                                  }
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium uppercase text-slate-900"
                                />
                              </div>

                              <div>
                                <label className="font-semibold text-slate-700 block mb-1">Kantor Cabang</label>
                                <input
                                  type="text"
                                  placeholder="Contoh: KCU Ambon"
                                  value={settingsFormData.secondaryBank.branch || ''}
                                  onChange={(e) =>
                                    setSettingsFormData({
                                      ...settingsFormData,
                                      secondaryBank: { ...settingsFormData.secondaryBank!, branch: e.target.value }
                                    })
                                  }
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="bg-slate-50 p-3 rounded-xl text-center text-xs text-slate-500 border border-dashed border-slate-200">
                              Rekening cadangan dinonaktifkan. Hanya Rekening Utama yang akan ditampilkan ke pelanggan.
                            </div>
                          )}
                        </div>

                        {/* Payment Instructions Note */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                          <label className="font-bold text-slate-900 text-sm block">
                            Catatan / Instruksi Pembayaran Transfer
                          </label>
                          <textarea
                            rows={2}
                            value={settingsFormData.paymentInstructions || ''}
                            onChange={(e) =>
                              setSettingsFormData({ ...settingsFormData, paymentInstructions: e.target.value })
                            }
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs"
                            placeholder="Tuliskan petunjuk transfer bank yang muncul di layar pelanggan..."
                          />
                        </div>
                      </div>

                      {/* Right Column: Store Profile & Contacts + Live Customer Checkout Preview */}
                      <div className="space-y-5">
                        {/* Store Contacts & Identification */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                            <Info className="w-4 h-4 text-[#0F2C59]" />
                            <h4 className="font-bold text-slate-900 text-sm">Informasi & Kontak Toko</h4>
                          </div>

                          <div className="space-y-3 text-xs">
                            <div>
                              <label className="font-semibold text-slate-700 block mb-1">Nama Usaha / Toko</label>
                              <input
                                type="text"
                                required
                                value={settingsFormData.storeName}
                                onChange={(e) => setSettingsFormData({ ...settingsFormData, storeName: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-bold text-slate-900"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="font-semibold text-slate-700 block mb-1">Nomor WhatsApp Resmi Admin</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="6281248002026"
                                  value={settingsFormData.adminWhatsApp}
                                  onChange={(e) => setSettingsFormData({ ...settingsFormData, adminWhatsApp: e.target.value })}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono text-emerald-800 font-bold"
                                />
                              </div>

                              <div>
                                <label className="font-semibold text-slate-700 block mb-1">Email Resmi Toko</label>
                                <input
                                  type="email"
                                  required
                                  placeholder="bukuberkat.dmm@gmail.com"
                                  value={settingsFormData.storeEmail}
                                  onChange={(e) => setSettingsFormData({ ...settingsFormData, storeEmail: e.target.value })}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono text-blue-800"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="font-semibold text-slate-700 block mb-1">Nama Merchant QRIS</label>
                              <input
                                type="text"
                                required
                                placeholder="TOKO BUKU MISI MALUKU QRIS"
                                value={settingsFormData.qrisMerchantName}
                                onChange={(e) => setSettingsFormData({ ...settingsFormData, qrisMerchantName: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono uppercase"
                              />
                            </div>

                            <div>
                              <label className="font-semibold text-slate-700 block mb-1">Alamat Kantor & Gudang Toko di Maluku</label>
                              <textarea
                                rows={2}
                                value={settingsFormData.storeAddress}
                                onChange={(e) => setSettingsFormData({ ...settingsFormData, storeAddress: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Real-Time Live Preview of Checkout Bank View */}
                        <div className="bg-linear-to-br from-slate-900 to-[#0F2C59] p-5 rounded-2xl text-white space-y-3 shadow-md">
                          <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
                            <span className="font-bold flex items-center gap-1.5">
                              <Eye className="w-4 h-4 text-amber-400" />
                              Pratinjau Tampilan Checkout Pelanggan
                            </span>
                            <span className="text-[10px] text-slate-300">Live View</span>
                          </div>

                          <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/15 space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-amber-300 text-xs">
                                {settingsFormData.primaryBank.bankName || 'Nama Bank'}
                              </span>
                              <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded font-bold">
                                Otomatis Terverifikasi
                              </span>
                            </div>
                            <div className="flex items-center justify-between bg-black/20 p-2 rounded-lg">
                              <span className="font-mono text-sm font-bold tracking-wider text-white">
                                {settingsFormData.primaryBank.accountNumber || '0000-00-000000-00-0'}
                              </span>
                              <span className="text-[10px] text-amber-300 font-semibold">Salin No. Rekening</span>
                            </div>
                            <div className="text-[11px] text-slate-300">
                              a.n. <span className="font-bold text-white uppercase">{settingsFormData.primaryBank.accountHolder || 'NAMA PEMILIK'}</span>
                              {settingsFormData.primaryBank.branch && <span> ({settingsFormData.primaryBank.branch})</span>}
                            </div>
                          </div>

                          {settingsFormData.secondaryBank?.isActive && (
                            <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/15 space-y-2 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-amber-300 text-xs">
                                  {settingsFormData.secondaryBank.bankName}
                                </span>
                                <span className="text-[10px] text-slate-300">Bank Alternatif</span>
                              </div>
                              <div className="flex items-center justify-between bg-black/20 p-2 rounded-lg">
                                <span className="font-mono text-sm font-bold tracking-wider text-white">
                                  {settingsFormData.secondaryBank.accountNumber}
                                </span>
                                <span className="text-[10px] text-amber-300 font-semibold">Salin No. Rekening</span>
                              </div>
                              <div className="text-[11px] text-slate-300">
                                a.n. <span className="font-bold text-white uppercase">{settingsFormData.secondaryBank.accountHolder}</span>
                              </div>
                            </div>
                          )}

                          <div className="text-[11px] text-slate-300 italic pt-1">
                            💬 Pesan konfirmasi otomatis dan WhatsApp akan langsung diarahkan ke: <strong className="text-white">+{settingsFormData.adminWhatsApp}</strong>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={handleResetStoreSettings}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 shadow-2xs transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Kembalikan ke Default Resmi</span>
                      </button>

                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0F2C59] hover:bg-[#1a3d74] text-white font-bold rounded-xl text-xs shadow-md hover:shadow-lg transition-all"
                      >
                        <Save className="w-4 h-4" />
                        <span>Simpan Pengaturan Rekening & Toko</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 7: WEBSITE APPEARANCE & CONTENT CMS */}
              {activeTab === 'website' && (
                <WebsiteEditorTab
                  storeSettings={storeSettings}
                  onSaveSettings={(newSettings) => {
                    setSettingsFormData(newSettings);
                    if (onUpdateStoreSettings) {
                      onUpdateStoreSettings(newSettings);
                    }
                  }}
                  onNavigateToStore={onNavigateToStore}
                  showToast={showAdminToast}
                />
              )}

              {/* TAB 8: SECURITY & ADMIN PASSWORD MANAGEMENT */}
              {activeTab === 'security' && (
                <SecuritySettingsTab onShowNotification={showAdminToast} />
              )}

            </div>
          </div>
        )}

        {/* MODAL 1: ATUR & TAMBAH STOK SATU BUKU SEBANYAK MUNGKIN */}
        {stockTargetBook && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-5">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <PackagePlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-slate-900 text-base">
                      Atur & Tambah Stok Buku
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-1 max-w-[240px]">
                      {stockTargetBook.title}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStockTargetBook(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Current Stock Banner */}
              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 font-medium block">Stok Terdata Saat Ini</span>
                  <span className="text-lg font-mono font-bold text-slate-900">
                    {stockTargetBook.stock} <span className="text-xs font-normal text-slate-500">eksemplar</span>
                  </span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  stockTargetBook.stock > 20
                    ? 'bg-emerald-100 text-emerald-800'
                    : stockTargetBook.stock > 0
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {stockTargetBook.stock > 20 ? 'Stok Melimpah' : stockTargetBook.stock > 0 ? 'Stok Terbatas' : 'Stok Habis'}
                </span>
              </div>

              {/* Mode: Tambah vs Atur Langsung */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Pilih Mode Perubahan Stok:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStockAdjustmentMode('add')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      stockAdjustmentMode === 'add'
                        ? 'bg-[#0F2C59] text-white border-[#0F2C59] shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    + Tambahkan ke Stok Lama
                  </button>
                  <button
                    type="button"
                    onClick={() => setStockAdjustmentMode('set')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      stockAdjustmentMode === 'set'
                        ? 'bg-[#0F2C59] text-white border-[#0F2C59] shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    = Set Jumlah Stok Baru
                  </button>
                </div>
              </div>

              {/* Quick preset chips */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-600">
                  {stockAdjustmentMode === 'add' ? 'Pilih Cepat Tambahan Stok:' : 'Pilih Cepat Jumlah Stok:'}
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[10, 25, 50, 100, 250, 500, 1000, 5000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setCustomStockAmount(String(val))}
                      className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-colors border ${
                        customStockAmount === String(val)
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white hover:bg-emerald-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {stockAdjustmentMode === 'add' ? `+${val}` : `${val}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input Field */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    {stockAdjustmentMode === 'add' ? 'Atau Ketik Jumlah Tambahan Bebas:' : 'Ketik Jumlah Stok Baru:'}
                  </label>
                  <span className="text-[10px] text-emerald-600 font-bold">Bisa sebanyak mungkin</span>
                </div>
                <input
                  type="number"
                  min={0}
                  value={customStockAmount}
                  onChange={(e) => setCustomStockAmount(e.target.value)}
                  placeholder="Contoh: 200, 500, 1000, 5000..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono font-bold text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Projected Result */}
              {customStockAmount && !isNaN(parseInt(customStockAmount, 10)) && (
                <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                  <span className="font-medium">Total stok setelah disimpan:</span>
                  <span className="font-mono font-bold text-sm text-emerald-800">
                    {stockAdjustmentMode === 'add'
                      ? stockTargetBook.stock + Math.max(0, parseInt(customStockAmount, 10))
                      : Math.max(0, parseInt(customStockAmount, 10))}{' '}
                    eksemplar
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStockTargetBook(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleApplySingleStockAdjustment}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Perubahan Stok</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: RESTOCK MASSAL (TAMBAH STOK BANYAK BUKU SEKALIGUS) */}
        {bulkRestockOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-5">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <PackagePlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-slate-900 text-base">
                      Restock Massal (Tambah Stok Banyak Buku)
                    </h4>
                    <p className="text-xs text-slate-500">
                      Tambah stok sekaligus ke banyak buku tanpa perlu edit satu per satu
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setBulkRestockOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Target Scope Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Pilih Target Buku yang Ingin Ditambah Stok:</label>
                <select
                  value={bulkTargetCategory}
                  onChange={(e) => setBulkTargetCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="ALL">Semua Buku di Etalase ({books.length} Judul Buku)</option>
                  <option value="Rohani & Doa">Khusus Kategori: Rohani & Doa</option>
                  <option value="Keluarga & Pernikahan">Khusus Kategori: Keluarga & Pernikahan</option>
                  <option value="Kesehatan Alami">Khusus Kategori: Kesehatan Alami</option>
                  <option value="Pendidikan Anak">Khusus Kategori: Pendidikan Anak</option>
                  <option value="Misi & Sejarah Maluku">Khusus Kategori: Misi & Sejarah Maluku</option>
                </select>
              </div>

              {/* Amount to add */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Jumlah Stok Tambahan per Judul Buku:</label>
                <div className="grid grid-cols-4 gap-2">
                  {[20, 50, 100, 200, 500, 1000, 2500, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setBulkStockAmount(amt)}
                      className={`py-2 px-2 rounded-xl text-xs font-mono font-bold border transition-colors ${
                        bulkStockAmount === amt
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-slate-50 hover:bg-emerald-50 text-slate-800 border-slate-200'
                      }`}
                    >
                      +{amt}
                    </button>
                  ))}
                </div>

                <div className="pt-1">
                  <label className="block text-xs text-slate-500 mb-1">Atau masukkan angka bebas:</label>
                  <input
                    type="number"
                    min={1}
                    value={bulkStockAmount || ''}
                    onChange={(e) => setBulkStockAmount(Math.max(1, Number(e.target.value)))}
                    placeholder="Masukkan jumlah..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Konfirmasi Penambahan Stok Massal:</span>
                </div>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Setiap buku yang sesuai target akan ditambahkan <strong>+{bulkStockAmount} eksemplar</strong> secara instan ke stok saat ini.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBulkRestockOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleApplyBulkRestock}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Terapkan Tambah Stok Sekarang</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: TAMBAH BANYAK BUKU SEKALIGUS (BATCH ADD / MASSAL) */}
        {batchAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                    <ListPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-slate-900 text-base sm:text-lg">
                      Tambah Banyak Buku Sekaligus (Massal)
                    </h4>
                    <p className="text-xs text-slate-500">
                      Input puluhan hingga ratusan judul buku baru secara cepat tanpa batasan
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setBatchAddModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="px-5 pt-3 border-b border-slate-200 flex gap-4 bg-white">
                <button
                  type="button"
                  onClick={() => setBatchAddTab('rows')}
                  className={`pb-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                    batchAddTab === 'rows'
                      ? 'border-blue-600 text-blue-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Mode Tabel Multi-Baris ({batchRows.length} Baris)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBatchAddTab('paste')}
                  className={`pb-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                    batchAddTab === 'paste'
                      ? 'border-blue-600 text-blue-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Mode Tempel Teks / Excel (Copy-Paste)</span>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
                {batchAddTab === 'rows' ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <p className="text-slate-600 font-medium">
                        Ketik data setiap buku pada baris di bawah. Buku yang memiliki judul akan otomatis ditambahkan ke katalog.
                      </p>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAddBatchRow(1)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-colors"
                        >
                          + 1 Baris
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddBatchRow(5)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg font-bold transition-colors"
                        >
                          + 5 Baris Sekaligus
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddBatchRow(10)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-bold transition-colors"
                        >
                          + 10 Baris Sekaligus
                        </button>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                      <div className="overflow-x-auto max-h-[45vh]">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold sticky top-0 z-10">
                            <tr>
                              <th className="p-2.5 w-10 text-center">#</th>
                              <th className="p-2.5 min-w-[220px]">Judul Buku *</th>
                              <th className="p-2.5 min-w-[150px]">Penulis</th>
                              <th className="p-2.5 min-w-[160px]">Kategori</th>
                              <th className="p-2.5 min-w-[110px]">Harga (Rp)</th>
                              <th className="p-2.5 min-w-[90px]">Stok</th>
                              <th className="p-2.5 w-10 text-center">Hapus</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {batchRows.map((row, idx) => (
                              <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                                <td className="p-2.5 text-center font-mono text-slate-400 font-bold">
                                  {idx + 1}
                                </td>
                                <td className="p-2.5">
                                  <input
                                    type="text"
                                    placeholder="Contoh: Menjadi Manusia Sehat..."
                                    value={row.title}
                                    onChange={(e) => handleUpdateBatchRow(row.id, 'title', e.target.value)}
                                    className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:bg-white focus:border-blue-500"
                                  />
                                </td>
                                <td className="p-2.5">
                                  <input
                                    type="text"
                                    placeholder="Penulis"
                                    value={row.author}
                                    onChange={(e) => handleUpdateBatchRow(row.id, 'author', e.target.value)}
                                    className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white"
                                  />
                                </td>
                                <td className="p-2.5">
                                  <select
                                    value={row.category}
                                    onChange={(e) => handleUpdateBatchRow(row.id, 'category', e.target.value)}
                                    className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                                  >
                                    <option value="Rohani & Doa">Rohani & Doa</option>
                                    <option value="Keluarga & Pernikahan">Keluarga & Pernikahan</option>
                                    <option value="Kesehatan Alami">Kesehatan Alami</option>
                                    <option value="Pendidikan Anak">Pendidikan Anak</option>
                                    <option value="Misi & Sejarah Maluku">Misi & Sejarah Maluku</option>
                                  </select>
                                </td>
                                <td className="p-2.5">
                                  <input
                                    type="number"
                                    min={0}
                                    step={1000}
                                    value={row.price}
                                    onChange={(e) => handleUpdateBatchRow(row.id, 'price', Number(e.target.value))}
                                    className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                                  />
                                </td>
                                <td className="p-2.5">
                                  <input
                                    type="number"
                                    min={0}
                                    value={row.stock}
                                    onChange={(e) => handleUpdateBatchRow(row.id, 'stock', Number(e.target.value))}
                                    className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-emerald-800"
                                  />
                                </td>
                                <td className="p-2.5 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteBatchRow(row.id)}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50"
                                    title="Hapus baris ini"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                      <span>
                        Total baris terisi:{' '}
                        <strong className="text-slate-800">
                          {batchRows.filter((r) => r.title.trim() !== '').length}
                        </strong>{' '}
                        dari {batchRows.length} baris
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddBatchRow(1)}
                        className="text-blue-700 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Tambah Baris Baru
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-2xl text-xs text-blue-900 space-y-1.5">
                      <div className="font-bold flex items-center gap-1.5 text-blue-800">
                        <Info className="w-4 h-4" />
                        <span>Format Penulisan (1 Baris = 1 Buku):</span>
                      </div>
                      <p className="text-[11px] text-blue-800 leading-relaxed font-mono">
                        Judul Buku | Penulis | Kategori | Harga | Stok
                      </p>
                      <p className="text-[11px] text-blue-700">
                        Anda juga dapat langsung copy-paste baris kolom dari Microsoft Excel atau Google Spreadsheet.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700">
                          Tempel (Paste) Teks Data Buku di Sini:
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setBatchPasteContent(
`Kemenangan Terakhir | Ellen G. White | Rohani & Doa | 125000 | 50
Membina Keluarga Bahagia | Arthur S. Maxwell | Keluarga & Pernikahan | 95000 | 40
Resep Makanan Sehat Alami | Dr. Hans Diehl | Kesehatan Alami | 85000 | 60
Mendidik Anak dengan Kasih | E.G. White | Pendidikan Anak | 75000 | 45
Jejak Penginjilan di Kepulauan Rempah | Pdt. J. Wattimena | Misi & Sejarah Maluku | 110000 | 30`
                              );
                            }}
                            className="text-[11px] text-blue-700 font-bold hover:underline"
                          >
                            Muat Contoh Format (5 Buku)
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => setBatchPasteContent('')}
                            className="text-[11px] text-rose-600 hover:underline"
                          >
                            Kosongkan
                          </button>
                        </div>
                      </div>

                      <textarea
                        rows={10}
                        value={batchPasteContent}
                        onChange={(e) => setBatchPasteContent(e.target.value)}
                        placeholder={`Contoh:\nJudul Buku Pertama | Penulis Satu | Rohani & Doa | 85000 | 50\nJudul Buku Kedua | Penulis Dua | Kesehatan Alami | 95000 | 30`}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setBatchAddModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-200/60"
                >
                  Batal
                </button>

                {batchAddTab === 'rows' ? (
                  <button
                    type="button"
                    onClick={handleSaveBatchRows}
                    className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>
                      Simpan Semua (
                      {batchRows.filter((r) => r.title.trim() !== '').length} Buku) ke Etalase
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveBatchPaste}
                    className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>Impor & Simpan Semua Buku dari Teks</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
