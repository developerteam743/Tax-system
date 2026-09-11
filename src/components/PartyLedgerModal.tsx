import React from 'react';
import type { Party, LedgerEntry } from '../types/tax';
import { formatCurrency } from '../utils/gst';
import { X, Send } from 'lucide-react';

interface PartyLedgerModalProps {
  party: Party;
  ledgerEntries: LedgerEntry[];
  onClose: () => void;
}

export const PartyLedgerModal: React.FC<PartyLedgerModalProps> = ({ party, ledgerEntries, onClose }) => {
  const isReceivable = party.currentBalance > 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-3xl min-h-screen sm:min-h-0 rounded-none sm:rounded-2xl p-3 sm:p-5 lg:p-6 shadow-2xl space-y-4 sm:space-y-6 sm:my-4 text-slate-800 animate-fadeIn overflow-y-auto max-h-[100dvh] sm:max-h-[calc(100dvh-2rem)]">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 break-words">{party.name}</h3>
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-bold shrink-0">
                {party.stateCode}-{party.state}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-1 break-words">
              GSTIN: <span className="font-mono text-slate-700 font-bold">{party.gstin}</span> • Phone: {party.phone} • Email: {party.email}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close statement" className="shrink-0 w-10 h-10 min-h-10 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-700 flex items-center justify-center cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider block font-bold">Net Account Balance</span>
            <div className={`text-xl sm:text-2xl font-black mt-0.5 break-words ${isReceivable ? 'text-emerald-600' : 'text-amber-600'}`}>
              {formatCurrency(Math.abs(party.currentBalance))}
            </div>
          </div>
          <div className="sm:text-right">
            <span className={`inline-flex text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-xl border break-words ${isReceivable ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
              {isReceivable ? 'RECEIVABLE FROM PARTY' : 'PAYABLE TO SUPPLIER'}
            </span>
          </div>
        </div>

        <div className="space-y-3 min-w-0">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Transaction Vouchers Log</h4>
          <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-xs">
            <table className="w-full min-w-[620px] text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5 sm:p-3">Date</th><th className="p-2.5 sm:p-3">Voucher Type</th><th className="p-2.5 sm:p-3">Voucher #</th><th className="p-2.5 sm:p-3">Debit (₹)</th><th className="p-2.5 sm:p-3">Credit (₹)</th><th className="p-2.5 sm:p-3 text-right">Running Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ledgerEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50">
                    <td className="p-2.5 sm:p-3 font-mono text-slate-500">{entry.date}</td>
                    <td className="p-2.5 sm:p-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">{entry.voucherType}</span></td>
                    <td className="p-2.5 sm:p-3 font-mono font-bold text-slate-900">{entry.voucherNo}</td>
                    <td className="p-2.5 sm:p-3 font-bold text-emerald-600">{entry.debit > 0 ? formatCurrency(entry.debit) : '-'}</td>
                    <td className="p-2.5 sm:p-3 font-bold text-amber-600">{entry.credit > 0 ? formatCurrency(entry.credit) : '-'}</td>
                    <td className="p-2.5 sm:p-3 text-right font-black text-slate-900">{formatCurrency(entry.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 pt-2 border-t border-slate-100">
          <button onClick={() => {
            const text = `Hi ${party.name}, your outstanding bill balance is ${formatCurrency(party.currentBalance)}. Please clear the pending dues. Thank you!`;
            window.open(`https://wa.me/${party.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
          }} className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all cursor-pointer min-h-11">
            <Send className="w-3.5 h-3.5" /> Send WhatsApp Balance Reminder
          </button>
          <button onClick={onClose} className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer min-h-11">Close Statement</button>
        </div>
      </div>
    </div>
  );
};
