import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Seller, Quote } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const SellerPortal: React.FC = () => {
  const { showToast } = useToast();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [walletBalance, setWalletBalance] = useState(1240);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('1000');
  const [isTopUpLoading, setIsTopUpLoading] = useState(false);

  // Active Lead Bidding State
  const [selectedLead, setSelectedLead] = useState<any>({
    id: 'REQ-101',
    title: '1.5 Ton Inverter AC',
    location: 'Koramangala, Bengaluru',
    budget: 35000,
    createdAgo: '2m ago',
    details: 'Daikin or LG 5-Star Rating preferred with installation.',
  });
  const [leadTimer, setLeadCountdown] = useState(45);
  const [leadUnlocked, setLeadUnlocked] = useState(false);

  // Form State
  const [quotePrice, setQuotePrice] = useState('32500');
  const [brandModel, setBrandModel] = useState('Daikin FTKF50TV 1.5T 5★');
  const [warrantyYears, setWarrantyYears] = useState('5');
  const [freeDelivery, setFreeDelivery] = useState(true);
  const [freeInstall, setFreeInstall] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    api.getSellers().then((sList) => {
      if (sList.length > 0) setSeller(sList[0]);
    }).catch(console.error);

    api.getSellerWallet('SEL-001').then((res) => {
      setWalletBalance(res.balance);
    }).catch(console.error);
  }, []);

  // 45s Urgency countdown timer for lead
  useEffect(() => {
    if (leadUnlocked) return;
    const interval = setInterval(() => {
      setLeadCountdown((prev) => (prev <= 1 ? 45 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [leadUnlocked]);

  const handleUnlockLead = async () => {
    if (walletBalance < 9) {
      showToast('error', 'Low Wallet Balance', 'Please top up your wallet to unlock leads.');
      setShowTopUpModal(true);
      return;
    }

    try {
      const res = await api.debitLeadFee(selectedLead.id);
      setWalletBalance(res.balance);
      setLeadUnlocked(true);
      showToast('success', 'Lead Unlocked!', '₹9 lead fee deducted from wallet balance.');
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to unlock lead.');
    }
  };

  const handleTopUpWallet = async () => {
    try {
      setIsTopUpLoading(true);
      const res = await api.rechargeSellerWallet(Number(topUpAmount) || 1000, 'UPI');
      setWalletBalance(res.balance);
      setIsTopUpLoading(false);
      setShowTopUpModal(false);
      showToast('success', 'Wallet Recharged!', `₹${topUpAmount} added to wallet balance.`);
    } catch (err) {
      console.error(err);
      setIsTopUpLoading(false);
    }
  };

  const handleSubmitQuotation = async () => {
    try {
      setIsSubmitting(true);
      const newQuote = await api.submitQuote({
        reqId: selectedLead.id,
        price: Number(quotePrice) || 32500,
        brandModel,
        warranty: warrantyYears,
        freeDelivery,
        installationIncluded: freeInstall,
      });
      setIsSubmitting(false);
      showToast('success', 'Quotation Submitted!', `Quote #${newQuote.id} sent to customer in Koramangala.`);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      showToast('error', 'Failed to submit quote.');
    }
  };

  const analyticsData = [
    { day: 'Mon', quotes: 8, accepted: 5, rev: 18000 },
    { day: 'Tue', quotes: 12, accepted: 9, rev: 32000 },
    { day: 'Wed', quotes: 6, accepted: 4, rev: 21000 },
    { day: 'Thu', quotes: 15, accepted: 11, rev: 44000 },
    { day: 'Fri', quotes: 10, accepted: 7, rev: 38000 },
    { day: 'Sat', quotes: 18, accepted: 14, rev: 56000 },
    { day: 'Sun', quotes: 7, accepted: 5, rev: 27000 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">
      {/* Seller Header & Wallet Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-orange-400 uppercase tracking-widest">VERIFIED MERCHANT WORKSPACE</span>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono">
              Level {seller?.level || 3} Merchant
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-display text-white mt-1">
            {seller?.name || 'Rajan Electronics'}
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">{seller?.biz || 'GST: 29AAAAA0000A1Z5 · Consumer Electronics Outlet'}</p>
        </div>

        {/* Wallet Balance Widget */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center gap-6 shadow-inner w-full md:w-auto justify-between">
          <div>
            <div className="text-[10px] text-slate-400 font-mono font-bold uppercase">Prepaid Lead Wallet</div>
            <div className="text-2xl font-extrabold text-emerald-400 font-mono">₹{walletBalance.toLocaleString('en-IN')}</div>
          </div>
          <button
            onClick={() => setShowTopUpModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-display px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 cursor-pointer"
          >
            + TOP UP WALLET
          </button>
        </div>
      </div>

      {/* 5 Top Seller KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Incoming Leads', val: '12 Fresh', col: 'text-orange-400', sub: 'Koramangala, BLR' },
          { label: 'Unlocked Leads', val: '7 Active', col: 'text-blue-400', sub: '₹9 fee per lead' },
          { label: 'Pending Quotes', val: '3 Submitted', col: 'text-amber-400', sub: 'Awaiting buyer' },
          { label: 'Orders Won', val: '5 Orders', col: 'text-emerald-400', sub: '₹1.24L Revenue' },
          { label: 'Merchant Rating', val: '4.7 ★', col: 'text-yellow-400', sub: '128 Customer Reviews' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1 shadow-lg">
            <div className="text-[10px] text-slate-400 font-mono font-bold uppercase">{kpi.label}</div>
            <div className={`text-xl font-extrabold font-mono ${kpi.col}`}>{kpi.val}</div>
            <div className="text-[10px] text-slate-500">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Two-Column Main Workspace: Bidding Workspace & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Lead Unlocking & Quote Submission Form */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2.5 py-0.5 rounded-full font-mono font-bold">
                ⚡ URGENT MATCHING LEAD
              </span>
              <h2 className="text-xl font-extrabold font-display text-white mt-1">{selectedLead.title}</h2>
              <p className="text-xs text-slate-400 font-mono">Customer Location: {selectedLead.location}</p>
            </div>

            {/* Countdown Clock */}
            <div className="text-right">
              <div className="text-3xl font-extrabold font-mono text-orange-500">{leadTimer}<span className="text-xs text-slate-500">s</span></div>
              <div className="text-[9px] text-slate-400 font-mono uppercase">Bid Window</div>
            </div>
          </div>

          {!leadUnlocked ? (
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-white text-base font-display">Buyer Request Details</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedLead.details}</p>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xl font-bold text-emerald-400">₹{selectedLead.budget.toLocaleString('en-IN')}</div>
                  <div className="text-[10px] text-slate-500 uppercase">Max Budget</div>
                </div>
              </div>

              <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-xl text-xs text-orange-300 space-y-1">
                <div className="font-bold font-mono">⚡ Unlock Customer Details & Submit Quote</div>
                <p>Unlocking costs ₹9 from your prepaid wallet balance. You will get direct bidding access to submit your price, delivery date, and warranty terms.</p>
              </div>

              <button
                onClick={handleUnlockLead}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-2xl font-bold font-display text-sm shadow-xl shadow-emerald-600/25 cursor-pointer transition-all"
              >
                UNLOCK LEAD NOW (₹9 Fee) →
              </button>
            </div>
          ) : (
            /* Unlocked Quote Form */
            <div className="bg-slate-950 p-6 rounded-2xl border border-emerald-500/40 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-xs font-mono font-bold text-emerald-400">✅ LEAD UNLOCKED — SUBMIT QUOTE</span>
                <span className="text-xs text-slate-400 font-mono">Customer Budget: ₹{selectedLead.budget.toLocaleString('en-IN')}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-mono font-bold text-slate-400 uppercase">Your Total Price Quote (₹)</label>
                  <input
                    type="number"
                    value={quotePrice}
                    onChange={(e) => setQuotePrice(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-base font-mono font-bold text-emerald-400 outline-none focus:border-emerald-500"
                  />
                  <div className="text-[10px] text-slate-500">✦ Competitor lowest bid: <strong className="text-amber-400 font-mono">₹30,990</strong></div>
                </div>

                <div className="space-y-1">
                  <label className="font-mono font-bold text-slate-400 uppercase">Model Offered</label>
                  <input
                    type="text"
                    value={brandModel}
                    onChange={(e) => setBrandModel(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-mono font-bold text-slate-400 uppercase">Warranty (Years)</label>
                  <input
                    type="text"
                    value={warrantyYears}
                    onChange={(e) => setWarrantyYears(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-white outline-none"
                  />
                </div>

                <div className="space-y-2 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Free Delivery</span>
                    <button onClick={() => setFreeDelivery(!freeDelivery)} className={`w-10 h-5 rounded-full p-0.5 transition-colors ${freeDelivery ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${freeDelivery ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Free Installation</span>
                    <button onClick={() => setFreeInstall(!freeInstall)} className={`w-10 h-5 rounded-full p-0.5 transition-colors ${freeInstall ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${freeInstall ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmitQuotation}
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-2xl font-bold font-display text-sm shadow-xl shadow-blue-600/25 cursor-pointer transition-all mt-2"
              >
                {isSubmitting ? 'Submitting Quotation...' : 'SUBMIT QUOTATION TO CUSTOMER →'}
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Performance Analytics Charts */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
            <div>
              <h3 className="text-base font-bold font-display text-white">Merchant Bidding Performance</h3>
              <p className="text-xs text-slate-400">Weekly Quotes Submitted vs Orders Won</p>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                  <Bar dataKey="quotes" fill="#3b82f6" name="Quotes" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="accepted" fill="#10b981" name="Orders Won" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
            <div>
              <h3 className="text-base font-bold font-display text-white">Weekly Earnings Trend (₹)</h3>
              <p className="text-xs text-slate-400">Payouts received after customer delivery confirmation</p>
            </div>

            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="rev" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Top-up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md p-6 rounded-3xl shadow-2xl space-y-4 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold font-display">Recharge Merchant Wallet</h3>
                <p className="text-xs text-slate-400">Current Balance: ₹{walletBalance.toLocaleString('en-IN')}</p>
              </div>
              <button onClick={() => setShowTopUpModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-slate-400 uppercase">Top-Up Amount (₹)</label>
              <div className="grid grid-cols-3 gap-2">
                {['500', '1000', '2500'].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setTopUpAmount(amt)}
                    className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                      topUpAmount === amt ? 'border-emerald-500 bg-emerald-950/60 text-emerald-400' : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    + ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleTopUpWallet}
              disabled={isTopUpLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-2xl font-bold font-display text-sm shadow-xl shadow-emerald-600/25 cursor-pointer"
            >
              {isTopUpLoading ? 'Processing Top-Up...' : `PAY ₹${topUpAmount} VIA INSTANT UPI →`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
