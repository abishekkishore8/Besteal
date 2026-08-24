import express, { Request, Response } from 'express';
import cors from 'cors';
import { db } from './db.js';

const app = express();
const PORT = process.env.BACKEND_PORT || 5000;

app.use(cors());
app.use(express.json());

// ── Health Check ────────────────────────────────────────────────────────────
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'BESTEAL Shared Reverse Marketplace Backend API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    collections: {
      requirements: db.get('requirements').length,
      quotes: db.get('quotes').length,
      sellers: db.get('sellers').length,
      orders: db.get('orders').length,
      users: db.get('users').length,
    },
  });
});

// ── Authentication API ──────────────────────────────────────────────────────
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { role } = req.body;
  const users = db.get('users');
  const user = users.find((u) => u.role === (role || 'customer')) || users[0];

  res.json({
    success: true,
    token: `token-${user.id}-${Date.now()}`,
    user,
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const users = db.get('users');
  const role = req.query.role as string;
  const user = users.find((u) => u.role === role) || users[0];

  let sellerData = null;
  if (user.sellerId) {
    sellerData = db.get('sellers').find((s) => s.id === user.sellerId);
  }

  res.json({
    success: true,
    user,
    seller: sellerData,
    unreadNotifications: db.get('notifications').filter((n) => n.userId === user.id && !n.read).length,
  });
});

// ── Requirements & AI Assistant APIs ────────────────────────────────────────
app.get('/api/requirements', (req: Request, res: Response) => {
  const reqs = db.get('requirements');
  res.json({ success: true, count: reqs.length, data: reqs });
});

app.get('/api/requirements/:id', (req: Request, res: Response) => {
  const reqs = db.get('requirements');
  const reqItem = reqs.find((r) => r.id === req.params.id);
  if (!reqItem) return res.status(404).json({ success: false, error: 'Requirement not found' });
  res.json({ success: true, data: reqItem });
});

app.post('/api/requirements', (req: Request, res: Response) => {
  const { title, budget, category, answers } = req.body;
  const newReq = {
    id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
    userId: 'USR-001',
    user: 'Aryan Mehta',
    location: 'Koramangala, Bengaluru',
    title: title || 'Requested Requirement',
    category: category || 'General Electronics',
    budget: Number(budget) || 35000,
    status: 'active' as const,
    createdAgo: 'Just now',
    quotesCount: 0,
    answers: answers || {},
    chatHistory: [
      { sender: 'ai' as const, text: 'Hi Aryan! What product or service are you looking for today?', time: 'Just now' },
      { sender: 'user' as const, text: title || 'Requirement created', time: 'Just now' },
      { sender: 'ai' as const, text: 'Requirement broadcasted to 800+ verified sellers in Bengaluru!', time: 'Just now' },
    ],
  };

  db.update('requirements', (list) => [newReq, ...list]);

  // Broadcast notification to Sellers
  db.update('notifications', (list) => [
    {
      id: `NT-${Date.now()}`,
      userId: 'USR-002',
      title: '⚡ New Urgent Lead Available!',
      message: `Customer in Koramangala requested: ${newReq.title} (Budget: ₹${newReq.budget})`,
      type: 'lead',
      read: false,
      createdAt: 'Just now',
    },
    ...list,
  ]);

  res.status(201).json({ success: true, message: 'Requirement posted to sellers!', data: newReq });
});

app.post('/api/requirements/:id/chat', (req: Request, res: Response) => {
  const { text } = req.body;
  const { id } = req.params;

  let botReply = 'Got it! I have updated your specification tags and notified active merchants.';
  if (text.toLowerCase().includes('brand') || text.toLowerCase().includes('daikin') || text.toLowerCase().includes('lg')) {
    botReply = 'Added brand preference to your active posting filter!';
  } else if (text.toLowerCase().includes('price') || text.toLowerCase().includes('budget') || text.toLowerCase().includes('discount')) {
    botReply = 'Adjusted budget constraints! Sellers will bid within your specified target.';
  }

  const userMsg = { sender: 'user' as const, text, time: 'Just now' };
  const aiMsg = { sender: 'ai' as const, text: botReply, time: 'Just now' };

  db.update('requirements', (list) =>
    list.map((r) => {
      if (r.id !== id) return r;
      const history = r.chatHistory || [];
      return { ...r, chatHistory: [...history, userMsg, aiMsg] };
    })
  );

  res.json({ success: true, reply: botReply });
});

