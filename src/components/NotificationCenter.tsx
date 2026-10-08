import React from 'react';
import {
  Bell,
  AlertCircle,
  Clock,
  Package,
  Landmark,
  FileText,
  CheckCircle2,
  X,
  ArrowRight,
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  type: 'WARNING' | 'INFO' | 'ACTION' | 'SUCCESS';
  title: string;
  message: string;
  time: string;
  targetTab?: string;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  unpostedOcrCount: number;
  unreconciledBankCount: number;
  lowStockCount: number;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  onNavigate,
  unpostedOcrCount,
  unreconciledBankCount,
  lowStockCount,
}) => {
  if (!isOpen) return null;

  const notifications: NotificationItem[] = [
    {
      id: 'notif-gst',
      type: 'WARNING',
      title: 'GSTR-3B Filing Window Active',
      message: 'Monthly return for July due by 20th. Estimated net payable: ₹1,42,850.',
      time: 'Today',
      targetTab: 'GST_COMMAND_CENTER',
    },
    ...(unpostedOcrCount > 0
      ? [
          {
            id: 'notif-ocr',
            type: 'ACTION' as const,
            title: `${unpostedOcrCount} Scanned Purchase Bills Awaiting Verification`,
            message: 'Inward bills extracted via Gemini Vision ready for 1-click posting to stock & ledger.',
            time: '1h ago',
            targetTab: 'PURCHASES_WORKSPACE',
          },
        ]
      : []),
    ...(unreconciledBankCount > 0
      ? [
          {
            id: 'notif-bank',
            type: 'ACTION' as const,
            title: `${unreconciledBankCount} Bank Transactions Need Matching`,
            message: 'HDFC Statement credits require auto-pairing with customer party ledgers.',
            time: '3h ago',
            targetTab: 'BANK_RECON',
          },
        ]
      : []),
    ...(lowStockCount > 0
      ? [
          {
            id: 'notif-stock',
            type: 'WARNING' as const,
            title: `${lowStockCount} Inventory SKUs Below Minimum Reorder Level`,
            message: 'Fast moving computer peripherals & audio stock require purchase orders.',
            time: '5h ago',
            targetTab: 'STOCK_REGISTER',
          },
        ]
      : []),
    {
      id: 'notif-tally',
      type: 'SUCCESS',
      title: 'TallyPrime XML Gateway Live',
      message: 'Local server listening on http://localhost:9000 with 100% master parity.',
      time: 'Yesterday',
      targetTab: 'TALLY_CA_HUB',
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Notifications Panel"
      className="fixed inset-0 z-50 bg-transparent"
      onClick={onClose}
    >
      <div
        className="absolute top-16 right-4 sm:right-8 w-full max-w-sm bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Operational Alerts
            </h3>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
              {notifications.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[22rem] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-1">
          {notifications.map((item) => {
            const isAction = item.type === 'ACTION';
            const isWarn = item.type === 'WARNING';
            const isSuccess = item.type === 'SUCCESS';

            return (
              <div
                key={item.id}
                className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors rounded-xl"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {item.title}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {item.time}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {item.message}
                </p>
                {item.targetTab && (
                  <button
                    onClick={() => {
                      onClose();
                      onNavigate(item.targetTab!);
                    }}
                    className="mt-2 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Take Action
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 text-center">
          <button
            onClick={onClose}
            className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          >
            Dismiss All Notifications
          </button>
        </div>
      </div>
    </div>
  );
};
