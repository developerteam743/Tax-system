import React from 'react';
import { LayoutDashboard, Receipt, Truck, Bot, Landmark, Package, FileCheck, FileSpreadsheet, Users } from 'lucide-react';

export type TabType = 'MIS_DASHBOARD' | 'SALES_BILLING' | 'EWAY_BILLS' | 'AI_PURCHASE_OCR' | 'BANK_RECON' | 'STOCK_REGISTER' | 'GSTR1_REPORTS' | 'TALLY_CA_HUB' | 'PARTIES_MASTER';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  unpostedOcrCount?: number;
  unreconciledBankCount?: number;
  lowStockCount?: number;
  isMobile?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, unpostedOcrCount = 0, unreconciledBankCount = 0, lowStockCount = 0, isMobile = false }) => {
  const menuItems = [
    ['MIS_DASHBOARD', 'Executive MIS', LayoutDashboard, null], ['SALES_BILLING', 'Sales Invoicing', Receipt, null], ['EWAY_BILLS', 'E-Way Bill Hub', Truck, null],
    ['AI_PURCHASE_OCR', 'AI Purchase OCR', Bot, unpostedOcrCount], ['BANK_RECON', 'Bank Reconciliation', Landmark, unreconciledBankCount], ['STOCK_REGISTER', 'Stock Register', Package, lowStockCount],
    ['GSTR1_REPORTS', 'GSTR-1 Reports', FileCheck, null], ['TALLY_CA_HUB', 'Tally & CA Hub', FileSpreadsheet, null], ['PARTIES_MASTER', 'Party Master', Users, null],
  ] as const;

  const subtitle = (id: string) => ({
    MIS_DASHBOARD: 'Receivables, Payables, Cashflow', SALES_BILLING: 'GST Bills & Fast Creator', EWAY_BILLS: 'Distance, Transporter & Part-B',
    AI_PURCHASE_OCR: 'Photo Scan & Auto Post', BANK_RECON: 'Statement Fuzzy Matcher', STOCK_REGISTER: 'Live Inventory & Valuation',
    GSTR1_REPORTS: 'Portal JSON & Excel Tables', TALLY_CA_HUB: '1-Click XML & Excel Vouchers', PARTIES_MASTER: 'Customers & Suppliers Ledger'
  } as Record<string, string>)[id];

  const desktopSidebarClass = isMobile
    ? 'hidden'
    : 'hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col justify-between shrink-0 min-h-[calc(100vh-61px)] shadow-sm';
  const mobileNavClass = isMobile
    ? 'flex'
    : 'lg:hidden';

  return <>
    <aside className={desktopSidebarClass} aria-label="Desktop navigation">
      <div className="p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Core ERP Modules</div>
        {menuItems.map(([id, label, Icon, badge]) => {
          const isActive = activeTab === id;
          return <button key={id} onClick={() => setActiveTab(id)} className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all group ${isActive ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md font-semibold' : 'text-slate-700 hover:bg-slate-100'}`}>
            <div className="flex items-center gap-3 min-w-0"><div className={`p-2 rounded-lg shrink-0 ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}><Icon className="w-4 h-4" /></div><div className="min-w-0"><div className="text-xs font-semibold leading-none truncate">{label}</div><div className={`text-[10px] mt-1 truncate ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>{subtitle(id)}</div></div></div>
            {badge !== null && badge > 0 && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white shrink-0">{badge}</span>}
          </button>;
        })}
      </div>
      <div className="p-3 m-3 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-200/80 text-xs text-slate-600"><div className="flex items-center justify-between font-bold text-slate-800"><span>Gujarat State (24)</span><span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 font-mono font-bold">ONLINE</span></div><p className="text-[11px] mt-1 text-slate-500">GSTIN: <span className="font-mono text-slate-700 font-semibold">24AAPCA1234F1ZV</span></p></div>
    </aside>

    <nav className={`${mobileNavClass} fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-[0_-4px_16px_rgba(15,23,42,0.08)] px-1 pb-[env(safe-area-inset-bottom)]`} aria-label="Mobile navigation">
      <div className="w-full max-w-xl mx-auto">
        <div className="grid grid-cols-5 py-1">
          {menuItems.slice(0, 5).map(([id, label, Icon, badge]) => <button key={id} onClick={() => setActiveTab(id)} aria-label={label} className={`relative flex flex-col items-center justify-center gap-0.5 min-h-14 px-1 rounded-xl ${activeTab === id ? 'text-blue-700 bg-blue-50' : 'text-slate-500'}`}><Icon className="w-5 h-5" /><span className="text-[9px] font-semibold leading-tight truncate max-w-full">{label.replace('Executive ', '').replace(' Invoicing', '').replace(' Reconciliation', ' Recon')}</span>{badge !== null && badge > 0 && <span className="absolute top-0.5 right-1/4 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">{badge}</span>}</button>)}
        </div>
        <div className="grid grid-cols-4 border-t border-slate-100 py-1">
          {menuItems.slice(5).map(([id, label, Icon, badge]) => <button key={id} onClick={() => setActiveTab(id)} className={`flex items-center justify-center gap-1 min-h-9 px-1 rounded-lg text-[9px] font-semibold ${activeTab === id ? 'text-blue-700 bg-blue-50' : 'text-slate-500'}`}><Icon className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{label}</span>{badge !== null && badge > 0 && <span className="text-[8px] rounded-full bg-red-500 text-white px-1">{badge}</span>}</button>)}
        </div>
      </div>
    </nav>
  </>;
};