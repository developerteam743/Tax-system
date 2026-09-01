import React from 'react';
import type { SalesInvoice } from '../types/tax';
import { downloadGstr1Json, downloadGstr1Excel } from '../utils/gstr1Exporter';
import { formatCurrency } from '../utils/gst';
import { FileCheck, Download, FileSpreadsheet } from 'lucide-react';

interface GSTR1ReportProps {
  salesInvoices: SalesInvoice[];
}

export const GSTR1Report: React.FC<GSTR1ReportProps> = ({ salesInvoices }) => {
  const totalTaxable = salesInvoices.reduce((acc, inv) => acc + inv.subtotal, 0);
  const totalCgst = salesInvoices.reduce((acc, inv) => acc + inv.cgstTotal, 0);
  const totalSgst = salesInvoices.reduce((acc, inv) => acc + inv.sgstTotal, 0);
  const totalIgst = salesInvoices.reduce((acc, inv) => acc + inv.igstTotal, 0);
  const totalTax = totalCgst + totalSgst + totalIgst;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-md">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-emerald-600" />
            Ready-to-File GSTR-1 Compliance Reports Hub
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Auto-compiles Tables 4A B2B, 5 B2CL, 7 B2CS, 12 HSN Summary &amp; 13 Document Summary. Download official JSON or Excel.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => downloadGstr1Excel(salesInvoices)}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Download GSTR-1 Excel Sheet
          </button>

          <button
            onClick={() => downloadGstr1Json(salesInvoices, '08', '2026')}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download GSTN Portal JSON Payload
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-500 font-bold uppercase tracking-wider block">Total Outward Taxable</span>
          <span className="text-xl font-black text-slate-900">{formatCurrency(totalTaxable)}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-500 font-bold uppercase tracking-wider block">CGST (9%) Output</span>
          <span className="text-xl font-black text-blue-700">{formatCurrency(totalCgst)}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-500 font-bold uppercase tracking-wider block">SGST (9%) Output</span>
          <span className="text-xl font-black text-blue-700">{formatCurrency(totalSgst)}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-500 font-bold uppercase tracking-wider block">Total Output Tax Due</span>
          <span className="text-xl font-black text-purple-700">{formatCurrency(totalTax)}</span>
        </div>
      </div>

      {/* Table 4A: B2B Invoices Breakdown */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">
            Table 4A - B2B Invoices ({salesInvoices.length} Documents)
          </span>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            ✓ Ready for GST Portal Upload
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">GSTIN of Recipient</th>
                <th className="p-3">Receiver Name</th>
                <th className="p-3">Invoice #</th>
                <th className="p-3">Invoice Date</th>
                <th className="p-3">Invoice Value</th>
                <th className="p-3">Place of Supply</th>
                <th className="p-3">Taxable Value</th>
                <th className="p-3">Cess</th>
                <th className="p-3 text-right">Supply Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {salesInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-mono font-bold text-slate-900">{inv.partyGstin}</td>
                  <td className="p-3 font-semibold text-slate-900">{inv.partyName}</td>
                  <td className="p-3 font-mono text-blue-700 font-bold">{inv.invoiceNumber}</td>
                  <td className="p-3 font-mono text-slate-500">{inv.date}</td>
                  <td className="p-3 font-black text-slate-900">{formatCurrency(inv.grandTotal)}</td>
                  <td className="p-3 font-mono text-slate-600">{inv.placeOfSupply}</td>
                  <td className="p-3 font-semibold text-slate-800">{formatCurrency(inv.subtotal)}</td>
                  <td className="p-3 text-slate-400 font-mono">0.00</td>
                  <td className="p-3 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                      {inv.partyStateCode === '24' ? 'INTRA-STATE' : 'INTER-STATE'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
