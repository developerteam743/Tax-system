import React, { useState } from 'react';
import type { SalesInvoice, PurchaseInvoice, StockItem } from '../types/tax';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Layers,
  TrendingUp,
  FileText,
  DollarSign,
  PieChart,
} from 'lucide-react';

interface ReportsCenterProps {
  salesInvoices: SalesInvoice[];
  purchaseInvoices: PurchaseInvoice[];
  stockItems: StockItem[];
  companyName?: string;
  financialYear?: string;
}

export const ReportsCenter: React.FC<ReportsCenterProps> = ({
  salesInvoices,
  purchaseInvoices,
  stockItems,
  companyName = 'Apex Electronics & Industrial Traders',
  financialYear = 'FY 2026–27',
}) => {
  const [activeReport, setActiveReport] = useState<'PNL' | 'BALANCE_SHEET' | 'DAYBOOK' | 'STOCK_VALUATION'>('PNL');

  // Derived financials
  const totalSalesRevenue = salesInvoices.reduce((acc, i) => acc + i.subtotal, 0) || 2485400;
  const openingStock = 1420000;
  const purchasesTotal = purchaseInvoices.reduce((acc, p) => acc + p.taxableValue, 0) || 1620000;
  const closingStock = stockItems.reduce((acc, s) => acc + s.currentStock * s.purchasePrice, 0) || 1842000;

  const costOfGoodsSold = openingStock + purchasesTotal - closingStock;
  const grossProfit = totalSalesRevenue - costOfGoodsSold;
  const operatingExpenses = 148500;
  const netProfit = grossProfit - operatingExpenses;

  // Balance sheet items
  const fixedAssets = 3450000; // Plant & machinery, computers
  const debtorsReceivable = 842500;
  const bankBalance = 1284000;
  const cashBalance = 45000;
  const totalAssets = fixedAssets + closingStock + debtorsReceivable + bankBalance + cashBalance;

  const capitalAccount = 4250000;
  const creditorsPayable = 421300;
  const statutoryGstLiability = 142850;
  const loansSecured = 800000;
  const totalLiabilities = capitalAccount + netProfit + creditorsPayable + statutoryGstLiability + loansSecured;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. HEADER */}
      <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Financial Statements</span>
            <span>·</span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold">{financialYear}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
            Financial Audit &amp; MIS Reports Center
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Statutory Profit &amp; Loss, Balance Sheet, Daybook Journal &amp; Stock Valuation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold text-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* 2. REPORT SELECTOR TABS */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'PNL', label: 'Profit & Loss Statement' },
          { id: 'BALANCE_SHEET', label: 'Balance Sheet' },
          { id: 'DAYBOOK', label: 'Daybook Journal' },
          { id: 'STOCK_VALUATION', label: 'Stock Valuation (FIFO)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveReport(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeReport === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. REPORT VIEWS */}
      {activeReport === 'PNL' && (
        <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-sm">
          <div className="text-center border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{companyName}</h3>
            <div className="text-xs text-slate-500 font-mono mt-0.5">
              Trading and Profit &amp; Loss Account for period ended August 2026 ({financialYear})
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-mono text-xs">
            {/* TRADING ACCOUNT: EXPENSES */}
            <div className="space-y-3">
              <div className="font-bold font-sans text-xs uppercase text-slate-400 border-b pb-1">
                Trading Account (Debit)
              </div>
              <div className="flex justify-between">
                <span>To Opening Stock</span>
                <span>₹{openingStock.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>To Purchases (Net)</span>
                <span>₹{purchasesTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>To Direct Freight &amp; Inward Charges</span>
                <span>₹14,200</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-emerald-600">
                <span>To Gross Profit c/d</span>
                <span>₹{grossProfit.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* TRADING ACCOUNT: INCOMES */}
            <div className="space-y-3">
              <div className="font-bold font-sans text-xs uppercase text-slate-400 border-b pb-1">
                Trading Account (Credit)
              </div>
              <div className="flex justify-between">
                <span>By Sales Revenue (Taxable)</span>
                <span>₹{totalSalesRevenue.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>By Closing Stock</span>
                <span>₹{closingStock.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-slate-900 dark:text-slate-100">
                <span>Total</span>
                <span>₹{(totalSalesRevenue + closingStock).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* NET PROFIT SECTION */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-8 font-mono text-xs">
            <div className="space-y-2">
              <div className="font-bold font-sans text-xs uppercase text-slate-400 border-b pb-1">
                Operating Expenses
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Rent &amp; Plant Lease</span>
                <span>₹45,000</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Utilities &amp; Power</span>
                <span>₹18,500</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Professional &amp; Audit Fees</span>
                <span>₹25,000</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Staff Salaries &amp; Admin</span>
                <span>₹60,000</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-emerald-600 text-sm">
                <span>Net Profit</span>
                <span>₹{netProfit.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-bold font-sans text-xs uppercase text-slate-400 border-b pb-1">
                Gross Profit Inward
              </div>
              <div className="flex justify-between font-bold">
                <span>By Gross Profit b/d</span>
                <span>₹{grossProfit.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeReport === 'BALANCE_SHEET' && (
        <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-sm">
          <div className="text-center border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{companyName}</h3>
            <div className="text-xs text-slate-500 font-mono mt-0.5">
              Balance Sheet as on 31st August 2026 ({financialYear})
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-mono text-xs">
            {/* LIABILITIES */}
            <div className="space-y-3">
              <div className="font-bold font-sans text-xs uppercase text-slate-400 border-b pb-1">
                Capital &amp; Liabilities
              </div>
              <div className="flex justify-between">
                <span>Capital Account (Partners)</span>
                <span>₹{capitalAccount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Add: Net Profit for Period</span>
                <span>+ ₹{netProfit.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Secured Bank Working Capital Loan</span>
                <span>₹{loansSecured.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Sundry Creditors (Trade Payables)</span>
                <span>₹{creditorsPayable.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>Statutory GST Liability</span>
                <span>₹{statutoryGstLiability.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-sm text-slate-900 dark:text-slate-100">
                <span>Total Liabilities</span>
                <span>₹{totalLiabilities.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* ASSETS */}
            <div className="space-y-3">
              <div className="font-bold font-sans text-xs uppercase text-slate-400 border-b pb-1">
                Properties &amp; Assets
              </div>
              <div className="flex justify-between">
                <span>Fixed Assets (Plant &amp; Hardware)</span>
                <span>₹{fixedAssets.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Closing Inventory Stock</span>
                <span>₹{closingStock.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-blue-600">
                <span>Sundry Debtors (Receivables)</span>
                <span>₹{debtorsReceivable.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>HDFC Bank Current Account</span>
                <span>₹{bankBalance.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Cash in Hand</span>
                <span>₹{cashBalance.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-sm text-slate-900 dark:text-slate-100">
                <span>Total Assets</span>
                <span>₹{totalAssets.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeReport === 'DAYBOOK' && (
        <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Chronological Daybook Register
              </h3>
              <p className="text-xs text-slate-500">Every sales, purchase and payment entry for current period</p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {salesInvoices.length + purchaseInvoices.length} Vouchers Recorded
            </span>
          </div>

          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase text-slate-400 font-bold">
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">Voucher #</th>
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3">Particulars / Counterparty</th>
                <th className="py-2 px-3 text-right">Debit (₹)</th>
                <th className="py-2 px-3 text-right">Credit (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {salesInvoices.map((s) => (
                <tr key={s.id}>
                  <td className="py-2.5 px-3 text-slate-500">{s.date}</td>
                  <td className="py-2.5 px-3 font-bold text-blue-600">{s.invoiceNumber}</td>
                  <td className="py-2.5 px-3">Sales</td>
                  <td className="py-2.5 px-3 font-sans font-semibold text-slate-800 dark:text-slate-200">{s.partyName}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-600 font-bold">₹{s.grandTotal.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-3 text-right text-slate-400">-</td>
                </tr>
              ))}
              {purchaseInvoices.map((p) => (
                <tr key={p.id}>
                  <td className="py-2.5 px-3 text-slate-500">{p.date}</td>
                  <td className="py-2.5 px-3 font-bold text-purple-600">{p.invoiceNumber}</td>
                  <td className="py-2.5 px-3">Purchase</td>
                  <td className="py-2.5 px-3 font-sans font-semibold text-slate-800 dark:text-slate-200">{p.supplierName}</td>
                  <td className="py-2.5 px-3 text-right text-slate-400">-</td>
                  <td className="py-2.5 px-3 text-right text-amber-600 font-bold">₹{p.grandTotal.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeReport === 'STOCK_VALUATION' && (
        <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Stock Valuation Summary (Weighted Cost Basis)
              </h3>
              <p className="text-xs text-slate-500">Inventory closing values for balance sheet audit</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600">
              Total Valuation: ₹{closingStock.toLocaleString('en-IN')}
            </span>
          </div>

          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase text-slate-400 font-bold">
                <th className="py-2 px-3">SKU Name</th>
                <th className="py-2 px-3">HSN Code</th>
                <th className="py-2 px-3 text-center">Closing Qty</th>
                <th className="py-2 px-3 text-right">Cost Rate</th>
                <th className="py-2 px-3 text-right">Selling Rate</th>
                <th className="py-2 px-3 text-right">Valuation Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {stockItems.map((st) => (
                <tr key={st.id}>
                  <td className="py-2.5 px-3 font-sans font-semibold text-slate-900 dark:text-slate-100">{st.name}</td>
                  <td className="py-2.5 px-3 text-slate-500">{st.hsn}</td>
                  <td className="py-2.5 px-3 text-center font-bold">{st.currentStock} {st.unit}</td>
                  <td className="py-2.5 px-3 text-right">₹{st.purchasePrice.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-3 text-right">₹{st.sellingPrice.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-600">
                    ₹{(st.currentStock * st.purchasePrice).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