// ── Quotes API ──────────────────────────────────────────────────────────────
app.get('/api/requirements/:id/quotes', (req: Request, res: Response) => {
  const reqQuotes = db.get('quotes').filter((q) => q.reqId === req.params.id);
  res.json({ success: true, reqId: req.params.id, count: reqQuotes.length, data: reqQuotes });
});

app.post('/api/quotes', (req: Request, res: Response) => {
  const { reqId, price, brandModel, warranty, freeDelivery, installationIncluded } = req.body;

  // Automated AI OCR Contact Leak Check
  const quoteText = `${brandModel} - ₹${price}. Warranty ${warranty} years.`;
  const containsPhone = /(\+?\d{10,12}|98\d{8}|whatsapp)/i.test(quoteText);
  const containsEmail = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i.test(quoteText);

  const newQuote = {
    id: `QT-${Math.floor(8000 + Math.random() * 1000)}`,
    reqId: reqId || 'REQ-101',
    sellerId: 'SEL-001',
    sellerName: 'Rajan Electronics',
    price: Number(price) || 32000,
    delivery: freeDelivery ? '2-day Free Delivery' : '3-day Express',
    warranty: warranty ? `${warranty}-Year Warranty` : '3-Year Warranty',
    rating: 4.7,
    badge: null,
    exactMatch: true,
    freeDelivery: Boolean(freeDelivery),
    installationIncluded: Boolean(installationIncluded),
    submittedAt: 'Just now',
  };

  db.update('quotes', (list) => [newQuote, ...list]);

  // Update quote count on requirement
  db.update('requirements', (list) =>
    list.map((r) => (r.id === reqId ? { ...r, quotesCount: r.quotesCount + 1 } : r))
  );

  // If phone/email leaks detected, flag quote automatically
  if (containsPhone || containsEmail) {
    db.update('flaggedQuotes', (list) => [
      {
        id: newQuote.id,
        quoteId: newQuote.id,
        seller: 'Rajan Electronics',
        sellerId: 'SEL-001',
        product: brandModel || 'Submitted Quote',
        price: `₹${price}`,
        flags: containsPhone ? ['Phone/WhatsApp number detected'] : ['Direct Email address detected'],
        severity: 'high' as const,
        submittedText: quoteText,
        status: 'pending_review' as const,
        aiConfidence: 98.2,
        scanTimeSec: 0.3,
      },
      ...list,
    ]);
  }

  // Notify customer
  db.update('notifications', (list) => [
    {
      id: `NT-${Date.now()}`,
      userId: 'USR-001',
      title: '🏆 New Quote Received!',
      message: `Rajan Electronics quoted ₹${price} for your request.`,
      type: 'quote',
      read: false,
      createdAt: 'Just now',
    },
    ...list,
  ]);

  res.status(201).json({ success: true, message: 'Quotation submitted successfully!', data: newQuote });
});

// ── Sellers API ─────────────────────────────────────────────────────────────
app.get('/api/sellers', (req: Request, res: Response) => {
  const sellers = db.get('sellers');
  res.json({ success: true, count: sellers.length, data: sellers });
});

app.patch('/api/sellers/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { action } = req.body;

  let updatedSeller = null;
  db.update('sellers', (list) =>
    list.map((s) => {
      if (s.id !== id) return s;
      let kyc = s.kyc;
      let status = s.status;

      if (action === 'approve') kyc = 'verified';
      else if (action === 'reject') {
        kyc = 'rejected';
        status = 'suspended';
      } else if (action === 'suspend') status = 'suspended';
      else if (action === 'reinstate') status = 'active';

      updatedSeller = { ...s, kyc, status };
      return updatedSeller;
    })
  );

  if (!updatedSeller) return res.status(404).json({ success: false, error: 'Seller not found' });
  res.json({ success: true, message: `Seller status updated to ${action}`, data: updatedSeller });
});

// ── Seller Wallet API ───────────────────────────────────────────────────────
app.get('/api/seller/wallet', (req: Request, res: Response) => {
  const sellerId = (req.query.sellerId as string) || 'SEL-001';
  const seller = db.get('sellers').find((s) => s.id === sellerId);
  const txns = db.get('walletTransactions').filter((t) => t.sellerId === sellerId);

  res.json({
    success: true,
    sellerId,
    balance: seller?.walletBalance || 1240,
    transactions: txns,
  });
});

