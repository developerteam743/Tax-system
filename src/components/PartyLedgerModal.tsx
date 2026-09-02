import React from 'react';
import type { Party, LedgerEntry } from '../types/tax';
import { formatCurrency } from '../utils/gst';
import { X, Send } from 'lucide-react';

interface PartyLedgerModalProps {
  party: Party;
  ledgerEntries: LedgerEntry[];
  onClose: () => void;
}

export const PartyLedgerModal: React.FC<PartyLedgerModalProps> = ({
  party,
  ledgerEntries,
  onClose,
}) => {
  const isReceivable = party.currentBalance > 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-2xl p-6 shadow-2xl space-y-6 my-8 text-slate-800 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">{party.name}</h3>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-bold">
                {party.stateCode}-{party.state}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              GSTIN: <span className="font-mono text-slate-700 font-bold">{party.gstin}</span> • Phone: {party.phone} • Email: {party.email}
            </p>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance Overview */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 uppercase tracking-wider block font-bold">Net Account Balance</span>
            <div className={`text-2xl font-black mt-0.5 ${isReceivable ? 'text-emerald-600' : 'text-amber-600'}`}>
              {formatCurrency(Math.abs(party.currentBalance))}
            </div>
          </div>

          <div className="text-right">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${isReceivable ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
              {isReceivable ? 'RECEIVABLE FROM PARTY' : 'PAYABLE TO SUPPLIER'}
            </span>
          </div>
        </div>

        {/* Ledger Transactions Timeline */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Transaction Vouchers Log</h4>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Voucher Type</th>
                  <th className="p-3">Voucher #</th>
                  <th className="p-3">Debit (₹)</th>
                  <th className="p-3">Credit (₹)</th>
                  <th className="p-3 text-right">Running Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ledgerEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-slate-500">{entry.date}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        {entry.voucherType}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-900">{entry.voucherNo}</td>
                    <td className="p-3 font-bold text-emerald-600">{entry.debit > 0 ? formatCurrency(entry.debit) : '-'}</td>
                    <td className="p-3 font-bold text-amber-600">{entry.credit > 0 ? formatCurrency(entry.credit) : '-'}</td>
                    <td className="p-3 text-right font-black text-slate-900">{formatCurrency(entry.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
          <button
            onClick={() => {
              const text = `Hi ${party.name}, your outstanding bill balance is ${formatCurrency(party.currentBalance)}. Please clear the pending dues. Thank you!`;
              window.open(`https://wa.me/${party.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
            }}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" /> Send WhatsApp Balance Reminder
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
          >
            Close Statement
          </button>
        </div>
      </div>
    </div>
  );
};
