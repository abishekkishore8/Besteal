import fs from 'fs';
import path from 'path';

const isVercel = Boolean(process.env.VERCEL);
const DB_FILE = isVercel
  ? path.join('/tmp', 'db.json')
  : path.join(process.cwd(), 'data', 'db.json');

export interface DatabaseSchema {
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: 'customer' | 'seller' | 'admin';
    phone: string;
    avatar?: string;
    location?: string;
    sellerId?: string;
  }>;
  requirements: Array<{
    id: string;
    userId: string;
    user: string;
    location: string;
    title: string;
    category: string;
    budget: number;
    status: 'active' | 'fulfilled' | 'closed';
    createdAgo: string;
    quotesCount: number;
    answers: Record<string, string>;
    chatHistory?: Array<{ sender: 'ai' | 'user'; text: string; time: string }>;
  }>;
  quotes: Array<{
    id: string;
    reqId: string;
    sellerId: string;
    sellerName: string;
    price: number;
    delivery: string;
    warranty: string;
    rating: number;
    badge?: string | null;
    badgeType?: 'primary' | 'success' | 'orange' | null;
    exactMatch: boolean;
    freeDelivery: boolean;
    installationIncluded: boolean;
    submittedAt: string;
  }>;
  sellers: Array<{
    id: string;
    name: string;
    city: string;
    biz: string;
    kyc: 'verified' | 'pending' | 'rejected';
    level: number;
    revenue: string;
    rating: number;
    status: 'active' | 'suspended';
    responseMin: number;
    priceCompetitiveness: number;
    walletBalance: number;
  }>;
  orders: Array<{
    id: string;
    reqId: string;
    reqTitle: string;
    sellerId: string;
    sellerName: string;
    customerId: string;
    customerName: string;
    amountTotal: number;
    advancePaid: number;
    advancePct: number;
    balanceDue: number;
    paymentMethod: string;
    createdAt: string;
    stage: number;
    deliveryOtp: string;
    timeline: Array<{ stage: number; title: string; sub: string; done: boolean }>;
    reviewed?: boolean;
    reviewRating?: number;
    reviewComment?: string;
    disputed?: boolean;
    disputeReason?: string;
  }>;
  walletTransactions: Array<{
    id: string;
    sellerId: string;
    type: 'debit_fee' | 'recharge' | 'payout';
    amount: number;
    description: string;
    timestamp: string;
    status: 'success' | 'pending';
  }>;
  notifications: Array<{
    id: string;
    userId: string;
    title: string;
    message: string;
    type: 'info' | 'quote' | 'lead' | 'order' | 'warning';
    read: boolean;
    createdAt: string;
  }>;
  disputes: Array<{
    id: string;
    orderId: string;
    raisedBy: string;
    reason: string;
    status: 'open' | 'resolved' | 'refunded';
    createdAt: string;
    resolutionNotes?: string;
  }>;
  flaggedQuotes: Array<{
    id: string;
    quoteId?: string;
    seller: string;
    sellerId: string;
    product: string;
    price: string;
    flags: string[];
    severity: 'high' | 'medium' | 'low';
    submittedText: string;
    status: 'pending_review' | 'approved' | 'rejected';
    aiConfidence: number;
    scanTimeSec: number;
  }>;
}

