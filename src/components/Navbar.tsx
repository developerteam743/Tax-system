import React from 'react';
import type { ViewMode, HostServerStatus } from '../types/tax';
import { Smartphone, Search, Sparkles, Server, Building2 } from 'lucide-react';
import type { BusinessProfile } from './OnboardingWizardModal';

interface NavbarProps { viewMode: ViewMode; setViewMode: (mode: ViewMode) => void; hostStatus: HostServerStatus; onOpenHostModal: () => void; isMobileSimulator: boolean; setIsMobileSimulator: (val: boolean) => void; isBackendConnected?: boolean; businessProfile?: BusinessProfile; onOpenOnboarding: () => void; }

export const Navbar: React.FC<NavbarProps> = ({ viewMode, setViewMode, onOpenOnboarding, isMobileSimulator, setIsMobileSimulator, isBackendConnected = true, businessProfile }) => (
  <header className={`sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 px-3 sm:px-4 py-2.5 shadow-sm ${isMobileSimulator ? 'max-w-md w-full mx-auto rounded-t-3xl border-x-8 border-t-8 border-slate-900' : ''}`}>
    <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-4">
      <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-none">
        <div className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md"><Sparkles className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" /></div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 min-w-0"><span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-600 bg-clip-text text-transparent whitespace-nowrap">TaxFlow AI</span><span className="hidden md:inline text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase whitespace-nowrap">Gujarat ERP Pro ({businessProfile?.stateCode || '24'})</span></div>
          <p className="text-xs text-slate-500 hidden sm:block font-medium truncate max-w-[38rem]">{businessProfile ? `${businessProfile.firmName} • GSTIN: ${businessProfile.gstin}` : 'Smart MSME Billing • AI OCR • Bank Matcher • Tally Ready'}</p>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-3 flex-1 max-w-md mx-1 lg:mx-4"><div className="relative w-full"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Search invoice #, customer name, GSTIN, HSN..." className="w-full bg-slate-100/80 border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all" /></div></div>
      <div className="flex items-center justify-end gap-1.5 sm:gap-2 flex-wrap shrink-0">
        <div className="hidden xl:flex items-center gap-1.5 text-[10px] font-mono text-slate-500 bg-slate-100/80 border border-slate-200/80 px-2.5 py-1 rounded-lg"><span className="bg-white px-1.5 py-0.5 rounded border font-bold text-blue-700">F2</span> Sales Bill <span>•</span><span className="bg-white px-1.5 py-0.5 rounded border font-bold text-purple-700">F4</span> OCR <span>•</span><span className="bg-white px-1.5 py-0.5 rounded border font-bold text-emerald-700">F7</span> Bank Recon</div>
        <button onClick={onOpenOnboarding} className="flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-xl bg-slate-100 border border-slate-200 font-semibold min-h-9"><Building2 className="w-3.5 h-3.5 text-blue-600" /><span className="hidden sm:inline">Switch / Setup Firm</span></button>
        <div className={`flex items-center gap-1.5 text-[11px] font-bold px-2 py-1.5 rounded-xl border ${isBackendConnected ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`} title="C# ASP.NET Core 8 Web API Status"><Server className="w-3.5 h-3.5 text-emerald-600" /><span className="hidden sm:inline font-mono">.NET 8 API</span></div>
        <button onClick={() => setIsMobileSimulator(!isMobileSimulator)} className={`flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-xl border min-h-9 ${isMobileSimulator ? 'bg-purple-600 text-white border-purple-500 shadow-md' : 'bg-slate-100 text-slate-700 border-slate-200'}`} title="Toggle mobile simulator"><Smartphone className="w-3.5 h-3.5" /><span className="hidden sm:inline">{isMobileSimulator ? 'Exit Mobile' : 'Partner Mobile'}</span></button>
        <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200"><button onClick={() => setViewMode('OPERATIONS')} className={`px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold min-h-8 ${viewMode === 'OPERATIONS' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500'}`}>Operations</button><button onClick={() => setViewMode('CA_VIEW')} className={`px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold min-h-8 ${viewMode === 'CA_VIEW' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500'}`}>CA Hub</button></div>
      </div>
    </div>
  </header>
);