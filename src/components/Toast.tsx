import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'SUCCESS' | 'INFO' | 'WARNING';

export interface ToastMessage { id: string; type: ToastType; title: string; description?: string; }
interface ToastProps { toasts: ToastMessage[]; onDismiss: (id: string) => void; }

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((t) => setTimeout(() => onDismiss(t.id), 3500));
    return () => timers.forEach(clearTimeout);
  }, [toasts, onDismiss]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-2 sm:top-5 left-2 right-2 sm:left-auto sm:right-5 z-[9999] flex flex-col gap-2.5 sm:max-w-md sm:w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'SUCCESS';
        const isWarning = toast.type === 'WARNING';
        return (
          <div key={toast.id} className={`pointer-events-auto flex items-start justify-between gap-2 p-3 sm:p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all animate-bounceIn min-w-0 ${isSuccess ? 'bg-emerald-950/90 border-emerald-500/40 text-white shadow-emerald-900/30' : isWarning ? 'bg-amber-950/90 border-amber-500/40 text-white shadow-amber-900/30' : 'bg-slate-900/90 border-blue-500/40 text-white shadow-blue-900/30'}`}>
            <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
              <div className={`p-1.5 rounded-xl mt-0.5 shrink-0 ${isSuccess ? 'bg-emerald-500/20 text-emerald-400' : isWarning ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                {isSuccess ? <CheckCircle2 className="w-5 h-5" /> : isWarning ? <AlertCircle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
              </div>
              <div className="min-w-0 break-words">
                <div className="text-sm font-bold leading-tight break-words">{toast.title}</div>
                {toast.description && <div className="text-xs text-slate-300 mt-1 leading-relaxed break-words">{toast.description}</div>}
              </div>
            </div>
            <button onClick={() => onDismiss(toast.id)} aria-label="Dismiss notification" className="shrink-0 min-h-10 min-w-10 flex items-center justify-center p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
