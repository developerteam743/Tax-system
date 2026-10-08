import React, { useState, useEffect } from 'react';
import type {
  Party,
  SalesInvoice,
  PurchaseInvoice,
  StockItem,
  BankTransaction,
  LedgerEntry,
  HostServerStatus,
  ViewMode,
  GSTIssue,
} from './types/tax';
import {
  INITIAL_PARTIES,
  INITIAL_STOCK_ITEMS,
  INITIAL_SALES_INVOICES,
  SAMPLE_PURCHASE_BILLS,
  INITIAL_BANK_TXNS,
  INITIAL_LEDGER_ENTRIES,
  INITIAL_HOST_STATUS,
  INITIAL_GST_ISSUES,
} from './data/initialData';
import {
  fetchPartiesFromApi,
  fetchStockFromApi,
  fetchSalesInvoicesFromApi,
  createSalesInvoiceApi,
  postPurchaseToLedgerApi,
} from './services/api';

// Core Application Shell & Workspace Components
import { Navbar } from './components/Navbar';
import { Sidebar, type TabType } from './components/Sidebar';
import { CommandPalette } from './components/CommandPalette';
import { NotificationCenter } from './components/NotificationCenter';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { SalesWorkspace } from './components/SalesWorkspace';
import { PurchaseWorkspace } from './components/PurchaseWorkspace';
import { InventoryCommandCenter } from './components/InventoryCommandCenter';
import { BankingWorkspace } from './components/BankingWorkspace';
import { GSTCommandCenter } from './components/GSTCommandCenter';
import { GSTIssueCenter } from './components/GSTIssueCenter';
import { TallyPrimeHub } from './components/TallyPrimeHub';
import { ExpensesModule } from './components/ExpensesModule';
import { ReportsCenter } from './components/ReportsCenter';
import { AIAssistantModule } from './components/AIAssistantModule';
import { Party360Modal } from './components/Party360Modal';

// Modals & Tools
import { OnboardingWizardModal, type BusinessProfile } from './components/OnboardingWizardModal';
import { Toast, type ToastMessage, type ToastType } from './components/Toast';
import { Users, Building2, Plus, Smartphone, Sparkles, Settings, HelpCircle, Check, Search, ShieldCheck } from 'lucide-react';

