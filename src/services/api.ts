import type { Party, SalesInvoice, PurchaseInvoice, StockItem, BankTransaction } from '../types/tax';

const API_BASE_URL = 'http://localhost:5000/api';

export async function fetchPartiesFromApi(): Promise<Party[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/parties`);
    if (!res.ok) throw new Error('API offline');
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Backend API offline or CORS, using fallback data:', err);
    throw err;
  }
}

export async function fetchStockFromApi(): Promise<StockItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/stock`);
    if (!res.ok) throw new Error('API offline');
    return await res.json();
  } catch (err) {
    console.warn('Backend API offline, using fallback stock:', err);
    throw err;
  }
}

export async function fetchSalesInvoicesFromApi(): Promise<SalesInvoice[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/salesinvoices`);
    if (!res.ok) throw new Error('API offline');
    return await res.json();
  } catch (err) {
    console.warn('Backend API offline, using fallback sales:', err);
    throw err;
  }
}

export async function fetchPurchaseInvoicesFromApi(): Promise<PurchaseInvoice[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/purchaseinvoices`);
    if (!res.ok) throw new Error('API offline');
    return await res.json();
  } catch (err) {
    console.warn('Backend API offline, using fallback purchases:', err);
    throw err;
  }
}

export async function createSalesInvoiceApi(invoice: SalesInvoice): Promise<SalesInvoice> {
  try {
    const res = await fetch(`${API_BASE_URL}/salesinvoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoice),
    });
    if (!res.ok) throw new Error('Failed to create sales invoice on backend');
    return await res.json();
  } catch (err) {
    console.warn('Backend write failed, saving locally in React state:', err);
    return invoice;
  }
}

export async function postPurchaseToLedgerApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/purchaseinvoices/${id}/post`, {
      method: 'POST',
    });
    return res.ok;
  } catch (err) {
    console.warn('Backend post purchase failed:', err);
    return false;
  }
}
