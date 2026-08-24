import React, { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const Navbar: React.FC = () => {
  const { showToast } = useToast();
  const [backendStatus, setBackendStatus] = useState<{ status: string; service: string }>({
    status: 'checking',
    service: 'Connecting...',
  });

  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; text: string; time: string; read: boolean }>>([
    { id: '1', title: '🏆 Quote Received!', text: 'CoolAir Solutions quoted ₹32,500 for Daikin 1.5T AC.', time: '10m ago', read: false },
    { id: '2', title: '⚡ Urgent Lead Nearby', text: 'Customer in Koramangala requested 55" OLED TV.', time: '25m ago', read: false },
  ]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  useEffect(() => {
    let mounted = true;
    api.getHealth().then((res) => {
      if (mounted) setBackendStatus(res);
    });
    const interval = setInterval(() => {
      api.getHealth().then((res) => {
        if (mounted) setBackendStatus(res);
      });
    }, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast('info', 'Notifications Read', 'All alerts marked as read.');
  };

  const isOnline = backendStatus.status === 'ok';

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 text-white px-4 md:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & Location Pin */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-orange-500 flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/25 text-white group-hover:scale-105 transition-all">
              B
            </div>
            <div>
              <div className="text-2xl font-extrabold tracking-tight font-display">
                BEST<span className="text-orange-500">EAL</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">REVERSE MARKETPLACE</div>
            </div>
          </Link>

          {/* Location Chip */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300">
            <span className="text-red-400">📍</span>
            <span>Bengaluru, IN</span>
            <span className="text-slate-500 text-[10px]">(Koramangala)</span>
          </div>

          {/* Backend Status Chip */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-slate-300">{isOnline ? 'API Connected' : 'Mock Mode'}</span>
            <span className="text-slate-500 text-[10px]">(:5000)</span>
          </div>
        </div>

        {/* URL Endpoint Navigation Links */}
        <nav className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold font-display">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-4 py-2 rounded-xl transition-all cursor-pointer ${
                isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-400 hover:text-white'
              }`
            }
          >
            🛒 Buyer Marketplace
          </NavLink>

          <NavLink
            to="/seller"
            className={({ isActive }) =>
              `px-4 py-2 rounded-xl transition-all cursor-pointer ${
                isActive ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30' : 'text-slate-400 hover:text-white'
              }`
            }
          >
            🏪 Seller Hub
          </NavLink>

          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `px-4 py-2 rounded-xl transition-all cursor-pointer ${
                isActive ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'text-slate-400 hover:text-white'
              }`
            }
          >
            🖥 Enterprise Admin
          </NavLink>
        </nav>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {/* Notification Menu */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer relative"
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 text-xs z-50 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="font-bold text-white font-display">Activity Alerts</span>
                  <button onClick={handleMarkRead} className="text-[10px] text-blue-400 hover:underline">Mark all read</button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className={`p-2.5 rounded-xl border text-xs ${n.read ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-blue-950/40 border-blue-500/30 text-white'}`}>
                      <div className="font-bold font-display">{n.title}</div>
                      <div className="text-[11px] mt-0.5 opacity-90">{n.text}</div>
                      <div className="text-[9px] text-slate-500 mt-1 font-mono">{n.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
