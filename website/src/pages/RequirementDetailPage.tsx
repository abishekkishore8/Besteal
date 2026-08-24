import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Requirement, Quote } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const RequirementDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [reqItem, setReqItem] = useState<Requirement | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [sortOption, setSortOption] = useState<'ai' | 'price' | 'rating'>('ai');

  useEffect(() => {
    if (!id) return;
    api.getRequirementById(id).then(setReqItem).catch(console.error);
    api.getQuotes(id).then(setQuotes).catch(console.error);
  }, [id]);

  const sortedQuotes = [...quotes].sort((a, b) => {
    if (sortOption === 'price') return a.price - b.price;
    if (sortOption === 'rating') return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Back Link */}
      <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
        <Link to="/" className="hover:text-white">← Back to Marketplace</Link>
        <span>/</span>
        <span className="text-slate-200">Requirement #{id}</span>
      </div>

      {reqItem ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Requirement Specs */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex justify-between items-start">
              <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-mono font-bold">
                {reqItem.category}
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase">{reqItem.status}</span>
            </div>

            <div>
              <h1 className="text-2xl font-extrabold font-display text-white">{reqItem.title}</h1>
              <p className="text-xs text-slate-400 font-mono mt-1">📍 {reqItem.location} · Posted {reqItem.createdAgo}</p>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs space-y-2">
              <div className="text-slate-500 uppercase">Target Budget Limit</div>
              <div className="text-2xl font-extrabold text-emerald-400">₹{reqItem.budget.toLocaleString('en-IN')}</div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-300 font-display">Specification Filters:</div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(reqItem.answers || {}).map(([k, v]) => (
                  <span key={k} className="bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-xl font-mono">
                    {k}: {v}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Quotes Bidding Matrix */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold font-display text-white">Merchant Quotes Stream</h2>
                <p className="text-xs text-slate-400 font-mono">{quotes.length} verified sellers submitted live quotations</p>
              </div>

              {/* Sort Pills */}
              <div className="flex gap-2">
                {[
                  { id: 'ai', label: '🏆 AI Ranked' },
                  { id: 'price', label: '💰 Lowest Price' },
                  { id: 'rating', label: '⭐ Top Rated' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSortOption(s.id as any)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      sortOption === s.id ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quotes Grid */}
            <div className="space-y-4">
              {sortedQuotes.map((q) => (
                <div
                  key={q.id}
                  className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all relative space-y-3"
                >
                  {q.badge && (
                    <span className="absolute -top-2.5 left-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full shadow">
                      {q.badge}
                    </span>
                  )}

                  <div className="flex justify-between items-start pt-1">
                    <div>
                      <h3 className="font-bold font-display text-white text-base">{q.sellerName}</h3>
                      <div className="text-xs text-amber-400 font-mono mt-0.5">★ {q.rating} Merchant Rating · GST Verified</div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-extrabold font-mono text-emerald-400">₹{q.price.toLocaleString('en-IN')}</div>
                      <div className="text-[10px] text-slate-500 font-mono uppercase">INCL. TAXES & DISCOUNTS</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs font-mono">
                    <div><span className="text-slate-500">Delivery:</span> <span className="text-slate-200 font-bold">{q.delivery}</span></div>
                    <div><span className="text-slate-500">Warranty:</span> <span className="text-slate-200 font-bold">{q.warranty}</span></div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div className="flex gap-3 text-emerald-400 text-xs font-mono">
                      {q.freeDelivery && <span>✓ Free Delivery</span>}
                      {q.installationIncluded && <span>✓ Free Install</span>}
                    </div>

                    <button
                      onClick={() => navigate(`/checkout/${q.id}`)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl font-bold font-display text-xs cursor-pointer shadow-lg shadow-emerald-600/20"
                    >
                      PROCEED TO CHECKOUT (10% Escrow) →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500 font-mono">Loading requirement details...</div>
      )}
    </div>
  );
};