app.post('/api/seller/wallet/recharge', (req: Request, res: Response) => {
  const { sellerId = 'SEL-001', amount = 1000, method = 'UPI' } = req.body;

  let newBalance = 0;
  db.update('sellers', (list) =>
    list.map((s) => {
      if (s.id !== sellerId) return s;
      newBalance = s.walletBalance + Number(amount);
      return { ...s, walletBalance: newBalance };
    })
  );

  const txn = {
    id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
    sellerId,
    type: 'recharge' as const,
    amount: Number(amount),
    description: `Wallet Top-up via ${method}`,
    timestamp: new Date().toLocaleString(),
    status: 'success' as const,
  };

  db.update('walletTransactions', (list) => [txn, ...list]);

  res.json({
    success: true,
    message: `Wallet recharged with ₹${amount}`,
    balance: newBalance,
    transaction: txn,
  });
});

app.post('/api/seller/wallet/debit-lead-fee', (req: Request, res: Response) => {
  const { sellerId = 'SEL-001', reqId } = req.body;
  const FEE = 9;

  let seller = db.get('sellers').find((s) => s.id === sellerId);
  if (!seller || seller.walletBalance < FEE) {
    return res.status(400).json({ success: false, error: 'Insufficient wallet balance. Recharge needed.' });
  }

  let newBalance = seller.walletBalance - FEE;
  db.update('sellers', (list) =>
    list.map((s) => (s.id === sellerId ? { ...s, walletBalance: newBalance } : s))
  );

  const txn = {
    id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
    sellerId,
    type: 'debit_fee' as const,
    amount: FEE,
    description: `Lead Unlock Fee — ${reqId || 'Requirement'}`,
    timestamp: new Date().toLocaleString(),
    status: 'success' as const,
  };

  db.update('walletTransactions', (list) => [txn, ...list]);

  res.json({
    success: true,
    message: `₹9 deducted. Lead unlocked!`,
    balance: newBalance,
    transaction: txn,
  });
});

// ── Orders & Invoices API ───────────────────────────────────────────────────
app.get('/api/orders', (req: Request, res: Response) => {
  const orders = db.get('orders');
  res.json({ success: true, count: orders.length, data: orders });
});

app.get('/api/orders/:id', (req: Request, res: Response) => {
  const orders = db.get('orders');
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
  res.json({ success: true, data: order });
});

app.post('/api/orders/checkout', (req: Request, res: Response) => {
  const { quoteId, paymentMethod } = req.body;
  const quotes = db.get('quotes');
  const quote = quotes.find((q) => q.id === quoteId) || quotes[0];

  const total = quote.price + (quote.installationIncluded ? 0 : 800);
  const adv = Math.round(total * 0.1);
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  const newOrder = {
    id: `BST-${Math.floor(3000 + Math.random() * 1000)}`,
    reqId: quote.reqId,
    reqTitle: `${quote.sellerName} · ${quote.delivery}`,
    sellerId: quote.sellerId,
    sellerName: quote.sellerName,
    customerId: 'USR-001',
    customerName: 'Aryan Mehta',
    amountTotal: total,
    advancePaid: adv,
    advancePct: 10,
    balanceDue: total - adv,
    paymentMethod: paymentMethod || 'UPI (aryan@paytm)',
    createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    stage: 1,
    deliveryOtp: otp,
    timeline: [
      { stage: 1, title: 'Order Confirmed', sub: 'Just now', done: true },
      { stage: 2, title: 'Preparing Order', sub: 'Estimated in 2h', done: false },
      { stage: 3, title: 'Out for Delivery', sub: 'Tomorrow', done: false },
      { stage: 4, title: 'Delivered & Installed', sub: 'In 2 days', done: false },
    ],
  };

  db.update('orders', (list) => [newOrder, ...list]);

  // Notify seller
  db.update('notifications', (list) => [
    {
      id: `NT-${Date.now()}`,
      userId: 'USR-002',
      title: '📦 New Confirmed Order!',
      message: `Aryan Mehta confirmed order ${newOrder.id}. Advance of ₹${adv} received!`,
      type: 'order',
      read: false,
      createdAt: 'Just now',
    },
    ...list,
  ]);

  res.status(201).json({ success: true, message: 'Order placed successfully!', data: newOrder });
});

app.patch('/api/orders/:id/stage', (req: Request, res: Response) => {
  const { id } = req.params;
  const { stage } = req.body;

  let updatedOrder = null;
  db.update('orders', (list) =>
    list.map((o) => {
      if (o.id !== id) return o;
      const stageNum = Number(stage);
      const timeline = o.timeline.map((t) => ({
        ...t,
        done: t.stage <= stageNum,
      }));
      updatedOrder = { ...o, stage: stageNum, timeline };
      return updatedOrder;
    })
  );

  if (!updatedOrder) return res.status(404).json({ success: false, error: 'Order not found' });
  res.json({ success: true, message: 'Order stage updated', data: updatedOrder });
});

