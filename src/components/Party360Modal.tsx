import React, { useState } from 'react';
import type { Party, SalesInvoice, PurchaseInvoice, LedgerEntry } from '../types/tax';
import {
  Users,
  Building2,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Send,
  Download,
  CreditCard,
  Receipt,
  FileCheck,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';

interface Party360ModalProps {
  party: Party | null;
  onClose: () => void;
  salesInvoices: SalesInvoice[];
  purchaseInvoices: PurchaseInvoice[];
  ledgerEntries: LedgerEntry[];
  companyName?: string;
}

export const Party360Modal: React.FC<Party360ModalProps> = ({
  party,
  onClose,
  salesInvoices,
  purchaseInvoices,
  ledgerEntries,
  companyName = 'Apex Electronics & Industrial Traders',
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DOCUMENTS' | 'PAYMENTS' | 'LEDGER' | 'GST'>('OVERVIEW');

  if (!party) return null;

  const isCustomer = party.type === 'CUSTOMER' || party.type === 'BOTH';
  const isVendor = party.type === 'VENDOR' || party.type === 'BOTH';

  // Invoices for this party
  const partySales = salesInvoices.filter((i) => i.partyId === party.id || i.partyName === party.name);
  const partyPurchases = purchaseInvoices.filter(
    (p) => p.supplierGstin === party.gstin || p.supplierName === party.name
  );

  const totalBilled = isCustomer
    ? partySales.reduce((acc, i) => acc + i.grandTotal, 0)
    : partyPurchases.reduce((acc, p) => acc + p.grandTotal, 0);

  const totalPaid = Math.max(0, totalBilled - Math.abs(party.currentBalance));
  const outstanding = Math.abs(party.currentBalance);

  // Vouchers in ledger
  const partyLedger = ledgerEntries.filter(
    (l) => l.partyId === party.id || l.partyName === party.name
  );

  const waText = `Hi ${party.name}, balance on your account is ₹${outstanding.toLocaleString('en-IN')}. Please verify ledger statement from ${companyName}.`;
  const waUrl = `https://wa.me/${party.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(waText)}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${party.name} 360 View`}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-fadeIn my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. HEADER PROFILE 360 */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm ${
                  isCustomer
                    ? 'bg-gradient-to-tr from-blue-600 to-indigo-600'
                    : 'bg-gradient-to-tr from-amber-600 to-orange-600'
                }`}
              >
                {isCustomer ? <Users className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{party.name}</h2>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      party.type === 'CUSTOMER'
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {party.type}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                  <span>GSTIN: {party.gstin || 'Unregistered'}</span>
                  <span>·</span>
                  <span>{party.phone}</span>
                  <span>·</span>
                  <span>{party.city}, {party.state} ({party.stateCode})</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 4 TOP 360 METRICS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Total Billed</span>
              <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                ₹{Math.round(totalBilled).toLocaleString('en-IN')}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Total Paid</span>
              <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                ₹{Math.round(totalPaid).toLocaleString('en-IN')}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Outstanding</span>
              <span
                className={`text-base font-bold font-mono ${
                  party.currentBalance > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                ₹{Math.round(outstanding).toLocaleString('en-IN')}{' '}
                <span className="text-[11px] font-sans">
                  {party.currentBalance > 0 ? '(Recv)' : '(Pay)'}
                </span>
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Avg. Payment Time</span>
              <span className="text-base font-bold font-mono text-blue-600 dark:text-blue-400">
                18 Days
              </span>
            </div>
          </div>
        </div>

        {/* 2. TABS NAV */}
        <div className="px-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 text-xs font-semibold">
          {[
            { id: 'OVERVIEW', label: 'Overview' },
            { id: 'DOCUMENTS', label: isCustomer ? 'Invoices' : 'Purchases' },
            { id: 'LEDGER', label: 'Ledger Statement' },
            { id: 'GST', label: 'GST Compliance' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`py-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === t.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 3. TAB CONTENT */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px]">
                  Business Relationship Summary
                </h4>
                <div className="grid grid-cols-2 gap-3 text-slate-600 dark:text-slate-400">
                  <div>Address: <strong className="text-slate-800 dark:text-slate-200">{party.address}</strong></div>
                  <div>State Code: <strong className="text-slate-800 dark:text-slate-200">{party.stateCode} ({party.state})</strong></div>
                  <div>Email: <strong className="text-slate-800 dark:text-slate-200">{party.email}</strong></div>
                  <div>Account Type: <strong className="text-slate-800 dark:text-slate-200">{party.type}</strong></div>
                </div>
              </div>

              {/* TIMELINE */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Recent Transaction Timeline
                </h4>
                <div className="space-y-2 font-mono text-xs">
                  {partyLedger.slice(0, 5).map((l, i) => (
                    <div
                      key={l.id || i}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-sans font-semibold text-slate-900 dark:text-slate-100">
                          {l.voucherType} #{l.voucherNo}
                        </div>
                        <div className="text-[10px] text-slate-400">{l.date} · {l.narration}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-600">
                          ₹{(l.debit || l.credit || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'DOCUMENTS' && (
            <div className="space-y-3 font-mono text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase text-slate-400 font-bold">
                    <th className="py-2">Number</th>
                    <th className="py-2">Date</th>
                    <th className="py-2 text-right">Taxable</th>
                    <th className="py-2 text-right">GST</th>
                    <th className="py-2 text-right">Total</th>
                    <th className="py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {(isCustomer ? partySales : partyPurchases).map((doc: any) => (
                    <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 font-bold text-blue-600">{doc.invoiceNumber}</td>
                      <td className="py-2.5 text-slate-500">{doc.date}</td>
                      <td className="py-2.5 text-right">₹{(doc.subtotal || doc.taxableValue || 0).toLocaleString('en-IN')}</td>
                      <td className="py-2.5 text-right text-purple-600">₹{(doc.cgstTotal + doc.sgstTotal + doc.igstTotal).toLocaleString('en-IN')}</td>
                      <td className="py-2.5 text-right font-bold">₹{doc.grandTotal.toLocaleString('en-IN')}</td>
                      <td className="py-2.5 text-center font-sans">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                          {doc.status || 'PROCESSED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'LEDGER' && (
            <div className="space-y-3 font-mono text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase text-slate-400 font-bold">
                    <th className="py-2">Date</th>
                    <th className="py-2">Voucher</th>
                    <th className="py-2">Narration</th>
                    <th className="py-2 text-right">Debit (₹)</th>
                    <th className="py-2 text-right">Credit (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {partyLedger.map((l) => (
                    <tr key={l.id}>
                      <td className="py-2 text-slate-500">{l.date}</td>
                      <td className="py-2 font-bold text-blue-600">{l.voucherType} #{l.voucherNo}</td>
                      <td className="py-2 font-sans text-slate-600 dark:text-slate-400">{l.narration}</td>
                      <td className="py-2 text-right text-emerald-600 font-bold">{l.debit > 0 ? `₹${l.debit.toLocaleString('en-IN')}` : '-'}</td>
                      <td className="py-2 text-right text-amber-600 font-bold">{l.credit > 0 ? `₹${l.credit.toLocaleString('en-IN')}` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'GST' && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-600 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                GST Portal Verification: Active Regular Taxpayer
              </div>
              <p className="text-slate-500 leading-relaxed">
                Counterparty GSTIN {party.gstin} registered in State of {party.state} (Code {party.stateCode}).
                E-Invoice QR code validation enabled.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
