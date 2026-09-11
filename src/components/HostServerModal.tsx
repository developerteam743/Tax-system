import React from 'react';
import type { HostServerStatus } from '../types/tax';
import { X, Laptop, ShieldCheck, QrCode } from 'lucide-react';

interface HostServerModalProps {
  status: HostServerStatus;
  onClose: () => void;
}

export const HostServerModal: React.FC<HostServerModalProps> = ({ status, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto overscroll-contain">
      <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-6 text-slate-800 animate-fadeIn my-0 sm:my-8 max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 min-w-0">
            <Laptop className="w-5 h-5 shrink-0 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900 leading-snug">CompuTax Host Node Status</h3>
          </div>
          <button onClick={onClose} aria-label="Close host node controls" className="shrink-0 min-h-10 min-w-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 p-3 sm:p-4 rounded-xl space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-emerald-800">
            <span className="flex items-center gap-1.5 min-w-0"><ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" /> Master Host Node Active</span>
            <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 text-[10px] uppercase font-mono">ONLINE</span>
          </div>
          <p className="text-xs text-emerald-700 leading-relaxed break-words">
            Device: <span className="font-bold">{status.hostDeviceName}</span><br />
            Local Network IP: <span className="font-mono font-bold text-slate-900 break-all">{status.hostIp}</span>
          </p>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-700 block">Mobile Partner Pairing Token</label>
          <div className="flex items-center gap-3 bg-slate-100 p-3 rounded-xl border border-slate-200 font-mono text-sm font-black text-blue-700 min-w-0">
            <span className="min-w-0 flex-1 break-all">{status.syncToken}</span>
            <QrCode className="w-5 h-5 shrink-0 text-slate-500" />
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">Co-founders and partners can scan this QR code or enter token in their mobile app to pair with this PC host node.</p>
        </div>

        <div className="pt-1 sm:pt-2">
          <button onClick={onClose} className="w-full min-h-11 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md cursor-pointer transition-all">Close Node Controls</button>
        </div>
      </div>
    </div>
  );
};
