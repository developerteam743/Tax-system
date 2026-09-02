export type PartyType = 'CUSTOMER' | 'VENDOR' | 'BOTH';

export interface Party {
  id: string;
  name: string;
  gstin: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string; // e.g. "Gujarat", "Maharashtra"
  stateCode: string; // e.g. "24", "27"
  type: PartyType;
  openingBalance: number; // positive = Receivable, negative = Payable
  currentBalance: number;
}

export interface InvoiceItem {
  id: string;
  itemId?: string;
  description: string;
  hsn: string;
  qty: number;
  unit: string;
  rate: number;
  gstRate: number; // e.g. 18 (for 18%)
  taxableValue: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
  stockItemId?: string;
}

export interface SalesInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  partyId: string;
  partyName: string;
  partyGstin: string;
  partyStateCode: string;
  placeOfSupply: string;
  items: InvoiceItem[];
  subtotal: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  discountTotal: number;
  grandTotal: number;
  status: 'PAID' | 'PARTIAL' | 'UNPAID';
  amountPaid: number;
  ewayBillRequired: boolean;
  ewayBillNumber?: string;
  ewayBillDate?: string;
  transporterId?: string;
  transporterName?: string;
  vehicleNumber?: string;
  distanceKm?: number;
}

export interface PurchaseInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  supplierName: string;
  supplierGstin: string;
  supplierStateCode: string;
  imageUrl?: string;
  ocrConfidence: number; // e.g. 96 (%)
  ocrStatus: 'SCANNED' | 'POSTED' | 'NEEDS_VERIFICATION';
  items: InvoiceItem[];
  taxableValue: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  grandTotal: number;
  postedToLedger: boolean;
  stockUpdated: boolean;
  notes?: string;
}

export interface BankTransaction {
  id: string;
  date: string;
  description: string; // e.g. "UPI/4281903/SHARMA TRADERS"
  referenceNo: string;
  type: 'CREDIT' | 'DEBIT'; // Credit = money came in (Receivable), Debit = money went out (Payable)
  amount: number;
  matchedPartyId?: string;
  matchedPartyName?: string;
  matchConfidence?: number; // % match
  status: 'PENDING' | 'RECONCILED' | 'IGNORED';
  postedLedgerId?: string;
}

export interface StockItem {
  id: string;
  name: string;
  hsn: string;
  category: string;
  unit: string;
  currentStock: number;
  minStockLevel: number;
  purchasePrice: number;
  sellingPrice: number;
  gstRate: number;
  lastUpdated: string;
}

export interface LedgerEntry {
  id: string;
  date: string;
  partyId: string;
  partyName: string;
  voucherType: 'Sales' | 'Purchase' | 'Receipt' | 'Payment' | 'Journal';
  voucherNo: string;
  debit: number; // Money owed by party to us
  credit: number; // Money owed by us to party
  balance: number; // Running balance
  narration: string;
}

export interface HostServerStatus {
  isServerActive: boolean;
  hostDeviceName: string;
  hostIp: string;
  activeUsersCount: number;
  lastSyncedAt: string;
  syncMode: 'LOCAL_MOBILE_HOST' | 'CLOUD_BACKUP';
  syncToken: string;
}

export type ViewMode = 'OPERATIONS' | 'MARKETING_PARTNER' | 'CONSULTANT';
