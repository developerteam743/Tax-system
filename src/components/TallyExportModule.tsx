import React from 'react';
import type { SalesInvoice, PurchaseInvoice } from '../types/tax';
import { downloadTallySalesXml, downloadTallyExcelTemplate } from '../utils/tallyExporter';
import { FileSpreadsheet, Download, CheckCircle2, Code } from 'lucide-react';

interface TallyExportModuleProps {
  salesInvoices: SalesInvoice[];
  purchaseInvoices: PurchaseInvoice[];
}

export const TallyExportModule: React.FC<TallyExportModuleProps> = ({
  salesInvoices,
  purchaseInvoices,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-700 p-6 rounded-2xl border border-blue-600 shadow-md text-white">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-cyan-300" />
            Tally Prime &amp; CA Consultant Integration Hub
          </h2>
          <p className="text-xs text-blue-100 mt-1">
            Export all sales, purchases, payments &amp; receipts directly into Tally Prime via 1-Click XML Vouchers or Excel Importer.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => downloadTallyExcelTemplate(salesInvoices, purchaseInvoices)}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-white hover:bg-blue-50 text-slate-800 border border-slate-200 transition-all cursor-pointer shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export Tally Excel Sheet
          </button>

          <button
            onClick={() => downloadTallySalesXml(salesInvoices)}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-md transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-cyan-400" /> Download Tally Prime XML Vouchers
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Tally Direct Import */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-md space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            1-Click Tally XML Import
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            In Tally Prime, navigate to <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-700 font-semibold">Import &gt; Vouchers</code> and select the downloaded XML file. All ledgers, stock items, and tax entries are created automatically!
          </p>
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-[11px] text-blue-900 font-mono">
            Voucher Types: Sales, Purchase, Payment, Receipt
          </div>
        </div>

        {/* Card 2: Excel Importer */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-md space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            Standard Excel Importer
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            For tax consultants using third-party Excel import tools, download the pre-formatted Excel workbook containing separated Sales and Purchase sheets.
          </p>
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-[11px] text-emerald-900 font-mono">
            Columns: Date, Party Name, GSTIN, Taxable, CGST, SGST, IGST
          </div>
        </div>

        {/* Card 3: TDL Bridge Concept */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-md space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Code className="w-5 h-5 text-purple-600" />
            TDL Intermediate Bridge Tool
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            We provide a custom TDL (Tally Definition Language) file that connects Tally directly to our local host server node on port <code className="bg-slate-100 px-1 py-0.5 rounded text-purple-700 font-semibold">5000</code>.
          </p>
          <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-[11px] text-purple-900 font-mono">
            Direct Local HTTP Sync: Active Node
          </div>
        </div>
      </div>
    </div>
  );
};
