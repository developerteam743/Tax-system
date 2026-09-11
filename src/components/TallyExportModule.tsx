import React, { useState } from 'react';
import type { SalesInvoice, PurchaseInvoice } from '../types/tax';
import { downloadTallySalesXml, downloadTallyExcelTemplate } from '../utils/tallyExporter';
import { applyTallyMasters, fetchTallyCompanies, pullTallyDaybook, syncTally, testTallyConnection } from '../services/api';
import { FileSpreadsheet, Download, CheckCircle2, Code, Wifi, RefreshCw, Upload, Database, ArrowDownToLine, AlertCircle, ShieldCheck } from 'lucide-react';

interface TallyExportModuleProps {
  salesInvoices: SalesInvoice[];
  purchaseInvoices: PurchaseInvoice[];
}

type ApplyPreview = { companyName: string; existingParties: number; newParties: number; existingStockItems: number; newStockItems: number; items: { entityType: string; tallyName: string; action: string; matchType: string; score: number; gstin?: string }[] };
type ApplyResponse = { mode: 'preview'; preview: ApplyPreview; note: string };
type ApplyResult = { success: boolean; companyName: string; partiesCreated: number; stockItemsCreated: number; skipped: number; errors: string[] };

export const TallyExportModule: React.FC<TallyExportModuleProps> = ({ salesInvoices, purchaseInvoices }) => {
  const [baseUrl, setBaseUrl] = useState('http://localhost:9000');
  const [companyName, setCompanyName] = useState('Apex Electronics & Traders');
  const [status, setStatus] = useState<string>('Not connected');
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lastResponse, setLastResponse] = useState('');
  const [applyPreview, setApplyPreview] = useState<ApplyPreview | null>(null);

  const run = async (work: () => Promise<void>) => {
    setBusy(true);
    try { await work(); } catch (e) { setStatus(e instanceof Error ? e.message : 'Tally operation failed'); setConnected(false); }
    finally { setBusy(false); }
  };

  const connect = () => run(async () => {
    const result = await testTallyConnection(baseUrl, companyName || undefined);
    setConnected(result.connected);
    setStatus(result.message);
    setLastResponse(result.rawResponse ?? '');
  });

  const discover = () => run(async () => {
    const result = await fetchTallyCompanies(baseUrl);
    setConnected(result.connected);
    setStatus(result.message);
    setLastResponse(result.rawResponse ?? '');
    if (result.companyName) setCompanyName(result.companyName);
  });

  const push = (data: 'all' | 'masters' | 'sales' | 'purchases') => run(async () => {
    const result = await syncTally(baseUrl, companyName, data);
    setConnected(result.success);
    setStatus(result.results.map(x => x.message).join(' | '));
    setLastResponse(result.results.at(-1)?.rawResponse ?? '');
  });

  const pull = () => run(async () => {
    const to = new Date().toISOString().slice(0, 10);
    const fromDate = new Date(); fromDate.setDate(fromDate.getDate() - 30);
    const from = fromDate.toISOString().slice(0, 10);
    const result = await pullTallyDaybook(baseUrl, companyName, from, to);
    setConnected(result.result.connected);
    setStatus(result.result.message);
    setLastResponse(result.result.rawResponse ?? '');
  });

  const previewApply = () => run(async () => {
    const response = await applyTallyMasters(baseUrl, companyName, false) as ApplyResponse;
    setApplyPreview(response.preview);
    setStatus(`Preview ready: ${response.preview.newParties} new parties and ${response.preview.newStockItems} new stock items.`);
  });

  const confirmApply = () => run(async () => {
    const result = await applyTallyMasters(baseUrl, companyName, true) as ApplyResult;
    setApplyPreview(null);
    setStatus(result.success ? `Applied ${result.partiesCreated} parties and ${result.stockItemsCreated} stock items; ${result.skipped} existing records skipped.` : `Apply completed with ${result.errors.length} error(s).`);
    setLastResponse(result.errors.join('\n'));
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-700 p-6 rounded-2xl border border-blue-600 shadow-md text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2"><Database className="w-6 h-6 text-cyan-300" /> TallyPrime Advanced Integration Hub</h2>
            <p className="text-xs text-blue-100 mt-1">Live HTTP/XML bridge for masters, sales, purchases and read-only Tally daybook pull.</p>
          </div>
          <div className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${connected ? 'bg-emerald-500/20 text-emerald-100' : 'bg-white/10 text-blue-100'}`}>
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-300' : 'bg-slate-300'}`} /> {connected ? 'Tally Connected' : 'Tally Not Connected'}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
          <label className="text-xs font-semibold text-blue-100">Tally URL<input value={baseUrl} onChange={e => setBaseUrl(e.target.value)} className="mt-1 w-full rounded-lg bg-white text-slate-900 px-3 py-2 outline-none" placeholder="http://localhost:9000" /></label>
          <label className="text-xs font-semibold text-blue-100 md:col-span-2">Tally Company<input value={companyName} onChange={e => setCompanyName(e.target.value)} className="mt-1 w-full rounded-lg bg-white text-slate-900 px-3 py-2 outline-none" placeholder="Exact loaded company name" /></label>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <button disabled={busy} onClick={connect} className="px-4 py-2 rounded-lg bg-white text-slate-900 text-xs font-bold flex items-center gap-2 disabled:opacity-50"><Wifi className="w-4 h-4" /> Test Connection</button>
          <button disabled={busy} onClick={discover} className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-xs font-bold flex items-center gap-2 disabled:opacity-50"><RefreshCw className="w-4 h-4" /> Discover Company</button>
        </div>
        <div className="mt-3 text-xs text-blue-100 flex items-center gap-2"><span className="font-semibold">Status:</span> {busy ? 'Working…' : status}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <button disabled={busy || !companyName} onClick={() => push('masters')} className="text-left bg-white border border-slate-200 rounded-2xl p-5 shadow-md hover:border-blue-400 disabled:opacity-50">
          <Upload className="w-5 h-5 text-blue-600 mb-3" /><div className="font-bold text-sm">Push Masters</div><p className="text-xs text-slate-500 mt-1">Customers, vendors and stock items.</p>
        </button>
        <button disabled={busy || !companyName} onClick={previewApply} className="text-left bg-white border border-emerald-200 rounded-2xl p-5 shadow-md hover:border-emerald-400 disabled:opacity-50">
          <ShieldCheck className="w-5 h-5 text-emerald-600 mb-3" /><div className="font-bold text-sm">Preview Tally → TaxFlow</div><p className="text-xs text-slate-500 mt-1">Review new masters before writing them locally.</p>
        </button>
        <button disabled={busy || !companyName} onClick={() => push('sales')} className="text-left bg-white border border-slate-200 rounded-2xl p-5 shadow-md hover:border-blue-400 disabled:opacity-50">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-3" /><div className="font-bold text-sm">Push Sales</div><p className="text-xs text-slate-500 mt-1">Send sales vouchers with GST and inventory lines.</p>
        </button>
        <button disabled={busy || !companyName} onClick={() => push('purchases')} className="text-left bg-white border border-slate-200 rounded-2xl p-5 shadow-md hover:border-blue-400 disabled:opacity-50">
          <Upload className="w-5 h-5 text-orange-600 mb-3" /><div className="font-bold text-sm">Push Purchases</div><p className="text-xs text-slate-500 mt-1">Send purchase vouchers with input GST.</p>
        </button>
        <button disabled={busy || !companyName} onClick={pull} className="text-left bg-white border border-slate-200 rounded-2xl p-5 shadow-md hover:border-purple-400 disabled:opacity-50">
          <ArrowDownToLine className="w-5 h-5 text-purple-600 mb-3" /><div className="font-bold text-sm">Pull Daybook</div><p className="text-xs text-slate-500 mt-1">Read the last 30 days from Tally for reconciliation.</p>
        </button>
      </div>

      {applyPreview && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-md space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div><div className="font-bold text-emerald-950">Tally → TaxFlow master preview</div><div className="text-xs text-emerald-800 mt-1">{applyPreview.newParties} new parties · {applyPreview.newStockItems} new stock items · {applyPreview.existingParties + applyPreview.existingStockItems} existing matches</div></div>
            <button disabled={busy} onClick={confirmApply} className="px-4 py-2 rounded-lg bg-emerald-700 text-white text-xs font-bold disabled:opacity-50">Confirm & Apply</button>
          </div>
          <div className="max-h-56 overflow-auto rounded-xl bg-white border border-emerald-100">
            {applyPreview.items.length === 0 ? <div className="p-4 text-xs text-slate-500">No master changes are required.</div> : applyPreview.items.map((item, index) => <div key={`${item.entityType}-${item.tallyName}-${index}`} className="px-4 py-2 border-b border-slate-100 last:border-0 flex items-center justify-between gap-4 text-xs"><span className="font-semibold text-slate-800">{item.entityType}: {item.tallyName}</span><span className="text-slate-500">{item.action} · {item.matchType} · {item.score.toFixed(2)}</span></div>)}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-md space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900"><FileSpreadsheet className="w-5 h-5 text-emerald-600" /> Excel Fallback</div>
          <p className="text-xs text-slate-600">For firms without HTTP access, export the existing Tally-compatible workbook.</p>
          <button onClick={() => downloadTallyExcelTemplate(salesInvoices, purchaseInvoices)} className="text-xs font-bold px-3 py-2 rounded-lg bg-emerald-50 text-emerald-800">Export Excel</button>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-md space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900"><Download className="w-5 h-5 text-blue-600" /> XML File Fallback</div>
          <p className="text-xs text-slate-600">Generate a file when direct network access to Tally is unavailable.</p>
          <button onClick={() => downloadTallySalesXml(salesInvoices)} className="text-xs font-bold px-3 py-2 rounded-lg bg-blue-50 text-blue-800">Download Sales XML</button>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-md space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900"><Code className="w-5 h-5 text-purple-600" /> TDL Ready</div>
          <p className="text-xs text-slate-600">The backend is designed around Tally's native HTTP/XML integration so a TDL bridge can be added for Tally-initiated sync.</p>
          <div className="p-3 bg-purple-50 rounded-xl text-[11px] text-purple-900 font-mono">Tally HTTP Gateway → TaxFlow API</div>
        </div>
      </div>

      {lastResponse && (
        <div className="bg-slate-950 rounded-2xl p-5 text-xs text-slate-200 shadow-md">
          <div className="flex items-center gap-2 font-bold mb-3"><AlertCircle className="w-4 h-4" /> Last Tally response</div>
          <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all">{lastResponse}</pre>
        </div>
      )}
    </div>
  );
};
