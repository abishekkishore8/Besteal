import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Requirement, Quote, Order } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

type CTab = 'home' | 'ai' | 'quotes' | 'checkout' | 'track';

export const CustomerMobileApp: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<CTab>('home');
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  // AI Assistant Chat state
  const [userQuery, setUserQuery] = useState('I need a 1.5-ton AC under ₹35,000');
  const [chatMessages, setChatHistory] = useState<Array<{ sender: 'ai' | 'user'; text: string; time: string }>>([
    { sender: 'ai', text: 'Hi Aryan! What product or service are you looking for today? Tell me naturally and I will match you with top sellers in Bengaluru. 🎯', time: '11:00 AM' },
    { sender: 'user', text: 'I need a 1.5-ton AC under ₹35,000', time: '11:01 AM' },
    { sender: 'ai', text: 'Got it! To help sellers quote accurately, please tap your choices below:', time: '11:01 AM' },
  ]);
  const [customChatInput, setCustomChatInput] = useState('');
  const [chatAnswers, setChatAnswers] = useState<Record<string, string>>({
    brand: 'Daikin',
    capacity: '1.5 Ton',
    delivery: 'Express (24h)',
  });
  const [postedSuccess, setPostedSuccess] = useState(false);

  // Checkout Payment State
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card'>('upi');
  const [upiId, setUpiId] = useState('aryan@paytm');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  // Modals state
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('Super fast delivery and excellent installation service!');
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('Installation technician arrived late by 1 hour');

  // Sort state for quotes
  const [quoteSort, setQuoteSort] = useState<'ai' | 'price' | 'rating'>('ai');

  // Load initial data from backend API
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([
      api.getRequirements(),
      api.getQuotes('REQ-101'),
      api.getOrders(),
    ]).then(([reqs, qts, ords]) => {
      if (!mounted) return;
      setRequirements(reqs);
      setQuotes(qts);
      setOrders(ords);
      if (qts.length > 0) setSelectedQuote(qts[0]);
      if (ords.length > 0) setSelectedOrder(ords[0]);
      setLoading(false);
    }).catch(err => {
      console.error("Error loading customer data:", err);
      setLoading(false);
    });

    return () => { mounted = false; };
  }, []);

  const handlePostRequirement = async () => {
    try {
      setLoading(true);
      const newReq = await api.createRequirement({
        title: userQuery || '1.5-Ton Inverter AC',
        budget: 35000,
        category: 'AC & Cooling',
        answers: chatAnswers,
      });

      setRequirements(prev => [newReq, ...prev]);
      setPostedSuccess(true);
      setLoading(false);
      showToast('success', 'Requirement Posted!', '800+ Verified Bengaluru sellers notified.');

      const freshQuotes = await api.getQuotes(newReq.id);
      setQuotes(freshQuotes);
      if (freshQuotes.length > 0) setSelectedQuote(freshQuotes[0]);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSendChatMessage = async () => {
    if (!customChatInput.trim()) return;
    const msg = customChatInput.trim();
    setCustomChatInput('');
    setChatHistory((prev) => [...prev, { sender: 'user', text: msg, time: 'Just now' }]);

    try {
      const res = await api.sendAIChatMessage('REQ-101', msg);
      setChatHistory((prev) => [...prev, { sender: 'ai', text: res.reply, time: 'Just now' }]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmOrder = async () => {
    if (!selectedQuote) return;
    try {
      setIsProcessingOrder(true);
      const newOrd = await api.placeOrder(
        selectedQuote.id,
        paymentMethod === 'upi' ? `UPI (${upiId})` : 'Card ending in 4821'
      );
      setOrders(prev => [newOrd, ...prev]);
      setSelectedOrder(newOrd);
      setIsProcessingOrder(false);
      setActiveTab('track');

      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      showToast('success', 'Order Confirmed! 🎉', `10% advance deposit paid. Order #${newOrd.id} created.`);
    } catch (err) {
      console.error(err);
      setIsProcessingOrder(false);
    }
  };

  const handleUpdateStage = async (stageNum: number) => {
    if (!selectedOrder) return;
    try {
      const updated = await api.updateOrderStage(selectedOrder.id, stageNum);
      setSelectedOrder(updated);
      setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
      showToast('info', 'Order Stage Updated', `Order #${updated.id} moved to Stage ${stageNum}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'BESTEAL10') {
      setPromoApplied(true);
      showToast('success', 'Promo Code Applied!', '₹500 instant discount deducted.');
    } else {
      showToast('warning', 'Invalid Promo Code', 'Try BESTEAL10 for ₹500 off!');
    }
  };

  const sortedQuotes = [...quotes].sort((a, b) => {
    if (quoteSort === 'price') return a.price - b.price;
    if (quoteSort === 'rating') return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800 font-sans select-none overflow-hidden">
      {/* iOS Status Bar */}
      <div className="bg-blue-700 text-white px-5 pt-3 pb-1 flex items-center justify-between text-xs font-mono shrink-0">
        <span className="font-bold">9:41</span>
        <div className="flex items-center gap-1.5 opacity-90 text-[11px]">
          <span>5G</span>
          <span>📶</span>
          <span>🔋 98%</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* HOME SCREEN */}
        {activeTab === 'home' && (
          <div className="flex flex-col gap-4 pb-6">
            <div className="bg-gradient-to-b from-blue-700 via-blue-600 to-indigo-700 text-white p-5 rounded-b-3xl shadow-xl relative overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-xs text-blue-200 font-medium">Good morning,</div>
                  <h1 className="text-xl font-bold font-display tracking-tight text-white mt-0.5">
                    Aryan Mehta 👋
                  </h1>
                  <div className="flex items-center gap-1 text-xs text-blue-100/90 mt-1 font-medium">
                    <span className="text-red-400">📍</span> Koramangala, Bengaluru
                  </div>
                </div>
                <button onClick={() => setActiveTab('track')} className="w-10 h-10 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-lg cursor-pointer">
                  🔔
                </button>
              </div>

              <button
                onClick={() => { setPostedSuccess(false); setActiveTab('ai'); }}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3.5 px-4 rounded-2xl font-bold font-display text-base shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span className="text-xl font-extrabold">+</span> POST REQUIREMENT
              </button>
            </div>

            <div className="px-4 space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h2 className="text-xs font-bold font-display uppercase tracking-wider text-slate-400">
                    Active Requirements
                  </h2>
                  <span className="text-xs font-semibold text-blue-600 cursor-pointer">View All</span>
                </div>

                <div className="space-y-2.5">
                  {requirements.map((req) => (
                    <div
                      key={req.id}
                      onClick={() => setActiveTab('quotes')}
                      className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="text-sm font-bold text-slate-800 font-display">{req.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="bg-emerald-50 text-emerald-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200/60 font-mono">
                            Budget: ₹{req.budget.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">{req.createdAgo}</span>
                        </div>
                      </div>

                      <div className="text-center bg-blue-50 px-3 py-2 rounded-xl border border-blue-100">
                        <div className="text-xl font-extrabold text-blue-600 font-mono leading-none">{req.quotesCount}</div>
                        <div className="text-[9px] font-bold text-blue-500 tracking-wider uppercase mt-1">QUOTES</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Orders */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h2 className="text-xs font-bold font-display uppercase tracking-wider text-slate-400">Recent Orders</h2>
                  <button onClick={() => setActiveTab('track')} className="text-xs font-semibold text-blue-600 cursor-pointer">Track All</button>
                </div>

                {orders.length > 0 && (
                  <div onClick={() => { setSelectedOrder(orders[0]); setActiveTab('track'); }} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm cursor-pointer flex justify-between items-center">
                    <div>
                      <div className="text-sm font-bold text-slate-800 font-display">{orders[0].reqTitle}</div>
                      <div className="text-xs text-slate-400 font-mono">Order #{orders[0].id} · {orders[0].sellerName}</div>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 font-mono">
                      Stage {orders[0].stage}/4
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* AI CHAT SCREEN */}
        {activeTab === 'ai' && (
          <div className="flex flex-col h-full bg-white">
            <div className="bg-blue-700 text-white p-4 shadow-md shrink-0 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">✦</div>
              <div>
                <h2 className="text-base font-bold font-display leading-tight">AI Requirement Assistant</h2>
                <p className="text-xs text-blue-200">Natural language requirement builder</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex gap-2.5 items-end ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                  {msg.sender === 'ai' && <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">✦</div>}
                  <div className={`p-3.5 rounded-2xl text-xs max-w-[85%] leading-relaxed font-medium ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {[
                { id: 'brand', title: 'Preferred Brand', options: ['Daikin', 'LG', 'Voltas', 'Samsung', 'Any Brand'] },
                { id: 'capacity', title: 'Capacity Required', options: ['1.0 Ton', '1.5 Ton', '2.0 Ton'] },
                { id: 'delivery', title: 'Delivery Timeline', options: ['Express (24h)', '2-3 Days', 'Flexible'] },
              ].map((q) => (
                <div key={q.id} className="ml-9 bg-blue-50/70 border border-blue-200/70 rounded-2xl p-3.5 space-y-2">
                  <div className="text-xs font-bold text-slate-800 font-display">{q.title}:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {q.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setChatAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${chatAnswers[q.id] === opt ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {postedSuccess && (
                <div className="ml-9 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl text-xs space-y-2">
                  <div className="font-bold">✅ Posted to 847 Verified Sellers!</div>
                  <button onClick={() => setActiveTab('quotes')} className="bg-emerald-600 text-white px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer">
                    View Live Quotes →
                  </button>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask AI assistant..."
                  value={customChatInput}
                  onChange={(e) => setCustomChatInput(e.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                />
                <button onClick={handleSendChatMessage} className="bg-blue-600 text-white px-3 py-2 rounded-xl text-xs font-bold cursor-pointer">Send</button>
              </div>

              <button
                onClick={handlePostRequirement}
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3.5 px-4 rounded-2xl font-bold font-display text-sm shadow-lg cursor-pointer"
              >
                {loading ? 'Posting...' : 'POST REQUIREMENT TO SELLERS →'}
              </button>
            </div>
          </div>
        )}

        {/* QUOTE COMPARISON SCREEN */}
        {activeTab === 'quotes' && (
          <div className="flex flex-col h-full bg-slate-50">
            <div className="bg-blue-700 text-white p-4 shadow-md shrink-0 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold font-display">Quotes Received</h2>
                  <p className="text-xs text-blue-200">1.5 Ton AC · Budget ₹35,000</p>
                </div>
                <span className="bg-blue-800 text-blue-100 text-xs font-mono font-bold px-2.5 py-1 rounded-full">{quotes.length} Sellers</span>
              </div>

              {/* Sort Pills */}
              <div className="flex gap-2 pt-1">
                {[
                  { id: 'ai', label: '🏆 AI Ranked' },
                  { id: 'price', label: '💰 Lowest Price' },
                  { id: 'rating', label: '⭐ Top Rated' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setQuoteSort(s.id as any)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      quoteSort === s.id
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'bg-blue-800/60 text-blue-100 hover:bg-blue-800'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Recommendation Banner */}
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white m-3 rounded-2xl shadow-md flex items-start gap-3">
              <span className="text-xl">✦</span>
              <div>
                <div className="text-xs font-bold font-display">AI Choice: CoolAir Solutions</div>
                <div className="text-[11px] text-blue-100 mt-0.5">
                  Best balance of 5-year warranty, 2-day delivery, and 4.8★ seller rating.
                </div>
              </div>
            </div>

            <div className="p-3 space-y-3 overflow-y-auto flex-1">
              {sortedQuotes.map((q) => {
                const isSelected = selectedQuote?.id === q.id;
                return (
                  <div
                    key={q.id}
                    onClick={() => setSelectedQuote(q)}
                    className={`bg-white p-4 rounded-2xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-lg'
                        : 'border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    {/* Badge */}
                    {q.badge && (
                      <span className="absolute -top-2.5 left-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                        {q.badge}
                      </span>
                    )}

                    <div className="flex justify-between items-start pt-1">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 font-display">{q.sellerName}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          <span className="text-amber-500 font-bold">★ {q.rating}</span>
                          <span>· Verified Merchant</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-extrabold text-blue-600 font-mono">₹{q.price.toLocaleString('en-IN')}</div>
                        <div className="text-[9px] text-slate-400 font-bold tracking-wider uppercase">INCL. TAXES</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 my-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-mono">
                      <div><span className="text-slate-400">Delivery:</span> <span className="font-semibold text-slate-700">{q.delivery}</span></div>
                      <div><span className="text-slate-400">Warranty:</span> <span className="font-semibold text-slate-700">{q.warranty}</span></div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
                        {q.freeDelivery && <span className="text-emerald-600 font-medium">✓ Free Delivery</span>}
                        {q.installationIncluded && <span className="text-emerald-600 font-medium">✓ Free Install</span>}
                      </div>

                      <span className={`text-xs font-bold ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
                        {isSelected ? '✓ Selected' : 'Tap to select'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-200 bg-white">
              <button
                onClick={() => setActiveTab('checkout')}
                disabled={!selectedQuote}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-3.5 px-4 rounded-2xl font-bold font-display text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                PROCEED TO CHECKOUT (₹{selectedQuote ? Math.round(selectedQuote.price * 0.1).toLocaleString('en-IN') : '0'} Advance) →
              </button>
            </div>
          </div>
        )}

        {/* CHECKOUT SCREEN */}
        {activeTab === 'checkout' && selectedQuote && (
          <div className="flex flex-col h-full bg-slate-50">
            <div className="bg-blue-700 text-white p-4 shadow-md shrink-0">
              <h2 className="text-base font-bold font-display">Confirm & Pay Advance</h2>
              <p className="text-xs text-blue-200">Quote #{selectedQuote.id} · {selectedQuote.sellerName}</p>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-display">Order Summary</div>
                <div className="flex justify-between text-sm py-1">
                  <span className="text-slate-600">Product Quote Price</span>
                  <span className="font-semibold font-mono">₹{selectedQuote.price.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm py-1">
                  <span className="text-slate-600 font-medium">Installation & Delivery</span>
                  <span className="font-semibold text-emerald-600 font-mono">{selectedQuote.installationIncluded ? 'FREE' : '₹800'}</span>
                </div>

                {promoApplied && (
                  <div className="flex justify-between text-xs py-1 text-emerald-600 font-bold">
                    <span>Promo Code BESTEAL10</span>
                    <span className="font-mono">− ₹500</span>
                  </div>
                )}

                <div className="border-t border-slate-100 pt-2 flex justify-between text-base font-bold">
                  <span>Total Order Value</span>
                  <span className="text-blue-600 font-mono">
                    ₹{(selectedQuote.price + (selectedQuote.installationIncluded ? 0 : 800) - (promoApplied ? 500 : 0)).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="bg-orange-50 border border-orange-200/70 p-3 rounded-xl text-xs text-orange-900 mt-2 font-medium">
                  ⚡ Pay 10% Advance (<strong>₹{Math.round((selectedQuote.price - (promoApplied ? 500 : 0)) * 0.1).toLocaleString('en-IN')}</strong>) now. Pay remaining balance directly to seller on delivery!
                </div>
              </div>

              {/* Promo code */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-display">Have a Promo Code?</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code (BESTEAL10)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono uppercase text-slate-800 outline-none"
                  />
                  <button onClick={handleApplyPromo} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer">Apply</button>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-display">Select Payment Method</div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${paymentMethod === 'upi' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'}`}
                  >
                    <span>⚡</span> Instant UPI
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${paymentMethod === 'card' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'}`}
                  >
                    <span>💳</span> Credit Card
                  </button>
                </div>

                {paymentMethod === 'upi' ? (
                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-semibold text-slate-600">Your UPI ID</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 outline-none focus:border-blue-500"
                      placeholder="e.g. name@upi"
                    />
                  </div>
                ) : (
                  <div className="space-y-2 pt-1 text-xs">
                    <input type="text" placeholder="Card Number (4821 XXXX XXXX 9912)" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-mono text-slate-800 outline-none" />
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-white">
              <button
                onClick={handleConfirmOrder}
                disabled={isProcessingOrder}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white py-3.5 px-4 rounded-2xl font-bold font-display text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {isProcessingOrder ? 'Processing Payment...' : `CONFIRM & PAY ₹${Math.round((selectedQuote.price - (promoApplied ? 500 : 0)) * 0.1).toLocaleString('en-IN')} →`}
              </button>
            </div>
          </div>
        )}

        {/* ORDER TRACKING SCREEN */}
        {activeTab === 'track' && selectedOrder && (
          <div className="flex flex-col h-full bg-slate-50">
            <div className="bg-blue-700 text-white p-4 shadow-md shrink-0 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold font-display">Live Order Tracking</h2>
                <p className="text-xs text-blue-200">Order #{selectedOrder.id} · {selectedOrder.sellerName}</p>
              </div>
              <button onClick={() => setShowInvoiceModal(true)} className="bg-blue-800 hover:bg-blue-900 border border-blue-600 text-white text-xs font-mono font-bold px-3 py-1.5 rounded-xl shadow-sm cursor-pointer">
                🧾 Invoice PDF
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              <div className="bg-emerald-500 text-white p-4 rounded-2xl shadow-md space-y-1">
                <div className="text-xs font-bold tracking-wider uppercase font-display opacity-90">Current Status</div>
                <div className="text-base font-extrabold font-display">
                  {selectedOrder.stage === 1 && '🎉 Order Confirmed with Seller'}
                  {selectedOrder.stage === 2 && '⚙ Order Being Prepared & Inspected'}
                  {selectedOrder.stage === 3 && '🚚 Out for Delivery to Your Location'}
                  {selectedOrder.stage === 4 && '📦 Delivered & Installed!'}
                </div>
                <p className="text-xs text-emerald-100">
                  Delivery OTP Code: <strong className="font-mono text-white underline">{selectedOrder.deliveryOtp || '8492'}</strong>
                </p>
              </div>

              {/* Timeline Steps */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-display">Delivery Timeline</div>

                <div className="relative pl-6 space-y-6">
                  <div className="absolute top-2 left-2.5 bottom-2 w-0.5 bg-slate-200" />

                  {[
                    { stage: 1, title: 'Order Confirmed', desc: '10% advance received via UPI' },
                    { stage: 2, title: 'Preparing Order', desc: 'Stock allocated & technician assigned' },
                    { stage: 3, title: 'Out for Delivery', desc: 'Delivery vehicle dispatched' },
                    { stage: 4, title: 'Delivered & Installed', desc: 'Final balance ₹' + selectedOrder.balanceDue.toLocaleString('en-IN') + ' paid' },
                  ].map((s) => {
                    const isDone = s.stage <= selectedOrder.stage;
                    const isCurrent = s.stage === selectedOrder.stage;

                    return (
                      <div key={s.stage} className="relative flex items-start gap-3">
                        <div
                          className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold z-10 ${
                            isDone ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300 text-slate-400'
                          }`}
                        >
                          {isDone ? '✓' : s.stage}
                        </div>

                        <div>
                          <div className={`text-xs font-bold font-display ${isCurrent ? 'text-blue-700' : 'text-slate-800'}`}>{s.title}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{s.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between text-xs">
                <button onClick={() => setShowDisputeModal(true)} className="text-red-600 font-bold hover:underline cursor-pointer">⚠ Raise Issue / Dispute</button>
                {selectedOrder.stage === 4 && (
                  <button onClick={() => setShowReviewModal(true)} className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-3 py-1.5 rounded-xl shadow-sm cursor-pointer">
                    ⭐ Rate Merchant
                  </button>
                )}
              </div>

              {/* Simulation Bar */}
              <div className="bg-slate-100 p-3 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="font-bold text-slate-600">Simulate Order Progress:</div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4].map((stg) => (
                    <button
                      key={stg}
                      onClick={() => handleUpdateStage(stg)}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                        selectedOrder.stage === stg ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200'
                      }`}
                    >
                      Stage {stg}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav Bar */}
      <nav className="bg-white border-t border-slate-200 px-2 py-2 flex items-center justify-around shrink-0">
        {[
          { id: 'home', icon: '⊞', label: 'Home' },
          { id: 'ai', icon: '✦', label: 'AI Post' },
          { id: 'quotes', icon: '◈', label: 'Quotes' },
          { id: 'track', icon: '◉', label: 'Orders' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as CTab)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all cursor-pointer ${activeTab === tab.id ? 'text-blue-600 font-bold' : 'text-slate-400'}`}
          >
            <span className="text-lg leading-none">{tab.icon}</span>
            <span className="text-[10px] font-display font-semibold uppercase">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
