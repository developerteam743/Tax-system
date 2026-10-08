import type {
  Party,
  SalesInvoice,
  PurchaseInvoice,
  StockItem,
  BankTransaction,
  LedgerEntry,
  HostServerStatus,
  ViewMode,
} from './types/tax';
import {
  INITIAL_PARTIES,
  INITIAL_STOCK_ITEMS,
  INITIAL_SALES_INVOICES,
  SAMPLE_PURCHASE_BILLS,
  INITIAL_BANK_TXNS,
  INITIAL_LEDGER_ENTRIES,
  INITIAL_HOST_STATUS,
} from './data/initialData';
import {
  fetchPartiesFromApi,
  fetchStockFromApi,
  fetchSalesInvoicesFromApi,
  createSalesInvoiceApi,
  postPurchaseToLedgerApi,
} from './services/api';

import { Navbar } from './components/Navbar';
import { Sidebar, type TabType } from './components/Sidebar';
import { MISDashboard } from './components/MISDashboard';
import { SalesBilling } from './components/SalesBilling';
import { EWayBillModule } from './components/EWayBillModule';
import { AIPurchaseOCR } from './components/AIPurchaseOCR';
import { BankReconciliation } from './components/BankReconciliation';
import { StockRegister } from './components/StockRegister';
import { GSTR1Report } from './components/GSTR1Report';
import { TallyExportModule } from './components/TallyExportModule';
import { PartyLedgerModal } from './components/PartyLedgerModal';
import { HostServerModal } from './components/HostServerModal';
import { OnboardingWizardModal, type BusinessProfile } from './components/OnboardingWizardModal';
import { Toast, type ToastMessage, type ToastType } from './components/Toast';
import { Menu, Smartphone } from 'lucide-react';
import { useState, useEffect } from 'react';

