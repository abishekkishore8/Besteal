import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Requirement, Quote, Order, Seller } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const WebsiteHome: React.FC = () => {
  const { showToast } = useToast();
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [selectedReq, setSelectedReq] = useState<Requirement | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  // Requirement Posting State
  const [postTitle, setPostTitle] = useState('I need a 1.5-ton Inverter AC under ₹35,000');
  const [postBudget, setPostBudget] = useState('35000');
  const [selectedCategory, setSelectedCategory] = useState('AC & Cooling');
  const [selectedBrand, setSelectedBrand] = useState('Daikin');
  const [isPosting, setIsPosting] = useState(false);

  // Active Category Filter for Feed
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Checkout Modal State
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card'>('upi');
  const [upiId, setUpiId] = useState('aryan@paytm');
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  useEffect(() => {
    Promise.all([
      api.getRequirements(),
      api.getQuotes('REQ-101'),
      api.getSellers(),
    ]).then(([reqs, qts, sList]) => {
      setRequirements(reqs);
      setQuotes(qts);
      setSellers(sList);
      if (reqs.length > 0) setSelectedReq(reqs[0]);
      if (qts.length > 0) setSelectedQuote(qts[0]);
    }).catch(console.error);
  }, []);

  const handlePost = async () => {
    if (!postTitle.trim()) return;
    try {
      setIsPosting(true);
      const newReq = await api.createRequirement({
        title: postTitle,
        budget: Number(postBudget) || 35000,
        category: selectedCategory,
        answers: { brand: selectedBrand },
      });
      setRequirements((prev) => [newReq, ...prev]);
      setSelectedReq(newReq);
      setPostTitle('');
      setIsPosting(false);
      showToast('success', 'Requirement Posted & Broadcasted! 🚀', '800+ Verified local merchants in Bengaluru notified.');

      // Fetch fresh live quotes for newly created request
      const freshQuotes = await api.getQuotes(newReq.id);
      setQuotes(freshQuotes);
      if (freshQuotes.length > 0) setSelectedQuote(freshQuotes[0]);
    } catch (err) {
      console.error(err);
      setIsPosting(false);
      showToast('error', 'Failed to post requirement.');
    }
  };

  const handleConfirmEscrowOrder = async () => {
    if (!selectedQuote) return;
    try {
      setIsProcessingOrder(true);
      const order = await api.placeOrder(
        selectedQuote.id,
        paymentMethod === 'upi' ? `UPI (${upiId})` : 'Credit Card **** 4821'
      );
      setConfirmedOrder(order);
      setIsProcessingOrder(false);
      setShowCheckoutModal(false);

      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      showToast('success', 'Order Confirmed via Escrow! 🎉', `Receipt #${order.id} generated. 10% advance deposit paid.`);
    } catch (err) {
      console.error(err);
      setIsProcessingOrder(false);
      showToast('error', 'Checkout failed.');
    }
  };

  const filteredRequirements = requirements.filter((r) => {
    if (categoryFilter === 'All') return true;
    return r.category.toLowerCase().includes(categoryFilter.toLowerCase());
  });

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Live Market Stats Bar */}
      <div className="bg-slate-900/90 border-y border-slate-800 py-3 px-6 text-xs font-mono text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-bold text-white uppercase font-display">Live Market Ticker:</span>
          </div>
          <div className="flex flex-wrap items-center gap-6 md:gap-10">
            <div><span className="text-slate-500">Gross Vol:</span> <strong className="text-blue-400">₹84.2L</strong></div>
            <div><span className="text-slate-500">Active Postings:</span> <strong className="text-orange-400">12,847</strong></div>
            <div><span className="text-slate-500">Local Merchants:</span> <strong className="text-purple-400">3,241 Verified</strong></div>
            <div><span className="text-slate-500">Customer Savings Rate:</span> <strong className="text-emerald-400">18.4% Avg</strong></div>
          </div>
        </div>
      </div>

      {/* 2. Hero Section with AI Requirement Box */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-950 border border-slate-800/80 p-8 md:p-14 shadow-2xl text-white">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/30 px-3.5 py-1.5 rounded-full text-orange-400 font-mono text-xs font-bold uppercase tracking-wider">
                <span>⚡ AI-Powered Reverse Marketplace</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold font-display leading-[1.1] tracking-tight">
                Stop searching products. Let local sellers <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400">compete for your price</span>.
              </h1>

              <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-xl">
                Post what you need in plain English. Verified local merchants in Bengaluru bid in real time with their lowest price, delivery speed, and brand warranties.
              </p>

              {/* Category Quick Chips */}
              <div className="space-y-2 pt-2">
                <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Popular Product Categories:</div>
                <div className="flex flex-wrap gap-2">
                  {['AC & Cooling', 'Televisions', 'Washing Machines', 'Refrigerators', 'Laptops & Gadgets'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-display transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : 'bg-slate-900/90 text-slate-300 border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Hero Right Interactive Requirement Builder Card */}
            <div className="lg:col-span-5 bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl shadow-2xl space-y-5">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✦</span>
                  <h3 className="font-bold font-display text-white text-base">Post Your Requirement</h3>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-mono font-bold">
                  800+ Sellers Live
                </span>
              </div>

              {/* Inputs */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-bold text-slate-400 uppercase">What do you want to buy?</label>
                  <textarea
                    rows={2}
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="e.g. 1.5-ton 5 star Inverter AC with installation..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white outline-none focus:border-blue-500 transition-colors font-medium resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono font-bold text-slate-400 uppercase">Target Budget (₹)</label>
                    <input
                      type="number"
                      value={postBudget}
                      onChange={(e) => setPostBudget(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-400 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono font-bold text-slate-400 uppercase">Brand Choice</label>
                    <select
                      value={selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-white outline-none"
                    >
                      <option value="Daikin">Daikin</option>
                      <option value="LG">LG</option>
                      <option value="Voltas">Voltas</option>
                      <option value="Sony">Sony</option>
                      <option value="Samsung">Samsung</option>
                    </select>
                  </div>
                </div>

                {/* Detected AI Tags */}
                <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-[11px] space-y-1">
                  <div className="text-slate-400 font-mono flex items-center justify-between">
                    <span>✦ AI Extracted Spec Tags:</span>
                    <span className="text-blue-400 font-bold">Auto-Matched</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="bg-blue-900/40 text-blue-300 border border-blue-800 px-2 py-0.5 rounded-md font-mono">{selectedCategory}</span>
                    <span className="bg-emerald-900/40 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-md font-mono">Max ₹{Number(postBudget).toLocaleString('en-IN')}</span>
                    <span className="bg-purple-900/40 text-purple-300 border border-purple-800 px-2 py-0.5 rounded-md font-mono">{selectedBrand} Preferred</span>
                    <span className="bg-amber-900/40 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-md font-mono">Koramangala, BLR</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePost}
                disabled={isPosting}
                className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:brightness-110 active:scale-[0.99] text-white py-3.5 px-4 rounded-2xl font-bold font-display text-sm shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {isPosting ? 'Broadcasting to Sellers...' : 'BROADCAST TO 800+ LOCAL SELLERS →'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How Reverse Bidding Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold font-display text-white">How BESTEAL Reverse Marketplace Works</h2>
          <p className="text-xs md:text-sm text-slate-400">
            Four simple steps designed to guarantee you the lowest price and fastest local delivery with full Escrow protection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Post Requirement', desc: 'Type what you want naturally or use our AI Assistant to extract product specifications.', icon: '📝', badge: '100% Free' },
            { step: '02', title: 'Local Sellers Bid', desc: 'Verified local merchants in your city get instant alerts and compete to submit their best quotes.', icon: '🏪', badge: 'Real-time' },
            { step: '03', title: 'AI Quote Comparison', desc: 'AI ranks all bids based on price, delivery speed, seller rating, and warranty terms.', icon: '🏆', badge: 'Smart Rank' },
            { step: '04', title: '10% Escrow & Delivery', desc: 'Pay 10% advance to confirm order. Remaining 90% paid on delivery after inspection.', icon: '🛡', badge: 'Escrow Safe' },
          ].map((card) => (
            <div
              key={card.step}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 p-6 rounded-3xl space-y-3 relative group transition-all hover:-translate-y-1 shadow-xl"
            >
              <div className="flex justify-between items-center">
                <span className="text-3xl">{card.icon}</span>
                <span className="font-mono font-extrabold text-2xl text-slate-700 group-hover:text-blue-500 transition-colors">{card.step}</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-bold font-display text-white text-base">{card.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
              </div>
              <span className="inline-block bg-slate-800 text-slate-300 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full">
                {card.badge}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Live Postings & Bidding Stream Section */}
      <section id="active-postings" className="max-w-7xl mx-auto px-6 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="text-xs font-mono font-bold text-orange-400 uppercase tracking-widest">LIVE MARKETPLACE STREAM</div>
            <h2 className="text-2xl md:text-3xl font-extrabold font-display text-white mt-1">Customer Postings & Seller Quotes</h2>
            <p className="text-xs text-slate-400 mt-1">Click any requirement to view all seller bids, compare warranties, and place orders.</p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
            {['All', 'AC & Cooling', 'Televisions', 'Washing Machine'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-display transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Live Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Requirements List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider px-1">Active Customer Requirements</div>

            {filteredRequirements.map((req) => {
              const isSelected = selectedReq?.id === req.id;
              return (
                <div
                  key={req.id}
                  onClick={() => setSelectedReq(req)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-slate-900 border-blue-500 shadow-xl ring-1 ring-blue-500/30'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold font-display text-white text-base">{req.title}</h3>
                      <div className="text-xs text-slate-400 mt-1 font-mono">
                        📍 {req.location} · Posted {req.createdAgo}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-extrabold font-mono text-emerald-400">₹{req.budget.toLocaleString('en-IN')}</div>
                      <div className="text-[10px] text-slate-500 font-mono uppercase">TARGET BUDGET</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-800/80 text-xs">
                    <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full font-mono text-[11px]">
                      {req.category}
                    </span>
                    <span className="font-bold text-blue-400 font-mono">
                      {req.quotesCount} Merchant Quotes →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Quotes Inspection & Comparison Panel */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl space-y-6">
            {selectedReq ? (
              <>
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 font-mono font-bold px-2 py-0.5 rounded uppercase">
                      INSPECTION PANEL
                    </span>
                    <h3 className="text-xl font-extrabold font-display text-white mt-1">{selectedReq.title}</h3>
                    <p className="text-xs text-slate-400 font-mono">Budget Limit: ₹{selectedReq.budget.toLocaleString('en-IN')} · Location: {selectedReq.location}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-blue-400 font-mono">{quotes.length}</span>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Bids Received</div>
                  </div>
                </div>

                {/* Quotes List */}
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {quotes.map((q) => {
                    const isQuoteSel = selectedQuote?.id === q.id;
                    return (
                      <div
                        key={q.id}
                        onClick={() => setSelectedQuote(q)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                          isQuoteSel
                            ? 'bg-slate-950 border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg'
                            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {q.badge && (
                          <span className="absolute -top-2.5 left-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full shadow">
                            {q.badge}
                          </span>
                        )}

                        <div className="flex justify-between items-start pt-1">
                          <div>
                            <h4 className="font-bold font-display text-white text-base">{q.sellerName}</h4>
                            <div className="text-xs text-amber-400 font-mono mt-0.5">★ {q.rating} Merchant Rating · GST Verified</div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-extrabold font-mono text-emerald-400">₹{q.price.toLocaleString('en-IN')}</div>
                            <div className="text-[10px] text-slate-500 font-mono uppercase">INCL. TAXES</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 my-3 bg-slate-900 p-3 rounded-xl border border-slate-800/80 text-xs font-mono">
                          <div><span className="text-slate-500">Delivery:</span> <span className="text-slate-200 font-bold">{q.delivery}</span></div>
                          <div><span className="text-slate-500">Warranty:</span> <span className="text-slate-200 font-bold">{q.warranty}</span></div>
                        </div>

                        <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-900">
                          <div className="flex gap-3 text-emerald-400 font-mono text-[11px]">
                            {q.freeDelivery && <span>✓ Free Delivery</span>}
                            {q.installationIncluded && <span>✓ Free Install</span>}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedQuote(q);
                              setShowCheckoutModal(true);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-xl font-bold font-display text-xs cursor-pointer shadow-md shadow-emerald-600/20"
                          >
                            ORDER NOW (10% Escrow) →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs font-mono">Select a requirement on the left to inspect seller bids.</div>
            )}
          </div>
        </div>
      </section>

      {/* 5. Verified Local Merchants Showcase */}
      <section id="top-sellers" className="max-w-7xl mx-auto px-6 space-y-6">
        <div className="flex justify-between items-end border-b border-slate-800 pb-3">
          <div>
            <div className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest">VERIFIED MERCHANT NETWORK</div>
            <h2 className="text-2xl md:text-3xl font-extrabold font-display text-white mt-1">Top Rated Local Sellers</h2>
            <p className="text-xs text-slate-400 mt-1">Licensed stores with 100% genuine brand warranties and GST registration.</p>
          </div>
          <span className="text-xs text-blue-400 font-bold font-mono">3,241 Sellers Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sellers.map((s) => (
            <div key={s.id} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 hover:border-slate-700 transition-all shadow-xl">
              <div className="flex justify-between items-start">
                <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  Level {s.level} Merchant
                </span>
                <span className="text-xs font-mono font-bold text-amber-400">★ {s.rating}</span>
              </div>
              <div>
                <h3 className="font-bold font-display text-white text-base">{s.name}</h3>
                <p className="text-xs text-slate-400 font-mono mt-1">{s.biz}</p>
              </div>
              <div className="pt-2 border-t border-slate-800 text-xs flex justify-between font-mono text-slate-400">
                <span>Avg Speed: <strong className="text-white">{s.responseMin} min</strong></span>
                <span>City: <strong className="text-white">{s.city}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Escrow Security Banner */}
      <section id="escrow-guarantee" className="max-w-7xl mx-auto px-6">
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border border-emerald-500/30 p-8 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 text-white">
          <div className="space-y-2 max-w-xl">
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono text-[10px] font-bold px-3 py-1 rounded-full uppercase">
              🛡 100% BUYER ESCROW PROTECTION
            </span>
            <h3 className="text-xl md:text-2xl font-extrabold font-display">Your money stays protected until item delivery</h3>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Pay only 10% advance deposit into BESTEAL Escrow. Seller delivers item to your location. Give delivery OTP to seller after inspection to release balance.
            </p>
          </div>

          <button
            onClick={() => {
              if (selectedQuote) setShowCheckoutModal(true);
            }}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-display px-6 py-3.5 rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 cursor-pointer shrink-0"
          >
            TEST ESCROW CHECKOUT NOW →
          </button>
        </div>
      </section>

      {/* Checkout Escrow Modal */}
      {showCheckoutModal && selectedQuote && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg p-6 rounded-3xl shadow-2xl space-y-4 text-white">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold font-display">Escrow Order Checkout</h3>
                <p className="text-xs text-slate-400 font-mono">Quote #{selectedQuote.id} · {selectedQuote.sellerName}</p>
              </div>
              <button onClick={() => setShowCheckoutModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between"><span>Quote Price:</span> <span className="font-bold text-white">₹{selectedQuote.price.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span>Installation & Delivery:</span> <span className="text-emerald-400 font-bold">FREE</span></div>
              <div className="border-t border-slate-800 pt-2 flex justify-between text-sm">
                <span>Total Value:</span>
                <span className="font-bold text-blue-400">₹{selectedQuote.price.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/30 p-3 rounded-xl text-orange-300 text-[11px] mt-2">
                ⚡ 10% Advance Deposit Required: <strong>₹{Math.round(selectedQuote.price * 0.1).toLocaleString('en-IN')}</strong>. Remaining ₹{Math.round(selectedQuote.price * 0.9).toLocaleString('en-IN')} paid directly on delivery!
              </div>
            </div>

            {/* Payment method */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-slate-400 uppercase">Payment Method</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-xl border font-bold cursor-pointer ${paymentMethod === 'upi' ? 'border-blue-500 bg-blue-950/60 text-blue-400' : 'border-slate-800 bg-slate-950 text-slate-400'}`}
                >
                  ⚡ Instant UPI
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border font-bold cursor-pointer ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-950/60 text-blue-400' : 'border-slate-800 bg-slate-950 text-slate-400'}`}
                >
                  💳 Credit Card
                </button>
              </div>
            </div>

            <button
              onClick={handleConfirmEscrowOrder}
              disabled={isProcessingOrder}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-2xl font-bold font-display text-sm shadow-xl shadow-emerald-600/25 cursor-pointer transition-all"
            >
              {isProcessingOrder ? 'Processing Escrow Deposit...' : `CONFIRM & DEPOSIT ₹${Math.round(selectedQuote.price * 0.1).toLocaleString('en-IN')} →`}
            </button>
          </div>
        </div>
      )}

      {/* Website Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-12 px-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="text-xl font-extrabold font-display text-white">BEST<span className="text-orange-500">EAL</span></div>
            <p className="text-slate-400 leading-relaxed">India's leading AI-powered reverse shopping marketplace connecting buyers with verified local sellers.</p>
          </div>
          <div className="space-y-2 font-display">
            <div className="font-bold text-white">Marketplace</div>
            <div><a href="#how-it-works" className="hover:text-white">How It Works</a></div>
            <div><a href="#active-postings" className="hover:text-white">Live Customer Bids</a></div>
            <div><a href="#top-sellers" className="hover:text-white">Verified Merchants</a></div>
          </div>
          <div className="space-y-2 font-display">
            <div className="font-bold text-white">Top Metro Cities</div>
            <div>Bengaluru · Koramangala</div>
            <div>Mumbai · Bandra</div>
            <div>Delhi NCR · Gurgaon</div>
          </div>
          <div className="space-y-2 font-display">
            <div className="font-bold text-white">Trust & Security</div>
            <div>🛡 100% Escrow Protection</div>
            <div>✓ GST Verified Sellers</div>
            <div>© 2026 BESTEAL Technologies Inc.</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

