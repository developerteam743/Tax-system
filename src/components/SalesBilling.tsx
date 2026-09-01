import React, { useState } from 'react';
import type { Party, SalesInvoice, StockItem, InvoiceItem } from '../types/tax';
import { calculateItemGst, formatCurrency } from '../utils/gst';
import {
  Receipt,
  Plus,
  Trash2,
  CheckCircle2,
  Printer,
  X,
  Truck,
  Sparkles,
  QrCode,
} from 'lucide-react';

interface SalesBillingProps {
  parties: Party[];
  stockItems: StockItem[];
  salesInvoices: SalesInvoice[];
  onCreateInvoice: (inv: SalesInvoice) => void;
}

export const SalesBilling: React.FC<SalesBillingProps> = ({
  parties,
  stockItems,
  salesInvoices,
  onCreateInvoice,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<SalesInvoice | null>(null);

  // Invoice Form State
  const [selectedPartyId, setSelectedPartyId] = useState(parties[0]?.id || '');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [lineItems, setLineItems] = useState<
    { stockItemId: string; description: string; hsn: string; qty: number; rate: number; gstRate: number }[]
  >([
    {
      stockItemId: stockItems[0]?.id || '',
      description: stockItems[0]?.name || '',
      hsn: stockItems[0]?.hsn || '',
      qty: 1,
      rate: stockItems[0]?.sellingPrice || 0,
      gstRate: stockItems[0]?.gstRate || 18,
    },
  ]);

  const [transporterName, setTransporterName] = useState('VRL Logistics Ltd');
  const [vehicleNumber, setVehicleNumber] = useState('GJ-01-AB-9921');

  const selectedParty = parties.find((p) => p.id === selectedPartyId) || parties[0];

  // Calculate totals dynamically
  const computedLines: InvoiceItem[] = lineItems.map((line, idx) => {
    const calc = calculateItemGst(
      line.qty,
      line.rate,
      line.gstRate,
      selectedParty?.stateCode || '24'
    );

    return {
      id: `line-${idx}`,
      stockItemId: line.stockItemId,
      description: line.description,
      hsn: line.hsn,
      qty: line.qty,
      unit: 'PCS',
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
  const grandTotal = computedLines.reduce((acc, l) => acc + l.totalAmount, 0);

  const ewayBillRequired = grandTotal > 50000;

  const handleAddLine = () => {
    const defaultStock = stockItems[0];
    setLineItems([
      ...lineItems,
      {
        stockItemId: defaultStock?.id || '',
        description: defaultStock?.name || '',
        hsn: defaultStock?.hsn || '',
        qty: 1,
        rate: defaultStock?.sellingPrice || 0,
        gstRate: defaultStock?.gstRate || 18,
      },
    ]);
  };

  const handleRemoveLine = (idx: number) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== idx));
  };

  const handleSaveInvoice = () => {
    const newInvNum = `SALES/2026/${String(salesInvoices.length + 91).padStart(3, '0')}`;
    const newInvoice: SalesInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: newInvNum,
      date: invoiceDate,
      dueDate: invoiceDate,
      partyId: selectedParty.id,
      partyName: selectedParty.name,
      partyGstin: selectedParty.gstin,
      partyStateCode: selectedParty.stateCode,
      placeOfSupply: `${selectedParty.stateCode}-${selectedParty.state}`,
      items: computedLines,
      subtotal,
      cgstTotal,
      sgstTotal,
      igstTotal,
      discountTotal: 0,
      grandTotal,
      status: 'UNPAID',
      amountPaid: 0,
      ewayBillRequired,
      ewayBillNumber: ewayBillRequired ? `1410982${Math.floor(10000 + Math.random() * 90000)}` : undefined,
      transporterName: ewayBillRequired ? transporterName : undefined,
      vehicleNumber: ewayBillRequired ? vehicleNumber : undefined,
      distanceKm: ewayBillRequired ? 180 : undefined,
    };

    onCreateInvoice(newInvoice);
    setShowCreateModal(false);
    setSelectedInvoiceForPrint(newInvoice);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-md">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-blue-600" />
            Sales Billing &amp; Fast Invoice Creator
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Intra-state (CGST 9% + SGST 9%) vs Inter-state (IGST 18%) auto-calculation based on Gujarat state code (24).
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 font-bold text-xs px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create New GST Sales Bill
        </button>
      </div>

      {/* Sales Invoices Register Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">
            Recent Sales Invoices Register ({salesInvoices.length} Bills)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Invoice #</th>
                <th className="p-3">Date</th>
                <th className="p-3">Customer Party</th>
                <th className="p-3">State Code</th>
                <th className="p-3">Taxable Value</th>
                <th className="p-3">GST Total</th>
                <th className="p-3">Grand Total</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {salesInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-mono font-bold text-blue-700">{inv.invoiceNumber}</td>
                  <td className="p-3 text-slate-500 font-mono">{inv.date}</td>
                  <td className="p-3 font-bold text-slate-900">{inv.partyName}</td>
                  <td className="p-3 font-mono text-slate-600">{inv.partyStateCode} ({inv.placeOfSupply})</td>
                  <td className="p-3 text-slate-700">{formatCurrency(inv.subtotal)}</td>
                  <td className="p-3 font-mono text-purple-600 font-semibold">
                    {formatCurrency(inv.cgstTotal + inv.sgstTotal + inv.igstTotal)}
                  </td>
                  <td className="p-3 font-black text-slate-900 text-sm">{formatCurrency(inv.grandTotal)}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setSelectedInvoiceForPrint(inv)}
                      className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-200 hover:bg-blue-100 text-xs flex items-center gap-1.5 ml-auto cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print Invoice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Fast Invoice Creator */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 w-full max-w-4xl rounded-2xl p-6 shadow-2xl space-y-6 my-8 text-slate-800 animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" /> Fast GST Sales Bill Builder
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Default Place of Supply: Gujarat (State 24). Auto-selects CGST+SGST vs IGST.
                </p>
              </div>

              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Party & Date Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Select Customer Party</label>
                <select
                  value={selectedPartyId}
                  onChange={(e) => setSelectedPartyId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
                >
                  {parties
                    .filter((p) => p.type === 'CUSTOMER')
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.gstin}) - State {p.stateCode}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Invoice Date</label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Bill Line Items</span>
                <button
                  onClick={handleAddLine}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Item Line
                </button>
              </div>

              <div className="space-y-2">
                {lineItems.map((line, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                    <div className="col-span-4">
                      <select
                        value={line.stockItemId}
                        onChange={(e) => {
                          const st = stockItems.find((s) => s.id === e.target.value);
                          if (st) {
                            const updated = [...lineItems];
                            updated[idx] = {
                              stockItemId: st.id,
                              description: st.name,
                              hsn: st.hsn,
                              qty: line.qty,
                              rate: st.sellingPrice,
                              gstRate: st.gstRate,
                            };
                            setLineItems(updated);
                          }
                        }}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 font-semibold text-slate-800"
                      >
                        {stockItems.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.name} (HSN {st.hsn})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2">
                      <input
                        type="number"
                        min="1"
                        value={line.qty}
                        onChange={(e) => {
                          const updated = [...lineItems];
                          updated[idx].qty = Number(e.target.value);
                          setLineItems(updated);
                        }}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 font-semibold text-center"
                        placeholder="Qty"
                      />
                    </div>

                    <div className="col-span-3">
                      <input
                        type="number"
                        value={line.rate}
                        onChange={(e) => {
                          const updated = [...lineItems];
                          updated[idx].rate = Number(e.target.value);
                          setLineItems(updated);
                        }}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 font-semibold text-right"
                        placeholder="Rate ₹"
                      />
                    </div>

                    <div className="col-span-2 text-right font-bold text-slate-900">
                      {formatCurrency(line.qty * line.rate)}
                    </div>

                    <div className="col-span-1 text-center">
                      <button
                        onClick={() => handleRemoveLine(idx)}
                        className="text-rose-500 hover:text-rose-700 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* GST Summary Cards */}
            <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Subtotal (Taxable)</span>
                <span className="font-bold text-slate-900 text-sm">{formatCurrency(subtotal)}</span>
              </div>

              <div>
                <span className="text-slate-500 block">
                  {selectedParty?.stateCode === '24' ? 'CGST (9%) + SGST (9%)' : 'IGST (18%)'}
                </span>
                <span className="font-bold text-purple-700 text-sm">
                  {formatCurrency(cgstTotal + sgstTotal + igstTotal)}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block">E-Way Bill Status</span>
                <span className={`font-bold ${ewayBillRequired ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {ewayBillRequired ? 'REQUIRED (>₹50k)' : 'Not Required'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block">Grand Total</span>
                <span className="font-black text-blue-700 text-base">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveInvoice}
                className="flex items-center gap-2 text-xs font-bold px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" /> Save &amp; Generate Tax Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Printable Tax Invoice View */}
      {selectedInvoiceForPrint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 border border-slate-300 w-full max-w-3xl rounded-2xl p-8 shadow-2xl space-y-6 printable-invoice">
            {/* Header */}
            <div className="flex justify-between border-b border-slate-200 pb-4">
              <div>
                <h1 className="text-xl font-black text-blue-900 tracking-tight">APEX ELECTRONICS &amp; TRADERS</h1>
                <p className="text-xs text-slate-600 mt-1">
                  102 Ring Road Market, Relief Road, Ahmedabad, Gujarat - 380001<br />
                  GSTIN: <span className="font-mono font-bold text-slate-800">24AAPCA1234F1ZV</span> (State Code: 24)
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-black uppercase px-3 py-1 rounded bg-blue-100 text-blue-800 border border-blue-200">
                  TAX INVOICE
                </span>
                <p className="text-xs font-mono font-bold mt-2 text-slate-900">#{selectedInvoiceForPrint.invoiceNumber}</p>
                <p className="text-xs text-slate-500">Date: {selectedInvoiceForPrint.date}</p>
              </div>
            </div>

            {/* Bill To Info */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between text-xs">
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider block">Billed To (Customer)</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedInvoiceForPrint.partyName}</p>
                <p className="text-slate-600 font-mono">GSTIN: {selectedInvoiceForPrint.partyGstin}</p>
                <p className="text-slate-600">Place of Supply: {selectedInvoiceForPrint.placeOfSupply}</p>
              </div>

              {selectedInvoiceForPrint.ewayBillRequired && (
                <div className="text-right border-l border-slate-200 pl-4">
                  <span className="text-amber-700 font-bold flex items-center justify-end gap-1">
                    <Truck className="w-3.5 h-3.5" /> E-Way Bill Attached
                  </span>
                  <p className="font-mono font-bold text-slate-900">EWB: {selectedInvoiceForPrint.ewayBillNumber}</p>
                  <p className="text-slate-500">Transporter: {selectedInvoiceForPrint.transporterName}</p>
                </div>
              )}
            </div>

            {/* Line Items Table */}
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-300 text-slate-500 font-bold uppercase">
                  <th className="py-2">Item Description</th>
                  <th className="py-2">HSN</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Rate (₹)</th>
                  <th className="py-2 text-right">Taxable (₹)</th>
                  <th className="py-2 text-right">GST (₹)</th>
                  <th className="py-2 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {selectedInvoiceForPrint.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 font-bold text-slate-900">{item.description}</td>
                    <td className="py-2.5 font-mono text-slate-600">{item.hsn}</td>
                    <td className="py-2.5 text-center font-semibold">{item.qty} {item.unit}</td>
                    <td className="py-2.5 text-right font-mono">{formatCurrency(item.rate)}</td>
                    <td className="py-2.5 text-right font-mono">{formatCurrency(item.taxableValue)}</td>
                    <td className="py-2.5 text-right font-mono text-purple-700">
                      {formatCurrency(item.cgstAmount + item.sgstAmount + item.igstAmount)}
                    </td>
                    <td className="py-2.5 text-right font-mono font-black">{formatCurrency(item.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* UPI QR & Payment Seal */}
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-800">
                  <QrCode className="w-10 h-10 text-blue-700" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Scan UPI QR to Pay</span>
                  <span className="text-[11px] text-slate-500 font-mono">apex@hdfcbank • PhonePe / GPay</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 block">Grand Total Payable</span>
                <span className="text-xl font-black text-blue-900">{formatCurrency(selectedInvoiceForPrint.grandTotal)}</span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-between items-center pt-2 print:hidden">
              <button
                onClick={() => setSelectedInvoiceForPrint(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                Close Preview
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 text-xs font-bold px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print GST Invoice PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
