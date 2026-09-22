import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AnnouncementTicker } from './components/AnnouncementTicker';
import { BookCatalog } from './components/BookCatalog';
import { BookDetailModal } from './components/BookDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { TrackingModal } from './components/TrackingModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { AdminPortal } from './components/AdminPortal';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { AskAdminModal } from './components/AskAdminModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Footer } from './components/Footer';
import { AboutUsSection } from './components/AboutUsSection';
import { INITIAL_BOOKS, INITIAL_ANNOUNCEMENTS } from './data/initialBooks';
import { INITIAL_ORDERS } from './data/mockTracking';
import { INITIAL_STORE_SETTINGS, normalizeStoreSettings } from './data/initialSettings';
import { loadCurrentCustomerSession, saveCurrentCustomerSession, clearCurrentCustomerSession } from './data/initialCustomers';
import { Book, CartItem, Order, StoreSettings, CustomerUser, CustomerInquiry } from './types';
import { ShoppingBag, MessageCircle, Truck } from 'lucide-react';
import { useRoute } from './utils/router';

export default function App() {
  const { route, trackingCode, navigate } = useRoute();

  // Persistence with localStorage
  const [books, setBooks] = useState<Book[]>(() => {
    try {
      const saved = localStorage.getItem('bukuberkat_books');
      return saved ? JSON.parse(saved) : INITIAL_BOOKS;
    } catch {
      return INITIAL_BOOKS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('bukuberkat_orders');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('bukuberkat_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [announcements, setAnnouncements] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('bukuberkat_announcements');
      return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
    } catch {
      return INITIAL_ANNOUNCEMENTS;
    }
  });

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('bukuberkat_settings');
      return saved ? normalizeStoreSettings(JSON.parse(saved)) : INITIAL_STORE_SETTINGS;
    } catch {
      return INITIAL_STORE_SETTINGS;
    }
  });

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bukuberkat_books', JSON.stringify(books));
    } catch (e) {
      console.error(e);
    }
  }, [books]);

  useEffect(() => {
    try {
      localStorage.setItem('bukuberkat_orders', JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('bukuberkat_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('bukuberkat_announcements', JSON.stringify(announcements));
    } catch (e) {
      console.error(e);
    }
  }, [announcements]);

  useEffect(() => {
    try {
      localStorage.setItem('bukuberkat_settings', JSON.stringify(storeSettings));
    } catch (e) {
      console.error(e);
    }
  }, [storeSettings]);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedBookForModal, setSelectedBookForModal] = useState<Book | null>(null);

  // Modals & Drawers state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [activeTrackingCode, setActiveTrackingCode] = useState('');
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Customer Inquiries & Ask Admin State
  const [customerInquiries, setCustomerInquiries] = useState<CustomerInquiry[]>(() => {
    try {
      const saved = localStorage.getItem('bukuberkat_inquiries');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('bukuberkat_inquiries', JSON.stringify(customerInquiries));
    } catch (e) {
      console.error(e);
    }
  }, [customerInquiries]);

  const [isAskAdminOpen, setIsAskAdminOpen] = useState(false);
  const [askAdminBook, setAskAdminBook] = useState<Book | null>(null);

  const handleOpenAskAdmin = (book?: Book) => {
    setAskAdminBook(book || null);
    setIsAskAdminOpen(true);
  };

  const handleNewInquiry = (inquiry: CustomerInquiry) => {
    setCustomerInquiries((prev) => [inquiry, ...prev]);
  };

  // Customer Authentication state (Wajib login email aktif sebelum bayar)
  const [currentUser, setCurrentUser] = useState<CustomerUser | null>(() => {
    return loadCurrentCustomerSession();
  });
  const [isCustomerAuthOpen, setIsCustomerAuthOpen] = useState(false);
  const [customerAuthReason, setCustomerAuthReason] = useState<{
    title?: string;
    subtitle?: string;
    email?: string;
  }>({});

  // Sync route state with modals
  useEffect(() => {
    if (route === 'track') {
      if (trackingCode) {
        setActiveTrackingCode(trackingCode);
      }
      setIsTrackingOpen(true);
    }
  }, [route, trackingCode]);

  const handleCustomerLogin = (customer: CustomerUser) => {
    setCurrentUser(customer);
    saveCurrentCustomerSession(customer);
    setIsCustomerAuthOpen(false);
  };

  const handleCustomerLogout = () => {
    clearCurrentCustomerSession();
    setCurrentUser(null);
  };

  const handleRequireCustomerLogin = (emailHint?: string) => {
    setCustomerAuthReason({
      title: 'Wajib Login dengan Email Aktif',
      subtitle: 'Sesuai kebijakan toko BukuBerkatDMM, pelanggan wajib masuk atau mendaftar dengan email aktif sebelum melakukan pembayaran.',
      email: emailHint || currentUser?.email || '',
    });
    setIsCustomerAuthOpen(true);
  };

  // Cart operations
  const handleAddToCart = (book: Book, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.book.id === book.id);
      if (existing) {
        const newQty = Math.min(book.stock, existing.quantity + quantity);
        return prev.map((item) =>
          item.book.id === book.id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prev, { book, quantity }];
    });
  };

  const handleBuyNow = (book: Book, quantity: number = 1) => {
    handleAddToCart(book, quantity);
    setIsCheckoutOpen(true);
  };

  const handleUpdateQuantity = (bookId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(bookId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.book.id === bookId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveFromCart = (bookId: string) => {
    setCart((prev) => prev.filter((item) => item.book.id !== bookId));
  };

  const handleOrderSuccess = (newOrder: Order) => {
    // Add to orders list
    setOrders((prev) => [newOrder, ...prev]);

    // Decrease books stock accordingly
    setBooks((prevBooks) =>
      prevBooks.map((b) => {
        const orderedItem = newOrder.items.find((it) => it.book.id === b.id);
        if (orderedItem) {
          return {
            ...b,
            stock: Math.max(0, b.stock - orderedItem.quantity),
          };
        }
        return b;
      })
    );

    // Clear cart
    setCart([]);
  };

  const handleOpenTrackingWithCode = (code: string) => {
    setActiveTrackingCode(code);
    setIsTrackingOpen(true);
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // DEDICATED ADMIN DASHBOARD ROUTE (/admin)
  // Completely separate routing and Role-Based Access Control (RBAC) from user storefront
  if (route === 'admin') {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
        <AdminPortal
          isOpen={true}
          isStandalone={true}
          currentUser={currentUser}
          onClose={() => navigate('store')}
          onNavigateToStore={() => navigate('store')}
          books={books}
          orders={orders}
          announcements={announcements}
          storeSettings={storeSettings}
          customerInquiries={customerInquiries}
          onUpdateBooks={setBooks}
          onUpdateOrders={setOrders}
          onUpdateAnnouncements={setAnnouncements}
          onUpdateStoreSettings={setStoreSettings}
          onUpdateInquiries={setCustomerInquiries}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      
      {/* 1. Papan Pengumuman / Iklan Berjalan (Running Marquee Banner) */}
      <AnnouncementTicker
        announcements={announcements}
        onOpenPromo={() => handleOpenAskAdmin()}
      />

      {/* 2. Responsive Top Navigation */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setSearchQuery('');
        }}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenTracking={() => {
          setActiveTrackingCode('');
          navigate('track');
        }}
        onOpenAdmin={() => navigate('admin')}
        onOpenWhatsAppHelp={() => handleOpenAskAdmin()}
        currentUser={currentUser}
        onOpenCustomerAuth={() => handleRequireCustomerLogin()}
        onCustomerLogout={handleCustomerLogout}
        storeSettings={storeSettings}
      />

      {/* 3. Main Content: Book Catalog Showcase & About Us Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <BookCatalog
          books={books}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setSearchQuery('');
          }}
          onSelectBook={(book) => setSelectedBookForModal(book)}
          onAddToCart={handleAddToCart}
          onOpenAskAdmin={handleOpenAskAdmin}
          storeSettings={storeSettings}
        />

        {/* Dynamic "About Us & Mission" Section (Configurable via Admin CMS) */}
        {!searchQuery && selectedCategory === 'ALL' && (
          <AboutUsSection
            aboutConfig={storeSettings?.websiteConfig?.about}
            storeSettings={storeSettings}
            onOpenWhatsApp={() => handleOpenAskAdmin()}
          />
        )}
      </main>

      {/* 4. Footer */}
      <Footer
        onOpenAdmin={() => navigate('admin')}
        onOpenTracking={() => {
          setActiveTrackingCode('');
          navigate('track');
        }}
        onOpenWhatsAppHelp={() => handleOpenAskAdmin()}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setSearchQuery('');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        storeSettings={storeSettings}
      />

      {/* MODALS & DRAWERS */}

      {/* Book Detail Modal */}
      <BookDetailModal
        book={selectedBookForModal}
        onClose={() => setSelectedBookForModal(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        onOpenAskAdmin={handleOpenAskAdmin}
        storeSettings={storeSettings}
      />

      {/* Ask Admin / WhatsApp Inquiry Modal */}
      <AskAdminModal
        isOpen={isAskAdminOpen}
        onClose={() => {
          setIsAskAdminOpen(false);
          setAskAdminBook(null);
        }}
        book={askAdminBook}
        storeSettings={storeSettings}
        currentUser={currentUser}
        onInquirySubmitted={handleNewInquiry}
      />

      {/* Persistent Floating 3D WhatsApp Consultation Button */}
      <FloatingWhatsApp
        onOpenAskAdmin={() => handleOpenAskAdmin()}
        storeSettings={storeSettings}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout & Automatic Payment Gateway Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        storeSettings={storeSettings}
        currentUser={currentUser}
        onRequireLogin={handleRequireCustomerLogin}
        onOrderSuccess={handleOrderSuccess}
        onOpenTrackingWithCode={handleOpenTrackingWithCode}
      />

      {/* Customer Active Email Authentication Modal */}
      <CustomerAuthModal
        isOpen={isCustomerAuthOpen}
        onClose={() => setIsCustomerAuthOpen(false)}
        onLoginSuccess={handleCustomerLogin}
        initialEmail={customerAuthReason.email}
        reasonTitle={customerAuthReason.title}
        reasonSubtitle={customerAuthReason.subtitle}
      />

      {/* Shipping Resi Tracking Modal */}
      <TrackingModal
        isOpen={isTrackingOpen}
        onClose={() => {
          setIsTrackingOpen(false);
          if (route === 'track') {
            navigate('store');
          }
        }}
        orders={orders}
        initialTrackingCode={activeTrackingCode}
        currentUser={currentUser}
      />

      {/* Automatic WhatsApp Notifications & Customer Support Modal */}
      <WhatsAppModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        orders={orders}
        onTriggerNotification={(orderId, type) => {
          console.log(`WhatsApp Notification sent for ${orderId}: ${type}`);
        }}
      />

      {/* Mobile Bottom Quick Bar (for HP user-friendliness) */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-4 flex items-center justify-around z-30 shadow-lg">
        <button
          onClick={() => {
            setActiveTrackingCode('');
            navigate('track');
          }}
          className="flex flex-col items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-[#0F2C59]"
        >
          <Truck className="w-5 h-5 text-amber-600" />
          <span>Lacak Resi</span>
        </button>

        <button
          onClick={() => handleOpenAskAdmin()}
          className="flex flex-col items-center gap-1 text-[11px] font-bold text-emerald-700"
        >
          <MessageCircle className="w-5 h-5 text-emerald-600" />
          <span>Tanya Admin</span>
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-1 text-[11px] font-bold text-amber-900"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-amber-700" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#0F2C59] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {totalCartCount}
              </span>
            )}
          </div>
          <span>Keranjang</span>
        </button>
      </div>

    </div>
  );
}
