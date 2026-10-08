import React from 'react';
import type { ViewMode, HostServerStatus } from '../types/tax';
import { Smartphone, Search, Sparkles, Server, Building2, Menu, X } from 'lucide-react';
import type { BusinessProfile } from './OnboardingWizardModal';

interface NavbarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  hostStatus: HostServerStatus;
  onOpenHostModal: () => void;
  isMobileSimulator: boolean;
  setIsMobileSimulator: (val: boolean) => void;
  isBackendConnected?: boolean;
  businessProfile?: BusinessProfile;
  onOpenOnboarding: () => void;
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  setViewMode,
  onOpenOnboarding,
  isMobileSimulator,
  setIsMobileSimulator,
  isBackendConnected = true,
  businessProfile,
  isMobileMenuOpen = false,
  onToggleMobileMenu = () => {},
}) => (
  <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl px-3 sm:px-4 py-2.5 shadow-[0_4px_24px_rgba(15,23,42,0.05)]">
    <div className="max-w-[1500px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
      {/* BRAND & FIRM TITLE */}
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
        <div className="relative h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-[var(--shadow-soft)] shadow-blue-500/20 ring-1 ring-white/60">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="font-black text-base sm:text-lg tracking-tight bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-600 bg-clip-text text-transparent whitespace-nowrap">TaxFlow AI</span>
            <span className="hidden sm:inline text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 uppercase whitespace-nowrap">Gujarat · {businessProfile?.stateCode || '24'}</span>
          </div>
          <p className="text-[11px] text-slate-500 hidden md:block font-medium truncate max-w-[28rem] lg:max-w-[36rem]">
            {businessProfile ? `${businessProfile.firmName} • GSTIN: ${businessProfile.gstin}` : 'Smart MSME Billing • AI OCR • Bank Matcher • Tally Ready'}
          </p>
        </div>
      </div>

      {/* DESKTOP SEARCH */}
      <div className="hidden lg:flex items-center gap-3 flex-1 max-w-md mx-2">
        <div className="relative w-full group">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search invoice, customer, GSTIN, HSN..."
            className="w-full bg-slate-100/70 border border-slate-200 rounded-2xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-400 transition-all shadow-inner"
          />
          <kbd className="hidden xl:block absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono font-bold text-slate-400 bg-white border border-slate-200 rounded-md px-1.5 py-0.5">⌘ K</kbd>
        </div>
      </div>

      {/* ACTION CONTROLS */}
      <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0">
        {/* SHORTCUTS HINTS (XL ONLY) */}
        <div className="hidden xl:flex items-center gap-1.5 text-[10px] font-mono text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl">
          <span className="bg-white px-1.5 py-0.5 rounded border font-bold text-blue-700">F2</span> Sales
          <span>•</span><span className="bg-white px-1.5 py-0.5 rounded border font-bold text-purple-700">F4</span> OCR
          <span>•</span><span className="bg-white px-1.5 py-0.5 rounded border font-bold text-emerald-700">F7</span> Bank
        </div>

        {/* SWITCH / SETUP FIRM */}
        <button
          onClick={onOpenOnboarding}
          title="Switch or configure business profile"
          className="group flex items-center gap-1.5 text-xs px-2.5 sm:px-3 py-2 rounded-xl bg-white border border-slate-200 font-bold min-h-9 shadow-[var(--shadow-soft)] hover:border-blue-300 hover:bg-blue-50/60 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
        >
          <Building2 className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">Firm</span>
        </button>

        {/* BACKEND API STATUS (COMPACT ON MOBILE) */}
        <div
          className={`flex items-center gap-1.5 text-[11px] font-bold px-2 sm:px-2.5 py-2 rounded-xl border shadow-[var(--shadow-soft)] ${
            isBackendConnected ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
          title="TaxFlow Full-Stack API Gateway"
        >
          <span className={`h-2 w-2 rounded-full ${isBackendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <Server className="w-3.5 h-3.5 hidden sm:inline" />
          <span className="hidden md:inline font-mono">Node API</span>
        </div>

        {/* MOBILE SIMULATOR TOGGLE */}
        <button
          onClick={() => setIsMobileSimulator(!isMobileSimulator)}
          className={`flex items-center gap-1.5 text-xs px-2 sm:px-2.5 py-2 rounded-xl border min-h-9 shadow-[var(--shadow-soft)] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40 ${
            isMobileSimulator ? 'bg-purple-600 text-white border-purple-500 shadow-purple-500/20' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
          title="Toggle phone viewport simulation"
        >
          <Smartphone className={`w-3.5 h-3.5 ${isMobileSimulator ? 'text-white' : 'text-purple-600'}`} />
          <span className="hidden sm:inline">{isMobileSimulator ? 'Exit Phone' : 'Phone View'}</span>
        </button>

        {/* OPERATIONS / CA HUB TOGGLE */}
        <div className="flex bg-slate-100/90 p-0.5 rounded-xl border border-slate-200 shadow-inner">
          <button
            onClick={() => setViewMode('OPERATIONS')}
            className={`cursor-pointer px-2 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-extrabold min-h-8 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${
              viewMode === 'OPERATIONS' ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Ops
          </button>
          <button
            onClick={() => setViewMode('CA_VIEW')}
            className={`cursor-pointer px-2 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-extrabold min-h-8 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${
              viewMode === 'CA_VIEW' ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            CA
          </button>
        </div>

        {/* MOBILE DRAWER TOGGLE (LG:HIDDEN) */}
        <button
          onClick={onToggleMobileMenu}
          aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          className="lg:hidden h-9 w-9 min-h-9 min-w-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
        >
          {isMobileMenuOpen ? <X className="w-4 h-4 text-slate-800" /> : <Menu className="w-4 h-4 text-slate-800" />}
        </button>
      </div>
    </div>
  </header>
);
