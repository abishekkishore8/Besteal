import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Requirement, Quote } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const CustomerPortal: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [postTitle, setPostTitle] = useState('I need a 1.5-ton Inverter AC under ₹35,000');
  const [postBudget, setPostBudget] = useState('35000');
  const [selectedCategory, setSelectedCategory] = useState('AC & Cooling');
  const [selectedBrand, setSelectedBrand] = useState('Daikin');
  const [isPosting, setIsPosting] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    Promise.all([
      api.getRequirements(),
      api.getQuotes('REQ-101'),
    ]).then(([reqs, qts]) => {
      setRequirements(reqs);
      setQuotes(qts);
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
      setPostTitle('');
      setIsPosting(false);
      showToast('success', 'Requirement Broadcasted!', '800+ Verified local merchants in Bengaluru notified.');
      navigate(`/requirements/${newReq.id}`);
    } catch (err) {
      console.error(err);
      setIsPosting(false);
    }
  };

  const filteredRequirements = requirements.filter((r) => {
    if (categoryFilter === 'All') return true;
    return r.category.toLowerCase().includes(categoryFilter.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-12">
      {/* Live Market Ticker */}
      <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl text-xs font-mono text-slate-300 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-bold text-white font-display">LIVE MARKETPLACE STREAM:</span>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <div><span className="text-slate-500">Gross Vol:</span> <strong className="text-blue-400">₹84.2L</strong></div>
          <div><span className="text-slate-500">Postings:</span> <strong className="text-orange-400">12,847</strong></div>
          <div><span className="text-slate-500">Local Merchants:</span> <strong className="text-purple-400">3,241 Verified</strong></div>
        </div>
      </div>

      {/* Hero Requirement Builder */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-950 border border-slate-800/80 p-8 md:p-12 shadow-2xl text-white">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          <div className="lg:col-span-7 space-y-5">
            <span className="inline-block bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full font-mono text-xs font-bold uppercase tracking-wider">
              ⚡ AI Reverse Shopping Marketplace
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold font-display leading-tight">
              Stop searching for deals. Let local sellers <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">bid for your order</span>.
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Post what you need in plain English. Local verified merchants bid with their best price, warranty, and same-day delivery.
            </p>
          </div>

          {/* Interactive Requirement Form */}
          <div className="lg:col-span-5 bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="font-bold font-display text-white text-base">✦ Broadcast Requirement</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-mono font-bold">
                Live
              </span>
            </div>

            <div className="space-y-3">
              <textarea
                rows={2}
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder="What do you want to buy?"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white outline-none focus:border-blue-500 font-medium resize-none"
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={postBudget}
                  onChange={(e) => setPostBudget(e.target.value)}
                  placeholder="Budget (₹)"
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-400 outline-none"
                />
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-white outline-none"
                >
                  <option value="Daikin">Daikin</option>
                  <option value="LG">LG</option>
                  <option value="Voltas">Voltas</option>
                  <option value="Sony">Sony</option>
                </select>
              </div>
            </div>

            <button
              onClick={handlePost}
              disabled={isPosting}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 text-white py-3.5 rounded-2xl font-bold font-display text-sm shadow-xl shadow-orange-500/25 cursor-pointer transition-all"
            >
              {isPosting ? 'Broadcasting...' : 'BROADCAST TO SELLERS →'}
            </button>
          </div>
        </div>
      </section>

      {/* Postings Grid */}
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-white">Active Buyer Postings</h2>
            <p className="text-xs text-slate-400">Click any posting endpoint to view merchant bids and warranty terms.</p>
          </div>
          <div className="flex gap-2">
            {['All', 'AC & Cooling', 'Televisions'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  categoryFilter === cat ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequirements.map((req) => (
            <Link
              key={req.id}
              to={`/requirements/${req.id}`}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-6 rounded-3xl space-y-4 hover:-translate-y-1 transition-all shadow-xl block"
            >
              <div className="flex justify-between items-start">
                <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  {req.category}
                </span>
                <span className="text-xs font-mono text-slate-400">{req.createdAgo}</span>
              </div>

              <div>
                <h3 className="font-bold font-display text-white text-lg">{req.title}</h3>
                <p className="text-xs text-slate-400 font-mono mt-1">📍 {req.location}</p>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-800/80">
                <div>
                  <div className="text-[10px] text-slate-500 font-mono uppercase">Target Budget</div>
                  <div className="text-xl font-extrabold font-mono text-emerald-400">₹{req.budget.toLocaleString('en-IN')}</div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-extrabold font-mono text-blue-400">{req.quotesCount}</div>
                  <div className="text-[10px] text-slate-500 font-mono uppercase">Quotes Received</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
