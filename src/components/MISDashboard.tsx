import React from 'react';
import type { Party, SalesInvoice, PurchaseInvoice, BankTransaction, ViewMode } from '../types/tax';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Landmark,
  FileCheck,
  Send,
  AlertCircle,
  Zap,
} from 'lucide-react';

const formatINR = (val: number): string => {
  if (typeof val !== 'number' || isNaN(val)) return '₹0';
  return '₹' + Math.round(val).toLocaleString('en-IN');
};

interface MISDashboardProps {
  parties: Party[];
  salesInvoices: SalesInvoice[];
  purchaseInvoices: PurchaseInvoice[];
  bankTransactions: BankTransaction[];
  viewMode: ViewMode;
  onOpenLedgerModal: (party: Party) => void;
  onSwitchTab: (tab: any) => void;
}

export const MISDashboard: React.FC<MISDashboardProps> = ({
  parties = [],
  salesInvoices = [],
  purchaseInvoices = [],
  bankTransactions = [],
  viewMode = 'OPERATIONS',
  onOpenLedgerModal = () => {},
  onSwitchTab = () => {},
}) => {
  // Receivables (Customers current balance > 0)
  const customers = parties.filter((p) => p.type === 'CUSTOMER');
  const totalReceivables = customers.reduce((acc, c) => acc + Math.max(0, c.currentBalance), 0);

  // Payables (Vendors current balance < 0)
  const vendors = parties.filter((p) => p.type === 'VENDOR');
  const totalPayables = vendors.reduce((acc, v) => acc + Math.abs(Math.min(0, v.currentBalance)), 0);

  // Bank Balance Summary
  const bankBalance = 485250; // Mock current HDFC business bank balance

  const unpostedOcrCount = purchaseInvoices.filter((p) => !p.postedToLedger).length;
  const unreconciledBankCount = bankTransactions.filter((bt) => bt.status === 'PENDING').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner Role Highlight */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 rounded-2xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white/20 text-white backdrop-blur-sm uppercase tracking-wider">
              {viewMode === 'OPERATIONS'
                ? 'Operations Executive Mode'
                : viewMode === 'MARKETING_PARTNER'
                ? 'Marketing Partner Mode'
                : 'CA & Consultant Audit Mode'}
            </span>
            <span className="text-xs text-blue-100 font-medium">Gujarat (State Code 24)</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight mt-1 text-white">
            Apex Electronics &amp; Traders MIS Overview
          </h1>
          <p className="text-xs text-blue-100 mt-1 max-w-xl">
            Real-time business liquidity, receivables aging, AI OCR inbox, and bank reconciliation matcher.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onSwitchTab('SALES_BILLING')}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 shadow-md transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> Fast Sales Bill
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Receivables Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md hover:shadow-lg transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Receivables</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight">
            {formatINR(totalReceivables)}
          </div>
          <p className="text-[11px] text-slate-500">
            Pending from <span className="font-bold text-slate-700">{customers.length} Customers</span>
          </p>
        </div>

        {/* Total Payables Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md hover:shadow-lg transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Payables</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 tracking-tight">
            {formatINR(totalPayables)}
          </div>
          <p className="text-[11px] text-slate-500">
            Dues to <span className="font-bold text-slate-700">{vendors.length} Suppliers</span>
          </p>
        </div>

        {/* Bank Liquidity Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md hover:shadow-lg transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">HDFC Bank Balance</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-700 tracking-tight">
            {formatINR(bankBalance)}
          </div>
          <p className="text-[11px] text-slate-500">
            Net Liquidity: <span className="font-bold text-emerald-600">HEALTHY</span>
          </p>
        </div>

        {/* Unposted OCR Action Alert Card */}
        <div className="bg-white p-5 rounded-2xl border border-purple-200 shadow-md hover:shadow-lg transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">AI OCR Inbox</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-700 tracking-tight">
            {unpostedOcrCount} Bills
          </div>
          <button
            onClick={() => onSwitchTab('AI_PURCHASE_OCR')}
            className="text-[11px] text-purple-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            Review &amp; Post to Ledger &rarr;
          </button>
        </div>
      </div>

      {/* Receivables Aging Bracket & Customer Debtors Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Accounts Breakdown (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-md p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Customer Outstanding Ledgers
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any customer to open running ledger statement or send WhatsApp payment reminders.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-700 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-100">
              {customers.length} Debtors
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Customer Name</th>
                  <th className="p-3">GSTIN</th>
                  <th className="p-3">State</th>
                  <th className="p-3">Receivable (₹)</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-900">{c.name}</td>
                    <td className="p-3 font-mono text-slate-500">{c.gstin}</td>
                    <td className="p-3 font-mono text-blue-600">{c.stateCode}-{c.state}</td>
                    <td className="p-3 font-black text-emerald-600 text-sm">
                      {formatINR(c.currentBalance)}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onOpenLedgerModal(c)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 text-[11px] cursor-pointer"
                        >
                          Ledger
                        </button>
                        <button
                          onClick={() => {
                            const text = `Hi ${c.name}, your payment balance of ${formatINR(c.currentBalance)} is due. Kindly process the payment. Thanks!`;
                            window.open(
                              `https://wa.me/${c.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`,
                              '_blank'
                            );
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500 text-[11px] flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <Send className="w-3 h-3" /> WhatsApp
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Receivables Aging Bracket (1 col) */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-md p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Receivables Aging Analysis
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Aging breakdown of payment dues for liquidity risk assessment:
            </p>

            <div className="space-y-4 mt-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>0 - 30 Days (Current)</span>
                  <span className="text-emerald-600">₹88,146 (68%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '68%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>30 - 60 Days</span>
                  <span className="text-amber-600 font-bold">₹40,354 (32%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '32%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>60+ Days Overdue</span>
                  <span className="text-rose-600 font-bold">₹0 (0%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-900 space-y-1">
            <div className="font-bold flex items-center gap-1">
              <FileCheck className="w-4 h-4 text-blue-600" /> Compliance Quick Actions
            </div>
            <p className="text-[11px] text-blue-700">
              {unreconciledBankCount} pending bank statements waiting for auto-matching.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
