import React from 'react';
import { CheckCircle2, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  title: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none font-sans">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto p-4 rounded-2xl shadow-xl border border-[#E5E1DA] bg-white text-[#1A1A1A] flex items-start gap-3 backdrop-blur-md transition-all transform translate-y-0"
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-[#8C7A65] shrink-0 mt-0.5" />
          ) : (
            <Info className="w-5 h-5 text-[#8C7A65] shrink-0 mt-0.5" />
          )}

          <div className="flex-1 min-w-0">
            <h5 className="font-serif font-bold text-xs sm:text-sm text-[#1A1A1A]">{toast.title}</h5>
            <p className="text-xs text-[#736B63] mt-0.5 leading-relaxed">{toast.message}</p>
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="text-[#736B63] hover:text-[#1A1A1A] p-1 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
