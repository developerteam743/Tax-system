import React, { useState } from 'react';
import type { PurchaseInvoice } from '../types/tax';
import { AIPurchaseOCR } from './AIPurchaseOCR';
import {
  ShoppingCart,
  Plus,
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  Filter,
  Search,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  FileText,
} from 'lucide-react';

interface PurchaseWorkspaceProps {
  purchaseInvoices: PurchaseInvoice[];
  onAddPurchaseInvoice: (inv: PurchaseInvoice) => void;
  onPostToLedger: (id: string) => void;
}

export const PurchaseWorkspace: React.FC<PurchaseWorkspaceProps> = ({
  purchaseInvoices,
  onAddPurchaseInvoice,
  onPostToLedger,
}) => {
  const [activeSubView, setActiveSubView] = useState<'REGISTER' | 'SCANNER'>('REGISTER');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'POSTED' | 'UNPOSTED'>('ALL');

  // Metrics
  const totalPurchases = purchaseInvoices.reduce((acc, p) => acc + p.grandTotal, 0);
  const unpostedInvoices = purchaseInvoices.filter((p) => !p.postedToLedger);
  const unpostedAmount = unpostedInvoices.reduce((acc, p) => acc + p.grandTotal, 0);
  const postedAmount = totalPurchases - unpostedAmount;
  const inputGstTotal = purchaseInvoices.reduce(
    (acc, p) => acc + p.cgstTotal + p.sgstTotal + p.igstTotal,
    0
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. HEADER */}
      <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Procurement &amp; Inward Register</span>
            <span>·</span>
            <span className="text-purple-600 dark:text-purple-400 font-semibold">Gemini Vision OCR</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
            Purchase Register &amp; AI Bill Capture
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Inward supply verification, statutory input tax credit (ITC) reconciliation &amp; automated stock inward
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeSubView === 'REGISTER' ? (
            <button
              onClick={() => setActiveSubView('SCANNER')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-all shadow-sm cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Launch AI Camera Scanner [F4]</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveSubView('REGISTER')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
            >
              <span>Back to Purchase Register</span>
            </button>
          )}
        </div>
      </div>

      {activeSubView === 'SCANNER' ? (
        <AIPurchaseOCR
          purchaseInvoices={purchaseInvoices}
          onAddPurchaseInvoice={(inv) => {
            onAddPurchaseInvoice(inv);
            setActiveSubView('REGISTER');
          }}
          onPostToLedger={onPostToLedger}
        />
      ) : (
        <>
          {/* 2. PURCHASE METRICS TILES */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="bg-white dark:bg-[#121824] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Purchases</span>
              <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
                ₹{Math.round(totalPurchases).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500 block">{purchaseInvoices.length} bills entered</span>
            </div>

            <div className="bg-white dark:bg-[#121824] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Pending Inward</span>
              <span className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">
                {unpostedInvoices.length} Bills
              </span>
              <span className="text-[10px] text-amber-600 block">Needs verification</span>
            </div>

            <div className="bg-white dark:bg-[#121824] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Posted to Stock</span>
              <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                ₹{Math.round(postedAmount).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-emerald-600 block">Inventory updated</span>
            </div>

            <div className="bg-white dark:bg-[#121824] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Eligible Input GST</span>
              <span className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400">
                ₹{Math.round(inputGstTotal).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-blue-500 block">GSTR-2B claimable</span>
            </div>

            <div className="bg-white dark:bg-[#121824] p-4 rounded-2xl border border-purple-200 dark:border-purple-900/60 shadow-sm space-y-1 col-span-2 lg:col-span-1 bg-purple-50/20">
              <span className="text-[10px] text-purple-600 dark:text-purple-400 uppercase font-mono block">AI Vision Engine</span>
              <span className="text-lg font-bold font-mono text-purple-700 dark:text-purple-300">
                99.8% Conf.
              </span>
              <span className="text-[10px] text-purple-600 block">Tesseract + Gemini Flash</span>
            </div>
          </div>

          {/* 3. PURCHASES TABLE */}
          <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search vendor, bill # or GSTIN..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl text-xs">
                {(['ALL', 'UNPOSTED', 'POSTED'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      statusFilter === st
                        ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {st === 'UNPOSTED' ? 'Needs Review' : st}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-3 px-4">Bill #</th>
                    <th className="py-3 px-4">Vendor Supplier</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">GSTIN</th>
                    <th className="py-3 px-4 text-right">Taxable (₹)</th>
                    <th className="py-3 px-4 text-right">Input GST (₹)</th>
                    <th className="py-3 px-4 text-right">Total Amount (₹)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  {purchaseInvoices
                    .filter((p) => {
                      if (statusFilter === 'POSTED' && !p.postedToLedger) return false;
                      if (statusFilter === 'UNPOSTED' && p.postedToLedger) return false;
                      if (searchQuery) {
                        const q = searchQuery.toLowerCase();
                        return (
                          p.invoiceNumber.toLowerCase().includes(q) ||
                          p.supplierName.toLowerCase().includes(q) ||
                          p.supplierGstin.toLowerCase().includes(q)
                        );
                      }
                      return true;
                    })
                    .map((pur) => {
                      const gstTotal = pur.cgstTotal + pur.sgstTotal + pur.igstTotal;

                      return (
                        <tr
                          key={pur.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3 px-4 font-bold text-purple-600 dark:text-purple-400">
                            {pur.invoiceNumber}
                          </td>
                          <td className="py-3 px-4 font-sans font-semibold text-slate-900 dark:text-slate-100">
                            {pur.supplierName}
                          </td>
                          <td className="py-3 px-4 text-slate-500">{pur.date}</td>
                          <td className="py-3 px-4 text-slate-500">{pur.supplierGstin}</td>
                          <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">
                            ₹{pur.taxableValue.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-right text-blue-600 dark:text-blue-400">
                            ₹{gstTotal.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100 text-sm">
                            ₹{pur.grandTotal.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-center font-sans">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                pur.postedToLedger
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                              }`}
                            >
                              {pur.postedToLedger ? 'POSTED' : 'NEEDS POSTING'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-sans">
                            {!pur.postedToLedger ? (
                              <button
                                onClick={() => onPostToLedger(pur.id)}
                                className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors flex items-center gap-1 ml-auto cursor-pointer"
                              >
                                <Zap className="w-3 h-3" />
                                1-Click Post
                              </button>
                            ) : (
                              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Inwarded
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
        </>
      )}
    </div>
  );
};
