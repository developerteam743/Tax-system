import React from 'react';
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
} from 'lucide-react';

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
  unpostedOcrCount: number;
  unreconciledBankCount: number;
  lowStockCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  unpostedOcrCount,
  unreconciledBankCount,
  lowStockCount,
}) => {
  const menuItems = [
    {
      id: 'MIS_DASHBOARD' as TabType,
      label: 'Executive MIS',
      sublabel: 'Receivables, Payables, Cashflow',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'SALES_BILLING' as TabType,
      label: 'Sales Invoicing',
      sublabel: 'GST Bills & Fast Creator',
      icon: Receipt,
      badge: null,
    },
    {
      id: 'EWAY_BILLS' as TabType,
      label: 'E-Way Bill Hub',
      sublabel: 'Distance, Transporter & Part-B',
      icon: Truck,
      badge: null,
    },
    {
      id: 'AI_PURCHASE_OCR' as TabType,
      label: 'AI Purchase OCR',
      sublabel: 'Photo Scan & Auto Post',
      icon: Bot,
      badge: unpostedOcrCount > 0 ? unpostedOcrCount : null,
      badgeColor: 'bg-purple-600 text-white',
    },
    {
      id: 'BANK_RECON' as TabType,
      label: 'Bank Reconciliation',
      sublabel: 'Statement Fuzzy Matcher',
      icon: Landmark,
      badge: unreconciledBankCount > 0 ? unreconciledBankCount : null,
      badgeColor: 'bg-emerald-600 text-white',
    },
    {
      id: 'STOCK_REGISTER' as TabType,
      label: 'Stock Register',
      sublabel: 'Live Inventory & Valuation',
      icon: Package,
      badge: lowStockCount > 0 ? lowStockCount : null,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'GSTR1_REPORTS' as TabType,
      label: 'GSTR-1 Reports',
      sublabel: 'Portal JSON & Excel Tables',
      icon: FileCheck,
      badge: null,
    },
    {
      id: 'TALLY_CA_HUB' as TabType,
      label: 'Tally & CA Hub',
      sublabel: '1-Click XML & Excel Vouchers',
      icon: FileSpreadsheet,
      badge: null,
    },
    {
      id: 'PARTIES_MASTER' as TabType,
      label: 'Party Master',
      sublabel: 'Customers & Suppliers Ledger',
      icon: Users,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 min-h-[calc(100vh-61px)] shadow-sm">
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Core ERP Modules
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all group cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 font-semibold'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg transition-colors ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 group-hover:text-blue-600 group-hover:bg-blue-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold leading-none">{item.label}</div>
                  <div
                    className={`text-[10px] mt-1 transition-colors ${
                      isActive ? 'text-blue-100' : 'text-slate-500 group-hover:text-slate-600'
                    }`}
                  >
                    {item.sublabel}
                  </div>
                </div>
              </div>

              {item.badge !== null && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.badgeColor || 'bg-blue-600 text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info Card */}
      <div className="p-3 m-3 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-200/80 text-xs text-slate-600">
        <div className="flex items-center justify-between font-bold text-slate-800">
          <span>Gujarat State (24)</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 font-mono font-bold">
            ONLINE
          </span>
        </div>
        <p className="text-[11px] mt-1 text-slate-500">
          GSTIN: <span className="font-mono text-slate-700 font-semibold">24AAPCA1234F1ZV</span>
        </p>
      </div>
    </aside>
  );
};
