import React, { useState } from 'react';
import type { Party, SalesInvoice, PurchaseInvoice, BankTransaction, ViewMode } from '../types/tax';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Landmark,
  FileCheck,
  Zap,
  Package,
  CreditCard,
  Building,
  Receipt,
  ShoppingCart,
  Clock,
  Send,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface ExecutiveDashboardProps {
  parties: Party[];
  salesInvoices: SalesInvoice[];
  purchaseInvoices: PurchaseInvoice[];
  bankTransactions: BankTransaction[];
  viewMode: ViewMode;
  onOpenLedgerModal: (party: Party) => void;
  onSwitchTab: (tab: string) => void;
  companyName?: string;
  financialYear?: string;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  parties = [],
  salesInvoices = [],
  purchaseInvoices = [],
  bankTransactions = [],
  viewMode = 'OPERATIONS',
  onOpenLedgerModal,
  onSwitchTab,
  companyName = 'Apex Electronics & Industrial Traders',
  financialYear = 'FY 2026–27',
}) => {
  // Chart configuration state
  const [chartMetric, setChartMetric] = useState<'REVENUE' | 'EXPENSES' | 'PROFIT' | 'CASH_FLOW'>('REVENUE');
  const [chartTimeframe, setChartTimeframe] = useState<'7D' | '30D' | '3M' | '6M' | '1Y' | 'FY'>('6M');
  const [chartDisplayMode, setChartDisplayMode] = useState<'AMOUNT' | 'GROWTH'>('AMOUNT');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Derived financials
  const customers = parties.filter((p) => p.type === 'CUSTOMER');
  const vendors = parties.filter((p) => p.type === 'VENDOR');

  const calculatedReceivables = customers.reduce((sum, c) => sum + Math.max(0, c.currentBalance), 0);
  const totalReceivables = calculatedReceivables > 0 ? calculatedReceivables : 842500;

  const calculatedPayables = vendors.reduce((sum, v) => sum + Math.abs(Math.min(0, v.currentBalance)), 0);
  const totalPayables = calculatedPayables > 0 ? calculatedPayables : 421300;

  const revenueValue = 2485400;
  const gstLiabilityValue = 142850;
  const cashBankValue = 1284000;
  const inventoryValue = 1842000;

  // Mini SVG Sparkline Generator
  const renderSparkline = (data: number[], color: string, isPositive: boolean) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 80;
    const height = 24;

    const points = data
      .map((val, idx) => {
        const x = (idx / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 4) - 2;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  // KPI Definition List
  const kpiCards = [
    {
      id: 'kpi-revenue',
      title: 'Revenue',
      value: `₹${revenueValue.toLocaleString('en-IN')}`,
      raw: revenueValue,
      comparison: '+12.8%',
      isPositive: true,
      trendText: 'vs previous period',
      sparklineData: [18, 20, 19, 22, 21, 24.8],
      sparklineColor: '#10B981',
      status: 'Target Met',
      statusClass: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400',
    },
    {
      id: 'kpi-receivables',
      title: 'Receivables',
      value: `₹${totalReceivables.toLocaleString('en-IN')}`,
      raw: totalReceivables,
      comparison: '+4.2%',
      isPositive: true,
      trendText: `${customers.length} debtors outstanding`,
      sparklineData: [7.2, 7.5, 8.0, 7.9, 8.1, 8.4],
      sparklineColor: '#3B82F6',
      status: 'Moderate Age',
      statusClass: 'text-blue-700 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400',
    },
    {
      id: 'kpi-payables',
      title: 'Payables',
      value: `₹${totalPayables.toLocaleString('en-IN')}`,
      raw: totalPayables,
      comparison: '-2.1%',
      isPositive: true,
      trendText: `${vendors.length} vendor bills scheduled`,
      sparklineData: [5.1, 4.8, 4.6, 4.4, 4.3, 4.2],
      sparklineColor: '#F59E0B',
      status: 'Under Credit Limit',
      statusClass: 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400',
    },
    {
      id: 'kpi-gst',
      title: 'GST Liability',
      value: `₹${gstLiabilityValue.toLocaleString('en-IN')}`,
      raw: gstLiabilityValue,
      comparison: 'Due 20th',
      isPositive: false,
      trendText: 'GSTR-3B July filing cycle',
      sparklineData: [1.2, 1.35, 1.15, 1.5, 1.38, 1.42],
      sparklineColor: '#EF4444',
      status: 'Audit Ready',
      statusClass: 'text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400',
    },
    {
      id: 'kpi-cash',
      title: 'Cash & Bank',
      value: `₹${cashBankValue.toLocaleString('en-IN')}`,
      raw: cashBankValue,
      comparison: '+8.6%',
      isPositive: true,
      trendText: 'HDFC Current & Cash book',
      sparklineData: [10.5, 11.2, 11.8, 12.0, 12.4, 12.84],
      sparklineColor: '#10B981',
      status: 'High Liquidity',
      statusClass: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400',
    },
    {
      id: 'kpi-inventory',
      title: 'Inventory Value',
      value: `₹${inventoryValue.toLocaleString('en-IN')}`,
      raw: inventoryValue,
      comparison: '520 SKUs',
      isPositive: true,
      trendText: 'Weighted average valuation',
      sparklineData: [16.2, 16.8, 17.5, 17.9, 18.1, 18.42],
      sparklineColor: '#8B5CF6',
      status: 'Optimal Stock',
      statusClass: 'text-purple-700 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400',
    },
  ];

  // Interactive Chart Data Sets (6 data points)
  const chartDatasets: Record<
    string,
    Array<{ label: string; amount: number; growth: number; subtext: string }>
  > = {
    REVENUE: [
      { label: 'Mar 26', amount: 1820000, growth: 9.2, subtext: 'CGST: ₹1.63L, SGST: ₹1.63L' },
      { label: 'Apr 26', amount: 2040000, growth: 12.1, subtext: 'CGST: ₹1.83L, SGST: ₹1.83L' },
      { label: 'May 26', amount: 1980000, growth: -2.9, subtext: 'CGST: ₹1.78L, SGST: ₹1.78L' },
      { label: 'Jun 26', amount: 2210000, growth: 11.6, subtext: 'CGST: ₹1.98L, SGST: ₹1.98L' },
      { label: 'Jul 26', amount: 2360000, growth: 6.8, subtext: 'CGST: ₹2.12L, SGST: ₹2.12L' },
      { label: 'Aug 26', amount: 2485400, growth: 12.8, subtext: 'CGST: ₹2.23L, SGST: ₹2.23L' },
    ],
    EXPENSES: [
      { label: 'Mar 26', amount: 1380000, growth: 4.1, subtext: 'Rent + Logistics + Wages' },
      { label: 'Apr 26', amount: 1450000, growth: 5.0, subtext: 'Annual retainers' },
      { label: 'May 26', amount: 1410000, growth: -2.7, subtext: 'Operating savings' },
      { label: 'Jun 26', amount: 1530000, growth: 8.5, subtext: 'Freight adjustments' },
      { label: 'Jul 26', amount: 1590000, growth: 3.9, subtext: 'Vatva plant utilities' },
      { label: 'Aug 26', amount: 1620000, growth: 1.8, subtext: 'Current burn rate' },
    ],
    PROFIT: [
      { label: 'Mar 26', amount: 440000, growth: 18.2, subtext: 'Gross Margin 24.1%' },
      { label: 'Apr 26', amount: 590000, growth: 34.0, subtext: 'Gross Margin 28.9%' },
      { label: 'May 26', amount: 570000, growth: -3.3, subtext: 'Gross Margin 28.7%' },
      { label: 'Jun 26', amount: 680000, growth: 19.2, subtext: 'Gross Margin 30.7%' },
      { label: 'Jul 26', amount: 770000, growth: 13.2, subtext: 'Gross Margin 32.6%' },
      { label: 'Aug 26', amount: 865400, growth: 12.4, subtext: 'Gross Margin 34.8%' },
    ],
    CASH_FLOW: [
      { label: 'Mar 26', amount: 820000, growth: 6.5, subtext: 'Net Operational Surplus' },
      { label: 'Apr 26', amount: 940000, growth: 14.6, subtext: 'Vendor reconciliations' },
      { label: 'May 26', amount: 990000, growth: 5.3, subtext: 'HDFC Inward remittances' },
      { label: 'Jun 26', amount: 1120000, growth: 13.1, subtext: 'UPI Collection growth' },
      { label: 'Jul 26', amount: 1210000, growth: 8.0, subtext: 'ITC Set-off benefit' },
      { label: 'Aug 26', amount: 1284000, growth: 6.1, subtext: 'Safe Treasury balance' },
    ],
  };

  const currentDataset = chartDatasets[chartMetric];
  const maxAmount = Math.max(...currentDataset.map((d) => d.amount));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. EXECUTIVE GREETING & METADATA BAR */}
      <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
            <span>Good morning, Ramesh Patel</span>
            <span>·</span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold">{financialYear}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            {companyName}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Statutory Gujarat (State 24) ERP overview · TallyPrime live bridge ready
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* GST STATUS INDICATOR */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs">
            <span className="text-slate-400 text-[11px]">GST Status:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              GSTR-1 Filed · GSTR-3B Pending
            </span>
          </div>

          {/* QUICK ACTION BUTTON */}
          <button
            onClick={() => onSwitchTab('SALES_BILLING')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-sm cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>New Tax Invoice</span>
          </button>
        </div>
      </div>

      {/* 2. SIX FINANCIAL KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpiCards.map((kpi) => (
          <div
            key={kpi.id}
            className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>{kpi.title}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${kpi.statusClass}`}>
                  {kpi.status}
                </span>
              </div>
              <div className="text-xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100">
                {kpi.value}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-end justify-between">
              <div>
                <div
                  className={`text-xs font-semibold font-mono flex items-center gap-0.5 ${
                    kpi.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {kpi.isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}
                  {kpi.comparison}
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[6.5rem]">
                  {kpi.trendText}
                </div>
              </div>
              <div>{renderSparkline(kpi.sparklineData, kpi.sparklineColor, kpi.isPositive)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. INTERACTIVE FINANCIAL OVERVIEW CHART */}
      <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm">
        {/* CHART CONTROLS BAR */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          {/* TABS */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl">
            {(['REVENUE', 'EXPENSES', 'PROFIT', 'CASH_FLOW'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setChartMetric(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  chartMetric === m
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {m === 'REVENUE' && 'Revenue'}
                {m === 'EXPENSES' && 'Expenses'}
                {m === 'PROFIT' && 'Profit'}
                {m === 'CASH_FLOW' && 'Cash Flow'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* AMOUNT VS GROWTH TOGGLE */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl text-xs">
              <button
                onClick={() => setChartDisplayMode('AMOUNT')}
                className={`px-2.5 py-1 rounded-lg font-mono font-medium transition-colors cursor-pointer ${
                  chartDisplayMode === 'AMOUNT'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                ₹ Amount
              </button>
              <button
                onClick={() => setChartDisplayMode('GROWTH')}
                className={`px-2.5 py-1 rounded-lg font-mono font-medium transition-colors cursor-pointer ${
                  chartDisplayMode === 'GROWTH'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                % Growth
              </button>
            </div>

            {/* TIMEFRAME SELECTOR */}
            <div className="hidden sm:flex items-center gap-1 text-xs font-mono text-slate-500">
              {(['7D', '30D', '3M', '6M', '1Y', 'FY'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setChartTimeframe(tf)}
                  className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                    chartTimeframe === tf
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold'
                      : 'hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* VISUAL CHART CANVAS */}
        <div className="relative pt-4 pb-2">
          {/* HOVER TOOLTIP CARD */}
          {hoveredPointIndex !== null && currentDataset[hoveredPointIndex] && (
            <div className="p-3 mb-2 rounded-xl bg-slate-900 text-white dark:bg-slate-800 text-xs shadow-xl flex items-center justify-between animate-fadeIn">
              <div>
                <span className="font-semibold text-slate-300">
                  {currentDataset[hoveredPointIndex].label}
                </span>
                <span className="mx-2 text-slate-500">·</span>
                <span className="font-mono font-bold text-white">
                  ₹{currentDataset[hoveredPointIndex].amount.toLocaleString('en-IN')}
                </span>
                <span className="mx-2 text-slate-500">·</span>
                <span className="text-emerald-400 font-mono">
                  +{currentDataset[hoveredPointIndex].growth}%
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {currentDataset[hoveredPointIndex].subtext}
              </span>
            </div>
          )}

          {/* SVG BARS + AREA CHART */}
          <div className="h-56 w-full flex items-end gap-3 sm:gap-6 pt-4 px-2">
            {currentDataset.map((item, idx) => {
              const heightPercent = Math.max(12, Math.round((item.amount / maxAmount) * 100));
              const isHovered = hoveredPointIndex === idx;

              return (
                <div
                  key={item.label}
                  className="flex-1 h-full flex flex-col justify-end items-center group cursor-pointer"
                  onMouseEnter={() => setHoveredPointIndex(idx)}
                  onMouseLeave={() => setHoveredPointIndex(null)}
                >
                  <div className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {chartDisplayMode === 'AMOUNT'
                      ? `₹${(item.amount / 100000).toFixed(1)}L`
                      : `${item.growth > 0 ? '+' : ''}${item.growth}%`}
                  </div>

                  <div className="w-full max-w-[56px] bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex flex-col justify-end h-full">
                    <div
                      className={`w-full rounded-xl transition-all duration-300 ${
                        isHovered
                          ? 'bg-blue-600'
                          : chartMetric === 'PROFIT'
                          ? 'bg-emerald-500/80'
                          : chartMetric === 'EXPENSES'
                          ? 'bg-amber-500/80'
                          : 'bg-blue-500/80'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  <span className="mt-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. LOWER DUAL PANELS: RECEIVABLES AGING & CUSTOMER DEBTORS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CUSTOMER DEBTORS */}
        <div className="lg:col-span-2 bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Customer Outstanding Ledgers
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Debtor payment statuses &amp; WhatsApp reminders
              </p>
            </div>
            <button
              onClick={() => onSwitchTab('CUSTOMERS_360')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              View All Debtors ({customers.length})
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-2.5 px-3">Customer Party</th>
                  <th className="py-2.5 px-3">GSTIN</th>
                  <th className="py-2.5 px-3">State</th>
                  <th className="py-2.5 px-3 text-right">Outstanding (₹)</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {customers.slice(0, 5).map((c) => {
                  const waText = `Hi ${c.name}, outstanding payment of ₹${c.currentBalance.toLocaleString('en-IN')} is due on your account. Kindly release payment. Regards, ${companyName}.`;
                  const waUrl = `https://wa.me/${c.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(waText)}`;

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-3 font-sans font-bold text-slate-900 dark:text-slate-100">
                        {c.name}
                      </td>
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                        {c.gstin || 'Unregistered'}
                      </td>
                      <td className="py-3 px-3 text-blue-600 dark:text-blue-400">
                        {c.stateCode} ({c.state})
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{c.currentBalance.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-right font-sans">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onOpenLedgerModal(c)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                          >
                            Statement
                          </button>
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                          >
                            <Send className="w-3 h-3" />
                            WhatsApp
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RECEIVABLES AGING BREAKDOWN */}
        <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
              Receivables Aging Analysis
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Payment dues categorized under statutory credit periods:
            </p>

            <div className="space-y-4 mt-5">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>0 – 30 Days (Current)</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                    ₹5,72,900 (68%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '68%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>30 – 60 Days</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400">
                    ₹2,69,600 (32%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '32%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>60+ Days (Overdue)</span>
                  <span className="font-mono text-slate-400">₹0 (0%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: '0%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200">
            <div className="font-semibold flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-blue-600" />
              Section 43B(h) MSME Health
            </div>
            <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-1">
              Zero creditor invoices overdue past the statutory 45-day window.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