app.post('/api/orders/:id/review', (req: Request, res: Response) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  let updated = null;
  db.update('orders', (list) =>
    list.map((o) => {
      if (o.id !== id) return o;
      updated = {
        ...o,
        reviewed: true,
        reviewRating: Number(rating),
        reviewComment: comment,
      };
      return updated;
    })
  );

  res.json({ success: true, message: 'Thank you for your rating!', data: updated });
});

app.post('/api/orders/:id/dispute', (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  const orderIdStr = Array.isArray(id) ? id[0] : id;

  const newDispute = {
    id: `DSP-${Math.floor(500 + Math.random() * 400)}`,
    orderId: orderIdStr,
    raisedBy: 'Aryan Mehta',
    reason: (reason as string) || 'Item issue / delayed delivery',
    status: 'open' as const,
    createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  };

  db.update('disputes', (list) => [newDispute, ...list]);
  db.update('orders', (list) => list.map((o) => (o.id === id ? { ...o, disputed: true, disputeReason: reason } : o)));

  res.status(201).json({ success: true, message: 'Dispute ticket raised with Admin support!', data: newDispute });
});

// ── Notifications API ───────────────────────────────────────────────────────
app.get('/api/notifications', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'USR-001';
  const list = db.get('notifications').filter((n) => n.userId === userId || !n.userId);
  res.json({ success: true, count: list.length, data: list });
});

app.post('/api/notifications/read', (req: Request, res: Response) => {
  db.update('notifications', (list) => list.map((n) => ({ ...n, read: true })));
  res.json({ success: true, message: 'All notifications marked as read' });
});

// ── Admin Dashboard & Moderation API ────────────────────────────────────────
app.get('/api/admin/metrics', (req: Request, res: Response) => {
  const sellers = db.get('sellers');
  const orders = db.get('orders');
  const totalGmv = orders.reduce((acc, o) => acc + o.amountTotal, 8420000);
  const revenue = Math.round(totalGmv * 0.1);

  res.json({
    success: true,
    data: {
      gmv: `₹${(totalGmv / 100000).toFixed(1)}L`,
      revenue: `₹${(revenue / 100000).toFixed(2)}L`,
      activeCustomers: 12847,
      activeSellers: sellers.filter((s) => s.status === 'active').length,
      conversionRate: '34.8%',
      pendingKYC: sellers.filter((s) => s.kyc === 'pending').length,
      flaggedQuotes: db.get('flaggedQuotes').filter((f) => f.status === 'pending_review').length,
    },
  });
});

app.get('/api/admin/moderation', (req: Request, res: Response) => {
  const list = db.get('flaggedQuotes');
  res.json({ success: true, count: list.length, data: list });
});

app.post('/api/admin/moderation/:id/action', (req: Request, res: Response) => {
  const { id } = req.params;
  const { decision } = req.body;

  let updated = null;
  db.update('flaggedQuotes', (list) =>
    list.map((f) => {
      if (f.id !== id) return f;
      updated = { ...f, status: decision === 'approved' ? ('approved' as const) : ('rejected' as const) };
      return updated;
    })
  );

  if (!updated) return res.status(404).json({ success: false, error: 'Flagged item not found' });
  res.json({ success: true, message: `Flagged quote ${decision}`, data: updated });
});

app.get('/api/admin/disputes', (req: Request, res: Response) => {
  const disputes = db.get('disputes');
  res.json({ success: true, count: disputes.length, data: disputes });
});

app.post('/api/admin/disputes/:id/resolve', (req: Request, res: Response) => {
  const { id } = req.params;
  const { resolutionNotes } = req.body;

  let updated = null;
  db.update('disputes', (list) =>
    list.map((d) => {
      if (d.id !== id) return d;
      updated = {
        ...d,
        status: 'resolved' as const,
        resolutionNotes: resolutionNotes || 'Issue resolved by admin support.',
      };
      return updated;
    })
  );

  res.json({ success: true, message: 'Dispute resolved', data: updated });
});

// Export express app for Vercel Serverless Function & local runner
export default app;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`⚡ [BESTEAL Backend API] Running on http://localhost:${PORT}`);
  });
}
