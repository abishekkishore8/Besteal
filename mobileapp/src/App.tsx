import { useState } from 'react';
import { MobileAppRole } from './types';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CustomerMobileApp } from './components/CustomerMobileApp';
import { SellerMobileApp } from './components/SellerMobileApp';

function AppShell() {
  const { role, setRole } = useAuth();

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-2">
      {/* Top App Role Switcher Bar */}
      <div className="w-full max-w-sm flex items-center justify-between bg-slate-900 border border-slate-800 p-2 rounded-2xl mb-3 shadow-lg text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 to-orange-500 flex items-center justify-center font-bold text-white text-xs">
            B
          </div>
          <span className="font-bold font-display tracking-tight text-white">BESTEAL Mobile</span>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setRole('customer')}
            className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              role === 'customer' ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            Buyer
          </button>
          <button
            onClick={() => setRole('seller')}
            className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              role === 'seller' ? 'bg-orange-500 text-white' : 'text-slate-400'
            }`}
          >
            Seller
          </button>
        </div>
      </div>

      {/* Mobile App Device Frame Container */}
      <div className="w-full max-w-[385px] h-[780px] bg-slate-950 rounded-[48px] p-2.5 shadow-2xl border-[3px] border-slate-800 relative overflow-hidden">
        {/* Dynamic Island */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-50 w-28 h-7 bg-black rounded-full flex items-center justify-between px-3">
          <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-800" />
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-950/80 border border-indigo-800/50" />
        </div>

        <div className="w-full h-full rounded-[40px] overflow-hidden bg-slate-900 flex flex-col relative">
          {role === 'customer' ? <CustomerMobileApp /> : <SellerMobileApp />}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </ToastProvider>
  );
}
