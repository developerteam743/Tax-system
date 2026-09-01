import React from 'react';
import type { ViewMode, HostServerStatus } from '../types/tax';
import { Smartphone, Laptop, Search, Sparkles, Server, Building2 } from 'lucide-react';
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
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  setViewMode,
  onOpenHostModal,
  isMobileSimulator,
  setIsMobileSimulator,
  isBackendConnected = true,
  businessProfile,
  onOpenOnboarding
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 px-4 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-600 bg-clip-text text-transparent">
                TaxFlow AI
              </span>
              <span className="text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                Gujarat ERP Pro ({businessProfile?.stateCode || '24'})
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block font-medium">
              {businessProfile ? `${businessProfile.firmName} • GSTIN: ${businessProfile.gstin}` : 'Smart MSME Billing • AI OCR • Bank Matcher • Tally Ready'}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex items-center gap-3 flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoice #, customer name, GSTIN, HSN..."
              className="w-full bg-slate-100/80 border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Controls Right */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden lg:flex items-center gap-1.5 text-[10px] font-mono text-slate-500 bg-slate-100/80 border border-slate-200/80 px-2.5 py-1 rounded-lg">
            <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold text-blue-700 shadow-2xs">F2</span> Sales Bill
            <span className="text-slate-300">•</span>
            <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold text-purple-700 shadow-2xs">F4</span> OCR
            <span className="text-slate-300">•</span>
            <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold text-emerald-700 shadow-2xs">F7</span> Bank Recon
          </div>

          {/* Switch Firm / Onboarding Button */}
          <button
            onClick={onOpenOnboarding}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 hover:bg-slate-200 transition-all font-semibold"
            title="Setup New Business / Switch Active GSTIN Firm"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Switch / Setup Firm</span>
          </button>

          {/* C# .NET 8 API Connection Indicator */}
          <div
            className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-xl border transition-all ${
              isBackendConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
            title="C# ASP.NET Core 8 Web API Status"
          >
            <Server className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline font-mono">.NET 8 API (Port 5000)</span>
          </div>

          {/* Mobile View Simulator Toggle */}
          <button
            onClick={() => setIsMobileSimulator(!isMobileSimulator)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer font-semibold ${
              isMobileSimulator
                ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/20'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
            title="Toggle Executive Mobile View Simulator"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-medium">Partner Mobile</span>
          </button>

          {/* View Mode Switcher (Operations vs CA View) */}
          <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('OPERATIONS')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'OPERATIONS'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Operations
            </button>
            <button
              onClick={() => setViewMode('CA_VIEW')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'CA_VIEW'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              CA Hub
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