export function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('OPERATIONS');
  const [activeTab, setActiveTab] = useState<TabType>('MIS_DASHBOARD');
  const [isMobileSimulator, setIsMobileSimulator] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(true);

  // Dark Mode Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('taxflow_theme');
      if (saved) return saved === 'dark';
      if (typeof window.matchMedia === 'function') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('taxflow_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('taxflow_theme', 'light');
    }
  }, [isDarkMode]);

  // Company and FY Multi-firm selection
  const companiesList = [
    {
      id: 'c1',
      name: 'Apex Electronics & Industrial Traders',
      gstin: '24AAPCA1234F1ZV',
      state: 'Gujarat',
    },
    {
      id: 'c2',
      name: 'Gujarat Precision Instruments Pvt Ltd',
      gstin: '24AABCG5544J1Z9',
      state: 'Gujarat',
    },
    {
      id: 'c3',
      name: 'Surat Textile & Automation Hub',
      gstin: '24BBBCD8877K1Z4',
      state: 'Gujarat',
    },
  ];

  const [selectedCompanyId, setSelectedCompanyId] = useState('c1');
  const [selectedFY, setSelectedFY] = useState('FY 2026–27');

  // Business Profile
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('taxflow_business_profile') : null;
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
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

  // Core Data Stores with LocalStorage offline persistence
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
  const [gstIssues, setGstIssues] = useState<GSTIssue[]>(INITIAL_GST_ISSUES);

  // Sync to LocalStorage
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

  // Command Palette & Notifications State
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedPartyFor360, setSelectedPartyFor360] = useState<Party | null>(null);
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

  // Keyboard Accelerators: Cmd+K, F2, F4, F7, Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K: Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // F2 / Alt+N: Sales Billing
      if (e.key === 'F2' || (e.altKey && e.key.toLowerCase() === 'n')) {
        e.preventDefault();
        setActiveTab('SALES_BILLING');
        showToast('⌨️ High-Speed Invoicing [F2]', 'Switched to Sales Billing', 'INFO');
        return;
      }

      // F4 / Alt+P: AI Purchase OCR
      if (e.key === 'F4' || (e.altKey && e.key.toLowerCase() === 'p')) {
        e.preventDefault();
        setActiveTab('PURCHASES_WORKSPACE');
        showToast('⌨️ AI Purchase OCR [F4]', 'Switched to Purchase Capture', 'INFO');
        return;
      }

      // F7 / Alt+B: Bank Reconciliation
      if (e.key === 'F7' || (e.altKey && e.key.toLowerCase() === 'b')) {
        e.preventDefault();
        setActiveTab('BANK_RECON');
        showToast('⌨️ Bank Reconciliation [F7]', 'Switched to Bank Matching', 'INFO');
        return;
      }

      // Escape: close open overlays
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setIsNotificationsOpen(false);
        setSelectedPartyFor360(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load from Backend API on mount
  useEffect(() => {
    async function initData() {
      try {
        const apiParties = await fetchPartiesFromApi();
        if (apiParties && apiParties.length > 0) setParties(apiParties);
      } catch (e) {}

      try {
        const apiStock = await fetchStockFromApi();
        if (apiStock && apiStock.length > 0) setStockItems(apiStock);
      } catch (e) {}

      try {
        const apiSales = await fetchSalesInvoicesFromApi();
        if (apiSales && apiSales.length > 0) setSalesInvoices(apiSales);
      } catch (e) {}
    }
    initData();
  }, []);

  // Handlers
  const handleCreateSalesInvoice = async (newInv: SalesInvoice) => {
    await createSalesInvoiceApi(newInv);
    setSalesInvoices([newInv, ...salesInvoices]);

    // Update Party Current Balance
    setParties((prev) =>
      prev.map((p) => {
        if (p.id === newInv.partyId) {
          return { ...p, currentBalance: p.currentBalance + newInv.grandTotal };
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

    // Ledger entry
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
        narration: `Sales Tax Invoice #${newInv.invoiceNumber}`,
      },
      ...prev,
    ]);

    showToast(
      '✅ Tax Invoice Created',
      `Invoice #${newInv.invoiceNumber} (₹${Math.round(newInv.grandTotal).toLocaleString('en-IN')}) saved!`,
      'SUCCESS'
    );
  };

  const handleAddPurchaseInvoice = (newPur: PurchaseInvoice) => {
    setPurchaseInvoices([newPur, ...purchaseInvoices]);
    showToast('📄 Purchase Bill Staged', `Invoice #${newPur.invoiceNumber} ready for verification`, 'INFO');
  };

  const handlePostPurchaseToLedger = async (purId: string) => {
    const pur = purchaseInvoices.find((p) => p.id === purId);
    if (!pur) return;

    await postPurchaseToLedgerApi(purId);

    setPurchaseInvoices((prev) =>
      prev.map((p) =>
        p.id === purId ? { ...p, postedToLedger: true, stockUpdated: true, ocrStatus: 'POSTED' } : p
      )
    );

    // Update or add vendor
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

    showToast(
      '✅ Purchase Bill Inwarded',
      `${pur.supplierName} (₹${Math.round(pur.grandTotal).toLocaleString('en-IN')}) posted to stock & ledger!`,
      'SUCCESS'
    );
  };

  const handleAddStockItem = (newItem: StockItem) => {
    setStockItems((prev) => [newItem, ...prev]);
    showToast('📦 SKU Item Registered', `${newItem.name} (HSN: ${newItem.hsn}) added!`, 'SUCCESS');
  };

  const handleUpdateGSTIssueStatus = (id: string, newStatus: 'OPEN' | 'RESOLVED' | 'IGNORED') => {
    setGstIssues((prev) => prev.map((iss) => (iss.id === id ? { ...iss, status: newStatus } : iss)));
    showToast(
      newStatus === 'RESOLVED' ? '✓ GST Issue Resolved' : 'Issue Ignored',
      'Audit log updated.',
      'SUCCESS'
    );
  };

  // Badge calculations
  const unpostedOcrCount = purchaseInvoices.filter((p) => !p.postedToLedger).length;
  const unreconciledBankCount = bankTransactions.filter((b) => b.status === 'PENDING').length;
  const lowStockCount = stockItems.filter((s) => s.currentStock <= s.minStockLevel).length;

  return (
    <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#0B0F14] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white transition-colors">
      {/* TOP BAR */}
      <Navbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        hostStatus={hostStatus}
        isMobileSimulator={isMobileSimulator}
        setIsMobileSimulator={setIsMobileSimulator}
        isBackendConnected={isBackendConnected}
        businessProfile={businessProfile}
        onOpenOnboarding={() => setShowOnboardingModal(true)}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(!isNotificationsOpen)}
        unreadNotificationsCount={unpostedOcrCount + unreconciledBankCount + (lowStockCount > 0 ? 1 : 0)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        selectedFY={selectedFY}
        onChangeFY={setSelectedFY}
        companiesList={companiesList}
        selectedCompanyId={selectedCompanyId}
        onSelectCompany={setSelectedCompanyId}
      />

      {/* MAIN LAYOUT CANVAS */}
      <div className="flex-1 flex max-w-[1700px] w-full mx-auto">
        {/* DESKTOP SIDEBAR */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          unpostedOcrCount={unpostedOcrCount}
          unreconciledBankCount={unreconciledBankCount}
          lowStockCount={lowStockCount}
          isMobile={false}
          businessProfile={businessProfile}
          selectedFY={selectedFY}
        />

        {/* MOBILE DRAWER */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          unpostedOcrCount={unpostedOcrCount}
          unreconciledBankCount={unreconciledBankCount}
          lowStockCount={lowStockCount}
          isMobile={true}
          isMobileMenuOpen={isMobileMenuOpen}
          onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
          businessProfile={businessProfile}
          selectedFY={selectedFY}
        />

        {/* WORKSPACE VIEWPORT / MOBILE SIMULATOR */}
        {isMobileSimulator ? (
          <div className="flex-1 flex flex-col items-center justify-start p-3 sm:p-6 bg-slate-950/90 overflow-y-auto">
            <div className="relative w-full max-w-[412px] h-[840px] bg-slate-900 rounded-[50px] p-3 shadow-2xl ring-12 ring-slate-800 border-4 border-slate-700 flex flex-col overflow-hidden">
              {/* PHONE CAMERA ISLAND */}
              <div className="h-6 w-full flex items-center justify-center shrink-0">
                <div className="h-4 w-28 bg-black rounded-full" />
              </div>

              {/* SIMULATOR SCREEN CONTENT */}
              <div className="flex-1 overflow-y-auto rounded-[36px] bg-[#F7F8FA] dark:bg-[#0B0F14] text-slate-900 dark:text-slate-100 p-3">
                {renderTabContent()}
              </div>
            </div>
          </div>
        ) : (
          <main className="flex-1 min-w-0 p-3 sm:p-6 overflow-y-auto pb-16">
            {renderTabContent()}
          </main>
        )}
      </div>

      {/* COMMAND PALETTE (CMD+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        parties={parties}
        salesInvoices={salesInvoices}
        purchaseInvoices={purchaseInvoices}
        stockItems={stockItems}
        onNavigate={(tab) => {
          setActiveTab(tab as TabType);
          setIsCommandPaletteOpen(false);
        }}
        onOpenCreateInvoice={() => {
          setActiveTab('SALES_BILLING');
        }}
        onOpenCreatePurchase={() => {
          setActiveTab('PURCHASES_WORKSPACE');
        }}
        onOpenAddParty={() => {
          setActiveTab('CUSTOMERS_360');
        }}
        onOpenAddStock={() => {
          setActiveTab('STOCK_REGISTER');
        }}
        onSelectParty={(party) => {
          setSelectedPartyFor360(party);
        }}
      />

      {/* NOTIFICATIONS CENTER */}
      <NotificationCenter
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigate={(tab) => {
          setActiveTab(tab as TabType);
          setIsNotificationsOpen(false);
        }}
        unpostedOcrCount={unpostedOcrCount}
        unreconciledBankCount={unreconciledBankCount}
        lowStockCount={lowStockCount}
      />

      {/* PARTY 360 MODAL */}
      <Party360Modal
        party={selectedPartyFor360}
        onClose={() => setSelectedPartyFor360(null)}
        salesInvoices={salesInvoices}
        purchaseInvoices={purchaseInvoices}
        ledgerEntries={ledgerEntries}
        companyName={businessProfile?.firmName}
      />

      {/* ONBOARDING / FIRM SETTINGS MODAL */}
      {showOnboardingModal && (
        <OnboardingWizardModal
          onClose={() => setShowOnboardingModal(false)}
          onComplete={(profile, sample) => {
            setBusinessProfile(profile);
            setShowOnboardingModal(false);
            showToast('🏢 Business Profile Configured', `${profile.firmName} active!`, 'SUCCESS');
          }}
          currentProfile={businessProfile}
        />
      )}

      {/* TOAST SYSTEM */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onDismiss={handleDismissToast} />
          </div>
        ))}
      </div>
    </div>
  );

  // TAB ROUTING LOGIC
  function renderTabContent() {
    switch (activeTab) {
      case 'MIS_DASHBOARD':
        return (
          <ExecutiveDashboard
            parties={parties}
            salesInvoices={salesInvoices}
            purchaseInvoices={purchaseInvoices}
            bankTransactions={bankTransactions}
            viewMode={viewMode}
            onOpenLedgerModal={(p) => setSelectedPartyFor360(p)}
            onSwitchTab={(t) => setActiveTab(t as TabType)}
            companyName={businessProfile?.firmName}
            financialYear={selectedFY}
          />
        );

      case 'SALES_BILLING':
      case 'EWAY_BILLS':
        return (
          <SalesWorkspace
            parties={parties}
            stockItems={stockItems}
            salesInvoices={salesInvoices}
            onCreateInvoice={handleCreateSalesInvoice}
            firmName={businessProfile?.firmName}
            firmGstin={businessProfile?.gstin}
            firmStateCode={businessProfile?.stateCode}
          />
        );

      case 'PURCHASES_WORKSPACE':
      case 'AI_PURCHASE_OCR':
        return (
          <PurchaseWorkspace
            purchaseInvoices={purchaseInvoices}
            onAddPurchaseInvoice={handleAddPurchaseInvoice}
            onPostToLedger={handlePostPurchaseToLedger}
          />
        );

      case 'EXPENSES_MODULE':
        return <ExpensesModule />;

      case 'STOCK_REGISTER':
        return (
          <InventoryCommandCenter
            stockItems={stockItems}
            onAddStockItem={handleAddStockItem}
          />
        );

      case 'CUSTOMERS_360':
      case 'PARTIES_MASTER':
        return renderPartiesList('CUSTOMER');

      case 'VENDORS_360':
        return renderPartiesList('VENDOR');

      case 'BANK_RECON':
        return (
          <BankingWorkspace
            transactions={bankTransactions}
            parties={parties}
          />
        );

      case 'GST_COMMAND_CENTER':
      case 'GSTR1_REPORTS':
        return (
          <GSTCommandCenter
            salesInvoices={salesInvoices}
            purchaseInvoices={purchaseInvoices}
            gstIssues={gstIssues}
            onOpenIssueCenter={() => setActiveTab('GST_ISSUE_CENTER')}
            onReviewIssue={(issue) => {
              setActiveTab('GST_ISSUE_CENTER');
            }}
          />
        );

      case 'GST_ISSUE_CENTER':
        return (
          <GSTIssueCenter
            issues={gstIssues}
            onBack={() => setActiveTab('GST_COMMAND_CENTER')}
            onUpdateIssueStatus={handleUpdateGSTIssueStatus}
          />
        );

      case 'TALLY_CA_HUB':
        return (
          <TallyPrimeHub
            salesInvoices={salesInvoices}
            purchaseInvoices={purchaseInvoices}
            companyName={businessProfile?.firmName}
          />
        );

      case 'REPORTS_CENTER':
        return (
          <ReportsCenter
            salesInvoices={salesInvoices}
            purchaseInvoices={purchaseInvoices}
            stockItems={stockItems}
            companyName={businessProfile?.firmName}
            financialYear={selectedFY}
          />
        );

      case 'AI_ASSISTANT':
        return <AIAssistantModule />;

      case 'SETTINGS':
      case 'HELP_SUPPORT':
        return renderSettingsTab();

      default:
        return (
          <ExecutiveDashboard
            parties={parties}
            salesInvoices={salesInvoices}
            purchaseInvoices={purchaseInvoices}
            bankTransactions={bankTransactions}
            viewMode={viewMode}
            onOpenLedgerModal={(p) => setSelectedPartyFor360(p)}
            onSwitchTab={(t) => setActiveTab(t as TabType)}
            companyName={businessProfile?.firmName}
            financialYear={selectedFY}
          />
        );
    }
  }

  // CUSTOMER / VENDOR 360 HUB LIST VIEW
  function renderPartiesList(filterType: 'CUSTOMER' | 'VENDOR') {
    const isCustomer = filterType === 'CUSTOMER';
    const list = parties.filter((p) => p.type === filterType || p.type === 'BOTH');

    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span>{isCustomer ? 'Accounts Receivable' : 'Accounts Payable'}</span>
              <span>·</span>
              <span className="text-blue-600 dark:text-blue-400 font-semibold">Ledger 360</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
              {isCustomer ? 'Customer 360 Command Center' : 'Vendor 360 Procurement Center'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Click any {isCustomer ? 'debtor' : 'supplier'} to access running transaction history, GSTIN compliance, and WhatsApp reminders
            </p>
          </div>

          <button
            onClick={() => {
              const newParty: Party = {
                id: `p-${Date.now()}`,
                name: isCustomer ? 'New Customer Enterprise' : 'New Supplier Traders',
                gstin: '24AAACG1234D1ZP',
                phone: '+91 98250 99881',
                email: 'contact@firm.in',
                address: 'Industrial Area, Ahmedabad',
                city: 'Ahmedabad',
                state: 'Gujarat',
                stateCode: '24',
                type: filterType,
                openingBalance: 0,
                currentBalance: 0,
              };
              setParties([...parties, newParty]);
              setSelectedPartyFor360(newParty);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New {isCustomer ? 'Customer' : 'Vendor'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((party) => (
            <div
              key={party.id}
              onClick={() => setSelectedPartyFor360(party)}
              className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                    {party.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    GSTIN: {party.gstin || 'Unregistered'}
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    party.type === 'CUSTOMER'
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {party.type}
                </span>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400">
                {party.city}, {party.state} (State {party.stateCode})
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between font-mono text-xs">
                <span className="text-slate-400">Current Balance:</span>
                <span
                  className={`font-bold ${
                    party.currentBalance > 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  ₹{Math.abs(party.currentBalance).toLocaleString('en-IN')}{' '}
                  <span className="text-[10px] font-sans">
                    {party.currentBalance > 0 ? '(Receivable)' : '(Payable)'}
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // SETTINGS & WORKSPACE TAB
  function renderSettingsTab() {
    return (
      <div className="space-y-6 animate-fadeIn max-w-3xl">
        <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            ERP Workspace &amp; Statutory Settings
          </h2>
          <p className="text-xs text-slate-500 mt-1">Configure business profile, GSTIN parameters and API gateways</p>
        </div>

        <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm text-xs">
          <div className="space-y-1">
            <label className="font-bold">Firm Legal Name</label>
            <input
              type="text"
              value={businessProfile?.firmName}
              onChange={(e) => setBusinessProfile({ ...businessProfile, firmName: e.target.value })}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold">GSTIN</label>
              <input
                type="text"
                value={businessProfile?.gstin}
                onChange={(e) => setBusinessProfile({ ...businessProfile, gstin: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="font-bold">State Code</label>
              <input
                type="text"
                value={businessProfile?.stateCode}
                onChange={(e) => setBusinessProfile({ ...businessProfile, stateCode: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl font-mono"
              />
            </div>
          </div>

          <button
            onClick={() => {
              localStorage.setItem('taxflow_business_profile', JSON.stringify(businessProfile));
              showToast('Saved Settings', 'Profile saved successfully.', 'SUCCESS');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold text-xs cursor-pointer"
          >
            Save Configuration
          </button>
        </div>
      </div>
    );
  }
}

export default App;
