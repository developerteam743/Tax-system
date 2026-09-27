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
    <div className="fixed top-3 sm:top-5 left-3 right-3 sm:left-auto sm:right-5 z-[9999] flex flex-col gap-3 sm:max-w-md sm:w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'SUCCESS';
        const isWarning = toast.type === 'WARNING';
        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto relative overflow-hidden flex items-start justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all animate-bounceIn min-w-0 ring-1 ring-white/10 ${isSuccess ? 'bg-slate-950/95 border-emerald-500/30 text-white shadow-emerald-950/20' : isWarning ? 'bg-slate-950/95 border-amber-500/30 text-white shadow-amber-950/20' : 'bg-slate-950/95 border-blue-500/30 text-white shadow-blue-950/20'}`}
          >
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${isSuccess ? 'bg-emerald-500' : isWarning ? 'bg-amber-500' : 'bg-blue-500'}`} />
            <div className="flex items-start gap-3 min-w-0 pl-1">
              <div className={`p-2 rounded-xl mt-0.5 shrink-0 ring-1 ${isSuccess ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-400/20' : isWarning ? 'bg-amber-500/10 text-amber-400 ring-amber-400/20' : 'bg-blue-500/10 text-blue-400 ring-blue-400/20'}`}>
                {isSuccess ? <CheckCircle2 className="w-5 h-5" /> : isWarning ? <AlertCircle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
              </div>
              <div className="min-w-0 break-words pt-0.5">
                <div className="text-sm font-extrabold leading-tight break-words">{toast.title}</div>
                {toast.description && <div className="text-xs text-slate-300 mt-1.5 leading-relaxed break-words">{toast.description}</div>}
              </div>
            </div>
            <button onClick={() => onDismiss(toast.id)} aria-label="Dismiss notification" className="shrink-0 min-h-9 min-w-9 flex items-center justify-center text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};