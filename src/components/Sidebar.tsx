import React, { useState } from 'react';
import {
  LayoutDashboard,
  Receipt,
  Truck,
  Bot,
  Landmark,
  Package,
  FileCheck,
  FileSpreadsheet,
  Users,
  Settings,
  LayoutGrid,
  X,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { PartyMasterManager } from './PartyMasterManager';

export type TabType =
  | 'MIS_DASHBOARD'
  | 'SALES_BILLING'
  | 'EWAY_BILLS'
  | 'AI_PURCHASE_OCR'
  | 'BANK_RECON'
  | 'STOCK_REGISTER'
  | 'GSTR1_REPORTS'
  | 'TALLY_CA_HUB'
  | 'PARTIES_MASTER';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  unpostedOcrCount?: number;
  unreconciledBankCount?: number;
  lowStockCount?: number;
  isMobile?: boolean;
  isMobileMenuOpen?: boolean;
  onCloseMobileMenu?: () => void;
  isMobileSimulator?: boolean;
  onToggleMobileSimulator?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  unpostedOcrCount = 0,
  unreconciledBankCount = 0,
  lowStockCount = 0,
  isMobile = false,
  isMobileMenuOpen = false,
  onCloseMobileMenu = () => {},
  isMobileSimulator = false,
  onToggleMobileSimulator,
}) => {
  const [showPartyManager, setShowPartyManager] = useState(false);
  const [localDrawerOpen, setLocalDrawerOpen] = useState(false);

  const isDrawerActive = isMobileMenuOpen || localDrawerOpen;
  const closeDrawer = () => {
    setLocalDrawerOpen(false);
    onCloseMobileMenu();
  };

  const openPartyMaster = () => {
    setActiveTab('PARTIES_MASTER');
    setShowPartyManager(true);
    closeDrawer();
  };

  const selectTab = (tab: TabType) => {
    setActiveTab(tab);
    closeDrawer();
  };

  const menuItems = [
    { id: 'MIS_DASHBOARD' as TabType, label: 'Executive MIS', shortLabel: 'MIS', Icon: LayoutDashboard, badge: null, subtitle: 'Real-time overview' },
    { id: 'SALES_BILLING' as TabType, label: 'Sales Invoicing', shortLabel: 'Sales', Icon: Receipt, badge: null, subtitle: 'GST billing & print' },
    { id: 'EWAY_BILLS' as TabType, label: 'E-Way Bill Hub', shortLabel: 'E-Way', Icon: Truck, badge: null, subtitle: 'Transport compliance' },
    { id: 'AI_PURCHASE_OCR' as TabType, label: 'AI Purchase OCR', shortLabel: 'AI OCR', Icon: Bot, badge: unpostedOcrCount, subtitle: 'Bill photo scanner' },
    { id: 'BANK_RECON' as TabType, label: 'Bank Reconciliation', shortLabel: 'Bank', Icon: Landmark, badge: unreconciledBankCount, subtitle: 'Match bank entries' },
    { id: 'STOCK_REGISTER' as TabType, label: 'Stock Register', shortLabel: 'Stock', Icon: Package, badge: lowStockCount, subtitle: 'Inventory & alerts' },
    { id: 'GSTR1_REPORTS' as TabType, label: 'GSTR-1 Reports', shortLabel: 'GSTR-1', Icon: FileCheck, badge: null, subtitle: 'Ready-to-file JSON' },
    { id: 'TALLY_CA_HUB' as TabType, label: 'Tally & CA Hub', shortLabel: 'Tally', Icon: FileSpreadsheet, badge: null, subtitle: 'XML & Excel bridge' },
    { id: 'PARTIES_MASTER' as TabType, label: 'Party Master', shortLabel: 'Parties', Icon: Users, badge: null, subtitle: 'Customer & vendor logs' },
  ];

  const totalBadges = (unpostedOcrCount || 0) + (unreconciledBankCount || 0) + (lowStockCount || 0);

  // Primary 4 tabs for mobile dock
  const primaryDockTabs: TabType[] = ['MIS_DASHBOARD', 'SALES_BILLING', 'AI_PURCHASE_OCR', 'BANK_RECON'];
  const isSecondaryActive = !primaryDockTabs.includes(activeTab);

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className={isMobile ? 'hidden' : 'hidden lg:flex w-[272px] bg-white/85 backdrop-blur-sm border-r border-slate-200/80 flex-col justify-between shrink-0 min-h-[calc(100vh-61px)] shadow-[4px_0_24px_rgba(15,23,42,0.03)]'}>
        <div className="p-3 space-y-1.5 overflow-y-auto">
          <div className="px-3 pt-2 pb-1.5 text-[9px] font-black uppercase tracking-[.18em] text-slate-400">
            ERP Workspace
          </div>
          {menuItems.map(({ id, label, Icon, badge, subtitle }) => (
            <div key={id} className="flex items-stretch gap-1">
              <button
                onClick={() => (id === 'PARTIES_MASTER' ? openPartyMaster() : setActiveTab(id))}
                className={`group min-w-0 flex-1 flex items-center justify-between p-2.5 rounded-2xl text-left border transition-all duration-200 cursor-pointer ${
                  activeTab === id
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-600 text-white border-blue-500 shadow-md shadow-blue-600/15 font-semibold'
                    : 'text-slate-700 border-transparent hover:border-slate-200 hover:bg-white hover:shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2 rounded-xl shrink-0 transition-transform group-hover:scale-105 ${
                      activeTab === id
                        ? 'bg-white/15 text-white ring-1 ring-white/20'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold truncate">{label}</div>
                    <div className={`text-[10px] mt-0.5 truncate ${activeTab === id ? 'text-blue-100' : 'text-slate-400'}`}>
                      {subtitle}
                    </div>
                  </div>
                </div>
                {badge !== null && badge > 0 && (
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                      activeTab === id ? 'bg-white text-blue-700' : 'bg-rose-500 text-white'
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </button>
              {id === 'PARTIES_MASTER' && (
                <button
                  type="button"
                  onClick={openPartyMaster}
                  className="shrink-0 h-auto min-h-[44px] w-14 rounded-2xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-400 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-0.5 font-black"
                  title="Manage customers and vendors"
                  aria-label="Manage customers and vendors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span className="text-[8px] uppercase tracking-wider">Manage</span>
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="p-3 m-3 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/60 border border-slate-200/80 shadow-inner">
          <div className="flex items-center justify-between font-extrabold text-xs">
            <span>Gujarat State (24)</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">ACTIVE</span>
          </div>
          <div className="mt-1.5 text-[10px] text-slate-500 leading-relaxed">
            GST workspace is ready for sales billing, OCR invoices and Tally export.
          </div>
        </div>
      </aside>

      {/* MOBILE BOTTOM DOCK (LG:HIDDEN) - SLEEK SINGLE-ROW BAR */}
      <nav
        className={`${
          isMobile
            ? 'absolute bottom-0 inset-x-0 z-30'
            : 'lg:hidden fixed bottom-0 inset-x-0 z-40'
        } bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-6px_25px_rgba(15,23,42,0.06)] px-2 py-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom,0px))]`}
        aria-label="Mobile navigation"
      >
        <div className="w-full max-w-lg mx-auto grid grid-cols-5 gap-1 items-center">
          {/* TAB 1: MIS */}
          <button
            onClick={() => selectTab('MIS_DASHBOARD')}
            className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl transition-all ${
              activeTab === 'MIS_DASHBOARD'
                ? 'text-blue-700 font-extrabold bg-blue-50/80 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 leading-none">MIS</span>
          </button>

          {/* TAB 2: SALES BILLING */}
          <button
            onClick={() => selectTab('SALES_BILLING')}
            className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl transition-all ${
              activeTab === 'SALES_BILLING'
                ? 'text-blue-700 font-extrabold bg-blue-50/80 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Receipt className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 leading-none">Sales</span>
          </button>

          {/* TAB 3: AI PURCHASE OCR */}
          <button
            onClick={() => selectTab('AI_PURCHASE_OCR')}
            className={`relative flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl transition-all ${
              activeTab === 'AI_PURCHASE_OCR'
                ? 'text-purple-700 font-extrabold bg-purple-50/80 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bot className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 leading-none">AI OCR</span>
            {unpostedOcrCount > 0 && (
              <span className="absolute top-1 right-2 min-w-4 h-4 px-1 rounded-full bg-purple-600 text-white text-[8px] font-black flex items-center justify-center ring-2 ring-white">
                {unpostedOcrCount}
              </span>
            )}
          </button>

          {/* TAB 4: BANK RECON */}
          <button
            onClick={() => selectTab('BANK_RECON')}
            className={`relative flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl transition-all ${
              activeTab === 'BANK_RECON'
                ? 'text-emerald-700 font-extrabold bg-emerald-50/80 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Landmark className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 leading-none">Bank</span>
            {unreconciledBankCount > 0 && (
              <span className="absolute top-1 right-2 min-w-4 h-4 px-1 rounded-full bg-emerald-600 text-white text-[8px] font-black flex items-center justify-center ring-2 ring-white">
                {unreconciledBankCount}
              </span>
            )}
          </button>

          {/* TAB 5: ALL MODULES DRAWER */}
          <button
            onClick={() => setLocalDrawerOpen(true)}
            className={`relative flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl transition-all ${
              isSecondaryActive || isDrawerActive
                ? 'text-indigo-700 font-extrabold bg-indigo-50/80 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 leading-none">More</span>
            {lowStockCount > 0 && (
              <span className="absolute top-1 right-2 min-w-4 h-4 px-1 rounded-full bg-amber-500 text-white text-[8px] font-black flex items-center justify-center ring-2 ring-white">
                !
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* MOBILE SLIDE-OVER ALL-MODULES DRAWER */}
      {isDrawerActive && (
        <div className={`${isMobile ? 'absolute inset-0 z-40' : 'fixed inset-0 z-50 lg:hidden'} flex flex-col justify-end overflow-hidden`}>
          {/* BACKDROP */}
          <div
            onClick={closeDrawer}
            className={`${isMobile ? 'absolute' : 'fixed'} inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity`}
          />

          {/* DRAWER PANEL */}
          <div className="relative bg-white rounded-t-3xl shadow-2xl border-t border-slate-200 max-h-[85vh] overflow-y-auto p-4 sm:p-6 space-y-4 animate-fadeIn">
            {/* DRAWER HEADER */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" /> All ERP Modules &amp; Hubs
                </h3>
                <p className="text-xs text-slate-500">Quickly jump to any MSME accounting module</p>
              </div>
              <button
                onClick={closeDrawer}
                className="h-9 w-9 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* MODULES GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {menuItems.map(({ id, label, Icon, badge, subtitle }) => (
                <button
                  key={id}
                  onClick={() => selectTab(id)}
                  className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    activeTab === id
                      ? 'bg-blue-50/80 border-blue-300 text-blue-900 font-bold shadow-sm'
                      : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        activeTab === id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{label}</div>
                      <div className="text-[10px] text-slate-400 truncate">{subtitle}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {badge !== null && badge > 0 && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500 text-white">
                        {badge}
                      </span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </button>
              ))}
            </div>

            {/* QUICK ACTIONS ROW */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={openPartyMaster}
                className="flex-1 flex items-center justify-center gap-1.5 min-h-11 px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" /> Manage Parties
              </button>
              {onToggleMobileSimulator && (
                <button
                  type="button"
                  onClick={() => {
                    closeDrawer();
                    onToggleMobileSimulator();
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 min-h-11 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    isMobileSimulator
                      ? 'bg-purple-100 border-purple-300 text-purple-800 hover:bg-purple-200'
                      : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  {isMobileSimulator ? 'Exit Phone View' : 'Phone Simulator'}
                </button>
              )}
              <button
                type="button"
                onClick={closeDrawer}
                className="flex-1 flex items-center justify-center min-h-11 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                Close Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PARTY MASTER MODAL */}
      <PartyMasterManager isOpen={showPartyManager} onClose={() => setShowPartyManager(false)} />
    </>
  );
};
