import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Seller } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

type STab = 'dash' | 'lead' | 'form' | 'analytics';

export const SellerMobileApp: React.FC = () => {
  const { sellerWalletBalance, refreshWallet } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<STab>('dash');
  const [sellerStats, setSellerStats] = useState<Seller | null>(null);

  // Urgent Lead Countdown Timer State
  const [leadCountdown, setLeadCountdown] = useState(45);
  const [leadAccepted, setLeadAccepted] = useState(false);

  // Quote Submission Form State
  const [quotePrice, setQuotePrice] = useState('32500');
  const [brandModel, setBrandModel] = useState('Daikin FTKF50TV 1.5T 5★');
  const [warrantyYears, setWarrantyYears] = useState('5');
  const [freeDelivery, setFreeDelivery] = useState(true);
  const [installationIncluded, setInstallationIncluded] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    api.getSellers().then((sList) => {
      if (mounted && sList.length > 0) setSellerStats(sList[0]);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (activeTab !== 'lead' || leadAccepted) return;
    const interval = setInterval(() => {
      setLeadCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setActiveTab('dash');
          return 45;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTab, leadAccepted]);

  const handleAcceptLead = async () => {
    if (sellerWalletBalance < 9) {
      showToast('error', 'Insufficient Wallet Balance!', 'Please top up your wallet.');
      return;
    }

    try {
      await api.debitLeadFee('REQ-101');
      refreshWallet();
      setLeadAccepted(true);
      showToast('success', 'Lead Unlocked!', '₹9 fee deducted from wallet balance.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitQuote = async () => {
    try {
      setIsSubmitting(true);
      const res = await api.submitQuote({
        reqId: 'REQ-101',
        price: Number(quotePrice) || 32500,
        brandModel,
        warranty: warrantyYears,
        freeDelivery,
        installationIncluded,
      });
      setIsSubmitting(false);
      showToast('success', 'Quotation Submitted!', `Quote #${res.id} sent via shared backend.`);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
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
    <div className="flex flex-col h-full bg-slate-950 text-white font-sans select-none overflow-hidden">
      {/* Phone Status Bar */}
      <div className="bg-slate-900 text-slate-300 px-5 pt-3 pb-1 flex items-center justify-between text-xs font-mono shrink-0">
        <span className="font-bold">9:41</span>
        <div className="flex items-center gap-1.5 opacity-90 text-[11px]">
          <span>SELLER PRO</span>
          <span>🔋 99%</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4">
        {/* DASHBOARD */}
        {activeTab === 'dash' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-4 rounded-2xl border border-slate-800 shadow-lg space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs text-orange-400 font-bold uppercase tracking-wider font-mono">SELLER WORKSPACE</div>
                  <h1 className="text-lg font-bold font-display text-white mt-0.5">{sellerStats?.name || 'Rajan Electronics'}</h1>
                  <span className="inline-block mt-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    ● Level {sellerStats?.level || 3} Verified Merchant
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-xl font-extrabold text-emerald-400 font-mono">{sellerStats?.revenue || '₹1.24L'}</div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase">THIS MONTH</div>
                </div>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-5 gap-1 pt-3 border-t border-slate-800">
                {[
                  { label: 'New Leads', val: '12', col: 'text-orange-400' },
                  { label: 'Accepted', val: '7', col: 'text-blue-400' },
                  { label: 'Pending', val: '3', col: 'text-amber-400' },
                  { label: 'Orders', val: '5', col: 'text-emerald-400' },
                  { label: 'Revenue', val: '₹1.24L', col: 'text-emerald-400' },
                ].map((k) => (
                  <div key={k.label} className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/50 text-center">
                    <div className={`text-sm font-extrabold font-mono ${k.col}`}>{k.val}</div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tight mt-0.5 leading-tight">{k.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Wallet Balance Badge */}
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex justify-between items-center text-xs">
              <span className="text-slate-400">Wallet Balance: <strong className="text-emerald-400 font-mono">₹{sellerWalletBalance.toLocaleString('en-IN')}</strong></span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded-md font-mono">Lead Fee: ₹9/lead</span>
            </div>

            {/* Urgent Lead Banner */}
            <button
              onClick={() => { setLeadCountdown(45); setLeadAccepted(false); setActiveTab('lead'); }}
              className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:brightness-110 active:scale-[0.98] text-white p-4 rounded-2xl shadow-xl shadow-orange-500/20 border border-orange-400/40 text-left flex items-center justify-between cursor-pointer transition-all"
            >
              <div>
                <div className="text-xs font-extrabold tracking-wider uppercase font-mono text-amber-100 flex items-center gap-1">
                  <span>⚡ URGENT LEAD RECEIVED</span>
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                </div>
                <div className="text-sm font-bold font-display text-white mt-1">
                  1.5T Inverter AC · Koramangala · Budget ₹35,000
                </div>
              </div>
              <span className="bg-white/20 px-3 py-1.5 rounded-xl font-bold text-xs font-mono">ACCEPT →</span>
            </button>

            {/* Lead Feed */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-display px-1">Customer Leads Feed</div>
              {[
                { p: '1.5T Inverter AC', area: 'Indiranagar', b: '₹35,000', ago: '2m ago', hot: true },
                { p: '55" 4K OLED Smart TV', area: 'HSR Layout', b: '₹70,000', ago: '15m ago', hot: false },
                { p: 'Front Load Washing Machine', area: 'Whitefield', b: '₹28,000', ago: '1h ago', hot: false },
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => { setLeadCountdown(45); setLeadAccepted(false); setActiveTab('lead'); }}
                  className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700 transition-all"
                >
                  <div>
                    <div className="text-xs font-bold text-white font-display flex items-center gap-2">
                      {item.p}
                      {item.hot && <span className="bg-orange-500/20 text-orange-400 text-[9px] px-1.5 py-0.2 rounded font-mono border border-orange-500/30">HOT</span>}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">📍 {item.area} · Budget {item.b}</div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{item.ago}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* URGENT LEAD MODAL */}
        {activeTab === 'lead' && (
          <div className="p-2 h-full flex flex-col justify-between bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            <div className="text-center pt-2">
              <div className="text-xs font-extrabold text-orange-400 uppercase tracking-widest font-mono">⚡ URGENT MATCHING LEAD</div>
              <div className="text-6xl font-extrabold font-mono text-orange-500 my-2 tracking-tight">{leadCountdown}<span className="text-2xl text-slate-500 ml-1">s</span></div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-full transition-all duration-1000" style={{ width: `${(leadCountdown / 45) * 100}%` }} />
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3 my-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-base font-bold font-display text-white">1.5 Ton Inverter AC</h2>
                  <p className="text-xs text-slate-400">Daikin / LG 5★ rating preferred</p>
                </div>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">HIGH INTENT</span>
              </div>

              <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
                <div className="flex justify-between"><span className="text-slate-400">📍 Delivery Area:</span><span className="font-bold text-slate-200">Koramangala, Bengaluru</span></div>
                <div className="flex justify-between"><span className="text-slate-400">💰 Max Budget Limit:</span><span className="font-bold text-emerald-400 font-mono">₹35,000</span></div>
                <div className="flex justify-between"><span className="text-slate-400">🚚 Delivery Needed:</span><span className="font-bold text-slate-200">Within 24-48 Hours</span></div>
                <div className="flex justify-between"><span className="text-slate-400">👥 Sellers Bidding:</span><span className="font-bold text-amber-400 font-mono">4 Sellers Bidding</span></div>
              </div>
            </div>

            {!leadAccepted ? (
              <div className="space-y-2 pb-2">
                <button onClick={handleAcceptLead} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-2xl font-bold font-display text-base shadow-lg shadow-emerald-600/30 cursor-pointer">
                  ACCEPT LEAD (₹9 Fee)
                </button>
                <button onClick={() => setActiveTab('dash')} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-400 py-3 rounded-2xl font-bold font-display text-xs cursor-pointer">
                  SKIP THIS LEAD
                </button>
              </div>
            ) : (
              <div className="bg-emerald-900/40 border border-emerald-500/50 p-4 rounded-2xl text-center space-y-3">
                <div className="text-2xl">✅</div>
                <div className="text-sm font-bold text-emerald-400">Lead Unlocked Successfully!</div>
                <p className="text-xs text-slate-300">₹9 lead fee deducted. Fill your quotation now to compete for this order.</p>
                <button onClick={handleGoToForm} className="w-full bg-emerald-500 text-slate-950 py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer">
                  FILL QUOTATION FORM NOW →
                </button>
              </div>
            )}
          </div>
        )}

        {/* QUOTATION FORM */}
        {activeTab === 'form' && (
          <div className="space-y-4">
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div className="text-xs text-orange-400 font-bold uppercase tracking-wider font-mono">QUOTATION SUBMISSION</div>
              <h2 className="text-base font-bold font-display text-white mt-0.5">Quote for 1.5T Inverter AC</h2>
              <p className="text-xs text-slate-400">Koramangala · Customer Budget: ₹35,000</p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Your Total Price Quote (₹)</label>
                <input
                  type="number"
                  value={quotePrice}
                  onChange={(e) => setQuotePrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-lg font-mono font-bold text-emerald-400 outline-none focus:border-emerald-500"
                />
                <div className="text-[10px] text-slate-400">✦ Lowest competitor bid: <strong className="text-amber-400 font-mono">₹30,990</strong></div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Exact Model Offered</label>
                <input
                  type="text"
                  value={brandModel}
                  onChange={(e) => setBrandModel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-medium text-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Warranty Period (Years)</label>
                <input
                  type="text"
                  value={warrantyYears}
                  onChange={(e) => setWarrantyYears(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-medium text-white outline-none"
                />
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Free Delivery Included</span>
                  <button onClick={() => setFreeDelivery(!freeDelivery)} className={`w-12 h-6 rounded-full p-1 transition-colors ${freeDelivery ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${freeDelivery ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Free Installation Included</span>
                  <button onClick={() => setInstallationIncluded(!installationIncluded)} className={`w-12 h-6 rounded-full p-1 transition-colors ${installationIncluded ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${installationIncluded ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>

            <button onClick={handleSubmitQuote} disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-2xl font-bold font-display text-sm shadow-lg shadow-blue-600/30 cursor-pointer">
              {isSubmitting ? 'Submitting...' : 'SUBMIT QUOTATION TO CUSTOMER →'}
            </button>
          </div>
        )}

        {/* PERFORMANCE ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-4">
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div className="text-xs text-blue-400 font-bold uppercase font-mono">PERFORMANCE METRICS</div>
              <h2 className="text-base font-bold font-display text-white mt-0.5">Seller Rating & Speed</h2>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Quote Rank', val: '#2 / 6', col: 'text-blue-400', sub: 'Top 33% in Bengaluru' },
                { label: 'Price vs Market', val: '−4.2%', col: 'text-emerald-400', sub: 'Highly Competitive' },
                { label: 'Avg Response', val: '3.2 min', col: 'text-amber-400', sub: 'Top 15% Fast Sellers' },
                { label: 'Customer Rating', val: '4.7 ★', col: 'text-yellow-400', sub: '128 Reviews' },
              ].map((m) => (
                <div key={m.label} className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase font-mono">{m.label}</div>
                  <div className={`text-xl font-extrabold font-mono mt-1 ${m.col}`}>{m.val}</div>
                  <div className="text-[10px] text-slate-500 mt-1">{m.sub}</div>
                </div>
              ))}
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-300 font-display">Weekly Bids vs Accepted</div>
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                    <Bar dataKey="quotes" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="accepted" fill="#10b981" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>

      <nav className="bg-slate-900 border-t border-slate-800 px-2 py-2 flex items-center justify-around shrink-0">
        {[
          { id: 'dash', icon: '⊞', label: 'Dashboard' },
          { id: 'lead', icon: '⚡', label: 'Leads' },
          { id: 'form', icon: '◈', label: 'Quote' },
          { id: 'analytics', icon: '◉', label: 'Analytics' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as STab)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all cursor-pointer ${activeTab === tab.id ? 'text-orange-400 font-bold' : 'text-slate-500'}`}
          >
            <span className="text-lg leading-none">{tab.icon}</span>
            <span className="text-[10px] font-display font-semibold uppercase">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
