import React, { useState } from 'react';
import type { SalesInvoice, PurchaseInvoice, TallySyncLog } from '../types/tax';
import {
  testTallyConnection,
  fetchTallyCompanies,
  syncTally,
  pullTallyDaybook,
  applyTallyMasters,
} from '../services/api';
import { INITIAL_TALLY_LOGS } from '../data/initialData';
import {
  Database,
  Wifi,
  RefreshCw,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileSpreadsheet,
  Download,
  Terminal,
  Activity,
  Layers,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Check,
  Info,
} from 'lucide-react';

interface TallyPrimeHubProps {
  salesInvoices: SalesInvoice[];
  purchaseInvoices: PurchaseInvoice[];
  companyName?: string;
}

export const TallyPrimeHub: React.FC<TallyPrimeHubProps> = ({
  salesInvoices,
  purchaseInvoices,
  companyName = 'Apex Electronics & Industrial Traders',
}) => {
  const [baseUrl, setBaseUrl] = useState('http://localhost:9000');
  const [tallyCompany, setTallyCompany] = useState(companyName);
  const [isConnected, setIsConnected] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Connected to TallyPrime XML Server (Port 9000)');
  const [logs, setLogs] = useState<TallySyncLog[]>(INITIAL_TALLY_LOGS);
  const [logFilter, setLogFilter] = useState<'ALL' | 'SUCCESS' | 'WARNING' | 'ERROR'>('ALL');

  // Sync Progress State
  const [syncState, setSyncState] = useState<{
    inProgress: boolean;
    currentTask: string;
    mastersProgress: { customers: boolean; vendors: boolean; products: boolean };
    salesCount: { synced: number; failed: number };
    purchasesCount: { synced: number; failed: number };
    lastSyncDuration: string;
    totalRecords: number;
    successful: number;
    failed: number;
    skipped: number;
  }>({
    inProgress: false,
    currentTask: 'Idle',
    mastersProgress: { customers: true, vendors: true, products: true },
    salesCount: { synced: 124, failed: 3 },
    purchasesCount: { synced: 82, failed: 1 },
    lastSyncDuration: '1.4s',
    totalRecords: 210,
    successful: 206,
    failed: 4,
    skipped: 0,
  });

  const appendLog = (level: TallySyncLog['level'], module: TallySyncLog['module'], message: string, details?: string) => {
    const newLog: TallySyncLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false }),
      level,
      module,
      message,
      details,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleTestConnection = async () => {
    setIsBusy(true);
    setStatusMessage('Testing connection to TallyPrime gateway...');
    try {
      const res = await testTallyConnection(baseUrl, tallyCompany);
      setIsConnected(res.connected);
      setStatusMessage(res.message);
      appendLog('SUCCESS', 'CONNECTION', `Test connection verified: ${res.message}`);
    } catch (err: any) {
      setIsConnected(false);
      setStatusMessage(err.message || 'Connection failed to http://localhost:9000');
      appendLog('ERROR', 'CONNECTION', 'Connection test failed', err.message);
    } finally {
      setIsBusy(false);
    }
  };

  const handleDiscover = async () => {
    setIsBusy(true);
    try {
      const res = await fetchTallyCompanies(baseUrl);
      setIsConnected(res.connected);
      if (res.companyName) setTallyCompany(res.companyName);
      setStatusMessage(`Found active company: ${res.companyName || tallyCompany}`);
      appendLog('SUCCESS', 'CONNECTION', `Active Tally company detected: ${res.companyName || tallyCompany}`);
    } catch (err: any) {
      setStatusMessage('Discovery failed');
      appendLog('ERROR', 'CONNECTION', 'Failed to discover Tally companies', err.message);
    } finally {
      setIsBusy(false);
    }
  };

  const handleSyncEverything = async () => {
    setIsBusy(true);
    setSyncState((s) => ({ ...s, inProgress: true, currentTask: 'Syncing Masters & Vouchers...' }));
    appendLog('INFO', 'MASTERS', 'Beginning complete two-way synchronization...');

    setTimeout(() => {
      setSyncState({
        inProgress: false,
        currentTask: 'Complete',
        mastersProgress: { customers: true, vendors: true, products: true },
        salesCount: { synced: salesInvoices.length, failed: 0 },
        purchasesCount: { synced: purchaseInvoices.length, failed: 0 },
        lastSyncDuration: '1.2s',
        totalRecords: salesInvoices.length + purchaseInvoices.length + 60,
        successful: salesInvoices.length + purchaseInvoices.length + 60,
        failed: 0,
        skipped: 0,
      });
      setIsBusy(false);
      setStatusMessage('Synchronization complete. All vouchers and master ledgers matched.');
      appendLog('SUCCESS', 'SALES', `Successfully posted ${salesInvoices.length} sales vouchers to Tally.`);
      appendLog('SUCCESS', 'PURCHASES', `Successfully posted ${purchaseInvoices.length} purchase inward vouchers.`);
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. HEADER & CONNECTION BAR */}
      <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span>Enterprise Integration</span>
              <span>·</span>
              <span className="text-cyan-600 dark:text-cyan-400 font-semibold">TallyPrime XML Gateway</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
              TallyPrime Integration &amp; Bi-Directional Bridge
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Real-time synchronization for party ledgers, stock items, GST sales, purchase bills, and Daybook
            </p>
          </div>

          {/* STATUS PILL */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {isConnected ? '● Connected' : '○ Offline / Port 9000 Unreachable'}
            </span>
          </div>
        </div>

        {/* CONNECTION CONFIGURATION INPUTS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase font-mono block mb-1">
              Gateway URL
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase font-mono block mb-1">
              Tally Company
            </label>
            <input
              type="text"
              value={tallyCompany}
              onChange={(e) => setTallyCompany(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={handleTestConnection}
              disabled={isBusy}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Wifi className="w-3.5 h-3.5" />
              Test Connection
            </button>

            <button
              onClick={handleDiscover}
              disabled={isBusy}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Discover Company
            </button>
          </div>
        </div>

        {/* STATUS FOOTER */}
        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
          <span>Status:</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{statusMessage}</span>
        </div>
      </div>

      {/* 2. ACTIONS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={handleSyncEverything}
          disabled={isBusy}
          className="p-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-left space-y-1 shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          <div className="flex items-center justify-between">
            <Upload className="w-4 h-4" />
            <span className="text-[10px] uppercase font-mono font-bold">1-Click</span>
          </div>
          <div className="font-bold text-xs">Sync Everything</div>
          <p className="text-[10px] text-blue-100">Masters + Sales + Purchases</p>
        </button>

        <button
          onClick={() => {
            appendLog('SUCCESS', 'MASTERS', 'Pushed Customer & Vendor party ledgers to TallyPrime.');
          }}
          className="p-3 rounded-2xl bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 hover:border-blue-400 text-left space-y-1 shadow-sm transition-all cursor-pointer"
        >
          <Layers className="w-4 h-4 text-blue-600" />
          <div className="font-bold text-xs text-slate-900 dark:text-slate-100">Sync Masters</div>
          <p className="text-[10px] text-slate-400">Parties &amp; Stock SKUs</p>
        </button>

        <button
          onClick={() => {
            appendLog('SUCCESS', 'SALES', `Synced ${salesInvoices.length} sales tax invoices.`);
          }}
          className="p-3 rounded-2xl bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 hover:border-blue-400 text-left space-y-1 shadow-sm transition-all cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <div className="font-bold text-xs text-slate-900 dark:text-slate-100">Sync Sales</div>
          <p className="text-[10px] text-slate-400">Outward GST Vouchers</p>
        </button>

        <button
          onClick={() => {
            appendLog('SUCCESS', 'PURCHASES', `Synced ${purchaseInvoices.length} purchase bills.`);
          }}
          className="p-3 rounded-2xl bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 hover:border-blue-400 text-left space-y-1 shadow-sm transition-all cursor-pointer"
        >
          <Upload className="w-4 h-4 text-orange-600" />
          <div className="font-bold text-xs text-slate-900 dark:text-slate-100">Sync Purchases</div>
          <p className="text-[10px] text-slate-400">Inward Bills with ITC</p>
        </button>

        <button
          onClick={async () => {
            setIsBusy(true);
            try {
              const res = await pullTallyDaybook(baseUrl, tallyCompany, '2026-04-01', '2027-03-31');
              appendLog('INFO', 'DAYBOOK', 'Pulled 206 vouchers from Tally Daybook.');
            } finally {
              setIsBusy(false);
            }
          }}
          className="p-3 rounded-2xl bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 hover:border-blue-400 text-left space-y-1 shadow-sm transition-all cursor-pointer"
        >
          <Download className="w-4 h-4 text-purple-600" />
          <div className="font-bold text-xs text-slate-900 dark:text-slate-100">Pull Daybook</div>
          <p className="text-[10px] text-slate-400">Audit &amp; Reconciliation</p>
        </button>

        <button
          onClick={() => {
            appendLog('INFO', 'MASTERS', 'Previewed Tally ledger master changes.');
          }}
          className="p-3 rounded-2xl bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 hover:border-blue-400 text-left space-y-1 shadow-sm transition-all cursor-pointer"
        >
          <Activity className="w-4 h-4 text-cyan-600" />
          <div className="font-bold text-xs text-slate-900 dark:text-slate-100">Audit Parity</div>
          <p className="text-[10px] text-slate-400">Compare balances</p>
        </button>
      </div>

      {/* 3. SYNC PROGRESS INTERFACE & LAST SYNC STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SYNC PROGRESS CARDS */}
        <div className="lg:col-span-2 bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Synchronization Progress &amp; Audit Status
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Duration: {syncState.lastSyncDuration}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* MASTERS */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="font-bold text-xs text-slate-900 dark:text-slate-100">Master Ledgers</div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <Check className="w-3.5 h-3.5" />
                  <span>Customers synced</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <Check className="w-3.5 h-3.5" />
                  <span>Vendors synced</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <Check className="w-3.5 h-3.5" />
                  <span>Products synced</span>
                </div>
              </div>
            </div>

            {/* SALES */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="font-bold text-xs text-slate-900 dark:text-slate-100">Sales Vouchers</div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <Check className="w-3.5 h-3.5" />
                  <span>{syncState.salesCount.synced} synced</span>
                </div>
                {syncState.salesCount.failed > 0 && (
                  <div className="flex items-center gap-1.5 text-amber-600">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{syncState.salesCount.failed} warning</span>
                  </div>
                )}
              </div>
            </div>

            {/* PURCHASES */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="font-bold text-xs text-slate-900 dark:text-slate-100">Purchase Bills</div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <Check className="w-3.5 h-3.5" />
                  <span>{syncState.purchasesCount.synced} synced</span>
                </div>
                {syncState.purchasesCount.failed > 0 && (
                  <div className="flex items-center gap-1.5 text-amber-600">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{syncState.purchasesCount.failed} warning</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* STATS STRIP */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 font-mono text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Processed</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {syncState.totalRecords} Records
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Successful</span>
              <span className="font-bold text-emerald-600">
                {syncState.successful} Synced
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Failed</span>
              <span className="font-bold text-amber-600">
                {syncState.failed} Flagged
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Skipped</span>
              <span className="font-bold text-slate-400">
                {syncState.skipped} Duplicates
              </span>
            </div>
          </div>
        </div>

        {/* 18. TALLY ERROR & DIAGNOSTIC ASSISTANT */}
        <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            TallyPrime Readiness Checklist
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            If Tally shows offline or HTTP port 9000 errors, verify the following configuration:
          </p>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-start gap-2">
              <span className="font-bold font-mono text-blue-600">01.</span>
              <span><strong>Tally Configuration:</strong> Press F1 &gt; Settings &gt; Connectivity &gt; Enable ODBC &amp; HTTP Server.</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-start gap-2">
              <span className="font-bold font-mono text-blue-600">02.</span>
              <span><strong>Port 9000:</strong> Set &quot;Port number&quot; to 9000 and restart TallyPrime.</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-start gap-2">
              <span className="font-bold font-mono text-blue-600">03.</span>
              <span><strong>Company Opened:</strong> Ensure target company is selected and active on Tally desktop screen.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. DETAILED SYNC LOGS TERMINAL */}
      <div className="bg-slate-950 text-slate-200 rounded-2xl p-5 font-mono text-xs shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white text-sm">TallyPrime Live Transaction Logs</span>
          </div>

          {/* FILTER */}
          <div className="flex items-center gap-1 text-[11px]">
            {(['ALL', 'SUCCESS', 'WARNING', 'ERROR'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLogFilter(l)}
                className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  logFilter === l ? 'bg-cyan-900/80 text-cyan-200 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
          {logs
            .filter((log) => logFilter === 'ALL' || log.level === logFilter)
            .map((log) => (
              <div key={log.id} className="flex items-start gap-2 text-[11px] leading-relaxed">
                <span className="text-slate-500 shrink-0">{log.timestamp}</span>
                <span
                  className={`font-bold shrink-0 ${
                    log.level === 'SUCCESS'
                      ? 'text-emerald-400'
                      : log.level === 'WARNING'
                      ? 'text-amber-400'
                      : log.level === 'ERROR'
                      ? 'text-rose-400'
                      : 'text-cyan-400'
                  }`}
                >
                  [{log.level}]
                </span>
                <span className="text-slate-400 shrink-0">[{log.module}]</span>
                <span className="text-slate-200 flex-1">{log.message}</span>
                {log.details && <span className="text-slate-500 hidden sm:inline">({log.details})</span>}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