const initialData: DatabaseSchema = {
  users: [
    {
      id: 'USR-001',
      name: 'Aryan Mehta',
      email: 'aryan@besteal.com',
      role: 'customer',
      phone: '+91 98765 43210',
      location: 'Koramangala, Bengaluru',
    },
    {
      id: 'USR-002',
      name: 'Rajan Electronics',
      email: 'seller@rajan.com',
      role: 'seller',
      phone: '+91 98111 22233',
      location: 'Bengaluru',
      sellerId: 'SEL-001',
    },
    {
      id: 'USR-003',
      name: 'Priya Nair',
      email: 'admin@besteal.com',
      role: 'admin',
      phone: '+91 99000 11122',
      location: 'HQ Bengaluru',
    },
  ],
  requirements: [
    {
      id: 'REQ-101',
      userId: 'USR-001',
      user: 'Aryan Mehta',
      location: 'Koramangala, Bengaluru',
      title: '1.5 Ton Inverter AC',
      category: 'AC & Cooling',
      budget: 35000,
      status: 'active',
      createdAgo: '2h ago',
      quotesCount: 4,
      answers: { brand: 'Daikin', capacity: '1.5 Ton', delivery: 'Express (24h)' },
      chatHistory: [
        { sender: 'ai', text: 'Hi Aryan! What product or service are you looking for today?', time: '11:00 AM' },
        { sender: 'user', text: 'I need a 1.5-ton AC under ₹35,000', time: '11:01 AM' },
        { sender: 'ai', text: 'Got it! I am notifying verified sellers in Bengaluru.', time: '11:01 AM' },
      ],
    },
    {
      id: 'REQ-102',
      userId: 'USR-001',
      user: 'Aryan Mehta',
      location: 'Koramangala, Bengaluru',
      title: 'Sony 55" 4K Smart OLED TV',
      category: 'Televisions',
      budget: 65000,
      status: 'active',
      createdAgo: '5h ago',
      quotesCount: 2,
      answers: { brand: 'Sony', capacity: '55 Inch', delivery: '2-3 Days' },
    },
  ],
  quotes: [
    {
      id: 'QT-8801',
      reqId: 'REQ-101',
      sellerId: 'SEL-002',
      sellerName: 'CoolAir Solutions',
      price: 32500,
      delivery: '2-day Express',
      warranty: '5-Year Manufacturer',
      rating: 4.8,
      badge: '🏆 Best Overall',
      badgeType: 'primary',
      exactMatch: true,
      freeDelivery: true,
      installationIncluded: true,
      submittedAt: '10m ago',
    },
    {
      id: 'QT-8802',
      reqId: 'REQ-101',
      sellerId: 'SEL-003',
      sellerName: 'MegaDeals Electronics',
      price: 30990,
      delivery: '4-day Delivery',
      warranty: '3-Year Brand',
      rating: 4.2,
      badge: '💰 Lowest Price',
      badgeType: 'success',
      exactMatch: true,
      freeDelivery: false,
      installationIncluded: false,
      submittedAt: '18m ago',
    },
    {
      id: 'QT-8803',
      reqId: 'REQ-101',
      sellerId: 'SEL-004',
      sellerName: 'QuickCool Hub',
      price: 33200,
      delivery: 'Same Day Delivery',
      warranty: '2-Year On-Site',
      rating: 4.5,
      badge: '⚡ Fastest',
      badgeType: 'orange',
      exactMatch: true,
      freeDelivery: true,
      installationIncluded: true,
      submittedAt: '25m ago',
    },
    {
      id: 'QT-8804',
      reqId: 'REQ-101',
      sellerId: 'SEL-001',
      sellerName: 'Rajan Electronics',
      price: 31800,
      delivery: '3-day Delivery',
      warranty: '4-Year Comprehensive',
      rating: 4.7,
      badge: null,
      exactMatch: true,
      freeDelivery: true,
      installationIncluded: false,
      submittedAt: '30m ago',
    },
  ],
  sellers: [
    {
      id: 'SEL-001',
      name: 'Rajan Electronics',
      city: 'Bengaluru',
      biz: 'GST: 29AAAAA0000A1Z5 · Consumer Electronics',
      kyc: 'verified',
      level: 3,
      revenue: '₹4.8L',
      rating: 4.7,
      status: 'active',
      responseMin: 3.2,
      priceCompetitiveness: 94.8,
      walletBalance: 1240,
    },
    {
      id: 'SEL-002',
      name: 'CoolAir Solutions',
      city: 'Mumbai',
      biz: 'GST: 27BBBBB1111B2Z3 · HVAC & Cooling Systems',
      kyc: 'pending',
      level: 2,
      revenue: '₹2.1L',
      rating: 4.2,
      status: 'active',
      responseMin: 5.1,
      priceCompetitiveness: 91.2,
      walletBalance: 850,
    },
    {
      id: 'SEL-003',
      name: 'MegaDeals Electronics',
      city: 'Delhi',
      biz: 'GST: 07CCCCC2222C3Z1 · Home Appliances Store',
      kyc: 'rejected',
      level: 1,
      revenue: '₹0.8L',
      rating: 3.9,
      status: 'suspended',
      responseMin: 8.4,
      priceCompetitiveness: 88.5,
      walletBalance: 120,
    },
    {
      id: 'SEL-004',
      name: 'QuickBuy Stores',
      city: 'Hyderabad',
      biz: 'GST: 36DDDDD3333D4Z9 · Retail Superstore',
      kyc: 'verified',
      level: 4,
      revenue: '₹9.2L',
      rating: 4.9,
      status: 'active',
      responseMin: 1.8,
      priceCompetitiveness: 97.4,
      walletBalance: 3100,
    },
  ],
  orders: [
    {
      id: 'BST-3948',
      reqId: 'REQ-101',
      reqTitle: 'Daikin 1.5T 5★ Inverter AC',
      sellerId: 'SEL-002',
      sellerName: 'CoolAir Solutions',
      customerId: 'USR-001',
      customerName: 'Aryan Mehta',
      amountTotal: 33300,
      advancePaid: 3330,
      advancePct: 10,
      balanceDue: 29970,
      paymentMethod: 'UPI (aryan@paytm)',
      createdAt: 'Aug 14, 2026',
      stage: 1,
      deliveryOtp: '8492',
      timeline: [
        { stage: 1, title: 'Order Confirmed', sub: 'Aug 14, 11:30 AM', done: true },
        { stage: 2, title: 'Preparing Order', sub: 'Aug 14, 2:00 PM', done: false },
        { stage: 3, title: 'Out for Delivery', sub: 'Aug 15, 9:00 AM', done: false },
        { stage: 4, title: 'Delivered & Installed', sub: 'Aug 15, 2:30 PM', done: false },
      ],
    },
  ],
  walletTransactions: [
    {
      id: 'TXN-901',
      sellerId: 'SEL-001',
      type: 'recharge',
      amount: 1500,
      description: 'Wallet Top-up via UPI',
      timestamp: 'Aug 10, 2026 09:30 AM',
      status: 'success',
    },
    {
      id: 'TXN-902',
      sellerId: 'SEL-001',
      type: 'debit_fee',
      amount: 9,
      description: 'Lead Unlock Fee — REQ-101',
      timestamp: 'Aug 14, 2026 11:15 AM',
      status: 'success',
    },
  ],
  notifications: [
    {
      id: 'NT-101',
      userId: 'USR-001',
      title: 'New Quote Received!',
      message: 'CoolAir Solutions quoted ₹32,500 for your 1.5T AC requirement.',
      type: 'quote',
      read: false,
      createdAt: '10m ago',
    },
    {
      id: 'NT-102',
      userId: 'USR-002',
      title: 'Urgent Lead Nearby!',
      message: 'Customer in Koramangala requested 1.5T AC with ₹35,000 budget.',
      type: 'lead',
      read: false,
      createdAt: '15m ago',
    },
    {
      id: 'NT-103',
      userId: 'USR-003',
      title: 'AI OCR Contact Flag',
      message: 'Quote QT-8821 flagged for phone number leak in description.',
      type: 'warning',
      read: false,
      createdAt: '25m ago',
    },
  ],
  disputes: [
    {
      id: 'DSP-501',
      orderId: 'BST-2847',
      raisedBy: 'Aryan Mehta',
      reason: 'Slight delay in installation technician arrival',
      status: 'resolved',
      createdAt: 'Aug 12, 2026',
      resolutionNotes: 'Seller provided ₹500 store voucher; customer satisfied.',
    },
  ],
  flaggedQuotes: [
    {
      id: 'QT-8821',
      seller: 'MegaDeals Electronics',
      sellerId: 'SEL-003',
      product: 'Voltas 1.5T AC',
      price: '₹28,500',
      flags: ['Phone number detected in image OCR', 'WhatsApp contact in description'],
      severity: 'high',
      submittedText: 'Daikin 1.5T 5★ Inverter AC — ₹28,500. Call us at 98XX-XXXXX or WhatsApp dealer@shop.com. Free installation included.',
      status: 'pending_review',
      aiConfidence: 97.3,
      scanTimeSec: 0.4,
    },
    {
      id: 'QT-8834',
      seller: 'CoolAir Solutions',
      sellerId: 'SEL-002',
      product: 'LG 55" 4K Smart TV',
      price: '₹57,200',
      flags: ['Direct email address found in quote note'],
      severity: 'medium',
      submittedText: 'LG 55" 4K Smart TV — ₹57,200 with 3-year warranty. Free delivery. Write to coolairsales@gmail.com for direct discount.',
      status: 'pending_review',
      aiConfidence: 91.8,
      scanTimeSec: 0.3,
    },
  ],
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error reading db.json, resetting to initial data:', e);
    }
    this.saveData(initialData);
    return initialData;
  }

  private saveData(data: DatabaseSchema) {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving db.json:', e);
    }
  }

  public get<K extends keyof DatabaseSchema>(collection: K): DatabaseSchema[K] {
    return this.data[collection];
  }

  public update<K extends keyof DatabaseSchema>(
    collection: K,
    updater: (items: DatabaseSchema[K]) => DatabaseSchema[K]
  ): DatabaseSchema[K] {
    this.data[collection] = updater(this.data[collection]);
    this.saveData(this.data);
    return this.data[collection];
  }
}

export const db = new Database();
