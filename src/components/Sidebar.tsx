import React, { useState } from 'react';
import { LayoutDashboard, Receipt, Truck, Bot, Landmark, Package, FileCheck, FileSpreadsheet, Users, Settings } from 'lucide-react';
import { PartyMasterManager } from './PartyMasterManager';

export type TabType = 'MIS_DASHBOARD' | 'SALES_BILLING' | 'EWAY_BILLS' | 'AI_PURCHASE_OCR' | 'BANK_RECON' | 'STOCK_REGISTER' | 'GSTR1_REPORTS' | 'TALLY_CA_HUB' | 'PARTIES_MASTER';

interface SidebarProps { activeTab: TabType; setActiveTab: (tab: TabType) => void; unpostedOcrCount?: number; unreconciledBankCount?: number; lowStockCount?: number; isMobile?: boolean; }

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, unpostedOcrCount = 0, unreconciledBankCount = 0, lowStockCount = 0, isMobile = false }) => {
  const [showPartyManager, setShowPartyManager] = useState(false);
  const openPartyMaster = () => { setActiveTab('PARTIES_MASTER'); setShowPartyManager(true); };

  const menuItems = [
    ['MIS_DASHBOARD', 'Executive MIS', LayoutDashboard, null, 'Business overview'],
    ['SALES_BILLING', 'Sales Invoicing', Receipt, null, 'GST billing & receipts'],
    ['EWAY_BILLS', 'E-Way Bill Hub', Truck, null, 'Transport compliance'],
    ['AI_PURCHASE_OCR', 'AI Purchase OCR', Bot, unpostedOcrCount, 'Scan & post purchases'],
    ['BANK_RECON', 'Bank Reconciliation', Landmark, unreconciledBankCount, 'Match bank entries'],
    ['STOCK_REGISTER', 'Stock Register', Package, lowStockCount, 'Inventory & low stock'],
    ['GSTR1_REPORTS', 'GSTR-1 Reports', FileCheck, null, 'GST return reporting'],
    ['TALLY_CA_HUB', 'Tally & CA Hub', FileSpreadsheet, null, 'Tally export & CA tools'],
    ['PARTIES_MASTER', 'Party Master', Users, null, 'Customers & suppliers'],
  ] as const;
  const short = ['MIS', 'Sales', 'E-Way', 'OCR', 'Bank', 'Stock', 'GSTR1', 'Tally', 'Parties'];

  return (
    <>
      <aside className={isMobile ? 'hidden' : 'hidden lg:flex w-[272px] bg-white/80 backdrop-blur-sm border-r border-slate-200/80 flex-col justify-between shrink-0 min-h-[calc(100vh-61px)] shadow-[4px_0_24px_rgba(15,23,42,0.03)]'}>
        <div className="p-3 space-y-1.5 overflow-y-auto">
          <div className="px-3 pt-2 pb-2 text-[9px] font-black uppercase tracking-[.16em] text-slate-400">Workspace</div>
          {menuItems.map(([id, label, Icon, badge, subtitle]) => (
            <div key={id} className="flex items-stretch gap-1">
              <button
                onClick={() => id === 'PARTIES_MASTER' ? openPartyMaster() : setActiveTab(id)}
                className={`group min-w-0 flex-1 flex items-center justify-between p-2.5 rounded-2xl text-left border transition-all ${activeTab === id ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-600 text-white border-blue-500 shadow-lg shadow-blue-600/15 font-semibold' : 'text-slate-700 border-transparent hover:border-slate-200 hover:bg-white hover:shadow-sm'}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-xl shrink-0 transition-transform group-hover:scale-105 ${activeTab === id ? 'bg-white/15 text-white ring-1 ring-white/20' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'}`}><Icon className="w-4 h-4" /></div>
                  <div className="min-w-0"><div className="text-xs font-extrabold truncate">{label}</div><div className={`text-[10px] mt-1 truncate ${activeTab === id ? 'text-blue-100' : 'text-slate-400'}`}>{subtitle}</div></div>
                </div>
                {badge !== null && badge > 0 && <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${activeTab === id ? 'bg-white text-blue-700' : 'bg-blue-600 text-white'}`}>{badge}</span>}
              </button>
              {id === 'PARTIES_MASTER' && (
                <button type="button" onClick={openPartyMaster} className="shrink-0 h-auto min-h-[44px] w-16 rounded-2xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-400 hover:shadow-sm flex flex-col items-center justify-center gap-0.5 font-black" title="Create, edit or delete customers and vendors" aria-label="Manage customers and vendors">
                  <Settings className="w-4 h-4" /><span className="text-[8px] uppercase leading-none tracking-wide">Manage</span>
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="p-3 m-3 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-200/80 shadow-inner">
          <div className="flex items-center justify-between font-extrabold text-xs"><span>Gujarat State (24)</span><span className="text-[9px] px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">ONLINE</span></div>
          <div className="mt-2 text-[10px] text-slate-500">GST workspace is ready for billing, reconciliation and filing.</div>
        </div>
      </aside>

      <nav className={`${isMobile ? 'flex' : 'lg:hidden'} fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] px-1 pb-[env(safe-area-inset-bottom)]`} aria-label="Mobile navigation">
        <div className="w-full max-w-xl mx-auto py-1.5">
          <div className="grid grid-cols-5 gap-1">
            {menuItems.slice(0, 5).map(([id, label, Icon, badge], i) => (
              <button key={id} onClick={() => setActiveTab(id)} aria-label={label} className={`relative flex flex-col items-center justify-center gap-1 min-h-14 px-0.5 rounded-2xl transition-all ${activeTab === id ? 'text-blue-700 bg-blue-50 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
                <Icon className="w-5 h-5" /><span className="text-[9px] font-black leading-tight truncate max-w-full">{short[i]}</span>
                {badge !== null && badge > 0 && <span className="absolute top-0.5 right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[8px] font-black flex items-center justify-center ring-2 ring-white">{badge}</span>}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-1 border-t border-slate-100 mt-1.5 pt-1.5">
            {menuItems.slice(5).map(([id, label, Icon, badge], i) => (
              <div key={id} className="relative min-w-0">
                <button onClick={() => id === 'PARTIES_MASTER' ? openPartyMaster() : setActiveTab(id)} aria-label={label} className={`w-full flex items-center justify-center gap-1 min-h-9 px-1 rounded-xl text-[9px] font-black ${activeTab === id ? 'text-blue-700 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'}`}>
                  <Icon className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{short[i + 5]}</span>{badge !== null && badge > 0 && <span className="text-[8px] rounded-full bg-rose-500 text-white px-1">{badge}</span>}
                </button>
                {id === 'PARTIES_MASTER' && <button type="button" onClick={openPartyMaster} className="absolute right-0 top-0.5 h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-[var(--shadow-soft)] shadow-blue-600/20" aria-label="Manage customers and vendors"><Settings className="w-3.5 h-3.5" /></button>}
              </div>
            ))}
          </div>
        </div>
      </nav>

      <PartyMasterManager isOpen={showPartyManager} onClose={() => setShowPartyManager(false)} />
    </>
  );
};