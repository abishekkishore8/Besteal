import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (type: ToastMessage['type'], title: string, message?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: ToastMessage['type'], title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            className={`pointer-events-auto p-3.5 rounded-2xl shadow-2xl border text-xs flex items-start gap-3 backdrop-blur-md cursor-pointer transition-all ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-100 border-emerald-500/40 shadow-emerald-950/50'
                : toast.type === 'error'
                ? 'bg-red-950/90 text-red-100 border-red-500/40 shadow-red-950/50'
                : toast.type === 'warning'
                ? 'bg-amber-950/90 text-amber-100 border-amber-500/40 shadow-amber-950/50'
                : 'bg-blue-950/90 text-blue-100 border-blue-500/40 shadow-blue-950/50'
            }`}
          >
            <div className="text-base shrink-0 font-mono">
              {toast.type === 'success' && '✅'}
              {toast.type === 'error' && '✗'}
              {toast.type === 'warning' && '⚡'}
              {toast.type === 'info' && '✦'}
            </div>
            <div className="flex-1">
              <div className="font-bold font-display">{toast.title}</div>
              {toast.message && <div className="text-[11px] opacity-80 mt-0.5">{toast.message}</div>}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