export function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('OPERATIONS');
  const [activeTab, setActiveTab] = useState<TabType>('MIS_DASHBOARD');
  const [isMobileSimulator, setIsMobileSimulator] = useState(false);
  const [simulatorDevice, setSimulatorDevice] = useState<'iphone' | 'pixel' | 'galaxy'>('pixel');
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Business Profile State (First-time Onboarding & Multi-firm)
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('taxflow_business_profile') : null;
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback to default Gujarat demo profile
      }
    }
    return {
      firmName: 'Apex Electronics & Industrial Traders',
      gstin: '24AAPCA1234F1ZV',
      stateCode: '24',
      state: 'Gujarat',
      address: 'Plot 42, GIDC Industrial Estate, Vatva, Ahmedabad, Gujarat - 382445',
      phone: '+91 98250 12345',
      invoicePrefix: 'INV/26-27/',
      industry: 'Electronics & Engineering',
    };
  });

  // Offline-First Persistent State Management
  const [parties, setParties] = useState<Party[]>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('taxflow_parties') : null;
    return saved ? JSON.parse(saved) : INITIAL_PARTIES;
  });

  const [stockItems, setStockItems] = useState<StockItem[]>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('taxflow_stock_items') : null;
    return saved ? JSON.parse(saved) : INITIAL_STOCK_ITEMS;
  });

  const [salesInvoices, setSalesInvoices] = useState<SalesInvoice[]>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('taxflow_sales_invoices') : null;
    return saved ? JSON.parse(saved) : INITIAL_SALES_INVOICES;
  });

  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoice[]>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('taxflow_purchase_invoices') : null;
    return saved ? JSON.parse(saved) : SAMPLE_PURCHASE_BILLS;
  });

  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>(INITIAL_BANK_TXNS);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>(INITIAL_LEDGER_ENTRIES);
  const [hostStatus] = useState<HostServerStatus>(INITIAL_HOST_STATUS);

  // Sync to LocalStorage on Change (Offline Persistence)
  useEffect(() => {
    try {
      localStorage.setItem('taxflow_parties', JSON.stringify(parties));
    } catch (e) {}
  }, [parties]);

  useEffect(() => {
    try {
      localStorage.setItem('taxflow_stock_items', JSON.stringify(stockItems));
    } catch (e) {}
  }, [stockItems]);

  useEffect(() => {
    try {
      localStorage.setItem('taxflow_sales_invoices', JSON.stringify(salesInvoices));
    } catch (e) {}
  }, [salesInvoices]);

  useEffect(() => {
    try {
      localStorage.setItem('taxflow_purchase_invoices', JSON.stringify(purchaseInvoices));
    } catch (e) {}
  }, [purchaseInvoices]);

  // Modals & Toast State
  const [selectedPartyForLedger, setSelectedPartyForLedger] = useState<Party | null>(null);
  const [showHostModal, setShowHostModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (title: string, description?: string, type: ToastType = 'SUCCESS') => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      title,
      description,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Global High-Speed POS Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F2 / Alt+N: New Sales Bill
      if (e.key === 'F2' || (e.altKey && e.key.toLowerCase() === 'n')) {
        e.preventDefault();
        setActiveTab('SALES_BILLING');
        showToast('⌨️ High-Speed Billing [F2]', 'Switched to Sales Invoicing', 'INFO');
      }
      // F4 / Alt+P: AI Purchase OCR
      if (e.key === 'F4' || (e.altKey && e.key.toLowerCase() === 'p')) {
        e.preventDefault();
        setActiveTab('AI_PURCHASE_OCR');
        showToast('⌨️ AI OCR Scanner [F4]', 'Switched to Purchase Bill OCR', 'INFO');
      }
      // F7 / Alt+B: Bank Reconciliation
      if (e.key === 'F7' || (e.altKey && e.key.toLowerCase() === 'b')) {
        e.preventDefault();
        setActiveTab('BANK_RECON');
        showToast('⌨️ Bank Recon [F7]', 'Switched to Bank Reconciliation', 'INFO');
      }
      // Esc: Close any open modal
      if (e.key === 'Escape') {
        setShowHostModal(false);
        setShowOnboardingModal(false);
        setSelectedPartyForLedger(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load from C# .NET 8 Backend API on Mount
  useEffect(() => {
    async function loadBackendData() {
      try {
        const apiParties = await fetchPartiesFromApi();
        if (apiParties && apiParties.length > 0) {
          setParties(apiParties);
          setIsBackendConnected(true);
        }
      } catch (e) {
        console.log('Using local fallback state:', e);
      }

      try {
        const apiStock = await fetchStockFromApi();
        if (apiStock && apiStock.length > 0) {
          setStockItems(apiStock);
        }
      } catch (e) {
        console.log('Stock API offline:', e);
      }

      try {
        const apiSales = await fetchSalesInvoicesFromApi();
        if (apiSales && apiSales.length > 0) {
          setSalesInvoices(apiSales);
        }
      } catch (e) {
        console.log('Sales API offline:', e);
      }
    }

    loadBackendData();
  }, []);

  // Handle Onboarding Completion
  const handleCompleteOnboarding = (newProfile: BusinessProfile, loadSample: boolean) => {
    setBusinessProfile(newProfile);
    try {
      localStorage.setItem('taxflow_business_profile', JSON.stringify(newProfile));
    } catch (e) {}

    if (!loadSample) {
      // Clean slate for production firm
      setParties([]);
      setStockItems([]);
      setSalesInvoices([]);
      setPurchaseInvoices([]);
      setBankTransactions([]);
      setLedgerEntries([]);
    } else {
      // Keep sample records but update firm name
      setParties(INITIAL_PARTIES);
      setStockItems(INITIAL_STOCK_ITEMS);
      setSalesInvoices(INITIAL_SALES_INVOICES);
      setPurchaseInvoices(SAMPLE_PURCHASE_BILLS);
      setBankTransactions(INITIAL_BANK_TXNS);
      setLedgerEntries(INITIAL_LEDGER_ENTRIES);
    }

    setShowOnboardingModal(false);
    setActiveTab('MIS_DASHBOARD');
    showToast('🏢 Firm Profile Configured', `${newProfile.firmName} (${newProfile.state}) active!`, 'SUCCESS');
  };

  // Add Sales Invoice
  const handleCreateSalesInvoice = async (newInv: SalesInvoice) => {
    await createSalesInvoiceApi(newInv);
    setSalesInvoices([newInv, ...salesInvoices]);

    // Update Party Current Balance
    setParties((prev) =>
      prev.map((p) => {
        if (p.id === newInv.partyId) {
          return {
            ...p,
            currentBalance: p.currentBalance + newInv.grandTotal,
          };
        }
        return p;
      })
    );

    // Update Stock Levels
    setStockItems((prev) =>
      prev.map((st) => {
        const itemLine = newInv.items.find((i) => i.stockItemId === st.id);
        if (itemLine) {
          return {
            ...st,
            currentStock: Math.max(0, st.currentStock - itemLine.qty),
            lastUpdated: new Date().toISOString().split('T')[0],
          };
        }
        return st;
      })
    );

    // Add Ledger Entry
    setLedgerEntries((prev) => [
      {
        id: `led-${Date.now()}`,
        date: newInv.date,
        partyId: newInv.partyId,
        partyName: newInv.partyName,
        voucherType: 'Sales',
        voucherNo: newInv.invoiceNumber,
        debit: newInv.grandTotal,
        credit: 0,
        balance: 100000,
        narration: `Sales Invoice #${newInv.invoiceNumber}`,
      },
      ...prev,
    ]);

    showToast(
      '✅ Tax Invoice Created',
      `Invoice #${newInv.invoiceNumber} • ₹${Math.round(newInv.grandTotal).toLocaleString('en-IN')} added to receivables!`,
      'SUCCESS'
    );
  };

  // Add Purchase Invoice from OCR
  const handleAddPurchaseInvoice = (newPur: PurchaseInvoice) => {
    setPurchaseInvoices([newPur, ...purchaseInvoices]);
    showToast('📄 Purchase Bill Staged', `Invoice #${newPur.invoiceNumber} ready for verification`, 'INFO');
  };

  // Post Purchase Invoice to Ledger & Stock
  const handlePostPurchaseToLedger = async (purId: string) => {
    const pur = purchaseInvoices.find((p) => p.id === purId);
    if (!pur) return;

    await postPurchaseToLedgerApi(purId);

    setPurchaseInvoices((prev) =>
      prev.map((p) =>
        p.id === purId ? { ...p, postedToLedger: true, stockUpdated: true, ocrStatus: 'POSTED' } : p
      )
    );

    // Find or update vendor
    const existingVendor = parties.find((p) => p.gstin === pur.supplierGstin || p.name === pur.supplierName);

    if (existingVendor) {
      setParties((prev) =>
        prev.map((p) => (p.id === existingVendor.id ? { ...p, currentBalance: p.currentBalance - pur.grandTotal } : p))
      );
    } else {
      const newVendor: Party = {
        id: `p-${Date.now()}`,
        name: pur.supplierName,
        gstin: pur.supplierGstin,
        phone: '+91 98980 11223',
        email: 'supplier@vendor.com',
        address: 'GIDC Commercial Complex',
        city: 'Ahmedabad',
        state: 'Gujarat',
        stateCode: pur.supplierStateCode || '24',
        type: 'VENDOR',
        openingBalance: 0,
        currentBalance: -pur.grandTotal,
      };
      setParties((prev) => [...prev, newVendor]);
    }

    // Inward stock movement
    setStockItems((prev) =>
      prev.map((st) => {
        const line = pur.items.find((i) => i.hsn === st.hsn || st.name.includes(i.description));
        if (line) {
          return {
            ...st,
            currentStock: st.currentStock + line.qty,
            lastUpdated: new Date().toISOString().split('T')[0],
          };
        }
        return st;
      })
    );

    // Post to Ledger
    setLedgerEntries((prev) => [
      {
        id: `led-${Date.now()}`,
        date: pur.date,
        partyId: existingVendor?.id || `p-${pur.supplierGstin}`,
        partyName: pur.supplierName,
        voucherType: 'Purchase',
        voucherNo: pur.invoiceNumber,
        debit: 0,
        credit: pur.grandTotal,
        balance: -pur.grandTotal,
        narration: `AI Purchase Inward Bill #${pur.invoiceNumber}`,
      },
      ...prev,
    ]);

    showToast(
      '✅ Purchase Bill Inwarded',
      `${pur.supplierName} • ₹${Math.round(pur.grandTotal).toLocaleString('en-IN')} posted to stock & ledger!`,
      'SUCCESS'
    );
  };

  // Add New Stock Item SKU
  const handleAddStockItem = (newItem: StockItem) => {
    setStockItems((prev) => [newItem, ...prev]);
    showToast('📦 Stock SKU Added', `${newItem.name} (HSN: ${newItem.hsn}) added to inventory!`, 'SUCCESS');
  };

  // Manual Bank Reconciliation Match
  const handleReconcileMatch = (txnId: string, partyId: string) => {
    const party = parties.find((p) => p.id === partyId);
    if (!party) return;

    setBankTransactions((prev) =>
      prev.map((t) =>
        t.id === txnId
          ? {
              ...t,
              status: 'RECONCILED',
              matchedPartyId: party.id,
              matchedPartyName: party.name,
              matchConfidence: 100,
            }
          : t
      )
    );

    const txn = bankTransactions.find((t) => t.id === txnId);
    if (txn) {
      setParties((prev) =>
        prev.map((p) =>
          p.id === partyId
            ? {
                ...p,
                currentBalance:
                  txn.type === 'CREDIT' ? p.currentBalance - txn.amount : p.currentBalance + txn.amount,
              }
            : p
        )
      );
    }

    showToast(
      '🏦 Bank Transaction Reconciled',
      `Matched statement entry with ${party.name} ledger!`,
      'SUCCESS'
    );
  };

  const renderWorkspaceContent = () => (
    <>
      {activeTab === 'MIS_DASHBOARD' && (
        <MISDashboard
          parties={parties}
          salesInvoices={salesInvoices}
          purchaseInvoices={purchaseInvoices}
          bankTransactions={bankTransactions}
          viewMode={viewMode}
          onOpenLedgerModal={(p) => setSelectedPartyForLedger(p)}
          onSwitchTab={(tab) => setActiveTab(tab)}
        />
      )}

      {activeTab === 'SALES_BILLING' && (
        <SalesBilling
          parties={parties}
          stockItems={stockItems}
          salesInvoices={salesInvoices}
          onCreateInvoice={handleCreateSalesInvoice}
        />
      )}

      {(activeTab === 'EWAY_BILLS' || (activeTab as any) === 'EWAY_BILL') && (
        <EWayBillModule salesInvoices={salesInvoices} />
      )}

      {activeTab === 'AI_PURCHASE_OCR' && (
        <AIPurchaseOCR
          purchaseInvoices={purchaseInvoices}
          onAddPurchaseInvoice={handleAddPurchaseInvoice}
          onPostToLedger={handlePostPurchaseToLedger}
        />
      )}

      {activeTab === 'BANK_RECON' && (
        <BankReconciliation
          transactions={bankTransactions}
          parties={parties}
          onManualMatch={handleReconcileMatch}
        />
      )}

      {activeTab === 'STOCK_REGISTER' && (
        <StockRegister
          stockItems={stockItems}
          onAddStockItem={handleAddStockItem}
        />
      )}

      {(activeTab === 'GSTR1_REPORTS' || (activeTab as any) === 'GSTR1_REPORT') && (
        <GSTR1Report salesInvoices={salesInvoices} />
      )}

      {(activeTab === 'TALLY_CA_HUB' || (activeTab as any) === 'TALLY_EXPORT') && (
        <TallyExportModule
          salesInvoices={salesInvoices}
          purchaseInvoices={purchaseInvoices}
        />
      )}

      {(activeTab === 'PARTIES_MASTER' || (activeTab as any) === 'PARTY_MASTER') && (
        <div className="space-y-4 sm:space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/95 backdrop-blur-sm p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-[var(--shadow-soft)]">
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900">Customer &amp; Vendor Ledger Master</h2>
              <p className="text-xs text-slate-500">
                Manage all Gujarat ({businessProfile.stateCode}) and Interstate business parties with opening balances
              </p>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-[var(--shadow-soft)] border border-slate-200 overflow-hidden">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gradient-to-r from-slate-50 to-blue-50/50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-3 font-semibold">Party Name</th>
                    <th className="p-3 font-semibold">GSTIN</th>
                    <th className="p-3 font-semibold">Type</th>
                    <th className="p-3 font-semibold">State</th>
                    <th className="p-3 font-semibold text-right">Balance (₹)</th>
                    <th className="p-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parties.map((p) => (
                    <tr key={p.id} className="hover:bg-blue-50/40 transition-colors duration-200">
                      <td className="p-3 font-bold text-slate-800">{p.name}</td>
                      <td className="p-3 font-mono text-slate-500">{p.gstin || 'UNREGISTERED'}</td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                            p.type === 'CUSTOMER'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {p.type}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">{p.state} ({p.stateCode})</td>
                      <td className="p-3 text-right font-mono font-bold">
                        {p.currentBalance > 0 ? (
                          <span className="text-emerald-600">+{p.currentBalance} (Receivable)</span>
                        ) : (
                          <span className="text-amber-600">{p.currentBalance} (Payable)</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedPartyForLedger(p)}
                          className="px-3.5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 hover:-translate-y-0.5 hover:shadow-[var(--shadow-hover)] shadow-[var(--shadow-soft)] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
                        >
                          Statement
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="md:hidden divide-y divide-slate-100">
              {parties.map((p) => (
                <article key={p.id} className="p-4 space-y-3 hover:bg-blue-50/30 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 break-words">{p.name}</h3>
                      <p className="text-[11px] font-mono text-slate-500 mt-1 break-all">{p.gstin || 'UNREGISTERED'}</p>
                    </div>
                    <span className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                      p.type === 'CUSTOMER'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>{p.type}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-2xl bg-slate-50/80 border border-slate-200/80 p-3 shadow-[var(--shadow-soft)]">
                      <span className="block text-[10px] uppercase tracking-wider text-slate-400">State</span>
                      <span className="text-xs font-semibold text-slate-700">{p.state} ({p.stateCode})</span>
                    </div>
                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                      <span className="block text-[10px] uppercase tracking-wider text-slate-400">Balance</span>
                      {p.currentBalance > 0 ? (
                        <span className="text-xs font-bold text-emerald-600">+{p.currentBalance}</span>
                      ) : (
                        <span className="text-xs font-bold text-amber-600">{p.currentBalance}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPartyForLedger(p)}
                    className="w-full min-h-11 px-3 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 hover:shadow-md shadow-sm transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
                  >
                    Open Statement
                  </button>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-slate-900 flex flex-col font-sans">
      {/* GLOBAL NAVBAR */}
      <Navbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        hostStatus={hostStatus}
        onOpenHostModal={() => setShowHostModal(true)}
        isMobileSimulator={isMobileSimulator}
        setIsMobileSimulator={setIsMobileSimulator}
        isBackendConnected={isBackendConnected}
        businessProfile={businessProfile}
        onOpenOnboarding={() => setShowOnboardingModal(true)}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* MOBILE SIMULATOR CONTROLS & CHASSIS */}
      <div className="flex-1 flex flex-col min-w-0">
        {isMobileSimulator && (
          <div className="bg-slate-900 border-b border-slate-800 text-white px-3 sm:px-6 py-2.5 text-xs flex flex-wrap items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-bold text-slate-100">📱 Mobile Partner Phone View</span>
              <span className="hidden sm:inline text-slate-400 text-[11px]">— Shop-Floor Invoicing &amp; Field Collections</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700">
                <button
                  onClick={() => setSimulatorDevice('galaxy')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    simulatorDevice === 'galaxy' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Galaxy (360px)
                </button>
                <button
                  onClick={() => setSimulatorDevice('iphone')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    simulatorDevice === 'iphone' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  iPhone (393px)
                </button>
                <button
                  onClick={() => setSimulatorDevice('pixel')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    simulatorDevice === 'pixel' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pixel (412px)
                </button>
              </div>

              <button
                onClick={() => setIsMobileSimulator(false)}
                className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Exit Phone View
              </button>
            </div>
          </div>
        )}

        {isMobileSimulator ? (
          <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 bg-slate-950/95 overflow-y-auto">
            {/* REALISTIC SMARTPHONE CHASSIS */}
            <div
              className={`relative mx-auto my-auto ${
                simulatorDevice === 'galaxy'
                  ? 'w-[360px]'
                  : simulatorDevice === 'iphone'
                  ? 'w-[393px]'
                  : 'w-[412px]'
              } h-[820px] max-h-[calc(100vh-140px)] rounded-[50px] p-3 bg-slate-900 border-[8px] border-slate-800 shadow-[0_25px_70px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.1)] flex flex-col shrink-0`}
            >
              {/* INNER PHONE SCREEN */}
              <div className="relative w-full h-full bg-[var(--bg-main)] rounded-[38px] overflow-hidden flex flex-col shadow-inner">
                {/* DEVICE STATUS BAR */}
                <div className="bg-slate-900 text-white px-5 pt-2 pb-1.5 flex items-center justify-between text-[11px] font-bold shrink-0 select-none">
                  <span>09:41</span>
                  <div className="w-20 h-4 bg-black rounded-full" />
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span>5G</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* DEVICE APP MINI HEADER */}
                <div className="bg-white/95 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0 shadow-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-7 w-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                      TF
                    </div>
                    <div className="min-w-0">
                      <div className="font-extrabold text-xs text-slate-900 truncate">{businessProfile.firmName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Gujarat · {businessProfile.stateCode}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                      className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 cursor-pointer"
                      title="All Modules Menu"
                    >
                      <Menu className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* PHONE SCROLLABLE WORKSPACE */}
                <main className="flex-1 p-3 pb-24 overflow-y-auto w-full">
                  {renderWorkspaceContent()}
                </main>

                {/* PHONE BOTTOM NAVIGATION DOCK */}
                <Sidebar
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  isMobile={true}
                  isMobileMenuOpen={isMobileMenuOpen}
                  onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
                />

                {/* HOME INDICATOR */}
                <div className="absolute bottom-1 inset-x-0 z-40 pointer-events-none flex justify-center">
                  <div className="w-24 h-1 bg-slate-950/20 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* REGULAR VIEWPORT (RESPONSIVE DESKTOP & REAL MOBILE) */
          <div className="flex flex-1 min-w-0">
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              isMobile={false}
              isMobileMenuOpen={isMobileMenuOpen}
              onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
            />
            <main className="flex-1 p-3 sm:p-5 lg:p-6 pb-24 lg:pb-8 overflow-y-auto max-w-[1440px] mx-auto w-full">
              {renderWorkspaceContent()}
            </main>
          </div>
        )}
      </div>

      {/* MODALS */}
      {selectedPartyForLedger && (
        <PartyLedgerModal
          party={selectedPartyForLedger}
          ledgerEntries={ledgerEntries.filter((l) => l.partyId === selectedPartyForLedger.id)}
          onClose={() => setSelectedPartyForLedger(null)}
        />
      )}

      {showHostModal && (
        <HostServerModal status={hostStatus} onClose={() => setShowHostModal(false)} />
      )}

      {showOnboardingModal && (
        <OnboardingWizardModal
          isOpen={showOnboardingModal}
          onClose={() => setShowOnboardingModal(false)}
          onComplete={handleCompleteOnboarding}
        />
      )}

      {/* FLOATING TOAST NOTIFICATION CONTAINER */}
      <Toast toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}

export default App;
