import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Receipt,
  ShoppingCart,
  UserPlus,
  PackagePlus,
  FileCheck,
  Database,
  Landmark,
  FileSpreadsheet,
  X,
  ArrowRight,
  Clock,
  Command,
} from 'lucide-react';
import type { Party, SalesInvoice, PurchaseInvoice, StockItem } from '../types/tax';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  parties: Party[];
  salesInvoices: SalesInvoice[];
  purchaseInvoices: PurchaseInvoice[];
  stockItems: StockItem[];
  onNavigate: (tabId: string) => void;
  onOpenCreateInvoice: () => void;
  onOpenCreatePurchase: () => void;
  onOpenAddParty: () => void;
  onOpenAddStock: () => void;
  onSelectParty: (party: Party) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  parties,
  salesInvoices,
  purchaseInvoices,
  stockItems,
  onNavigate,
  onOpenCreateInvoice,
  onOpenCreatePurchase,
  onOpenAddParty,
  onOpenAddStock,
  onSelectParty,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Actions / Commands
  const quickActions = [
    {
      id: 'act-invoice',
      title: 'Create Tax Invoice',
      subtitle: 'New GST Outward Sales Bill [F2]',
      category: 'Actions',
      icon: Receipt,
      action: () => {
        onClose();
        onOpenCreateInvoice();
      },
    },
    {
      id: 'act-purchase',
      title: 'Scan Purchase Bill with AI OCR',
      subtitle: 'Inward invoice photo / PDF scanner [F4]',
      category: 'Actions',
      icon: ShoppingCart,
      action: () => {
        onClose();
        onOpenCreatePurchase();
      },
    },
    {
      id: 'act-party',
      title: 'Add New Party / Customer / Vendor',
      subtitle: 'Create ledger account with GSTIN validation',
      category: 'Actions',
      icon: UserPlus,
      action: () => {
        onClose();
        onOpenAddParty();
      },
    },
    {
      id: 'act-product',
      title: 'Add Stock Item SKU',
      subtitle: 'Register item with HSN code & selling price',
      category: 'Actions',
      icon: PackagePlus,
      action: () => {
        onClose();
        onOpenAddStock();
      },
    },
    {
      id: 'act-gst',
      title: 'Open GST Command Center',
      subtitle: 'GSTR-1, GSTR-3B, ITC & issue audit',
      category: 'Pages',
      icon: FileCheck,
      action: () => {
        onClose();
        onNavigate('GST_COMMAND_CENTER');
      },
    },
    {
      id: 'act-tally',
      title: 'Open TallyPrime Integration Hub',
      subtitle: 'Sync vouchers, daybook & masters on port 9000',
      category: 'Pages',
      icon: Database,
      action: () => {
        onClose();
        onNavigate('TALLY_CA_HUB');
      },
    },
    {
      id: 'act-recon',
      title: 'Run Bank Reconciliation',
      subtitle: 'Auto-match statement lines against ledgers [F7]',
      category: 'Actions',
      icon: Landmark,
      action: () => {
        onClose();
        onNavigate('BANK_RECON');
      },
    },
    {
      id: 'act-report',
      title: 'Generate Financial Reports',
      subtitle: 'Profit & Loss, Balance Sheet, Daybook export',
      category: 'Pages',
      icon: FileSpreadsheet,
      action: () => {
        onClose();
        onNavigate('REPORTS_CENTER');
      },
    },
  ];

  // Search Results
  const normalizedQuery = query.toLowerCase().trim();

  const filteredParties = normalizedQuery
    ? parties.filter(
        (p) =>
          p.name.toLowerCase().includes(normalizedQuery) ||
          p.gstin.toLowerCase().includes(normalizedQuery) ||
          p.city.toLowerCase().includes(normalizedQuery)
      )
    : [];

  const filteredInvoices = normalizedQuery
    ? salesInvoices.filter(
        (i) =>
          i.invoiceNumber.toLowerCase().includes(normalizedQuery) ||
          i.partyName.toLowerCase().includes(normalizedQuery)
      )
    : [];

  const filteredPurchases = normalizedQuery
    ? purchaseInvoices.filter(
        (p) =>
          p.invoiceNumber.toLowerCase().includes(normalizedQuery) ||
          p.supplierName.toLowerCase().includes(normalizedQuery)
      )
    : [];

  const filteredStock = normalizedQuery
    ? stockItems.filter(
        (s) =>
          s.name.toLowerCase().includes(normalizedQuery) ||
          s.hsn.toLowerCase().includes(normalizedQuery) ||
          s.category.toLowerCase().includes(normalizedQuery)
      )
    : [];

  const filteredActions = normalizedQuery
    ? quickActions.filter(
        (a) =>
          a.title.toLowerCase().includes(normalizedQuery) ||
          a.subtitle.toLowerCase().includes(normalizedQuery)
      )
    : quickActions;

  // Flattened searchable list for keyboard navigation
  const allItems: Array<{
    id: string;
    type: 'action' | 'party' | 'invoice' | 'purchase' | 'stock';
    title: string;
    subtitle: string;
    badge?: string;
    action: () => void;
  }> = [
    ...filteredActions.map((a) => ({
      id: a.id,
      type: 'action' as const,
      title: a.title,
      subtitle: a.subtitle,
      badge: a.category,
      action: a.action,
    })),
    ...filteredParties.slice(0, 4).map((p) => ({
      id: `party-${p.id}`,
      type: 'party' as const,
      title: p.name,
      subtitle: `GSTIN: ${p.gstin || 'Unregistered'} · ${p.city}, ${p.state} · Balance: ₹${Math.abs(p.currentBalance).toLocaleString('en-IN')}`,
      badge: p.type,
      action: () => {
        onClose();
        onSelectParty(p);
      },
    })),
    ...filteredInvoices.slice(0, 3).map((inv) => ({
      id: `inv-${inv.id}`,
      type: 'invoice' as const,
      title: `Sales Invoice ${inv.invoiceNumber}`,
      subtitle: `${inv.partyName} · ₹${Math.round(inv.grandTotal).toLocaleString('en-IN')} · ${inv.date}`,
      badge: 'Sales',
      action: () => {
        onClose();
        onNavigate('SALES_BILLING');
      },
    })),
    ...filteredPurchases.slice(0, 3).map((pur) => ({
      id: `pur-${pur.id}`,
      type: 'purchase' as const,
      title: `Purchase Bill ${pur.invoiceNumber}`,
      subtitle: `${pur.supplierName} · ₹${Math.round(pur.grandTotal).toLocaleString('en-IN')} · ${pur.date}`,
      badge: 'Purchase',
      action: () => {
        onClose();
        onNavigate('PURCHASES_WORKSPACE');
      },
    })),
    ...filteredStock.slice(0, 3).map((st) => ({
      id: `st-${st.id}`,
      type: 'stock' as const,
      title: st.name,
      subtitle: `HSN: ${st.hsn} · Stock: ${st.currentStock} ${st.unit} · Sell: ₹${st.sellingPrice}`,
      badge: 'Stock',
      action: () => {
        onClose();
        onNavigate('STOCK_REGISTER');
      },
    })),
  ];

  // Key handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, allItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + allItems.length) % Math.max(1, allItems.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (allItems[selectedIndex]) {
          allItems[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, allItems, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-3 bg-slate-950/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* INPUT HEADER */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search invoices, parties, items..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none"
          />
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px]">ESC</kbd>
            <span className="hidden sm:inline">to close</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* RESULTS LIST */}
        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1">
          {allItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No matching records or actions found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            allItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 border-l-4 border-blue-600'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold truncate text-slate-900 dark:text-slate-100">
                        {item.title}
                      </span>
                      {item.badge && (
                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                          · {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-mono">
                      {item.subtitle}
                    </p>
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected ? 'text-blue-600 translate-x-1' : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                </button>
              );
            })
          )}
        </div>

        {/* FOOTER */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[9px] mr-1">↑↓</kbd>
              Navigate
            </span>
            <span>
              <kbd className="px-1 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[9px] mr-1">↵</kbd>
              Select
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-mono">
            <Command className="w-3 h-3 text-slate-400" />
            <span>TaxFlow Command Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};
