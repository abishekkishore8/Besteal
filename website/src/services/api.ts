import { Requirement, Quote, Seller, Order, FlaggedQuote, AdminMetrics, WalletTransaction, AppNotification, OrderDispute } from '../types';

const BASE_URL = '/api';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  async getHealth() {
    try {
      return await fetchJSON<{ status: string; service: string }>('/health');
    } catch {
      return { status: 'offline', service: 'Local Client Fallback' };
    }
  },

  async getRequirements(): Promise<Requirement[]> {
    try {
      const res = await fetchJSON<{ success: boolean; data: Requirement[] }>('/requirements');
      return res.data;
    } catch {
      return [
        {
          id: 'REQ-101',
          user: 'Aryan Mehta',
          location: 'Koramangala, Bengaluru',
          title: '1.5 Ton Inverter AC',
          category: 'AC & Cooling',
          budget: 35000,
          status: 'active',
          createdAgo: '2h ago',
          quotesCount: 6,
          answers: { brand: 'Daikin', capacity: '1.5 Ton', delivery: 'Express (24h)' },
        },
      ];
    }
  },

  async createRequirement(req: { title: string; budget: number; category?: string; answers?: Record<string, string> }): Promise<Requirement> {
    try {
      const res = await fetchJSON<{ success: boolean; data: Requirement }>('/requirements', {
        method: 'POST',
        body: JSON.stringify(req),
      });
      return res.data;
    } catch {
      return {
        id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
        user: 'Aryan Mehta',
        location: 'Koramangala, Bengaluru',
        title: req.title,
        category: req.category || 'General Electronics',
        budget: req.budget,
        status: 'active',
        createdAgo: 'Just now',
        quotesCount: 0,
        answers: req.answers || {},
      };
    }
  },

  async getQuotes(reqId: string): Promise<Quote[]> {
    try {
      const res = await fetchJSON<{ success: boolean; data: Quote[] }>(`/requirements/${reqId}/quotes`);
      return res.data;
    } catch {
      return [
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
      ];
    }
  },

  async getSellers(): Promise<Seller[]> {
    try {
      const res = await fetchJSON<{ success: boolean; data: Seller[] }>('/sellers');
      return res.data;
    } catch {
      return [
        { id: 'SEL-001', name: 'Rajan Electronics', city: 'Bengaluru', biz: 'GST: 29AAAAA0000A1Z5 · Consumer Electronics', kyc: 'verified', level: 3, revenue: '₹4.8L', rating: 4.7, status: 'active', responseMin: 3.2, priceCompetitiveness: 94.8 },
      ];
    }
  },

  async updateSellerStatus(id: string, action: 'approve' | 'reject' | 'suspend' | 'reinstate'): Promise<Seller> {
    try {
      const res = await fetchJSON<{ success: boolean; data: Seller }>(`/sellers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ action }),
      });
      return res.data;
    } catch {
      throw new Error(`Failed to update seller ${id}`);
    }
  },

  async getOrders(): Promise<Order[]> {
    try {
      const res = await fetchJSON<{ success: boolean; data: Order[] }>('/orders');
      return res.data;
    } catch {
      return [];
    }
  },

  async getAdminMetrics(): Promise<AdminMetrics> {
    try {
      const res = await fetchJSON<{ success: boolean; data: AdminMetrics }>('/admin/metrics');
      return res.data;
    } catch {
      return {
        gmv: '₹84.2L',
        revenue: '₹8.42L',
        activeCustomers: 12847,
        activeSellers: 3241,
        conversionRate: '34.8%',
        pendingKYC: 2,
        flaggedQuotes: 2,
      };
    }
  },

  async getFlaggedQuotes(): Promise<FlaggedQuote[]> {
    try {
      const res = await fetchJSON<{ success: boolean; data: FlaggedQuote[] }>('/admin/moderation');
      return res.data;
    } catch {
      return [
        {
          id: 'QT-8821',
          seller: 'MegaDeals Electronics',
          sellerId: 'SEL-003',
          product: 'Voltas 1.5T AC',
          price: '₹28,500',
          flags: ['Phone number detected in image OCR', 'WhatsApp contact in description'],
          severity: 'high',
          submittedText: 'Daikin 1.5T 5★ Inverter AC — ₹28,500. Call us at 98XX-XXXXX or WhatsApp dealer@shop.com.',
          status: 'pending_review',
          aiConfidence: 97.3,
          scanTimeSec: 0.4,
        },
      ];
    }
  },

  async sendAIChatMessage(reqId: string, text: string): Promise<{ reply: string }> {
    try {
      const res = await fetchJSON<{ success: boolean; reply: string }>(`/requirements/${reqId}/chat`, {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      return { reply: res.reply };
    } catch {
      return { reply: 'Got it! I have updated your specification requirements for active sellers.' };
    }
  },

  async getSellerWallet(sellerId = 'SEL-001'): Promise<{ balance: number; transactions: WalletTransaction[] }> {
    try {
      const res = await fetchJSON<{ success: boolean; balance: number; transactions: WalletTransaction[] }>(
        `/seller/wallet?sellerId=${sellerId}`
      );
      return { balance: res.balance, transactions: res.transactions };
    } catch {
      return {
        balance: 1240,
        transactions: [
          { id: 'TXN-901', sellerId, type: 'recharge', amount: 1500, description: 'Wallet Top-up', timestamp: 'Aug 10', status: 'success' },
        ],
      };
    }
  },

  async rechargeSellerWallet(amount: number, method = 'UPI'): Promise<{ balance: number; transaction: WalletTransaction }> {
    try {
      const res = await fetchJSON<{ success: boolean; balance: number; transaction: WalletTransaction }>('/seller/wallet/recharge', {
        method: 'POST',
        body: JSON.stringify({ sellerId: 'SEL-001', amount, method }),
      });
      return { balance: res.balance, transaction: res.transaction };
    } catch {
      return {
        balance: 2240,
        transaction: { id: `TXN-${Date.now()}`, sellerId: 'SEL-001', type: 'recharge', amount, description: `Top-up via ${method}`, timestamp: 'Just now', status: 'success' },
      };
    }
  },

  async debitLeadFee(reqId: string): Promise<{ balance: number }> {
    try {
      const res = await fetchJSON<{ success: boolean; balance: number }>('/seller/wallet/debit-lead-fee', {
        method: 'POST',
        body: JSON.stringify({ sellerId: 'SEL-001', reqId }),
      });
      return { balance: res.balance };
    } catch {
      return { balance: 1231 };
    }
  },

  async submitQuote(payload: { reqId: string; price: number; brandModel?: string; warranty?: string; freeDelivery?: boolean; installationIncluded?: boolean }): Promise<Quote> {
    try {
      const res = await fetchJSON<{ success: boolean; data: Quote }>('/quotes', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return res.data;
    } catch {
      return {
        id: `QT-${Math.floor(8000 + Math.random() * 1000)}`,
        reqId: payload.reqId,
        sellerId: 'SEL-001',
        sellerName: 'Rajan Electronics',
        price: payload.price,
        delivery: payload.freeDelivery ? '2-day Free Delivery' : '3-day Express',
        warranty: payload.warranty ? `${payload.warranty}-Year Warranty` : '3-Year Warranty',
        rating: 4.7,
        badge: null,
        exactMatch: true,
        freeDelivery: Boolean(payload.freeDelivery),
        installationIncluded: Boolean(payload.installationIncluded),
        submittedAt: 'Just now',
      };
    }
  },

  async placeOrder(quoteId: string, paymentMethod: string): Promise<Order> {
    try {
      const res = await fetchJSON<{ success: boolean; data: Order }>('/orders/checkout', {
        method: 'POST',
        body: JSON.stringify({ quoteId, paymentMethod }),
      });
      return res.data;
    } catch {
      return {
        id: `BST-${Math.floor(3000 + Math.random() * 1000)}`,
        reqTitle: 'CoolAir Solutions · 2-day Express',
        sellerName: 'CoolAir Solutions',
        amountTotal: 33300,
        advancePaid: 3330,
        advancePct: 10,
        balanceDue: 29970,
        paymentMethod: paymentMethod || 'UPI',
        createdAt: 'Today',
        stage: 1,
        timeline: [
          { stage: 1, title: 'Order Confirmed', sub: 'Just now', done: true },
          { stage: 2, title: 'Preparing Order', sub: 'Estimated in 2h', done: false },
          { stage: 3, title: 'Out for Delivery', sub: 'Tomorrow', done: false },
          { stage: 4, title: 'Delivered', sub: 'In 2 days', done: false },
        ],
      };
    }
  },

  async updateOrderStage(id: string, stage: number): Promise<Order> {
    try {
      const res = await fetchJSON<{ success: boolean; data: Order }>(`/orders/${id}/stage`, {
        method: 'PATCH',
        body: JSON.stringify({ stage }),
      });
      return res.data;
    } catch {
      throw new Error(`Failed to update order ${id}`);
    }
  },

  async submitOrderReview(orderId: string, rating: number, comment: string): Promise<Order> {
    try {
      const res = await fetchJSON<{ success: boolean; data: Order }>(`/orders/${orderId}/review`, {
        method: 'POST',
        body: JSON.stringify({ rating, comment }),
      });
      return res.data;
    } catch {
      throw new Error('Failed to submit review');
    }
  },

  async raiseOrderDispute(orderId: string, reason: string): Promise<OrderDispute> {
    try {
      const res = await fetchJSON<{ success: boolean; data: OrderDispute }>(`/orders/${orderId}/dispute`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      return res.data;
    } catch {
      return { id: `DSP-${Date.now()}`, orderId, raisedBy: 'Aryan Mehta', reason, status: 'open', createdAt: 'Today' };
    }
  },

  async getNotifications(userId = 'USR-001'): Promise<AppNotification[]> {
    try {
      const res = await fetchJSON<{ success: boolean; data: AppNotification[] }>(`/notifications?userId=${userId}`);
      return res.data;
    } catch {
      return [
        { id: 'NT-1', userId, title: 'Welcome to BESTEAL!', message: 'AI Reverse Shopping Marketplace is ready.', type: 'info', read: false, createdAt: 'Just now' },
      ];
    }
  },

  async markNotificationsRead(): Promise<void> {
    try {
      await fetchJSON('/notifications/read', { method: 'POST' });
    } catch {}
  },

  async moderateQuote(id: string, decision: 'approved' | 'rejected'): Promise<FlaggedQuote> {
    try {
      const res = await fetchJSON<{ success: boolean; data: FlaggedQuote }>(`/admin/moderation/${id}/action`, {
        method: 'POST',
        body: JSON.stringify({ decision }),
      });
      return res.data;
    } catch {
      throw new Error(`Failed to moderate quote ${id}`);
    }
  },
};
