import React, { useState } from 'react';
import type { PurchaseInvoice, InvoiceItem } from '../types/tax';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  FileText,
  Percent,
  ShieldCheck,
  Zap,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ScannedInvoiceReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: PurchaseInvoice | null;
  onSaveAndPost: (verifiedInvoice: PurchaseInvoice) => void;
}

export const ScannedInvoiceReviewModal: React.FC<ScannedInvoiceReviewModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSaveAndPost
}) => {
  if (!isOpen || !initialData) return null;

  const [supplierName, setSupplierName] = useState(initialData.supplierName || '');
  const [supplierGstin, setSupplierGstin] = useState(initialData.supplierGstin || '');
  const [supplierStateCode, setSupplierStateCode] = useState(initialData.supplierStateCode || '24');
  const [invoiceNumber, setInvoiceNumber] = useState(initialData.invoiceNumber || '');
  const [invoiceDate, setInvoiceDate] = useState(initialData.date || new Date().toISOString().split('T')[0]);
  
  // Multi-Item Dynamic Array State
  const [items, setItems] = useState<InvoiceItem[]>(() => {
    if (initialData.items && initialData.items.length > 0) {
      return initialData.items;
    }
    return [
      {
        id: `item-1-${Date.now()}`,
        description: 'Commercial Inward Goods',
        hsn: '84818030',
        qty: 10,
        unit: 'NOS',
        rate: 1000,
        gstRate: 18,
        taxableValue: 10000,
        cgstAmount: 900,
        sgstAmount: 900,
        igstAmount: 0,
        totalAmount: 11800
      }
    ];
  });

  const isInterState = supplierStateCode !== '24'; // Interstate when vendor is outside Gujarat (24)

  // Handle Vendor GSTIN change & State detection
  const handleGstinChange = (val: string) => {
    const clean = val.trim().toUpperCase();
    setSupplierGstin(clean);
    if (clean.length >= 2 && /^\d{2}/.test(clean)) {
      setSupplierStateCode(clean.substring(0, 2));
    }
  };

  // Item field update handler
  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

    const qty = Number(item.qty) || 0;
    const rate = Number(item.rate) || 0;
    const gstRate = Number(item.gstRate) || 18;

    const taxableValue = Math.round(qty * rate * 100) / 100;
    const cgstAmount = isInterState ? 0 : Math.round(taxableValue * (gstRate / 2) / 100 * 100) / 100;
    const sgstAmount = isInterState ? 0 : Math.round(taxableValue * (gstRate / 2) / 100 * 100) / 100;
    const igstAmount = isInterState ? Math.round(taxableValue * gstRate / 100 * 100) / 100 : 0;
    const totalAmount = Math.round((taxableValue + cgstAmount + sgstAmount + igstAmount) * 100) / 100;

    item.taxableValue = taxableValue;
    item.cgstAmount = cgstAmount;
    item.sgstAmount = sgstAmount;
    item.igstAmount = igstAmount;
    item.totalAmount = totalAmount;

    updated[index] = item;
    setItems(updated);
  };

  // Add new item row
  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${items.length + 1}-${Date.now()}`,
      description: 'Additional Line Item',
      hsn: '84818030',
      qty: 1,
      unit: 'NOS',
      rate: 500,
      gstRate: 18,
      taxableValue: 500,
      cgstAmount: isInterState ? 0 : 45,
      sgstAmount: isInterState ? 0 : 45,
      igstAmount: isInterState ? 90 : 0,
      totalAmount: 590
    };
    setItems([...items, newItem]);
  };

  // Remove item row
  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Aggregated totals across all items
  const totalTaxable = Math.round(items.reduce((sum, it) => sum + (it.taxableValue || 0), 0) * 100) / 100;
  const totalCgst = Math.round(items.reduce((sum, it) => sum + (it.cgstAmount || 0), 0) * 100) / 100;
  const totalSgst = Math.round(items.reduce((sum, it) => sum + (it.sgstAmount || 0), 0) * 100) / 100;
  const totalIgst = Math.round(items.reduce((sum, it) => sum + (it.igstAmount || 0), 0) * 100) / 100;
  const grandTotal = Math.round(items.reduce((sum, it) => sum + (it.totalAmount || 0), 0) * 100) / 100;

  const handleConfirm = () => {
    const verifiedInvoice: PurchaseInvoice = {
      ...initialData,
      supplierName,
      supplierGstin,
      supplierStateCode,
      invoiceNumber,
      date: invoiceDate,
      taxableValue: totalTaxable,
      cgstTotal: totalCgst,
      sgstTotal: totalSgst,
      igstTotal: totalIgst,
      grandTotal: grandTotal,
      ocrConfidence: 99.8,
      ocrStatus: 'SCANNED',
      items: items,
      notes: `Verified Purchase Invoice (${supplierName}, Inv: ${invoiceNumber}, ${items.length} items)`
    };

    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.6 }
    });

    onSaveAndPost(verifiedInvoice);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 flex flex-col max-h-[94vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900 text-white p-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-500/20 rounded-xl border border-purple-400/30">
              <Sparkles className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">AI Scanned Bill Review &amp; Multi-Item Verification</h2>
              <p className="text-[11px] text-purple-200">
                Review all extracted line items, HSNs, tax rates &amp; totals before posting to books
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 bg-slate-50 flex-1">
          
          {/* Top Section: Supplier & Invoice Metadata */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Supplier Name */}
              <div className="md:col-span-1">
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Supplier / Vendor Name
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="e.g. Raga Pvt Ltd"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Supplier GSTIN */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Supplier GSTIN (15 Digits)
                </label>
                <input
                  type="text"
                  maxLength={15}
                  value={supplierGstin}
                  onChange={(e) => handleGstinChange(e.target.value)}
                  placeholder="33AAAGP0685F1ZH"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600 uppercase"
                />
              </div>

              {/* Invoice Number & Date */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    Invoice No
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="INV26"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    Date
                  </label>
                  <input
                    type="text"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    placeholder="DD/MM/YYYY"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Middle Section: Multi-Item Table */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-purple-600" /> Extracted Line Items ({items.length})
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Item Row
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-2.5 pl-3">Item Description</th>
                    <th className="p-2.5 w-20">HSN</th>
                    <th className="p-2.5 w-20">Qty</th>
                    <th className="p-2.5 w-20">Unit</th>
                    <th className="p-2.5 w-24">Rate (₹)</th>
                    <th className="p-2.5 w-24">GST %</th>
                    <th className="p-2.5 w-24 text-right">Taxable</th>
                    <th className="p-2.5 w-28 text-right">Total (₹)</th>
                    <th className="p-2.5 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {items.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50/80">
                      <td className="p-2 pl-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.hsn || ''}
                          onChange={(e) => handleItemChange(idx, 'hsn', e.target.value)}
                          placeholder="8481"
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => handleItemChange(idx, 'qty', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-center"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs uppercase text-center"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => handleItemChange(idx, 'rate', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-right"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={item.gstRate}
                          onChange={(e) => handleItemChange(idx, 'gstRate', parseInt(e.target.value, 10))}
                          className="w-full px-1.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                        >
                          <option value={0}>0%</option>
                          <option value={5}>5%</option>
                          <option value={12}>12%</option>
                          <option value={18}>18%</option>
                          <option value={28}>28%</option>
                        </select>
                      </td>
                      <td className="p-2 text-right font-mono font-semibold text-slate-700">
                        ₹{item.taxableValue?.toLocaleString('en-IN')}
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-purple-900">
                        ₹{item.totalAmount?.toLocaleString('en-IN')}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          disabled={items.length <= 1}
                          className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-30 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Summary Card */}
          <div className="bg-slate-900 text-white p-4 px-6 rounded-2xl flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Taxable Subtotal</span>
                <span className="font-bold text-sm text-slate-200">₹{totalTaxable.toLocaleString('en-IN')}</span>
              </div>
              {isInterState ? (
                <div>
                  <span className="text-purple-300 block text-[10px] uppercase">IGST Total</span>
                  <span className="font-bold text-sm text-purple-200">₹{totalIgst.toLocaleString('en-IN')}</span>
                </div>
              ) : (
                <>
                  <div>
                    <span className="text-blue-300 block text-[10px] uppercase">CGST Total</span>
                    <span className="font-bold text-sm text-blue-200">₹{totalCgst.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-blue-300 block text-[10px] uppercase">SGST Total</span>
                    <span className="font-bold text-sm text-blue-200">₹{totalSgst.toLocaleString('en-IN')}</span>
                  </div>
                </>
              )}
            </div>

            <div className="text-right">
              <span className="text-emerald-400 block text-[10px] uppercase font-sans font-bold">Grand Total Payable</span>
              <span className="text-xl font-black text-emerald-400">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" /> Confirm &amp; Post All Items to Books
          </button>
        </div>

      </div>
    </div>
  );
};
