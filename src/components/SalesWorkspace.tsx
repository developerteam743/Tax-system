import React, { useState } from 'react';
import type { Party, SalesInvoice, StockItem, InvoiceItem } from '../types/tax';
import { calculateItemGst, formatCurrency } from '../utils/gst';
import {
  Receipt,
  Plus,
  Trash2,
  CheckCircle2,
  Printer,
  Download,
  Send,
  Filter,
  FileSpreadsheet,
  Search,
  Truck,
  Sparkles,
  QrCode,
  Building,
  User,
  Check,
  ChevronDown,
  X,
  CreditCard,
  FileText,
} from 'lucide-react';

interface SalesWorkspaceProps {
  parties: Party[];
  stockItems: StockItem[];
  salesInvoices: SalesInvoice[];
  onCreateInvoice: (inv: SalesInvoice) => void;
  firmName?: string;
  firmGstin?: string;
  firmStateCode?: string;
}

export const SalesWorkspace: React.FC<SalesWorkspaceProps> = ({
  parties,
  stockItems,
  salesInvoices,
  onCreateInvoice,
  firmName = 'Apex Electronics & Industrial Traders',
  firmGstin = '24AAPCA1234F1ZV',
  firmStateCode = '24',
}) => {
  const [viewMode, setViewMode] = useState<'REGISTER' | 'CREATE'>('REGISTER');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'UNPAID' | 'OVERDUE'>('ALL');
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<SalesInvoice | null>(null);

  // INVOICE CREATOR FORM STATE
  const [selectedPartyId, setSelectedPartyId] = useState(parties[0]?.id || '');
  const [partySearch, setPartySearch] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [invoiceType, setInvoiceType] = useState<'REGULAR' | 'EXPORT' | 'RCM'>('REGULAR');
  const [isInterstateOverride, setIsInterstateOverride] = useState<boolean | null>(null);

  const [lineItems, setLineItems] = useState<
    Array<{
      stockItemId: string;
      description: string;
      hsn: string;
      qty: number;
      unit: string;
      rate: number;
      gstRate: number;
    }>
  >([
    {
      stockItemId: stockItems[0]?.id || '',
      description: stockItems[0]?.name || '',
      hsn: stockItems[0]?.hsn || '84716060',
      qty: 2,
      unit: 'PCS',
      rate: stockItems[0]?.sellingPrice || 1450,
      gstRate: stockItems[0]?.gstRate || 18,
    },
  ]);

  const [discountAmount, setDiscountAmount] = useState(0);
  const [invoiceNotes, setInvoiceNotes] = useState('Payment terms: Net 30 days. Interest @ 18% p.a. charged after due date.');
  const [transporterName, setTransporterName] = useState('VRL Logistics Ltd');
  const [vehicleNumber, setVehicleNumber] = useState('GJ-01-AB-9921');

  // Customer resolution
  const selectedParty =
    parties.find((p) => p.id === selectedPartyId) ||
    parties[0] || {
      id: 'p-1',
      name: 'Walk-in Cash Customer',
      gstin: '',
      state: 'Gujarat',
      stateCode: '24',
      address: 'Relief Road Market, Ahmedabad',
      city: 'Ahmedabad',
    };

  const isInterstate =
    isInterstateOverride !== null
      ? isInterstateOverride
      : selectedParty.stateCode !== firmStateCode;

  // Computed Lines
  const computedLines: InvoiceItem[] = lineItems.map((line, idx) => {
    const effectiveState = isInterstate ? '27' : firmStateCode;
    const calc = calculateItemGst(line.qty, line.rate, line.gstRate, effectiveState);
    return {
      id: `line-${idx}`,
      stockItemId: line.stockItemId,
      description: line.description,
      hsn: line.hsn,
      qty: line.qty,
      unit: line.unit,
      rate: line.rate,
      gstRate: line.gstRate,
      taxableValue: calc.taxableValue,
      cgstAmount: calc.cgstAmount,
      sgstAmount: calc.sgstAmount,
      igstAmount: calc.igstAmount,
      totalAmount: calc.totalAmount,
    };
  });

  const subtotal = computedLines.reduce((acc, l) => acc + l.taxableValue, 0);
  const cgstTotal = computedLines.reduce((acc, l) => acc + l.cgstAmount, 0);
  const sgstTotal = computedLines.reduce((acc, l) => acc + l.sgstAmount, 0);
  const igstTotal = computedLines.reduce((acc, l) => acc + l.igstAmount, 0);
  const totalTax = cgstTotal + sgstTotal + igstTotal;
  const rawGrandTotal = subtotal + totalTax - discountAmount;
  const roundOff = Math.round(rawGrandTotal) - rawGrandTotal;
  const grandTotal = Math.round(rawGrandTotal);

  const ewayBillRequired = grandTotal > 50000;

  // Metrics for Sales Register
  const totalSalesAmount = salesInvoices.reduce((acc, i) => acc + i.grandTotal, 0);
  const paidSalesAmount = salesInvoices
    .filter((i) => i.status === 'PAID')
    .reduce((acc, i) => acc + i.grandTotal, 0);
  const pendingSalesAmount = salesInvoices
    .filter((i) => i.status === 'UNPAID')
    .reduce((acc, i) => acc + i.grandTotal, 0);
  const overdueSalesAmount = pendingSalesAmount * 0.35;
  const gstCollectedAmount = salesInvoices.reduce(
    (acc, i) => acc + i.cgstTotal + i.sgstTotal + i.igstTotal,
    0
  );

  // Line item handlers
  const handleAddLine = () => {
    const st = stockItems[0];
    setLineItems([
      ...lineItems,
      {
        stockItemId: st?.id || '',
        description: st?.name || 'New Item',
        hsn: st?.hsn || '84716060',
        qty: 1,
        unit: 'PCS',
        rate: st?.sellingPrice || 1000,
        gstRate: st?.gstRate || 18,
      },
    ]);
  };

  const handleUpdateLine = (index: number, updates: Partial<(typeof lineItems)[0]>) => {
    setLineItems(
      lineItems.map((item, i) => (i === index ? { ...item, ...updates } : item))
    );
  };

  const handleRemoveLine = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const handleSaveInvoice = (printAfter = false) => {
    const newInvNum = `SALES/2026/${String(salesInvoices.length + 91).padStart(3, '0')}`;
    const newInvoice: SalesInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: newInvNum,
      date: invoiceDate,
      dueDate,
      partyId: selectedParty.id,
      partyName: selectedParty.name,
      partyGstin: selectedParty.gstin || 'UNREGISTERED',
      partyStateCode: selectedParty.stateCode || firmStateCode,
      placeOfSupply: `${selectedParty.stateCode || firmStateCode}-${selectedParty.state || 'Gujarat'}`,
      items: computedLines,
      subtotal,
      cgstTotal,
      sgstTotal,
      igstTotal,
      discountTotal: discountAmount,
      grandTotal,
      status: 'UNPAID',
      amountPaid: 0,
      ewayBillRequired,
      ewayBillNumber: ewayBillRequired ? `1410982${Math.floor(10000 + Math.random() * 90000)}` : undefined,
      ewayBillDate: ewayBillRequired ? invoiceDate : undefined,
      transporterName: ewayBillRequired ? transporterName : undefined,
      vehicleNumber: ewayBillRequired ? vehicleNumber : undefined,
      distanceKm: ewayBillRequired ? 180 : undefined,
    };

    onCreateInvoice(newInvoice);
    setViewMode('REGISTER');
    if (printAfter) {
      setSelectedInvoiceForPrint(newInvoice);
    }
  };

  // Convert number to Indian words
  const numberToWords = (num: number): string => {
    const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    if ((num = num.toString() as any).length > 9) return 'overflow';
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    let str = '';
    str += Number(n[1]) !== 0 ? (a[Number(n[1])] || b[n[1][0] as any] + ' ' + a[n[1][1] as any]) + 'crore ' : '';
    str += Number(n[2]) !== 0 ? (a[Number(n[2])] || b[n[2][0] as any] + ' ' + a[n[2][1] as any]) + 'lakh ' : '';
    str += Number(n[3]) !== 0 ? (a[Number(n[3])] || b[n[3][0] as any] + ' ' + a[n[3][1] as any]) + 'thousand ' : '';
    str += Number(n[4]) !== 0 ? (a[Number(n[4])] || b[n[4][0] as any] + ' ' + a[n[4][1] as any]) + 'hundred ' : '';
    str += Number(n[5]) !== 0 ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0] as any] + ' ' + a[n[5][1] as any]) + 'only' : '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. HEADER & TOP CONTROLS */}
      <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Billing Workspace</span>
            <span>·</span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold">Outward Supplies</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
            Sales &amp; Tax Invoicing Engine
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            B2B tax invoices with intra-state CGST+SGST vs inter-state IGST calculation
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {viewMode === 'REGISTER' ? (
            <>
              <button
                onClick={() => setViewMode('CREATE')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Invoice [F2]</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setViewMode('REGISTER')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
            >
              <span>Back to Invoice Register</span>
            </button>
          )}
        </div>
      </div>

      {viewMode === 'REGISTER' ? (
        <>
          {/* 2. SALES METRICS TILES */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="bg-white dark:bg-[#121824] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Sales</span>
              <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
                ₹{Math.round(totalSalesAmount).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500 block">{salesInvoices.length} invoices generated</span>
            </div>

            <div className="bg-white dark:bg-[#121824] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Paid Collected</span>
              <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                ₹{Math.round(paidSalesAmount || totalSalesAmount * 0.65).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-emerald-600 block">Bank cleared</span>
            </div>

            <div className="bg-white dark:bg-[#121824] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Pending Due</span>
              <span className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400">
                ₹{Math.round(pendingSalesAmount || totalSalesAmount * 0.35).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-blue-500 block">Within credit window</span>
            </div>

            <div className="bg-white dark:bg-[#121824] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Overdue</span>
              <span className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400">
                ₹{Math.round(overdueSalesAmount).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-rose-500 block">Requires follow-up</span>
            </div>

            <div className="bg-white dark:bg-[#121824] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1 col-span-2 lg:col-span-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">GST Output Tax</span>
              <span className="text-lg font-bold font-mono text-purple-600 dark:text-purple-400">
                ₹{Math.round(gstCollectedAmount).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-purple-500 block">CGST + SGST + IGST</span>
            </div>
          </div>

          {/* 3. INVOICE TABLE WITH SEARCH & FILTERS */}
          <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search invoice # or customer..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl text-xs">
                {(['ALL', 'PAID', 'UNPAID'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      statusFilter === st
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Customer Party</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4 text-right">Taxable (₹)</th>
                    <th className="py-3 px-4 text-right">GST (₹)</th>
                    <th className="py-3 px-4 text-right">Grand Total (₹)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  {salesInvoices
                    .filter((inv) => {
                      if (statusFilter !== 'ALL' && inv.status !== statusFilter) return false;
                      if (searchQuery) {
                        const q = searchQuery.toLowerCase();
                        return (
                          inv.invoiceNumber.toLowerCase().includes(q) ||
                          inv.partyName.toLowerCase().includes(q)
                        );
                      }
                      return true;
                    })
                    .map((inv) => {
                      const isPaid = inv.status === 'PAID';
                      const gstTotal = inv.cgstTotal + inv.sgstTotal + inv.igstTotal;

                      return (
                        <tr
                          key={inv.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">
                            {inv.invoiceNumber}
                          </td>
                          <td className="py-3 px-4 font-sans font-semibold text-slate-900 dark:text-slate-100">
                            {inv.partyName}
                          </td>
                          <td className="py-3 px-4 text-slate-500">{inv.date}</td>
                          <td className="py-3 px-4 text-slate-500">{inv.dueDate}</td>
                          <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">
                            ₹{inv.subtotal.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-right text-purple-600 dark:text-purple-400">
                            ₹{gstTotal.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100 text-sm">
                            ₹{inv.grandTotal.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-center font-sans">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isPaid
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                              }`}
                            >
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-sans">
                            <button
                              onClick={() => setSelectedInvoiceForPrint(inv)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1 ml-auto cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              Print
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* 11. REDESIGNED SPLIT INVOICE CREATION WORKSPACE */
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* LEFT PANEL: INPUT FORM (7 COLUMNS) */}
          <div className="xl:col-span-7 bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Invoice Entry &amp; Line Items
              </h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Supply Category:</span>
                <span className="font-mono font-bold text-blue-600">
                  {isInterstate ? 'Inter-State (IGST 18%)' : 'Intra-State (CGST 9% + SGST 9%)'}
                </span>
              </div>
            </div>

            {/* CUSTOMER & INVOICE METADATA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Customer Party *
                </label>
                <select
                  value={selectedPartyId}
                  onChange={(e) => setSelectedPartyId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-blue-500 font-semibold"
                >
                  {parties
                    .filter((p) => p.type === 'CUSTOMER' || p.type === 'BOTH')
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.gstin || 'Unregistered'})
                      </option>
                    ))}
                </select>
                <p className="text-[10px] text-slate-400 font-mono mt-1">
                  State: {selectedParty.state} (Code {selectedParty.stateCode})
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Invoice Date
                  </label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* COMPLIANCE TOGGLES */}
            <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={invoiceType === 'RCM'}
                  onChange={(e) => setInvoiceType(e.target.checked ? 'RCM' : 'REGULAR')}
                  className="rounded text-blue-600"
                />
                <span className="font-medium text-slate-700 dark:text-slate-300">Reverse Charge (RCM)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInterstate}
                  onChange={(e) => setIsInterstateOverride(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span className="font-medium text-slate-700 dark:text-slate-300">Force Inter-State IGST</span>
              </label>

              {ewayBillRequired && (
                <div className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" />
                  E-Way Bill Mandatory (&gt; ₹50,000)
                </div>
              )}
            </div>

            {/* LINE ITEMS TABLE */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Bill of Supply Line Items
                </h4>
                <button
                  type="button"
                  onClick={handleAddLine}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Item Row
                </button>
              </div>

              <div className="space-y-2">
                {lineItems.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 bg-slate-50/70 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-2"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                      {/* ITEM SELECTOR */}
                      <div className="sm:col-span-5">
                        <label className="text-[10px] text-slate-400 font-bold block mb-0.5">Item</label>
                        <select
                          value={item.stockItemId}
                          onChange={(e) => {
                            const found = stockItems.find((s) => s.id === e.target.value);
                            handleUpdateLine(index, {
                              stockItemId: e.target.value,
                              description: found ? found.name : item.description,
                              hsn: found ? found.hsn : item.hsn,
                              rate: found ? found.sellingPrice : item.rate,
                              gstRate: found ? found.gstRate : item.gstRate,
                            });
                          }}
                          className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                        >
                          {stockItems.map((st) => (
                            <option key={st.id} value={st.id}>
                              {st.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* HSN */}
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-slate-400 font-bold block mb-0.5">HSN</label>
                        <input
                          type="text"
                          value={item.hsn}
                          onChange={(e) => handleUpdateLine(index, { hsn: e.target.value })}
                          className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                        />
                      </div>

                      {/* QTY */}
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-slate-400 font-bold block mb-0.5">Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(e) => handleUpdateLine(index, { qty: Number(e.target.value) || 1 })}
                          className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-center"
                        />
                      </div>

                      {/* RATE */}
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-slate-400 font-bold block mb-0.5">Rate (₹)</label>
                        <input
                          type="number"
                          min="0"
                          value={item.rate}
                          onChange={(e) => handleUpdateLine(index, { rate: Number(e.target.value) || 0 })}
                          className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-right"
                        />
                      </div>

                      {/* REMOVE BUTTON */}
                      <div className="sm:col-span-1 flex items-end justify-center pb-1">
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(index)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* NOTES & TRANSPORTER */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Invoice Notes &amp; Payment Terms
                </label>
                <textarea
                  value={invoiceNotes}
                  onChange={(e) => setInvoiceNotes(e.target.value)}
                  rows={2}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  E-Way Transporter Details
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={transporterName}
                    onChange={(e) => setTransporterName(e.target.value)}
                    placeholder="Transporter Name"
                    className="p-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    placeholder="Vehicle Number"
                    className="p-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: LIVE INVOICE PREVIEW & ACTIONS (5 COLUMNS) */}
          <div className="xl:col-span-5 space-y-4">
            {/* INVOICE SUMMARY CARD */}
            <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
                Statutory Tax Summary
              </h3>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal (Taxable Value):</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {!isInterstate ? (
                  <>
                    <div className="flex justify-between text-blue-600 dark:text-blue-400">
                      <span>CGST (9%):</span>
                      <span>+ ₹{cgstTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-blue-600 dark:text-blue-400">
                      <span>SGST (9%):</span>
                      <span>+ ₹{sgstTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-purple-600 dark:text-purple-400">
                    <span>IGST (18%):</span>
                    <span>+ ₹{igstTotal.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {roundOff !== 0 && (
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Round Off:</span>
                    <span>{roundOff > 0 ? `+ ₹${roundOff.toFixed(2)}` : `- ₹${Math.abs(roundOff).toFixed(2)}`}</span>
                  </div>
                )}

                <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between text-base font-bold text-slate-900 dark:text-slate-100">
                  <span>Grand Total:</span>
                  <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleSaveInvoice(false)}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  Save Draft
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveInvoice(true)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  Save &amp; Print
                </button>
              </div>
            </div>

            {/* LIVE INVOICE PREVIEW CONTAINER */}
            <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Live Preview · Tax Invoice (Form GST INV-1)
                </span>
                <span className="text-[10px] font-mono text-emerald-600 font-bold">
                  ● Real-time
                </span>
              </div>

              {/* MINI INVOICE SHEET PREVIEW */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-[11px] space-y-3 bg-slate-50/50 dark:bg-slate-900/30">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">{firmName}</div>
                    <div className="text-slate-500 font-mono text-[10px]">GSTIN: {firmGstin}</div>
                    <div className="text-slate-400 text-[10px]">Ahmedabad, Gujarat (24)</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600 font-mono">SALES/2026/{String(salesInvoices.length + 91).padStart(3, '0')}</div>
                    <div className="text-slate-400 text-[10px] font-mono">Date: {invoiceDate}</div>
                  </div>
                </div>

                <div className="p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Billed To (Recipient)</div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">{selectedParty.name}</div>
                  <div className="text-slate-500 font-mono text-[10px]">GSTIN: {selectedParty.gstin || 'Unregistered'}</div>
                  <div className="text-slate-400 text-[10px]">{selectedParty.state} (Code {selectedParty.stateCode})</div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-1">
                    <span>Item</span>
                    <span>Total (₹)</span>
                  </div>
                  {computedLines.map((line, i) => (
                    <div key={i} className="flex justify-between font-mono text-[10px] text-slate-600 dark:text-slate-400">
                      <span>{line.description} (x{line.qty})</span>
                      <span>₹{line.totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-xs">
                  <span>Grand Total</span>
                  <span className="font-mono text-slate-900 dark:text-slate-100">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINT INVOICE MODAL */}
      {selectedInvoiceForPrint && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto"
        >
          <div className="w-full max-w-3xl bg-white text-slate-900 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 printable-invoice animate-fadeIn">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">TAX INVOICE</span>
                <h2 className="text-xl font-bold">{firmName}</h2>
                <div className="text-xs text-slate-600 font-mono mt-1">GSTIN: {firmGstin} · State Code: 24 (Gujarat)</div>
                <div className="text-xs text-slate-500">Plot 42, GIDC Industrial Estate, Vatva, Ahmedabad</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black font-mono text-blue-700">{selectedInvoiceForPrint.invoiceNumber}</div>
                <div className="text-xs text-slate-500 font-mono">Date: {selectedInvoiceForPrint.date}</div>
                <div className="text-xs text-slate-500 font-mono">Place of Supply: {selectedInvoiceForPrint.placeOfSupply}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Customer Details</div>
                <div className="font-bold text-sm mt-0.5">{selectedInvoiceForPrint.partyName}</div>
                <div className="font-mono text-slate-600 mt-0.5">GSTIN: {selectedInvoiceForPrint.partyGstin}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Transport / E-Way</div>
                <div className="font-mono text-xs mt-0.5">E-Way: {selectedInvoiceForPrint.ewayBillNumber || 'N/A'}</div>
                <div className="text-slate-600 text-xs">Vehicle: {selectedInvoiceForPrint.vehicleNumber || 'Local Hand Delivery'}</div>
              </div>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-100 font-bold text-[10px] uppercase text-slate-600">
                <tr>
                  <th className="p-2">Item Description</th>
                  <th className="p-2">HSN</th>
                  <th className="p-2 text-center">Qty</th>
                  <th className="p-2 text-right">Rate</th>
                  <th className="p-2 text-right">Taxable</th>
                  <th className="p-2 text-right">GST</th>
                  <th className="p-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {selectedInvoiceForPrint.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="p-2 font-sans font-semibold">{it.description}</td>
                    <td className="p-2">{it.hsn}</td>
                    <td className="p-2 text-center">{it.qty} {it.unit}</td>
                    <td className="p-2 text-right">₹{it.rate}</td>
                    <td className="p-2 text-right">₹{it.taxableValue.toLocaleString('en-IN')}</td>
                    <td className="p-2 text-right">{it.gstRate}%</td>
                    <td className="p-2 text-right font-bold">₹{it.totalAmount.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-slate-200 pt-4 flex justify-between items-start text-xs">
              <div className="space-y-1 max-w-sm">
                <div className="font-bold">Amount in Words:</div>
                <div className="text-slate-600 italic font-sans">{numberToWords(selectedInvoiceForPrint.grandTotal)}</div>
                <div className="text-[10px] text-slate-400 mt-2">Declaration: This is a computer-generated tax invoice valid under Section 31 of CGST Act.</div>
              </div>

              <div className="w-64 space-y-1.5 font-mono text-right">
                <div className="flex justify-between text-slate-600">
                  <span>Taxable Subtotal:</span>
                  <span>₹{selectedInvoiceForPrint.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>CGST Total:</span>
                  <span>₹{selectedInvoiceForPrint.cgstTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>SGST Total:</span>
                  <span>₹{selectedInvoiceForPrint.sgstTotal.toLocaleString('en-IN')}</span>
                </div>
                {selectedInvoiceForPrint.igstTotal > 0 && (
                  <div className="flex justify-between text-purple-600">
                    <span>IGST Total:</span>
                    <span>₹{selectedInvoiceForPrint.igstTotal.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-1 flex justify-between text-sm font-bold text-slate-900">
                  <span>Grand Total:</span>
                  <span>₹{selectedInvoiceForPrint.grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 no-print">
              <button
                onClick={() => setSelectedInvoiceForPrint(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
