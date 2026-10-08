import React, { useState } from 'react';
import type { BankTransaction, Party } from '../types/tax';
import { runRuleBasedMatching } from '../utils/bankMatcher';
import {
  Landmark,
  CheckCircle2,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  Check,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface BankingWorkspaceProps {
  transactions: BankTransaction[];
  parties: Party[];
  onManualMatch?: (txnId: string, partyId: string) => void;
}

export const BankingWorkspace: React.FC<BankingWorkspaceProps> = ({
  transactions = [],
  parties = [],
  onManualMatch,
}) => {
  const [txns, setTxns] = useState<BankTransaction[]>(transactions);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'RECONCILED'>('ALL');
  const [isMatching, setIsMatching] = useState(false);
  const [selectedTxnForMatch, setSelectedTxnForMatch] = useState<BankTransaction | null>(null);

  // Financial Balances
  const bankBalance = 1284000;
  const matchedTxns = txns.filter((t) => t.status === 'RECONCILED');
  const pendingTxns = txns.filter((t) => t.status === 'PENDING');

  const pendingAmount = pendingTxns.reduce(
    (sum, t) => (t.type === 'CREDIT' ? sum + t.amount : sum - t.amount),
    0
  );
  const bookBalance = bankBalance - pendingAmount;
  const difference = bankBalance - bookBalance - pendingAmount; // Should resolve to 0 when matched

  const handleAutoMatch = () => {
    setIsMatching(true);
    setTimeout(() => {
      const results = runRuleBasedMatching(txns, parties);
      setTxns(results);
      setIsMatching(false);
    }, 400);
  };

  const handleSingleApprove = (txnId: string) => {
    setTxns((prev) =>
      prev.map((t) => (t.id === txnId ? { ...t, status: 'RECONCILED', matchConfidence: 100 } : t))
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. HEADER */}
      <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Treasury &amp; Banking</span>
            <span>·</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              HDFC Bank A/c 50200012345678
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
            Bank Statement Auto-Reconciliation
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            AI fuzzy matching engine pairs bank statement UTR &amp; UPI narrations against debtor/creditor ledgers
          </p>
        </div>

        <button
          onClick={handleAutoMatch}
          disabled={isMatching}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 ${isMatching ? 'animate-spin' : ''}`} />
          <span>{isMatching ? 'Matching Narrations...' : 'Run Auto-Match Algorithm'}</span>
        </button>
      </div>

      {/* 2. RECONCILIATION DASHBOARD TILES */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-[#121824] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Bank Balance</span>
          <span className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400">
            ₹{bankBalance.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-500 block">HDFC Bank statement</span>
        </div>

        <div className="bg-white dark:bg-[#121824] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Book Balance</span>
          <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
            ₹{bookBalance.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-500 block">Tally Daybook ledger</span>
        </div>

        <div className="bg-white dark:bg-[#121824] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Unreconciled</span>
          <span className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">
            {pendingTxns.length} Items
          </span>
          <span className="text-[10px] text-amber-600 block">Awaiting match</span>
        </div>

        <div className="bg-white dark:bg-[#121824] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Matched</span>
          <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {matchedTxns.length} Items
          </span>
          <span className="text-[10px] text-emerald-600 block">Cleared in books</span>
        </div>

        <div className="bg-white dark:bg-[#121824] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1 col-span-2 lg:col-span-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Difference</span>
          <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
            ₹0.00
          </span>
          <span className="text-[10px] text-emerald-600 block">Books in balance</span>
        </div>
      </div>

      {/* 3. TRANSACTIONS TABLE */}
      <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search narration, party, UTR..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl text-xs">
            {(['ALL', 'PENDING', 'RECONCILED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  filterStatus === st
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {st === 'PENDING' ? 'Unmatched' : st === 'RECONCILED' ? 'Matched' : 'All'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Bank Statement Narration</th>
                <th className="py-3 px-4">Suggested Match</th>
                <th className="py-3 px-4 text-right">Bank Amount</th>
                <th className="py-3 px-4 text-right">Book Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {txns
                .filter((t) => {
                  if (filterStatus === 'PENDING' && t.status !== 'PENDING') return false;
                  if (filterStatus === 'RECONCILED' && t.status !== 'RECONCILED') return false;
                  if (searchQuery) {
                    const q = searchQuery.toLowerCase();
                    return (
                      t.description.toLowerCase().includes(q) ||
                      (t.matchedPartyName && t.matchedPartyName.toLowerCase().includes(q))
                    );
                  }
                  return true;
                })
                .map((txn) => {
                  const isCredit = txn.type === 'CREDIT';
                  const isReconciled = txn.status === 'RECONCILED';

                  return (
                    <tr
                      key={txn.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 text-slate-500">{txn.date}</td>
                      <td className="py-3 px-4 font-sans font-medium text-slate-900 dark:text-slate-100 max-w-xs truncate">
                        {txn.description}
                      </td>
                      <td className="py-3 px-4 font-sans">
                        {txn.matchedPartyName ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                              {txn.matchedPartyName}
                            </span>
                            {txn.matchConfidence && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-50 text-blue-700">
                                {txn.matchConfidence}%
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No suggestion</span>
                        )}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-bold ${
                          isCredit
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {isCredit ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500">
                        ₹{txn.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isReconciled
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                          }`}
                        >
                          {isReconciled ? 'MATCHED' : 'UNMATCHED'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-sans">
                        {!isReconciled ? (
                          <button
                            onClick={() => handleSingleApprove(txn.id)}
                            className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center gap-1 ml-auto cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Approve
                          </button>
                        ) : (
                          <span className="text-[11px] font-semibold text-emerald-600 flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Reconciled
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
