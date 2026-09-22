import { Order, PaymentMethodType, TrackingStep, Book } from '../types';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatTanggalIndo(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function cleanPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

export function getPaymentMethodName(method: PaymentMethodType): string {
  switch (method) {
    case 'qris':
      return 'QRIS (Semua E-Wallet & Mobile Banking)';
    case 'bca_va':
      return 'BCA Virtual Account';
    case 'mandiri_va':
      return 'Mandiri Virtual Account';
    case 'bri_va':
      return 'BRI Virtual Account (BRIVA)';
    case 'bni_va':
      return 'BNI Virtual Account';
    case 'gopay':
      return 'GoPay E-Wallet';
    case 'dana':
      return 'DANA Digital Wallet';
    case 'ovo':
      return 'OVO E-Wallet';
    case 'shopeepay':
      return 'ShopeePay E-Wallet';
    case 'bank_transfer':
      return 'Transfer Bank Manual (BRI / Mandiri / BCA)';
    default:
      if (typeof method === 'string' && method.endsWith('_va')) {
        return `${method.replace('_va', '').toUpperCase()} Virtual Account`;
      }
      return typeof method === 'string' ? method.toUpperCase() : 'Gateway Pembayaran';
  }
}

export function generateWhatsAppMessage(
  order: Order,
  type: 'order_created' | 'payment_confirmed' | 'order_shipped' | 'order_delivered' | 'order_cancelled'
): string {
  const storeName = 'Toko Buku BukuBerkatDMM (Daerah Misi Maluku)';
  const customerName = order.shipping.recipientName;
  const orderId = order.id;
  const total = formatRupiah(order.totalAmount);
  const itemsList = order.items
    .map((item) => `• ${item.book.title} (${item.quantity}x @ ${formatRupiah(item.book.price)})`)
    .join('\n');

  switch (type) {
    case 'order_created':
      return `*HALO KAK ${customerName.toUpperCase()}!* 📖✨
Terima kasih telah berbelanja di *${storeName}*.

Pesanan Anda telah kami terima dengan detail:
*No. Pesanan:* ${orderId}
*Tanggal:* ${formatTanggalIndo(order.createdAt)}

*Buku yang Dipesan:*
${itemsList}

*Ongkir (${order.shipping.courier} - ${order.shipping.city}):* ${formatRupiah(order.shippingCost)}
*TOTAL PEMBAYARAN:* ${total}
*Metode:* ${getPaymentMethodName(order.paymentMethod)}
*Status:* Menunggu Pembayaran

Silakan selesaikan pembayaran untuk memproses pengiriman buku berkat ini.
Tuhan memberkati selalu! 🙏`;

    case 'payment_confirmed':
      return `*PEMBAYARAN DIVERIFIKASI!* ✅🎉
Halo Kak *${customerName}*,

Pembayaran untuk pesanan *${orderId}* sebesar *${total}* telah berhasil diverifikasi oleh sistem gateway kami!

*Status Saat Ini:* Sedang Disiapkan & Dikemas Rapi dengan Bubble Wrap di Gudang BukuBerkatDMM Ambon.
Nomor resi pengiriman akan kami kirimkan begitu paket diserahkan ke kurir *${order.shipping.courier}*.

Terima kasih atas kepercayaan Kakak! 📚🕊️`;

    case 'order_shipped':
      return `*PAKET BUKU TELAH DIKIRIM!* 🚚📦
Shalom Kak *${customerName}*,

Pesanan buku Anda *${orderId}* telah kami kirimkan dengan kurir *${order.shipping.courier}*!

*No. Resi Pengiriman:* *${order.trackingNumber || 'BBDMM-EXP-' + Math.floor(100000 + Math.random() * 900000)}*
*Tujuan:* ${order.shipping.address}, ${order.shipping.city}
*Estimasi Tiba:* ${order.shipping.estimatedDelivery}

Lacak status perjalanan buku Anda langsung di website BukuBerkatDMM pada menu *Lacak Resi*.
Semoga buku-buku ini menjadi berkat berlimpah bagi keluarga! ✝️❤️`;

    case 'order_delivered':
      return `*PAKET TELAH SAMPAI DENGAN SELAMAT!* 📬⭐
Halo Kak *${customerName}*,

Berdasarkan laporan ekspedisi *${order.shipping.courier}*, paket pesanan *${orderId}* telah sukses diterima.

Selamat membaca dan merenungkan firman, panduan kesehatan, dan hikmat rohani yang berharga ini. Jangan lupa rekomendasikan *BukuBerkatDMM* ke jemaat, sahabat, dan keluarga lainnya!
Salam hangat & Damai Sejahtera Daerah Misi Maluku. 🌺`;

    case 'order_cancelled':
      return `*PEMBERITAHUAN PESANAN DIBATALKAN* ℹ️
Halo Kak *${customerName}*,

Pesanan *${orderId}* di *${storeName}* telah dibatalkan. Jika Anda memiliki pertanyaan atau ingin memesan ulang, silakan hubungi customer service kami. Terima kasih.`;
  }
}

export function generateWhatsAppUrl(phoneNumber: string, message: string): string {
  const cleanPhone = cleanPhoneNumber(phoneNumber);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function buildInitialTrackingSteps(courier: string, city: string): TrackingStep[] {
  const now = new Date();
  const timeNow = now.toISOString();

  return [
    {
      status: 'Pesanan Dibuat',
      location: 'Sistem Toko BukuBerkatDMM',
      timestamp: timeNow,
      description: 'Pesanan telah berhasil terdaftar dalam sistem.',
      completed: true,
    },
    {
      status: 'Pembayaran Dikonfirmasi',
      location: 'Gateway Pembayaran Otomatis',
      timestamp: timeNow,
      description: 'Dana telah diterima dan diverifikasi secara instan.',
      completed: true,
    },
    {
      status: 'Paket Sedang Dikemas',
      location: 'Gudang Pusat BukuBerkatDMM, Kudamati, Ambon',
      timestamp: new Date(now.getTime() + 1000 * 60 * 30).toISOString(),
      description: 'Buku sedang dicek kualitas fisiknya dan dibungkus bubble wrap tebal.',
      completed: true,
    },
    {
      status: 'Diserahkan ke Kurir',
      location: `Drop Point ${courier} Ambon`,
      timestamp: new Date(now.getTime() + 1000 * 60 * 90).toISOString(),
      description: `Paket diterima oleh petugas sortir ${courier} Ambon.`,
      completed: false,
    },
    {
      status: 'Dalam Perjalanan Transit',
      location: `Hub Logistik Gateway Maluku / ${city}`,
      timestamp: new Date(now.getTime() + 1000 * 60 * 60 * 12).toISOString(),
      description: `Paket sedang diberangkatkan menuju kantor cabang ${city}.`,
      completed: false,
    },
    {
      status: 'Tiba di Tujuan',
      location: city,
      timestamp: new Date(now.getTime() + 1000 * 60 * 60 * 36).toISOString(),
      description: 'Paket diterima oleh penerima yang bersangkutan.',
      completed: false,
    },
  ];
}

export function generateBookInquiryWhatsAppMessage(
  book: Book,
  customerName?: string,
  question?: string,
  region?: string
): string {
  const storeName = 'Toko Buku Berkat DMM (Daerah Misi Maluku)';
  const name = customerName && customerName.trim() ? customerName.trim() : 'Pelanggan';
  const customQuestion = question && question.trim() ? question.trim() : 'Apakah stok buku ini ready untuk pengiriman di wilayah Maluku?';
  const regionInfo = region ? `\n📍 *Tujuan Pengiriman Maluku:* ${region}` : '';

  return `*TANYA ADMIN / PEMILIK TOKO - KONSULTASI BUKU* 📖✨
Halo Admin ${storeName},
Perkenalkan saya *${name}*.

Saya ingin bertanya mengenai buku berikut:
📚 *Judul Buku:* ${book.title}
✍️ *Penulis:* ${book.author}
🏷️ *Kategori:* ${book.category}
💰 *Harga:* ${formatRupiah(book.price)}
📦 *Status Stok:* ${book.stock > 0 ? `Tersedia (${book.stock} eks)` : 'Habis / Perlu Pesan Khusus'}${regionInfo}

💬 *Pertanyaan Saya:*
"${customQuestion}"

Mohon informasi dan bantuannya ya Admin. Terima kasih banyak & Tuhan memberkati! 🙏`;
}

export function generateGeneralInquiryWhatsAppMessage(
  customerName?: string,
  topic?: string,
  question?: string,
  region?: string
): string {
  const storeName = 'Toko Buku Berkat DMM (Daerah Misi Maluku)';
  const name = customerName && customerName.trim() ? customerName.trim() : 'Pelanggan';
  const customQuestion = question && question.trim() ? question.trim() : 'Saya ingin konsultasi seputar rekomendasi buku dan pengiriman di wilayah kepulauan Maluku.';
  const topicText = topic ? `\n📌 *Topik:* ${topic}` : '';
  const regionInfo = region ? `\n📍 *Wilayah Saya di Maluku:* ${region}` : '';

  return `*TANYA ADMIN / PEMILIK TOKO BUKU BERKAT DMM* 📖
Halo Admin ${storeName},
Perkenalkan saya *${name}*.${topicText}${regionInfo}

💬 *Pertanyaan / Konsultasi:*
"${customQuestion}"

Mohon panduan dan informasinya ya Admin. Terima kasih banyak & Tuhan memberkati! 🙏`;
}

