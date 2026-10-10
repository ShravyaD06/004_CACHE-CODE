import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, FileText, AlertTriangle, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
  autoDismiss?: boolean;
  duration?: number;
}

interface ToastContextType {
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type, title, message, autoDismiss = true, duration = 3500 }: Omit<ToastMessage, 'id'>) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newToast: ToastMessage = { id, type, title, message, autoDismiss, duration };

      setToasts((prev) => {
        // Avoid duplicate identical titles within 2 seconds
        if (prev.some((t) => t.title === title)) return prev;
        return [newToast, ...prev].slice(0, 5); // limit max 5 visible toasts
      });

      if (autoDismiss && type !== 'error') {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div
        role="region"
        aria-label="Notifications"
        className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-white border rounded-xl p-3.5 shadow-lg flex items-start gap-3 transition-all duration-300 animate-in fade-in slide-in-from-top-3 ${
              toast.type === 'error'
                ? 'border-[#FCE8E6] bg-[#FFF9F9]'
                : toast.type === 'warning'
                ? 'border-[#FEF7E0] bg-[#FFFDF5]'
                : 'border-[#E4E7E1]'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#246B57] shrink-0 mt-0.5" />}
            {toast.type === 'info' && <FileText className="w-5 h-5 text-[#246B57] shrink-0 mt-0.5" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-[#B06000] shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-[#C5221F] shrink-0 mt-0.5" />}

            <div className="flex-1 min-w-0 pr-1">
              <p className="text-xs font-bold text-[#202622] leading-snug">{toast.title}</p>
              {toast.message && <p className="text-[11px] text-[#69716B] mt-0.5 leading-normal">{toast.message}</p>}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-md text-[#69716B] hover:text-[#202622] hover:bg-[#F7F7F4] transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
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
