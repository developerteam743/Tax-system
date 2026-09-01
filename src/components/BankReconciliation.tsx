import React from 'react';
import type { BankTransaction, Party } from '../types/tax';
import { Landmark, CheckCircle2, ArrowDownLeft, ArrowUpRight, Sparkles, Check } from 'lucide-react';

const formatINR = (val: number): string => {
  if (typeof val !== 'number' || isNaN(val)) return '₹0';
  return '₹' + Math.round(val).toLocaleString('en-IN');
};

interface BankReconciliationProps {
  bankTransactions?: BankTransaction[];
  transactions?: BankTransaction[];
  parties?: Party[];
  onApproveReconciliation?: (id: string) => void;
  onManualMatch?: (id: string) => void;
}

export const BankReconciliation: React.FC<BankReconciliationProps> = ({
  bankTransactions,
  transactions,
  parties,
  onApproveReconciliation,
  onManualMatch
}) => {
  const txns = bankTransactions || transactions || [];
  const handleApprove = onApproveReconciliation || onManualMatch || (() => {});

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-md">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Landmark className="w-6 h-6 text-emerald-600" />
            Bank Statement Auto-Reconciliation Engine
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Upload HDFC Bank statement (CSV/Excel) &rarr; AI Fuzzy Matcher algorithm pairs bank narrations against customer/supplier ledgers.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-emerald-700 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-emerald-600" /> Fuzzy Similarity Matcher Active
        </div>
      </div>

      {/* Transactions List Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-800 flex items-center justify-between">
          <span>Unreconciled Statement Lines ({txns.length} Transactions)</span>
          <span className="text-[11px] text-slate-400 font-normal">Auto-matching by UTR &amp; Party Name</span>
        </div>

        <div className="divide-y divide-slate-100">
          {txns.map((bt) => {
            const isCredit = bt.type === 'CREDIT';
            const isReconciled = bt.status === 'RECONCILED';

            return (
              <div
                key={bt.id}
                className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                  isReconciled ? 'bg-emerald-50/30' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-xl border mt-0.5 ${
                      isCredit
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                        : 'bg-red-50 border-red-200 text-red-600'
                    }`}
                  >
                    {isCredit ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="text-xs text-slate-400">{bt.date}</div>
                    <div className="text-sm font-bold text-slate-800 mt-0.5">{bt.narration}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                      <span>UTR: <span className="font-mono">{bt.utr}</span></span>
                      {bt.matchedParty && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold">
                          Matched: {bt.matchedParty}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <div className="text-right">
                    <div
                      className={`text-base font-bold font-mono ${
                        isCredit ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {isCredit ? '+' : '-'}{formatINR(bt.amount)}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase">
                      {bt.type}
                    </div>
                  </div>

                  <div>
                    {isReconciled ? (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" /> Reconciled
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApprove(bt.id)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve Match
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
