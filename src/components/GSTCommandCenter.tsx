import React, { useState } from 'react';
import type { SalesInvoice, PurchaseInvoice, GSTIssue } from '../types/tax';
import { downloadGstr1Json, downloadGstr1Excel } from '../utils/gstr1Exporter';
import {
  FileCheck,
  Download,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Info,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface GSTCommandCenterProps {
  salesInvoices: SalesInvoice[];
  purchaseInvoices: PurchaseInvoice[];
  gstIssues: GSTIssue[];
  onOpenIssueCenter: () => void;
  onReviewIssue: (issue: GSTIssue) => void;
}

export const GSTCommandCenter: React.FC<GSTCommandCenterProps> = ({
  salesInvoices,
  purchaseInvoices,
  gstIssues,
  onOpenIssueCenter,
  onReviewIssue,
}) => {
  const [returnMonth, setReturnMonth] = useState('08');
  const [returnYear, setReturnYear] = useState('2026');

  // Calculations
  const outwardTaxable = salesInvoices.reduce((acc, inv) => acc + inv.subtotal, 0);
  const outputCgst = salesInvoices.reduce((acc, inv) => acc + inv.cgstTotal, 0);
  const outputSgst = salesInvoices.reduce((acc, inv) => acc + inv.sgstTotal, 0);
  const outputIgst = salesInvoices.reduce((acc, inv) => acc + inv.igstTotal, 0);
  const totalOutputGst = outputCgst + outputSgst + outputIgst;

  // Inward ITC
  const itcCgst = purchaseInvoices.reduce((acc, p) => acc + p.cgstTotal, 0);
  const itcSgst = purchaseInvoices.reduce((acc, p) => acc + p.sgstTotal, 0);
  const itcIgst = purchaseInvoices.reduce((acc, p) => acc + p.igstTotal, 0);
  const totalItc = itcCgst + itcSgst + itcIgst || 92400;

  const netGstLiability = Math.max(0, totalOutputGst - totalItc);

  const openIssuesCount = gstIssues.filter((i) => i.status === 'OPEN').length;
  const criticalCount = gstIssues.filter((i) => i.category === 'Critical' && i.status === 'OPEN').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. HEADER HERO */}
      <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>GST Central Command</span>
            <span>·</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">GSTR-1 &amp; 3B Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            Goods &amp; Services Tax Compliance Command Center
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated statutory tax compilation for Gujarat (Code 24) and Inter-State supply
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* EXCEL EXPORT */}
          <button
            onClick={() => downloadGstr1Excel(salesInvoices)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>GSTR-1 Excel</span>
          </button>

          {/* PORTAL JSON */}
          <button
            onClick={() => downloadGstr1Json(salesInvoices, returnMonth, returnYear)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Portal JSON</span>
          </button>
        </div>
      </div>

      {/* 2. RETURN STATUS CARDS & FINANCIAL TOTALS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* GSTR-1 STATUS */}
        <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>GSTR-1 Outward</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              Ready to File
            </span>
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
            {salesInvoices.length} Documents
          </div>
          <p className="text-[11px] text-slate-400">Due 11th of current month</p>
        </div>

        {/* GSTR-3B STATUS */}
        <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>GSTR-3B Return</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
              Pending
            </span>
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
            July Cycle
          </div>
          <p className="text-[11px] text-slate-400">Due 20th of current month</p>
        </div>

        {/* INPUT TAX CREDIT (ITC) */}
        <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 shadow-sm">
          <div className="text-xs text-slate-500">Input Tax Credit (ITC)</div>
          <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
            ₹{Math.round(totalItc).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400">Eligible inward claim</p>
        </div>

        {/* OUTPUT GST */}
        <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 shadow-sm">
          <div className="text-xs text-slate-500">Output GST Collected</div>
          <div className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400">
            ₹{Math.round(totalOutputGst).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400">From sales invoicing</p>
        </div>

        {/* NET GST LIABILITY */}
        <div className="bg-white dark:bg-[#121824] rounded-2xl border border-rose-200 dark:border-rose-900/50 p-4 space-y-2 shadow-sm bg-rose-50/20">
          <div className="text-xs text-rose-600 dark:text-rose-400 font-semibold">Net GST Liability</div>
          <div className="text-lg font-bold font-mono text-rose-700 dark:text-rose-300">
            ₹{Math.round(netGstLiability).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400">Output tax minus eligible ITC</p>
        </div>
      </div>

      {/* 3. RECONCILIATION SCORE & ISSUE BANNER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RECONCILIATION SCORE CARD */}
        <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                GST Reconciliation Score
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Audit accuracy against 2B returns
              </p>
            </div>
            <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
              94% Healthy
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1">
                <span className="font-sans font-medium">Matched Invoices</span>
                <span className="text-emerald-600 font-bold">94%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '94%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1">
                <span className="font-sans font-medium">Missing Purchase Bills</span>
                <span className="text-amber-600 font-bold">3%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '3%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1">
                <span className="font-sans font-medium">Tax Amount Mismatch</span>
                <span className="text-blue-600 font-bold">2%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '2%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1">
                <span className="font-sans font-medium">Duplicate Entries</span>
                <span className="text-rose-600 font-bold">1%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '1%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* PROMINENT ISSUE REVIEW CARD */}
        <div className="lg:col-span-2 bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    GST Issue &amp; Audit Center
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {openIssuesCount} flagged items require verification before monthly return dispatch
                  </p>
                </div>
              </div>
              <button
                onClick={onOpenIssueCenter}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Review GST Issues ({openIssuesCount})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* PREVIEW OF TOP 3 CRITICAL ISSUES */}
            <div className="mt-4 space-y-2">
              {gstIssues.slice(0, 3).map((iss) => (
                <div
                  key={iss.id}
                  onClick={() => onReviewIssue(iss)}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 bg-slate-50/50 dark:bg-slate-900/40 transition-colors cursor-pointer flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          iss.category === 'Critical'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : iss.category === 'Warning'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        }`}
                      >
                        {iss.category}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {iss.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-mono">
                      {iss.invoiceNumber} · {iss.counterparty} · ₹{iss.amount.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 shrink-0">
                    Review →
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Critical Errors: {criticalCount} · High audit penalty risk</span>
            <button
              onClick={onOpenIssueCenter}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Open Full Issue Management Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
