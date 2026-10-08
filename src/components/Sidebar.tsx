import React, { useState } from 'react';
import {
  LayoutDashboard,
  Receipt,
  ShoppingCart,
  ReceiptIndianRupee,
  Package,
  Users,
  Building2,
  Landmark,
  FileCheck,
  Database,
  FileSpreadsheet,
  Bot,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import type { BusinessProfile } from './OnboardingWizardModal';

export type TabType =
  | 'MIS_DASHBOARD'
  | 'SALES_BILLING'
  | 'PURCHASES_WORKSPACE'
  | 'EXPENSES_MODULE'
  | 'STOCK_REGISTER'
  | 'CUSTOMERS_360'
  | 'VENDORS_360'
  | 'BANK_RECON'
  | 'GST_COMMAND_CENTER'
  | 'GST_ISSUE_CENTER'
  | 'TALLY_CA_HUB'
  | 'REPORTS_CENTER'
  | 'AI_ASSISTANT'
  | 'SETTINGS'
  | 'HELP_SUPPORT'
  | 'EWAY_BILLS'
  | 'AI_PURCHASE_OCR'
  | 'GSTR1_REPORTS'
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
  businessProfile?: BusinessProfile;
  selectedFY?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
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
  businessProfile,
  selectedFY = 'FY 2026–27',
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const collapsed = isCollapsed ?? internalCollapsed;
  const toggleCollapse = onToggleCollapse || (() => setInternalCollapsed(!internalCollapsed));

  const mainNavigation = [
    {
      id: 'MIS_DASHBOARD' as TabType,
      label: 'Overview Dashboard',
      shortLabel: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'SALES_BILLING' as TabType,
      label: 'Sales',
      shortLabel: 'Sales',
      icon: Receipt,
      badge: null,
    },
    {
      id: 'PURCHASES_WORKSPACE' as TabType,
      label: 'Purchases',
      shortLabel: 'Purchases',
      icon: ShoppingCart,
      badge: unpostedOcrCount > 0 ? unpostedOcrCount : null,
    },
    {
      id: 'EXPENSES_MODULE' as TabType,
      label: 'Expenses',
      shortLabel: 'Expenses',
      icon: CreditCard,
      badge: null,
    },
    {
      id: 'STOCK_REGISTER' as TabType,
      label: 'Inventory',
      shortLabel: 'Inventory',
      icon: Package,
      badge: lowStockCount > 0 ? lowStockCount : null,
    },
    {
      id: 'CUSTOMERS_360' as TabType,
      label: 'Customers',
      shortLabel: 'Customers',
      icon: Users,
      badge: null,
    },
    {
      id: 'VENDORS_360' as TabType,
      label: 'Vendors',
      shortLabel: 'Vendors',
      icon: Building2,
      badge: null,
    },
    {
      id: 'BANK_RECON' as TabType,
      label: 'Banking',
      shortLabel: 'Banking',
      icon: Landmark,
      badge: unreconciledBankCount > 0 ? unreconciledBankCount : null,
    },
    {
      id: 'GST_COMMAND_CENTER' as TabType,
      label: 'GST & Returns',
      shortLabel: 'GST Hub',
      icon: FileCheck,
      badge: null,
    },
    {
      id: 'TALLY_CA_HUB' as TabType,
      label: 'TallyPrime',
      shortLabel: 'Tally',
      icon: Database,
      badge: null,
    },
    {
      id: 'REPORTS_CENTER' as TabType,
      label: 'Reports',
      shortLabel: 'Reports',
      icon: FileSpreadsheet,
      badge: null,
    },
    {
      id: 'AI_ASSISTANT' as TabType,
      label: 'AI Assistant',
      shortLabel: 'AI Copilot',
      icon: Bot,
      badge: null,
    },
  ];

  const workspaceNavigation = [
    {
      id: 'SETTINGS' as TabType,
      label: 'Settings',
      icon: Settings,
    },
    {
      id: 'HELP_SUPPORT' as TabType,
      label: 'Help & Support',
      icon: HelpCircle,
    },
  ];

  const handleSelectTab = (tab: TabType) => {
    setActiveTab(tab);
    if (isMobile) {
      onCloseMobileMenu();
    }
  };

  const isCurrentActive = (id: TabType) => {
    if (activeTab === id) return true;
    if (id === 'SALES_BILLING' && activeTab === 'EWAY_BILLS') return true;
    if (id === 'PURCHASES_WORKSPACE' && activeTab === 'AI_PURCHASE_OCR') return true;
    if (id === 'GST_COMMAND_CENTER' && (activeTab === 'GST_ISSUE_CENTER' || activeTab === 'GSTR1_REPORTS')) return true;
    if (id === 'CUSTOMERS_360' && activeTab === 'PARTIES_MASTER') return true;
    return false;
  };

  const firmName = businessProfile?.firmName || 'Apex Electronics & Industrial Traders';

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside
        className={`${
          isMobile ? 'hidden' : 'hidden lg:flex'
        } ${
          collapsed ? 'w-[72px]' : 'w-[252px]'
        } flex-col justify-between shrink-0 h-[calc(100vh-56px)] sticky top-14 bg-white dark:bg-[#0E131F] border-r border-slate-200 dark:border-slate-800/80 transition-all duration-300 z-20 select-none`}
      >
        {/* TOP BRAND LOCKUP & COLLAPSE TOGGLE */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-between px-3.5 py-3 border-b border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shrink-0 shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              {!collapsed && (
                <div className="min-w-0 truncate">
                  <div className="font-bold text-sm text-slate-900 dark:text-slate-100 tracking-tight truncate">
                    TaxFlow AI ERP
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono tracking-wide truncate">
                    India GST · MSME Edition
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={toggleCollapse}
              aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* MAIN SCROLLABLE NAVIGATION LIST */}
          <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
            {!collapsed && (
              <div className="px-3 pb-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Navigation
              </div>
            )}

            {mainNavigation.map(({ id, label, icon: Icon, badge }) => {
              const active = isCurrentActive(id);

              return (
                <button
                  key={id}
                  onClick={() => handleSelectTab(id)}
                  title={collapsed ? label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer text-left group relative ${
                    active
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                  } ${collapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    }`}
                  />
                  {!collapsed && (
                    <span className="flex-1 truncate">{label}</span>
                  )}
                  {!collapsed && badge !== null && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                      {badge}
                    </span>
                  )}
                  {collapsed && badge !== null && (
                    <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-[#0E131F]" />
                  )}
                </button>
              );
            })}

            {!collapsed && (
              <div className="pt-4 px-3 pb-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Workspace
              </div>
            )}

            {workspaceNavigation.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;

              return (
                <button
                  key={id}
                  onClick={() => handleSelectTab(id)}
                  title={collapsed ? label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer text-left group ${
                    active
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                  } ${collapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    }`}
                  />
                  {!collapsed && <span className="flex-1 truncate">{label}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* BOTTOM METADATA: COMPANY, FINANCIAL YEAR, USER AVATAR */}
        <div className="p-2 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40">
          {!collapsed ? (
            <div className="space-y-2 p-1.5">
              <div className="min-w-0">
                <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate" title={firmName}>
                  {firmName}
                </div>
                <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
                  <span>{selectedFY}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">● Active</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-slate-200/50 dark:border-slate-800/60">
                <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs shrink-0">
                  CA
                </div>
                <div className="min-w-0 truncate">
                  <div className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">Ramesh Patel</div>
                  <div className="text-[10px] text-slate-400 truncate">Chartered Accountant</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-1">
              <div
                className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs"
                title={`${firmName} (${selectedFY})`}
              >
                CA
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* MOBILE DRAWER (LG:HIDDEN) */}
      {isMobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 lg:hidden bg-slate-950/60 backdrop-blur-sm"
          onClick={onCloseMobileMenu}
        >
          <div
            className="w-[280px] h-full bg-white dark:bg-[#0E131F] flex flex-col justify-between shadow-2xl animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* DRAWER HEADER */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-slate-100">TaxFlow AI ERP</div>
                  <div className="text-[10px] text-slate-400 font-mono">{selectedFY}</div>
                </div>
              </div>
              <button
                onClick={onCloseMobileMenu}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* DRAWER NAV ITEMS */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              <div className="px-3 pb-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Menu
              </div>
              {mainNavigation.map(({ id, label, icon: Icon, badge }) => {
                const active = isCurrentActive(id);
                return (
                  <button
                    key={id}
                    onClick={() => handleSelectTab(id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-left cursor-pointer transition-colors ${
                      active
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span>{label}</span>
                    </div>
                    {badge !== null && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}

              <div className="pt-3 px-3 pb-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Workspace
              </div>
              {workspaceNavigation.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleSelectTab(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-left cursor-pointer transition-colors ${
                    activeTab === id
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* DRAWER FOOTER */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{firmName}</div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">GSTIN: {businessProfile?.gstin || '24AAPCA1234F1ZV'}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
