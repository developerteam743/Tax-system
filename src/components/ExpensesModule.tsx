import React, { useState } from 'react';
import type { ExpenseItem } from '../types/tax';
import { INITIAL_EXPENSES } from '../data/initialData';
import {
  CreditCard,
  Plus,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  PieChart,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export const ExpensesModule: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>(INITIAL_EXPENSES);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [vendorName, setVendorName] = useState('');
  const [vendorGstin, setVendorGstin] = useState('24AAAGI1234D1ZP');
  const [category, setCategory] = useState<ExpenseItem['category']>('Rent');
  const [taxableAmount, setTaxableAmount] = useState(15000);
  const [gstRate, setGstRate] = useState(18);
  const [itcEligibility, setItcEligibility] = useState<ExpenseItem['itcEligibility']>('ELIGIBLE');
  const [paymentMode, setPaymentMode] = useState<ExpenseItem['paymentMode']>('Bank Transfer');
  const [notes, setNotes] = useState('');

  // Calculations
  const totalTaxable = expenses.reduce((acc, e) => acc + e.taxableAmount, 0);
  const totalTax = expenses.reduce(
    (acc, e) => acc + e.cgstAmount + e.sgstAmount + e.igstAmount,
    0
  );
  const totalExpenses = expenses.reduce((acc, e) => acc + e.totalAmount, 0);

  const eligibleItc = expenses
    .filter((e) => e.itcEligibility === 'ELIGIBLE')
    .reduce((acc, e) => acc + e.cgstAmount + e.sgstAmount + e.igstAmount, 0);

  const blockedItc = expenses
    .filter((e) => e.itcEligibility === 'BLOCKED_17_5')
    .reduce((acc, e) => acc + e.cgstAmount + e.sgstAmount + e.igstAmount, 0);

  const handleAddExpense = () => {
    if (!vendorName.trim()) return;
    const tax = (taxableAmount * gstRate) / 100;
    const cgst = gstRate > 0 ? tax / 2 : 0;
    const sgst = gstRate > 0 ? tax / 2 : 0;

    const newExpense: ExpenseItem = {
      id: `exp-${Date.now()}`,
      expenseNumber: `EXP/2026/${String(expenses.length + 46).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      category,
      vendorName: vendorName.trim(),
      vendorGstin: vendorGstin.trim(),
      taxableAmount,
      gstRate,
      cgstAmount: cgst,
      sgstAmount: sgst,
      igstAmount: 0,
      totalAmount: taxableAmount + tax,
      itcEligibility,
      paymentMode,
      notes: notes.trim(),
    };

    setExpenses([newExpense, ...expenses]);
    setShowAddModal(false);
    setVendorName('');
    setNotes('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. HEADER */}
      <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Operating Overheads</span>
            <span>·</span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold">Section 16 &amp; 17(5) ITC</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
            Business Expenses &amp; Input Tax Credit Log
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track industrial factory rent, utilities, logistics freight, professional retainers and blocked ITC
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Expense</span>
        </button>
      </div>

      {/* 2. METRICS TILES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#121824] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Expenses</span>
          <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
            ₹{Math.round(totalExpenses).toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-500 block">Gross outward cost</span>
        </div>

        <div className="bg-white dark:bg-[#121824] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Eligible Input ITC</span>
          <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
            ₹{Math.round(eligibleItc).toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-emerald-600 block">Claimable under Sec 16</span>
        </div>

        <div className="bg-white dark:bg-[#121824] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Blocked ITC (Sec 17(5))</span>
          <span className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400">
            ₹{Math.round(blockedItc).toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-rose-600 block">Food, travel &amp; motor</span>
        </div>

        <div className="bg-white dark:bg-[#121824] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Taxable Overhead</span>
          <span className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400">
            ₹{Math.round(totalTaxable).toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-blue-500 block">Pre-tax business costs</span>
        </div>
      </div>

      {/* 3. EXPENSES REGISTER TABLE */}
      <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vendor or category..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-3 px-4">Expense #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Vendor Supplier</th>
                <th className="py-3 px-4 text-right">Taxable (₹)</th>
                <th className="py-3 px-4 text-right">GST (₹)</th>
                <th className="py-3 px-4 text-right">Total (₹)</th>
                <th className="py-3 px-4 text-center">ITC Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {expenses
                .filter((e) => {
                  if (searchQuery) {
                    const q = searchQuery.toLowerCase();
                    return (
                      e.vendorName.toLowerCase().includes(q) ||
                      e.category.toLowerCase().includes(q) ||
                      e.expenseNumber.toLowerCase().includes(q)
                    );
                  }
                  return true;
                })
                .map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">{exp.expenseNumber}</td>
                    <td className="py-3 px-4 text-slate-500">{exp.date}</td>
                    <td className="py-3 px-4 font-sans font-semibold text-slate-800 dark:text-slate-200">{exp.category}</td>
                    <td className="py-3 px-4 font-sans text-slate-900 dark:text-slate-100">{exp.vendorName}</td>
                    <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300">₹{exp.taxableAmount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right text-purple-600">₹{(exp.cgstAmount + exp.sgstAmount + exp.igstAmount).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100">₹{exp.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-center font-sans">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          exp.itcEligibility === 'ELIGIBLE'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                            : exp.itcEligibility === 'BLOCKED_17_5'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {exp.itcEligibility === 'ELIGIBLE' ? 'ITC Eligible' : exp.itcEligibility === 'BLOCKED_17_5' ? 'Blocked 17(5)' : 'Ineligible'}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. RECORD EXPENSE MODAL */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Record Business Overhead Expense
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Vendor / Payee Name *</label>
                <input
                  type="text"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="e.g. Torrent Power Ltd"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Expense Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl"
                  >
                    <option>Rent</option>
                    <option>Utilities</option>
                    <option>Logistics &amp; Freight</option>
                    <option>Professional Fees</option>
                    <option>Office &amp; Supplies</option>
                    <option>Travel &amp; Food</option>
                    <option>Repairs &amp; Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">GSTIN (Optional)</label>
                  <input
                    type="text"
                    value={vendorGstin}
                    onChange={(e) => setVendorGstin(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Taxable Value (₹)</label>
                  <input
                    type="number"
                    value={taxableAmount}
                    onChange={(e) => setTaxableAmount(Number(e.target.value) || 0)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-right"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">GST Tax Rate %</label>
                  <select
                    value={gstRate}
                    onChange={(e) => setGstRate(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl"
                  >
                    <option value={18}>18% GST</option>
                    <option value={12}>12% GST</option>
                    <option value={5}>5% GST</option>
                    <option value={0}>0% (Exempt)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">ITC Eligibility (CGST Act)</label>
                  <select
                    value={itcEligibility}
                    onChange={(e) => setItcEligibility(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl"
                  >
                    <option value="ELIGIBLE">Eligible (Sec 16)</option>
                    <option value="BLOCKED_17_5">Blocked (Sec 17(5))</option>
                    <option value="INELIGIBLE">Ineligible</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl"
                  >
                    <option>Bank Transfer</option>
                    <option>UPI</option>
                    <option>Credit Card</option>
                    <option>Cash</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Narration / Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Month lease payment for Vatva Plant"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddExpense}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold cursor-pointer"
              >
                Record Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
