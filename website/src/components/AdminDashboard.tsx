import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Seller, FlaggedQuote, AdminMetrics } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const AdminDashboard: React.FC = () => {
  const { showToast } = useToast();
  const [activeSection, setActiveSection] = useState<'overview' | 'sellers' | 'moderation'>('overview');
  const [metrics, setMetrics] = useState<AdminMetrics>({
    gmv: '₹84.2L',
    revenue: '₹8.42L',
    activeCustomers: 12847,
    activeSellers: 3241,
    conversionRate: '34.8%',
    pendingKYC: 2,
    flaggedQuotes: 2,
  });

  const [sellers, setSellers] = useState<Seller[]>([]);
  const [flaggedQuotes, setFlaggedQuotes] = useState<FlaggedQuote[]>([]);
  const [selectedFlag, setSelectedFlag] = useState<number>(0);
  const [sellerSearch, setSellerSearch] = useState('');
  const [sellerFilter, setSellerFilter] = useState<'all' | 'pending' | 'suspended'>('all');

  useEffect(() => {
    let mounted = true;
    Promise.all([
      api.getAdminMetrics(),
      api.getSellers(),
      api.getFlaggedQuotes(),
    ]).then(([m, s, f]) => {
      if (!mounted) return;
      setMetrics(m);
      setSellers(s);
      setFlaggedQuotes(f);
    }).catch(err => console.error("Admin data load error:", err));

    return () => { mounted = false; };
  }, []);

  const handleSellerAction = async (id: string, action: 'approve' | 'reject' | 'suspend' | 'reinstate') => {
    try {
      const updated = await api.updateSellerStatus(id, action);
      setSellers(prev => prev.map(s => s.id === id ? updated : s));
      showToast('success', `Seller Status Updated`, `${updated.name} set to ${action.toUpperCase()}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleModerate = async (id: string, decision: 'approved' | 'rejected') => {
    try {
      const updated = await api.moderateQuote(id, decision);
      setFlaggedQuotes(prev => prev.map(f => f.id === id ? updated : f));
      showToast(
        decision === 'approved' ? 'info' : 'warning',
        `Quote Moderated`,
        `Quote #${id} ${decision.toUpperCase()} by Admin`
      );
    } catch (err) {
      console.error(err);
    }
  };

  const filteredSellers = sellers.filter((s) => {
    if (sellerFilter === 'pending') return s.kyc === 'pending';
    if (sellerFilter === 'suspended') return s.status === 'suspended';
    return true;
  }).filter((s) =>
    s.name.toLowerCase().includes(sellerSearch.toLowerCase()) ||
    s.biz.toLowerCase().includes(sellerSearch.toLowerCase())
  );

  const gmvTrendData = [
    { day: 'Aug 1', gmv: 420, rev: 42 },
    { day: 'Aug 3', gmv: 580, rev: 58 },
    { day: 'Aug 5', gmv: 390, rev: 39 },
    { day: 'Aug 7', gmv: 710, rev: 71 },
    { day: 'Aug 9', gmv: 850, rev: 85 },
    { day: 'Aug 11', gmv: 760, rev: 76 },
    { day: 'Aug 13', gmv: 920, rev: 92 },
  ];

  const cityDemandData = [
    { city: 'Bengaluru', demand: 1240 },
    { city: 'Mumbai', demand: 980 },
    { city: 'Delhi', demand: 870 },
    { city: 'Hyderabad', demand: 620 },
    { city: 'Chennai', demand: 540 },
    { city: 'Pune', demand: 410 },
  ];

  const categorySplitData = [
    { name: 'AC & Cooling', value: 32 },
    { name: 'Televisions', value: 24 },
    { name: 'Washing Machines', value: 18 },
    { name: 'Refrigerators', value: 16 },
    { name: 'Others', value: 10 },
  ];

  const categoryColors = ['#1B3FD8', '#10B981', '#F97316', '#8B5CF6', '#64748B'];
  const currentFlag = flaggedQuotes[selectedFlag] || flaggedQuotes[0];

  return (
    <div className="flex min-h-[calc(100vh-73px)] bg-slate-950 text-slate-100 font-sans overflow-hidden">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 p-4">
        <div className="space-y-6">
          <div className="px-2">
            <div className="text-xs font-mono font-bold text-blue-500 uppercase tracking-widest">
              ENTERPRISE PANEL
            </div>
            <div className="text-xl font-extrabold font-display text-white mt-1">
              BEST<span className="text-orange-500">EAL</span> ADMIN
            </div>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'overview', icon: '▦', label: 'Main Dashboard' },
              { id: 'sellers', icon: '🏪', label: 'Seller Management', count: metrics.pendingKYC },
              { id: 'moderation', icon: '⊘', label: 'AI Quote Moderation', count: metrics.flaggedQuotes },
            ].map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold font-display transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 text-xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center font-mono">
            PN
          </div>
          <div>
            <div className="font-bold text-white">Priya Nair</div>
            <div className="text-[10px] text-slate-400">Super Administrator</div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
        {activeSection === 'overview' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold font-display text-white">Platform Overview</h1>
              <p className="text-xs text-slate-400 mt-1">Real-time GMV, Revenue, Seller Activity & Conversion Metrics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { label: 'Gross Merch. Value (GMV)', val: metrics.gmv, sub: '+18.4% vs last mo', color: 'text-blue-400', icon: '💰' },
                { label: 'Platform Revenue (10%)', val: metrics.revenue, sub: '₹8.42L Net Profit', color: 'text-emerald-400', icon: '📈' },
                { label: 'Active Customers', val: metrics.activeCustomers.toLocaleString(), sub: '+342 new today', color: 'text-orange-400', icon: '👥' },
                { label: 'Active Sellers', val: metrics.activeSellers.toLocaleString(), sub: '847 Cities covered', color: 'text-purple-400', icon: '🏪' },
                { label: 'Order Conversion Rate', val: metrics.conversionRate, sub: 'Target 35% achieved', color: 'text-amber-400', icon: '🎯' },
              ].map((kpi) => (
                <div key={kpi.label} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2 shadow-lg">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-mono font-bold uppercase">{kpi.label}</span>
                    <span className="text-lg">{kpi.icon}</span>
                  </div>
                  <div className={`text-2xl font-extrabold font-mono ${kpi.color}`}>{kpi.val}</div>
                  <div className="text-[11px] text-slate-400 font-medium">{kpi.sub}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-bold font-display text-white">Gross Merchandise Value & Revenue</h3>
                    <p className="text-xs text-slate-400">Daily GMV (₹ Thousands) vs Platform Take Rate</p>
                  </div>
                  <span className="text-xs font-mono text-blue-400 font-bold bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                    August 2026
                  </span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={gmvTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v}k`} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                      <Area type="monotone" dataKey="gmv" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} name="GMV (₹k)" />
                      <Area type="monotone" dataKey="rev" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="Platform Revenue (₹k)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
                <div>
                  <h3 className="text-base font-bold font-display text-white">Demand Category Split</h3>
                  <p className="text-xs text-slate-400">Share of customer requirements</p>
                </div>

                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categorySplitData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                        {categorySplitData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-1.5 text-xs">
                  {categorySplitData.map((cat, idx) => (
                    <div key={cat.name} className="flex justify-between items-center text-slate-300">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: categoryColors[idx] }} />
                        <span>{cat.name}</span>
                      </div>
                      <span className="font-mono font-bold text-white">{cat.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'sellers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold font-display text-white">Seller Management</h1>
                <p className="text-xs text-slate-400 mt-1">Manage KYC status, levels, and merchant account suspensions</p>
              </div>
              <input
                type="text"
                placeholder="Search sellers..."
                value={sellerSearch}
                onChange={(e) => setSellerSearch(e.target.value)}
                className="bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs text-white outline-none font-mono"
              />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 font-mono text-slate-400 font-bold uppercase">
                  <tr>
                    <th className="p-4">Seller ID / Name</th>
                    <th className="p-4">Business</th>
                    <th className="p-4">KYC Status</th>
                    <th className="p-4">Level</th>
                    <th className="p-4">Revenue</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredSellers.map((s) => (
                    <tr key={s.id}>
                      <td className="p-4">
                        <div className="font-bold text-white font-display text-sm">{s.name}</div>
                        <div className="text-[11px] font-mono text-slate-500">{s.id} · {s.city}</div>
                      </td>
                      <td className="p-4 text-slate-400 font-mono">{s.biz}</td>
                      <td className="p-4 font-bold">{s.kyc}</td>
                      <td className="p-4 font-mono font-bold text-purple-400">Lvl {s.level}</td>
                      <td className="p-4 font-mono font-bold text-emerald-400">{s.revenue}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {s.kyc === 'pending' && (
                            <button onClick={() => handleSellerAction(s.id, 'approve')} className="bg-emerald-600 text-white px-3 py-1 rounded-lg font-bold text-[11px] cursor-pointer">Approve</button>
                          )}
                          {s.status === 'active' && (
                            <button onClick={() => handleSellerAction(s.id, 'suspend')} className="bg-orange-600/20 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-lg font-bold text-[11px] cursor-pointer">Suspend</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === 'moderation' && currentFlag && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold font-display text-white">AI Quote Moderation</h1>
              <p className="text-xs text-slate-400 mt-1">Review seller quote contact leaks detected by AI OCR</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold font-display text-white">{currentFlag.product}</h3>
                  <p className="text-xs text-slate-400 font-mono">Seller: {currentFlag.seller}</p>
                </div>
                <div className="text-lg font-bold text-emerald-400 font-mono">{currentFlag.price}</div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl font-mono text-xs text-slate-300 border border-slate-800">
                {currentFlag.submittedText}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button onClick={() => handleModerate(currentFlag.id, 'rejected')} className="bg-red-600 text-white px-5 py-2 rounded-xl font-bold text-xs cursor-pointer">
                  REJECT QUOTE
                </button>
                <button onClick={() => handleModerate(currentFlag.id, 'approved')} className="bg-emerald-600 text-white px-5 py-2 rounded-xl font-bold text-xs cursor-pointer">
                  APPROVE QUOTE
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
