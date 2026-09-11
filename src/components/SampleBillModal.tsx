import React from 'react';
import { X, Copy, Check, Sparkles, Building2, ShieldCheck } from 'lucide-react';

interface SampleBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanThisBill: () => void;
}

export const SampleBillModal: React.FC<SampleBillModalProps> = ({ isOpen, onClose, onScanThisBill }) => {
  const [copied, setCopied] = React.useState(false);
  if (!isOpen) return null;

  const billText = `TAX INVOICE / BILL OF SUPPLY
Supplier: Gujarat Industrial Polymers & Chemicals Ltd
GSTIN: 24AAACG9988K1Z5 | State: Gujarat (24)
Address: Plot 108, GIDC Phase-IV, Vatva, Ahmedabad - 382445
Invoice No: GIP/2026-27/0842 | Date: 16-Aug-2026

Bill To: Apex Electronics & Industrial Traders
GSTIN: 24AAPCA1234F1ZV | State: Gujarat (24)

Item 1: Industrial Polypropylene Granules (Grade-A)
HSN: 39021000 | Qty: 25 BAGS | Rate: ₹1,200.00
Taxable Value: ₹30,000.00
CGST @ 9%: ₹2,700.00
SGST @ 9%: ₹2,700.00
Grand Total: ₹35,400.00`;

  const handleCopy = () => {
    navigator.clipboard.writeText(billText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-0 sm:p-4 overflow-y-auto overscroll-contain">
      <div className="bg-white rounded-none sm:rounded-3xl shadow-2xl max-w-2xl w-full min-h-screen sm:min-h-0 sm:max-h-[calc(100dvh-2rem)] overflow-hidden border-0 sm:border border-slate-200 animate-in zoom-in-95 duration-200 flex flex-col">
        <div className="bg-slate-900 text-white p-3 sm:p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0"><Building2 className="w-5 h-5 text-blue-400 shrink-0" /><span className="font-bold text-sm leading-5 break-words">Official Gujarat MSME Sample Purchase Bill</span></div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button onClick={handleCopy} className="min-h-11 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all text-slate-300 hover:text-white">{copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}{copied ? 'Copied' : 'Copy Text'}</button>
            <button onClick={onClose} aria-label="Close sample bill" className="min-w-11 min-h-11 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all flex items-center justify-center"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="p-3 sm:p-6 overflow-y-auto bg-slate-50 flex-1 min-h-0">
          <div className="bg-white p-4 sm:p-8 rounded-2xl border border-slate-300 shadow-sm text-xs font-sans space-y-5 print:border-none print:shadow-none min-w-0">
            <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="min-w-0">
                <span className="inline-block text-[10px] font-bold text-blue-700 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded border border-blue-100">TAX INVOICE / BILL OF SUPPLY</span>
                <h1 className="text-lg font-black text-slate-900 mt-1.5 break-words">Gujarat Industrial Polymers &amp; Chemicals Ltd</h1>
                <p className="text-slate-500 text-[11px] break-words">Plot 108, GIDC Industrial Estate, Phase-IV, Vatva, Ahmedabad, Gujarat - 382445</p>
                <div className="flex flex-wrap items-center gap-1.5 mt-1 font-mono font-bold text-slate-800 break-words"><span>GSTIN: 24AAACG9988K1Z5</span><span className="text-slate-400 hidden xs:inline">•</span><span className="text-emerald-700 font-sans font-semibold">State: Gujarat (Code 24)</span></div>
              </div>
              <div className="text-left sm:text-right shrink-0 max-w-full"><div className="text-[11px] font-bold text-slate-500 uppercase">Original For Recipient</div><div className="text-sm font-black font-mono text-slate-900 mt-1 break-all">INV # GIP/2026-27/0842</div><div className="text-slate-500 font-mono mt-0.5">Date: 16-Aug-2026</div></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="min-w-0"><div className="font-bold text-slate-500 uppercase text-[10px]">Billed To (Customer):</div><div className="font-bold text-slate-800 mt-0.5 break-words">Apex Electronics &amp; Industrial Traders</div><div className="text-slate-500 text-[11px] break-words">Plot 42, Vatva Industrial Area, Ahmedabad, Gujarat</div><div className="font-mono font-bold text-blue-700 mt-0.5 break-all">GSTIN: 24AAPCA1234F1ZV (Gujarat 24)</div></div>
              <div className="min-w-0"><div className="font-bold text-slate-500 uppercase text-[10px]">Dispatched Via:</div><div className="text-slate-700 mt-0.5 break-words">Gujarat Freight Carrier (Truck # GJ-01-BX-8822)</div><div className="text-slate-500 text-[11px] break-words">E-Way Bill No: 241088923491</div><div className="text-emerald-700 font-bold mt-0.5">Place of Supply: Gujarat (24)</div></div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left">
                <thead className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-700"><tr><th className="p-2.5">#</th><th className="p-2.5">Item Description</th><th className="p-2.5">HSN Code</th><th className="p-2.5 text-right">Qty</th><th className="p-2.5 text-right">Rate (₹)</th><th className="p-2.5 text-right">Taxable (₹)</th></tr></thead>
                <tbody className="divide-y divide-slate-100 text-[11px]"><tr><td className="p-2.5 font-bold">1</td><td className="p-2.5"><div className="font-bold text-slate-800">Industrial Polypropylene Granules</div><div className="text-slate-400 text-[10px]">Grade-A Injection Molding Polymer</div></td><td className="p-2.5 font-mono">39021000</td><td className="p-2.5 text-right font-mono font-semibold">25 BAGS</td><td className="p-2.5 text-right font-mono">1,200.00</td><td className="p-2.5 text-right font-mono font-bold">30,000.00</td></tr></tbody>
              </table></div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-stretch gap-5 pt-2">
              <div className="text-[11px] text-slate-500 space-y-1 min-w-0"><div className="font-bold text-slate-700">Bank Details for Payment:</div><div className="break-words">Bank: HDFC Bank Ltd • Branch: Vatva Ahmedabad</div><div className="font-mono break-all">A/C: 50200012345678 • IFSC: HDFC0001234</div><div className="flex items-center gap-1 text-emerald-700 font-bold mt-2"><ShieldCheck className="w-4 h-4 shrink-0" /> GST 100% Compliant Tax Invoice</div></div>
              <div className="w-full sm:w-64 space-y-1.5 text-right font-mono text-xs shrink-0"><div className="flex justify-between gap-3 text-slate-600"><span>Taxable Subtotal:</span><span className="font-bold">₹30,000.00</span></div><div className="flex justify-between gap-3 text-blue-700"><span>CGST @ 9.0%:</span><span className="font-bold">₹2,700.00</span></div><div className="flex justify-between gap-3 text-blue-700"><span>SGST @ 9.0%:</span><span className="font-bold">₹2,700.00</span></div><div className="flex justify-between gap-3 text-slate-400"><span>IGST @ 0.0%:</span><span>₹0.00</span></div><div className="flex justify-between gap-3 border-t-2 border-slate-800 pt-1.5 text-sm font-black text-slate-900 font-sans"><span>Grand Total:</span><span className="font-mono text-base font-black text-emerald-700">₹35,400.00</span></div></div>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4 sm:px-6 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-slate-500 leading-5">Point your camera or click below to trigger instant OCR extraction.</span>
          <button onClick={() => { onClose(); onScanThisBill(); }} className="w-full sm:w-auto min-h-11 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-purple-500/20 active:scale-95 transition-all cursor-pointer"><Sparkles className="w-4 h-4" /> OCR Scan This Invoice Now</button>
        </div>
      </div>
    </div>
  );
};
