import React, { useState } from 'react';
import type { ViewMode, HostServerStatus } from '../types/tax';
import type { BusinessProfile } from './OnboardingWizardModal';
import {
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  Building,
  Calendar,
  HelpCircle,
  Menu,
  X,
  Smartphone,
  ShieldCheck,
  Check,
  User,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  hostStatus: HostServerStatus;
  isMobileSimulator: boolean;
  setIsMobileSimulator: (val: boolean) => void;
  isBackendConnected?: boolean;
  businessProfile?: BusinessProfile;
  onOpenOnboarding: () => void;
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
  onOpenCommandPalette: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount?: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  selectedFY: string;
  onChangeFY: (fy: string) => void;
  companiesList: Array<{ id: string; name: string; gstin: string; state: string }>;
  selectedCompanyId: string;
  onSelectCompany: (companyId: string) => void;
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
  onOpenCommandPalette,
  onOpenNotifications,
  unreadNotificationsCount = 3,
  isDarkMode,
  onToggleDarkMode,
  selectedFY,
  onChangeFY,
  companiesList,
  selectedCompanyId,
  onSelectCompany,
}) => {
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [showFYDropdown, setShowFYDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const currentCompany =
    companiesList.find((c) => c.id === selectedCompanyId) || companiesList[0] || {
      id: 'c1',
      name: businessProfile?.firmName || 'Apex Electronics & Industrial Traders',
      gstin: businessProfile?.gstin || '24AAPCA1234F1ZV',
      state: 'Gujarat',
    };

  return (
    <>
      <header className="sticky top-0 z-30 h-14 bg-white dark:bg-[#0E131F] border-b border-slate-200 dark:border-slate-800/80 px-3 sm:px-6 transition-colors">
        <div className="h-full max-w-[1700px] mx-auto flex items-center justify-between gap-3">
          {/* LEFT: BRAND / COMPANY / FY SELECTORS */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* MOBILE DRAWER TRIGGER */}
            <button
              onClick={onToggleMobileMenu}
              aria-label={isMobileMenuOpen ? 'Close Navigation' : 'Open Navigation'}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* COMPANY SELECTOR DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowCompanyDropdown(!showCompanyDropdown);
                  setShowFYDropdown(false);
                  setShowUserMenu(false);
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer text-left max-w-[14rem] sm:max-w-[20rem]"
              >
                <div className="w-6 h-6 rounded-lg bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Building className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 truncate">
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {currentCompany.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate hidden sm:block">
                    {currentCompany.gstin} · {currentCompany.state}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
              </button>

              {showCompanyDropdown && (
                <div
                  className="absolute left-0 mt-2 w-72 bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-1.5 z-50 animate-fadeIn"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Entity / Firm
                  </div>
                  {companiesList.map((comp) => (
                    <button
                      key={comp.id}
                      onClick={() => {
                        onSelectCompany(comp.id);
                        setShowCompanyDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                        comp.id === selectedCompanyId
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-semibold truncate">{comp.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{comp.gstin}</div>
                      </div>
                      {comp.id === selectedCompanyId && (
                        <Check className="w-4 h-4 text-blue-600 shrink-0 ml-2" />
                      )}
                    </button>
                  ))}
                  <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setShowCompanyDropdown(false);
                        onOpenOnboarding();
                      }}
                      className="w-full text-center text-xs font-semibold text-blue-600 dark:text-blue-400 p-2 hover:underline cursor-pointer"
                    >
                      + Configure New Business Profile
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* FINANCIAL YEAR SELECTOR */}
            <div className="relative hidden md:block">
              <button
                onClick={() => {
                  setShowFYDropdown(!showFYDropdown);
                  setShowCompanyDropdown(false);
                  setShowUserMenu(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-xs font-mono font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedFY}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showFYDropdown && (
                <div
                  className="absolute left-0 mt-2 w-36 bg-white dark:bg-[#121824] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl p-1 z-50 animate-fadeIn"
                  onClick={(e) => e.stopPropagation()}
                >
                  {['FY 2026–27', 'FY 2025–26', 'FY 2024–25'].map((fy) => (
                    <button
                      key={fy}
                      onClick={() => {
                        onChangeFY(fy);
                        setShowFYDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                        fy === selectedFY
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {fy}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* GSTIN BADGE */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 text-[11px] font-mono text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>GSTIN {currentCompany.gstin}</span>
            </div>
          </div>

          {/* CENTER: GLOBAL SEARCH */}
          <div className="flex-1 max-w-md mx-2 hidden sm:block">
            <button
              onClick={onOpenCommandPalette}
              className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-900 transition-all cursor-pointer text-xs"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400" />
                <span className="text-slate-400">Search invoices, customers, vouchers...</span>
              </div>
              <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 shadow-2xs">
                ⌘ K
              </kbd>
            </button>
          </div>

          {/* RIGHT: CONTROLS & USER MENU */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* MOBILE SEARCH TRIGGER */}
            <button
              onClick={onOpenCommandPalette}
              aria-label="Open Search"
              className="sm:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* PHONE SIMULATOR TOGGLE */}
            <button
              onClick={() => setIsMobileSimulator(!isMobileSimulator)}
              title="Toggle Phone Simulator chassis"
              className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                isMobileSimulator
                  ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Smartphone className="w-4 h-4" />
            </button>

            {/* THEME TOGGLE */}
            <button
              onClick={onToggleDarkMode}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* NOTIFICATIONS */}
            <button
              onClick={onOpenNotifications}
              title="View Operational Alerts"
              className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-[#0E131F]" />
              )}
            </button>

            {/* HELP */}
            <button
              onClick={() => setShowHelpModal(true)}
              title="Help & Shortcuts"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer hidden sm:block"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* USER PROFILE MENU */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowCompanyDropdown(false);
                  setShowFYDropdown(false);
                }}
                className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  RP
                </div>
                <div className="hidden lg:block text-left pr-1">
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                    Ramesh Patel
                  </div>
                  <div className="text-[10px] text-slate-400 leading-none">CA &amp; Auditor</div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showUserMenu && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-1.5 z-50 animate-fadeIn"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Ramesh Patel, FCA
                    </div>
                    <div className="text-[10px] text-slate-400">Partner • TaxFlow ERP Member</div>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenOnboarding();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                    >
                      <Building className="w-3.5 h-3.5 text-blue-600" />
                      Firm Settings
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowHelpModal(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                      Documentation &amp; Keys
                    </button>
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        window.location.reload();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Reset App State
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* HELP & SHORTCUTS MODAL */}
      {showHelpModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
          onClick={() => setShowHelpModal(false)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  TaxFlow ERP Pro Guidelines &amp; Shortcuts
                </h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="font-bold text-slate-900 dark:text-slate-100">Keyboard Accelerators</div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border">⌘ K</kbd> Command Palette</div>
                  <div><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border">F2</kbd> New Sales Bill</div>
                  <div><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border">F4</kbd> AI Purchase OCR</div>
                  <div><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border">F7</kbd> Bank Reconcile</div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="font-bold text-slate-900 dark:text-slate-100">Statutory Compliance Rules</div>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <li><strong>Gujarat State Code 24:</strong> Intra-state supply splits into CGST + SGST equally. Any non-24 supply generates single IGST line.</li>
                  <li><strong>E-Way Bill Threshold:</strong> Mandatory E-Way bill generation triggered automatically on invoices exceeding ₹50,000 threshold.</li>
                  <li><strong>TallyPrime Integration:</strong> Communicates via HTTP XML protocol on <code>http://localhost:9000</code>.</li>
                  <li><strong>MSME 45-Day Rule:</strong> Flags creditor invoices pending past section 43B(h) statutory due date.</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold text-xs cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
