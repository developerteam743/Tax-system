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
import { useState, useEffect } from 'react';

export function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('OPERATIONS');
  const [activeTab, setActiveTab] = useState<TabType>('MIS_DASHBOARD');
  const [isMobileSimulator, setIsMobileSimulator] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
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
      />

      {/* MOBILE SIMULATOR WRAPPER */}
      <div className="flex-1 flex flex-col">
        {isMobileSimulator && (
          <div className="bg-gradient-to-r from-purple-800 to-indigo-800 text-white px-4 py-2 text-xs flex items-center justify-between shadow-md">
            <span className="font-semibold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
              📱 Mobile Partner Simulator Active — Testing Shop-Floor Mobile View
            </span>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-purple-200">Local Wi-Fi: http://192.168.29.128:5174/</span>
              <button
                onClick={() => setIsMobileSimulator(false)}
                className="bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded text-[11px] font-bold"
              >
                Exit Simulator
              </button>
            </div>
          </div>
        )}

        <div className={`flex flex-1 ${isMobileSimulator ? 'max-w-md mx-auto my-6 border-8 border-slate-900 rounded-3xl shadow-2xl overflow-hidden bg-slate-50 min-h-[780px]' : ''}`}>
          {/* SIDEBAR NAVIGATION */}
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isMobile={isMobileSimulator} />

          {/* MAIN WORKSPACE CONTENT */}
          <main className="flex-1 p-4 sm:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
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
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Customer &amp; Vendor Ledger Master</h2>
                    <p className="text-xs text-slate-500">
                      Manage all Gujarat ({businessProfile.stateCode}) and Interstate business parties with opening balances
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
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
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-800">{p.name}</td>
                          <td className="p-3 font-mono text-slate-500">{p.gstin || 'UNREGISTERED'}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
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
                              className="px-2.5 py-1 rounded bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 cursor-pointer"
                            >
                              Statement
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </main>
        </div>
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
