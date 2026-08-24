export type AppMode = 'website' | 'admin';

export interface RequirementAnswer {
  brand?: string;
  capacity?: string;
  delivery?: string;
  star?: string;
  installation?: string;
  [key: string]: string | undefined;
}

export interface Requirement {
  id: string;
  user: string;
  location: string;
  title: string;
  category: string;
  budget: number;
  status: 'active' | 'fulfilled' | 'expired';
  createdAgo: string;
  quotesCount: number;
  answers: RequirementAnswer;
}

export interface Quote {
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
}

export interface Seller {
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
}

export interface OrderTimelineStep {
  stage: number;
  title: string;
  sub: string;
  done: boolean;
}

export interface Order {
  id: string;
  reqId?: string;
  reqTitle: string;
  sellerId?: string;
  sellerName: string;
  customerId?: string;
  customerName?: string;
  amountTotal: number;
  advancePaid: number;
  advancePct: number;
  balanceDue: number;
  paymentMethod: string;
  createdAt: string;
  stage: number;
  deliveryOtp?: string;
  timeline: OrderTimelineStep[];
  reviewed?: boolean;
  reviewRating?: number;
  reviewComment?: string;
  disputed?: boolean;
  disputeReason?: string;
}

export interface WalletTransaction {
  id: string;
  sellerId: string;
  type: 'debit_fee' | 'recharge' | 'payout';
  amount: number;
  description: string;
  timestamp: string;
  status: 'success' | 'pending';
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'quote' | 'lead' | 'order' | 'warning';
  read: boolean;
  createdAt: string;
}

export interface OrderDispute {
  id: string;
  orderId: string;
  raisedBy: string;
  reason: string;
  status: 'open' | 'resolved' | 'refunded';
  createdAt: string;
  resolutionNotes?: string;
}

export interface FlaggedQuote {
  id: string;
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
}

export interface AdminMetrics {
  gmv: string;
  revenue: string;
  activeCustomers: number;
  activeSellers: number;
  conversionRate: string;
  pendingKYC: number;
  flaggedQuotes: number;
}
