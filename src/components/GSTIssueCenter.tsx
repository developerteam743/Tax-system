import React, { useState } from 'react';
import type { GSTIssue } from '../types/tax';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  X,
  Filter,
  ArrowLeft,
  Check,
  Eye,
  Wrench,
  Ban,
  Search,
} from 'lucide-react';

interface GSTIssueCenterProps {
  issues: GSTIssue[];
  onBack: () => void;
  onUpdateIssueStatus: (id: string, newStatus: 'OPEN' | 'RESOLVED' | 'IGNORED') => void;
  onFixIssue?: (issue: GSTIssue) => void;
}

export const GSTIssueCenter: React.FC<GSTIssueCenterProps> = ({
  issues,
  onBack,
  onUpdateIssueStatus,
  onFixIssue,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'Critical' | 'Warning' | 'Information'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIssueModal, setSelectedIssueModal] = useState<GSTIssue | null>(null);

  const filteredIssues = issues.filter((iss) => {
    if (selectedCategory !== 'ALL' && iss.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        iss.title.toLowerCase().includes(q) ||
        iss.invoiceNumber.toLowerCase().includes(q) ||
        iss.counterparty.toLowerCase().includes(q) ||
        iss.reason.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const criticalCount = issues.filter((i) => i.category === 'Critical' && i.status === 'OPEN').length;
  const warningCount = issues.filter((i) => i.category === 'Warning' && i.status === 'OPEN').length;
  const infoCount = issues.filter((i) => i.category === 'Information' && i.status === 'OPEN').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. HEADER */}
      <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span>GST Compliance Engine</span>
              <span>·</span>
              <span className="text-amber-600 dark:text-amber-400 font-semibold">Audit Exceptions</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
              Intelligent GST Issue &amp; Discrepancy Center
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Audit reconciliations against GST portal rules, Section 16(2) and CGST Rule 36(4)
            </p>
          </div>
        </div>

        {/* SEARCH BOX */}
        <div className="w-full md:w-64">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search issue, party, invoice..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100 placeholder-slate-400"
            />
          </div>
        </div>
      </div>

      {/* 2. CATEGORY SEGMENTED TABS */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            selectedCategory === 'ALL'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
              : 'bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          All Issues ({issues.length})
        </button>

        <button
          onClick={() => setSelectedCategory('Critical')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedCategory === 'Critical'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white dark:bg-[#121824] border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 hover:bg-rose-50/50'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          Critical ({criticalCount})
        </button>

        <button
          onClick={() => setSelectedCategory('Warning')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedCategory === 'Warning'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white dark:bg-[#121824] border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-400 hover:bg-amber-50/50'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Warning ({warningCount})
        </button>

        <button
          onClick={() => setSelectedCategory('Information')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedCategory === 'Information'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-[#121824] border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-400 hover:bg-blue-50/50'
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          Information ({infoCount})
        </button>
      </div>

      {/* 3. ISSUES LIST */}
      <div className="space-y-3">
        {filteredIssues.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            No GST compliance issues found matching criteria.
          </div>
        ) : (
          filteredIssues.map((issue) => {
            const isResolved = issue.status === 'RESOLVED';
            const isIgnored = issue.status === 'IGNORED';

            return (
              <div
                key={issue.id}
                className={`bg-white dark:bg-[#121824] rounded-2xl border transition-all p-4 sm:p-5 shadow-sm space-y-3 ${
                  isResolved
                    ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20'
                    : isIgnored
                    ? 'border-slate-200 dark:border-slate-800 opacity-60'
                    : issue.category === 'Critical'
                    ? 'border-rose-200 dark:border-rose-900/60 hover:border-rose-400'
                    : issue.category === 'Warning'
                    ? 'border-amber-200 dark:border-amber-900/60 hover:border-amber-400'
                    : 'border-slate-200 dark:border-slate-800 hover:border-blue-400'
                }`}
              >
                {/* ISSUE TOP LINE */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase ${
                        issue.category === 'Critical'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : issue.category === 'Warning'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {issue.category}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                      {issue.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-slate-400">{issue.date}</span>
                    <span>·</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      ₹{issue.amount.toLocaleString('en-IN')}
                    </span>
                    {isResolved && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Resolved
                      </span>
                    )}
                    {isIgnored && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        Ignored
                      </span>
                    )}
                  </div>
                </div>

                {/* DETAILS GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Document</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">
                      {issue.invoiceNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Counterparty</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {issue.counterparty}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">GSTIN</span>
                    <span className="font-mono text-slate-600 dark:text-slate-300">
                      {issue.gstin || 'Not Provided'}
                    </span>
                  </div>
                </div>

                {/* REASON & SUGGESTED ACTION */}
                <div className="space-y-1.5 text-xs">
                  <div className="text-slate-700 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-slate-100">Root Cause: </strong>
                    {issue.reason}
                  </div>
                  <div className="text-blue-700 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/30 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/40">
                    <strong>Suggested Action: </strong>
                    {issue.suggestedAction}
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    onClick={() => setSelectedIssueModal(issue)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Review Details
                  </button>

                  <button
                    onClick={() => {
                      if (onFixIssue) {
                        onFixIssue(issue);
                      } else {
                        onUpdateIssueStatus(issue.id, 'RESOLVED');
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    Fix Issue
                  </button>

                  {issue.status === 'OPEN' && (
                    <button
                      onClick={() => onUpdateIssueStatus(issue.id, 'IGNORED')}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-500 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      Ignore
                    </button>
                  )}

                  {issue.status !== 'RESOLVED' ? (
                    <button
                      onClick={() => onUpdateIssueStatus(issue.id, 'RESOLVED')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Mark Resolved
                    </button>
                  ) : (
                    <button
                      onClick={() => onUpdateIssueStatus(issue.id, 'OPEN')}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Reopen
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedIssueModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
          onClick={() => setSelectedIssueModal(null)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {selectedIssueModal.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedIssueModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1 font-mono">
                <div>Document: <strong>{selectedIssueModal.invoiceNumber}</strong></div>
                <div>Party: <strong>{selectedIssueModal.counterparty}</strong></div>
                <div>GSTIN: <strong>{selectedIssueModal.gstin || 'None'}</strong></div>
                <div>Taxable Amount: <strong>₹{selectedIssueModal.amount.toLocaleString('en-IN')}</strong></div>
                <div>Date: <strong>{selectedIssueModal.date}</strong></div>
              </div>

              <div>
                <strong className="text-slate-900 dark:text-slate-100">Statutory Defect:</strong>
                <p className="mt-1 leading-relaxed">{selectedIssueModal.reason}</p>
              </div>

              <div>
                <strong className="text-slate-900 dark:text-slate-100">Correction Guideline:</strong>
                <p className="mt-1 text-blue-600 dark:text-blue-400 leading-relaxed">
                  {selectedIssueModal.suggestedAction}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedIssueModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onUpdateIssueStatus(selectedIssueModal.id, 'RESOLVED');
                  setSelectedIssueModal(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold cursor-pointer"
              >
                Confirm &amp; Resolve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
